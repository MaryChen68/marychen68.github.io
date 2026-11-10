// Home page: an explorable 3D island with an HTML overlay on top.
import { useEffect, useRef, useState } from 'react'
import { profile } from '../content'
import { Ambience } from './audio'
import { MAP_SPAN, layoutStations } from './navigation'
import type { FrameInfo, Island } from './scene'
import { stations } from './stations'
import { themeIds, themes, type ThemeId } from './themes'

const sites = layoutStations(stations.map((s) => s.kind))
const pad = (n: number) => String(n).padStart(2, '0')
const mapPercent = (v: number) => `${50 + (v / MAP_SPAN) * 100}%`

export default function IslandHome() {
  const containerRef = useRef<HTMLDivElement>(null)
  const islandRef = useRef<Island | null>(null)
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const playerDotRef = useRef<HTMLSpanElement>(null)
  const compassRef = useRef<HTMLSpanElement>(null)
  const [audio] = useState(() => new Ambience())

  const [theme, setTheme] = useState<ThemeId>('forest')
  const [exploring, setExploring] = useState(false)
  const [active, setActive] = useState(-1)
  const [visited, setVisited] = useState<number[]>([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [status, setStatus] = useState('')

  // Create the 3D scene once. three.js is loaded lazily so the page shell appears fast.
  useEffect(() => {
    let cancelled = false
    let island: Island | undefined

    function open(i: number) {
      setExploring(true)
      setActive(i)
      setVisited((v) => (v.includes(i) ? v : [...v, i]))
      setStatus(`Arrived at ${stations[i].name}`)
    }

    // Runs every frame: move the overlay directly instead of re-rendering React
    function onFrame(info: FrameInfo) {
      info.labels.forEach((label, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        el.style.transform = `translate(${label.x}px, ${label.y}px) translate(-50%, -100%)`
        el.dataset.visible = String(label.visible)
        el.dataset.highlight = String(info.near === i || info.hover === i)
      })
      if (playerDotRef.current) {
        playerDotRef.current.style.left = mapPercent(info.player[0])
        playerDotRef.current.style.top = mapPercent(info.player[1])
      }
      if (compassRef.current)
        compassRef.current.style.rotate = `${-info.azimuth}rad`
    }

    import('./scene')
      .then(({ createIsland }) => {
        if (cancelled || !containerRef.current) return
        island = createIsland(containerRef.current, {
          sites,
          onReady: () => setReady(true),
          onArrive: open,
          onLeave: () => setActive(-1),
          onMove: () => {
            setExploring(true)
            setActive(-1)
            setStatus('')
          },
          onBlocked: () => setStatus("Can't walk there. Try open ground."),
          onFrame,
        })
        islandRef.current = island
      })
      .catch((error) => {
        console.error(error)
        setFailed(true)
      })

    return () => {
      cancelled = true
      island?.destroy()
      islandRef.current = null
      audio.stop()
    }
  }, [audio])

  useEffect(() => {
    islandRef.current?.setLayout({
      panelOpen: active >= 0,
      introOpen: !exploring,
    })
  }, [active, exploring, ready])

  useEffect(() => {
    islandRef.current?.setTheme(theme)
    audio.setTheme(theme)
  }, [theme, ready, audio])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(-1)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function goTo(i: number) {
    setExploring(true)
    setActive(-1)
    if (failed || !islandRef.current) {
      setActive(i)
      return
    }
    islandRef.current.travelTo(i)
    setStatus(`Walking to ${stations[i].name}`)
  }

  function goHome() {
    setActive(-1)
    setExploring(false)
    setStatus('')
    islandRef.current?.stop()
    islandRef.current?.overview()
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
  const t = themes[theme]

  return (
    <div
      className="fixed inset-0 overflow-hidden font-sans text-[#1f2421] select-none"
      style={
        {
          '--accent': t.accent,
          background: t.background,
        } as React.CSSProperties
      }
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Station labels, positioned every frame by the scene */}
      {!failed &&
        stations.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              labelRefs.current[i] = el
            }}
            onClick={() => goTo(i)}
            className="group absolute top-0 left-0 flex items-center gap-2 rounded-full border border-white/70 bg-white/75 py-1.5 pr-4 pl-1.5 text-sm shadow-sm backdrop-blur transition-opacity data-[highlight=true]:border-(--accent) data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full border border-black/10 font-display text-xs">
              {pad(i + 1)}
            </span>
            {s.name}
          </button>
        ))}

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
        <button onClick={goHome} className="pointer-events-auto text-left">
          <span className="block font-display text-xl sm:text-2xl">
            {profile.name}
          </span>
          <span className="block text-[10px] tracking-[0.25em] text-black/55 uppercase">
            Portfolio
          </span>
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            role="group"
            aria-label="Landscape"
            className="flex rounded-full border border-white/70 bg-white/70 p-1 backdrop-blur"
          >
            {themeIds.map((id) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                aria-pressed={theme === id}
                className="rounded-full px-3 py-1.5 text-xs text-black/60 aria-pressed:bg-[#1f2421] aria-pressed:text-white sm:px-4 sm:text-sm"
              >
                {themes[id].name}
              </button>
            ))}
          </div>
          <button
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/70 backdrop-blur"
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
        </div>
      </header>

      {/* Intro */}
      {!exploring && (
        <section className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/80 p-6 backdrop-blur sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-10 sm:max-w-sm sm:-translate-y-1/2 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <p className="text-xs tracking-[0.2em] text-(--accent) uppercase">
            {profile.tagline}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            Hi, I'm Mary.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-black/65 sm:text-base">
            {profile.intro}
          </p>
          <ul className="mt-6 hidden space-y-1.5 border-t border-black/10 pt-5 text-sm text-black/60 sm:block">
            <li>
              <b className="font-medium text-black/80">Drag</b> to look around
            </li>
            <li>
              <b className="font-medium text-black/80">Click</b> the ground to
              walk
            </li>
            <li>
              <b className="font-medium text-black/80">W A S D</b> or arrow keys
              to move
            </li>
          </ul>
          <button
            onClick={() => setExploring(true)}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#1f2421] px-5 py-3.5 text-sm text-white hover:bg-(--accent) sm:w-64"
          >
            Start exploring <span aria-hidden>→</span>
          </button>
        </section>
      )}

      {/* Theme caption */}
      <p className="absolute bottom-6 left-6 hidden text-xs text-black/55 lg:block">
        <span className="block tracking-[0.25em] uppercase">{t.name}</span>
        {t.caption}
      </p>

      {/* Status line */}
      {status && exploring && (
        <p className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1.5 text-xs whitespace-nowrap backdrop-blur">
          {status}
        </p>
      )}

      {/* Station navigation */}
      {exploring && (
        <nav className="absolute bottom-4 left-1/2 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-2xl border border-white/70 bg-white/75 p-1.5 backdrop-blur">
          {stations.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-current={active === i}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap text-black/70 hover:bg-white aria-[current=true]:bg-white aria-[current=true]:text-black"
            >
              <span
                className={`font-display text-xs ${visited.includes(i) ? 'text-(--accent)' : 'text-black/40'}`}
              >
                {pad(i + 1)}
              </span>
              {s.name}
            </button>
          ))}
        </nav>
      )}

      {/* Minimap */}
      {!failed && (
        <div className="absolute right-6 bottom-6 hidden flex-col items-end gap-2 md:flex">
          <button
            onClick={() => islandRef.current?.overview()}
            className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs backdrop-blur"
          >
            Overview
          </button>
          <div className="relative h-32 w-32 rounded-full border border-white/80 bg-white/55 backdrop-blur">
            <div className="absolute inset-[18%] rounded-full border border-black/15" />
            <span
              ref={compassRef}
              className="absolute inset-0 text-center text-[10px] text-black/50"
            >
              N
            </span>
            {sites.map((site, i) => (
              <button
                key={stations[i].id}
                onClick={() => goTo(i)}
                aria-label={`Go to ${stations[i].name}`}
                className={`absolute h-2.5 w-2.5 -translate-1/2 rounded-full border border-white ${visited.includes(i) ? 'bg-(--accent)' : 'bg-black/30'}`}
                style={{
                  left: mapPercent(site.arrival[0]),
                  top: mapPercent(site.arrival[1]),
                }}
              />
            ))}
            <span
              ref={playerDotRef}
              className="absolute h-3 w-3 -translate-1/2 rounded-full border-2 border-white bg-[#1f2421]"
            />
          </div>
          <p className="text-xs text-black/55">
            <span className="font-display text-lg text-black/80">
              {pad(visited.length)}
            </span>{' '}
            / {pad(stations.length)} visited
          </p>
        </div>
      )}

      {/* Detail panel */}
      {station && (
        <aside
          data-panel
          className="absolute inset-x-3 bottom-3 max-h-[68vh] overflow-y-auto rounded-2xl bg-[#f8f6f1]/95 p-6 shadow-xl backdrop-blur select-text sm:p-8 md:inset-x-auto md:top-24 md:right-6 md:bottom-6 md:max-h-none md:w-[440px]"
        >
          <button
            onClick={() => setActive(-1)}
            aria-label="Close"
            className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-black/10 hover:bg-white"
          >
            ✕
          </button>
          <p className="text-xs tracking-[0.2em] text-black/50 uppercase">
            {pad(active + 1)} · {station.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-4xl">{station.name}</h2>
          <p className="mt-2 mb-6 text-sm text-black/60">{station.intro}</p>
          <station.Panel />
        </aside>
      )}

      {/* Fallback when 3D isn't available */}
      {failed && exploring && !station && (
        <p className="absolute top-1/2 left-1/2 w-72 -translate-1/2 text-center text-sm text-black/60">
          3D isn't available in this browser. Use the buttons below to explore.
        </p>
      )}

      {/* Loading screen */}
      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready || failed ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: t.background }}
      >
        <p className="font-display text-2xl text-black/60">
          Loading the island…
        </p>
      </div>
    </div>
  )
}
