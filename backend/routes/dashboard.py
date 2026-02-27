from fastapi import APIRouter, Depends

from backend.routes.auth import get_current_user_id

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
async def get_dashboard(user_id: int = Depends(get_current_user_id)):
    from backend.app import db

    user = await db.get_user_by_id(user_id)
    stats = await db.get_dashboard_stats(user_id)

    return {
        "stats": stats,
        "topics_count": len(user.topics) if user else 0,
    }
