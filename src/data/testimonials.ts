export interface Testimonial {
  id: string;
  author: string;
  designation: string;
  quote: string;
  rating?: number;
  active?: boolean;
  order?: number;
  createdAt?: string;
}

export const defaultTestimonials: Testimonial[] = [
  {
    id: 'testi-1',
    author: 'Arjun Menon',
    designation: 'Director, Greenfield Developments',
    quote: 'Attiks Architecture creates architecture that responds thoughtfully to context, material, climate and the experience of space.',
    rating: 5,
    active: true,
    order: 1,
    createdAt: '2026-01-15',
  },
  {
    id: 'testi-2',
    author: 'Priya Nair',
    designation: 'Founder, Bayshore Hospitality',
    quote: 'Their ability to translate complex requirements into elegant, timeless forms is what sets them apart. Every detail is considered.',
    rating: 5,
    active: true,
    order: 2,
    createdAt: '2026-02-10',
  },
  {
    id: 'testi-3',
    author: 'Ravi Shankar',
    designation: 'Trustee, Kerala Arts Foundation',
    quote: 'Working with the Attiks team was a deeply collaborative experience. They brought genuine vision and sensitivity to our project.',
    rating: 5,
    active: true,
    order: 3,
    createdAt: '2026-02-28',
  },
];
