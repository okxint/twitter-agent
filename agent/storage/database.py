import aiosqlite
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from agent.storage.models import ScrapedPost, GeneratedTweet, User

logger = logging.getLogger("twitter_agent")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    reddit_client_id TEXT NOT NULL DEFAULT '',
    reddit_client_secret TEXT NOT NULL DEFAULT '',
    twitter_api_key TEXT NOT NULL DEFAULT '',
    twitter_api_secret TEXT NOT NULL DEFAULT '',
    twitter_access_token TEXT NOT NULL DEFAULT '',
    twitter_access_token_secret TEXT NOT NULL DEFAULT '',
    telegram_chat_id INTEGER DEFAULT 0,
    topics_json TEXT NOT NULL DEFAULT '[]',
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scraped_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT UNIQUE NOT NULL,
    subreddit TEXT NOT NULL,
    author TEXT DEFAULT '',
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    score INTEGER DEFAULT 0,
    num_comments INTEGER DEFAULT 0,
    upvote_ratio REAL DEFAULT 0.0,
    post_url TEXT DEFAULT '',
    top_comments TEXT DEFAULT '[]',
    engagement_score REAL DEFAULT 0.0,
    topic TEXT NOT NULL,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 0,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    inspiration_post_ids TEXT DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    telegram_message_id INTEGER,
    telegram_chat_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    posted_at TIMESTAMP,
    posted_tweet_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS run_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT NOT NULL,
    status TEXT NOT NULL,
    topics_processed INTEGER DEFAULT 0,
    tweets_scraped INTEGER DEFAULT 0,
    tweets_generated INTEGER DEFAULT 0,
    tweets_posted INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scraped_topic ON scraped_posts(topic);
CREATE INDEX IF NOT EXISTS idx_scraped_engagement ON scraped_posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_generated_status ON generated_tweets(status);
CREATE INDEX IF NOT EXISTS idx_generated_user ON generated_tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
"""


class Database:
    def __init__(self, db_path: str = "./data/agent.db"):
        self.db_path = db_path
        self._db: Optional[aiosqlite.Connection] = None

    async def init(self):
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._db = await aiosqlite.connect(self.db_path)
        self._db.row_factory = aiosqlite.Row
        await self._db.executescript(SCHEMA)
        await self._db.commit()
        logger.info(f"Database initialized at {self.db_path}")

    async def close(self):
        if self._db:
            await self._db.close()

    # --- Users ---

    async def add_user(self, user: User) -> int:
        cursor = await self._db.execute(
            """INSERT OR REPLACE INTO users
               (email, password_hash, reddit_client_id, reddit_client_secret,
                twitter_api_key, twitter_api_secret, twitter_access_token,
                twitter_access_token_secret, telegram_chat_id, topics_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user.email, user.password_hash, user.reddit_client_id,
             user.reddit_client_secret, user.twitter_api_key,
             user.twitter_api_secret, user.twitter_access_token,
             user.twitter_access_token_secret,
             user.telegram_chat_id, user.topics_json),
        )
        await self._db.commit()
        return cursor.lastrowid

    async def get_user_by_email(self, email: str) -> Optional[User]:
        cursor = await self._db.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return self._row_to_user(row)

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        cursor = await self._db.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return self._row_to_user(row)

    def _row_to_user(self, row) -> User:
        return User(
            id=row["id"],
            email=row["email"],
            password_hash=row["password_hash"],
            reddit_client_id=row["reddit_client_id"],
            reddit_client_secret=row["reddit_client_secret"],
            twitter_api_key=row["twitter_api_key"],
            twitter_api_secret=row["twitter_api_secret"],
            twitter_access_token=row["twitter_access_token"],
            twitter_access_token_secret=row["twitter_access_token_secret"],
            telegram_chat_id=row["telegram_chat_id"],
            topics_json=row["topics_json"],
            active=bool(row["active"]),
            created_at=row["created_at"],
        )

    async def update_user_credentials(self, user_id: int, **kwargs):
        sets = []
        params = []
        allowed = [
            "reddit_client_id", "reddit_client_secret",
            "twitter_api_key", "twitter_api_secret",
            "twitter_access_token", "twitter_access_token_secret",
            "telegram_chat_id",
        ]
        for key in allowed:
            if key in kwargs:
                sets.append(f"{key} = ?")
                params.append(kwargs[key])
        if not sets:
            return
        params.append(user_id)
        await self._db.execute(
            f"UPDATE users SET {', '.join(sets)} WHERE id = ?", params
        )
        await self._db.commit()

    async def update_user_topics_by_id(self, user_id: int, topics_json: str):
        await self._db.execute(
            "UPDATE users SET topics_json = ? WHERE id = ?",
            (topics_json, user_id),
        )
        await self._db.commit()

    async def get_tweet_history(self, user_id: int, limit: int = 50) -> List[GeneratedTweet]:
        cursor = await self._db.execute(
            """SELECT * FROM generated_tweets
               WHERE user_id = ? AND status IN ('posted', 'approved', 'rejected')
               ORDER BY created_at DESC LIMIT ?""",
            (user_id, limit),
        )
        rows = await cursor.fetchall()
        return [self._row_to_generated_tweet(row) for row in rows]

    async def get_dashboard_stats(self, user_id: int) -> dict:
        pending = await self._db.execute(
            "SELECT COUNT(*) as c FROM generated_tweets WHERE user_id = ? AND status = 'pending'",
            (user_id,),
        )
        pending_count = (await pending.fetchone())["c"]

        posted = await self._db.execute(
            "SELECT COUNT(*) as c FROM generated_tweets WHERE user_id = ? AND status = 'posted'",
            (user_id,),
        )
        posted_count = (await posted.fetchone())["c"]

        total = await self._db.execute(
            "SELECT COUNT(*) as c FROM generated_tweets WHERE user_id = ?",
            (user_id,),
        )
        total_count = (await total.fetchone())["c"]

        return {
            "pending": pending_count,
            "posted": posted_count,
            "total_generated": total_count,
        }

    async def get_user_by_chat_id(self, chat_id: int) -> Optional[User]:
        cursor = await self._db.execute(
            "SELECT * FROM users WHERE telegram_chat_id = ?", (chat_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return self._row_to_user(row)

    async def get_active_users(self) -> List[User]:
        cursor = await self._db.execute("SELECT * FROM users WHERE active = 1")
        rows = await cursor.fetchall()
        return [self._row_to_user(row) for row in rows]

    async def update_user_topics(self, chat_id: int, topics_json: str):
        await self._db.execute(
            "UPDATE users SET topics_json = ? WHERE telegram_chat_id = ?",
            (topics_json, chat_id),
        )
        await self._db.commit()

    # --- Scraped Posts ---

    async def save_scraped_posts(self, posts: List[ScrapedPost]) -> int:
        count = 0
        for post in posts:
            try:
                await self._db.execute(
                    """INSERT OR IGNORE INTO scraped_posts
                       (post_id, subreddit, author, title, content, score,
                        num_comments, upvote_ratio, post_url, top_comments,
                        engagement_score, topic)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (post.post_id, post.subreddit, post.author, post.title,
                     post.content, post.score, post.num_comments,
                     post.upvote_ratio, post.post_url, post.top_comments_json,
                     post.engagement_score, post.topic),
                )
                count += 1
            except Exception as e:
                logger.warning(f"Failed to save post {post.post_id}: {e}")
        await self._db.commit()
        return count

    async def get_top_posts(self, topic: str, limit: int = 20) -> List[ScrapedPost]:
        cursor = await self._db.execute(
            """SELECT * FROM scraped_posts
               WHERE topic = ?
               ORDER BY engagement_score DESC
               LIMIT ?""",
            (topic, limit),
        )
        rows = await cursor.fetchall()
        return [
            ScrapedPost(
                id=row["id"],
                post_id=row["post_id"],
                subreddit=row["subreddit"],
                author=row["author"],
                title=row["title"],
                content=row["content"],
                score=row["score"],
                num_comments=row["num_comments"],
                upvote_ratio=row["upvote_ratio"],
                post_url=row["post_url"],
                top_comments=ScrapedPost.parse_top_comments(row["top_comments"]),
                engagement_score=row["engagement_score"],
                topic=row["topic"],
                scraped_at=row["scraped_at"],
            )
            for row in rows
        ]

    # --- Generated Tweets ---

    async def save_generated_tweet(self, tweet: GeneratedTweet) -> int:
        cursor = await self._db.execute(
            """INSERT INTO generated_tweets
               (user_id, topic, content, inspiration_post_ids, status,
                telegram_message_id, telegram_chat_id)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (tweet.user_id, tweet.topic, tweet.content,
             tweet.inspiration_ids_json, tweet.status,
             tweet.telegram_message_id, tweet.telegram_chat_id),
        )
        await self._db.commit()
        return cursor.lastrowid

    async def get_pending_tweets(self, user_id: Optional[int] = None) -> List[GeneratedTweet]:
        if user_id:
            cursor = await self._db.execute(
                "SELECT * FROM generated_tweets WHERE status = 'pending' AND user_id = ?",
                (user_id,),
            )
        else:
            cursor = await self._db.execute(
                "SELECT * FROM generated_tweets WHERE status = 'pending'"
            )
        rows = await cursor.fetchall()
        return [self._row_to_generated_tweet(row) for row in rows]

    async def update_tweet_status(self, tweet_id: int, status: str, **kwargs):
        sets = ["status = ?"]
        params = [status]
        if status == "approved":
            sets.append("approved_at = ?")
            params.append(datetime.utcnow().isoformat())
        if status == "posted":
            sets.append("posted_at = ?")
            params.append(datetime.utcnow().isoformat())
        if "posted_tweet_id" in kwargs:
            sets.append("posted_tweet_id = ?")
            params.append(kwargs["posted_tweet_id"])
        if "telegram_message_id" in kwargs:
            sets.append("telegram_message_id = ?")
            params.append(kwargs["telegram_message_id"])
        if "content" in kwargs:
            sets.append("content = ?")
            params.append(kwargs["content"])
        params.append(tweet_id)
        await self._db.execute(
            f"UPDATE generated_tweets SET {', '.join(sets)} WHERE id = ?", params
        )
        await self._db.commit()

    async def get_generated_tweet_by_id(self, tweet_id: int) -> Optional[GeneratedTweet]:
        cursor = await self._db.execute(
            "SELECT * FROM generated_tweets WHERE id = ?", (tweet_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return self._row_to_generated_tweet(row)

    def _row_to_generated_tweet(self, row) -> GeneratedTweet:
        return GeneratedTweet(
            id=row["id"],
            user_id=row["user_id"],
            topic=row["topic"],
            content=row["content"],
            inspiration_post_ids=GeneratedTweet.parse_inspiration_ids(
                row["inspiration_post_ids"]
            ),
            status=row["status"],
            telegram_message_id=row["telegram_message_id"],
            telegram_chat_id=row["telegram_chat_id"],
            created_at=row["created_at"],
            approved_at=row["approved_at"],
            posted_at=row["posted_at"],
            posted_tweet_id=row["posted_tweet_id"],
        )

    # --- Run Log ---

    async def log_run(self, run_type: str, status: str, **stats):
        await self._db.execute(
            """INSERT INTO run_log
               (run_type, status, topics_processed, tweets_scraped,
                tweets_generated, tweets_posted, error_message, finished_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (run_type, status,
             stats.get("topics_processed", 0),
             stats.get("tweets_scraped", 0),
             stats.get("tweets_generated", 0),
             stats.get("tweets_posted", 0),
             stats.get("error_message"),
             datetime.utcnow().isoformat()),
        )
        await self._db.commit()
