import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from backend.routes.auth import get_current_user_id

router = APIRouter(tags=["topics"])


class AddTopicRequest(BaseModel):
    name: str
    subreddits: List[str] = []
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
        if existing_name == req.name:
            raise HTTPException(status_code=400, detail="Topic already exists")

    topic_data = {
        "name": req.name,
        "subreddits": req.subreddits,
        "tone": req.tone,
        "hashtags": req.hashtags,
    }
    topics.append(topic_data)
    await db.update_user_topics_by_id(user_id, json.dumps(topics))

    return {"topics": topics}


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
