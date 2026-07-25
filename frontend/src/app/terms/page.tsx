import Masthead from '@/components/Masthead';

export default function TermsPage() {
  return (
    <>
      <Masthead />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-6">Terms &amp; Conditions</h1>
        <div className="font-sans text-text-primary space-y-4 leading-relaxed text-sm">
          <p className="text-text-faint font-mono text-xs">Last updated: July 2026</p>

          <p>
            By accessing Naija News Hub, you agree to use the site for lawful,
            personal, non-commercial purposes only.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Content Ownership</h2>
          <p>
            All article content, images, and headlines displayed on this site remain the
            property of their respective original publishers (Punch, Vanguard, Premium
            Times, Daily Post, PM News). We display only headlines, short excerpts, and
            links back to the original source — we do not claim ownership of this content.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">No Warranty</h2>
          <p>
            Content is aggregated automatically and provided &quot;as is&quot;, without warranty
            of accuracy, completeness, or timeliness. Always refer to the original
            publisher&apos;s article for authoritative information.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Changes</h2>
          <p>
            These terms may be updated from time to time. Continued use of the site after
            changes constitutes acceptance of the revised terms.
          </p>
        </div>
      </main>
    </>
  );
}
