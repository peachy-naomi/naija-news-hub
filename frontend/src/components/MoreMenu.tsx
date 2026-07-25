'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/advertise', label: 'Advertise' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

export default function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="More"
        className="glass w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-52 bg-[var(--bg-elevated)] border border-[var(--surface-glass-border)] shadow-[0_8px_30px_rgba(0,0,0,0.25)] rounded-xl p-2 card-enter z-50 ">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg font-sans text-sm text-text-muted hover:text-text-primary hover:bg-[var(--surface-glass-border)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
