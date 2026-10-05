'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Grid,
  PlaySquare,
  Bookmark,
  Heart,
  MessageCircle,
  X,
  Layers,
  Video,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { GalleryPost, defaultGalleryPosts } from '@/data/gallery';

interface InstagramMediaFeedProps {
  initialPosts?: GalleryPost[];
}

export default function InstagramMediaFeed({
  initialPosts = [],
}: InstagramMediaFeedProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const posts = initialPosts && initialPosts.length > 0 ? initialPosts : defaultGalleryPosts;
  const activePosts = posts.filter((p) => p.active !== false);

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

  // Filter items based on active tab
  const filteredPosts = activePosts.filter((post) => {
    if (activeTab === 'reels') {
      return isVideoPost(post) || (post.aspectRatio === 'portrait');
    }
    if (activeTab === 'tagged') {
      return post.order && post.order % 2 === 0;
    }
    return true; // 'posts' tab shows all
  });

  const openLightbox = (post: GalleryPost, index: number) => {
    setSelectedPost(post);
    setSelectedIndex(index);
  };

  const nextPost = () => {
    if (filteredPosts.length === 0) return;
    const nextIdx = (selectedIndex + 1) % filteredPosts.length;
    setSelectedIndex(nextIdx);
    setSelectedPost(filteredPosts[nextIdx]);
  };

  const prevPost = () => {
    if (filteredPosts.length === 0) return;
    const prevIdx = (selectedIndex - 1 + filteredPosts.length) % filteredPosts.length;
    setSelectedIndex(prevIdx);
    setSelectedPost(filteredPosts[prevIdx]);
  };

  return (
    <div style={{ width: '100%', background: '#000000', color: '#ffffff', minHeight: '80vh' }}>
      {/* ============================================================
          TOP TAB BAR (EXACT INSTAGRAM DESKTOP PROFILE TABS)
          ============================================================ */}
      <div
        style={{
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(36px, 8vw, 72px)',
        }}
      >
        {/* Tab 1: POSTS / GRID */}
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'posts' ? '2px solid #ffffff' : '2px solid transparent',
            marginTop: '-1px',
            padding: '16px 8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: activeTab === 'posts' ? '#ffffff' : '#8e8e8e',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-primary), -apple-system, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          <Grid size={13} strokeWidth={activeTab === 'posts' ? 2.4 : 1.8} />
          <span>Posts</span>
        </button>

        {/* Tab 2: REELS */}
        <button
          type="button"
          onClick={() => setActiveTab('reels')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'reels' ? '2px solid #ffffff' : '2px solid transparent',
            marginTop: '-1px',
            padding: '16px 8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: activeTab === 'reels' ? '#ffffff' : '#8e8e8e',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-primary), -apple-system, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          <PlaySquare size={13} strokeWidth={activeTab === 'reels' ? 2.4 : 1.8} />
          <span>Reels</span>
        </button>

        {/* Tab 3: TAGGED */}
        <button
          type="button"
          onClick={() => setActiveTab('tagged')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'tagged' ? '2px solid #ffffff' : '2px solid transparent',
            marginTop: '-1px',
            padding: '16px 8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: activeTab === 'tagged' ? '#ffffff' : '#8e8e8e',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-primary), -apple-system, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          <Bookmark size={13} strokeWidth={activeTab === 'tagged' ? 2.4 : 1.8} />
          <span>Tagged</span>
        </button>
      </div>

      {/* ============================================================
          EXACT INSTAGRAM GRID FEED (4-COLUMN ON DESKTOP, TIGHT GAPS)
          ============================================================ */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '4px 0 60px',
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
                onClick={() => openLightbox(post, idx)}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: '#141414',
                  cursor: 'pointer',
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

      {/* ============================================================
          INSTAGRAM-STYLE LIGHTBOX MODAL
          ============================================================ */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedPost(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                zIndex: 10001,
                padding: '8px',
              }}
              aria-label="Close Preview"
            >
              <X size={28} />
            </button>

            {/* Prev Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevPost();
              }}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10001,
              }}
              aria-label="Previous Post"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextPost();
              }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10001,
              }}
              aria-label="Next Post"
            >
              <ChevronRight size={22} />
            </button>

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#121212',
                borderRadius: '8px',
                overflow: 'hidden',
                maxWidth: '960px',
                width: '100%',
                maxHeight: '90vh',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              }}
            >
              {/* Media Preview (Left) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  background: '#050505',
                  minHeight: '360px',
                }}
              >
                <Image
                  src={selectedPost.image || '/architecture.webp'}
                  alt={selectedPost.caption || 'Attiks architectural showcase'}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* Sidebar Info (Right) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                  boxSizing: 'border-box',
                  justifyContent: 'space-between',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  {/* Studio Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#222',
                        border: '1px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Image
                        src="/images/logo-light.png"
                        alt="Attiks"
                        fill
                        style={{ objectFit: 'contain', padding: '6px' }}
                      />
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          color: '#ffffff',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        attiks.architecture
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#999999' }}>
                        {selectedPost.location || 'Kerala, India'}
                      </p>
                    </div>
                  </div>

                  {/* Caption Body */}
                  <div style={{ padding: '20px 0', maxHeight: '280px', overflowY: 'auto' }}>
                    <p
                      style={{
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        color: '#eeeeee',
                        margin: '0 0 12px 0',
                        fontWeight: 350,
                      }}
                    >
                      <strong style={{ fontWeight: 600, color: '#ffffff', marginRight: '8px' }}>
                        attiks.architecture
                      </strong>
                      {selectedPost.caption}
                    </p>

                    {selectedPost.description && (
                      <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#aaaaaa', margin: 0 }}>
                        {selectedPost.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Interactions */}
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                    <Heart size={22} color="#ffffff" style={{ cursor: 'pointer' }} />
                    <MessageCircle size={22} color="#ffffff" style={{ cursor: 'pointer' }} />
                    <Share2 size={21} color="#ffffff" style={{ cursor: 'pointer' }} />
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                    {getLikes(selectedPost, selectedIndex)} likes
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>
                    {selectedPost.createdAt || 'RECENT ARCHITECTURAL SHOWCASE'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
