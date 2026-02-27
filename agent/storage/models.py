from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
import json


@dataclass
class ScrapedPost:
    post_id: str
    subreddit: str
    author: str
    title: str
    content: str
    score: int = 0
    num_comments: int = 0
    upvote_ratio: float = 0.0
    post_url: str = ""
    top_comments: List[str] = field(default_factory=list)
    engagement_score: float = 0.0
    topic: str = ""
    scraped_at: Optional[datetime] = None
    id: Optional[int] = None

    @property
    def top_comments_json(self) -> str:
        return json.dumps(self.top_comments)

    @staticmethod
    def parse_top_comments(raw: str) -> List[str]:
        if not raw:
            return []
        return json.loads(raw)

    def compute_engagement_score(self) -> float:
        self.engagement_score = (
            self.score * 1.0
            + self.num_comments * 2.0
            + self.upvote_ratio * 100.0
        )
        return self.engagement_score


@dataclass
class GeneratedTweet:
    topic: str
    content: str
    user_id: int = 0
    inspiration_post_ids: List[int] = field(default_factory=list)
    status: str = "pending"  # pending | approved | rejected | posted | edited
    telegram_message_id: Optional[int] = None
    telegram_chat_id: Optional[int] = None
    created_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    posted_tweet_id: Optional[str] = None
    id: Optional[int] = None

    @property
    def inspiration_ids_json(self) -> str:
        return json.dumps(self.inspiration_post_ids)

    @staticmethod
    def parse_inspiration_ids(raw: str) -> List[int]:
        if not raw:
            return []
        return json.loads(raw)


@dataclass
class User:
    email: str = ""
    password_hash: str = ""
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    twitter_api_key: str = ""
    twitter_api_secret: str = ""
    twitter_access_token: str = ""
    twitter_access_token_secret: str = ""
    telegram_chat_id: int = 0
    topics_json: str = "[]"
    active: bool = True
    created_at: Optional[datetime] = None
    id: Optional[int] = None

    @property
    def topics(self) -> list:
        return json.loads(self.topics_json) if self.topics_json else []

    @topics.setter
    def topics(self, value: list):
        self.topics_json = json.dumps(value)
