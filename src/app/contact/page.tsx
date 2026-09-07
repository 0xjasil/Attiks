import type { Metadata } from 'next';
import ContactClientPage from './ContactClientPage';

export const metadata: Metadata = {
  title: 'Contact & Architectural Consultations',
  description:
    'Initiate a dialogue with Attiks Architecture. Connect with our architectural studio in Kerala for residential, commercial, and interior design commissions.',
  keywords: [
    'Contact Attiks Architecture',
    'Architectural Consultation Kerala',
    'Hire Architects Calicut',
    'Residential Design Consultation',
    'Commercial Project Inquiry',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact & Consultations | ATTIKS Architecture',
    description:
      'Initiate a dialogue with Attiks Architecture. Connect with our architectural studio in Kerala for residential, commercial, and interior design commissions.',
    url: 'https://attiks.in/contact',
    siteName: 'ATTIKS Architecture',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Consultations | ATTIKS Architecture',
    description: 'Initiate a dialogue with Attiks Architecture studio.',
  },
};

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact ATTIKS Architecture',
    description:
      'Initiate a dialogue with Attiks Architecture. Connect with our architectural studio in Kerala for residential, commercial, and interior design commissions.',
    url: 'https://attiks.in/contact',
    mainEntity: {
      '@type': 'ArchitecturalStudio',
      name: 'ATTIKS Architecture',
      url: 'https://attiks.in',
      telephone: '+91-0483-2941308',
      email: 'info@attiks.in',
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
        name: 'Contact',
        item: 'https://attiks.in/contact',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactClientPage />
    </>
  );
}

