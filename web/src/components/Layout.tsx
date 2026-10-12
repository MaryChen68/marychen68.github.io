import { Outlet, ScrollRestoration } from 'react-router'
import Footer from './Footer'
import Navbar from './Navbar'

// Shared frame for every page: navbar on top, footer at the bottom
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
