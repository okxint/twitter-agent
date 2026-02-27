import json
import logging
from typing import Optional

from telegram import Update, BotCommand
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

from agent.utils.config import TelegramConfig
from agent.storage.database import Database
from agent.storage.models import User
from agent.telegram.handlers import ApprovalHandler

logger = logging.getLogger("twitter_agent")


class TelegramBot:
    def __init__(self, config: TelegramConfig, db: Database):
        self.config = config
        self.db = db
        self.app: Optional[Application] = None
        self.approval_handler = ApprovalHandler(db)
        self._orchestrator = None

    def set_orchestrator(self, orchestrator):
        """Set reference to orchestrator for triggering generation."""
        self._orchestrator = orchestrator

    async def start(self):
        """Build and start the Telegram bot."""
        self.app = (
            Application.builder()
            .token(self.config.bot_token)
            .build()
        )

        # Register commands
        self.app.add_handler(CommandHandler("start", self._cmd_start))
        self.app.add_handler(CommandHandler("setup", self._cmd_setup))
        self.app.add_handler(CommandHandler("addtopic", self._cmd_add_topic))
        self.app.add_handler(CommandHandler("removetopic", self._cmd_remove_topic))
        self.app.add_handler(CommandHandler("listtopics", self._cmd_list_topics))
        self.app.add_handler(CommandHandler("status", self._cmd_status))
        self.app.add_handler(CommandHandler("generate", self._cmd_generate))
        self.app.add_handler(CommandHandler("pending", self._cmd_pending))
        self.app.add_handler(CommandHandler("help", self._cmd_help))

        # Callback query handler for inline keyboard buttons
        self.app.add_handler(CallbackQueryHandler(self.approval_handler.handle_callback))

        # Message handler for edit replies
        self.app.add_handler(
            MessageHandler(filters.TEXT & ~filters.COMMAND, self._handle_text_message)
        )

        await self.app.bot.set_my_commands([
            BotCommand("start", "Start the bot"),
            BotCommand("setup", "Link your Telegram to the agent"),
            BotCommand("addtopic", "Add a topic - /addtopic AI Agents"),
            BotCommand("removetopic", "Remove a topic - /removetopic AI Agents"),
            BotCommand("listtopics", "List your topics"),
            BotCommand("status", "Show agent status"),
            BotCommand("generate", "Force generate tweets now"),
            BotCommand("pending", "Show pending tweets"),
            BotCommand("help", "Show help"),
        ])

        await self.app.initialize()
        await self.app.start()
        await self.app.updater.start_polling()
        logger.info("Telegram bot started")

    async def stop(self):
        if self.app:
            await self.app.updater.stop()
            await self.app.stop()
            await self.app.shutdown()

    async def send_tweet_for_approval(self, chat_id: int, tweet_id: int, content: str, topic: str):
        """Send a generated tweet to user for approval."""
        return await self.approval_handler.send_for_approval(
            self.app.bot, chat_id, tweet_id, content, topic
        )

    # --- Command Handlers ---

    async def _cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "Welcome to Twitter Agent!\n\n"
            "I'll help you create and post engaging tweets.\n\n"
            "To get started, register at the web dashboard and add your API keys.\n\n"
            "Then add topics:\n"
            "/addtopic AI and machine learning\n\n"
            "Use /help to see all commands."
        )

    async def _cmd_setup(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id

        # Check if user already exists
        existing = await self.db.get_user_by_chat_id(chat_id)
        if existing:
            await update.message.reply_text(
                "You're already set up!\n"
                "Use the web dashboard to manage your API keys.\n\n"
                "Add topics with /addtopic <topic name>"
            )
            return

        # Create a new user linked to this Telegram chat
        user = User(telegram_chat_id=chat_id)
        await self.db.add_user(user)

        await update.message.reply_text(
            "Account created and linked to this chat!\n\n"
            "Next steps:\n"
            "1. Add your Reddit & Twitter API keys in the web dashboard Settings\n"
            "2. Add topics with /addtopic <topic name>\n"
            "3. Use /generate to create tweets"
        )

    async def _cmd_add_topic(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not context.args:
            await update.message.reply_text("Usage: /addtopic <topic name>\nExample: /addtopic AI Agents")
            return

        chat_id = update.effective_chat.id
        user = await self.db.get_user_by_chat_id(chat_id)
        if not user:
            await update.message.reply_text("Please run /setup first.")
            return

        topic_name = " ".join(context.args)
        topics = user.topics
        if topic_name in [t["name"] if isinstance(t, dict) else t for t in topics]:
            await update.message.reply_text(f"Topic '{topic_name}' already exists.")
            return

        topics.append({
            "name": topic_name,
            "subreddits": [],
            "tone": "informative",
            "hashtags": [],
        })
        await self.db.update_user_topics(chat_id, json.dumps(topics))
        await update.message.reply_text(f"Added topic: {topic_name}")

    async def _cmd_remove_topic(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not context.args:
            await update.message.reply_text("Usage: /removetopic <topic name>")
            return

        chat_id = update.effective_chat.id
        user = await self.db.get_user_by_chat_id(chat_id)
        if not user:
            await update.message.reply_text("Please run /setup first.")
            return

        topic_name = " ".join(context.args)
        topics = user.topics
        original_len = len(topics)
        topics = [
            t for t in topics
            if (t["name"] if isinstance(t, dict) else t) != topic_name
        ]

        if len(topics) == original_len:
            await update.message.reply_text(f"Topic '{topic_name}' not found.")
            return

        await self.db.update_user_topics(chat_id, json.dumps(topics))
        await update.message.reply_text(f"Removed topic: {topic_name}")

    async def _cmd_list_topics(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id
        user = await self.db.get_user_by_chat_id(chat_id)
        if not user:
            await update.message.reply_text("Please run /setup first.")
            return

        topics = user.topics
        if not topics:
            await update.message.reply_text("No topics configured. Add one with /addtopic")
            return

        lines = ["Your topics:\n"]
        for i, t in enumerate(topics, 1):
            name = t["name"] if isinstance(t, dict) else t
            lines.append(f"{i}. {name}")
        await update.message.reply_text("\n".join(lines))

    async def _cmd_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id
        user = await self.db.get_user_by_chat_id(chat_id)
        if not user:
            await update.message.reply_text("Please run /setup first.")
            return

        pending = await self.db.get_pending_tweets(user.id)
        topics = user.topics

        reddit_set = "Connected" if user.reddit_client_id else "Not set"
        twitter_set = "Connected" if user.twitter_api_key else "Not set"

        await update.message.reply_text(
            f"Reddit API: {reddit_set}\n"
            f"Twitter API: {twitter_set}\n"
            f"Topics: {len(topics)}\n"
            f"Pending tweets: {len(pending)}\n"
            f"Status: {'Active' if user.active else 'Inactive'}"
        )

    async def _cmd_generate(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id
        user = await self.db.get_user_by_chat_id(chat_id)
        if not user:
            await update.message.reply_text("Please run /setup first.")
            return

        if not self._orchestrator:
            await update.message.reply_text("Agent not initialized yet. Please wait.")
            return

        await update.message.reply_text("Generating tweets... This may take a few minutes.")

        try:
            await self._orchestrator.run_pipeline_for_user(user)
            await context.bot.send_message(chat_id, "Tweet generation complete! Check your pending tweets.")
        except Exception as e:
            logger.error(f"Generation failed for user {chat_id}: {e}")
            await context.bot.send_message(chat_id, f"Generation failed: {str(e)[:200]}")

    async def _cmd_pending(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id
        user = await self.db.get_user_by_chat_id(chat_id)
        if not user:
            await update.message.reply_text("Please run /setup first.")
            return

        pending = await self.db.get_pending_tweets(user.id)
        if not pending:
            await update.message.reply_text("No pending tweets.")
            return

        for tweet in pending:
            await self.send_tweet_for_approval(chat_id, tweet.id, tweet.content, tweet.topic)

    async def _cmd_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "Twitter Agent Commands:\n\n"
            "/setup - Link your Telegram to the agent\n"
            "/addtopic <name> - Add a topic\n"
            "/removetopic <name> - Remove a topic\n"
            "/listtopics - List your topics\n"
            "/generate - Generate tweets now\n"
            "/pending - Show pending tweets\n"
            "/status - Show your status\n"
            "/help - Show this help"
        )

    async def _handle_text_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle text messages (for edit flow)."""
        await self.approval_handler.handle_edit_reply(update, context)
