// Home page: a 3D globe with an HTML overlay on top.
import { useEffect, useRef, useState } from 'react'
import { profile } from '../content'
import { Ambience } from './audio'
import type { FrameInfo, Globe } from './scene'
import { stations } from './stations'

const START = { lat: 22, lon: -35 }
const pad = (n: number) => String(n).padStart(2, '0')
const formatPlace = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`

export default function GlobeHome() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const coordsRef = useRef<HTMLSpanElement>(null)
  const [audio] = useState(() => new Ambience())

  const [exploring, setExploring] = useState(false)
  const [active, setActive] = useState(-1)
  const [visited, setVisited] = useState<number[]>([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [status, setStatus] = useState('')

  // Create the 3D scene once. three.js loads lazily so the page shell appears fast.
  useEffect(() => {
    let cancelled = false
    let globe: Globe | undefined

    function open(i: number) {
      setExploring(true)
      setActive(i)
      setVisited((v) => (v.includes(i) ? v : [...v, i]))
      setStatus('')
    }

    // Runs every frame: move labels directly instead of re-rendering React
    function onFrame(info: FrameInfo) {
      info.labels.forEach((label, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        el.style.transform = `translate(${label.x}px, ${label.y}px) translate(-50%, calc(-100% - 16px))`
        el.dataset.visible = String(label.visible)
        el.dataset.highlight = String(info.near === i || info.hover === i)
      })
      if (coordsRef.current)
        coordsRef.current.textContent = formatPlace(
          info.position.lat,
          info.position.lon,
        )
    }

    import('./scene')
      .then(({ createGlobe }) => {
        if (cancelled || !containerRef.current) return
        globe = createGlobe(containerRef.current, {
          places: stations.map((s) => s.place),
          start: START,
          onReady: () => setReady(true),
          onArrive: open,
          onLeave: () => setActive(-1),
          onMove: () => {
            setExploring(true)
            setActive(-1)
          },
          onFrame,
        })
        globeRef.current = globe
      })
      .catch((error) => {
        console.error(error)
        setFailed(true)
      })

    return () => {
      cancelled = true
      globe?.destroy()
      globeRef.current = null
      audio.stop()
    }
  }, [audio])

  useEffect(() => {
    globeRef.current?.setLayout({
      panelOpen: active >= 0,
      introOpen: !exploring,
    })
  }, [active, exploring, ready])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(-1)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function goTo(i: number) {
    setExploring(true)
    setActive(-1)
    if (failed || !globeRef.current) {
      setActive(i)
      return
    }
    globeRef.current.travelTo(i)
    setStatus(`Traveling to ${stations[i].name}`)
  }

  function goHome() {
    setActive(-1)
    setExploring(false)
    setStatus('')
    globeRef.current?.overview()
  }

  async function toggleSound() {
    if (soundOn) {
      audio.stop()
      setSoundOn(false)
      return
    }
    try {
      await audio.start()
      setSoundOn(true)
    } catch {
      setStatus('Sound is not available in this browser.')
    }
  }

  const station = active >= 0 ? stations[active] : null

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#eef2f5] font-sans text-[#1c2733] select-none"
      style={{ '--accent': '#2f4b63' } as React.CSSProperties}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Marker labels, positioned every frame by the scene */}
      {!failed &&
        stations.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              labelRefs.current[i] = el
            }}
            onClick={() => goTo(i)}
            className="absolute top-0 left-0 flex items-center gap-2 rounded-full border border-[#1c2733]/10 bg-white/85 py-1 pr-3.5 pl-1 text-sm shadow-sm backdrop-blur transition-opacity duration-300 data-[highlight=true]:border-(--accent) data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#eef2f5] font-display text-xs">
              {pad(i + 1)}
            </span>
            {s.name}
          </button>
        ))}

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
        <button onClick={goHome} className="pointer-events-auto text-left">
          <span className="block font-display text-xl sm:text-2xl">
            {profile.name}
          </span>
          <span className="block text-[10px] tracking-[0.25em] text-[#1c2733]/55 uppercase">
            Portfolio
          </span>
        </button>
        <button
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-[#1c2733]/10 bg-white/70 backdrop-blur"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            {soundOn ? (
              <path d="M16 9c1.5 1.5 1.5 4.5 0 6M19 6c3 3 3 9 0 12" />
            ) : (
              <path d="m16 9 5 6m0-6-5 6" />
            )}
          </svg>
        </button>
      </header>

      {/* Intro */}
      {!exploring && (
        <section className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/85 p-6 backdrop-blur sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-10 sm:max-w-sm sm:-translate-y-1/2 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <p className="text-xs tracking-[0.2em] text-(--accent) uppercase">
            {profile.tagline}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            Hi, I'm Mary.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#1c2733]/65 sm:text-base">
            {profile.intro}
          </p>
          <ul className="mt-6 hidden space-y-1.5 border-t border-[#1c2733]/10 pt-5 text-sm text-[#1c2733]/60 sm:block">
            <li>
              <b className="font-medium text-[#1c2733]/80">Drag</b> to turn the
              globe
            </li>
            <li>
              <b className="font-medium text-[#1c2733]/80">Click a marker</b> to
              travel there
            </li>
            <li>
              <b className="font-medium text-[#1c2733]/80">Click the land</b> to
              wander
            </li>
          </ul>
          <button
            onClick={() => setExploring(true)}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-(--accent) px-5 py-3.5 text-sm text-white hover:bg-[#223a4e] sm:w-64"
          >
            Start exploring <span aria-hidden>→</span>
          </button>
        </section>
      )}

      {/* Status line */}
      {status && exploring && !station && (
        <p className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-4 py-1.5 text-xs whitespace-nowrap backdrop-blur">
          {status}
        </p>
      )}

      {/* Station navigation */}
      {exploring && (
        <nav className="absolute bottom-4 left-1/2 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-2xl border border-[#1c2733]/10 bg-white/80 p-1.5 backdrop-blur">
          {stations.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-current={active === i}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap text-[#1c2733]/70 hover:bg-white aria-[current=true]:bg-white aria-[current=true]:text-[#1c2733]"
            >
              <span
                className={`font-display text-xs ${visited.includes(i) ? 'text-(--accent)' : 'text-[#1c2733]/40'}`}
              >
                {pad(i + 1)}
              </span>
              {s.name}
            </button>
          ))}
        </nav>
      )}

      {/* Current coordinates */}
      {!failed && (
        <p className="absolute bottom-6 left-6 hidden text-xs text-[#1c2733]/55 lg:block">
          <span className="block tracking-[0.25em] uppercase">
            Current position
          </span>
          <span
            ref={coordsRef}
            className="font-display text-base text-[#1c2733]/80 tabular-nums"
          />
        </p>
      )}

      {/* Progress */}
      {exploring && (
        <p className="absolute right-6 bottom-6 hidden text-xs text-[#1c2733]/55 md:block">
          <span className="font-display text-lg text-[#1c2733]/80">
            {pad(visited.length)}
          </span>{' '}
          / {pad(stations.length)} visited
        </p>
      )}

      {/* Detail panel */}
      {station && (
        <aside
          data-panel
          className="absolute inset-x-3 bottom-3 max-h-[68vh] overflow-y-auto rounded-2xl bg-[#f8fbfc]/95 p-6 shadow-xl backdrop-blur select-text sm:p-8 md:inset-x-auto md:top-24 md:right-6 md:bottom-6 md:max-h-none md:w-[440px]"
        >
          <button
            onClick={() => setActive(-1)}
            aria-label="Close"
            className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-[#1c2733]/10 hover:bg-white"
          >
            ✕
          </button>
          <p className="text-xs tracking-[0.2em] text-[#1c2733]/50 uppercase">
            {pad(active + 1)} · {station.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-4xl">{station.name}</h2>
          <p className="mt-2 mb-6 text-sm text-[#1c2733]/60">{station.intro}</p>
          <station.Panel />
        </aside>
      )}

      {/* Fallback when 3D isn't available */}
      {failed && exploring && !station && (
        <p className="absolute top-1/2 left-1/2 w-72 -translate-1/2 text-center text-sm text-[#1c2733]/60">
          3D isn't available in this browser. Use the buttons below to explore.
        </p>
      )}

      {/* Loading screen */}
      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-[#eef2f5] transition-opacity duration-700 ${ready || failed ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="font-display text-2xl text-[#1c2733]/60">Loading…</p>
      </div>
    </div>
  )
}
