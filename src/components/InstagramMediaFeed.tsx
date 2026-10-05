'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Layers,
  Video,
} from 'lucide-react';
import { GalleryPost, defaultGalleryPosts } from '@/data/gallery';

interface InstagramMediaFeedProps {
  initialPosts?: GalleryPost[];
}

export default function InstagramMediaFeed({
  initialPosts = [],
}: InstagramMediaFeedProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const posts = initialPosts && initialPosts.length > 0 ? initialPosts : defaultGalleryPosts;
  const filteredPosts = posts.filter((p) => p.active !== false);

  // Deterministic like & comment counts based on ID / index for authentic feel
  const getLikes = (post: GalleryPost, idx: number) => {
    const hash = (post.id.charCodeAt(post.id.length - 1) || 5) * 37 + idx * 43;
    return 240 + (hash % 620);
  };

  const getComments = (post: GalleryPost, idx: number) => {
    const hash = (post.id.charCodeAt(0) || 3) * 17 + idx * 7;
    return 12 + (hash % 38);
  };

  const isVideoPost = (post: GalleryPost) => {
    return (
      (post as any).mediaType === 'video' ||
      /\.(mp4|webm|mov)$/i.test(post.image || '')
    );
  };

  return (
    <div style={{ width: '100%', background: '#000000', color: '#ffffff', minHeight: '60vh' }}>
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
            const isHovered = hoveredId === post.id;
            const isVid = isVideoPost(post);
            const likesCount = getLikes(post, idx);
            const commentsCount = getComments(post, idx);

            return (
              <motion.div
                key={`${post.id}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.2) }}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: '#141414',
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

                {/* Instagram Centered Hover Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    zIndex: 5,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      color: '#ffffff',
                      fontSize: 'clamp(14px, 1.1vw, 17px)',
                      fontWeight: 600,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    <Heart size={18} fill="#ffffff" color="#ffffff" />
                    <span>{likesCount}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      color: '#ffffff',
                      fontSize: 'clamp(14px, 1.1vw, 17px)',
                      fontWeight: 600,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    <MessageCircle size={18} fill="#ffffff" color="#ffffff" />
                    <span>{commentsCount}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
