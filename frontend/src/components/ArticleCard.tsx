import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/api';

const SOURCE_COLORS: Record<string, string> = {
  Punch: '#f2a94e',
  Vanguard: '#1b7a64',
  'Premium Times': '#c9738a',
  'Daily Post': '#6b8fc7',
  'PM News': '#a58ad6',
};

export default function ArticleCard({ article, index }: { article: Article; index: number }) {
  const accent = SOURCE_COLORS[article.source] || '#f2a94e';
  const dateStr = new Date(article.published_at).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Link
      href={'/article/' + article.id}
      className="card-enter group glass rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
      style={{
        animationDelay: ((index % 12) * 60) + 'ms',
        borderColor: 'var(--surface-glass-border)',
      }}
    >
      <div className="relative w-full h-40 bg-[var(--bg-elevated)] overflow-hidden">
        {article.image_url ? (
        <Image
            src={article.image_url}
            alt={article.title}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}22, transparent)`,
            }}
          >
            <span className="font-display text-2xl font-semibold opacity-20">
              {article.source}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-full"
            style={{
              color: accent,
              backgroundColor: accent + '1a',
              border: '1px solid ' + accent + '40',
            }}
          >
            {article.source}
          </span>
          <span className="font-mono text-[10px] text-text-faint">
            {dateStr}
          </span>
        </div>

        <h2 className="font-display text-lg font-semibold leading-snug mb-2 line-clamp-3 group-hover:text-accent-amber transition-colors">
          {article.title}
        </h2>

        <p className="font-sans text-sm text-text-muted line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        <span className="sweep-link font-mono text-xs text-accent-amber mt-4 self-start">
          Read story →
        </span>
      </div>
    </Link>
  );
}
