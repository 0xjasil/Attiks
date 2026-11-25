'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, Clock, Award, Share2, Check } from 'lucide-react';
import { JobPosting } from '@/types/careers';
import ApplicationModal from '@/components/ApplicationModal';

interface Props {
  job: JobPosting;
}

export default function JobDetailClient({ job }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bf-detail">
      <div className="bf-wrap">
        <Link href="/careers" className="bf-back">
          <ArrowLeft size={16} aria-hidden="true" />
          All career openings
        </Link>

        <div className="bf-detail-grid">
          <div>
            <p className="bf-kicker">{job.department}</p>
            <h1 className="bf-display">{job.title}</h1>
            <div className="bf-meta-row">
              <span className="bf-pill">
                <MapPin size={16} aria-hidden="true" />
                {job.location}
              </span>
              <span className="bf-pill">
                <Clock size={16} aria-hidden="true" />
                {job.type}
              </span>
              <span className="bf-pill">
                <Award size={16} aria-hidden="true" />
                {job.experienceLevel}
              </span>
            </div>

            <section className="bf-block">
              <h2 className="bf-label">The role</h2>
              <p className="bf-copy" style={{ marginTop: 'var(--space-2)' }}>
                {job.description}
              </p>
            </section>

            {job.responsibilities?.length > 0 && (
              <section className="bf-block">
                <h2 className="bf-label">Key responsibilities</h2>
                <ul className="bf-list">
                  {job.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section className="bf-block">
                <h2 className="bf-label">Qualifications</h2>
                <ul className="bf-list">
                  {job.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.benefits?.length > 0 && (
              <section className="bf-block">
                <h2 className="bf-label">What we offer</h2>
                <div className="bf-perk-grid">
                  {job.benefits.map((item) => (
                    <div key={item} className="bf-perk">
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="bf-aside">
            <p className="bf-kicker">
              Join our studio
            </p>
            <h3 className="bf-label">
              Ready to shape spaces with us?
            </h3>
            <p className="bf-copy">
              Submit your CV and a curated portfolio sample (PDF, max 10MB) for review.
            </p>
            <button type="button" className="bf-btn" onClick={() => setModalOpen(true)}>
              Apply for this role
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" className="bf-btn bf-btn--ghost" onClick={handleShare}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
              {copied ? 'Link copied' : 'Share role'}
            </button>
          </aside>
        </div>
      </div>

      <ApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        jobSlug={job.slug}
        department={job.department}
      />
    </div>
  );
}
