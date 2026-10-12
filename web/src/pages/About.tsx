import Section from '../components/Section'
import { about } from '../content'

export default function About() {
  return (
    <>
      <Section eyebrow="About" title="A bit about me">
        <div className="max-w-2xl space-y-4 text-lg text-muted">
          {about.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </Section>

      <Section eyebrow="Experience" title="Where I've worked">
        <ol className="space-y-8 border-l border-border pl-6">
          {about.experience.map((item) => (
            <li key={item.role + item.org}>
              <p className="text-sm text-muted">{item.period}</p>
              <h3 className="mt-1 text-lg font-medium">
                {item.role} · {item.org}
              </h3>
              <p className="mt-1 text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  )
}
