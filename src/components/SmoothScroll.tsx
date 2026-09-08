'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    let lenisInstance: any = null;
    let isCancelled = false;

    // Dynamically import lenis on client side without blocking initial page render
    import('lenis')
      .then(({ default: Lenis }) => {
        if (isCancelled) return;
        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        (window as any).__lenis = lenisInstance;

        function raf(time: number) {
          if (lenisInstance) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
          }
        }
        requestAnimationFrame(raf);
      })
      .catch(() => {
        // Fallback gracefully to browser native smooth scroll
        document.documentElement.style.scrollBehavior = 'smooth';
      });

    return () => {
      isCancelled = true;
      if (lenisInstance) {
        lenisInstance.destroy();
        (window as any).__lenis = null;
      }
    };
  }, []);

  return null;
}
