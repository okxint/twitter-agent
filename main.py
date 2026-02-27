import asyncio
import argparse
import signal
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent.utils.config import load_config
from agent.utils.logger import setup_logger
from agent.storage.database import Database
from agent.telegram.bot import TelegramBot
from agent.orchestrator import Orchestrator
from agent.scheduler import AgentScheduler


async def run_agent(config_path: str):
    """Run the full agent: Telegram bot + scheduler."""
    config = load_config(config_path)
    logger = setup_logger(config.logging.level, config.logging.file)
    logger.info("Starting Twitter Agent...")

    # Initialize database
    db = Database(config.database.path)
    await db.init()

    # Initialize Telegram bot
    telegram_bot = TelegramBot(config.telegram, db)

    # Initialize orchestrator
    orchestrator = Orchestrator(config, db, telegram_bot)
    await orchestrator.startup()

    # Initialize scheduler
    scheduler = AgentScheduler(config.schedule, orchestrator)

    # Start components
    await telegram_bot.start()
    scheduler.start()

    logger.info("Twitter Agent is running! Press Ctrl+C to stop.")

    # Keep running until interrupted
    stop_event = asyncio.Event()

    def handle_signal():
        stop_event.set()

    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, handle_signal)

    await stop_event.wait()

    # Graceful shutdown
    logger.info("Shutting down...")
    scheduler.stop()
    await telegram_bot.stop()
    await orchestrator.shutdown()
    await db.close()
    logger.info("Goodbye!")


async def test_scrape(config_path: str, subreddit: str):
    """Test Reddit scraping for a subreddit."""
    config = load_config(config_path)
    logger = setup_logger(config.logging.level, config.logging.file)

    from agent.reddit.fetcher import RedditFetcher

    fetcher = RedditFetcher(
        client_id=config.reddit.client_id,
        client_secret=config.reddit.client_secret,
    )

    posts = fetcher.fetch_top_posts(subreddit, "test_topic", limit=5, time_filter="day")
    print(f"\nFound {len(posts)} posts from r/{subreddit}:\n")
    for i, p in enumerate(posts, 1):
        print(f"#{i} [{p.score} upvotes, {p.num_comments} comments]")
        print(f"  Title: {p.title[:100]}")
        if p.content:
            print(f"  Body: {p.content[:100]}...")
        print(f"  Score: {p.engagement_score:.1f}")
        print()


async def test_generate(config_path: str):
    """Test Claude content generation with sample data."""
    config = load_config(config_path)
    logger = setup_logger(config.logging.level, config.logging.file)

    from agent.ai.generator import ContentGenerator
    from agent.storage.models import ScrapedPost

    generator = ContentGenerator(config.claude)

    # Create sample posts for testing
    sample_posts = [
        ScrapedPost(
            post_id="1", subreddit="MachineLearning", author="researcher1",
            title="New paper shows transformers can be 10x more efficient with sparse attention",
            content="Just read this amazing paper on sparse attention mechanisms...",
            score=5000, num_comments=300, upvote_ratio=0.95, topic="AI",
            top_comments=["This is huge for inference costs", "Has anyone benchmarked this?"],
        ),
        ScrapedPost(
            post_id="2", subreddit="LocalLLaMA", author="dev42",
            title="Running Llama 3 on a MacBook with 8GB RAM - here's how",
            content="After weeks of optimization, I got it running smoothly...",
            score=3000, num_comments=200, upvote_ratio=0.92, topic="AI",
            top_comments=["What quantization level?", "Performance is surprisingly good"],
        ),
    ]

    for p in sample_posts:
        p.compute_engagement_score()

    tweets = generator.generate_tweets(
        topic="AI and machine learning",
        top_posts=sample_posts,
        tone="informative, slightly opinionated",
        hashtags=["#AI", "#ML"],
        count=3,
    )

    print(f"\nGenerated {len(tweets)} tweets:\n")
    for i, t in enumerate(tweets, 1):
        print(f"#{i} [{len(t.content)} chars]")
        print(f"  {t.content}")
        print()


async def test_telegram(config_path: str):
    """Test Telegram bot messaging."""
    config = load_config(config_path)
    logger = setup_logger(config.logging.level, config.logging.file)

    from telegram import Bot
    bot = Bot(config.telegram.bot_token)

    try:
        me = await bot.get_me()
        logger.info(f"Bot connected: @{me.username}")

        if config.telegram.admin_chat_id:
            await bot.send_message(
                config.telegram.admin_chat_id,
                "Twitter Agent test message - bot is working!"
            )
            logger.info(f"Test message sent to chat {config.telegram.admin_chat_id}")
        else:
            logger.warning("No admin_chat_id configured. Set it in config.yaml")
    finally:
        await bot.shutdown()


async def validate_config(config_path: str):
    """Validate config file."""
    try:
        config = load_config(config_path)
        print("Config validation PASSED")
        print(f"  Reddit client ID: {'set' if config.reddit.client_id else '(not set)'}")
        print(f"  Twitter API key: {'set' if config.twitter_api.api_key else '(not set)'}")
        print(f"  Telegram bot token: {'set' if config.telegram.bot_token else '(not set)'}")
        print(f"  Claude API key: {'set' if config.claude.api_key else '(not set)'}")
        print(f"  Topics: {len(config.topics)}")
        print(f"  Schedule enabled: {config.schedule.enabled}")
    except Exception as e:
        print(f"Config validation FAILED: {e}")


def main():
    parser = argparse.ArgumentParser(description="Twitter Automation Agent")
    parser.add_argument("--config", default="config.yaml", help="Path to config file")

    group = parser.add_mutually_exclusive_group()
    group.add_argument("--validate-config", action="store_true", help="Validate config file")
    group.add_argument("--test-scrape", type=str, metavar="SUBREDDIT", help="Test Reddit scraping")
    group.add_argument("--test-generate", action="store_true", help="Test AI generation")
    group.add_argument("--test-telegram", action="store_true", help="Test Telegram bot")

    args = parser.parse_args()

    if args.validate_config:
        asyncio.run(validate_config(args.config))
    elif args.test_scrape:
        asyncio.run(test_scrape(args.config, args.test_scrape))
    elif args.test_generate:
        asyncio.run(test_generate(args.config))
    elif args.test_telegram:
        asyncio.run(test_telegram(args.config))
    else:
        asyncio.run(run_agent(args.config))


if __name__ == "__main__":
    main()
