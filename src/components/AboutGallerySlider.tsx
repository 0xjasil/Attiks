'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, projects as fallbackProjects } from '@/data/projects';

function ProjectCardItem({ project, isMobile }: { project: Project; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false);
  const projectHref = `/projects/${(project as any).slug || project.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%' }}
    >
      <Link
        href={projectHref}
        style={{
          textDecoration: 'none',
          display: 'block',
          position: 'relative',
          width: '100%',
          aspectRatio: isMobile ? '16 / 11' : '16 / 10.5',
          borderRadius: '0px',
          overflow: 'hidden',
          background: '#111111',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={project.image || '/architecture.webp'}
          alt={project.imageAlt || `${project.title} architectural project in ${project.location} by Attiks Architecture`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{
            objectFit: 'cover',
            display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Bottom Gradient for Legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, transparent 100%)',
            pointerEvents: 'none',
            opacity: isMobile || hovered ? 1 : 0,
            transition: 'opacity 0.35s ease',
          }}
        />

        {/* Bottom-Left Clean Editorial Typography: Project Title on top, Category below */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: isMobile ? '16px 18px' : '22px 24px',
            zIndex: 5,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            opacity: isMobile || hovered ? 1 : 0,
            transform: isMobile || hovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <h3
            className="font-display"
            style={{
              color: '#ffffff',
              fontSize: isMobile ? '1.25rem' : 'clamp(1.25rem, 1.55vw, 1.6rem)',
              fontWeight: 400,
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              textTransform: 'none',
            }}
          >
            {project.title}
          </h3>
          {project.category && (
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: 'clamp(14px, 0.95vw, 16px)',
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'capitalize',
                margin: 0,
                textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              {project.category}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function AboutGallerySlider({ projects = [] }: { projects?: Project[] }) {
  const [isMobile, setIsMobile] = useState(false);

  // Strictly filter only projects that are published AND have featured === true (Hero Spotlight / Homepage Showcase)
  const listToFilter = projects && projects.length > 0 ? projects : fallbackProjects;
  const featuredProjects = listToFilter.filter(
    (p) => String(p.status).toLowerCase() !== 'draft' && Boolean(p.featured)
  );

  // Take the featured projects (up to 2)
  const twoFeaturedProjects = featuredProjects.slice(0, 2);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (twoFeaturedProjects.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: isMobile ? '16px clamp(20px, 5vw, 64px) 36px' : '24px clamp(20px, 5vw, 64px) 50px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        boxSizing: 'border-box',
      }}
      aria-label="Featured Projects Showcase"
    >
      <div
        style={{
          width: '100%',
          margin: 0,
        }}
      >
        {/* Two Featured Images Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '16px' : '24px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {twoFeaturedProjects.map((project, idx) => (
            <ProjectCardItem
              key={`${project.id || idx}`}
              project={project}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Bottom Link to view all projects */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: isMobile ? '20px' : '28px',
            paddingTop: '8px',
            width: '100%',
          }}
        >
          <Link
            href="/projects"
            style={{
              fontSize: 'clamp(16px, 1.1vw, 19px)',
              fontWeight: 400,
              color: '#000000',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              textTransform: 'lowercase',
              fontFamily: 'var(--font-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity 0.25s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '0.55';
              const svg = (e.currentTarget as HTMLAnchorElement).querySelector('svg');
              if (svg) svg.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
              const svg = (e.currentTarget as HTMLAnchorElement).querySelector('svg');
              if (svg) svg.style.transform = 'translateX(0)';
            }}
          >
            <span>view all projects</span>
            <svg
              width="16"
              height="16"
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
        </div>
      </div>
    </section>
  );
}
