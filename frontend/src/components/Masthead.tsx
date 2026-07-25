'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSources } from '@/lib/api';
import ThemeToggle from './ThemeToggle';
import NavDrawer from './NavDrawer';
import MoreMenu from './MoreMenu';
import { useScrolled } from '@/lib/useScrolled';
import Link from 'next/link';

export default function Masthead() {
  const scrolled = useScrolled(20);

  const { data } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    refetchInterval: 60000,
  });

  const total = data?.sources.reduce((sum, s) => sum + s.article_count, 0) ?? 0;
  const sourceCount = data?.sources.length ?? 0;

  return (
    <header
      className={
        'sticky top-0 z-50 transition-colors duration-300 ' +
        (scrolled
          ? 'bg-[var(--bg)] border-b border-[var(--surface-glass-border)] shadow-[0_2px_20px_rgba(0,0,0,0.15)]'
          : 'glass')
      }
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-y-2">
        <Link href="/" className="flex items-center gap-3">
          <span className="pulse-dot" />
          <span className="font-mono text-xs tracking-widest uppercase text-text-muted">
            Live
          </span>
          <span className="font-display text-xl font-semibold ml-1">
            Naija News Hub
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:block font-mono text-xs text-text-muted hover:text-accent-amber transition-colors mr-1"
          >
            Home
          </Link>
          <div className="hidden md:flex items-center gap-5 font-mono text-xs text-text-muted mr-2">
            <span>
              <span className="text-accent-amber font-semibold">{total}</span> stories
            </span>
            <span className="hidden sm:inline">
              <span className="text-accent-amber font-semibold">{sourceCount}</span> sources
            </span>
          </div>

          <ThemeToggle />
          <MoreMenu />
          <NavDrawer />
        </div>
      </div>
    </header>
  );
}
