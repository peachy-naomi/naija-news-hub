from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import psycopg2
import psycopg2.extras
import os
import resend

app = FastAPI(
    title="Nigeria News Aggregator API",
    description="Aggregated headlines from Punch, Vanguard, Premium Times, Daily Post, and PM News",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

resend.api_key = os.environ.get("RESEND_NEWS_API_KEY")



def get_connection():
    return psycopg2.connect(
        host=os.environ.get("NEWS_PG_HOST"),
        dbname=os.environ.get("NEWS_DB"),
        user=os.environ.get("NEWS_PG_USER"),
        password=os.environ.get("NEWS_PG_PASSWORD"),
        port=os.environ.get("NEWS_PG_PORT"),
    )

@app.get("/")
def root():
    return {"message": "Nigeria News Aggregator API — see /docs for usage"}


@app.get("/articles")
def get_articles(
    source: Optional[str] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search keyword in title"),
    category: Optional[str] = Query(None, description="Filter by category"),
    date_from: Optional[str] = Query(None, description="ISO date, e.g. 2026-07-01"),
    date_to: Optional[str] = Query(None, description="ISO date, e.g. 2026-07-31"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get news articles with optional filters: source, search, category, date range"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = "SELECT id, source, title, excerpt, link, image_url, category, view_count, published_at FROM news_articles WHERE 1=1"
    params = []

    if source:
        query += " AND source ILIKE %s"
        params.append(source)

    if search:
        query += " AND title ILIKE %s"
        params.append(f"%{search}%")

    if category:
        query += " AND category ILIKE %s"
        params.append(category)

    if date_from:
        query += " AND published_at >= %s"
        params.append(date_from)

    if date_to:
        query += " AND published_at < (%s::date + INTERVAL '1 day')"
        params.append(date_to)

    query += " ORDER BY published_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {"count": len(rows), "articles": rows}


@app.get("/articles/popular")
def get_popular_articles(limit: int = Query(8, ge=1, le=20)):
    """Get most-viewed articles, falling back to most recent when views are tied/absent"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        """
        SELECT id, source, title, excerpt, link, image_url, category, view_count, published_at
        FROM news_articles
        ORDER BY view_count DESC, published_at DESC
        LIMIT %s
        """,
        (limit,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"articles": rows}


@app.get("/articles/{article_id}")
def get_article(article_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT * FROM news_articles WHERE id = %s", (article_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Article not found")

    return row


@app.post("/articles/{article_id}/view")
def register_view(article_id: int):
    """Increment an article's view count — call this once when a reader opens it"""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE news_articles SET view_count = view_count + 1 WHERE id = %s RETURNING view_count",
        (article_id,),
    )
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Article not found")

    return {"id": article_id, "view_count": result[0]}


@app.get("/sources")
def get_sources():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT source, COUNT(*) as article_count FROM news_articles GROUP BY source")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {"sources": rows}


@app.get("/categories")
def get_categories():
    """List categories with counts (empty/null until classifier has run)"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        """
        SELECT category, COUNT(*) as article_count
        FROM news_articles
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY article_count DESC
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {"categories": rows}


@app.get("/archive/periods")
def get_archive_periods(
    granularity: str = Query("year", pattern="^(year|month|day)$"),
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
):
    """
    Returns available time periods with article counts, for building an archive index.
    - granularity=year        -> list of years
    - granularity=month&year= -> list of months within that year
    - granularity=day&year=&month= -> list of days within that month
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if granularity == "year":
        cur.execute(
            """
            SELECT EXTRACT(YEAR FROM published_at)::int AS period, COUNT(*) AS article_count
            FROM news_articles
            GROUP BY period
            ORDER BY period DESC
            """
        )
    elif granularity == "month":
        if year is None:
            raise HTTPException(status_code=400, detail="year is required for month granularity")
        cur.execute(
            """
            SELECT EXTRACT(MONTH FROM published_at)::int AS period, COUNT(*) AS article_count
            FROM news_articles
            WHERE EXTRACT(YEAR FROM published_at) = %s
            GROUP BY period
            ORDER BY period DESC
            """,
            (year,),
        )
    else:  # day
        if year is None or month is None:
            raise HTTPException(status_code=400, detail="year and month are required for day granularity")
        cur.execute(
            """
            SELECT EXTRACT(DAY FROM published_at)::int AS period, COUNT(*) AS article_count
            FROM news_articles
            WHERE EXTRACT(YEAR FROM published_at) = %s AND EXTRACT(MONTH FROM published_at) = %s
            GROUP BY period
            ORDER BY period DESC
            """,
            (year, month),
        )

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"granularity": granularity, "periods": rows}


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


@app.post("/contact")
def submit_contact(payload: ContactRequest):
    """Send a contact form submission to the site owner via Resend"""
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [os.environ.get("CONTACT_EMAIL")],
            "reply_to": payload.email,
            "subject": f"Naija News Hub contact form — {payload.name}",
            "html": f"<p><strong>From:</strong> {payload.name} ({payload.email})</p><p>{payload.message}</p>",
        })
        return {"success": True, "message": "Message sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {e}")
