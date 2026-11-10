import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './components/Layout'
import GlobeHome from './globe/GlobeHome'
import './index.css'
import About from './pages/About'
import NotFound from './pages/NotFound'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'

// Every page and its URL
const router = createBrowserRouter([
  // The home page is a full-screen 3D globe, so it skips the shared layout
  { path: '/', element: <GlobeHome /> },
  {
    element: <Layout />,
    children: [
      { path: '/projects', element: <Projects /> },
      { path: '/projects/:slug', element: <ProjectDetail /> },
      { path: '/about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
