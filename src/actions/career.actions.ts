'use server';

import { readJobs } from '@/lib/careers-store';
import { JobPosting } from '@/types/careers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

function publishedJobs(jobs: JobPosting[]) {
  return jobs
    .filter((job) => job.status === 'published')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getJobPostingsAction(): Promise<JobPosting[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/careers`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json.data) ? json.data : json.data?.items || [];
      if (items.length > 0) return publishedJobs(items);
    }
  } catch {
    // Fall back to local store (seed data or admin-managed jobs)
  }
  return publishedJobs(await readJobs());
}

export async function getJobPostingBySlugAction(slug: string): Promise<JobPosting | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/careers/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      const job = json.data || json;
      if (job?.slug) return job as JobPosting;
    }
  } catch {
    // Fall back to local store (seed data or admin-managed jobs)
  }

  const jobs = await getJobPostingsAction();
  return jobs.find((job) => job.slug === slug) || null;
}
