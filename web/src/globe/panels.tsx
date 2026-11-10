// Content shown in the detail panel for each globe station.
import { Link } from 'react-router'
import { about, profile, projects } from '../content'

export function ProjectsPanel() {
  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <li
          key={project.slug}
          className="rounded-xl border border-[#1c2733]/10 bg-white/70 p-5"
        >
          <p className="text-xs tracking-wide text-[#1c2733]/50">
            {project.year}
          </p>
          <h3 className="mt-1 font-display text-2xl">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#1c2733]/65">
            {project.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#1c2733]/15 px-2.5 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {project.details && (
              <Link
                to={`/projects/${project.slug}`}
                className="ml-auto text-sm text-(--accent) hover:underline"
              >
                Case study →
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ExperiencePanel() {
  return (
    <ol className="space-y-6 border-l border-[#1c2733]/15 pl-5">
      {about.experience.map((item) => (
        <li key={item.role + item.org}>
          <p className="text-xs tracking-wide text-[#1c2733]/50">
            {item.period}
          </p>
          <h3 className="mt-1 font-medium">
            {item.role} · {item.org}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[#1c2733]/65">
            {item.description}
          </p>
        </li>
      ))}
    </ol>
  )
}

export function AboutPanel() {
  return (
    <>
      <dl className="grid gap-px overflow-hidden rounded-xl border border-[#1c2733]/10 bg-[#1c2733]/10">
        {profile.now.map((item) => (
          <div key={item.label} className="bg-white/90 px-4 py-3">
            <dt className="text-xs tracking-wide text-[#1c2733]/50">
              {item.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#1c2733]/70">
        {about.paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
    </>
  )
}

export function ContactPanel() {
  return (
    <ul className="space-y-2">
      {profile.socials.map((social) => (
        <li key={social.label}>
          <a
            href={social.url}
            target={social.url.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#1c2733]/10 bg-white/70 px-5 py-4 hover:border-(--accent)"
          >
            <span>{social.label}</span>
            <span aria-hidden>↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
