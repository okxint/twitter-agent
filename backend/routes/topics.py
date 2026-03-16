import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from backend.routes.auth import get_current_user_id
from agent.reddit.discover import discover_subreddits, get_all_topics, TOPIC_CATEGORIES

router = APIRouter(tags=["topics"])


class AddTopicRequest(BaseModel):
    name: str
    subreddits: List[str] = []  # optional — auto-discovered if empty
    tone: str = "informative"
    hashtags: List[str] = []


@router.get("/topics")
async def list_topics(user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"topics": user.topics}


@router.post("/topics")
async def add_topic(req: AddTopicRequest, user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topics = user.topics
    for t in topics:
        existing_name = t["name"] if isinstance(t, dict) else t
        if existing_name.lower() == req.name.lower():
            raise HTTPException(status_code=400, detail="Topic already exists")

    # Auto-discover subreddits, then merge with any user-specified ones
    auto_subs = discover_subreddits(req.name)
    # Combine: user's custom subs + auto-discovered, deduplicated
    seen = set()
    subreddits = []
    for s in req.subreddits + auto_subs:
        if s.lower() not in seen:
            seen.add(s.lower())
            subreddits.append(s)

    if not subreddits:
        raise HTTPException(
            status_code=400,
            detail=f"Couldn't find relevant subreddits for '{req.name}'. Try a more specific topic or add subreddits manually.",
        )

    topic_data = {
        "name": req.name,
        "subreddits": subreddits,
        "tone": req.tone,
        "hashtags": req.hashtags,
    }
    topics.append(topic_data)
    await db.update_user_topics_by_id(user_id, json.dumps(topics))

    return {"topics": topics}


@router.get("/topics/suggest-subreddits")
async def suggest_subreddits(
    topic: str,
    user_id: int = Depends(get_current_user_id),
):
    """Preview which subreddits would be auto-discovered for a topic."""
    subs = discover_subreddits(topic)
    return {"topic": topic, "subreddits": subs}


@router.get("/topics/categories")
async def list_categories():
    """Return all available topic categories (Reddit-style interest picker)."""
    return {"categories": get_all_topics()}


@router.delete("/topics/{topic_name}")
async def remove_topic(topic_name: str, user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topics = user.topics
    new_topics = []
    found = False
    for t in topics:
        name = t["name"] if isinstance(t, dict) else t
        if name == topic_name:
            found = True
        else:
            new_topics.append(t)

    if not found:
        raise HTTPException(status_code=404, detail="Topic not found")

    await db.update_user_topics_by_id(user_id, json.dumps(new_topics))
    return {"topics": new_topics}
