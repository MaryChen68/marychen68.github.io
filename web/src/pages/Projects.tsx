import ProjectCard from '../components/ProjectCard'
import Section from '../components/Section'
import { projects } from '../content'

export default function Projects() {
  return (
    <Section eyebrow="Work" title="All projects">
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  )
}
