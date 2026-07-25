from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import psycopg2
import psycopg2.extras
import os

CATEGORIES = [
    "Politics",
    "Sports",
    "Business",
    "Entertainment",
    "Technology",
    "Health",
    "Crime",
    "World",
]

BATCH_SIZE = 50  # keeps each run reasonably fast on CPU


def get_connection():
    return psycopg2.connect(
        host=os.environ.get("PG_HOST"),
        dbname=os.environ.get("NEWS_DB"),
        user=os.environ.get("PG_USER"),
        password=os.environ.get("PG_PASSWORD"),
        port=os.environ.get("PG_PORT"),
    )


def classify_articles():
    from transformers import pipeline

    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        """
        SELECT id, title, excerpt FROM news_articles
        WHERE category IS NULL
        ORDER BY published_at DESC
        LIMIT %s
        """,
        (BATCH_SIZE,),
    )
    rows = cur.fetchall()

    if not rows:
        print("No uncategorized articles found")
        cur.close()
        conn.close()
        return

    print(f"Classifying {len(rows)} articles...")

    classifier = pipeline(
        "zero-shot-classification",
        model="valhalla/distilbart-mnli-12-1",
    )

    update_cur = conn.cursor()
    for row in rows:
        text = f"{row['title']}. {row['excerpt'] or ''}"[:512]
        result = classifier(text, CATEGORIES, multi_label=False)
        top_category = result["labels"][0]
        confidence = result["scores"][0]

        update_cur.execute(
            "UPDATE news_articles SET category = %s WHERE id = %s",
            (top_category, row["id"]),
        )
        print(f"  [{row['id']}] {row['title'][:60]}... → {top_category} ({confidence:.2f})")

    conn.commit()
    cur.close()
    update_cur.close()
    conn.close()
    print(f"Classified {len(rows)} articles")


with DAG(
    dag_id="categorize_news_dag",
    start_date=datetime(2026, 7, 18),
    schedule=timedelta(minutes=30),
    catchup=False,
    tags=["news", "ml", "categorization"],
) as dag:

    classify_task = PythonOperator(
        task_id="classify_task",
        python_callable=classify_articles,
    )
