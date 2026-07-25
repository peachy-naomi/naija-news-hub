'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api';
import Masthead from '@/components/Masthead';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, string> = {
  Politics: '🏛️',
  Sports: '⚽',
  Business: '💼',
  Entertainment: '🎬',
  Technology: '💻',
  Health: '🩺',
  Crime: '🚨',
  World: '🌍',
};

export default function CategoryIndexPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const categories = data?.categories ?? [];

  return (
    <>
      <Masthead />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-2">Categories</h1>
        <p className="font-sans text-text-muted mb-8">
          Browse stories organized by topic.
        </p>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <span className="pulse-dot" />
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <p className="font-mono text-sm text-text-faint py-16">
            Categorization is still in progress — check back shortly.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              href={`/category/${encodeURIComponent(cat.category)}`}
              className="card-enter glass rounded-xl p-6 hover:-translate-y-1 transition-transform duration-300"
            >
              <span className="text-2xl block mb-2">
                {CATEGORY_ICONS[cat.category] || '📰'}
              </span>
              <span className="font-display text-lg font-semibold block mb-1">
                {cat.category}
              </span>
              <span className="font-mono text-xs text-text-faint">
                {cat.article_count} {cat.article_count === 1 ? 'story' : 'stories'}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
