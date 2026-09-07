'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Award, awardsData } from '@/data/awards';

function ArrowBtn({ onClick, direction, label }: { onClick: () => void; direction: 'prev' | 'next'; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '1.5px solid #000000',
        background: hovered ? '#000000' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.25s ease, border-color 0.25s ease',
        flexShrink: 0,
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 18 18"
        fill="none"
        stroke={hovered ? '#ffffff' : '#000000'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 0.25s ease' }}
      >
        {direction === 'prev'
          ? <path d="M11 4 L6 9 L11 14" />
          : <path d="M7 4 L12 9 L7 14" />
        }
      </svg>
    </button>
  );
}

function AwardCardItem({ award, isMobile }: { award: Award; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="article"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: isMobile ? '16 / 11' : '16 / 10.5',
        borderRadius: '0px',
        overflow: 'hidden',
        background: '#151515',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={award.image}
        alt={`${award.title} - ${award.organization} (${award.year}) architectural recognition`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        style={{
          objectFit: 'cover',
          display: 'block',
          borderRadius: '0px',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Bottom Gradient for Legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)',
          pointerEvents: 'none',
          opacity: 1,
        }}
      />

      {/* Bottom-Left Minimal Typography */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: isMobile ? '16px 18px' : 'clamp(16px, 2.5vw, 24px)',
          zIndex: 5,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: 'clamp(14px, 0.9vw, 16px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            margin: 0,
            fontFamily: 'var(--font-primary)',
            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
          }}
        >
          {award.organization} &bull; {award.year}
        </p>
        <h3
          className="font-display"
          style={{
            color: '#ffffff',
            fontSize: isMobile ? '1.2rem' : 'clamp(1.2rem, 1.45vw, 1.55rem)',
            fontWeight: 400,
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            textShadow: '0 2px 10px rgba(0,0,0,0.7)',
            textTransform: 'none',
          }}
        >
          {award.title}
        </h3>
      </div>
    </div>
  );
}

export default function AwardsSection({ awards = awardsData }: { awards?: Award[] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build slides: 1 card per slide on Mobile, 3 cards per slide on Desktop (exact matching grid)
  const slides: Award[][] = [];
  if (isMobile) {
    for (let i = 0; i < awards.length; i++) {
      slides.push([awards[i]]);
    }
  } else {
    for (let i = 0; i < awards.length; i += 3) {
      const chunk = awards.slice(i, i + 3);
      if (chunk.length < 3 && slides.length > 0) {
        // Pad with first items if needed for perfect 3-column layout
        while (chunk.length < 3) {
          chunk.push(awards[chunk.length % awards.length]);
        }
      }
      slides.push(chunk);
    }
  }

  const totalSlides = slides.length || 1;

  useEffect(() => {
    if (currentSlideIndex >= totalSlides) {
      setCurrentSlideIndex(0);
    }
  }, [totalSlides, currentSlideIndex]);

  // 100% MANUAL SLIDE ONLY — NO AUTOPLAY
  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const currentPair = slides[currentSlideIndex] || [awards[0]];

  return (
    <section
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: isMobile ? '30px 20px 50px' : '40px clamp(24px, 5vw, 64px) 80px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
      aria-label="Awards & Recognition Display Wall"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {/* Exact Matching Grid Layout (3 cards on desktop, 1 on mobile) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSlideIndex}-${isMobile ? 'm' : 'd'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '16px' : '20px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {currentPair.map((award, idx) => (
              <AwardCardItem
                key={`${award.id}-${idx}`}
                award={award}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Controls Row: Manual Arrows & Slide Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginTop: isMobile ? '20px' : '28px',
            paddingTop: '8px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '12px' : '16px',
            }}
          >
            <ArrowBtn onClick={handlePrev} direction="prev" label="Previous awards" />
            <span
              style={{
                fontSize: 'clamp(16px, 1.1vw, 18px)',
                color: '#444444',
                letterSpacing: '0.04em',
                minWidth: '64px',
                textAlign: 'center',
                fontWeight: 400,
              }}
            >
              {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>
            <ArrowBtn onClick={handleNext} direction="next" label="Next awards" />
          </div>
        </div>
      </div>
    </section>
  );
}
