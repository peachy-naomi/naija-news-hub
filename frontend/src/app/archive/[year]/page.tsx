'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchArchivePeriods } from '@/lib/api';
import { useParams } from 'next/navigation';
import Masthead from '@/components/Masthead';
import Link from 'next/link';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ArchiveYearPage() {
  const params = useParams();
  const year = Number(params.year);

  const { data, isLoading } = useQuery({
    queryKey: ['archive', 'month', year],
    queryFn: () => fetchArchivePeriods('month', year),
    enabled: !!year,
  });

  const months = data?.periods ?? [];

  return (
    <>
      <Masthead />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
        <Link href="/archive" className="sweep-link font-mono text-xs text-accent-amber inline-block mb-6">
          ← All years
        </Link>

        <h1 className="font-display text-3xl font-semibold mb-8">{year}</h1>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <span className="pulse-dot" />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {months.map((m) => (
            <Link
              key={m.period}
              href={`/archive/${year}/${m.period}`}
              className="card-enter glass rounded-xl p-6 hover:-translate-y-1 transition-transform duration-300"
            >
              <span className="font-display text-xl font-semibold block mb-1">
                {MONTH_NAMES[m.period]}
              </span>
              <span className="font-mono text-xs text-text-faint">
                {m.article_count} {m.article_count === 1 ? 'story' : 'stories'}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

