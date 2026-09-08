import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import ProjectShowcaseGrid from '@/components/ProjectShowcaseGrid';
import { getGalleryPostsAction } from '@/actions/gallery.actions';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Media & Architectural Showcase',
  description:
    'Visual media showcases, architectural highlights, design documentaries, and project documentation by Attiks Architecture.',
  alternates: {
    canonical: '/media',
  },
  openGraph: {
    title: 'Media & Architectural Showcase | ATTIKS Architecture',
    description:
      'Visual media showcases, architectural highlights, design documentaries, and project documentation by Attiks Architecture.',
    url: 'https://attiks.in/media',
    siteName: 'ATTIKS Architecture',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media & Architectural Showcase | ATTIKS Architecture',
    description: 'Visual media showcases and architectural documentaries by Attiks Architecture.',
  },
};

export default async function MediaPage() {
  const galleryPosts = await getGalleryPostsAction();

  const mediaSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Media & Architectural Showcase — ATTIKS Architecture',
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
            padding: 'clamp(120px, 11vw, 160px) clamp(20px, 5vw, 64px) 80px',
            boxSizing: 'border-box',
            width: '100%',
          }}
          aria-label="Media and Showcase"
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <PageHeader 
              label="Media &amp; Showcase"
              title={<>Visual media &amp;{' '}<br />architectural highlights</>}
            />

            {/* All Uploaded Media Showcase (Grid with in-place modal preview) */}
            <div style={{ marginTop: 'clamp(28px, 3.5vw, 44px)' }}>
              <ProjectShowcaseGrid initialPosts={galleryPosts} disableOuterPadding />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
