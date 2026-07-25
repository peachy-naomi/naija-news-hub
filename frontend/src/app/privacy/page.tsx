import Masthead from '@/components/Masthead';

export default function PrivacyPage() {
  return (
    <>
      <Masthead />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-6">Privacy Policy</h1>
        <div className="font-sans text-text-primary space-y-4 leading-relaxed text-sm">
          <p className="text-text-faint font-mono text-xs">Last updated: July 2026</p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Information We Collect</h2>
          <p>
            Naija News Hub does not require account creation and does not collect personal
            information from visitors browsing the site. If you use our contact form, we
            collect only the name, email address, and message you provide, solely to
            respond to your inquiry.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Aggregated Content</h2>
          <p>
            The headlines and excerpts displayed on this site are aggregated from publicly
            available RSS feeds of third-party news publishers. We do not control, and are
            not responsible for, the privacy practices of the original publishers linked
            from this site.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Cookies &amp; Analytics</h2>
          <p>
            We may use basic, privacy-respecting analytics to understand overall site usage
            (such as which stories are most read) in order to improve the service. This
            data is not used to personally identify visitors.
          </p>

          <h2 className="font-display text-lg font-semibold text-text-primary mt-6">Contact</h2>
          <p>
            Questions about this policy can be sent via our{' '}
            <a href="/contact" className="sweep-link text-accent-amber">contact page</a>.
          </p>
        </div>
      </main>
    </>
  );
}
