'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPopularArticles } from '@/lib/api';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SOURCE_COLORS: Record<string, string> = {
  Punch: '#f2a94e',
  Vanguard: '#1b7a64',
  'Premium Times': '#c9738a',
  'Daily Post': '#6b8fc7',
  'PM News': '#a58ad6',
};

const AUTOPLAY_MS = 5500;

export default function PopularCarousel() {
  const { data, isLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: () => fetchPopularArticles(8),
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused]);

  const articles = data?.articles ?? [];

  if (isLoading) {
    return (
      <div className="glass rounded-2xl h-72 md:h-80 flex items-center justify-center mb-10">
        <span className="pulse-dot" />
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-xl font-semibold">Popular Right Now</h2>
        <div className="h-px flex-1 bg-[var(--surface-glass-border)]" />
      </div>

      <div
        className="relative rounded-2xl overflow-hidden glass"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {articles.map((article) => {
              const accent = SOURCE_COLORS[article.source] || '#f2a94e';
              return (
                <div key={article.id} className="relative flex-[0_0_100%] min-w-0">
                  <Link href={'/article/' + article.id} className="block relative h-72 md:h-80 group">
                    {article.image_url ? (
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="100vw"
                        unoptimized
                        priority
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${accent}33, var(--bg-elevated))` }}
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-full"
                          style={{
                            color: accent,
                            backgroundColor: accent + '2a',
                            border: '1px solid ' + accent + '60',
                          }}
                        >
                          {article.source}
                        </span>
                        <span className="font-mono text-[10px] text-white/70 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z" />
                          </svg>
                          {article.view_count} views
                        </span>
                      </div>
                      <h3 className="font-display text-xl md:text-3xl font-semibold text-white leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={
                'w-1.5 h-1.5 rounded-full transition-all ' +
                (i === selectedIndex ? 'bg-white w-4' : 'bg-white/40')
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
