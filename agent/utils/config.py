from pydantic import BaseModel, Field
from typing import List, Optional
import yaml
from pathlib import Path


class RedditConfig(BaseModel):
    client_id: str = ""
    client_secret: str = ""
    user_agent: str = "TweetAgent/1.0"
    posts_per_subreddit: int = 5
    comments_per_post: int = 3
    time_filter: str = "day"  # hour | day | week | month | year | all


class TwitterApiConfig(BaseModel):
    api_key: str = ""
    api_secret: str = ""
    access_token: str = ""
    access_token_secret: str = ""


class TelegramConfig(BaseModel):
    bot_token: str = ""
    admin_chat_id: int = 0


class ClaudeConfig(BaseModel):
    api_key: str = ""
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 1024
    temperature: float = 0.8
    tweets_to_generate: int = 3


class TopicConfig(BaseModel):
    name: str
    subreddits: List[str] = []
    tone: str = "neutral"
    hashtags: List[str] = []


class ScheduleConfig(BaseModel):
    timezone: str = "Asia/Kolkata"
    discovery_times: List[str] = ["06:00", "18:00"]
    generation_times: List[str] = ["07:00", "19:00"]
    enabled: bool = True


class DatabaseConfig(BaseModel):
    path: str = "./data/agent.db"


class LoggingConfig(BaseModel):
    level: str = "INFO"
    file: str = "./data/agent.log"


class AgentConfig(BaseModel):
    reddit: RedditConfig = RedditConfig()
    twitter_api: TwitterApiConfig = TwitterApiConfig()
    telegram: TelegramConfig = TelegramConfig()
    claude: ClaudeConfig = ClaudeConfig()
    topics: List[TopicConfig] = []
    schedule: ScheduleConfig = ScheduleConfig()
    database: DatabaseConfig = DatabaseConfig()
    logging: LoggingConfig = LoggingConfig()


def load_config(path: str = "config.yaml") -> AgentConfig:
    config_path = Path(path)
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with open(config_path, "r") as f:
        raw = yaml.safe_load(f)
    return AgentConfig(**raw)
