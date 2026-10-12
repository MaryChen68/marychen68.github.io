import { profile } from '../content'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {year} {profile.name}
        </p>
        <ul className="flex gap-4">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a href={social.url} className="hover:text-accent">
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
