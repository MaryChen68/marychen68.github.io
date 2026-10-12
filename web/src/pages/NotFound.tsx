import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="py-24 text-center">
      <p className="text-accent">404</p>
      <h1 className="mt-2 font-display text-4xl">Page not found</h1>
      <Link to="/" className="mt-6 inline-block text-accent hover:underline">
        ← Back home
      </Link>
    </section>
  )
}
