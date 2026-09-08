import Link from 'next/link';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: '404 - Page Not Found | Attiks Architecture',
  description: 'The architectural page or project you are looking for could not be found. Explore our portfolio of bespoke architecture projects.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#0d0f12] text-[#f4f4f6] px-6 py-24">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono tracking-widest text-[#d4af37] uppercase">
          404 Error • Architecture Not Found
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-tight text-white">
          Structure Not Located
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 font-light max-w-lg mx-auto leading-relaxed">
          The space you were seeking has been moved, reconfigured, or does not exist in our current portfolio directory.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#d4af37] text-black font-medium text-sm transition-all duration-300 hover:bg-[#e5c158] hover:shadow-lg hover:shadow-[#d4af37]/20"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Return to Sanctuary (Home)</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/20 bg-white/5 text-neutral-200 font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Explore Projects</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
