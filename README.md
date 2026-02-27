<div align="center">

# 🐦 TweetAgent

### AI-Powered Reddit-to-Twitter Content Pipeline

**Turn trending Reddit discussions into viral tweets — automatically.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-6366f1?style=for-the-badge&logo=vercel)](https://tweetagent.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-8B5CF6?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com/)
[![Reddit API](https://img.shields.io/badge/Reddit_API-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/dev/api/)
[![Twitter API](https://img.shields.io/badge/Twitter_API_v2-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://developer.twitter.com/)

<br />

<img src="docs/hero-preview.png" alt="TweetAgent Dashboard" width="800" />

</div>

---

## The Problem

Growing on Twitter/X is a full-time job. You need to:
- Monitor trends across dozens of communities
- Come up with original takes daily
- Write engaging content that resonates
- Post consistently without burning out

**TweetAgent solves this in one pipeline.**

---

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  📡 Reddit  │────▶│  🤖 Claude AI    │────▶│  ✏️ Review &    │────▶│  🐦 Post to  │
│  Scraper    │     │  Tweet Generator  │     │    Approve       │     │   Twitter/X  │
└─────────────┘     └──────────────────┘     └─────────────────┘     └──────────────┘
   Pick your           AI reads top            Human-in-the-loop       One-click
   subreddits          discussions &           — edit, approve,        posting via
   & niches            writes original         or reject tweets        Twitter API v2
                       tweets in your tone
```

### 1. Pick Your Topics
Choose the niches you want to dominate. Add subreddits, define your voice.

### 2. Reddit Scrapes Daily
The agent pulls top posts, comments, and engagement signals from your target subreddits using the official Reddit API (PRAW).

### 3. AI Generates Tweets
Claude reads the discussions and generates original, on-brand tweets — not summaries, not reposts. Original takes.

### 4. Approve & Post
Review everything in the dashboard. Edit if needed. Approve → live on Twitter via API v2. You stay in control.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + Tailwind CSS v4 | Dark-themed dashboard & landing page |
| **Backend** | FastAPI + async SQLite | REST API, JWT auth, async operations |
| **AI Engine** | Claude (Anthropic API) | Tweet generation from Reddit context |
| **Data Source** | Reddit API (PRAW) | Scraping trending posts & discussions |
| **Distribution** | Twitter API v2 (Tweepy) | Authenticated tweet posting |
| **Notifications** | Telegram Bot API | Real-time alerts & mobile control |
| **Deployment** | Vercel + Railway | Frontend CDN + Backend container |

---

## Features

| Feature | Description |
|---------|-------------|
| **Reddit-Powered Discovery** | Scrapes top posts from targeted subreddits — not random content, real trending discussions |
| **Claude AI Generation** | Generates original tweets using Anthropic's Claude — understands context, writes in your voice |
| **One-Click Posting** | Approve a tweet and it's live on Twitter/X instantly via API v2 |
| **Human-in-the-Loop** | Every tweet goes through you first — edit, approve, or reject from the dashboard |
| **Topic Intelligence** | Organize content by topics/niches with dedicated subreddit sources |
| **Daily Automation** | Schedule scraping and generation — wake up to fresh tweet drafts every morning |
| **Full Dashboard** | Pending queue, post history, engagement stats, settings — all in one place |
| **Telegram Integration** | Get notified on mobile, approve tweets, manage topics — all from Telegram |
| **Multi-Account Ready** | JWT auth with per-user API keys — each user brings their own Reddit/Twitter/AI credentials |

---

## Architecture

```
twitter-agent/
├── frontend/               # Next.js 16 App Router
│   ├── src/app/
│   │   ├── page.tsx        # Landing page (dark, animated)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── login/          # Auth pages
│   │   ├── register/
│   │   ├── settings/       # API key management
│   │   └── topics/         # Topic management
│   └── src/lib/
│       └── api.ts          # API client
│
├── backend/                # FastAPI REST API
│   ├── app.py              # FastAPI app + CORS + lifespan
│   ├── auth_utils.py       # JWT token management
│   ├── routes/
│   │   ├── auth.py         # Register / Login / Me
│   │   ├── dashboard.py    # Stats & metrics
│   │   ├── topics.py       # CRUD topics
│   │   ├── tweets.py       # Pending / History / Approve
│   │   ├── generate.py     # AI tweet generation
│   │   ├── scrape.py       # Reddit scraping trigger
│   │   └── settings.py     # User settings & API keys
│   └── Dockerfile
│
├── agent/                  # Core agent logic
│   ├── ai/
│   │   └── generator.py    # Claude-powered tweet generator
│   ├── reddit/
│   │   └── scraper.py      # Reddit API scraper (PRAW)
│   ├── poster/
│   │   └── twitter.py      # Twitter API v2 poster (Tweepy)
│   ├── storage/
│   │   ├── database.py     # Async SQLite ORM
│   │   └── models.py       # Pydantic models
│   ├── telegram/
│   │   ├── bot.py          # Telegram bot commands
│   │   └── handlers.py     # Message handlers
│   ├── orchestrator.py     # Pipeline orchestration
│   ├── scheduler.py        # APScheduler for daily runs
│   └── utils/
│       └── config.py       # YAML config loader
│
├── docker-compose.yml      # One-command deployment
├── main.py                 # CLI entry point
└── requirements.txt        # Python dependencies
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/register` | Create account |
| `POST` | `/api/login` | Get JWT token |
| `GET` | `/api/me` | Current user profile |
| `GET/PUT` | `/api/settings` | Manage API keys |
| `GET/POST/DELETE` | `/api/topics` | CRUD topics |
| `POST` | `/api/scrape` | Trigger Reddit scrape |
| `POST` | `/api/generate` | Generate tweets with AI |
| `GET` | `/api/tweets/pending` | Review queue |
| `POST` | `/api/tweets/:id/approve` | Approve & post tweet |
| `GET` | `/api/tweets/history` | Posted tweet history |
| `GET` | `/api/dashboard` | Stats & metrics |
| `GET` | `/api/health` | Health check |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Reddit API credentials ([create app](https://www.reddit.com/prefs/apps))
- Twitter API v2 credentials ([developer portal](https://developer.twitter.com/))
- Anthropic API key ([console](https://console.anthropic.com/))

### 1. Clone & Install

```bash
git clone https://github.com/okxint/twitter-agent.git
cd twitter-agent

# Backend
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

### 2. Start Backend

```bash
cd /path/to/twitter-agent
uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Open Dashboard

Navigate to `http://localhost:3000`, register an account, add your API keys in Settings, create topics, and start generating.

### Docker (Alternative)

```bash
docker compose up -d
```

---

## Environment Variables

| Variable | Description | Required |
|----------|------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for tweet generation | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes (defaults to dev key) |
| `DB_PATH` | SQLite database path | No (defaults to `./data/agent.db`) |
| `CLAUDE_MODEL` | Claude model ID | No (defaults to `claude-sonnet-4-5`) |
| `TWEETS_PER_TOPIC` | Tweets generated per topic | No (defaults to 3) |

Per-user credentials (Reddit API, Twitter API) are stored securely in the database via the Settings page.

---

## Roadmap

- [x] Reddit API integration (PRAW)
- [x] Claude AI tweet generation
- [x] Twitter API v2 posting
- [x] Full web dashboard (Next.js 16)
- [x] JWT authentication
- [x] Telegram bot integration
- [x] Dark-themed YC-ready landing page
- [ ] Analytics dashboard with engagement metrics
- [ ] Multi-platform support (LinkedIn, Threads)
- [ ] Fine-tuned voice profiles per topic
- [ ] Webhook integrations (Slack, Discord)
- [ ] Batch scheduling with calendar view

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

MIT

---

<div align="center">

**Built with Claude AI, FastAPI, Next.js, and too much coffee.**

[Live Demo](https://tweetagent.vercel.app) · [Report Bug](https://github.com/okxint/twitter-agent/issues) · [Request Feature](https://github.com/okxint/twitter-agent/issues)

</div>
