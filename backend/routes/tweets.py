import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel

from backend.routes.auth import get_current_user_id
from agent.poster.publisher import TweetPublisher

logger = logging.getLogger("twitter_agent")

router = APIRouter(tags=["tweets"])


class EditRequest(BaseModel):
    content: str


async def _post_tweet_to_twitter(tweet_id: int, content: str, user_id: int):
    """Background task: post an approved tweet via Twitter API v2."""
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user or not user.twitter_api_key or not user.twitter_api_secret:
        logger.error(f"Cannot post tweet {tweet_id}: missing Twitter API credentials")
        return

    try:
        publisher = TweetPublisher(
            api_key=user.twitter_api_key,
            api_secret=user.twitter_api_secret,
            access_token=user.twitter_access_token,
            access_token_secret=user.twitter_access_token_secret,
        )

        result = await publisher.post_tweet(content)
        if result["success"]:
            await db.update_tweet_status(tweet_id, "posted", posted_tweet_id=result["tweet_id"])
            logger.info(f"Tweet {tweet_id} posted successfully: {result['tweet_id']}")
        else:
            logger.error(f"Failed to post tweet {tweet_id}: {result['error']}")
    except Exception as e:
        logger.error(f"Error posting tweet {tweet_id}: {e}")


@router.get("/tweets/pending")
async def get_pending_tweets(user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    tweets = await db.get_pending_tweets(user_id=user_id)
    return {
        "tweets": [
            {
                "id": t.id,
                "topic": t.topic,
                "content": t.content,
                "status": t.status,
                "created_at": str(t.created_at) if t.created_at else None,
            }
            for t in tweets
        ]
    }


@router.get("/tweets/history")
async def get_tweet_history(
    limit: int = 50, user_id: int = Depends(get_current_user_id)
):
    from backend.app import db

    tweets = await db.get_tweet_history(user_id, limit=limit)
    return {
        "tweets": [
            {
                "id": t.id,
                "topic": t.topic,
                "content": t.content,
                "status": t.status,
                "created_at": str(t.created_at) if t.created_at else None,
                "approved_at": str(t.approved_at) if t.approved_at else None,
                "posted_at": str(t.posted_at) if t.posted_at else None,
                "posted_tweet_id": t.posted_tweet_id,
            }
            for t in tweets
        ]
    }


@router.post("/tweets/{tweet_id}/approve")
async def approve_tweet(
    tweet_id: int,
    background_tasks: BackgroundTasks,
    user_id: int = Depends(get_current_user_id),
):
    from backend.app import db

    tweet = await db.get_generated_tweet_by_id(tweet_id)
    if not tweet:
        raise HTTPException(status_code=404, detail="Tweet not found")
    if tweet.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your tweet")
    if tweet.status not in ("pending", "edited"):
        raise HTTPException(status_code=400, detail=f"Tweet is already {tweet.status}")

    await db.update_tweet_status(tweet_id, "approved")

    # Auto-post to Twitter in background
    user = await db.get_user_by_id(user_id)
    if user and user.twitter_api_key and user.twitter_access_token:
        background_tasks.add_task(_post_tweet_to_twitter, tweet_id, tweet.content, user_id)
        return {"status": "approved", "tweet_id": tweet_id, "posting": True,
                "message": "Tweet approved and posting to Twitter..."}

    return {"status": "approved", "tweet_id": tweet_id, "posting": False,
            "message": "Tweet approved. Set Twitter API credentials in Settings to auto-post."}


@router.post("/tweets/{tweet_id}/reject")
async def reject_tweet(tweet_id: int, user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    tweet = await db.get_generated_tweet_by_id(tweet_id)
    if not tweet:
        raise HTTPException(status_code=404, detail="Tweet not found")
    if tweet.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your tweet")
    if tweet.status != "pending":
        raise HTTPException(status_code=400, detail=f"Tweet is already {tweet.status}")

    await db.update_tweet_status(tweet_id, "rejected")
    return {"status": "rejected", "tweet_id": tweet_id}


@router.post("/tweets/{tweet_id}/edit")
async def edit_tweet(
    tweet_id: int,
    req: EditRequest,
    user_id: int = Depends(get_current_user_id),
):
    from backend.app import db

    tweet = await db.get_generated_tweet_by_id(tweet_id)
    if not tweet:
        raise HTTPException(status_code=404, detail="Tweet not found")
    if tweet.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your tweet")
    if tweet.status not in ("pending", "edited"):
        raise HTTPException(status_code=400, detail=f"Cannot edit tweet with status {tweet.status}")

    await db.update_tweet_status(tweet_id, "edited", content=req.content)
    return {"status": "edited", "tweet_id": tweet_id, "content": req.content}
