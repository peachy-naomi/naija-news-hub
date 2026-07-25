'use client';

const SOURCES = ['Punch', 'Vanguard', 'Premium Times', 'Daily Post', 'PM News'];

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeSource: string | null;
  onSourceChange: (source: string | null) => void;
}

export default function SearchBar({
  search,
  onSearchChange,
  activeSource,
  onSourceChange,
}: SearchBarProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search headlines..."
          className="glass w-full rounded-full pl-11 pr-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-[var(--accent-amber)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onSourceChange(null)}
          className={
            'font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ' +
            (activeSource === null
              ? 'bg-[var(--accent-amber)] text-[var(--bg)] border-[var(--accent-amber)]'
              : 'glass text-text-muted border-[var(--surface-glass-border)] hover:text-text-primary')
          }
        >
          All
        </button>
        {SOURCES.map((s) => (
          <button
            key={s}
            onClick={() => onSourceChange(s)}
            className={
              'font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ' +
              (activeSource === s
                ? 'bg-[var(--accent-amber)] text-[var(--bg)] border-[var(--accent-amber)]'
                : 'glass text-text-muted border-[var(--surface-glass-border)] hover:text-text-primary')
            }
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
