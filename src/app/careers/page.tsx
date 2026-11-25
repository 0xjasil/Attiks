import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CareersClient from './CareersClient';
import { getJobPostingsAction } from '@/actions/career.actions';
import { cultureGalleryItems } from '@/data/careers';
import './careers.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Careers | Join the Attiks studio',
  description:
    'Join Attiks Architecture in Kochi. Open roles for architects, interior designers, and visualizers who care about climate, material, and craft.',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers at Attiks Architecture',
    description: 'Open studio roles across architecture, interiors, landscape, and visualization.',
    url: 'https://attiks.in/careers',
    type: 'website',
  },
};

export default async function CareersPage() {
  const jobs = await getJobPostingsAction();

  return (
    <main className="bf-careers">
      <Navbar />
      <CareersClient initialJobs={jobs} cultureItems={cultureGalleryItems} />
      <Footer />
    </main>
  );
}
