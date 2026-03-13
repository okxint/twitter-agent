import json
import logging
import uuid
from typing import List

import anthropic

from agent.utils.config import ClaudeConfig
from agent.storage.models import ScrapedPost, GeneratedTweet

logger = logging.getLogger("twitter_agent")

SYSTEM_PROMPT = """You are an expert social media strategist specializing in Twitter/X content creation.

Your job is to:
1. Analyze trending Reddit discussions to understand what topics resonate with people
2. Identify interesting insights, hot takes, and valuable knowledge from these discussions
3. Generate original tweet content inspired by those discussions

Rules:
- NEVER copy or closely paraphrase any Reddit post or comment
- Create 100% original content that captures the key insights
- Each tweet must be under 280 characters
- Use the specified tone and optionally include provided hashtags
- Focus on hooks that stop the scroll
- Vary tweet structures (hot takes, tips, questions, stories, observations)
- Make content actionable and valuable
- Distill complex discussions into punchy, engaging tweets"""


class ContentGenerator:
    def __init__(self, config: ClaudeConfig):
        self.config = config
        self.client = anthropic.Anthropic(api_key=config.api_key)

    def humanize_tweet(self, tweet_text: str, tone: str = "neutral") -> str:
        """Re-pass a tweet through Claude to make it sound more natural."""
        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=400,
                temperature=0.8,
                system=(
                    "Rewrite this tweet to sound like a real person wrote it. "
                    "Remove any AI-sounding phrases, corporate speak, or filler. "
                    f"Keep the core message and match this tone: {tone}. "
                    "Keep under 280 chars. Return ONLY the rewritten tweet, nothing else."
                ),
                messages=[{"role": "user", "content": tweet_text}],
            )
            result = response.content[0].text.strip().strip('"')
            if len(result) > 280:
                result = result[:277] + "..."
            return result
        except anthropic.APIError as e:
            logger.warning(f"Humanize failed, using original: {e}")
            return tweet_text

    def generate_tweets(
        self,
        topic: str,
        top_posts: List[ScrapedPost],
        tone: str = "neutral",
        hashtags: List[str] = None,
        count: int = 3,
        humanize: bool = True,
    ) -> List[GeneratedTweet]:
        """Analyze top Reddit posts and generate original tweet content."""
        if not top_posts:
            logger.warning(f"No posts to analyze for topic: {topic}")
            return []

        posts_context = self._format_posts_for_analysis(top_posts)
        hashtag_str = ", ".join(hashtags) if hashtags else "none"

        user_prompt = f"""Topic: {topic}
Tone: {tone}
Hashtags to optionally include: {hashtag_str}
Number of tweets to generate: {count}

Here are trending Reddit discussions for this topic (sorted by engagement):

{posts_context}

Analyze what makes these discussions interesting, then generate {count} original tweets that capture the key insights.

Return ONLY a JSON array of strings, each string being one tweet. Example:
["tweet 1 text here", "tweet 2 text here", "tweet 3 text here"]"""

        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )

            response_text = response.content[0].text
            tweet_texts = self._parse_response(response_text)

            inspiration_ids = [p.id for p in top_posts[:10] if p.id]

            generated = []
            for text in tweet_texts[:count]:
                if len(text) > 280:
                    text = text[:277] + "..."
                if humanize:
                    text = self.humanize_tweet(text, tone)
                generated.append(
                    GeneratedTweet(
                        topic=topic,
                        content=text,
                        inspiration_post_ids=inspiration_ids,
                    )
                )

            logger.info(f"Generated {len(generated)} tweets for topic: {topic}")
            return generated

        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            return []

    def generate_thread(
        self,
        topic: str,
        top_posts: List[ScrapedPost],
        tone: str = "neutral",
        hashtags: List[str] = None,
        thread_length: int = 4,
        humanize: bool = True,
    ) -> List[GeneratedTweet]:
        """Generate a multi-tweet thread from Reddit discussions."""
        if not top_posts:
            logger.warning(f"No posts to analyze for topic: {topic}")
            return []

        posts_context = self._format_posts_for_analysis(top_posts)
        hashtag_str = ", ".join(hashtags) if hashtags else "none"

        user_prompt = f"""Topic: {topic}
Tone: {tone}
Hashtags to optionally include: {hashtag_str}
Thread length: {thread_length} tweets

Here are trending Reddit discussions for this topic:

{posts_context}

Create a Twitter thread of {thread_length} tweets about the most interesting insight from these discussions.
- First tweet is the hook (grab attention)
- Middle tweets develop the argument with specifics
- Last tweet is the takeaway or CTA
- Each tweet MUST be under 280 characters
- Number them like "1/" "2/" etc at the start

Return ONLY a JSON array of strings in thread order. Example:
["1/ Hook tweet here", "2/ Development here", "3/ More detail", "4/ Takeaway"]"""

        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )

            response_text = response.content[0].text
            tweet_texts = self._parse_response(response_text)

            inspiration_ids = [p.id for p in top_posts[:10] if p.id]
            thread_id = str(uuid.uuid4())[:8]

            generated = []
            for i, text in enumerate(tweet_texts[:thread_length]):
                if len(text) > 280:
                    text = text[:277] + "..."
                if humanize:
                    text = self.humanize_tweet(text, tone)
                generated.append(
                    GeneratedTweet(
                        topic=topic,
                        content=text,
                        inspiration_post_ids=inspiration_ids,
                        thread_id=thread_id,
                        thread_position=i + 1,
                    )
                )

            logger.info(f"Generated thread ({len(generated)} tweets) for topic: {topic}")
            return generated

        except anthropic.APIError as e:
            logger.error(f"Claude API error generating thread: {e}")
            return []

    def _format_posts_for_analysis(self, posts: List[ScrapedPost]) -> str:
        lines = []
        for i, post in enumerate(posts[:20], 1):
            entry = (
                f"#{i} [r/{post.subreddit}] "
                f"({post.score} upvotes, {post.num_comments} comments)\n"
                f"Title: {post.title}\n"
            )
            if post.content:
                entry += f"Body: {post.content[:500]}\n"
            if post.top_comments:
                entry += "Top comments:\n"
                for j, comment in enumerate(post.top_comments[:3], 1):
                    entry += f"  - {comment[:200]}\n"
            lines.append(entry)
        return "\n".join(lines)

    def _parse_response(self, text: str) -> List[str]:
        """Parse Claude's response into a list of tweet strings."""
        text = text.strip()

        # Try direct JSON parse
        try:
            result = json.loads(text)
            if isinstance(result, list):
                return [str(t) for t in result]
        except json.JSONDecodeError:
            pass

        # Try to find JSON array in the response
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1:
            try:
                result = json.loads(text[start : end + 1])
                if isinstance(result, list):
                    return [str(t) for t in result]
            except json.JSONDecodeError:
                pass

        # Fallback: split by newlines and filter
        lines = [
            line.strip().strip('"').strip("'")
            for line in text.split("\n")
            if line.strip() and not line.strip().startswith("#")
        ]
        return [l for l in lines if len(l) > 20]
