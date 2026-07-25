'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchArticles, Article } from '@/lib/api';
import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import Masthead from '@/components/Masthead';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import PopularCarousel from '@/components/PopularCarousel';
import { useDebounce } from '@/lib/useDebounce';
import { useColumnCount } from '@/lib/useColumnCount';

const PAGE_SIZE = 12;
const ROW_ESTIMATE_PX = 340;

export default function Home() {
  const [search, setSearch] = useState('');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const columns = useColumnCount();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['articles', debouncedSearch, activeSource],
    queryFn: ({ pageParam = 0 }) =>
      fetchArticles(pageParam, PAGE_SIZE, activeSource ?? undefined, debouncedSearch || undefined),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.articles.length, 0);
      if (lastPage.articles.length < PAGE_SIZE) return undefined;
      return totalFetched;
    },
  });

  const articles: Article[] = data ? data.pages.flatMap((page) => page.articles) : [];
  const isFiltering = debouncedSearch.length > 0 || activeSource !== null;

  // Group the flat article list into rows, based on current column count.
  // Only the rows near the viewport get rendered/mounted at all — everything
  // else (including its <Image>) is fully removed from the DOM until scrolled
  // back into range, which is what keeps memory bounded on a long session.
  const rows = useMemo(() => {
    const grouped: Article[][] = [];
    for (let i = 0; i < articles.length; i += columns) {
      grouped.push(articles.slice(i, i + columns));
    }
    return grouped;
  }, [articles, columns]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 3,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

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
    const element = observerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <>
      <Masthead />

      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          activeSource={activeSource}
          onSourceChange={setActiveSource}
        />

        {!isFiltering && (
          <div id="popular" className="scroll-mt-24">
            <PopularCarousel />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <span className="pulse-dot" />
            <p className="font-mono text-sm text-text-muted">Pulling the latest stories...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-32">
            <p className="font-mono text-sm text-red-400">
              Could not reach the news feed. Is the API running?
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display text-xl font-semibold">
                {isFiltering ? 'Results' : 'All Posts'}
              </h2>
              <div className="h-px flex-1 bg-[var(--surface-glass-border)]" />
              {isFiltering && (
                <span className="font-mono text-xs text-text-faint">
                  {articles.length} found
                </span>
              )}
            </div>

            {isFiltering && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-2">
                <p className="font-mono text-sm text-text-muted">No stories match your search</p>
                <p className="font-mono text-xs text-text-faint">Try a different keyword or source</p>
              </div>
            ) : (
              <div
                ref={parentRef}
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  position: 'relative',
                  width: '100%',
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  if (!row) return null;
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-5">
                        {row.map((article, i) => (
                          <ArticleCard key={article.id} article={article} index={i} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div ref={observerRef} className="h-16 flex items-center justify-center mt-4">
              {isFetchingNextPage && (
                <p className="font-mono text-xs text-text-muted">Loading more...</p>
              )}
              {!hasNextPage && articles.length > 0 && (
                <p className="font-mono text-xs text-text-faint">You are all caught up</p>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[var(--surface-glass-border)] py-6">
        <p className="max-w-6xl mx-auto px-4 font-mono text-[11px] text-text-faint">
          Naija News Hub aggregates public headlines from Punch, Vanguard, Premium Times,
          Daily Post and PM News. All stories link back to the original publisher.
        </p>
      </footer>
    </>
  );
}
