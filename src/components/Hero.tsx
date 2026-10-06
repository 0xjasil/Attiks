'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HeroSlide, HeroSettings, defaultHeroSlides, defaultHeroSettings } from '@/data/hero';

interface HeroProps {
  slides?: HeroSlide[];
  settings?: HeroSettings;
  videos?: { id: string; src: string; poster?: string }[];
  projects?: any;
}

export default function Hero({
  slides,
  settings = defaultHeroSettings,
  videos,
}: HeroProps) {
  // Normalize slide list from slides prop or legacy videos prop or defaultHeroSlides
  const slideList: HeroSlide[] =
    slides && slides.length > 0
      ? slides
      : videos && videos.length > 0
      ? videos.map((v, i) => ({
          id: v.id,
          mediaType: 'video',
          mediaUrl: v.src,
          posterUrl: v.poster,
          order: i + 1,
          active: true,
          ctaText: settings.defaultCtaText || 'view projects',
          ctaLink: settings.defaultCtaLink || '/projects',
        }))
      : defaultHeroSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Safe index within bounds
  const safeIndex = currentIndex >= slideList.length ? 0 : currentIndex;
  const activeSlide = slideList[safeIndex] || slideList[0];
  const autoPlayInterval = settings.autoPlayInterval || 6500;

  // Manage optimized playback: play active video and pause inactive videos smoothly
  useEffect(() => {
    slideList.forEach((slide, idx) => {
      const vid = videoRefs.current[idx];
      if (!vid) return;

      if (idx === safeIndex) {
        vid.play().catch(() => {});
      } else {
        // Pause inactive videos slightly after transition to ensure seamless cross-dissolve
        const timeout = setTimeout(() => {
          if (idx !== safeIndex) {
            vid.pause();
          }
        }, 1200);
        return () => clearTimeout(timeout);
      }
    });
  }, [safeIndex, slideList]);

  // Automatically advance to next slide
  useEffect(() => {
    if (slideList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, slideList.length, autoPlayInterval]);

  const handleVideoEnded = useCallback(() => {
    if (slideList.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }
  }, [slideList.length]);

  const ctaText = activeSlide.ctaText || settings.defaultCtaText || 'view projects';
  const ctaLink = activeSlide.ctaLink || settings.defaultCtaLink || '/projects';

  return (
    <section
      className="hero-container-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        margin: 0,
        padding: '0 clamp(20px, 5vw, 64px) clamp(36px, 6vh, 64px)',
        overflow: 'hidden',
        background: '#050505',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      }}
      aria-label="Hero Architectural Media Showcase"
    >
      {/* Background Fullscreen Stacked Media Switcher with 60FPS GPU Hardware Accelerated Crossfade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 1,
          backgroundColor: '#050505',
        }}
      >
        {slideList.map((slide, idx) => {
          const isActive = idx === safeIndex;
          const isVideo =
            slide.mediaType === 'video' ||
            /\.(mp4|webm|mov|mkv)$/i.test(slide.mediaUrl);

          return (
            <div
              key={slide.id || idx}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1) translate3d(0, 0, 0)' : 'scale(1.04) translate3d(0, 0, 0)',
                transformOrigin: 'center center',
                transition: 'opacity 1.1s cubic-bezier(0.25, 1, 0.5, 1), transform 6.5s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'opacity, transform',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: isActive ? 2 : 1,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {isVideo ? (
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  autoPlay={idx === 0}
                  muted
                  playsInline
                  loop
                  preload={idx === 0 ? 'auto' : 'metadata'}
                  poster={slide.posterUrl}
                  onEnded={handleVideoEnded}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.92) contrast(1.05)',
                  }}
                >
                  <source src={slide.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={slide.mediaUrl}
                  alt={slide.altText || slide.title || 'Architectural project scene by Attiks Architecture'}
                  fill
                  priority={idx === 0}
                  unoptimized={/\.gif$/i.test(slide.mediaUrl) || slide.mediaUrl.includes('.gif')}
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                    filter: 'brightness(0.92) contrast(1.05)',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Cinematic Vignette & Gradient Overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.8) 100%)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(0,0,0,0.5) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </div>

      {/* ============================================================
          BOTTOM-LEFT: MINIMAL CTA & OPTIONAL TITLE
          ============================================================ */}
      {settings.showCta !== false && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Link
            href={ctaLink}
            className="hero-cta-minimal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 'clamp(20px, 1.55vw, 26px)',
              fontWeight: 350,
              fontFamily: 'var(--font-primary)',
              letterSpacing: '-0.01em',
              textTransform: 'lowercase',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
              transition: 'opacity 0.25s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.opacity = '0.75';
              const svg = el.querySelector('svg');
              if (svg) svg.style.transform = 'translateX(6px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.opacity = '1';
              const svg = el.querySelector('svg');
              if (svg) svg.style.transform = 'translateX(0)';
            }}
          >
            <span>{ctaText}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="14 6 20 12 14 18" />
            </svg>
          </Link>
        </motion.div>
      )}

      {/* ============================================================
          RIGHT SIDE VERTICAL PAGINATION PILL (HIDDEN ON SMALL SCREENS)
          ============================================================ */}
      {settings.showPagination !== false && slideList.length > 1 && (
        <div
          className="hero-pagination-pill"
          style={{
            position: 'absolute',
            right: 'clamp(16px, 3vw, 40px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(25, 25, 25, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            padding: '12px 6px',
            borderRadius: '9999px',
            zIndex: 20,
            display: isMobile ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '9px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          }}
        >
          {slideList.map((slide, idx) => (
            <button
              key={slide.id + idx}
              type="button"
              className={`hero-dot${idx === safeIndex ? ' active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Switch to scene ${idx + 1}`}
              style={{
                background: idx === safeIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                width: '6px',
                height: idx === safeIndex ? '20px' : '6px',
                borderRadius: '9999px',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hero-pagination-pill {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
