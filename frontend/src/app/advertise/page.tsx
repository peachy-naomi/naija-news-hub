import Masthead from '@/components/Masthead';

export default function AdvertisePage() {
  return (
    <>
      <Masthead />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-6">Advertise With Us</h1>
        <div className="font-sans text-text-primary space-y-4 leading-relaxed">
          <p>
            Naija News Hub reaches readers actively looking for the latest Nigerian news
            across politics, sports, business, entertainment, and more.
          </p>
          <p>
            If you&apos;re interested in advertising, sponsorships, or partnership
            opportunities, please reach out through our{' '}
            <a href="/contact" className="sweep-link text-accent-amber">
              contact page
            </a>{' '}
            with details about your brand and goals, and we&apos;ll get back to you.
          </p>
        </div>
      </main>
    </>
  );
}
