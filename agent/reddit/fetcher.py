import asyncio
import logging
import time
from typing import List

import httpx

from agent.storage.models import ScrapedPost
from agent.reddit.discover import score_post_virality

logger = logging.getLogger("twitter_agent")

REDDIT_BASE = "https://www.reddit.com"
USER_AGENT = "TweetAgent/1.0 (by /u/tweetagent)"


class RedditFetcher:
    """Fetches top posts from Reddit using public JSON endpoints (no API keys needed)."""

    def __init__(self, **kwargs):
        # Accept but ignore client_id/client_secret for backward compat
        self._last_request = 0.0

    async def _rate_limit(self):
        """Respect ~10 req/min rate limit (2 seconds between requests)."""
        elapsed = time.time() - self._last_request
        if elapsed < 2:
            await asyncio.sleep(2 - elapsed)
        self._last_request = time.time()

    async def _get_json(self, url: str, retries: int = 2) -> dict:
        """Fetch JSON from Reddit public endpoint with retry."""
        for attempt in range(retries + 1):
            await self._rate_limit()
            headers = {"User-Agent": USER_AGENT}
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(url, headers=headers, timeout=15, follow_redirects=True)
                    if resp.status_code == 429:
                        wait = min(10, 3 * (attempt + 1))
                        logger.warning(f"Reddit 429 rate limit, waiting {wait}s (attempt {attempt + 1})")
                        await asyncio.sleep(wait)
                        continue
                    resp.raise_for_status()
                    return resp.json()
            except httpx.TimeoutException:
                logger.warning(f"Timeout fetching {url} (attempt {attempt + 1})")
                if attempt < retries:
                    await asyncio.sleep(2)
                    continue
                raise
        return {}

    async def fetch_top_posts(
        self,
        subreddit_name: str,
        topic: str,
        limit: int = 5,
        time_filter: str = "day",
        comments_per_post: int = 3,
    ) -> List[ScrapedPost]:
        """Fetch top posts from a subreddit with their top comments."""
        posts = []
        try:
            url = f"{REDDIT_BASE}/r/{subreddit_name}/top.json?t={time_filter}&limit={limit}"
            data = await self._get_json(url)

            if not data:
                logger.warning(f"Empty response from r/{subreddit_name}")
                return posts

            for child in data.get("data", {}).get("children", []):
                post_data = child.get("data", {})

                # Fetch top comments
                top_comments = []
                try:
                    comments_url = f"{REDDIT_BASE}{post_data['permalink']}.json?limit={comments_per_post}&sort=best"
                    comments_data = await self._get_json(comments_url)
                    if isinstance(comments_data, list) and len(comments_data) > 1:
                        for comment_child in comments_data[1].get("data", {}).get("children", [])[:comments_per_post]:
                            body = comment_child.get("data", {}).get("body", "")
                            if body:
                                top_comments.append(body[:500])
                except Exception as e:
                    logger.warning(f"Failed to fetch comments for {post_data.get('id')}: {e}")

                post = ScrapedPost(
                    post_id=post_data.get("id", ""),
                    subreddit=subreddit_name,
                    author=post_data.get("author", "[deleted]"),
                    title=post_data.get("title", ""),
                    content=(post_data.get("selftext", "") or "")[:2000],
                    score=post_data.get("score", 0),
                    num_comments=post_data.get("num_comments", 0),
                    upvote_ratio=post_data.get("upvote_ratio", 0.0),
                    post_url=f"https://reddit.com{post_data.get('permalink', '')}",
                    top_comments=top_comments,
                    topic=topic,
                )
                # Use virality score instead of basic engagement
                post.engagement_score = score_post_virality(post_data)
                posts.append(post)

            # Sort by virality score, best content first
            posts.sort(key=lambda p: p.engagement_score, reverse=True)
            logger.info(f"Fetched {len(posts)} posts from r/{subreddit_name}")
        except Exception as e:
            logger.error(f"Error fetching r/{subreddit_name}: {e}")

        return posts

    async def fetch_for_topics(
        self,
        topics: list,
        posts_per_subreddit: int = 5,
        time_filter: str = "day",
        comments_per_post: int = 3,
    ) -> List[ScrapedPost]:
        """Fetch posts for all topics and their subreddits."""
        all_posts = []
        for topic in topics:
            topic_name = topic.get("name", "") if isinstance(topic, dict) else str(topic)
            subreddits = topic.get("subreddits", []) if isinstance(topic, dict) else []

            for sub in subreddits:
                posts = await self.fetch_top_posts(
                    subreddit_name=sub,
                    topic=topic_name,
                    limit=posts_per_subreddit,
                    time_filter=time_filter,
                    comments_per_post=comments_per_post,
                )
                all_posts.extend(posts)

        logger.info(f"Total posts fetched: {len(all_posts)}")
        return all_posts
