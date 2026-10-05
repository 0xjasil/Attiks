'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { JobPosting, CareerCultureItem } from '@/types/careers';
import ApplicationModal from '@/components/ApplicationModal';
import PageHeader from '@/components/PageHeader';

interface Props {
  initialJobs: JobPosting[];
  cultureItems: CareerCultureItem[];
}

const DEPARTMENTS: { key: string; label: string }[] = [
  { key: 'all', label: 'All disciplines' },
  { key: 'Architecture', label: 'Architecture' },
  { key: 'Interior Design', label: 'Interior design' },
  { key: 'Landscape', label: 'Landscape' },
  { key: 'Visualization', label: 'Visualization' },
  { key: 'Admin', label: 'Admin & ops' },
  { key: 'Internship', label: 'Internship' },
];

const FAQS = [
  {
    q: 'Is this a long term role?',
    a: 'Yes. We hire people who want to grow with the studio, lead commissions, and stay through the long arc of design, construction, and craft.',
  },
  {
    q: 'What kind of people are we looking for?',
    a: 'Curious, independent designers with low ego and high output. We care more about spatial judgment, material curiosity, and ownership than a perfect software stack.',
  },
  {
    q: 'Where is the studio located?',
    a: 'Kochi, Kerala. Roles are studio-first, with hybrid options on selected visualization and research positions.',
  },
];

export default function CareersClient({ initialJobs, cultureItems }: Props) {
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id?: string; title?: string; slug?: string } | null>(null);

  const filteredJobs = initialJobs.filter((job) => {
    if (activeDepartment === 'all') return true;
    return job.department.toLowerCase() === activeDepartment.toLowerCase();
  });

  const handleOpenApplication = (job?: JobPosting) => {
    if (job) {
      setSelectedJob({ id: job.id, title: job.title, slug: job.slug });
    } else {
      setSelectedJob({ title: 'General open application' });
    }
    setModalOpen(true);
  };

  return (
    <div>
      <section className="bf-hero">
        <div className="bf-wrap">
          <div className="bf-hero__inner">
            <PageHeader
              label="Careers at Attiks"
              title={<>Become part of{' '}<br />the studio</>}
            />
            <p className="bf-copy" style={{ marginTop: '-8px', fontSize: 'clamp(16px, 1.15vw, 19px)', maxWidth: '780px' }}>
              Attiks is a Kochi architecture and interiors practice. Join us and help design spaces that outlast us — climate-led, materially honest, and built with care.
            </p>
            <div className="bf-hero__actions">
              <a className="bf-btn" href="#open-positions">
                Explore roles ({initialJobs.length})
                <ArrowDown size={16} aria-hidden="true" />
              </a>
              <button type="button" className="bf-btn bf-btn--ghost" onClick={() => handleOpenApplication()}>
                Open application
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bf-section" aria-labelledby="life-heading">
        <div className="bf-wrap">
          <div className="bf-section__head">
            <p className="bf-kicker">Life & practice</p>
            <h2 id="life-heading" className="bf-label">
              A laboratory of craft, light, and dialogue.
            </h2>
            <p className="bf-copy">
              The Kochi studio is an incubator for design experiments. We reject formulaic solutions in favor of tectonic rigor, climate, and hand-drawn ideation.
            </p>
          </div>
          <div className="bf-gallery">
            {cultureItems.map((item) => (
              <article key={item.id} className="bf-card">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="bf-card__overlay">
                  <p className="bf-card__kicker">{item.subtitle}</p>
                  <h3 className="bf-label">{item.title}</h3>
                  <p className="bf-copy" style={{ marginTop: '8px' }}>
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="open-positions" className="bf-section" aria-labelledby="jobs-heading">
        <div className="bf-wrap">
          <div className="bf-section__head">
            <p className="bf-kicker">Careers</p>
            <h2 id="jobs-heading" className="bf-label">
              Open positions
            </h2>
            <p className="bf-copy">
              Attiks is a design-led studio. Join the team and help create the most considered work in the region.
            </p>
          </div>

          <div className="bf-filters" role="tablist" aria-label="Filter by discipline">
            {DEPARTMENTS.map((dept) => {
              const isActive = activeDepartment === dept.key;
              return (
                <button
                  key={dept.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`bf-chip${isActive ? ' is-active' : ''}`}
                  onClick={() => setActiveDepartment(dept.key)}
                >
                  {dept.label}
                </button>
              );
            })}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bf-empty">
              <h3 className="bf-label-sans">No opening in this discipline right now.</h3>
              <p className="bf-copy" style={{ margin: '12px auto 24px' }}>
                We welcome exceptional architects, designers, and visualizers. Send an open application and we will keep your portfolio on file.
              </p>
              <button type="button" className="bf-btn" onClick={() => handleOpenApplication()}>
                Submit open application
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="bf-jobs">
              {filteredJobs.map((job) => (
                <Link key={job.id} href={`/careers/${job.slug}`} className="bf-job">
                  <div>
                    <h3 className="bf-job__title">{job.title}</h3>
                    <p className="bf-copy" style={{ marginTop: '6px', maxWidth: 'none' }}>
                      {job.experienceLevel}
                    </p>
                  </div>
                  <div className="bf-job__meta">
                    <span>{job.location}</span>
                    <span>{job.type}</span>
                    <span>{job.department}</span>
                  </div>
                  <span className="bf-btn">
                    View role
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bf-section" aria-labelledby="own-job-heading">
        <div className="bf-wrap">
          <div className="bf-split-card">
            <div className="bf-split">
              <div>
                <p className="bf-kicker">Don’t wait for opportunity. Build it.</p>
                <h2 id="own-job-heading" className="bf-label">
                  Create your own job
                </h2>
              </div>
              <div>
                <p className="bf-copy">
                  We’re always looking for ambitious talent who want to shape the future of tropical architecture with us.
                </p>
                <button
                  type="button"
                  className="bf-btn"
                  style={{ marginTop: '24px' }}
                  onClick={() => handleOpenApplication()}
                >
                  Send portfolio
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bf-section" aria-labelledby="faq-heading">
        <div className="bf-wrap">
          <div className="bf-section__head">
            <p className="bf-kicker">Questions</p>
            <h2 id="faq-heading" className="bf-label">
              Is your question missing? Send us a message.
            </h2>
          </div>
          <div className="bf-faq">
            {FAQS.map((item) => (
              <details key={item.q} className="bf-acc">
                <summary className="bf-acc__btn">{item.q}</summary>
                <div className="bf-acc__body">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bf-section bf-section--cta" aria-labelledby="cta-heading">
        <div className="bf-wrap">
          <div className="bf-cta">
            <p className="bf-kicker" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              Join the movement
            </p>
            <h2 id="cta-heading" className="bf-display" style={{ color: '#ffffff' }}>
              Want to build with the next generation of spatial designers?
            </h2>
            <p className="bf-copy" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              Send a concise portfolio. If there is alignment, we will start a conversation.
            </p>
            <button type="button" className="bf-btn bf-btn--white" onClick={() => handleOpenApplication()}>
              Apply now
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <ApplicationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedJob(null);
        }}
        jobId={selectedJob?.id}
        jobTitle={selectedJob?.title}
        jobSlug={selectedJob?.slug}
      />
    </div>
  );
}
