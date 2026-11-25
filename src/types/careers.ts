export type Department =
  | 'Architecture'
  | 'Interior Design'
  | 'Landscape'
  | 'Visualization'
  | 'Admin'
  | 'Internship';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: Department | string;
  location: string;
  type: JobType | string;
  experienceLevel: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: 'published' | 'draft' | 'archived' | string;
  order: number;
  featured?: boolean;
  createdAt?: string;
}

export interface CareerCultureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export type ApplicationStatus =
  | 'NEW'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'HIRED';

export interface JobApplication {
  id: string;
  jobId?: string;
  jobTitle: string;
  jobSlug?: string;
  department?: string;
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  yearsOfExperience?: string;
  coverNote?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  notes?: string;
  status: ApplicationStatus;
  createdAt: string;
}
