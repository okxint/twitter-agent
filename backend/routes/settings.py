from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from backend.routes.auth import get_current_user_id

router = APIRouter(tags=["settings"])


class UpdateSettingsRequest(BaseModel):
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    twitter_api_key: Optional[str] = None
    twitter_api_secret: Optional[str] = None
    twitter_access_token: Optional[str] = None
    twitter_access_token_secret: Optional[str] = None
    telegram_chat_id: Optional[int] = None


@router.get("/settings")
async def get_settings(user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "reddit_client_id": user.reddit_client_id,
        "reddit_client_secret_set": bool(user.reddit_client_secret),
        "twitter_api_key": user.twitter_api_key,
        "twitter_api_secret_set": bool(user.twitter_api_secret),
        "twitter_access_token": user.twitter_access_token,
        "twitter_access_token_secret_set": bool(user.twitter_access_token_secret),
        "telegram_chat_id": user.telegram_chat_id,
    }


@router.put("/settings")
async def update_settings(
    req: UpdateSettingsRequest,
    user_id: int = Depends(get_current_user_id),
):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = {}
    if req.reddit_client_id is not None:
        updates["reddit_client_id"] = req.reddit_client_id
    if req.reddit_client_secret is not None:
        updates["reddit_client_secret"] = req.reddit_client_secret
    if req.twitter_api_key is not None:
        updates["twitter_api_key"] = req.twitter_api_key
    if req.twitter_api_secret is not None:
        updates["twitter_api_secret"] = req.twitter_api_secret
    if req.twitter_access_token is not None:
        updates["twitter_access_token"] = req.twitter_access_token
    if req.twitter_access_token_secret is not None:
        updates["twitter_access_token_secret"] = req.twitter_access_token_secret
    if req.telegram_chat_id is not None:
        updates["telegram_chat_id"] = req.telegram_chat_id

    if updates:
        await db.update_user_credentials(user_id, **updates)

    return {"status": "updated", "fields": list(updates.keys())}
