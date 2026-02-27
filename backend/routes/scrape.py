import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

from backend.routes.auth import get_current_user_id
from agent.reddit.fetcher import RedditFetcher

logger = logging.getLogger("twitter_agent")

router = APIRouter(tags=["scrape"])

# Track scrape status per user
_scrape_status: dict = {}


async def _run_scrape(user_id: int, reddit_client_id: str, reddit_client_secret: str, topics: list):
    """Background task: fetch top Reddit posts for a user's topics."""
    from backend.app import db

    _scrape_status[user_id] = {"running": True, "message": "Connecting to Reddit...", "scraped": 0}

    total_scraped = 0
    topics_processed = 0

    try:
        fetcher = RedditFetcher(
            client_id=reddit_client_id,
            client_secret=reddit_client_secret,
        )

        for topic_data in topics:
            if isinstance(topic_data, dict):
                topic_name = topic_data["name"]
                subreddits = topic_data.get("subreddits", [])
            else:
                topic_name = str(topic_data)
                subreddits = []

            if not subreddits:
                logger.warning(f"No subreddits configured for topic: {topic_name}")
                continue

            _scrape_status[user_id]["message"] = f"Scraping topic: {topic_name}..."

            for sub in subreddits:
                posts = fetcher.fetch_top_posts(
                    subreddit_name=sub,
                    topic=topic_name,
                    limit=5,
                    time_filter="day",
                    comments_per_post=3,
                )
                if posts:
                    count = await db.save_scraped_posts(posts)
                    total_scraped += count
                    _scrape_status[user_id]["scraped"] = total_scraped

            topics_processed += 1

        _scrape_status[user_id] = {
            "running": False,
            "message": f"Done! Scraped {total_scraped} posts across {topics_processed} topics.",
            "scraped": total_scraped,
        }

    except Exception as e:
        logger.error(f"Scrape failed for user {user_id}: {e}")
        _scrape_status[user_id] = {
            "running": False,
            "message": f"Scrape failed: {str(e)}",
            "scraped": total_scraped,
        }


@router.post("/scrape")
async def trigger_scrape(
    background_tasks: BackgroundTasks,
    user_id: int = Depends(get_current_user_id),
):
    from backend.app import db

    # Check if already running
    status = _scrape_status.get(user_id, {})
    if status.get("running"):
        return {"status": "already_running", "message": status.get("message", "Scraping...")}

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.reddit_client_id or not user.reddit_client_secret:
        raise HTTPException(
            status_code=400,
            detail="Reddit API credentials not set. Go to Settings to add them.",
        )

    topics = user.topics
    if not topics:
        raise HTTPException(status_code=400, detail="No topics configured. Add topics first.")

    # Check that at least one topic has subreddits
    has_subreddits = any(
        isinstance(t, dict) and t.get("subreddits")
        for t in topics
    )
    if not has_subreddits:
        raise HTTPException(status_code=400, detail="No subreddits configured. Edit your topics to add subreddits.")

    background_tasks.add_task(
        _run_scrape,
        user_id=user.id,
        reddit_client_id=user.reddit_client_id,
        reddit_client_secret=user.reddit_client_secret,
        topics=topics,
    )

    _scrape_status[user_id] = {"running": True, "message": "Starting...", "scraped": 0}

    return {
        "status": "started",
        "message": f"Scraping started for {len(topics)} topics.",
    }


@router.get("/scrape/status")
async def get_scrape_status(user_id: int = Depends(get_current_user_id)):
    status = _scrape_status.get(user_id, {"running": False, "message": "No scrape run yet.", "scraped": 0})
    return status
