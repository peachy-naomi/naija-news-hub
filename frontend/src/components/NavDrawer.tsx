'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';

function TrendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 3" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={'w-3.5 h-3.5 transition-transform ' + (open ? 'rotate-180' : '')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const categories = data?.categories ?? [];

  const close = () => {
    setOpen(false);
    setCategoriesOpen(false);
  };

  const scrollToPopular = (e: React.MouseEvent) => {
    e.preventDefault();
    close();
    const el = document.getElementById('popular');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#popular';
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="glass w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--bg-elevated)] border-l border-[var(--surface-glass-border)] p-6 card-enter overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-lg font-semibold">Explore</span>
              <button
                onClick={close}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--surface-glass-border)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              <a
                href="/#popular"
                onClick={scrollToPopular}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm text-text-muted hover:text-text-primary hover:bg-[var(--surface-glass-border)] transition-colors"
              >
                <span className="text-accent-amber"><TrendIcon /></span>
                Popular Posts
              </a>

              <div>
                <button
                  onClick={() => setCategoriesOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-sans text-sm text-text-muted hover:text-text-primary hover:bg-[var(--surface-glass-border)] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-accent-amber"><GridIcon /></span>
                    Categories
                  </span>
                  <ChevronIcon open={categoriesOpen} />
                </button>

                {categoriesOpen && (
                  <div className="pl-10 pr-2 py-1 space-y-0.5">
                    <Link
                      href="/category"
                      onClick={close}
                      className="block px-2 py-2 rounded-lg font-sans text-sm text-text-primary hover:bg-[var(--surface-glass-border)] transition-colors"
                    >
                      All Categories
                    </Link>
                    {categories.length === 0 && (
                      <p className="px-2 py-2 font-mono text-xs text-text-faint">
                        Coming soon
                      </p>
                    )}
                    {categories.map((cat) => (
                      <Link
                        key={cat.category}
                        href={`/category/${encodeURIComponent(cat.category)}`}
                        onClick={close}
                        className="flex items-center justify-between px-2 py-2 rounded-lg font-sans text-sm text-text-muted hover:text-text-primary hover:bg-[var(--surface-glass-border)] transition-colors"
                      >
                        <span>{cat.category}</span>
                        <span className="font-mono text-xs text-text-faint">{cat.article_count}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/archive"
                onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm text-text-muted hover:text-text-primary hover:bg-[var(--surface-glass-border)] transition-colors"
              >
                <span className="text-accent-amber"><ClockIcon /></span>
                Archive
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
