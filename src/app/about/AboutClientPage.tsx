'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

interface Partner {
  name: string;
  role: string;
  image: string;
}

const LEADERSHIP_MEMBERS: Partner[] = [
  {
    name: 'Ar. Mohamed Aslam P K',
    role: 'Principal Architect',
    image: '/images/about/partner_aslam.webp',
  },
  {
    name: 'Ar. Mahir Aalam P',
    role: 'Co - founder',
    image: '/images/about/partner_mahir.webp',
  },
  {
    name: 'Ar. Mohamed Naseem P K',
    role: 'Co - founder',
    image: '/images/about/partner_naseem.webp',
  },
  {
    name: 'Ar. Nihad Mohamed Ali',
    role: 'Co - founder, Senior partner - Dubai',
    image: '/images/about/partner_nihad.webp',
  },
  {
    name: 'Ar. Razeen Jawad',
    role: 'Senior partner',
    image: '/images/about/partner_razeen.webp',
  },
  {
    name: 'Ar. Jamsheer',
    role: 'Senior partner',
    image: '/images/about/partner_jamsheer.webp',
  },
];

const TEAM_MEMBERS = Array.from({ length: 4 }, (_, i) => ({
  id: `team-member-${i + 1}`,
  image: '/images/about/team_placeholder.webp',
}));

export default function AboutClientPage() {
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
        {/* 1. Hero Section: Full Width Photo reaching top with Header overlay */}
        <section
          style={{
            position: 'relative',
            width: '100%',
            marginBottom: 'clamp(60px, 7vw, 100px)',
            overflow: 'hidden',
          }}
          aria-label="Studio Team Hero"
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '900 / 473',
              minHeight: '320px',
              backgroundColor: '#151515',
              overflow: 'hidden',
            }}
          >
            <Image
              src="/images/about/small_SBCL2379265.webp"
              alt="Attiks Architecture studio team gathered at the practice atelier"
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              quality={95}
              priority
            />
            {/* Top gradient overlay for header visibility */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '140px',
                background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          </div>
        </section>

        {/* 2. Philosophy & Evolution Section */}
        <section
          style={{
            width: '100%',
            padding: '0 clamp(20px, 5vw, 64px)',
            boxSizing: 'border-box',
            marginBottom: 'clamp(70px, 9vw, 120px)',
          }}
          aria-label="Philosophy and History"
        >
          <div
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
              gap: 'clamp(40px, 6vw, 80px)',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Descriptive Story Text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(20px, 2.5vw, 28px)',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 'clamp(11.5px, 0.8vw, 13px)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#767676',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-primary)',
                  }}
                >
                  Studio Philosophy
                </span>
                <h2
                  className="font-display"
                  style={{
                    fontFamily: 'var(--font-canela), Georgia, serif',
                    fontSize: 'clamp(2rem, 3.2vw, 2.9rem)',
                    fontWeight: 300,
                    color: '#000000',
                    margin: 0,
                    lineHeight: 1.18,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Contextual &amp; Enduring Architecture
                </h2>
              </div>

              <p
                style={{
                  fontSize: 'clamp(17px, 1.25vw, 20px)',
                  lineHeight: 1.55,
                  color: '#1a1a1a',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  margin: 0,
                  fontFamily: 'var(--font-primary)',
                }}
              >
                <strong style={{ fontWeight: 600, color: '#000000' }}>Attiks Architecture</strong> approaches architecture as a contextual and evolving discipline, shaped by the relationship between people, place, and time. The practice seeks to develop spaces that are responsive to their physical, cultural, and environmental contexts, while establishing a clear and enduring architectural identity.
              </p>

              <p
                style={{
                  fontSize: 'clamp(15px, 1.05vw, 17px)',
                  lineHeight: 1.6,
                  color: '#555555',
                  fontWeight: 350,
                  letterSpacing: '-0.005em',
                  margin: 0,
                  fontFamily: 'var(--font-primary)',
                }}
              >
                This philosophy forms the foundation of Attiks Architecture, established in 2014 with a vision to advance innovative and sustainable architectural practices. The practice evolved from M/s P.K. Aslam Architects, founded by Ar. P.K. Aslam in 1997, which developed into a well-established and reputed architectural practice over the years. In response to an evolving architectural landscape, the firm came together with a new generation of young and dynamic architects, laying the foundation for Attiks Architecture.
              </p>
            </div>

            {/* Right Column: Partners Group Image */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                minHeight: '280px',
                backgroundColor: '#151515',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/images/about/partners_group.webp"
                alt="Attiks Architecture leadership partners discussion in Calicut"
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

        {/* 3. People of Attiks - Partners (3-Column Grid) */}
        <section
          style={{
            width: '100%',
            padding: '0 clamp(20px, 5vw, 64px)',
            boxSizing: 'border-box',
            marginBottom: 'clamp(70px, 9vw, 120px)',
          }}
          aria-label="People of Attiks - Partners"
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
              <h2
                className="font-display"
                style={{
                  fontFamily: 'var(--font-canela), Georgia, serif',
                  fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
                  fontWeight: 300,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                People of Attiks
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-primary), "Neue Haas Grotesk", sans-serif',
                  fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)',
                  color: '#222222',
                  margin: '8px 0 0 0',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                }}
              >
                Partners
              </p>
            </div>

            {/* 3-Column Grid (3 per row) */}
            <div
              className="leadership-grid"
              style={{
                display: 'grid',
                gap: 'clamp(32px, 4vw, 56px) clamp(24px, 3.5vw, 48px)',
              }}
            >
              {LEADERSHIP_MEMBERS.map((partner) => (
                <div
                  key={partner.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Portrait Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      backgroundColor: '#f5f5f5',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={partner.image}
                      alt={`${partner.name} - ${partner.role} at Attiks Architecture`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                        fontSize: 'clamp(18px, 1.25vw, 21px)',
                        fontWeight: 700,
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
                        fontSize: 'clamp(14px, 0.95vw, 16px)',
                        color: '#4b5563',
                        margin: '4px 0 0 0',
                        fontWeight: 400,
                        letterSpacing: '-0.005em',
                        lineHeight: 1.4,
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

        {/* 4. The Team Section (4-Column Grid) */}
        <section
          style={{
            width: '100%',
            padding: '0 clamp(20px, 5vw, 64px)',
            boxSizing: 'border-box',
            marginBottom: 'clamp(80px, 10vw, 130px)',
          }}
          aria-label="The Team"
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
              <h2
                className="font-display"
                style={{
                  fontFamily: 'var(--font-canela), Georgia, serif',
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
                  fontWeight: 300,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                The Team
              </h2>
            </div>

            {/* 4-Column Team Grid */}
            <div
              className="team-grid"
              style={{
                display: 'grid',
                gap: 'clamp(20px, 2.5vw, 32px) clamp(16px, 2vw, 24px)',
              }}
            >
              {TEAM_MEMBERS.map((member, index) => (
                <div
                  key={member.id}
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 4.6',
                    backgroundColor: '#e6e6e6',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={member.image}
                    alt={`Attiks Architecture design collective team architect 0${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .team-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        @media (max-width: 900px) {
          .leadership-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .leadership-grid {
            grid-template-columns: 1fr;
          }
          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
