'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Download, ArrowUpRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project } from '@/data/projects';
import { CategoryItem, defaultCategories } from '@/data/categories';

const LeadCaptureModal = dynamic(() => import('@/components/LeadCaptureModal'), {
  ssr: false,
});

interface ProjectsClientPageProps {
  initialProjects: Project[];
  initialCategories?: CategoryItem[];
}

export default function ProjectsClientPage({
  initialProjects,
  initialCategories = defaultCategories,
}: ProjectsClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(initialCategories);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Portfolio download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  useEffect(() => {
    setAllProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProjects = selectedCategory
    ? allProjects.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase())
    : allProjects;

  const currentCategoryObj = selectedCategory
    ? categoriesList.find((c) => c.value.toLowerCase() === selectedCategory.toLowerCase())
    : null;

  const displayTitle = currentCategoryObj
    ? currentCategoryObj.label
    : selectedCategory
    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
    : 'All projects';

  const filterOptions = [
    { label: 'All', value: null },
    ...categoriesList.map((c) => ({ label: c.label, value: c.value })),
  ];

  const currentCategoryName = currentCategoryObj ? currentCategoryObj.label : 'Complete Studio';
  const currentCategoryPdf = currentCategoryObj?.portfolioPdf || '';

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111' }}>
      <Navbar />

      <main>
        {/* Hero Header & Filter Section with Architectural Spacing */}
        <section
          style={{
            background: '#ffffff',
            padding: isMobile ? '140px 20px 32px' : '180px clamp(24px, 4vw, 56px) 50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
          aria-label="Projects Showcase Header"
        >
          <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
            {/* Editorial Serif Header */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={displayTitle}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="font-display"
                style={{
                  fontSize: isMobile ? '2.2rem' : 'clamp(2.6rem, 4.5vw, 3.8rem)',
                  fontWeight: 300,
                  color: '#000000',
                  margin: isMobile ? '0 0 20px 0' : '0 0 28px 0',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  textTransform: 'none',
                }}
              >
                {displayTitle}
              </motion.h1>
            </AnimatePresence>

            {/* Clean Minimalist Category Filters */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: isMobile ? '10px 16px' : '14px 28px',
                maxWidth: '960px',
                margin: '0 auto',
              }}
              role="toolbar"
              aria-label="Filter projects by category"
            >
              {filterOptions.map((item) => {
                const isSelected = selectedCategory === item.value;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedCategory(item.value as Category | null)}
                    aria-pressed={isSelected}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontSize: 'clamp(18px, 1.15vw, 20px)',
                      fontFamily: 'inherit',
                      color: isSelected ? '#000000' : '#777777',
                      fontWeight: isSelected ? 600 : 400,
                      position: 'relative',
                      letterSpacing: '0.02em',
                      transition: 'color 0.2s ease',
                      textTransform: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.color = '#000000';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.color = '#777777';
                    }}
                  >
                    <span>{item.label}</span>
                    {/* Active Underline Indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="activeFilterUnderline"
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: '0',
                          right: '0',
                          height: '1.5px',
                          backgroundColor: '#000000',
                          borderRadius: '1px',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Editorial Category Portfolio Download Action */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                marginTop: isMobile ? '24px' : '32px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setDownloadModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: isMobile ? '10px 18px' : '11px 24px',
                  borderRadius: '999px',
                  background: '#0a0a0a',
                  color: '#ffffff',
                  border: '1px solid #0a0a0a',
                  fontSize: 'clamp(13.5px, 0.95vw, 15px)',
                  fontWeight: 450,
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#27272a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0a0a0a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.08)';
                }}
              >
                <Download size={15} style={{ opacity: 0.9 }} />
                <span>
                  {selectedCategory
                    ? `Download ${currentCategoryName} Portfolio (.PDF)`
                    : 'Download Complete Studio Portfolio (.PDF)'}
                </span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* 3-Column / Responsive Showcase Grid */}
        <section
          style={{
            background: '#ffffff',
            padding: isMobile ? '0 20px 80px' : '0 clamp(24px, 4vw, 56px) 110px',
            boxSizing: 'border-box',
          }}
          aria-label="Projects Grid"
        >
          <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
            <motion.div
              layout
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: isMobile ? '18px' : '24px',
                width: '100%',
              }}
              className="projects-3col-grid"
            >
              <AnimatePresence>
                {filteredProjects.map((project) => {
                  const isHovered = hoveredId === project.id;
                  const projectUrl = `/projects/${(project as any).slug || project.id}`;

                  return (
                    <motion.div
                      layout
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={projectUrl}
                        style={{
                          position: 'relative',
                          display: 'block',
                          width: '100%',
                          aspectRatio: isMobile ? '16 / 11' : '16 / 10.5',
                          overflow: 'hidden',
                          background: '#111111',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                        className="project-grid-card"
                        onMouseEnter={() => setHoveredId(project.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <Image
                          src={project.image || '/architecture.webp'}
                          alt={project.imageAlt || `${project.title} - ${project.category} architecture in ${project.location} by Attiks`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          style={{
                            objectFit: 'cover',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          className="project-grid-img"
                        />

                        {/* Hover Overlay */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)',
                            opacity: isMobile || isHovered ? 1 : 0,
                            transition: 'opacity 0.35s ease',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* Top-Right Arrow Indicator on Hover */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.92)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000000',
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.9)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            pointerEvents: 'none',
                            zIndex: 6,
                          }}
                        >
                          <ArrowUpRight size={18} />
                        </div>

                        {/* Bottom Editorial Typography */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: isMobile ? '16px 18px' : '20px 22px',
                            zIndex: 5,
                            pointerEvents: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            opacity: isMobile || isHovered ? 1 : 0,
                            transform: isMobile || isHovered ? 'translateY(0)' : 'translateY(8px)',
                            transition: 'opacity 0.35s ease, transform 0.35s ease',
                          }}
                        >
                          <p
                            style={{
                              color: 'rgba(255, 255, 255, 0.85)',
                              fontSize: 'clamp(12px, 0.85vw, 13.5px)',
                              fontWeight: 400,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              margin: 0,
                              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                            }}
                          >
                            {project.location} &bull; {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                          </p>
                          <h2
                            className="font-display"
                            style={{
                              color: '#ffffff',
                              fontSize: isMobile ? '1.2rem' : 'clamp(1.2rem, 1.4vw, 1.45rem)',
                              fontWeight: 400,
                              margin: 0,
                              letterSpacing: '-0.01em',
                              lineHeight: 1.25,
                              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
                              textTransform: 'none',
                            }}
                          >
                            {project.title}
                          </h2>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Portfolio Download Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        category={selectedCategory || undefined}
        categoryLabel={currentCategoryName}
        customPdfUrl={currentCategoryPdf}
        projects={allProjects}
        mode="download"
      />

      <style jsx>{`
        @media (max-width: 1024px) and (min-width: 641px) {
          .projects-3col-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .projects-3col-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
