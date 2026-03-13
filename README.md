# TweetAgent

**Reddit discussions in, tweets out.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-tweetagent.vercel.app-6366f1?style=flat-square&logo=vercel)](https://tweetagent.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-8B5CF6?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com/)

<!-- TODO: drop a screenshot or demo GIF here -->
![Dashboard Screenshot](docs/demo.png)

---

I wanted to grow on Twitter but the "stare at blank tweet box for 20 minutes" workflow wasn't cutting it. Reddit already has amazing discussions happening 24/7 — this app scrapes the good stuff, runs it through Claude to generate original tweets, and lets me approve + post them from a dashboard.

No auto-posting. You review everything first.

## How it works

Pretty simple pipeline:

1. **You pick subreddits** — whatever niches you care about (crypto, AI, soccer, whatever)
2. **PRAW scrapes Reddit** — pulls top posts and comments from those subreddits
3. **Claude writes tweets** — not summaries, not reposts. It reads the discussions and writes original takes in your voice
4. **You approve and post** — everything sits in a queue. Edit it, approve it, or trash it. Approved tweets go live on Twitter via API v2

The whole point is that the AI does the heavy lifting but you stay in control.

## Tech stack

- **Frontend** — Next.js 16, Tailwind CSS v4 (dark theme dashboard + landing page)
- **Backend** — FastAPI, async SQLite, JWT auth
- **AI** — Claude via Anthropic API for tweet generation
- **Reddit** — PRAW for scraping posts and discussions
- **Twitter** — Tweepy (API v2) for posting
- **Notifications** — Telegram bot for mobile alerts and approvals
- **Deployment** — Vercel (frontend) + Railway (backend)

## Project structure

```
twitter-agent/
├── frontend/                # Next.js 16 App Router
│   ├── src/app/
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Main dashboard
│   │   ├── login/           # Auth
│   │   ├── settings/        # API key management
│   │   └── topics/          # Topic management
│   └── src/lib/
│       └── api.ts           # API client
│
├── backend/                 # FastAPI
│   ├── app.py               # App entry + CORS
│   ├── auth_utils.py        # JWT handling
│   └── routes/              # All API routes
│
├── agent/                   # Core logic
│   ├── ai/generator.py      # Claude tweet generator
│   ├── reddit/scraper.py    # Reddit scraper (PRAW)
│   ├── poster/twitter.py    # Twitter poster (Tweepy)
│   ├── storage/             # SQLite + Pydantic models
│   ├── telegram/            # Telegram bot
│   ├── orchestrator.py      # Pipeline orchestration
│   └── scheduler.py         # APScheduler for daily runs
│
├── docker-compose.yml
├── main.py                  # CLI entry point
└── requirements.txt
```

## Quick start

**You'll need:** Python 3.11+, Node.js 18+, and API keys for [Reddit](https://www.reddit.com/prefs/apps), [Twitter](https://developer.twitter.com/), and [Anthropic](https://console.anthropic.com/).

```bash
# Clone and install
git clone https://github.com/okxint/twitter-agent.git
cd twitter-agent
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..

# Start both servers
uvicorn backend.app:app --port 8000 &
cd frontend && npm run dev

# Open http://localhost:3000 — register, add API keys in Settings, create topics, go
```

Or just `docker compose up -d` if you prefer.

## API endpoints

| Method | Endpoint | What it does |
|--------|---------|-------------|
| `POST` | `/api/register` | Create account |
| `POST` | `/api/login` | Get JWT token |
| `GET` | `/api/me` | Current user |
| `GET/PUT` | `/api/settings` | API key management |
| `GET/POST/DELETE` | `/api/topics` | Manage topics |
| `POST` | `/api/scrape` | Trigger Reddit scrape |
| `POST` | `/api/generate` | Generate tweets |
| `GET` | `/api/tweets/pending` | Review queue |
| `POST` | `/api/tweets/:id/approve` | Approve + post |
| `GET` | `/api/tweets/history` | Posted tweets |
| `GET` | `/api/dashboard` | Stats |

## Environment variables

| Variable | Description | Required |
|----------|------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes (has dev default) |
| `DB_PATH` | SQLite path | No (defaults to `./data/agent.db`) |
| `CLAUDE_MODEL` | Model to use | No (defaults to `claude-sonnet-4-5`) |
| `TWEETS_PER_TOPIC` | Tweets per generation | No (defaults to 3) |

Reddit/Twitter API keys are stored per-user in the database via the Settings page.

## Roadmap

**Working now:**
- Reddit scraping via PRAW
- Claude-powered tweet generation
- Twitter API v2 posting
- Full dashboard with auth
- Telegram bot for mobile

**Next up:**
- Analytics dashboard with engagement tracking
- Multi-platform posting (LinkedIn, Threads)
- Per-topic voice profiles
- Batch scheduling with calendar view

## License

MIT

---

Built with Claude AI, FastAPI, Next.js, and too much coffee.

[Live Demo](https://tweetagent.vercel.app) · [Report Bug](https://github.com/okxint/twitter-agent/issues)
