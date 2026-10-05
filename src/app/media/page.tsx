import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectShowcaseGrid from '@/components/ProjectShowcaseGrid';
import { getGalleryPostsAction } from '@/actions/gallery.actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Media',
  description:
    'Visual media showcases, architectural highlights, design documentaries, and project documentation by Attiks Architecture.',
  alternates: {
    canonical: '/media',
  },
  openGraph: {
    title: 'Media | ATTIKS Architecture',
    description:
      'Visual media showcases, architectural highlights, design documentaries, and project documentation by Attiks Architecture.',
    url: 'https://attiks.in/media',
    siteName: 'ATTIKS Architecture',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media | ATTIKS Architecture',
    description: 'Visual media showcases and architectural documentaries by Attiks Architecture.',
  },
};

export default async function MediaPage() {
  const galleryPosts = await getGalleryPostsAction();

  const mediaSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Media — ATTIKS Architecture',
    description:
      'Visual media showcases, architectural highlights, design documentaries, and project documentation by Attiks Architecture.',
    url: 'https://attiks.in/media',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://attiks.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Media',
        item: 'https://attiks.in/media',
      },
    ],
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mediaSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main style={{ flex: 1 }}>
        <section
          style={{
            padding: 'clamp(84px, 8vw, 130px) clamp(20px, 5vw, 64px) clamp(36px, 5vw, 64px)',
            boxSizing: 'border-box',
            width: '100%',
          }}
          aria-label="Media Showcase"
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            {/* Clean Minimal Title */}
            <div style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
                  fontWeight: 300,
                  fontFamily: 'var(--font-canela), serif',
                  color: '#000000',
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  textTransform: 'none',
                  margin: 0,
                }}
              >
                Media
              </h1>
            </div>

            {/* 4-Column Media Showcase Grid */}
            <ProjectShowcaseGrid initialPosts={galleryPosts} disableOuterPadding columns={4} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

