// All site text lives here. Components only display it.

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
  tagline: 'Building AI tools that keep people in charge.',
  intro:
    "I'm Mary, a computer science major with a statistics minor at Calvin University. I build software with LLMs and study how people work with it, and I care most about keeping people in control of their own words and ideas.",
  now: [
    { label: 'Now', value: 'Building a voice agent for reflection' },
    {
      label: 'Education',
      value:
        'Computer Science major, Statistics minor, Cybersecurity certificate (in progress), Calvin University',
    },
    {
      label: 'Looking for',
      value: 'Software engineering and data internships',
    },
  ],
  socials: [
    { label: 'GitHub', url: 'https://github.com/MaryChen68' },
    { label: 'Email', url: 'mailto:marychen0688@gmail.com' },
  ],
}

export const about = {
  paragraphs: [
    "I'm a developer and HCI researcher at Calvin University, where I build and study AI tools for writing and reflection. Next, I want to go deeper into AI engineering and build systems where it's always clear what the AI did and what the person did.",
    "I study computer science with a statistics minor, and my coursework includes information security, LLMs and transformers, web development, and SQL databases. I'm also working toward a cybersecurity certificate, because I see security as caring for people's privacy and their ability to trust the systems they use. Outside of code, I cook at home a lot, and I speak both English and Mandarin.",
  ],
  experience: [
    {
      role: 'Research Developer',
      org: 'Thoughtful AI',
      period: 'Summer 2026',
      description:
        'I developed Writing Tools, a Google Docs add-on (plus a Word version) that brings LLMs into the writing process. I fixed the deployment, hosting, and Marketplace issues that kept teammates from accessing it, and ran batch evaluations of LLM writing prompts with Langfuse logging.',
    },
    {
      role: 'Undergraduate Researcher',
      org: 'Calvin University, NSF-funded HCI research',
      period: 'Present',
      description:
        'I help design a research prototype that supports writers without writing for them, working heavily on its three-level assistance system and its support for 34 languages. I also work on the framework behind it ("No AI Words," "No Silent Commit"), and our team submitted a poster abstract to UIST 2026.',
    },
    {
      role: 'Member',
      org: 'Girls Who Code, Calvin University',
      period: 'Sep 2024 – Present',
      description:
        "I attend weekly programming sessions with Calvin's Girls Who Code chapter.",
    },
  ] satisfies Experience[],
}

export const projects: Project[] = [
  {
    slug: 'writing-tools-google-docs',
    title: 'Writing Tools Add-on for Google Docs',
    summary:
      'A Google Docs add-on (with a Word version) that brings LLM help into the writing process without taking authorship away from the writer.',
    tags: ['React', 'Google Apps Script', 'Office.js', 'Python', 'Langfuse'],
    year: 2026,
    featured: true,
    details: [
      {
        heading: 'Context',
        body: 'Many AI writing tools write for you, which makes it hard to say whose work it is. Writing Tools puts LLMs inside the editors people already use while keeping the writer as the author. I worked on it as a developer at Thoughtful AI.',
      },
      {
        heading: 'What I did',
        body: "A big part of my work was getting the add-on deployed and testable. I debugged OAuth, CORS, sidebar hosting, and Apps Script issues, fixed a Marketplace visibility setting that blocked teammates from accessing the add-on, and ran batch evaluations of LLM writing prompts in Python with Langfuse logging and command-line model selection. I'm also designing a page-translation feature that separates the language you write in from the language you view.",
      },
      {
        heading: 'Challenges',
        body: 'Google Apps Script silently dropped our ~1.5 MB React bundle when it was inlined, so the add-on failed with no error message. I tracked it down and moved the bundle to a public URL that the add-on loads instead. For testing, we dropped office-addin-mock because its strict load-before-read checks clashed with our code, and used hand-rolled Office.js mocks with Vitest/Jest and Playwright.',
      },
      {
        heading: 'Results',
        body: 'Fixing the visibility setting let teammates access and test the add-on.',
      },
    ],
  },
  {
    slug: 'authorship-preserving-writing',
    title: 'Authorship-Preserving AI Writing Prototype',
    summary:
      'A research prototype where AI helps you think through your writing but never writes your words for you.',
    tags: ['LLMs', 'HCI', 'Localization'],
    year: 2026,
    featured: true,
    details: [
      {
        heading: 'Context',
        body: 'This is part of an NSF-funded research project on interactive natural language technology for supporting writers. Our core idea is that writers keep authorship when they own an editable plan that limits what the AI can contribute.',
      },
      {
        heading: 'What I did',
        body: 'The prototype has three parts: an AI chat box, a mind map, and the draft. The AI can only ask open questions, mirror the writer\'s words back, or propose grounded ideas that go on the map only after the writer confirms, and this is enforced in code, not by prompting. I worked on the framework behind it ("No AI Words," "No Silent Commit") and worked heavily on the three-level assistance system and multilingual support.',
      },
      {
        heading: 'Challenges',
        body: 'Our first rule, "no AI words, no AI ideas, no AI scaffolding," turned out to be too strict. We built three levels of assistance: Level 1 keeps the strict rules, and Levels 2–3 relax them, with every AI contribution labeled by source.',
      },
      {
        heading: 'Results',
        body: 'We localized the system into 34 languages and submitted a poster abstract to UIST 2026.',
      },
    ],
  },
  {
    slug: 'voice-reflection-agent',
    title: 'Reflection Voice Agent with Traceable Summaries',
    summary:
      'A non-clinical voice agent that helps you reflect on your day or think through a decision, then gives you a summary that shows exactly who said what.',
    tags: ['Voice AI', 'LLMs', 'HCI'],
    year: 2026,
    featured: true,
    details: [
      {
        heading: 'Context',
        body: "Talking a problem through can help, but an AI summary can blur what you said with what the AI suggested. This is my senior project with one teammate, and it's designed to support reflection, not replace talking with real people.",
      },
      {
        heading: 'What I did',
        body: "Our core contribution is traceable summaries that separate three things: the user's own words, the agent's suggestions, and interpretations the user confirmed. It supports two scenarios: working through a specific conflict or decision, and recapping your day.",
      },
      {
        heading: 'Challenges',
        body: "Our advisor asked us to frame this as a research study rather than just an app, and to show how we'd measure whether it actually helps.",
      },
      { heading: 'Results', body: 'In progress.' },
    ],
  },
  {
    slug: 'personal-website',
    title: 'Personal Website',
    summary:
      'This site: a React and TypeScript portfolio with a 3D globe home page you explore by walking an avatar to each section.',
    tags: ['React', 'TypeScript', 'three.js', 'Tailwind'],
    year: 2026,
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/MaryChen68/marychen68.github.io',
      },
    ],
    details: [
      {
        heading: 'Context',
        body: 'I wanted a portfolio that is fun to explore, not just a list of links, and a real project to learn the full web stack end to end.',
      },
      {
        heading: 'What I did',
        body: 'I built the site with React, TypeScript, Vite, and Tailwind, and deploy it to GitHub Pages with GitHub Actions. The home page is a 3D globe in three.js: each section is a marker, and my avatar, made in VRoid Studio and loaded with three-vrm, walks across the globe to it. All text lives in one content file, so pages only display it.',
      },
      {
        heading: 'Challenges',
        body: 'Making the globe feel calm and readable took many rounds of palette and style changes, and getting an avatar that actually looked like me meant switching from hand-built shapes to a proper avatar tool with a code-driven walk.',
      },
      {
        heading: 'Results',
        body: 'A live, fast-loading site where the 3D scene only loads on the home page, and every change ships automatically through CI.',
      },
    ],
  },
  {
    slug: 'feeding-america-analysis',
    title: 'Food Insecurity Analysis for Feeding America',
    summary:
      "A course project analyzing Feeding America's data to answer research questions about food insecurity, like why some people who have jobs still face food insecurity.",
    tags: ['R', 'RStudio', 'Statistics'],
    year: 2026,
  },
]
