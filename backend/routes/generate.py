import os
import logging

from fastapi import APIRouter, Depends, HTTPException

from agent.ai.generator import ContentGenerator
from backend.routes.auth import get_current_user_id

logger = logging.getLogger("twitter_agent")

router = APIRouter(tags=["generate"])


@router.post("/generate")
async def trigger_generation(user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topics = user.topics
    if not topics:
        raise HTTPException(status_code=400, detail="No topics configured. Add topics first.")

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set on server")

    from agent.utils.config import ClaudeConfig
    claude_config = ClaudeConfig(
        api_key=api_key,
        model=os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-5-20250929"),
        tweets_to_generate=int(os.environ.get("TWEETS_PER_TOPIC", "3")),
    )
    generator = ContentGenerator(claude_config)

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
        if not top_posts:
            logger.warning(f"No scraped posts for topic: {topic_name}")
            continue

        generated = generator.generate_tweets(
            topic=topic_name,
            top_posts=top_posts,
            tone=tone,
            hashtags=hashtags,
            count=claude_config.tweets_to_generate,
        )

        for tweet in generated:
            tweet.user_id = user.id
            await db.save_generated_tweet(tweet)
            total_generated += 1

    return {
        "generated": total_generated,
        "message": f"Generated {total_generated} tweets across {len(topics)} topics",
    }
