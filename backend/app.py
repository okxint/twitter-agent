import os
import sys
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path so we can import agent modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from agent.storage.database import Database
from backend.routes import auth, topics, tweets, dashboard, generate, scrape, settings

logger = logging.getLogger("twitter_agent")

db = Database(os.environ.get("DB_PATH", "./data/agent.db"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init()
    logger.info("Database initialized")
    yield
    await db.close()
    logger.info("Database closed")


app = FastAPI(title="Twitter Agent API", version="1.0.0", lifespan=lifespan)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Allow Vercel frontend in production
vercel_url = os.environ.get("FRONTEND_URL")
if vercel_url:
    allowed_origins.append(vercel_url)

# Also allow any *.vercel.app subdomain for preview deploys
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(topics.router, prefix="/api")
app.include_router(tweets.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(scrape.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
