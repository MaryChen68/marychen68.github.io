import { Link, NavLink } from 'react-router'
import { profile } from '../content'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-xl">
          {profile.name}
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'text-accent' : 'text-muted hover:text-text'
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
