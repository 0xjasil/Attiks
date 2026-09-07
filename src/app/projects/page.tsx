import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/projects';
import ProjectsClientPage from './ProjectsClientPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Architecture Portfolio & Projects',
  description:
    'Explore Attiks Architecture portfolio of modern residential villas, bespoke commercial buildings, hospitality spaces, and contextual master plans.',
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Architecture Portfolio & Projects | ATTIKS Architecture',
    description:
      'Explore Attiks Architecture portfolio of modern residential villas, bespoke commercial buildings, hospitality spaces, and contextual master plans.',
    url: 'https://attiks.in/projects',
    siteName: 'ATTIKS Architecture',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architecture Portfolio & Projects | ATTIKS Architecture',
    description:
      'Explore Attiks Architecture portfolio of modern residential villas, bespoke commercial buildings, and contextual architecture.',
  },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Architectural Portfolio & Projects — ATTIKS Architecture',
    description:
      'Explore Attiks Architecture portfolio of modern residential villas, bespoke commercial buildings, hospitality spaces, and contextual master plans.',
    url: 'https://attiks.in/projects',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (projects || []).map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://attiks.in/projects/${project.id}`,
        name: project.title,
        image: project.image,
        description: project.description?.slice(0, 160),
      })),
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
        name: 'Projects',
        item: 'https://attiks.in/projects',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProjectsClientPage initialProjects={projects} />
    </>
  );
}


