'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export interface Director {
  id: string;
  name?: string;
  image: string;
  objectPosition?: string;
}

export const defaultDirectors: Director[] = [
  {
    id: 'd-1',
    name: 'Ar. Mohamed Aslam P K',
    image: '/images/image1.webp',
    objectPosition: 'center 20%',
  },
  {
    id: 'd-2',
    name: 'Ar. Mahir Aalam P',
    image: '/images/image2.webp',
    objectPosition: 'center 15%',
  },
  {
    id: 'd-3',
    name: 'Ar. Mohamed Naseem P K',
    image: '/images/image3.webp',
    objectPosition: 'center 15%',
  },
  {
    id: 'd-4',
    name: 'Ar. Nihad Mohamed Ali',
    image: '/value_people.webp',
    objectPosition: 'center 25%',
  },
  {
    id: 'd-5',
    name: 'Ar. Razeen Jawad',
    image: '/founder.webp',
    objectPosition: 'center 20%',
  },
  {
    id: 'd-6',
    name: 'Ar. Jamsheer',
    image: '/images/image4.webp',
    objectPosition: 'center 15%',
  },
];

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

interface DirectorsSectionProps {
  directors?: Director[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function DirectorsSection({
  directors = defaultDirectors,
}: DirectorsSectionProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const totalCards = directors.length;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getScrollAmount = () => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector('.director-card-container') as HTMLElement;
      if (firstCard) {
        return firstCard.offsetWidth + 20;
      }
    }
    return 340;
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      const scrollAmt = getScrollAmount();
      carouselRef.current.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
    }
    setCurrentSlideIndex((prev) => (prev <= 0 ? totalCards - 1 : prev - 1));
  };

  const handleNext = () => {
    if (carouselRef.current) {
      const scrollAmt = getScrollAmount();
      carouselRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
    setCurrentSlideIndex((prev) => (prev >= totalCards - 1 ? 0 : prev + 1));
  };

  // Sync index on manual touch scroll
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollAmt = getScrollAmount();
      if (scrollAmt > 0) {
        const index = Math.round(el.scrollLeft / scrollAmt);
        setCurrentSlideIndex(Math.min(Math.max(0, index), totalCards - 1));
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [totalCards]);

  return (
    <section
      id="directors-section"
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: isMobile ? '20px 20px 40px' : '28px clamp(24px, 5vw, 64px) 50px',
        color: '#111111',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      aria-label="Portrait Display Wall"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Pure Portrait Display Wall Track (No Headings, No Names) */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div
            ref={carouselRef}
            className="directors-track"
            style={{
              display: 'flex',
              gap: isMobile ? '16px' : '20px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              padding: isMobile ? '4px 0 16px 0' : '6px 0 20px 0',
              boxSizing: 'border-box',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {directors.map((director, idx) => (
              <div
                key={director.id || idx}
                className="director-card-container"
                style={{
                  position: 'relative',
                  flex: isMobile ? '0 0 80vw' : '0 0 clamp(280px, calc((100% - 60px) / 4), 360px)',
                  height: isMobile ? '420px' : 'clamp(440px, 52vh, 480px)',
                  borderRadius: '0px',
                  backgroundColor: '#111111',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* Full-bleed Portrait Photo */}
                <Image
                  src={director.image}
                  alt={director.name ? `${director.name} - Leadership Director at Attiks Architecture` : 'Attiks Architecture Leadership Director portrait'}
                  fill
                  sizes="(max-width: 768px) 85vw, (max-width: 1200px) 30vw, 25vw"
                  style={{
                    objectFit: 'cover',
                    objectPosition: director.objectPosition || 'center 20%',
                    borderRadius: '0px',
                    transform: 'scale(1)',
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Left Navigation Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginTop: isMobile ? '16px' : '20px',
            paddingTop: '4px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
            <ArrowBtn onClick={handlePrev} direction="prev" label="Previous item" />
            <span
              style={{
                fontSize: 'clamp(16px, 1vw, 18px)',
                color: '#444444',
                letterSpacing: '0.04em',
                minWidth: '56px',
                textAlign: 'center',
                fontFamily: 'var(--font-primary)',
                fontWeight: 400,
              }}
            >
              {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
            </span>
            <ArrowBtn onClick={handleNext} direction="next" label="Next item" />
          </div>
        </div>
      </div>


      <style jsx>{`
        .directors-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
