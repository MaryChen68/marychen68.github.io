// Island stations: one per section of the site.
// A station only appears if its section has real content in content.ts.
import type { ComponentType } from 'react'
import { about, profile, projects } from '../content'
import type { StationKind } from './models'
import {
  AboutPanel,
  ContactPanel,
  ExperiencePanel,
  ProjectsPanel,
} from './panels'

export type Station = {
  id: string
  name: string
  eyebrow: string
  intro: string
  kind: StationKind
  Panel: ComponentType
}

const all: (Station & { hasContent: boolean })[] = [
  {
    id: 'projects',
    name: 'Projects',
    eyebrow: 'The studio',
    intro: 'Things I have designed and built.',
    kind: 'studio',
    Panel: ProjectsPanel,
    hasContent: projects.length > 0,
  },
  {
    id: 'experience',
    name: 'Experience',
    eyebrow: 'The pavilion',
    intro: 'Where I have worked and what I did there.',
    kind: 'pavilion',
    Panel: ExperiencePanel,
    hasContent: about.experience.length > 0,
  },
  {
    id: 'about',
    name: 'About',
    eyebrow: 'The reading room',
    intro: 'A little more about me.',
    kind: 'library',
    Panel: AboutPanel,
    hasContent: about.paragraphs.length > 0,
  },
  {
    id: 'contact',
    name: 'Contact',
    eyebrow: 'The lighthouse',
    intro: 'The best ways to reach me.',
    kind: 'beacon',
    Panel: ContactPanel,
    hasContent: profile.socials.length > 0,
  },
]

export const stations: Station[] = all.filter((s) => s.hasContent)
