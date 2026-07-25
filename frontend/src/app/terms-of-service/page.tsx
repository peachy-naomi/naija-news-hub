import Masthead from '@/components/Masthead';

export default function TermsOfServicePage() {
  return (
    <>
      <Masthead />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-6">Terms of Service</h1>
        <div className="font-sans text-text-primary space-y-4 leading-relaxed text-sm">
          <p className="text-text-faint font-mono text-xs">Last updated: July 2026</p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Service Availability</h2>
          <p>
            Naija News Hub aggregates content automatically on a schedule and strives for
            continuous availability, but does not guarantee uninterrupted access. The
            service may be temporarily unavailable for maintenance or due to circumstances
            beyond our control.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Acceptable Use</h2>
          <p>
            You agree not to attempt to disrupt, overload, or reverse-engineer the site or
            its underlying systems, and not to use automated tools to scrape or republish
            content from this site without permission.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Third-Party Links</h2>
          <p>
            This site links to external news publishers. We are not responsible for the
            content, availability, or practices of those third-party sites.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Limitation of Liability</h2>
          <p>
            Naija News Hub is provided free of charge and without warranty. We are not
            liable for any damages arising from use of, or inability to use, this service.
          </p>
        </div>
      </main>
    </>
  );
}
