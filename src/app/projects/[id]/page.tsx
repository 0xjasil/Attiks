import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project } from '@/data/projects';
import { getProjectByIdOrSlug } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectByIdOrSlug(id);

  if (!project) {
    return {
      title: 'Project Not Found | ATTIKS Architecture',
    };
  }

  const categoryName = project.category.charAt(0).toUpperCase() + project.category.slice(1);

  return {
    // title: `${project.title} — ${categoryName} Architecture in ${project.location}`,
    // description: project.description.slice(0, 160).replace(/\n/g, ' '),
    keywords: [
      project.title,
      `${categoryName} architecture`,
      `${project.location} architecture`,
      'Attiks Architecture project',
      'tropical modern architecture',
    ],
    alternates: {
      canonical: `/projects/${id}`,
    },
    openGraph: {
      title: `${project.title} | ATTIKS Architecture`,
      description: project.description.slice(0, 160).replace(/\n/g, ' '),
      url: `https://attiks.in/projects/${id}`,
      images: [
        {
          url: project.image,
          width: 1200,
          height: 675,
          alt: project.imageAlt || `${project.title} architectural design in ${project.location}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | ATTIKS Architecture`,
      description: project.description.slice(0, 160).replace(/\n/g, ' '),
      images: [project.image],
    },
  };
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdOrSlug(id);

  if (!project) {
    return (
      <div style={{ background: '#ffffff', color: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '160px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '1.25rem', fontFamily: 'var(--font-canela)', color: '#000000' }}>Project Not Found</h1>
          <p style={{ color: '#555555', marginBottom: '2.5rem', fontSize: 'clamp(18px, 1.2vw, 20px)' }}>The requested architectural project could not be located.</p>
          <Link href="/projects" className="btn-premium">
            &larr; View All Projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback gallery images if gallery array is empty
  const galleryImages =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : [project.image, '/comm_modern.webp', '/interior.webp', '/comm_downtown.webp'].filter(
          (img, idx, arr) => arr.indexOf(img) === idx
        );

  const formattedCategory = project.category.charAt(0).toUpperCase() + project.category.slice(1);

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: project.title,
    description: project.description.slice(0, 160).replace(/\n/g, ' '),
    image: project.image,
    creator: {
      '@type': 'ArchitectureStudio',
      name: 'ATTIKS Architecture',
      url: 'https://attiks.in',
    },
    locationCreated: {
      '@type': 'Place',
      name: project.location,
    },
    artMedium: 'Architecture & Spatial Design',
    artform: formattedCategory,
    dateCreated: project.year,
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
        name: 'Projects',
        item: 'https://attiks.in/projects',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: `https://attiks.in/projects/${id}`,
      },
    ],
  };

  return (
    <div style={{ background: '#ffffff', color: '#111111', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main>
        {/* Project Image & Hero Header */}
        <section style={{ position: 'relative', width: '100%', height: '70vh', minHeight: '520px' }}>
          <Image 
            src={project.image}
            alt={project.imageAlt || `${project.title} - ${formattedCategory} architecture in ${project.location} by Attiks Architecture`}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '0 24px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: 'clamp(18px, 1.1vw, 20px)', letterSpacing: '0.04em', textTransform: 'none', color: 'rgba(255,255,255,0.9)', marginBottom: '14px', fontWeight: 400 }}>
              {formattedCategory} &bull; {project.year}
            </p>
            <h1 style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)', fontWeight: 300, letterSpacing: '-0.02em', textAlign: 'center', fontFamily: 'var(--font-canela)', margin: 0, color: '#ffffff' }}>
              {project.title}
            </h1>
            <p style={{ marginTop: '18px', fontSize: 'clamp(18px, 1.15vw, 20px)', letterSpacing: '0.02em', textTransform: 'none', color: '#f0f0f0', fontWeight: 400 }}>
              {project.location}
            </p>
          </div>
        </section>

        {/* Project Details Section */}
        <section style={{ padding: '90px var(--section-padding) 70px', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 540px' }}>
            <span style={{ fontSize: 'clamp(18px, 1.1vw, 20px)', textTransform: 'none', letterSpacing: '0.02em', color: '#666666', fontWeight: 400, display: 'block', marginBottom: '12px' }}>
              {formattedCategory} Architecture
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', marginBottom: '28px', fontWeight: 400, textTransform: 'none', fontFamily: 'var(--font-canela)', color: '#000000' }}>
              About {project.title}
            </h2>
            <p style={{ fontSize: 'clamp(18px, 1.3vw, 21px)', lineHeight: '1.8', color: '#333333', marginBottom: '32px', fontWeight: 350 }}>
              {project.description}
            </p>

            {project.scope && (
              <div style={{ marginTop: '36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid #e5e5e5', paddingTop: '28px' }}>
                <div>
                  <span style={{ fontSize: 'clamp(16px, 1vw, 18px)', textTransform: 'none', letterSpacing: '0.02em', color: '#777777', display: 'block', marginBottom: '6px' }}>Scope</span>
                  <span style={{ fontSize: 'clamp(18px, 1.2vw, 20px)', color: '#000000', fontWeight: 400 }}>{project.scope}</span>
                </div>
                {project.area && (
                  <div>
                    <span style={{ fontSize: 'clamp(16px, 1vw, 18px)', textTransform: 'none', letterSpacing: '0.02em', color: '#777777', display: 'block', marginBottom: '6px' }}>Built-up Area</span>
                    <span style={{ fontSize: 'clamp(18px, 1.2vw, 20px)', color: '#000000', fontWeight: 400 }}>{project.area}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '48px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn-premium" style={{ background: '#000000', color: '#ffffff', borderColor: '#000000' }}>
                Inquire about project
              </Link>
              <Link href="/projects" className="btn-premium" style={{ background: '#ffffff', color: '#000000', borderColor: '#000000' }}>
                &larr; All projects
              </Link>
            </div>
          </div>

          {/* Highlights Card */}
          <div style={{ flex: '1 1 360px', background: '#f8f8f8', padding: '40px', borderRadius: '6px', border: '1px solid #e5e5e5', alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 'clamp(16px, 1vw, 18px)', textTransform: 'none', letterSpacing: '0.04em', color: '#777777', display: 'block', marginBottom: '8px' }}>Features</span>
            <h3 style={{ fontSize: 'clamp(1.3rem, 1.6vw, 1.6rem)', marginBottom: '24px', fontWeight: 400, textTransform: 'none', letterSpacing: '-0.01em', color: '#000000' }}>
              Project highlights
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(project.highlights || ['Contextual Material Palette', 'Passive Climate Architecture', 'Integrated Landscape Integration']).map((highlight, idx) => (
                <li key={idx} style={{ padding: '16px 0', borderBottom: idx < (project.highlights?.length || 3) - 1 ? '1px solid #e5e5e5' : 'none', color: '#222222', display: 'flex', alignItems: 'center', fontSize: 'clamp(18px, 1.15vw, 19.5px)', fontWeight: 400 }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#000000', borderRadius: '50%', marginRight: '16px', flexShrink: 0 }} aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Project Gallery Section */}
        <section style={{ padding: '70px var(--section-padding) 130px', maxWidth: '1400px', margin: '0 auto', borderTop: '1px solid #e5e5e5' }}>
          <div style={{ marginBottom: '44px', textAlign: 'left' }}>
            <span style={{ fontSize: 'clamp(18px, 1.1vw, 20px)', textTransform: 'none', letterSpacing: '0.04em', color: '#666666', fontWeight: 400, display: 'block', marginBottom: '8px' }}>
              Visual showcase
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', margin: 0, fontWeight: 400, fontFamily: 'var(--font-canela)', color: '#000000' }}>
              Project gallery
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {galleryImages.map((imgUrl, index) => (
              <div 
                key={index}
                style={{
                  position: 'relative',
                  height: '340px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#f0f0f0',
                  border: '1px solid #e5e5e5',
                  transition: 'transform 0.4s ease, border-color 0.4s ease',
                }}
              >
                <Image
                  src={imgUrl}
                  alt={project.galleryAlts?.[index] || `${project.title} architectural detail view 0${index + 1} in ${project.location}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  opacity: 0.8,
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: '22px',
                  fontSize: 'clamp(18px, 1.1vw, 19px)',
                  letterSpacing: '0.01em',
                  textTransform: 'none',
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 400,
                }} >
                  {project.title} &bull; View 0{index + 1}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
