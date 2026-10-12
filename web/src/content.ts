// All site text lives here. Components only display it.
// TODO: replace placeholder content with real info (backlog 2.7).

export type Project = {
  slug: string
  title: string
  summary: string
  tags: string[]
  year: number
  featured?: boolean
  links?: { label: string; url: string }[]
  // Sections shown on the project detail page
  details?: { heading: string; body: string }[]
}

export type Experience = {
  role: string
  org: string
  period: string
  description: string
}

export const profile = {
  name: 'Mary Chen',
  tagline: 'Full-stack developer in the making.',
  intro:
    'I build things for the web. This is a placeholder intro: one or two sentences about who you are and what you care about.',
  now: [
    { label: 'Now', value: 'Building this website' },
    { label: 'Education', value: 'Your degree, school, year' },
    { label: 'Looking for', value: 'Software engineering internships' },
  ],
  socials: [
    { label: 'GitHub', url: 'https://github.com/MaryChen68' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { label: 'Email', url: 'mailto:marychen0688@gmail.com' },
  ],
}

export const about = {
  paragraphs: [
    'Placeholder: where you grew up, what got you into software, and what you want to build next.',
    'Placeholder: what you study, what you enjoy outside of code.',
  ],
  experience: [
    {
      role: 'Role title',
      org: 'Company or lab',
      period: '2025 – Present',
      description: 'One or two sentences on what you did and the impact.',
    },
  ] satisfies Experience[],
}

export const projects: Project[] = [
  {
    slug: 'personal-website',
    title: 'Personal Website',
    summary:
      'This site: a full-stack personal website built with React and TypeScript.',
    tags: ['React', 'TypeScript', 'Tailwind'],
    year: 2026,
    featured: true,
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/MaryChen68/marychen68.github.io',
      },
    ],
    details: [
      { heading: 'Context', body: 'Why you built it.' },
      { heading: 'What I did', body: 'What you built and the key decisions.' },
      { heading: 'Challenges', body: 'What was hard and how you solved it.' },
      { heading: 'Results', body: 'What came out of it.' },
    ],
  },
  {
    slug: 'project-two',
    title: 'Project Two',
    summary: 'Placeholder: a short description of what it does.',
    tags: ['Python'],
    year: 2025,
    featured: true,
  },
  {
    slug: 'project-three',
    title: 'Project Three',
    summary: 'Placeholder: a short description of what it does.',
    tags: ['Java'],
    year: 2025,
  },
]
