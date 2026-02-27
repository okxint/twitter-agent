import logging
from typing import List

import praw

from agent.storage.models import ScrapedPost

logger = logging.getLogger("twitter_agent")


class RedditFetcher:
    """Fetches top posts from Reddit using PRAW (read-only mode)."""

    def __init__(self, client_id: str, client_secret: str, user_agent: str = "TweetAgent/1.0"):
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent,
        )
        self.reddit.read_only = True

    def fetch_top_posts(
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
            subreddit = self.reddit.subreddit(subreddit_name)
            for submission in subreddit.top(time_filter=time_filter, limit=limit):
                # Get top comments
                submission.comment_sort = "best"
                submission.comments.replace_more(limit=0)
                top_comments = []
                for comment in submission.comments[:comments_per_post]:
                    if hasattr(comment, "body") and comment.body:
                        top_comments.append(comment.body[:500])

                post = ScrapedPost(
                    post_id=submission.id,
                    subreddit=subreddit_name,
                    author=str(submission.author) if submission.author else "[deleted]",
                    title=submission.title,
                    content=submission.selftext[:2000] if submission.selftext else "",
                    score=submission.score,
                    num_comments=submission.num_comments,
                    upvote_ratio=submission.upvote_ratio,
                    post_url=f"https://reddit.com{submission.permalink}",
                    top_comments=top_comments,
                    topic=topic,
                )
                post.compute_engagement_score()
                posts.append(post)

            logger.info(f"Fetched {len(posts)} posts from r/{subreddit_name}")
        except Exception as e:
            logger.error(f"Error fetching r/{subreddit_name}: {e}")

        return posts

    def fetch_for_topics(
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
                posts = self.fetch_top_posts(
                    subreddit_name=sub,
                    topic=topic_name,
                    limit=posts_per_subreddit,
                    time_filter=time_filter,
                    comments_per_post=comments_per_post,
                )
                all_posts.extend(posts)

        logger.info(f"Total posts fetched: {len(all_posts)}")
        return all_posts
