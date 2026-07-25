from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import feedparser
import psycopg2
import requests
from requests.auth import HTTPBasicAuth
from bs4 import BeautifulSoup
import html
import os

FEEDS = {
    "Punch": "https://punchng.com/feed",
    "Vanguard": "https://www.vanguardngr.com/feed",
    "Premium Times": "https://www.premiumtimesng.com/feed",
    "Daily Post": "https://dailypost.ng/feed",
    "PM News": "https://pmnewsnigeria.com/feed",
}

OXYLABS_SOURCES = {"Vanguard"}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}


def fetch_via_oxylabs(url):
    username = os.environ.get("OXYLABS_USERNAME")
    password = os.environ.get("OXYLABS_PASSWORD")
    payload = {"source": "universal", "url": url}
    response = requests.post(
        "https://realtime.oxylabs.io/v1/queries",
        auth=HTTPBasicAuth(username, password),
        json=payload,
        timeout=90,
    )
    response.raise_for_status()
    data = response.json()
    return data["results"][0]["content"]


def fetch_og_image(url, source_name):
    """Visit the actual article page and grab its real social preview image
    (og:image first, then twitter:image, then a wp-post-image class)"""
    try:
        if source_name in OXYLABS_SOURCES:
            page_html = fetch_via_oxylabs(url)
        else:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            resp.raise_for_status()
            page_html = resp.text

        soup = BeautifulSoup(page_html, "html.parser")

        og_tag = soup.find("meta", property="og:image")
        if og_tag and og_tag.get("content"):
            return og_tag["content"]

        twitter_tag = soup.find("meta", attrs={"name": "twitter:image"})
        if twitter_tag and twitter_tag.get("content"):
            return twitter_tag["content"]

        featured_img = soup.find("img", class_=lambda c: c and "wp-post-image" in c)
        if featured_img and featured_img.get("src"):
            return featured_img["src"]

    except Exception as e:
        print(f"  image fetch failed for {url}: {e}")
    return None


def extract_rss_image(entry, raw_summary):
    """Fallback only — used if the real per-article page fetch fails"""
    if raw_summary:
        soup = BeautifulSoup(raw_summary, "html.parser")
        img_tag = soup.find("img")
        if img_tag and img_tag.get("src"):
            return img_tag["src"]

    if entry.get("media_content"):
        url = entry["media_content"][0].get("url")
        if url:
            return url
    if entry.get("media_thumbnail"):
        url = entry["media_thumbnail"][0].get("url")
        if url:
            return url

    if entry.get("links"):
        for link in entry["links"]:
            if link.get("rel") == "enclosure" and "image" in link.get("type", ""):
                return link.get("href")

    return None


def clean_excerpt(raw_summary):
    text_only = BeautifulSoup(raw_summary, "html.parser").get_text()
    decoded = html.unescape(text_only)
    return " ".join(decoded.split())[:300]


def fetch_feed(source_name, feed_url, ti, use_oxylabs=False):
    try:
        if use_oxylabs:
            content = fetch_via_oxylabs(feed_url)
        else:
            resp = requests.get(feed_url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            content = resp.content
    except requests.exceptions.RequestException as e:
        print(f"STATUS: {source_name} — direct request failed ({e}), retrying via Oxylabs")
        try:
            content = fetch_via_oxylabs(feed_url)
        except Exception as e2:
            print(f"STATUS: {source_name} — Oxylabs also failed ({e2}), skipping this source")
            ti.xcom_push(key=f"{source_name.lower().replace(' ', '_')}_data", value=[])
            return

    parsed = feedparser.parse(content)
    articles = []

    for entry in parsed.entries:
        title = html.unescape(entry.get("title", "").strip())
        link = entry.get("link", "").strip()
        raw_summary = entry.get("summary", "") or entry.get("description", "")
        clean_summary = clean_excerpt(raw_summary)
        rss_image = extract_rss_image(entry, raw_summary)

        published_at = None
        if entry.get("published_parsed"):
            published_at = datetime(*entry.published_parsed[:6])

        if title and link:
            articles.append({
                "source": source_name,
                "title": title,
                "excerpt": clean_summary,
                "link": link,
                "image_url": rss_image,  # provisional; may get overridden below with the real photo
                "published_at": published_at,
            })

    print(f"STATUS: {source_name} — {len(articles)} articles found in feed")
    ti.xcom_push(key=f"{source_name.lower().replace(' ', '_')}_data", value=articles)


def fetch_punch(ti):
    fetch_feed("Punch", FEEDS["Punch"], ti)


def fetch_vanguard(ti):
    fetch_feed("Vanguard", FEEDS["Vanguard"], ti, use_oxylabs=True)


def fetch_premium_times(ti):
    fetch_feed("Premium Times", FEEDS["Premium Times"], ti)


def fetch_daily_post(ti):
    fetch_feed("Daily Post", FEEDS["Daily Post"], ti)


def fetch_pm_news(ti):
    fetch_feed("PM News", FEEDS["PM News"], ti)


def load_to_postgres(ti):
    sources = ["punch", "vanguard", "premium_times", "daily_post", "pm_news"]
    task_ids = [
        "fetch_punch_task", "fetch_vanguard_task", "fetch_premium_times_task",
        "fetch_daily_post_task", "fetch_pm_news_task",
    ]

    all_articles = []
    for key, task_id in zip(sources, task_ids):
        try:
            articles = ti.xcom_pull(key=f"{key}_data", task_ids=task_id) or []
        except Exception:
            articles = []
        all_articles.extend(articles)

    if not all_articles:
        print("No articles fetched this run")
        return

    conn = psycopg2.connect(
        host=os.environ.get("PG_HOST"),
        dbname=os.environ.get("NEWS_DB"),
        user=os.environ.get("PG_USER"),
        password=os.environ.get("PG_PASSWORD"),
        port=os.environ.get("PG_PORT"),
    )
    cur = conn.cursor()

    cur.execute("SELECT link, image_url FROM news_articles")
    existing = {row[0]: row[1] for row in cur.fetchall()}

    fetched_count = 0
    for article in all_articles:
        needs_image = article["link"] not in existing or not existing[article["link"]]

        if needs_image:
            fetched_count += 1
            # Always try the REAL per-article photo first — this takes priority
            # over whatever the RSS feed's enclosure/thumbnail already provided,
            # since some sources (e.g. Punch) only give a generic logo there.
            og_image = fetch_og_image(article["link"], article["source"])
            if og_image:
                article["image_url"] = og_image
            # else: keep whatever extract_rss_image already found, as a fallback

        cur.execute(
            """
            INSERT INTO news_articles (source, title, excerpt, link, image_url, published_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (link) DO UPDATE
            SET image_url = COALESCE(news_articles.image_url, EXCLUDED.image_url)
            """,
            (
                article["source"],
                article["title"],
                article["excerpt"],
                article["link"],
                article["image_url"],
                article["published_at"],
            ),
        )

    conn.commit()
    cur.close()
    conn.close()
    print(f"Processed {len(all_articles)} articles (attempted image fetch for {fetched_count})")


with DAG(
    dag_id="news_aggregator_dag",
    start_date=datetime(2026, 7, 17),
    schedule=timedelta(minutes=10),
    catchup=False,
    tags=["news", "aggregator"],
) as dag:

    fetch_punch_task = PythonOperator(task_id="fetch_punch_task", python_callable=fetch_punch)
    fetch_vanguard_task = PythonOperator(task_id="fetch_vanguard_task", python_callable=fetch_vanguard)
    fetch_premium_times_task = PythonOperator(task_id="fetch_premium_times_task", python_callable=fetch_premium_times)
    fetch_daily_post_task = PythonOperator(task_id="fetch_daily_post_task", python_callable=fetch_daily_post)
    fetch_pm_news_task = PythonOperator(task_id="fetch_pm_news_task", python_callable=fetch_pm_news)

    load_task = PythonOperator(
        task_id="load_task",
        python_callable=load_to_postgres,
        trigger_rule="all_done",
    )

    [
        fetch_punch_task,
        fetch_vanguard_task,
        fetch_premium_times_task,
        fetch_daily_post_task,
        fetch_pm_news_task,
    ] >> load_task
