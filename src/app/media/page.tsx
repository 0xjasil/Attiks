import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstagramMediaFeed from '@/components/InstagramMediaFeed';
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
    <div style={{ background: '#000000', minHeight: '100vh', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mediaSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main style={{ flex: 1, paddingTop: 'clamp(120px, 11vw, 160px)' }}>
        <section
          style={{
            padding: '0 clamp(16px, 3.5vw, 48px) clamp(60px, 8vw, 120px)',
            boxSizing: 'border-box',
            width: '100%',
          }}
          aria-label="Instagram Showcase Feed"
        >
          {/* Instagram Profile Style Media Feed */}
          <InstagramMediaFeed initialPosts={galleryPosts} />
        </section>
      </main>

      <Footer />
    </div>
  );
}


