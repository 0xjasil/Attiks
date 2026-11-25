import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobDetailClient from './JobDetailClient';
import { getJobPostingBySlugAction } from '@/actions/career.actions';
import '../careers.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobPostingBySlugAction(slug);

  if (!job) {
    return {
      title: 'Job Not Found | Attiks Architecture',
      description: 'The requested architectural position could not be found.',
    };
  }

  return {
    title: `${job.title} | Careers at Attiks Architecture`,
    description: job.summary || `${job.title} opening at Attiks Architecture in ${job.location}.`,
    openGraph: {
      title: `${job.title} — Attiks Architecture Careers`,
      description: job.summary,
      url: `https://attiks.in/careers/${job.slug}`,
      type: 'article',
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobPostingBySlugAction(slug);

  if (!job) {
    notFound();
  }

  // Generate Google JobPosting JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Attiks Architecture',
      value: job.id,
    },
    datePosted: job.createdAt || '2026-01-01',
    validThrough: '2027-12-31',
    employmentType: job.type === 'Full-time' ? 'FULL_TIME' : job.type === 'Part-time' ? 'PART_TIME' : 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Attiks Architecture & Interior Design Studio',
      sameAs: 'https://attiks.in',
      logo: 'https://attiks.in/images/traingle.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kochi',
        addressRegion: 'Kerala',
        addressCountry: 'IN',
      },
    },
    responsibilities: job.responsibilities.join('; '),
    qualifications: job.requirements.join('; '),
  };

  return (
    <main className="bf-careers">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <JobDetailClient job={job} />
      <Footer />
    </main>
  );
}
