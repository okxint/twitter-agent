import logging
import time
from typing import List, Dict

import httpx

logger = logging.getLogger("twitter_agent")

REDDIT_BASE = "https://www.reddit.com"
USER_AGENT = "TweetAgent/1.0 (by /u/tweetagent)"

# Curated high-quality subreddits per common topic
# These are known active subs with good engagement
TOPIC_SUBREDDIT_MAP: Dict[str, List[str]] = {
    "ai": ["artificial", "MachineLearning", "LocalLLaMA", "ChatGPT", "singularity"],
    "artificial intelligence": ["artificial", "MachineLearning", "LocalLLaMA", "ChatGPT", "singularity"],
    "machine learning": ["MachineLearning", "deeplearning", "MLQuestions", "datascience", "artificial"],
    "crypto": ["CryptoCurrency", "Bitcoin", "ethereum", "defi", "CryptoMarkets"],
    "cryptocurrency": ["CryptoCurrency", "Bitcoin", "ethereum", "defi", "CryptoMarkets"],
    "bitcoin": ["Bitcoin", "CryptoCurrency", "BitcoinMarkets", "CryptoMarkets"],
    "ethereum": ["ethereum", "ethfinance", "ethdev", "CryptoCurrency"],
    "defi": ["defi", "CryptoCurrency", "ethereum", "UniSwap"],
    "web3": ["web3", "CryptoCurrency", "ethereum", "defi", "NFT"],
    "nft": ["NFT", "NFTsMarketplace", "CryptoCurrency", "web3"],
    "startups": ["startups", "Entrepreneur", "SaaS", "indiehackers", "smallbusiness"],
    "entrepreneurship": ["Entrepreneur", "startups", "SaaS", "indiehackers", "smallbusiness"],
    "saas": ["SaaS", "startups", "Entrepreneur", "indiehackers", "microsaas"],
    "product management": ["ProductManagement", "product_design", "startups", "UserExperience"],
    "programming": ["programming", "learnprogramming", "webdev", "coding", "compsci"],
    "python": ["Python", "learnpython", "django", "flask", "FastAPI"],
    "javascript": ["javascript", "reactjs", "node", "webdev", "nextjs"],
    "react": ["reactjs", "nextjs", "webdev", "javascript", "frontend"],
    "rust": ["rust", "programming", "learnrust"],
    "golang": ["golang", "programming"],
    "devops": ["devops", "kubernetes", "docker", "sysadmin", "aws"],
    "cloud": ["aws", "googlecloud", "azure", "devops", "kubernetes"],
    "cybersecurity": ["cybersecurity", "netsec", "hacking", "AskNetsec", "InfoSecNews"],
    "data science": ["datascience", "MachineLearning", "statistics", "dataengineering", "analytics"],
    "soccer": ["soccer", "PremierLeague", "football", "Bundesliga", "LaLiga"],
    "football": ["soccer", "PremierLeague", "football", "nfl"],
    "f1": ["formula1", "F1Technical", "MotorsportsReplays"],
    "formula 1": ["formula1", "F1Technical", "MotorsportsReplays"],
    "music": ["Music", "hiphopheads", "indieheads", "LetsTalkMusic", "listentothis"],
    "gaming": ["gaming", "Games", "pcgaming", "truegaming", "IndieGaming"],
    "fitness": ["Fitness", "bodyweightfitness", "running", "weightlifting", "GYM"],
    "finance": ["finance", "investing", "StockMarket", "personalfinance", "wallstreetbets"],
    "investing": ["investing", "StockMarket", "ValueInvesting", "stocks", "finance"],
    "marketing": ["marketing", "digital_marketing", "SEO", "socialmedia", "ContentMarketing"],
    "design": ["design", "graphic_design", "UI_Design", "web_design", "UXDesign"],
    "science": ["science", "askscience", "EverythingScience", "Futurology"],
    "technology": ["technology", "tech", "Futurology", "gadgets", "TechNewsToday"],
    "business": ["business", "Entrepreneur", "startups", "smallbusiness", "strategy"],
    "health": ["Health", "nutrition", "Fitness", "MedicalNews", "HealthyFood"],
    "climate": ["climate", "environment", "ClimateActionPlan", "energy", "renewableenergy"],
    "space": ["space", "SpaceX", "NASA", "Astronomy", "astrophysics"],
    "robotics": ["robotics", "artificial", "engineering", "Automate"],
}


def _rate_limit_state():
    """Simple rate limiter."""
    if not hasattr(_rate_limit_state, "last"):
        _rate_limit_state.last = 0.0
    elapsed = time.time() - _rate_limit_state.last
    if elapsed < 6:
        time.sleep(6 - elapsed)
    _rate_limit_state.last = time.time()


def search_subreddits(query: str, limit: int = 5) -> List[Dict]:
    """Search Reddit for subreddits matching a query, return with subscriber counts."""
    _rate_limit_state()
    try:
        url = f"{REDDIT_BASE}/subreddits/search.json?q={query}&limit={limit}&sort=relevance"
        resp = httpx.get(url, headers={"User-Agent": USER_AGENT}, timeout=15, follow_redirects=True)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for child in data.get("data", {}).get("children", []):
            sub = child.get("data", {})
            results.append({
                "name": sub.get("display_name", ""),
                "subscribers": sub.get("subscribers", 0),
                "description": (sub.get("public_description", "") or "")[:200],
                "active_users": sub.get("accounts_active", 0) or 0,
            })
        return results
    except Exception as e:
        logger.error(f"Failed to search subreddits for '{query}': {e}")
        return []


def discover_subreddits(topic_name: str, max_results: int = 5) -> List[str]:
    """
    Find the best subreddits for a topic.
    Uses curated map first, falls back to Reddit search.
    Returns list of subreddit names.
    """
    key = topic_name.lower().strip()

    # Check curated map first
    if key in TOPIC_SUBREDDIT_MAP:
        return TOPIC_SUBREDDIT_MAP[key][:max_results]

    # Partial match on curated map
    for map_key, subs in TOPIC_SUBREDDIT_MAP.items():
        if key in map_key or map_key in key:
            return subs[:max_results]

    # Fall back to Reddit search
    results = search_subreddits(topic_name, limit=max_results)
    # Filter out tiny subs (< 1000 subscribers) and sort by size
    results = [r for r in results if r["subscribers"] >= 1000]
    results.sort(key=lambda r: r["subscribers"], reverse=True)

    return [r["name"] for r in results[:max_results]]


def score_post_virality(post_data: dict) -> float:
    """
    Score a Reddit post's potential to go viral on Twitter.
    Higher score = more likely to get engagement when turned into a tweet.

    Factors:
    - High upvote ratio (>0.9) = universally liked, not controversial
    - Score-to-comment ratio = sparks discussion
    - Recency bonus for fresh content
    - Title length sweet spot (40-120 chars = tweetable)
    - Has actionable/interesting content (selftext or link)
    """
    score = post_data.get("score", 0)
    num_comments = post_data.get("num_comments", 0)
    upvote_ratio = post_data.get("upvote_ratio", 0.0)
    title = post_data.get("title", "")
    selftext = post_data.get("selftext", "")

    virality = 0.0

    # Base engagement (log scale to not over-weight mega posts)
    import math
    if score > 0:
        virality += math.log10(score + 1) * 10  # 0-50 range

    # Discussion factor - posts with lots of comments are interesting
    if num_comments > 0:
        virality += math.log10(num_comments + 1) * 8  # 0-40 range

    # Universal appeal - high upvote ratio means broadly liked
    if upvote_ratio >= 0.95:
        virality += 20
    elif upvote_ratio >= 0.90:
        virality += 15
    elif upvote_ratio >= 0.80:
        virality += 10

    # Tweetable title length (40-120 chars is the sweet spot)
    title_len = len(title)
    if 40 <= title_len <= 120:
        virality += 10
    elif 20 <= title_len <= 200:
        virality += 5

    # Has substance - posts with content are better for tweet generation
    if selftext and len(selftext) > 100:
        virality += 10
    elif selftext and len(selftext) > 30:
        virality += 5

    # Comment-to-score ratio - high ratio means it's a discussion starter
    if score > 0 and num_comments > 0:
        discussion_ratio = num_comments / score
        if discussion_ratio > 0.5:
            virality += 10  # Very discussion-heavy
        elif discussion_ratio > 0.2:
            virality += 5

    return round(virality, 1)
