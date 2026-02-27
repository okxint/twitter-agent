import logging

import tweepy

logger = logging.getLogger("twitter_agent")


class TweetPublisher:
    """Posts tweets via Twitter API v2 using tweepy."""

    def __init__(self, api_key: str, api_secret: str, access_token: str, access_token_secret: str):
        self.client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_token_secret,
        )

    async def post_tweet(self, content: str) -> dict:
        """Post a tweet and return the response with tweet id."""
        try:
            response = self.client.create_tweet(text=content)
            tweet_id = response.data["id"]
            logger.info(f"Tweet posted successfully: {tweet_id}")
            return {"success": True, "tweet_id": tweet_id}
        except tweepy.TweepyException as e:
            logger.error(f"Failed to post tweet: {e}")
            return {"success": False, "error": str(e)}
