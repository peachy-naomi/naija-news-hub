'use client';

import { useState } from 'react';
import Masthead from '@/components/Masthead';
import { submitContactForm } from '@/lib/api';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitContactForm({ name, email, message });
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Masthead />
      <main className="max-w-lg mx-auto px-4 py-12 flex-1 w-full">
        <h1 className="font-display text-3xl font-semibold mb-2">Contact Us</h1>
        <p className="font-sans text-text-muted mb-8">
          Questions, feedback, or partnership inquiries — send us a message.
        </p>

        {status === 'success' ? (
          <div className="glass rounded-xl p-6 text-center card-enter">
            <p className="font-display text-lg font-semibold text-accent-amber mb-2">
              Message sent!
            </p>
            <p className="font-sans text-sm text-text-muted">
              Thanks for reaching out — we&apos;ll get back to you soon.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="sweep-link font-mono text-xs text-accent-amber mt-4 inline-block"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-text-faint block mb-2">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass w-full rounded-lg px-4 py-3 font-sans text-sm text-text-primary outline-none focus:border-[var(--accent-amber)] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-text-faint block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass w-full rounded-lg px-4 py-3 font-sans text-sm text-text-primary outline-none focus:border-[var(--accent-amber)] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-text-faint block mb-2">Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="glass w-full rounded-lg px-4 py-3 font-sans text-sm text-text-primary outline-none focus:border-[var(--accent-amber)] transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="font-mono text-xs text-red-400">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-[var(--accent-amber)] text-[var(--bg)] font-mono text-sm font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
