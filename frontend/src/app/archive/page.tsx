'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchArchivePeriods } from '@/lib/api';
import Masthead from '@/components/Masthead';
import Link from 'next/link';

export default function ArchivePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['archive', 'year'],
    queryFn: () => fetchArchivePeriods('year'),
  });

  const years = data?.periods ?? [];

  return (
    <>
      <Masthead />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-2">Archive</h1>
        <p className="font-sans text-text-muted mb-8">Browse stories by the year they were published.</p>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <span className="pulse-dot" />
          </div>
        )}

        {!isLoading && years.length === 0 && (
          <p className="font-mono text-sm text-text-faint py-16">No archived stories yet.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {years.map((y) => (
            <Link
              key={y.period}
              href={`/archive/${y.period}`}
              className="card-enter glass rounded-xl p-6 hover:-translate-y-1 transition-transform duration-300"
            >
              <span className="font-display text-3xl font-semibold text-accent-amber block mb-1">
                {y.period}
              </span>
              <span className="font-mono text-xs text-text-faint">
                {y.article_count} {y.article_count === 1 ? 'story' : 'stories'}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
