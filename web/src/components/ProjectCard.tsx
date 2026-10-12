import { Link } from 'react-router'
import type { Project } from '../content'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="block rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-accent"
    >
      <p className="text-sm text-muted">{project.year}</p>
      <h3 className="mt-1 font-display text-2xl">{project.title}</h3>
      <p className="mt-2 text-muted">{project.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border px-3 py-1 text-xs"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  )
}
