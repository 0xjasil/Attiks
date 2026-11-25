import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { JobPosting, JobApplication, ApplicationStatus } from '@/types/careers';
import { defaultJobPostings } from '@/data/careers';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CAREERS_FILE = path.join(DATA_DIR, 'careers.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

const VALID_STATUSES: ApplicationStatus[] = [
  'NEW',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW',
  'REJECTED',
  'HIRED',
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Accepts either a newline-separated textarea string or an array. */
export function toList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const content = await readFile(file, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Local careers file write failed:', err);
  }
}

/* ------------------------------------------------------------------ */
/* Job postings                                                        */
/* ------------------------------------------------------------------ */

export async function readJobs(): Promise<JobPosting[]> {
  const parsed = await readJson<JobPosting[]>(CAREERS_FILE);
  if (Array.isArray(parsed)) return parsed;
  return defaultJobPostings;
}

export async function writeJobs(jobs: JobPosting[]): Promise<void> {
  await writeJson(CAREERS_FILE, jobs);
}

export function uniqueSlug(jobs: JobPosting[], desired: string, excludeId?: string): string {
  const base = slugify(desired) || 'job';
  let slug = base;
  let n = 2;
  while (jobs.some((j) => j.slug === slug && j.id !== excludeId)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

type RawJobInput = Record<string, unknown>;

/** Builds a full JobPosting from partial (often string-heavy) admin form input. */
export function buildJob(
  input: RawJobInput,
  existing?: JobPosting,
  allJobs: JobPosting[] = []
): JobPosting {
  const title = String(input.title ?? existing?.title ?? '').trim() || 'Untitled role';
  const id = existing?.id ?? `job-${Date.now()}`;
  const desiredSlug = input.slug ? String(input.slug) : existing?.slug || slugify(title);
  const orderRaw = Number(input.order ?? existing?.order);
  const status = String(input.status ?? existing?.status ?? 'published');

  return {
    id,
    slug: uniqueSlug(allJobs, desiredSlug, id),
    title,
    department: String(input.department ?? existing?.department ?? 'Architecture'),
    location: String(input.location ?? existing?.location ?? ''),
    type: String(input.type ?? existing?.type ?? 'Full-time'),
    experienceLevel: String(input.experienceLevel ?? existing?.experienceLevel ?? ''),
    summary: String(input.summary ?? existing?.summary ?? ''),
    description: String(input.description ?? existing?.description ?? ''),
    responsibilities: toList(input.responsibilities ?? existing?.responsibilities),
    requirements: toList(input.requirements ?? existing?.requirements),
    benefits: toList(input.benefits ?? existing?.benefits),
    status: status || 'published',
    order: Number.isFinite(orderRaw) && orderRaw > 0 ? orderRaw : (existing?.order ?? 1),
    featured: Boolean(input.featured ?? existing?.featured ?? false),
    createdAt: existing?.createdAt ?? new Date().toISOString().split('T')[0],
  };
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export async function readApplications(): Promise<JobApplication[]> {
  const parsed = await readJson<JobApplication[]>(APPLICATIONS_FILE);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeApplications(apps: JobApplication[]): Promise<void> {
  await writeJson(APPLICATIONS_FILE, apps);
}

export function normalizeStatus(value: unknown, fallback: ApplicationStatus = 'NEW'): ApplicationStatus {
  const status = String(value ?? '').toUpperCase() as ApplicationStatus;
  return VALID_STATUSES.includes(status) ? status : fallback;
}

/** Builds a stored application from the public modal payload. */
export function buildApplication(input: RawJobInput): JobApplication {
  const now = new Date().toISOString();
  return {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    jobId: input.jobId ? String(input.jobId) : undefined,
    jobTitle: String(input.jobTitle ?? '').trim() || 'General open application',
    jobSlug: input.jobSlug ? String(input.jobSlug) : undefined,
    department: input.department ? String(input.department) : undefined,
    fullName: String(input.fullName ?? '').trim(),
    email: String(input.email ?? '').trim(),
    phone: String(input.phone ?? '').trim(),
    portfolioUrl: input.portfolioUrl ? String(input.portfolioUrl).trim() : undefined,
    yearsOfExperience: input.yearsOfExperience ? String(input.yearsOfExperience) : undefined,
    coverNote: input.coverNote ? String(input.coverNote).trim() : undefined,
    resumeUrl: input.resumeUrl ? String(input.resumeUrl) : undefined,
    resumeFileName: input.resumeFileName ? String(input.resumeFileName) : undefined,
    notes: '',
    status: normalizeStatus(input.status),
    createdAt: now,
  };
}

export function validateApplication(input: RawJobInput): string | null {
  const fullName = String(input.fullName ?? '').trim();
  const email = String(input.email ?? '').trim();
  const phone = String(input.phone ?? '').trim();

  if (!fullName || !email || !phone) {
    return 'Full name, email, and phone are required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
}
