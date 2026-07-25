'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchArticleById } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Masthead from '@/components/Masthead';

export default function ArticlePage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticleById(id),
    enabled: !!id,
  });

  return (
    <>
      <Masthead />

      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <Link
          href="/"
          className="sweep-link font-mono text-xs text-accent-amber inline-block mb-8"
        >
          ← Back to feed
        </Link>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <span className="pulse-dot" />
            <p className="font-mono text-sm text-text-muted">Loading story...</p>
          </div>
        )}

        {isError && (
          <p className="font-mono text-sm text-red-400 py-16">
            Story not found. It may have been removed.
          </p>
        )}

        {article && (
          <article className="card-enter">
            <span className="font-mono text-[10px] tracking-widest uppercase text-accent-amber">
              {article.source}
              {article.category && ` · ${article.category}`}
            </span>

            <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight mt-4 mb-4">
              {article.title}
            </h1>

            <time className="font-mono text-xs text-text-faint block mb-8">
              {new Date(article.published_at).toLocaleDateString('en-NG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>

            <p className="font-sans text-lg leading-relaxed text-text-primary mb-10">
              {article.excerpt}
            </p>

            
              <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex items-center gap-2 px-5 py-3 rounded-full font-mono text-sm text-accent-amber hover:bg-[var(--accent-amber-dim)] transition-colors"
            >
              Read full story on {article.source} →
            </a>
          </article>
        )}
      </main>
    </>
  );
}
