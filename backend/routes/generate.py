import os
import logging

from fastapi import APIRouter, Depends, HTTPException

from agent.ai.generator import ContentGenerator
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

    for topic_data in topics:
        if isinstance(topic_data, dict):
            topic_name = topic_data["name"]
            tone = topic_data.get("tone", "informative")
            hashtags = topic_data.get("hashtags", [])
        else:
            topic_name = topic_data
            tone = "informative"
            hashtags = []

        top_posts = await db.get_top_posts(topic_name, limit=20)
        logger.info(f"Found {len(top_posts)} scraped posts for topic: {topic_name}")
        if not top_posts:
            logger.warning(f"No scraped posts for topic: {topic_name} — skipping generation")
            continue

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

    mode_label = "thread tweets" if thread_mode else "tweets"

    if total_generated == 0:
        raise HTTPException(
            status_code=422,
            detail=f"No tweets generated. Found {len(top_posts) if 'top_posts' in dir() else 0} scraped posts. Check that your Gemini API key is valid. Last error: {getattr(generator, '_last_error', 'unknown')}",
        )

    return {
        "generated": total_generated,
        "message": f"Generated {total_generated} {mode_label} across {len(topics)} topics",
    }
