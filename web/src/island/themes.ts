// Three muted landscapes. Every color in the 3D scene comes from here.

export type ThemeId = 'forest' | 'desert' | 'ocean'

export type Theme = {
  name: string
  caption: string
  accent: string
  background: string
  sky: string
  sun: string
  water: string
  ground: string
  sand: string
  earth: string
  rock: string
  lake: string
  foliage: [string, string]
  trunk: string
  grass: string
  wall: string
  roof: string
  timber: string
  glass: string
}

export const themes: Record<ThemeId, Theme> = {
  forest: {
    name: 'Forest',
    caption: 'Quiet woods, clear thinking.',
    accent: '#46604f',
    background: '#dde3de',
    sky: '#f1f5f2',
    sun: '#fff1dc',
    water: '#7d9e9c',
    ground: '#94a383',
    sand: '#d6d0bf',
    earth: '#9c9886',
    rock: '#b6b5aa',
    lake: '#88a8a4',
    foliage: ['#56705f', '#76896f'],
    trunk: '#5f564c',
    grass: '#7e906f',
    wall: '#ebe6db',
    roof: '#3e4340',
    timber: '#8a7560',
    glass: '#33403d',
  },
  desert: {
    name: 'Desert',
    caption: 'Warm stone and long horizons.',
    accent: '#8a5a3c',
    background: '#ece3d6',
    sky: '#fbf4ea',
    sun: '#ffe6c4',
    water: '#9db8b4',
    ground: '#cdb796',
    sand: '#e6d6bc',
    earth: '#b39c80',
    rock: '#c4ab90',
    lake: '#93b5ae',
    foliage: ['#808a68', '#9c9c7c'],
    trunk: '#6d5a48',
    grass: '#b3a37c',
    wall: '#efe5d6',
    roof: '#9a6649',
    timber: '#7a6150',
    glass: '#3d3a36',
  },
  ocean: {
    name: 'Ocean',
    caption: 'Evening light on a calm coast.',
    accent: '#3f5f78',
    background: '#d3dbe2',
    sky: '#e6edf3',
    sun: '#ffe3cf',
    water: '#5f8299',
    ground: '#93a29a',
    sand: '#d8d5cc',
    earth: '#8f9692',
    rock: '#aab0b2',
    lake: '#6f93a6',
    foliage: ['#4f6a64', '#6c837a'],
    trunk: '#5a5550',
    grass: '#8a9b8e',
    wall: '#e8e8e4',
    roof: '#33404a',
    timber: '#706458',
    glass: '#2c3a44',
  },
}

export const themeIds = Object.keys(themes) as ThemeId[]
