import json
import logging
import uuid
from typing import List

import anthropic

from agent.utils.config import ClaudeConfig
from agent.storage.models import ScrapedPost, GeneratedTweet

logger = logging.getLogger("twitter_agent")

SYSTEM_PROMPT = """You are an expert social media strategist who creates viral Twitter/X content.

Your job is to turn trending Reddit discussions into tweets that get massive engagement.

VIRALITY FRAMEWORK — every tweet must use at least one:
- **Contrarian take**: Challenge a widely-held belief ("Hot take: X is actually bad because...")
- **Insider knowledge**: Share something most people don't know ("Most people don't realize...")
- **Pattern interrupt**: Start with something unexpected that stops the scroll
- **Specific numbers**: Use concrete data/stats from the discussions ("87% of startups fail because...")
- **Story hook**: Mini-narrative that creates curiosity ("I spent 6 hours reading about X. Here's what nobody is talking about:")
- **Relatable frustration**: Name a pain point your audience feels ("The worst part about X is...")

TWEET STRUCTURE RULES:
- First 5-10 words are EVERYTHING — they decide if someone reads the rest
- No generic intros ("In today's world...", "It's interesting that...")
- No hashtag spam — max 1-2 hashtags, only if natural
- Under 280 chars, but shorter is better (200-250 sweet spot for engagement)
- Write like a real person, not a brand or AI
- End with an opinion, question, or bold statement — never trail off

Rules:
- NEVER copy or closely paraphrase any Reddit post or comment
- Create 100% original content that captures the key insights
- Use the specified tone
- Vary structures across the batch — don't repeat the same hook pattern"""


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

Here are the hottest Reddit discussions right now for this topic (sorted by virality potential):

{posts_context}

TASK:
1. Identify the most interesting, surprising, or controversial insights from these discussions
2. Look at what people are arguing about in the comments — that's where the real gold is
3. Generate {count} tweets that would make someone stop scrolling and engage

Each tweet should feel like it came from someone who deeply understands this space — not a generic content account.

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
        # Sort by engagement/virality score — best content first
        sorted_posts = sorted(posts, key=lambda p: p.engagement_score, reverse=True)

        lines = []
        for i, post in enumerate(sorted_posts[:15], 1):
            entry = (
                f"#{i} [r/{post.subreddit}] "
                f"(🔥 virality: {post.engagement_score:.0f} | "
                f"{post.score} upvotes, {post.num_comments} comments, "
                f"{post.upvote_ratio:.0%} upvote ratio)\n"
                f"Title: {post.title}\n"
            )
            if post.content:
                entry += f"Body: {post.content[:500]}\n"
            if post.top_comments:
                entry += "Top comments (these reveal what people REALLY think):\n"
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
