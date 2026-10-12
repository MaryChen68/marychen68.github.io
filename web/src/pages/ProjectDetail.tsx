import { Link, useParams } from 'react-router'
import { projects } from '../content'
import NotFound from './NotFound'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)

  if (!project) return <NotFound />

  return (
    <article className="py-12">
      <Link to="/projects" className="text-sm text-muted hover:text-accent">
        ← All projects
      </Link>
      <p className="mt-8 text-sm text-muted">{project.year}</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-4 text-lg text-muted">{project.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border px-3 py-1 text-xs"
          >
            {tag}
          </li>
        ))}
      </ul>

      {project.details?.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="font-display text-2xl">{section.heading}</h2>
          <p className="mt-2 text-muted">{section.body}</p>
        </section>
      ))}

      {project.links && (
        <div className="mt-10 flex flex-wrap gap-3">
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-5 py-2 hover:border-accent hover:text-accent"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  )
}
