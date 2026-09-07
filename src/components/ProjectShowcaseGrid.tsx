'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GalleryPost, defaultGalleryPosts } from '@/data/gallery';

export default function ProjectShowcaseGrid({
  initialPosts = [],
  limit,
  disableOuterPadding = false,
}: {
  initialPosts?: GalleryPost[];
  limit?: number;
  disableOuterPadding?: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const posts = initialPosts && initialPosts.length > 0 ? initialPosts : defaultGalleryPosts;
  let activePosts = posts.filter((p) => p.active !== false);
  if (typeof limit === 'number' && limit > 0) {
    activePosts = activePosts.slice(0, limit);
  }

  return (
    <section
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: disableOuterPadding ? '0' : '10px clamp(20px, 5vw, 64px) 80px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        boxSizing: 'border-box',
      }}
      aria-label="Architectural Showcase Gallery"
    >
      <div
        style={{
          width: '100%',
          margin: 0,
        }}
      >
        {/* Exact 3-Column Square Showcase Grid */}
        <div
          className="instagram-photo-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(3px, 1.2vw, 20px)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {activePosts.map((post, idx) => {
            const isHovered = hoveredId === post.id;

            return (
              <motion.div
                key={`${post.id}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(idx * 0.025, 0.25),
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: '-20px' }}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: '#111111',
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Image
                  src={post.image}
                  alt={post.altText || post.caption || 'Attiks Architectural Showcase photo'}
                  fill
                  sizes="(max-width: 768px) 33vw, 33vw"
                  style={{
                    objectFit: 'cover',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />

                {/* Gradient Overlay (Appears on Hover) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
                    pointerEvents: 'none',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                  }}
                />

                {/* Bottom-Left Typography: Caption only on hover */}
                {post.caption && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 'clamp(8px, 1.3vw, 18px)',
                      zIndex: 5,
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
                      transition: 'opacity 0.25s ease, transform 0.25s ease',
                    }}
                  >
                    <h3
                      style={{
                        color: '#ffffff',
                        fontSize: 'clamp(11px, 1.2vw, 1.3rem)',
                        fontWeight: 500,
                        margin: 0,
                        letterSpacing: '-0.01em',
                        fontFamily: 'var(--font-primary)',
                        textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                        lineHeight: 1.25,
                        textTransform: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {post.caption}
                    </h3>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


