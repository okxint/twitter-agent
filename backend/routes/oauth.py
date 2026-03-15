import os
import logging
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.auth_utils import hash_password, create_jwt
from agent.storage.models import User

logger = logging.getLogger("twitter_agent")

router = APIRouter(tags=["oauth"])

# GitHub OAuth config
GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")

# Google OAuth config
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


class OAuthCodeRequest(BaseModel):
    code: str
    redirect_uri: str


@router.get("/oauth/github/url")
async def github_auth_url(redirect_uri: str):
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "user:email",
    }
    return {"url": f"https://github.com/login/oauth/authorize?{urlencode(params)}"}


@router.post("/oauth/github/callback")
async def github_callback(req: OAuthCodeRequest):
    from backend.app import db

    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": req.code,
                "redirect_uri": req.redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to get GitHub access token")

    # Get user email from GitHub
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
        )
        emails = user_res.json()

    # Find primary verified email
    email = None
    for e in emails:
        if e.get("primary") and e.get("verified"):
            email = e["email"]
            break
    if not email and emails:
        email = emails[0].get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from GitHub")

    return await _oauth_login_or_register(db, email)


@router.get("/oauth/google/url")
async def google_auth_url(redirect_uri: str):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"}


@router.post("/oauth/google/callback")
async def google_callback(req: OAuthCodeRequest):
    from backend.app import db

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": req.code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": req.redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_res.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to get Google access token")

    # Get user info
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_data = user_res.json()

    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")

    return await _oauth_login_or_register(db, email)


async def _oauth_login_or_register(db, email: str):
    """Login existing user or create new one from OAuth email."""
    user = await db.get_user_by_email(email)
    if user:
        token = create_jwt(user.id)
        return {"token": token, "user_id": user.id, "email": user.email}

    # Create new user with random password (they'll use OAuth to login)
    import secrets
    user = User(
        email=email,
        password_hash=hash_password(secrets.token_urlsafe(32)),
    )
    user_id = await db.add_user(user)
    token = create_jwt(user_id)
    return {"token": token, "user_id": user_id, "email": email}
