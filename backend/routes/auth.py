import json

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional

from agent.storage.models import User
from backend.auth_utils import hash_password, verify_password, create_jwt, decode_jwt

router = APIRouter(tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    telegram_chat_id: int = 0


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: int
    email: str


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ", 1)[1]
    user_id = decode_jwt(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id


@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    from backend.app import db

    existing = await db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        telegram_chat_id=req.telegram_chat_id,
    )
    user_id = await db.add_user(user)
    token = create_jwt(user_id)

    return AuthResponse(token=token, user_id=user_id, email=req.email)


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    from backend.app import db

    user = await db.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_jwt(user.id)
    return AuthResponse(token=token, user_id=user.id, email=user.email)


@router.get("/me")
async def get_me(user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "telegram_chat_id": user.telegram_chat_id,
        "topics": user.topics,
        "active": user.active,
        "created_at": str(user.created_at) if user.created_at else None,
    }
