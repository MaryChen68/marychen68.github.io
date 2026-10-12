import { Link } from 'react-router'
import ProjectCard from '../components/ProjectCard'
import Section from '../components/Section'
import { profile, projects } from '../content'

export default function Home() {
  const featured = projects.filter((project) => project.featured)

  return (
    <>
      <section className="py-16 sm:py-24">
        <p className="text-accent">{profile.tagline}</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">
          Hi, I'm Mary.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">{profile.intro}</p>
      </section>

      <dl className="grid gap-4 sm:grid-cols-3">
        {profile.now.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className="mt-1 font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>

      <Section eyebrow="Featured work" title="Things I've built">
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <Link
          to="/projects"
          className="mt-8 inline-block text-accent hover:underline"
        >
          All projects →
        </Link>
      </Section>

      <Section eyebrow="Contact" title="Let's talk">
        <ul className="flex flex-wrap gap-3">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                className="inline-block rounded-full border border-border px-5 py-2 hover:border-accent hover:text-accent"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
