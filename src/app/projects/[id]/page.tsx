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

        {/* Project Details Section - Description Only */}
        <section style={{ padding: 'clamp(50px, 6vw, 84px) var(--section-padding) clamp(40px, 5vw, 64px)', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1100px' }}>
            <p style={{ 
              fontSize: 'clamp(18px, 1.3vw, 21.5px)', 
              lineHeight: '1.85', 
              color: '#333333', 
              fontWeight: 350,
              whiteSpace: 'pre-line',
              margin: 0,
            }}>
              {project.description}
            </p>
          </div>
        </section>

        {/* Project Gallery Section */}
        <section style={{ padding: '20px var(--section-padding) 120px', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
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
