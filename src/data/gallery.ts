export interface GalleryPost {
  id: string;
  image: string;
  caption: string;
  altText?: string;
  description?: string;
  location?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  createdAt?: string;
  active?: boolean;
  order?: number;
}

export const defaultGalleryPosts: GalleryPost[] = [
  {
    id: 'post-1',
    image: '/uploads/gallery_post_1.webp',
    caption: 'Attiks Architecture Studio',
    altText: 'Interior of Attiks architectural design studio in Calicut showcasing material palettes and workspace',
    description: 'Inside our design studio where materiality, climate, and spatial proportions come together.',
    location: 'Calicut, Kerala',
    aspectRatio: 'landscape',
    createdAt: '2026-03-01',
    active: true,
    order: 1,
  },
  {
    id: 'post-2',
    image: '/uploads/gallery_post_2.webp',
    caption: 'Principal Design Atelier',
    altText: 'Architectural blueprints, drawings, and 3D scale models in Attiks design atelier',
    description: 'Collaborative architectural dialogue shaping enduring structures across Kerala.',
    location: 'Kochi, Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-02-28',
    active: true,
    order: 2,
  },
  {
    id: 'post-3',
    image: '/uploads/gallery_post_3.webp',
    caption: 'Biennale Pavilion Exhibition',
    altText: 'Contemporary timber pavilion installation with natural light interplay at Kochi Biennale',
    description: 'Experimental pavilion exploring vernacular timber joinery and passive airflow.',
    location: 'Fort Kochi, Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-02-24',
    active: true,
    order: 3,
  },
  {
    id: 'post-4',
    image: '/uploads/gallery_post_4.webp',
    caption: 'Materials & Craft Lab',
    altText: 'Sustainable terracotta brickwork and rammed earth texture testing in materials workshop',
    description: 'Physical mockups and sustainable clay masonry experiments.',
    location: 'Wayanad, Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-02-20',
    active: true,
    order: 4,
  },
  {
    id: 'post-5',
    image: '/uploads/gallery_post_5.webp',
    caption: 'Vernacular Craft & People',
    altText: 'Generational Kerala stonemasons and artisans carving laterite building blocks on site',
    description: 'Working alongside generational stone artisans and timber craftsmen.',
    location: 'Calicut, Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-02-15',
    active: true,
    order: 5,
  },
  {
    id: 'post-6',
    image: '/uploads/gallery_post_6.webp',
    caption: 'Principal Leadership',
    altText: 'Principal architect of Attiks examining construction progress on residential site',
    description: 'Guiding philosophy: architecture should serve both people and place.',
    location: 'Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-02-10',
    active: true,
    order: 6,
  },
  {
    id: 'post-7',
    image: '/uploads/gallery_post_7.webp',
    caption: 'Design & Spatial Dialogue',
    altText: 'Client consultation and conceptual design sketching session at Attiks Architecture',
    description: 'Translating client visions into tangible, timeless spatial experiences.',
    location: 'Thrissur, Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-02-05',
    active: true,
    order: 7,
  },
  {
    id: 'post-8',
    image: '/uploads/gallery_post_8.webp',
    caption: 'Attiks Architectural Collective',
    altText: 'Attiks multidisciplinary team of architects, project managers, and interior designers',
    description: 'The multidisciplinary minds behind our residential and commercial portfolio.',
    location: 'Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-01-28',
    active: true,
    order: 8,
  },
  {
    id: 'post-9',
    image: '/uploads/gallery_post_9.webp',
    caption: 'Biophilic Form & Innovation',
    altText: 'Modern tropical courtyard featuring indoor water body, skylight, and native foliage',
    description: 'Integrating lush tropical greenery seamlessly with monolithic concrete walls.',
    location: 'Kochi, Kerala',
    aspectRatio: 'portrait',
    createdAt: '2026-01-20',
    active: true,
    order: 9,
  },
];

