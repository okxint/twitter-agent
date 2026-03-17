import os
import logging

from fastapi import APIRouter, Depends, HTTPException

from agent.ai.generator import ContentGenerator
from agent.reddit.fetcher import RedditFetcher
from backend.routes.auth import get_current_user_id

logger = logging.getLogger("twitter_agent")

router = APIRouter(tags=["generate"])


@router.post("/generate")
async def trigger_generation(
    humanize: bool = True,
    thread_mode: bool = False,
    user_id: int = Depends(get_current_user_id),
):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topics = user.topics
    if not topics:
        raise HTTPException(status_code=400, detail="No topics configured. Add topics first.")

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server")

    generator = ContentGenerator(
        api_key=api_key,
        model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
        tweets_per_topic=int(os.environ.get("TWEETS_PER_TOPIC", "3")),
    )

    total_generated = 0
    last_error = None

    for topic_data in topics:
        if isinstance(topic_data, dict):
            topic_name = topic_data["name"]
            tone = topic_data.get("tone", "informative")
            hashtags = topic_data.get("hashtags", [])
            subreddits = topic_data.get("subreddits", [])
        else:
            topic_name = topic_data
            tone = "informative"
            hashtags = []
            subreddits = []

        top_posts = await db.get_top_posts(topic_name, limit=20)
        logger.info(f"Found {len(top_posts)} scraped posts for topic: {topic_name}")

        # Auto-scrape if no posts in DB
        if not top_posts and subreddits:
            logger.info(f"No posts in DB for '{topic_name}', auto-scraping...")
            try:
                fetcher = RedditFetcher()
                for sub in subreddits:
                    posts = await fetcher.fetch_top_posts(
                        subreddit_name=sub,
                        topic=topic_name,
                        limit=5,
                        time_filter="day",
                        comments_per_post=3,
                    )
                    if posts:
                        await db.save_scraped_posts(posts)
                top_posts = await db.get_top_posts(topic_name, limit=20)
                logger.info(f"Auto-scraped {len(top_posts)} posts for '{topic_name}'")
            except Exception as e:
                logger.error(f"Auto-scrape failed for '{topic_name}': {e}")

        if not top_posts:
            logger.warning(f"No scraped posts for topic: {topic_name} — skipping generation")
            continue

        try:
            if thread_mode:
                generated = generator.generate_thread(
                    topic=topic_name,
                    top_posts=top_posts,
                    tone=tone,
                    hashtags=hashtags,
                    humanize=humanize,
                )
            else:
                generated = generator.generate_tweets(
                    topic=topic_name,
                    top_posts=top_posts,
                    tone=tone,
                    hashtags=hashtags,
                    count=generator.tweets_per_topic,
                    humanize=humanize,
                )

            for tweet in generated:
                tweet.user_id = user.id
                await db.save_generated_tweet(tweet)
                total_generated += 1
        except Exception as e:
            last_error = str(e)
            logger.error(f"Generation failed for '{topic_name}': {e}")

    mode_label = "thread tweets" if thread_mode else "tweets"

    if total_generated == 0:
        err_detail = f"Last error: {last_error or getattr(generator, '_last_error', 'unknown')}"
        raise HTTPException(
            status_code=422,
            detail=f"Tweet generation failed. {err_detail}",
        )

    return {
        "generated": total_generated,
        "message": f"Generated {total_generated} {mode_label} across {len(topics)} topics",
    }
