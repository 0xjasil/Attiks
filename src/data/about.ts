export interface AboutDirector {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface AboutTeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface AboutPageData {
  hero: {
    bannerImage: string;
    bannerAlt: string;
  };
  philosophy: {
    paragraph1: string;
    paragraph2: string;
    image: string;
    imageAlt: string;
  };
  foundation: {
    sectionTitle: string;
    directors: AboutDirector[];
  };
  team: {
    sectionTitle: string;
    members: AboutTeamMember[];
  };
}

export const defaultAboutData: AboutPageData = {
  hero: {
    bannerImage: '/images/about/small_SBCL2379265.webp',
    bannerAlt: 'Attiks Architecture studio team gathered at the practice atelier',
  },
  philosophy: {
    paragraph1:
      'Attiks Architecture approaches architecture as a contextual and evolving discipline, shaped by the relationship between people, place, and time. The practice seeks to develop spaces that are responsive to their physical, cultural, and environmental contexts, while establishing a clear and enduring architectural identity.',
    paragraph2:
      'This philosophy forms the foundation of Attiks Architecture, established in 2014 with a vision to advance innovative and sustainable architectural practices. The practice evolved from M/s P.K. Aslam Architects, founded by Ar. P.K. Aslam in 1997, which developed into a well-established and reputed architectural practice over the years. In response to an evolving architectural landscape, the firm came together with a new generation of young and dynamic architects, laying the foundation for Attiks Architecture.',
    image: '/images/about/partners_group.webp',
    imageAlt: 'Attiks Architecture leadership partners discussion in Calicut',
  },
  foundation: {
    sectionTitle: 'The Foundation',
    directors: [
      {
        id: 'dir-1',
        name: 'Ar. Mohamed Aslam P K',
        role: 'Principal Architect',
        image: '/images/about/partner_aslam.webp',
      },
      {
        id: 'dir-2',
        name: 'Ar. Mahir Aalam P',
        role: 'Co - founder',
        image: '/images/about/partner_mahir.webp',
      },
      {
        id: 'dir-3',
        name: 'Ar. Mohamed Naseem P K',
        role: 'Co - founder',
        image: '/images/about/partner_naseem.webp',
      },
      {
        id: 'dir-4',
        name: 'Ar. Nihad Mohamed Ali',
        role: 'Co - founder, Senior partner - Dubai',
        image: '/images/about/partner_nihad.webp',
      },
    ],
  },
  team: {
    sectionTitle: 'People of Attiks',
    members: [
      {
        id: 'team-1',
        name: 'Ar. Razeen Jawad',
        role: 'Senior partner',
        image: '/images/about/partner_razeen.webp',
      },
      {
        id: 'team-2',
        name: 'Ar. Jamsheer',
        role: 'Senior partner',
        image: '/images/about/partner_jamsheer.webp',
      },
      {
        id: 'team-3',
        name: 'Architect',
        role: 'Design Associate',
        image: '/images/about/team_placeholder.webp',
      },
      {
        id: 'team-4',
        name: 'Architect',
        role: 'Design Associate',
        image: '/images/about/team_placeholder.webp',
      },
    ],
  },
};
