import type { Metadata } from 'next';
import AboutClientPage from './AboutClientPage';

export const metadata: Metadata = {
  title: 'About Our Studio — Philosophy, Leadership & Architectural Craft',
  description:
    'Discover Attiks Architecture practice based in Kerala. Explore our design philosophy, principal architects, sustainable materiality, and contextual architectural heritage.',
  keywords: [
    'About Attiks Architecture',
    'Kerala Architects Studio',
    'Sustainable Architecture Practice',
    'Principal Architect Kerala',
    'Tropical Architecture Philosophy',
    'Contextual Design Atelier',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Attiks Architecture — Enduring Spatial Design',
    description:
      'Shaping contextual, enduring architecture informed by climate, material, and spatial experience.',
    url: 'https://attiks.in/about',
    images: [
      {
        url: '/team_photo.webp',
        width: 1200,
        height: 630,
        alt: 'Attiks Architecture Principal Studio and Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Attiks Architecture Studio',
    description: 'Contextual, enduring architecture shaped by climate, material, and space.',
    images: ['/team_photo.webp'],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ATTIKS Architecture Studio',
    description:
      'Discover Attiks Architecture practice based in Kerala. Explore our design philosophy, principal architects, sustainable materiality, and contextual architectural heritage.',
    url: 'https://attiks.in/about',
    mainEntity: {
      '@type': 'ArchitecturalStudio',
      name: 'ATTIKS Architecture',
      url: 'https://attiks.in',
      image: 'https://attiks.in/team_photo.webp',
      description:
        'A Kerala-based architecture practice shaping contextual, enduring spaces informed by climate, material, and spatial experience.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '#1/523, Krishna Building, NH 66, Azhinhilam PO',
        addressLocality: 'Calicut',
        addressRegion: 'Kerala',
        postalCode: '673632',
        addressCountry: 'IN',
      },
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
        name: 'About',
        item: 'https://attiks.in/about',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutClientPage />
    </>
  );
}

