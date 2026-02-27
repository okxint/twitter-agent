import json
import logging
from typing import Optional

from agent.utils.config import AgentConfig
from agent.storage.database import Database
from agent.storage.models import User
from agent.reddit.fetcher import RedditFetcher
from agent.ai.generator import ContentGenerator
from agent.poster.publisher import TweetPublisher
from agent.telegram.bot import TelegramBot

logger = logging.getLogger("twitter_agent")


class Orchestrator:
    """Coordinates the full pipeline: scrape Reddit -> generate -> approve -> post."""

    def __init__(self, config: AgentConfig, db: Database, telegram_bot: TelegramBot):
        self.config = config
        self.db = db
        self.telegram_bot = telegram_bot
        self.generator = ContentGenerator(config.claude)

        # Wire up approval handler's post callback
        self.telegram_bot.approval_handler.set_post_callback(self._post_approved_tweet)
        self.telegram_bot.set_orchestrator(self)

    async def run_discovery(self):
        """Run Reddit content discovery for all active users."""
        users = await self.db.get_active_users()
        if not users:
            logger.info("No active users, skipping discovery")
            return

        total_scraped = 0
        topics_processed = 0

        for user in users:
            try:
                if not user.reddit_client_id or not user.reddit_client_secret:
                    logger.warning(f"User {user.id} has no Reddit credentials, skipping")
                    continue

                user_topics = user.topics
                if not user_topics:
                    continue

                fetcher = RedditFetcher(
                    client_id=user.reddit_client_id,
                    client_secret=user.reddit_client_secret,
                )

                posts = fetcher.fetch_for_topics(
                    topics=user_topics,
                    posts_per_subreddit=self.config.reddit.posts_per_subreddit,
                    time_filter=self.config.reddit.time_filter,
                    comments_per_post=self.config.reddit.comments_per_post,
                )

                if posts:
                    count = await self.db.save_scraped_posts(posts)
                    total_scraped += count

                topics_processed += len(user_topics)

            except Exception as e:
                logger.error(f"Discovery failed for user {user.id}: {e}")

        await self.db.log_run(
            "discovery", "success",
            topics_processed=topics_processed,
            tweets_scraped=total_scraped,
        )
        logger.info(f"Discovery complete: {topics_processed} topics, {total_scraped} posts")

    async def run_generation(self):
        """Generate tweets for all active users and send for approval."""
        users = await self.db.get_active_users()
        if not users:
            return

        for user in users:
            try:
                await self.run_pipeline_for_user(user)
            except Exception as e:
                logger.error(f"Generation failed for user {user.id}: {e}")

    async def run_pipeline_for_user(self, user: User):
        """Run generation + approval pipeline for a single user."""
        user_topics = user.topics
        if not user_topics:
            return

        for topic_data in user_topics:
            if isinstance(topic_data, dict):
                topic_name = topic_data["name"]
                tone = topic_data.get("tone", "informative")
                hashtags = topic_data.get("hashtags", [])
            else:
                topic_name = topic_data
                tone = "informative"
                hashtags = []

            top_posts = await self.db.get_top_posts(topic_name, limit=20)
            if not top_posts:
                logger.warning(f"No scraped posts for topic: {topic_name}")
                continue

            generated = self.generator.generate_tweets(
                topic=topic_name,
                top_posts=top_posts,
                tone=tone,
                hashtags=hashtags,
                count=self.config.claude.tweets_to_generate,
            )

            for tweet in generated:
                tweet.user_id = user.id
                tweet.telegram_chat_id = user.telegram_chat_id
                tweet_id = await self.db.save_generated_tweet(tweet)

                await self.telegram_bot.send_tweet_for_approval(
                    chat_id=user.telegram_chat_id,
                    tweet_id=tweet_id,
                    content=tweet.content,
                    topic=topic_name,
                )

            logger.info(f"Generated {len(generated)} tweets for '{topic_name}' -> user {user.id}")

    async def _post_approved_tweet(self, tweet_id: int) -> bool:
        """Post an approved tweet to Twitter. Called by approval handler."""
        tweet = await self.db.get_generated_tweet_by_id(tweet_id)
        if not tweet:
            return False

        user = await self.db.get_user_by_chat_id(tweet.telegram_chat_id)
        if not user or not user.twitter_api_key:
            return False

        publisher = TweetPublisher(
            api_key=user.twitter_api_key,
            api_secret=user.twitter_api_secret,
            access_token=user.twitter_access_token,
            access_token_secret=user.twitter_access_token_secret,
        )

        result = await publisher.post_tweet(tweet.content)
        if result["success"]:
            await self.db.update_tweet_status(tweet_id, "posted", posted_tweet_id=result["tweet_id"])
            await self.db.log_run("posting", "success", tweets_posted=1)
            return True
        else:
            await self.db.log_run("posting", "failure", error_message=result["error"])
            return False

    async def startup(self):
        """Initialize and sync config topics."""
        if self.config.topics and self.config.telegram.admin_chat_id:
            admin = await self.db.get_user_by_chat_id(self.config.telegram.admin_chat_id)
            if admin:
                config_topics = [
                    {
                        "name": t.name,
                        "subreddits": t.subreddits,
                        "tone": t.tone,
                        "hashtags": t.hashtags,
                    }
                    for t in self.config.topics
                ]
                existing = admin.topics
                existing_names = {
                    t["name"] if isinstance(t, dict) else t for t in existing
                }
                for ct in config_topics:
                    if ct["name"] not in existing_names:
                        existing.append(ct)
                if len(existing) > len(admin.topics):
                    await self.db.update_user_topics(
                        admin.telegram_chat_id, json.dumps(existing)
                    )

        logger.info("Orchestrator initialized")

    async def shutdown(self):
        """Gracefully shut down."""
        logger.info("Orchestrator shut down")
