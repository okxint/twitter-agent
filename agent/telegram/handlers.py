import logging
from typing import Optional

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, Bot
from telegram.ext import ContextTypes

from agent.storage.database import Database

logger = logging.getLogger("twitter_agent")


class ApprovalHandler:
    """Handles tweet approval/rejection flow via Telegram inline keyboards."""

    def __init__(self, db: Database):
        self.db = db
        self._pending_edits = {}  # chat_id -> tweet_id awaiting edit text
        self._post_callback = None  # Set by orchestrator

    def set_post_callback(self, callback):
        """Set callback function for posting approved tweets."""
        self._post_callback = callback

    async def send_for_approval(
        self, bot: Bot, chat_id: int, tweet_id: int, content: str, topic: str
    ) -> Optional[int]:
        """Send a tweet draft to the user with approval buttons."""
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("Approve", callback_data=f"approve:{tweet_id}"),
                InlineKeyboardButton("Reject", callback_data=f"reject:{tweet_id}"),
            ],
            [
                InlineKeyboardButton("Edit", callback_data=f"edit:{tweet_id}"),
                InlineKeyboardButton("Regenerate", callback_data=f"regen:{tweet_id}"),
            ],
        ])

        message = await bot.send_message(
            chat_id=chat_id,
            text=f"*Topic: {topic}*\n\n{content}\n\n_Characters: {len(content)}/280_",
            reply_markup=keyboard,
            parse_mode="Markdown",
        )

        await self.db.update_tweet_status(
            tweet_id, "pending", telegram_message_id=message.message_id
        )
        return message.message_id

    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline keyboard button presses."""
        query = update.callback_query
        await query.answer()

        data = query.data
        action, tweet_id_str = data.split(":", 1)
        tweet_id = int(tweet_id_str)

        tweet = await self.db.get_generated_tweet_by_id(tweet_id)
        if not tweet:
            await query.edit_message_text("Tweet not found.")
            return

        if action == "approve":
            await self._handle_approve(query, tweet_id, tweet.content)
        elif action == "reject":
            await self._handle_reject(query, tweet_id)
        elif action == "edit":
            await self._handle_edit_request(query, tweet_id)
        elif action == "regen":
            await self._handle_regenerate(query, tweet_id, tweet.topic)

    async def _handle_approve(self, query, tweet_id: int, content: str):
        """Approve a tweet and trigger posting."""
        await self.db.update_tweet_status(tweet_id, "approved")
        await query.edit_message_text(
            f"APPROVED - Posting...\n\n{content}"
        )

        if self._post_callback:
            try:
                success = await self._post_callback(tweet_id)
                if success:
                    await query.edit_message_text(
                        f"POSTED\n\n{content}"
                    )
                else:
                    await query.edit_message_text(
                        f"APPROVED but posting failed. Will retry.\n\n{content}"
                    )
            except Exception as e:
                logger.error(f"Post callback failed: {e}")
                await query.edit_message_text(
                    f"APPROVED but posting error: {str(e)[:100]}\n\n{content}"
                )
        else:
            await query.edit_message_text(
                f"APPROVED (auto-posting not connected)\n\n{content}"
            )

    async def _handle_reject(self, query, tweet_id: int):
        """Reject a tweet."""
        await self.db.update_tweet_status(tweet_id, "rejected")
        await query.edit_message_text("REJECTED - Tweet discarded.")

    async def _handle_edit_request(self, query, tweet_id: int):
        """Request edit - ask user to send new text."""
        chat_id = query.message.chat_id
        self._pending_edits[chat_id] = tweet_id
        await query.edit_message_text(
            "Send your edited tweet text as a reply.\n"
            "(Just type the new tweet text in this chat)"
        )

    async def _handle_regenerate(self, query, tweet_id: int, topic: str):
        """Mark for regeneration."""
        await self.db.update_tweet_status(tweet_id, "rejected")
        await query.edit_message_text(
            f"Regenerating tweet for topic: {topic}...\n"
            "Use /generate to create new tweets."
        )

    async def handle_edit_reply(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle text message as an edit reply."""
        chat_id = update.effective_chat.id

        if chat_id not in self._pending_edits:
            return

        tweet_id = self._pending_edits.pop(chat_id)
        new_content = update.message.text.strip()

        if len(new_content) > 280:
            await update.message.reply_text(
                f"Tweet is {len(new_content)} characters (max 280). Please shorten it."
            )
            self._pending_edits[chat_id] = tweet_id
            return

        await self.db.update_tweet_status(tweet_id, "pending", content=new_content)

        # Re-send for approval with updated content
        tweet = await self.db.get_generated_tweet_by_id(tweet_id)
        if tweet:
            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("Approve", callback_data=f"approve:{tweet_id}"),
                    InlineKeyboardButton("Reject", callback_data=f"reject:{tweet_id}"),
                ],
                [
                    InlineKeyboardButton("Edit", callback_data=f"edit:{tweet_id}"),
                ],
            ])
            await update.message.reply_text(
                f"*Updated tweet:*\n\n{new_content}\n\n_Characters: {len(new_content)}/280_",
                reply_markup=keyboard,
                parse_mode="Markdown",
            )
