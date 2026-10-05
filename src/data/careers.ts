import { JobPosting, CareerCultureItem } from '@/types/careers';

export const defaultJobPostings: JobPosting[] = [
  {
    id: 'job-1',
    slug: 'senior-project-architect',
    title: 'Senior Project Architect',
    department: 'Architecture',
    location: 'Kochi, Kerala (On-site / Studio)',
    type: 'Full-time',
    experienceLevel: '5+ Years Experience',
    summary: 'Lead bespoke residential and boutique hospitality commissions from concept conceptualization through technical site execution.',
    description: 'We are seeking an articulate, design-forward Senior Project Architect to lead key architectural projects across Kerala and South India. You will collaborate closely with the Studio Principals to evolve initial sketches into tectonic, climate-responsive structures rooted in materiality, light, and context.',
    responsibilities: [
      'Lead design development, master planning, and detailed construction documentation for luxury private villas and boutique hospitality resorts.',
      'Coordinate multidisciplinary engineering consultants, MEP, structural, and lighting designers to preserve spatial integrity.',
      'Conduct rigorous site reviews, structural inspections, and client presentations with articulate architectural communication.',
      'Mentor and guide junior architects, ensuring drawing rigor, detailing excellence, and adherence to studio quality standards.'
    ],
    requirements: [
      'B.Arch or M.Arch degree from an accredited institution with Council of Architecture (COA) registration.',
      '5+ years of verified professional studio experience in high-end residential, hospitality, or institutional design.',
      'Mastery in AutoCAD, Rhino / Revit, SketchUp, and the Adobe Creative Suite.',
      'Deep understanding of tropical climate strategies, exposed concrete, stone masonry, and timber joinery detailing.'
    ],
    benefits: [
      'Competitive compensation package benchmarked with leading national design practices.',
      'Opportunity to lead award-winning, published monograph projects.',
      'Studio wellness support, annual architectural research excursions, and professional conference sponsorships.',
      'Collaborative, non-hierarchical studio environment with direct mentorship from studio directors.'
    ],
    status: 'published',
    order: 1,
    featured: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'job-2',
    slug: 'senior-interior-architect',
    title: 'Senior Interior Architect & Designer',
    department: 'Interior Design',
    location: 'Kochi, Kerala (Studio)',
    type: 'Full-time',
    experienceLevel: '4+ Years Experience',
    summary: 'Craft refined interior spatial narratives, bespoke millwork, and tactile material palettes for luxury residences and curated spaces.',
    description: 'Attiks is looking for an exceptional Senior Interior Architect who bridges spatial architecture with refined material sensibility. You will conceptualize bespoke interior environments where light, custom furniture, tactile stones, and artisanal craftsmanship form cohesive living experiences.',
    responsibilities: [
      'Develop holistic interior design concepts, FF&E schedules, lighting plans, and bespoke joinery packages.',
      'Curate and source rare natural stones, hand-loomed textiles, artisanal metalwork, and customized architectural hardware.',
      'Liaise directly with high-profile clients, presenting material mood boards, 3D spatial simulations, and sample finishes.',
      'Supervise on-site interior installations, millwork fabrication, and artisan mockups to achieve museum-grade finishes.'
    ],
    requirements: [
      'Degree or Diploma in Interior Architecture, Interior Design, or Architecture.',
      '4+ years of proven experience in luxury residential, fine dining, or hospitality interiors.',
      'Proficiency in 3ds Max/V-Ray or Corona, SketchUp, AutoCAD, Photoshop, and InDesign.',
      'Sharp eye for proportion, bespoke furniture detailing, color harmony, and tactile textures.'
    ],
    benefits: [
      'Industry-leading salary with performance milestones.',
      'Direct partnerships with master artisans, stone quarries, and bespoke European craft manufacturers.',
      'Flexible studio hours and comprehensive health coverage.',
      'Paid sabbatical opportunities for personal design research and international exhibitions.'
    ],
    status: 'published',
    order: 2,
    featured: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'job-3',
    slug: 'computational-designer-visualizer',
    title: '3D Visualizer & Computational Designer',
    department: 'Visualization',
    location: 'Kochi, Kerala / Hybrid',
    type: 'Full-time',
    experienceLevel: '2+ Years Experience',
    summary: 'Translate studio architectural concepts into cinematic, emotive visual narratives and atmospheric imagery.',
    description: 'We are seeking an artistic 3D Architectural Visualizer with a refined cinematic eye. You will produce evocative imagery that captures the atmosphere, shadow, material patina, and ambient natural light of our architectural spaces for monographs, competitions, and client dialogues.',
    responsibilities: [
      'Produce photorealistic and evocative architectural visualizations with nuanced understanding of lighting, weather, and camera optics.',
      'Develop cinematic walk-through animations, environmental foliage simulations, and VR immersion presentations.',
      'Collaborate with the architectural design team during early exploratory phases to test volume, massing, and materiality.',
      'Maintain and expand the studio digital asset library with custom high-resolution PBR materials, scanned vegetation, and lighting presets.'
    ],
    requirements: [
      'Formal background in Architecture, Digital Arts, or 3D Architectural Visualization.',
      '2+ years of professional visualization experience in architectural or creative studios.',
      'Advanced expertise in 3ds Max / Corona Renderer / V-Ray / Unreal Engine 5, with post-production in Photoshop and DaVinci Resolve.',
      'Strong composition, color grading, and artistic storytelling instincts (portfolio of work is essential).'
    ],
    benefits: [
      'High-performance dedicated rendering workstations with dual RTX GPUs.',
      'Creative freedom to explore stylized and cinematic architectural film techniques.',
      'Hybrid work flexibility with studio collaboration days.',
      'Annual hardware/software allowance for personal creative development.'
    ],
    status: 'published',
    order: 3,
    featured: false,
    createdAt: '2026-02-15'
  }
];

export const cultureGalleryItems: CareerCultureItem[] = [
  {
    id: 'cult-1',
    title: 'The open studio ethos',
    subtitle: 'Collaborative discourse',
    description: 'Our design studio operates as a laboratory for ideas where critique is collaborative and hierarchy dissolves in pursuit of architectural clarity.',
    image: '/team_photo.webp'
  },
  {
    id: 'cult-2',
    title: 'Material tactility & research',
    subtitle: 'Craft & fabrication',
    description: 'We frequently visit local stone quarries, timber mills, and metal ateliers to experiment directly with the physical nature of materials.',
    image: '/value_design.webp'
  },
  {
    id: 'cult-3',
    title: 'Context & climate dialogue',
    subtitle: 'Tropical modernism',
    description: 'We build structures that breathe, shade, and age gracefully with the monsoon, sun, and surrounding ecological landscapes.',
    image: '/architecture.webp'
  },
  {
    id: 'cult-4',
    title: 'Continuous exploration',
    subtitle: 'Research & monograph',
    description: 'Studio travel, site studies, and publication milestones nurture a lifelong pursuit of spatial excellence and architectural culture.',
    image: '/philosophy.webp'
  }
];
