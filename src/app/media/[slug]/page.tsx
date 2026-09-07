import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllMedia, getMediaBySlug } from '@/lib/media';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getMediaBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Attiks Architecture',
    };
  }

  const desc = article.summary || article.content?.slice(0, 160).replace(/\n/g, ' ') || '';
  const imgUrl = article.image || '/architecture.webp';

  return {
    title: `${article.title} | Attiks Architecture Media`,
    description: desc,
    alternates: {
      canonical: `/media/${slug}`,
    },
    openGraph: {
      title: `${article.title} | Attiks Architecture`,
      description: desc,
      url: `https://attiks.in/media/${slug}`,
      siteName: 'ATTIKS Architecture',
      images: [
        {
          url: imgUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Attiks Architecture`,
      description: desc,
      images: [imgUrl],
    },
  };
}

export default async function MediaArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, allMedia] = await Promise.all([
    getMediaBySlug(slug),
    getAllMedia(),
  ]);

  if (!article) {
    notFound();
  }

  const related = allMedia
    .filter((a) => a.slug !== article.slug && a.id !== article.id)
    .slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.content?.slice(0, 160),
    image: article.image || 'https://attiks.in/architecture.webp',
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'ATTIKS Architecture',
      url: 'https://attiks.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ATTIKS Architecture',
      logo: {
        '@type': 'ImageObject',
        url: 'https://attiks.in/images/logo-light.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://attiks.in/media/${slug}`,
    },
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
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://attiks.in/media/${slug}`,
      },
    ],
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main style={{ flex: 1, padding: 'clamp(120px, 11vw, 160px) clamp(20px, 5vw, 64px) 100px', boxSizing: 'border-box' }}>
        <article style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Back link */}
          <div style={{ marginBottom: '32px' }}>
            <Link
              href="/media"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#666666',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 400,
                transition: 'color 0.2s ease',
              }}
            >
              ← Back to Media &amp; Insights
            </Link>
          </div>

          {/* Metadata pill & date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
                color: '#000000',
                background: '#f4f4f4',
                padding: '4px 12px',
                borderRadius: '999px',
              }}
            >
              {article.category || 'Article'}
            </span>
            <span style={{ fontSize: '15px', color: '#888888' }}>
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </span>
            {article.author && (
              <span style={{ fontSize: '15px', color: '#888888' }}>
                By {article.author}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: 'var(--font-canela), serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
              lineHeight: '1.2',
              fontWeight: 400,
              color: '#000000',
              marginBottom: '28px',
              letterSpacing: '-0.02em',
            }}
          >
            {article.title}
          </h1>

          {/* Summary */}
          {article.summary && (
            <p
              style={{
                fontSize: 'clamp(19px, 1.25vw, 22px)',
                lineHeight: '1.6',
                color: '#444444',
                fontWeight: 350,
                marginBottom: '40px',
                borderLeft: '2px solid #000000',
                paddingLeft: '20px',
              }}
            >
              {article.summary}
            </p>
          )}

          {/* Hero Cover Image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '6px',
              overflow: 'hidden',
              marginBottom: '56px',
              background: '#f0f0f0',
              border: '1px solid #e5e5e5',
            }}
          >
            <Image
              src={article.image || '/architecture.webp'}
              alt={`${article.title} - Architectural Insights by Attiks Architecture`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 960px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Article Body Content */}
          <div
            style={{
              fontSize: 'clamp(18px, 1.15vw, 20px)',
              lineHeight: '1.8',
              color: '#222222',
              fontWeight: 350,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              marginBottom: '80px',
            }}
          >
            {(article.content || article.summary || '')
              .split('\n\n')
              .map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
          </div>

          {/* Related Articles Section */}
          {related.length > 0 && (
            <section style={{ borderTop: '1px solid #e5e5e5', paddingTop: '64px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-canela), serif',
                  fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)',
                  marginBottom: '32px',
                  fontWeight: 400,
                  color: '#000000',
                }}
              >
                More Architectural Insights
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
                {related.map((rel) => (
                  <Link
                    key={rel.id || rel.slug}
                    href={`/media/${rel.slug || rel.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/10',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '14px',
                        background: '#f0f0f0',
                        border: '1px solid #e5e5e5',
                      }}
                    >
                      <Image
                        src={rel.image || '/architecture.webp'}
                        alt={`${rel.title} - Related Architecture Article by Attiks`}
                        fill
                        sizes="300px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <span style={{ fontSize: '14px', color: '#777777', marginBottom: '4px' }}>
                      {rel.category || 'Article'}
                    </span>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        lineHeight: '1.4',
                        color: '#000000',
                        margin: 0,
                      }}
                    >
                      {rel.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </article>
      </main>

      <Footer />
    </div>
  );
}
