'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchArticles } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import Masthead from '@/components/Masthead';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['category-articles', categoryName],
    queryFn: ({ pageParam = 0 }) =>
      fetchArticlesByCategory(pageParam, categoryName),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.articles.length, 0);
      if (lastPage.articles.length < PAGE_SIZE) return undefined;
      return totalFetched;
    },
  });

  async function fetchArticlesByCategory(offset: number, category: string) {
    const axios = (await import('axios')).default;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.get(`${API_URL}/articles`, {
      params: { offset, limit: PAGE_SIZE, category },
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
        <Link href="/category" className="sweep-link font-mono text-xs text-accent-amber inline-block mb-6">
          ← All categories
        </Link>

        <h1 className="font-display text-3xl font-semibold mb-8">{categoryName}</h1>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <span className="pulse-dot" />
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <p className="font-mono text-sm text-text-faint py-16">No stories in this category yet.</p>
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
