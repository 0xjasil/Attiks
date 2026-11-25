'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Layers, Video } from 'lucide-react';
import { GalleryPost, defaultGalleryPosts } from '@/data/gallery';

interface InstagramMediaFeedProps {
  initialPosts?: GalleryPost[];
}

export default function InstagramMediaFeed({
  initialPosts = [],
}: InstagramMediaFeedProps) {
  const posts = initialPosts && initialPosts.length > 0 ? initialPosts : defaultGalleryPosts;
  const filteredPosts = posts.filter((p) => p.active !== false);

  const isVideoPost = (post: GalleryPost) => {
    return (
      (post as any).mediaType === 'video' ||
      /\.(mp4|webm|mov)$/i.test(post.image || '')
    );
  };

  return (
    <div style={{ width: '100%', background: '#ffffff', color: '#111111', minHeight: '60vh' }}>
      {/* ============================================================
          EXACT INSTAGRAM GRID FEED (4-COLUMN ON DESKTOP, TIGHT GAPS)
          ============================================================ */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 0 60px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="instagram-feed-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 'clamp(3px, 0.35vw, 6px)',
            width: '100%',
          }}
        >
          {filteredPosts.map((post, idx) => {
            const isVid = isVideoPost(post);

            return (
              <motion.div
                key={`${post.id}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.2) }}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                }}
              >
                {/* Media Item */}
                <Image
                  src={post.image || '/architecture.webp'}
                  alt={post.altText || post.caption || 'Attiks architectural showcase'}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{
                    objectFit: 'cover',
                  }}
                />

                {/* Top-Right Media Badge (Video / Carousel Icon) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 4,
                    color: '#ffffff',
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))',
                    pointerEvents: 'none',
                  }}
                >
                  {isVid ? (
                    <Video size={16} />
                  ) : idx % 3 === 0 ? (
                    <Layers size={15} />
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
