import type { ReactNode } from 'react'

type Props = {
  title: string
  eyebrow?: string
  children: ReactNode
}

export default function Section({ title, eyebrow, children }: Props) {
  return (
    <section className="py-12">
      {eyebrow && (
        <p className="mb-2 text-sm font-medium tracking-wide text-accent uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="mb-8 font-display text-3xl sm:text-4xl">{title}</h2>
      {children}
    </section>
  )
}
