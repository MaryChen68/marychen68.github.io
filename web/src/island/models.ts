// Low-poly models for the island: the walker, plants, and station buildings.
// Geometry helpers adapted from island-portfolio by panggungunvibe (MIT License).
import * as T from 'three'
import type { Theme } from './themes'

type Vec3 = [number, number, number]

const materials = new Map<string, T.MeshStandardMaterial>()
export function mat(
  color: string,
  options: T.MeshStandardMaterialParameters = {},
) {
  const key = JSON.stringify([color, options])
  if (!materials.has(key))
    materials.set(
      key,
      new T.MeshStandardMaterial({
        color,
        roughness: 0.9,
        flatShading: true,
        ...options,
      }),
    )
  return materials.get(key)!
}

const sphere = new T.SphereGeometry(1, 14, 10)
const lowSphere = new T.IcosahedronGeometry(1, 0)
const box = new T.BoxGeometry(1, 1, 1)
const cylinder = new T.CylinderGeometry(1, 1, 1, 10)
const capsuleGeo = new T.CapsuleGeometry(0.5, 1, 4, 10)

export function mesh(
  parent: T.Object3D,
  geo: T.BufferGeometry,
  color: string | T.Material,
  p: Vec3 = [0, 0, 0],
  s: Vec3 = [1, 1, 1],
) {
  const m = new T.Mesh(geo, typeof color === 'string' ? mat(color) : color)
  m.position.set(...p)
  m.scale.set(...s)
  m.castShadow = true
  m.receiveShadow = true
  parent.add(m)
  return m
}

export const ball = (g: T.Object3D, c: string | T.Material, p: Vec3, s: Vec3) =>
  mesh(g, sphere, c, p, s)
export const blob = (g: T.Object3D, c: string, p: Vec3, s: Vec3) =>
  mesh(g, lowSphere, c, p, s)
export const block = (
  g: T.Object3D,
  c: string | T.Material,
  p: Vec3,
  s: Vec3,
) => mesh(g, box, c, p, s)
export const cyl = (g: T.Object3D, c: string | T.Material, p: Vec3, s: Vec3) =>
  mesh(g, cylinder, c, p, s)
const capsule = (g: T.Object3D, c: string, p: Vec3, s: Vec3) =>
  mesh(g, capsuleGeo, c, p, s)

export function rod(g: T.Object3D, c: string, a: Vec3, b: Vec3, r = 0.045) {
  const A = new T.Vector3(...a)
  const B = new T.Vector3(...b)
  const m = cyl(g, c, A.clone().add(B).multiplyScalar(0.5).toArray(), [
    r,
    A.distanceTo(B),
    r,
  ])
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.sub(A).normalize())
  return m
}

export function group(parent?: T.Object3D, p: Vec3 = [0, 0, 0]) {
  const g = new T.Group()
  g.position.set(...p)
  parent?.add(g)
  return g
}

// --- The walker: an architectural-model figure in a long coat ---

type WalkerParts = { body: T.Group; legs: T.Group[]; arms: T.Group[] }

export function makeWalker() {
  const root = new T.Group()
  const coat = '#34404b'
  const trousers = '#26282b'
  const skin = '#dcb597'
  const hair = '#221c19'

  const legs: T.Group[] = []
  for (const side of [-1, 1]) {
    const leg = group(root, [side * 0.12, 1, 0])
    capsule(leg, trousers, [0, -0.47, 0], [0.19, 0.45, 0.2])
    block(leg, '#1a1a1c', [0, -0.95, 0.05], [0.16, 0.09, 0.3])
    legs.push(leg)
  }

  const body = group(root, [0, 1, 0])
  capsule(body, coat, [0, 0.45, 0], [0.5, 0.42, 0.33])
  mesh(body, new T.CylinderGeometry(0.23, 0.29, 0.45, 12), coat, [0, -0.05, 0])
  block(body, '#ece6da', [0, 0.82, 0.13], [0.13, 0.12, 0.04])
  // Crossbody bag and strap
  rod(body, '#5b4637', [-0.2, 0.82, 0.12], [0.24, 0.15, 0.14], 0.016)
  block(body, '#6e5442', [0.26, 0.1, 0.06], [0.07, 0.22, 0.26])

  cyl(body, skin, [0, 0.93, 0], [0.065, 0.1, 0.065])
  const head = group(body, [0, 1.13, 0])
  ball(head, skin, [0, 0, 0.01], [0.16, 0.19, 0.17])
  ball(head, hair, [0, 0.05, -0.02], [0.175, 0.17, 0.18])
  ball(head, hair, [0, -0.05, -0.05], [0.18, 0.15, 0.15])
  ball(head, hair, [0, -0.02, -0.2], [0.075, 0.075, 0.075])

  const arms: T.Group[] = []
  for (const side of [-1, 1]) {
    const arm = group(body, [side * 0.27, 0.8, 0])
    capsule(arm, coat, [side * 0.02, -0.3, 0], [0.13, 0.3, 0.14])
    ball(arm, skin, [side * 0.025, -0.66, 0.01], [0.06, 0.07, 0.06])
    arms.push(arm)
  }

  root.userData = { body, legs, arms } satisfies WalkerParts
  return root
}

export function animateWalker(root: T.Object3D, time: number, speed: number) {
  const { body, legs, arms } = root.userData as WalkerParts
  const phase = time * 8.5
  legs[0].rotation.x = Math.sin(phase) * 0.45 * speed
  legs[1].rotation.x = -Math.sin(phase) * 0.45 * speed
  arms[0].rotation.x = -Math.sin(phase) * 0.32 * speed
  arms[1].rotation.x = Math.sin(phase) * 0.32 * speed
  body.position.y = 1 + Math.abs(Math.sin(phase)) * 0.04 * speed
}

// --- Plants and rocks ---

export function pine(
  g: T.Object3D,
  x: number,
  y: number,
  z: number,
  s: number,
  t: Theme,
) {
  const tree = group(g, [x, y, z])
  rod(tree, t.trunk, [0, 0, 0], [0, 2.6 * s, 0], 0.09 * s)
  for (let i = 0; i < 3; i++) {
    const cone = mesh(
      tree,
      new T.ConeGeometry(1, 1, 7),
      t.foliage[0],
      [0, (1.2 + i * 0.6) * s, 0],
      [(0.85 - i * 0.2) * s, 1.3 * s, (0.85 - i * 0.2) * s],
    )
    cone.rotation.y = i * 0.7
  }
}

export function roundTree(
  g: T.Object3D,
  x: number,
  y: number,
  z: number,
  s: number,
  t: Theme,
) {
  const tree = group(g, [x, y, z])
  rod(tree, t.trunk, [0, 0, 0], [0, 1.9 * s, 0], 0.1 * s)
  blob(tree, t.foliage[1], [0, 2.1 * s, 0], [0.85 * s, 0.95 * s, 0.85 * s])
  blob(
    tree,
    t.foliage[0],
    [0.35 * s, 1.75 * s, 0.2 * s],
    [0.5 * s, 0.5 * s, 0.5 * s],
  )
}

export function oliveTree(
  g: T.Object3D,
  x: number,
  y: number,
  z: number,
  s: number,
  t: Theme,
) {
  const tree = group(g, [x, y, z])
  rod(tree, t.trunk, [0, 0, 0], [0.15 * s, 0.9 * s, 0], 0.11 * s)
  rod(
    tree,
    t.trunk,
    [0.15 * s, 0.9 * s, 0],
    [-0.25 * s, 1.5 * s, 0.1 * s],
    0.08 * s,
  )
  rod(
    tree,
    t.trunk,
    [0.15 * s, 0.9 * s, 0],
    [0.5 * s, 1.45 * s, -0.1 * s],
    0.07 * s,
  )
  blob(
    tree,
    t.foliage[0],
    [-0.25 * s, 1.7 * s, 0.1 * s],
    [0.75 * s, 0.4 * s, 0.7 * s],
  )
  blob(
    tree,
    t.foliage[1],
    [0.5 * s, 1.65 * s, -0.1 * s],
    [0.65 * s, 0.35 * s, 0.6 * s],
  )
}

export function agave(
  g: T.Object3D,
  x: number,
  y: number,
  z: number,
  s: number,
  t: Theme,
) {
  const plant = group(g, [x, y, z])
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const leaf = mesh(
      plant,
      new T.ConeGeometry(0.09, 0.9, 4),
      t.foliage[1],
      [Math.cos(a) * 0.18 * s, 0.35 * s, Math.sin(a) * 0.18 * s],
      [s, s, s],
    )
    leaf.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6)
  }
}

export function grassTuft(
  g: T.Object3D,
  x: number,
  y: number,
  z: number,
  color: string,
) {
  for (let i = 0; i < 3; i++) {
    const blade = mesh(
      g,
      new T.ConeGeometry(0.025, 0.32, 3),
      color,
      [x + (i - 1) * 0.05, y + 0.14, z],
      [1, 0.8 + i * 0.25, 1],
    )
    blade.rotation.z = (i - 1) * 0.3
  }
}

export function rock(
  g: T.Object3D,
  x: number,
  y: number,
  z: number,
  s: number,
  color: string,
) {
  const r = blob(g, color, [x, y + s * 0.2, z], [s, s * 0.55, s * 0.8])
  r.rotation.set(x, z, 0)
}

// --- Station buildings: one per kind of section ---

export type StationKind = 'studio' | 'pavilion' | 'library' | 'beacon'

function studio(g: T.Group, t: Theme) {
  block(g, t.rock, [0, 0.08, 0], [2.3, 0.16, 1.9])
  block(g, t.wall, [0, 0.7, -0.05], [1.8, 1.1, 1.4])
  const roof = new T.Shape()
  roof.moveTo(-1.05, 0)
  roof.lineTo(1.05, 0)
  roof.lineTo(0, 0.75)
  roof.closePath()
  const roofGeo = new T.ExtrudeGeometry(roof, {
    depth: 1.6,
    bevelEnabled: false,
  })
  mesh(g, roofGeo, t.roof, [0, 1.25, -0.85])
  block(
    g,
    mat(t.glass, { roughness: 0.25, metalness: 0.3 }),
    [0.25, 0.68, 0.66],
    [1.0, 0.8, 0.03],
  )
  block(g, t.timber, [-0.55, 0.6, 0.66], [0.38, 0.9, 0.04])
}

function pavilion(g: T.Group, t: Theme) {
  block(g, t.rock, [0, 0.06, 0], [2.4, 0.12, 1.8])
  for (const x of [-1, 1])
    for (const z of [-0.7, 0.7])
      cyl(g, t.timber, [x, 0.85, z], [0.05, 1.5, 0.05])
  block(g, t.roof, [0, 1.65, 0], [2.7, 0.12, 2.1])
  block(g, t.timber, [0, 0.38, -0.2], [1.3, 0.07, 0.4])
  for (const x of [-0.55, 0.55])
    block(g, t.timber, [x, 0.22, -0.2], [0.07, 0.3, 0.36])
}

function library(g: T.Group, t: Theme) {
  block(g, t.rock, [0, 0.06, 0], [2.2, 0.12, 1.8])
  for (const x of [-0.95, 0.95])
    for (const z of [-0.75, 0.75])
      cyl(g, t.timber, [x, 0.95, z], [0.05, 1.7, 0.05])
  for (let i = 0; i < 6; i++)
    block(g, t.timber, [-1 + i * 0.4, 1.82, 0], [0.06, 0.06, 1.7])
  block(g, t.timber, [0, 0.62, 0], [1.1, 0.06, 0.6])
  for (const x of [-0.45, 0.45])
    block(g, t.timber, [x, 0.34, 0], [0.06, 0.56, 0.5])
  block(g, t.roof, [-0.2, 0.69, 0.05], [0.32, 0.06, 0.24])
  block(g, t.wall, [-0.2, 0.74, 0.05], [0.3, 0.04, 0.22])
  cyl(g, t.trunk, [0.35, 0.8, -0.1], [0.02, 0.32, 0.02])
  ball(
    g,
    mat('#fff4dc', { emissive: '#ffd9a0', emissiveIntensity: 0.9 }),
    [0.35, 0.98, -0.1],
    [0.08, 0.08, 0.08],
  )
}

function beacon(g: T.Group, t: Theme) {
  block(g, t.rock, [0, 0.08, 0], [1.4, 0.16, 1.4])
  mesh(g, new T.CylinderGeometry(0.32, 0.45, 2.4, 10), t.wall, [0, 1.36, 0])
  mesh(g, new T.CylinderGeometry(0.36, 0.36, 0.08, 10), t.roof, [0, 2.6, 0])
  cyl(
    g,
    mat('#fff4dc', { emissive: '#ffd59a', emissiveIntensity: 1.1 }),
    [0, 2.82, 0],
    [0.24, 0.36, 0.24],
  )
  mesh(g, new T.ConeGeometry(0.34, 0.45, 10), t.roof, [0, 3.22, 0])
}

const builders: Record<StationKind, (g: T.Group, t: Theme) => void> = {
  studio,
  pavilion,
  library,
  beacon,
}

export function station(kind: StationKind, t: Theme) {
  const g = new T.Group()
  builders[kind](g, t)
  return g
}
