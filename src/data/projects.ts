export type Category = 'all' | 'residential' | 'commercial' | 'hospitality' | 'institutional' | 'landscape' | 'interior';

export const categories: { label: string; value: Category }[] = [
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Institutional', value: 'institutional' },
  { label: 'Landscape', value: 'landscape' },
  { label: 'Interior', value: 'interior' },
];

export interface Project {
  id: string;
  title: string;
  category: Category;
  location: string;
  year: string;
  image: string;
  imageAlt?: string;
  description: string;
  highlights?: string[];
  gallery?: string[];
  galleryAlts?: string[];
  scope?: string;
  area?: string;
  status?: 'published' | 'draft';
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  designation: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName?: string;
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  experience?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft';
  image: string;
}

export interface LeadEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'archived';
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  url: string;
  sizeBytes: number;
  format: string;
  dimensions: string;
  altText: string;
  uploadedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface RolePermission {
  id: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  description: string;
  permissions: string[];
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  enableLeadsNotification: boolean;
  maintenanceMode: boolean;
}

export const projects: Project[] = [
  {
    "id": "tech-park",
    "title": "Soori Residence ",
    "category": "residential",
    "location": "Coimbatore, Tamil Nadu",
    "year": "2026",
    "image": "/uploads/img_1788003575720_attiks-136.jpg",
    "description": "A home shaped by its context, its climate, and the everyday life of its occupants.\n\nDesigned as a composition of volumes, courtyards, transitions and carefully considered spaces, Soori Residence explores a quiet dialogue between architecture and nature.\n\nThe experience unfolds gradually from the approach and arrival to the more intimate spaces within with light, landscape, material and scale working together to create a sense of continuity throughout the home.\n\nEvery element was considered not only as an object, but as part of the experience of living.",
    "highlights": [
      "Soori Residence | Coimbatore"
    ],
    "gallery": [
      "/uploads/img_1788003644615_attiks-46.jpg",
     "/uploads/img_1788003669444_attiks-115.jpg"
    ],
    "scope": "Masterplanning & Architecture",
    "area": "7800 Sqf",
    "status": "published",
    "featured": true
  },
  {
    "id": "coastal-villa",
    "title": "Jannath Ayisha",
    "category": "residential",
    "location": "Varkala, Kerala",
    "year": "2024",
    "image": "/uploads/img_1788004263217_x-20.jpg",
    "description": "Jannath Ayisha Residence is conceived as a tropical modern home that celebrates scale, light, and landscape. The design embraces generous volumes that create a sense of openness, while expansive openings allow natural light to define and transform the interiors throughout the day. Framed by lush landscaping, the residence establishes a seamless dialogue between indoor and outdoor spaces, merging the warmth of tropical living with the clarity and precision of contemporary design.",
    "highlights": [
      "Panoramic Ocean Vistas",
      "Locally Sourced Laterite",
      "Natural Sea Breeze Corridors"
    ],
    "scope": "Residential Architecture & Landscape",
    "area": "6,200 sq.ft",
    "status": "published",
    "featured": true,
    "gallery": [
      "/uploads/img_1788004496155_UC_TH--12.jpg",
      "/uploads/img_1788004496285_x-17.jpg",
   "/uploads/img_1788004498026_x-42.jpg",
      "/uploads/img_1788004498185_x-43.jpg"
    ]
  },
  {
    "id": "arts-center",
    "title": "The Edge Convention Center",
    "category": "residential",
    "location": " Malappuram, Kerala,",
    "year": "2024",
    "image": "/uploads/img_1788004592408_Set01__34_.jpg",
    "description": "The Edge by Attiks Architecture\n\nThis convention center, at a glance gives a modern and contemporary outlook with which, building itself creates uniqueness and brings harmony to its surrounding spaces. The main intention was to maximize the land utilization with minimum footprint. Hence the design envisioned on split level, establishing maximum view and space utilization.\n\nThe project consist of a banquet hall that can seat up to 800 people and 1200 to dine, the custom made lights and the seating arrangements makes the hall more attractive. Adjacent to the main hall, there is a Lobby and a VIP lounge with separate dining space.\n\nCheckout The Full Project Here: Link in the bio\n\nProject Details:\nProject Name: The Edge ( Convention Center)\nLocation: Panthavoor, Malappuram, Kerala, India\nBuilt-up Area: 33000 sq.ft.\nCost: Undisclosed\nCompletion Year: 2022",
    "highlights": [
      "Acoustic Auditorium",
      "Open-Air Amphitheater",
      "Daylight-Filtered Galleries"
    ],
    "scope": "Institutional & Cultural Campus",
    "area": "33,765 sq.ft ",
    "status": "published",
    "featured": true,
    "gallery": [
      "/uploads/img_1788004679585_Set01__34_.jpg",
    ]
  },
  {
    "id": "beach-resort",
    "title": "Pavilion House",
    "category": "interior",
    "location": "Ponnani, Kerala",
    "year": "2023",
    "image": "/uploads/img_1788005063615_DSC08120-Edit-1.jpg.jpeg",
    "description": "The main idea was to merge the built with in the landscape. As the building ages and trees grow, the built and unbuilt will become more and more seamless. The design response primarily to the context and brings its essence with in. The central court is kept as the focus by the allure of red bricks representing the traditional nadumuttom. Area have been woven together to create seamless floor spaces with a few landscaped elements. The split-level renders better connectivity within the house, allowing private spaces to overlook the central court. The Material palette is kept minimal, Kota stone flooring captures reflection and while exposed concrete ceiling add a rustic charm. Wooden flooring and the details bring in richness, with white walls tying it all together. Courtyards have been designed to serve multiple functions, making the space flexible and multifunctional. Deck could occasionally turn into a gathering space / even a stage during festive gathering which the client had expressed a need for early on, in their requirements. Skylights were added to create interest within the space. A well-lit home, the house sufficiently lit in the daytime with the light that comes in through skylight and slit windows eliminating the need for artificial.",
    "highlights": [
      "Vernacular Sloping Roofs",
      "Private Plunge Pools",
      "Eco-Sensitive Coastline Footprint"
    ],
    "scope": "Hospitality Architecture & Interiors",
    "area": "72,000 sq.ft",
    "status": "published",
    "featured": true,
    "gallery": [
     "/uploads/img_1788005109147_DSC08115-Edit-2.jpg.jpeg",
      "/uploads/img_1788005112574_DSC08076-Edit-14.jpg.jpeg"
    ]
  },
  {
    "id": "heritage-school",
    "title": "Heritage Academy",
    "category": "institutional",
    "location": "Malappuram, Kerala",
    "year": "2023",
    "image": "/uploads/img_1788005287699_42.png",
    "description": "An educational campus that reinterprets traditional Kerala architectural motifs within a contemporary institutional framework.",
    "highlights": [
      "Shaded Verandah Corridors",
      "Central Amphitheater Plaza",
      "Solar-Optimized Classrooms"
    ],
    "scope": "Educational Campus Masterplan",
    "area": "95,000 sq.ft",
    "status": "published",
    "featured": false,
    "gallery": [
      "/uploads/img_1788005339901_bridge_003.png",
     "/uploads/img_1788005360242_45.png"
    ]
  },
  {
    "id": "al-jamia-campus",
    "title": "Al Jamia Knowledge World",
    "category": "institutional",
    "location": "Malappuram, Kerala",
    "year": "2025",
    "image": "/uploads/img_1788005358786_53.png",
    "description": "Al Jamia Knowledge World is a sprawling educational campus designed by Attiks Architecture for the Al Jamia educational institutions in Malappuram, Kerala.\n\nThe campus encompasses the Al Jamia Arts & Science School and supporting institutional facilities, conceived as a cohesive architectural landscape that responds to the tropical climate and pedagogical vision of the institution.\n\nThe design integrates skylights, bridged circulation, and open courtyards to create learning environments that are naturally lit, well-ventilated, and deeply connected to their surroundings. Every space — from classrooms to transitional corridors — is crafted to foster curiosity, collaboration, and a sense of belonging.\n\nRecognised by the grand jury's shortlisted entries for notable architectural achievements, the project represents Attiks Architecture's commitment to meaningful institutional design.",
    "highlights": [
      "Al Jamia Arts & Science School Campus",
      "Grand Jury Shortlisted Design",
      "Climate-Responsive Institutional Architecture"
    ],
    "gallery": [
      "/uploads/img_1788005339901_bridge_003.png",
   "/uploads/img_1788005359569_039.png"
    ],
    "scope": "Institutional Campus Masterplan & Architecture",
    "area": "95,000 sq.ft",
    "status": "published",
    "featured": true
  }
];

export const testimonials: Testimonial[] = [
  {
    "id": "testi-1",
    "quote": "Attiks Architecture creates architecture that responds thoughtfully to context, material, climate and the experience of space.",
    "author": "Arjun Menon",
    "designation": "Director, Greenfield Developments"
  },
  {
    "id": "testi-2",
    "quote": "Their ability to translate complex requirements into elegant, timeless forms is what sets them apart. Every detail is considered.",
    "author": "Priya Nair",
    "designation": "Founder, Bayshore Hospitality"
  },
  {
    "id": "testi-3",
    "quote": "Working with the Attiks team was a deeply collaborative experience. They brought genuine vision and sensitivity to our project.",
    "author": "Ravi Shankar",
    "designation": "Trustee, Kerala Arts Foundation"
  }
];

export const services: ServiceItem[] = [
  {
    "id": "srv-1",
    "title": "Architectural Design",
    "category": "Core Service",
    "description": "Comprehensive master planning, residential, commercial, and institutional building design.",
    "featured": true
  },
  {
    "id": "srv-2",
    "title": "Interior Architecture",
    "category": "Interiors",
    "description": "Bespoke spatial design, custom furniture curation, material selection, and ambient lighting.",
    "featured": true
  },
  {
    "id": "srv-3",
    "title": "Landscape Architecture",
    "category": "Environment",
    "description": "Contextual outdoor spaces integrating natural flora, waterbodies, and passive cooling courtyards.",
    "featured": true
  },
  {
    "id": "srv-4",
    "title": "Heritage Conservation",
    "category": "Restoration",
    "description": "Restoration and contemporary adaptive reuse of traditional Kerala architecture and structures.",
    "featured": false
  }
];

export const team: TeamMember[] = [
  {
    "id": "team-1",
    "name": "Ar. Anoop Kumar",
    "role": "Principal Architect & Founder",
    "bio": "Leading practice vision with over 18 years of experience in tropical and modern architecture.",
    "image": "/images/hero-1.webp",
    "experience": "18+ Years"
  },
  {
    "id": "team-2",
    "name": "Ar. Meera Ravindran",
    "role": "Senior Project Lead",
    "bio": "Specialist in sustainable residential designs, timber details, and passive solar planning.",
    "image": "/images/hero-2.webp",
    "experience": "12+ Years"
  },
  {
    "id": "team-3",
    "name": "Karan Sharma",
    "role": "Head of Interiors & Detailing",
    "bio": "Focuses on luxury hospitality and minimalist high-end residential interiors.",
    "image": "/images/hero-3.webp",
    "experience": "10+ Years"
  }
];

export const blogPosts: BlogPost[] = [
  {
    "id": "post-1",
    "title": "Passive Cooling Strategies in Tropical Architecture",
    "slug": "passive-cooling-tropical-architecture",
    "summary": "How courtyard ventilation and thermal mass laterite reduce energy footprints in humid climates.",
    "content": "Detailed study on tropical building orientation, natural breeze corridors, and timber louvers.",
    "author": "Ar. Anoop Kumar",
    "publishedAt": "2026-07-15",
    "status": "published",
    "image": "/architecture.webp"
  },
  {
    "id": "post-2",
    "title": "Material Honesty: Laterite, Teak, and Micro-Cement",
    "slug": "material-honesty-laterite-teak-cement",
    "summary": "Exploring contextual materiality and tactile longevity in modern Kerala homes.",
    "content": "In-depth analysis of locally sourced stone, reclaimed teakwood, and seamless floor finishes.",
    "author": "Ar. Meera Ravindran",
    "publishedAt": "2026-08-02",
    "status": "published",
    "image": "/coastal_palace.webp"
  }
];

export const siteSettings = {
  "siteTitle": "ATTIXS | Modern Architectural Masterpieces",
  "tagline": "Contextual, Enduring Architecture Shaped by Climate and Material",
  "contactEmail": "info@attiks.in",
  "contactPhone": "+91-0483-2941308",
  "address": "#1/523, Krishna Building, NH 66, Azhinhilam PO, Calicut, Kerala",
  "enableLeadsNotification": true,
  "maintenanceMode": false
};
