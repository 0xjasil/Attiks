'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="about-us"
      className="about-section-container"
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: 'clamp(72px, 10vh, 140px) clamp(20px, 5vw, 64px) clamp(64px, 9vh, 120px)',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      aria-label="About Studio Statement"
    >
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '860px',
          margin: 0,
        }}
      >
        {/* Main Body Statement */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(19px, 1.4vw, 23px)',
            lineHeight: 1.28,
            fontWeight: 400,
            color: '#222222',
            letterSpacing: '-0.01em',
            margin: '0 0 24px 0',
          }}
        >
          <strong style={{ fontWeight: 600, color: '#000000' }}>Attiks Architecture</strong> is a Kerala-based architecture practice working
          across residential, commercial, institutional, hospitality, and
          large-scale developments. The practice creates contextual, enduring
          architecture shaped by climate, material, and the experience of space.
        </motion.p>

        {/* Expandable Detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                overflow: 'hidden',
                fontSize: 'clamp(17px, 1.2vw, 20px)',
                lineHeight: 1.35,
                fontWeight: 400,
                color: '#555555',
                letterSpacing: '-0.005em',
                marginBottom: '20px',
              }}
            >
              Founded on the belief that architecture should serve both people and place, the
              studio approaches every project with sensitivity to local culture,
              environment, and craft. With a dedicated team of architects, designers, and engineering
              consultants, Attiks has delivered projects across Kerala and beyond.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Minimal "know more" Toggle & "We're hiring" Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#000000',
              cursor: 'pointer',
              fontSize: 'clamp(15px, 1.1vw, 17px)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textTransform: 'lowercase',
              fontFamily: 'var(--font-primary)',
              transition: 'opacity 0.2s ease',
              textAlign: 'left',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {isExpanded ? 'show less' : 'know more'}
          </button>
        </motion.div>
      </div>

      {/* Right: Watermark Triangle Motif (Shifted to the right as in reference image) */}
      <div
        className="about-watermark-bg"
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translate(35%, -50%)',
          width: 'clamp(520px, 58vw, 980px)',
          height: 'clamp(520px, 58vw, 980px)',
          opacity: 0.08,
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <Image
          src="/images/Trblack.png"
          alt=""
          fill
          sizes="(max-width: 768px) 520px, 980px"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      </div>
    </section>
  );
}
