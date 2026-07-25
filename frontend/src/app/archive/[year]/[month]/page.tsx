'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchArchivePeriods, fetchArticles } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import Masthead from '@/components/Masthead';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const PAGE_SIZE = 12;

export default function ArchiveMonthPage() {
  const params = useParams();
  const year = Number(params.year);
  const month = Number(params.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: daysData } = useQuery({
    queryKey: ['archive', 'day', year, month],
    queryFn: () => fetchArchivePeriods('day', year, month),
    enabled: !!year && !!month,
  });
  const days = daysData?.periods ?? [];

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateFrom = selectedDay
    ? `${year}-${pad(month)}-${pad(selectedDay)}`
    : `${year}-${pad(month)}-01`;
  const dateTo = selectedDay
    ? `${year}-${pad(month)}-${pad(selectedDay)}`
    : month === 12
      ? `${year}-12-31`
      : new Date(year, month, 0).toISOString().split('T')[0];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['archive-articles', year, month, selectedDay],
    queryFn: ({ pageParam = 0 }) =>
      fetchArticles(pageParam, PAGE_SIZE, undefined, undefined).then(() =>
        // fetchArticles doesn't support date params directly in its signature yet,
        // so we call the endpoint with date params via a small local wrapper below
        fetchArticlesByDate(pageParam)
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.articles.length, 0);
      if (lastPage.articles.length < PAGE_SIZE) return undefined;
      return totalFetched;
    },
  });

  async function fetchArticlesByDate(offset: number) {
    const axios = (await import('axios')).default;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.get(`${API_URL}/articles`, {
      params: { offset, limit: PAGE_SIZE, date_from: dateFrom, date_to: dateTo },
    });
    return res.data;
  }

  const articles = data ? data.pages.flatMap((p) => p.articles) : [];

  const observerRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <>
      <Masthead />
      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        <Link href={`/archive/${year}`} className="sweep-link font-mono text-xs text-accent-amber inline-block mb-6">
          ← {year}
        </Link>

        <h1 className="font-display text-3xl font-semibold mb-6">
          {MONTH_NAMES[month]} {year}
        </h1>

        {days.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedDay(null)}
              className={
                'font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ' +
                (selectedDay === null
                  ? 'bg-[var(--accent-amber)] text-[var(--bg)] border-[var(--accent-amber)]'
                  : 'glass text-text-muted border-[var(--surface-glass-border)] hover:text-text-primary')
              }
            >
              Whole month
            </button>
            {days
              .slice()
              .sort((a, b) => a.period - b.period)
              .map((d) => (
                <button
                  key={d.period}
                  onClick={() => setSelectedDay(d.period)}
                  className={
                    'font-mono text-xs w-9 h-9 rounded-full border transition-colors ' +
                    (selectedDay === d.period
                      ? 'bg-[var(--accent-amber)] text-[var(--bg)] border-[var(--accent-amber)]'
                      : 'glass text-text-muted border-[var(--surface-glass-border)] hover:text-text-primary')
                  }
                >
                  {d.period}
                </button>
              ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <span className="pulse-dot" />
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <p className="font-mono text-sm text-text-faint py-16">No stories for this period.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>

        <div ref={observerRef} className="h-16 flex items-center justify-center mt-10">
          {isFetchingNextPage && <p className="font-mono text-xs text-text-muted">Loading more...</p>}
        </div>
      </main>
    </>
  );
}
