import logging
import time
from typing import List, Dict

import httpx

logger = logging.getLogger("twitter_agent")

REDDIT_BASE = "https://www.reddit.com"
USER_AGENT = "TweetAgent/1.0 (by /u/tweetagent)"

# Reddit-style interest categories with curated subreddits
# Organized like Reddit's signup flow
TOPIC_CATEGORIES: Dict[str, List[str]] = {
    # Technology & Internet
    "Artificial Intelligence": ["artificial", "MachineLearning", "LocalLLaMA", "ChatGPT", "singularity"],
    "Machine Learning": ["MachineLearning", "deeplearning", "MLQuestions", "datascience", "artificial"],
    "Programming": ["programming", "learnprogramming", "webdev", "coding", "compsci"],
    "Python": ["Python", "learnpython", "django", "flask", "FastAPI"],
    "JavaScript": ["javascript", "reactjs", "node", "webdev", "nextjs"],
    "Web Development": ["webdev", "Frontend", "reactjs", "nextjs", "css"],
    "Cybersecurity": ["cybersecurity", "netsec", "hacking", "AskNetsec", "InfoSecNews"],
    "Data Science": ["datascience", "MachineLearning", "statistics", "dataengineering", "analytics"],
    "DevOps": ["devops", "kubernetes", "docker", "sysadmin", "aws"],
    "Cloud Computing": ["aws", "googlecloud", "azure", "devops", "kubernetes"],
    "Open Source": ["opensource", "linux", "selfhosted", "programming", "FOSS"],
    "Tech News": ["technology", "tech", "Futurology", "gadgets", "TechNewsToday"],
    "Robotics": ["robotics", "artificial", "engineering", "Automate"],
    "Mobile Development": ["androiddev", "iOSProgramming", "FlutterDev", "reactnative", "SwiftUI"],
    # Crypto & Finance
    "Cryptocurrency": ["CryptoCurrency", "Bitcoin", "ethereum", "defi", "CryptoMarkets"],
    "Bitcoin": ["Bitcoin", "CryptoCurrency", "BitcoinMarkets", "CryptoMarkets"],
    "Ethereum": ["ethereum", "ethfinance", "ethdev", "CryptoCurrency"],
    "DeFi": ["defi", "CryptoCurrency", "ethereum", "UniSwap"],
    "Web3": ["web3", "CryptoCurrency", "ethereum", "defi", "NFT"],
    "NFTs": ["NFT", "NFTsMarketplace", "CryptoCurrency", "web3"],
    "Personal Finance": ["personalfinance", "FinancialPlanning", "povertyfinance", "FIRE", "Bogleheads"],
    "Investing": ["investing", "StockMarket", "ValueInvesting", "stocks", "finance"],
    "Stock Market": ["StockMarket", "wallstreetbets", "stocks", "options", "investing"],
    "Real Estate": ["RealEstate", "realestateinvesting", "FirstTimeHomeBuyer", "landlords"],
    # Business & Career
    "Startups": ["startups", "Entrepreneur", "SaaS", "indiehackers", "smallbusiness"],
    "Entrepreneurship": ["Entrepreneur", "startups", "SaaS", "indiehackers", "smallbusiness"],
    "SaaS": ["SaaS", "startups", "Entrepreneur", "indiehackers", "microsaas"],
    "Product Management": ["ProductManagement", "product_design", "startups", "UserExperience"],
    "Marketing": ["marketing", "digital_marketing", "SEO", "socialmedia", "ContentMarketing"],
    "Remote Work": ["remotework", "digitalnomad", "WorkOnline", "freelance"],
    "Career Advice": ["careerguidance", "cscareerquestions", "jobs", "resumes", "interviews"],
    "Side Hustles": ["sidehustle", "beermoney", "WorkOnline", "Entrepreneur", "passive_income"],
    "Freelancing": ["freelance", "Upwork", "FreelanceWriters", "webdev"],
    "E-commerce": ["ecommerce", "shopify", "FulfillmentByAmazon", "dropship"],
    # Science & Education
    "Science": ["science", "askscience", "EverythingScience", "Futurology"],
    "Space": ["space", "SpaceX", "NASA", "Astronomy", "astrophysics"],
    "Climate & Environment": ["climate", "environment", "ClimateActionPlan", "energy", "renewableenergy"],
    "Psychology": ["psychology", "neuroscience", "BehavioralEconomics", "mentalhealth"],
    "Physics": ["Physics", "AskPhysics", "QuantumPhysics", "cosmology"],
    "Biology": ["biology", "microbiology", "genetics", "Biochemistry"],
    "History": ["history", "AskHistorians", "HistoryMemes", "ancienthistory"],
    "Philosophy": ["philosophy", "askphilosophy", "Stoicism", "existentialism"],
    # Sports
    "Soccer": ["soccer", "PremierLeague", "football", "Bundesliga", "LaLiga"],
    "Formula 1": ["formula1", "F1Technical", "MotorsportsReplays"],
    "Basketball": ["nba", "basketball", "nbadiscussion", "CollegeBasketball"],
    "American Football": ["nfl", "fantasyfootball", "CFB"],
    "Cricket": ["Cricket", "IPL", "CricketShitpost"],
    "Tennis": ["tennis", "10s"],
    "MMA": ["MMA", "ufc", "bjj", "martialarts"],
    "Running": ["running", "trailrunning", "marathontraining", "C25K"],
    "Fitness": ["Fitness", "bodyweightfitness", "GYM", "weightlifting", "StrongLifts5x5"],
    # Entertainment
    "Gaming": ["gaming", "Games", "pcgaming", "truegaming", "IndieGaming"],
    "Movies": ["movies", "MovieSuggestions", "TrueFilm", "Letterboxd", "horror"],
    "TV Shows": ["television", "NetflixBestOf", "TVSuggestions", "anime"],
    "Music": ["Music", "hiphopheads", "indieheads", "LetsTalkMusic", "listentothis"],
    "Anime": ["anime", "manga", "Animesuggest", "animediscussion"],
    "Books": ["books", "suggestmeabook", "booksuggestions", "literature"],
    "Podcasts": ["podcasts", "TrueCrimePodcasts", "podcast"],
    "Photography": ["photography", "photocritique", "itookapicture", "streetphotography"],
    # Design & Creative
    "Design": ["design", "graphic_design", "UI_Design", "web_design", "UXDesign"],
    "UX Design": ["UXDesign", "UserExperience", "userexperience", "UI_Design"],
    "3D & Animation": ["blender", "3Dmodeling", "Cinema4D", "MotionDesign"],
    "Art": ["Art", "DigitalArt", "ArtFundamentals", "learnart", "drawing"],
    "Writing": ["writing", "WritingPrompts", "screenwriting", "selfpublish"],
    # Lifestyle
    "Health & Wellness": ["Health", "nutrition", "Fitness", "MedicalNews", "HealthyFood"],
    "Mental Health": ["mentalhealth", "Anxiety", "depression", "therapy", "selfimprovement"],
    "Food & Cooking": ["Cooking", "food", "MealPrepSunday", "EatCheapAndHealthy", "recipes"],
    "Travel": ["travel", "solotravel", "backpacking", "TravelHacks", "digitalnomad"],
    "Fashion": ["malefashionadvice", "femalefashionadvice", "streetwear", "frugalmalefashion"],
    "Parenting": ["Parenting", "daddit", "Mommit", "NewParents"],
    "Pets": ["dogs", "cats", "Pets", "aww", "AnimalsBeingBros"],
    "Home Improvement": ["HomeImprovement", "DIY", "InteriorDesign", "woodworking"],
    # News & World
    "World News": ["worldnews", "news", "geopolitics", "InternationalNews"],
    "Politics": ["politics", "PoliticalDiscussion", "NeutralPolitics", "geopolitics"],
    "Economics": ["Economics", "economy", "AskEconomics", "finance"],
    # Self-Improvement
    "Productivity": ["productivity", "getdisciplined", "DecidingToBeBetter", "LifeProTips"],
    "Self Improvement": ["selfimprovement", "DecidingToBeBetter", "getdisciplined", "Stoicism"],
    "Learning": ["learnprogramming", "languagelearning", "IWantToLearn", "AskAcademia"],
}

# Build a lowercase lookup from the categories
TOPIC_SUBREDDIT_MAP: Dict[str, List[str]] = {
    k.lower(): v for k, v in TOPIC_CATEGORIES.items()
}


def get_all_topics() -> List[Dict[str, str]]:
    """Return all available topic categories grouped for the UI."""
    groups = {
        "Technology & Internet": [
            "Artificial Intelligence", "Machine Learning", "Programming", "Python",
            "JavaScript", "Web Development", "Cybersecurity", "Data Science",
            "DevOps", "Cloud Computing", "Open Source", "Tech News", "Robotics",
            "Mobile Development",
        ],
        "Crypto & Finance": [
            "Cryptocurrency", "Bitcoin", "Ethereum", "DeFi", "Web3", "NFTs",
            "Personal Finance", "Investing", "Stock Market", "Real Estate",
        ],
        "Business & Career": [
            "Startups", "Entrepreneurship", "SaaS", "Product Management",
            "Marketing", "Remote Work", "Career Advice", "Side Hustles",
            "Freelancing", "E-commerce",
        ],
        "Science & Education": [
            "Science", "Space", "Climate & Environment", "Psychology",
            "Physics", "Biology", "History", "Philosophy",
        ],
        "Sports": [
            "Soccer", "Formula 1", "Basketball", "American Football",
            "Cricket", "Tennis", "MMA", "Running", "Fitness",
        ],
        "Entertainment": [
            "Gaming", "Movies", "TV Shows", "Music", "Anime",
            "Books", "Podcasts", "Photography",
        ],
        "Design & Creative": [
            "Design", "UX Design", "3D & Animation", "Art", "Writing",
        ],
        "Lifestyle": [
            "Health & Wellness", "Mental Health", "Food & Cooking", "Travel",
            "Fashion", "Parenting", "Pets", "Home Improvement",
        ],
        "News & World": [
            "World News", "Politics", "Economics",
        ],
        "Self-Improvement": [
            "Productivity", "Self Improvement", "Learning",
        ],
    }
    return groups


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
