export interface HeroSlide {
  id: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  posterUrl?: string;
  altText?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  active: boolean;
  createdAt?: string;
}

export interface HeroSettings {
  autoPlayInterval: number; // in milliseconds (e.g. 6500)
  showPagination: boolean;
  showCta: boolean;
  defaultCtaText: string;
  defaultCtaLink: string;
}

export interface HeroData {
  slides: HeroSlide[];
  settings: HeroSettings;
}

export const defaultHeroSettings: HeroSettings = {
  autoPlayInterval: 6500,
  showPagination: true,
  showCta: true,
  defaultCtaText: 'view projects',
  defaultCtaLink: '/projects',
};

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    mediaType: 'video',
    mediaUrl: '/3735-173719892_medium.mp4',
    altText: 'Monolithic concrete residence architecture designed by Attiks',
    title: 'Monolithic Architectural Expression',
    subtitle: 'Modern Tropical Living & Proportions',
    ctaText: 'view projects',
    ctaLink: '/projects',
    order: 1,
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'hero-2',
    mediaType: 'video',
    mediaUrl: '/3967-175963622_medium.mp4',
    altText: 'Spatial light and courtyard pavilion designed by Attiks Architecture',
    title: 'Spatial Light & Concrete Harmony',
    subtitle: 'Sustainable Residential Pavilions',
    ctaText: 'view projects',
    ctaLink: '/projects',
    order: 2,
    active: true,
    createdAt: '2026-01-02',
  },
  {
    id: 'hero-3',
    mediaType: 'video',
    mediaUrl: '/85348-590746467_medium.mp4',
    altText: 'Vernacular timber and stone craftsmanship across Kerala residential design',
    title: 'Vernacular Craft & Materiality',
    subtitle: 'Enduring Spaces Across Kerala',
    ctaText: 'view projects',
    ctaLink: '/projects',
    order: 3,
    active: true,
    createdAt: '2026-01-03',
  },
];

