// Globe stations: one per section of the site.
// A station only appears if its section has real content in content.ts.
import type { ComponentType } from 'react'
import { about, profile, projects } from '../content'
import type { Place } from './scene'
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
  // Where the marker sits on the globe (decorative, not a real location)
  place: Place
  Panel: ComponentType
}

const all: (Station & { hasContent: boolean })[] = [
  {
    id: 'projects',
    name: 'Projects',
    eyebrow: 'Selected work',
    intro: 'Things I have designed and built.',
    place: { lat: 38, lon: -98 },
    Panel: ProjectsPanel,
    hasContent: projects.length > 0,
  },
  {
    id: 'experience',
    name: 'Experience',
    eyebrow: 'Career',
    intro: 'Where I have worked and what I did there.',
    place: { lat: 48, lon: 12 },
    Panel: ExperiencePanel,
    hasContent: about.experience.length > 0,
  },
  {
    id: 'about',
    name: 'About',
    eyebrow: 'Background',
    intro: 'A little more about me.',
    place: { lat: 32, lon: 108 },
    Panel: AboutPanel,
    hasContent: about.paragraphs.length > 0,
  },
  {
    id: 'contact',
    name: 'Contact',
    eyebrow: 'Get in touch',
    intro: 'The best ways to reach me.',
    place: { lat: -12, lon: -52 },
    Panel: ContactPanel,
    hasContent: profile.socials.length > 0,
  },
]

export const stations: Station[] = all.filter((s) => s.hasContent)
