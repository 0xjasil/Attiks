import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Home, Compass } from 'lucide-react';

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
            <Home className="w-4 h-4" />
            <span>Return to Sanctuary (Home)</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/20 bg-white/5 text-neutral-200 font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Projects</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
