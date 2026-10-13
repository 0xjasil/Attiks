'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { AboutPageData, defaultAboutData } from '@/data/about';

interface AboutClientPageProps {
  initialData?: AboutPageData;
}

export default function AboutClientPage({ initialData }: AboutClientPageProps) {
  const data = initialData || defaultAboutData;
  const hero = data.hero || defaultAboutData.hero;
  const philosophy = data.philosophy || defaultAboutData.philosophy;
  const foundation = data.foundation || defaultAboutData.foundation;
  const team = data.team || defaultAboutData.team;

  return (
    <div
      style={{
        background: '#ffffff',
        minHeight: '100vh',
        color: '#111111',
        fontFamily: 'var(--font-primary)',
      }}
    >
      <Navbar />

      <main>
        {/* 1. Hero Section: Full-width hero banner completely filled without left/right spacing */}
        <section
          style={{
            width: '100%',
            padding: 'clamp(84px, 6vw, 100px) 0 0',
            boxSizing: 'border-box',
            marginBottom: 'clamp(40px, 5vw, 64px)',
          }}
          aria-label="Studio Team Hero"
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              minHeight: '400px',
              backgroundColor: '#151515',
              overflow: 'hidden',
            }}
          >
            <Image
              src={hero.bannerImage || defaultAboutData.hero.bannerImage}
              alt={hero.bannerAlt || defaultAboutData.hero.bannerAlt}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              quality={95}
              priority
            />
          </div>
        </section>

        {/* 2. Philosophy & History Section */}
        <section
          style={{
            width: '100%',
            padding: '0 clamp(20px, 5vw, 64px)',
            boxSizing: 'border-box',
            marginBottom: 'clamp(48px, 6vw, 80px)',
          }}
          aria-label="Philosophy and History"
        >
          <div
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
              gap: 'clamp(36px, 5vw, 72px)',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Descriptive Story Text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(18px, 2.2vw, 24px)',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(16px, 1.15vw, 19px)',
                  lineHeight: 1.55,
                  color: '#1a1a1a',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  margin: 0,
                  fontFamily: 'var(--font-primary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {philosophy.paragraph1}
              </p>

              {philosophy.paragraph2 && (
                <p
                  style={{
                    fontSize: 'clamp(14.5px, 1vw, 16.5px)',
                    lineHeight: 1.6,
                    color: '#555555',
                    fontWeight: 350,
                    letterSpacing: '-0.005em',
                    margin: 0,
                    fontFamily: 'var(--font-primary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {philosophy.paragraph2}
                </p>
              )}
            </div>

            {/* Right Column: Partners Group Image */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                minHeight: '260px',
                backgroundColor: '#151515',
                overflow: 'hidden',
              }}
            >
              <Image
                src={philosophy.image || defaultAboutData.philosophy.image}
                alt={philosophy.imageAlt || defaultAboutData.philosophy.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>
          </div>
        </section>

        {/* 3. The Foundation (Directors) */}
        <section
          style={{
            width: '100%',
            padding: '0 clamp(20px, 5vw, 64px)',
            boxSizing: 'border-box',
            marginBottom: 'clamp(48px, 6vw, 80px)',
          }}
          aria-label={foundation.sectionTitle || 'The Foundation'}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'clamp(24px, 3.2vw, 40px)' }}>
              <h2
                className="font-display"
                style={{
                  fontFamily: 'var(--font-canela), Georgia, serif',
                  fontSize: 'clamp(2.2rem, 3.6vw, 3.2rem)',
                  fontWeight: 300,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                }}
              >
                {foundation.sectionTitle || 'The Foundation'}
              </h2>
            </div>

            {/* 4-Column Grid for Directors */}
            <div
              className="leadership-grid"
              style={{
                display: 'grid',
                gap: 'clamp(24px, 3vw, 44px) clamp(16px, 2.2vw, 32px)',
              }}
            >
              {(foundation.directors || []).map((partner, idx) => (
                <div
                  key={partner.id || partner.name || `dir-${idx}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Portrait Container with 0px border-radius */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 4.8',
                      backgroundColor: '#f5f5f5',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={partner.image || '/images/about/team_placeholder.webp'}
                      alt={`${partner.name} - ${partner.role} at Attiks Architecture`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      quality={95}
                      style={{
                        objectFit: 'cover',
                        filter: 'grayscale(100%)',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.filter = 'grayscale(0%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.filter = 'grayscale(100%)';
                      }}
                    />
                  </div>

                  {/* Partner Details */}
                  <div>
                    <h3
                      style={{
                        fontSize: 'clamp(16px, 1.1vw, 18px)',
                        fontWeight: 600,
                        color: '#000000',
                        margin: 0,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                        fontFamily: 'var(--font-primary)',
                      }}
                    >
                      {partner.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 'clamp(13px, 0.85vw, 14.5px)',
                        color: '#555555',
                        margin: '4px 0 0 0',
                        fontWeight: 400,
                        letterSpacing: '-0.005em',
                        lineHeight: 1.35,
                        fontFamily: 'var(--font-primary)',
                      }}
                    >
                      {partner.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. The Team Section (People of Attiks) */}
        <section
          style={{
            width: '100%',
            padding: '0 clamp(20px, 5vw, 64px)',
            boxSizing: 'border-box',
            marginBottom: 'clamp(60px, 8vw, 100px)',
          }}
          aria-label={team.sectionTitle || 'The Team'}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'clamp(24px, 3.2vw, 40px)' }}>
              <h2
                className="font-display"
                style={{
                  fontFamily: 'var(--font-canela), Georgia, serif',
                  fontSize: 'clamp(2.2rem, 3.6vw, 3.2rem)',
                  fontWeight: 300,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                }}
              >
                {team.sectionTitle || 'People of Attiks'}
              </h2>
            </div>

            {/* Team Members Grid (1 Row of 4) */}
            <div
              className="team-grid"
              style={{
                display: 'grid',
                gap: 'clamp(14px, 1.8vw, 24px) clamp(12px, 1.5vw, 18px)',
              }}
            >
              {(team.members || []).map((member, index) => (
                <div
                  key={member.id || `member-${index}`}
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#e6e6e6',
                    overflow: 'hidden',
                  }}
                  title={member.name ? `${member.name} (${member.role})` : undefined}
                >
                  <Image
                    src={member.image || '/images/about/team_placeholder.webp'}
                    alt={
                      member.name
                        ? `${member.name} - ${member.role} at Attiks Architecture`
                        : `Attiks Architecture design team member 0${index + 1}`
                    }
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    quality={95}
                    style={{
                      objectFit: 'cover',
                      filter: 'grayscale(100%)',
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.filter = 'grayscale(0%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.filter = 'grayscale(100%)';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .leadership-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .team-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        @media (max-width: 1024px) {
          .leadership-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .leadership-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px 14px !important;
          }
          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
