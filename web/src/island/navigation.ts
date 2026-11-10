// Walking rules for the island: boundaries, obstacles, and pathfinding.
// Adapted from island-portfolio by panggungunvibe (MIT License).
import type { StationKind } from './models'

export type Point = [number, number]
export type Obstacle = { x: number; z: number; r: number }

export const WALK_RADIUS = 11.7
export const PLAYER_RADIUS = 0.38
export const SPAWN: Point = [0, 7.9]
export const ARRIVAL_RADIUS = 1.65
// The minimap shows a square this many world units wide
export const MAP_SPAN = 28

export type StationSite = { kind: StationKind; position: Point; arrival: Point }

// Spread stations evenly around the island, leaving the spawn point clear
export function layoutStations(kinds: StationKind[]): StationSite[] {
  return kinds.map((kind, i) => {
    const a =
      Math.PI / 2 + Math.PI / kinds.length + (i * Math.PI * 2) / kinds.length
    const at = (r: number): Point => [Math.cos(a) * r, Math.sin(a) * r]
    return { kind, position: at(6.6), arrival: at(4.9) }
  })
}

export function clampToIsland(p: Point, r = WALK_RADIUS): Point {
  const d = Math.hypot(p[0], p[1])
  return d > r ? [(p[0] / d) * r, (p[1] / d) * r] : [p[0], p[1]]
}

function isWalkable(p: Point, obstacles: Obstacle[]) {
  return (
    Math.hypot(p[0], p[1]) <= WALK_RADIUS &&
    obstacles.every(
      (o) => Math.hypot(p[0] - o.x, p[1] - o.z) > o.r + PLAYER_RADIUS,
    )
  )
}

function clearSegment(a: Point, b: Point, obstacles: Obstacle[]) {
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.16)
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0
    if (
      !isWalkable(
        [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
        obstacles,
      )
    )
      return false
  }
  return true
}

function nearestWalkable(p: Point, obstacles: Obstacle[]): Point | null {
  p = clampToIsland(p)
  if (isWalkable(p, obstacles)) return p
  for (let r = 0.2; r < 4; r += 0.2)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const q = clampToIsland([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r])
      if (isWalkable(q, obstacles)) return q
    }
  return null
}

// A* on a coarse grid, then shortcut the path into straight segments
export function findRoute(
  start: Point,
  destination: Point,
  obstacles: Obstacle[],
): Point[] {
  const end = nearestWalkable(destination, obstacles)
  if (!end) return []
  if (clearSegment(start, end, obstacles)) return [end]

  const step = 0.45
  const toCell = (p: Point): Point => [
    Math.round(p[0] / step),
    Math.round(p[1] / step),
  ]
  const fromCell = (p: Point): Point => [p[0] * step, p[1] * step]
  const key = (p: Point) => p.join(',')

  const startCell = toCell(start)
  const endCell = toCell(end)
  const open = [{ p: startCell, g: 0, f: 0 }]
  const best = new Map([[key(startCell), 0]])
  const previous = new Map<string, Point>()
  const closed = new Set<string>()
  let found: Point | null = null

  for (let tries = 0; open.length && tries < 8000; tries++) {
    open.sort((a, b) => a.f - b.f)
    const cur = open.shift()!
    const ck = key(cur.p)
    if (closed.has(ck)) continue
    closed.add(ck)
    if (
      ck === key(endCell) ||
      (Math.hypot(cur.p[0] - endCell[0], cur.p[1] - endCell[1]) <= 1 &&
        clearSegment(fromCell(cur.p), end, obstacles))
    ) {
      found = cur.p
      break
    }
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) {
        if (!dx && !dz) continue
        const n: Point = [cur.p[0] + dx, cur.p[1] + dz]
        const nk = key(n)
        const g = cur.g + Math.hypot(dx, dz)
        if (
          closed.has(nk) ||
          g >= (best.get(nk) ?? Infinity) ||
          !clearSegment(fromCell(cur.p), fromCell(n), obstacles)
        )
          continue
        best.set(nk, g)
        previous.set(nk, cur.p)
        open.push({
          p: n,
          g,
          f: g + Math.hypot(n[0] - endCell[0], n[1] - endCell[1]),
        })
      }
  }
  if (!found) return []

  const raw: Point[] = [end]
  let cur: Point | undefined = found
  while (key(cur) !== key(startCell)) {
    raw.unshift(fromCell(cur))
    cur = previous.get(key(cur))
    if (!cur) return []
  }
  raw.unshift(start)

  const smooth: Point[] = []
  for (let i = 0; i < raw.length - 1;) {
    let j = raw.length - 1
    while (j > i + 1 && !clearSegment(raw[i], raw[j], obstacles)) j--
    smooth.push(raw[j])
    i = j
  }
  return smooth
}

// Move by delta, sliding along obstacles instead of stopping dead
export function slideStep(
  position: Point,
  delta: Point,
  obstacles: Obstacle[],
): Point {
  const end = clampToIsland([position[0] + delta[0], position[1] + delta[1]])
  if (clearSegment(position, end, obstacles)) return end
  const x = clampToIsland([position[0] + delta[0], position[1]])
  if (clearSegment(position, x, obstacles)) return x
  const z = clampToIsland([position[0], position[1] + delta[1]])
  return clearSegment(position, z, obstacles) ? z : position
}
