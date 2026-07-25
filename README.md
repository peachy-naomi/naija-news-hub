# 🇳🇬 Naija News Hub

A live, full-stack Nigerian news aggregator — built end-to-end with a scheduled ETL pipeline, an ML-powered categorization layer, a FastAPI backend, and a modern Next.js frontend with infinite scroll, search, and a dark/light theme.

Naija News Hub pulls headlines from five major Nigerian publishers, cleans and enriches them (real photos, article categories, view-based popularity), and serves them through a searchable, filterable web app that refreshes every 10 minutes — all without ever rewriting or republishing full article content. Every story links straight back to its original publisher.

---

## ✨ Features

- **Live aggregation** from 5 sources — Punch, Vanguard, Premium Times, Daily Post, and PM News — refreshed every 10 minutes via Apache Airflow
- **Automatic deduplication** — the same story is never inserted twice, even across repeated runs
- **Real per-article images** — extracted from each publisher's actual article page (`og:image` / `twitter:image` meta tags), not just generic feed thumbnails
- **ML-based topic categorization** — a zero-shot NLI classifier (`valhalla/distilbart-mnli-12-1`) tags every article into Politics, Sports, Business, Entertainment, Technology, Health, Crime, or World with no manual labeling required
- **Popularity tracking** — view counts recorded on click-through, surfaced in a homepage carousel of the most-read stories
- **Full-text search & multi-dimensional filtering** — by keyword, source, category, and date (year → month → day)
- **Archive browsing** — explore any day, month, or year of coverage
- **Resilient scraping** — automatic fallback through direct requests → residential proxy (Oxylabs) → graceful skip, so one blocked source never takes down the whole pipeline
- **Dark / light theme toggle** with a custom editorial design system (glassmorphism, animated live indicator, no generic "AI dark mode" look)
- **Memory-optimized infinite scroll** — windowed rendering (TanStack Virtual) keeps the DOM lightweight even after scrolling through hundreds of articles
- **Contact form** wired to real email delivery via Resend
- **Fully responsive** — collapsible navigation drawer on mobile, persistent quick-access menu on desktop

---

## 🏗️ Architecture

```
┌─────────────────┐     every 10 min      ┌──────────────┐
│  5 RSS Feeds     │ ─────────────────────▶│   Airflow    │
│  (news sources)  │                        │   DAGs       │
└─────────────────┘                        └──────┬───────┘
                                                    │  extract → clean → dedupe
                                                    │  → fetch real images
                                                    ▼
                                          ┌────────────────────┐
                        every 30 min      │   PostgreSQL        │
                     ┌───────────────────▶│   news_articles      │
                     │  ML categorization │   table              │
                     │  DAG                └─────────┬───────────┘
                     └────────────────────────────────┤
                                                       ▼
                                          ┌────────────────────┐
                                          │   FastAPI            │
                                          │   (REST API)          │
                                          └─────────┬─────────────┘
                                                     ▼
                                          ┌────────────────────┐
                                          │   Next.js Frontend   │
                                          │   (App Router)        │
                                          └────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer            | Technology |
|-------------------|-----------|
| Orchestration      | Apache Airflow (Python) |
| Scraping/Extraction| `feedparser`, `requests`, `BeautifulSoup4`, Oxylabs (residential proxy fallback) |
| ML Categorization  | Hugging Face `transformers` — zero-shot classification (NLI) |
| Database           | PostgreSQL |
| Backend API         | FastAPI (Python), `psycopg2` |
| Email delivery      | Resend |
| Frontend            | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Data fetching        | TanStack Query (infinite queries, caching) |
| List virtualization  | TanStack Virtual |
| Carousel              | Embla Carousel |
| Theming                | `next-themes` |

---

## 📁 Project Structure

```
naija-news-hub/
├── airflow/
│   └── dags/
│       ├── news_aggregator_dag.py     # Extract → transform → load, every 10 min
│       └── categorize_news_dag.py     # ML categorization, every 30 min
├── api/
│   ├── main.py                        # FastAPI app — all endpoints
│   └── requirements.txt
├── frontend/                          # Next.js application
│   ├── src/
│   │   ├── app/                       # Pages (App Router)
│   │   ├── components/                # Reusable UI components
│   │   └── lib/                       # API client, hooks
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20+
- PostgreSQL 15+
- An [Oxylabs](https://oxylabs.io) account (optional — used as a fallback for sources that block direct requests)
- A [Resend](https://resend.com) account (for the contact form)

### 1. Database setup

```sql
CREATE DATABASE news_aggregator;

CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50),
    title TEXT,
    excerpt TEXT,
    link TEXT UNIQUE,
    image_url TEXT,
    category VARCHAR(50),
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_published_at ON news_articles (published_at);
CREATE INDEX idx_articles_view_count ON news_articles (view_count DESC);
```

### 2. Environment variables

```bash
export PG_HOST='localhost'
export PG_PORT='5432'
export NEWS_DB='news_aggregator'
export PG_USER='your_db_user'
export PG_PASSWORD='your_db_password'

export OXYLABS_USERNAME='your_oxylabs_username'
export OXYLABS_PASSWORD='your_oxylabs_password'

export RESEND_NEWS_API_KEY='your_resend_api_key'
export CONTACT_EMAIL='your_email@example.com'
```

### 3. Airflow

```bash
cd airflow
pip install -r requirements.txt
cp dags/*.py $AIRFLOW_HOME/dags/
airflow standalone
```

### 4. API

```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API docs available at `http://localhost:8000/docs`.

### 5. Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Visit `http://localhost:3000`.

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/articles` | GET | List articles — filter by `source`, `search`, `category`, `date_from`, `date_to`; paginated via `limit`/`offset` |
| `/articles/{id}` | GET | Single article by ID |
| `/articles/{id}/view` | POST | Register a view (powers popularity) |
| `/articles/popular` | GET | Most-viewed articles |
| `/sources` | GET | Article count per source |
| `/categories` | GET | Article count per category |
| `/archive/periods` | GET | Available years / months / days with article counts |
| `/contact` | POST | Submit a contact form message |

---

## 🎯 What This Project Demonstrates

- **Data engineering**: scheduled, idempotent ETL pipelines with dependency management, retries, and graceful degradation when individual sources fail
- **Practical ML application**: zero-shot classification applied to a real, unlabeled dataset — no manual annotation needed
- **API design**: a clean, filterable, paginated REST API
- **Modern frontend engineering**: server/client component boundaries, infinite queries, virtualization for memory efficiency, and a considered design system rather than default styling
- **Real-world debugging**: resilience patterns built directly from real obstacles encountered during development — bot detection, rate limits, inconsistent third-party data formats, and unreliable network conditions

---

## ⚖️ A Note on Ethics & Legality

This project deliberately follows the **aggregator model** used by services like Google News — displaying only headlines, short excerpts, and links back to original publishers, with clear source attribution on every card. It does not rewrite, republish, or reproduce full article content. This is a legally and ethically sound approach to news aggregation, unlike scraping and republishing full articles as original content.

---

## 📄 License

This project is for educational and portfolio purposes. All aggregated news content remains the property of its respective original publishers.
