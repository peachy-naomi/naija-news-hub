import Masthead from '@/components/Masthead';

export default function AboutPage() {
  return (
    <>
      <Masthead />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-6">About Naija News Hub</h1>
        <div className="font-sans text-text-primary space-y-4 leading-relaxed">
          <p>
            Naija News Hub is a live news aggregator that brings together headlines from
            trusted Nigerian publishers — Punch, Vanguard, Premium Times, Daily Post, and
            PM News — in one continuously updated feed.
          </p>
          <p>
            Our system checks each source every 10 minutes, so you always see the latest
            stories as they&apos;re published, without needing to visit five different sites.
            Every story links directly back to the original publisher, where you can read
            the full article.
          </p>
          <p>
            We don&apos;t rewrite, republish, or claim ownership of any article content — we
            simply organize public headlines and excerpts to help you discover what&apos;s
            happening across Nigeria&apos;s news landscape more easily.
          </p>
        </div>
      </main>
    </>
  );
}
