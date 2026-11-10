// The traveler: a simple figure in a long coat, built from basic shapes.
// Feet sit at y = 0 and the figure faces +Z.
import * as T from 'three'

const colors = {
  coat: '#c7b299',
  trousers: '#3a4048',
  shoes: '#18191b',
  skin: '#dcb597',
  hair: '#221c19',
  collar: '#ece6da',
  bag: '#7a5a3e',
}

function part(
  parent: T.Object3D,
  geometry: T.BufferGeometry,
  color: string,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
) {
  const material = new T.MeshStandardMaterial({
    color,
    roughness: 0.85,
    flatShading: true,
  })
  const mesh = new T.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  parent.add(mesh)
  return mesh
}

const capsule = new T.CapsuleGeometry(0.5, 1, 4, 10)
const sphere = new T.SphereGeometry(1, 14, 10)
const box = new T.BoxGeometry(1, 1, 1)

export type Traveler = {
  root: T.Group
  animate: (time: number, speed: number) => void
}

export function createTraveler(): Traveler {
  const root = new T.Group()

  // Legs swing from the hip
  const legs = [-1, 1].map((side) => {
    const leg = new T.Group()
    leg.position.set(side * 0.12, 1, 0)
    part(leg, capsule, colors.trousers, [0, -0.47, 0], [0.19, 0.45, 0.2])
    part(leg, box, colors.shoes, [0, -0.95, 0.05], [0.16, 0.09, 0.3])
    root.add(leg)
    return leg
  })

  const body = new T.Group()
  body.position.y = 1
  root.add(body)
  part(body, capsule, colors.coat, [0, 0.45, 0], [0.5, 0.42, 0.33])
  part(
    body,
    new T.CylinderGeometry(0.23, 0.29, 0.45, 12),
    colors.coat,
    [0, -0.05, 0],
  )
  part(body, box, colors.collar, [0, 0.82, 0.13], [0.13, 0.12, 0.04])
  part(body, box, colors.bag, [0.27, 0.1, 0.05], [0.07, 0.22, 0.26])
  part(
    body,
    new T.CylinderGeometry(1, 1, 1, 8),
    colors.skin,
    [0, 0.93, 0],
    [0.065, 0.1, 0.065],
  )

  const head = new T.Group()
  head.position.y = 1.13
  body.add(head)
  part(head, sphere, colors.skin, [0, 0, 0.01], [0.16, 0.19, 0.17])
  part(head, sphere, colors.hair, [0, 0.05, -0.02], [0.175, 0.17, 0.18])
  part(head, sphere, colors.hair, [0, -0.05, -0.05], [0.18, 0.15, 0.15])
  part(head, sphere, colors.hair, [0, -0.02, -0.2], [0.075, 0.075, 0.075])

  // Arms swing from the shoulder
  const arms = [-1, 1].map((side) => {
    const arm = new T.Group()
    arm.position.set(side * 0.27, 0.8, 0)
    part(arm, capsule, colors.coat, [side * 0.02, -0.3, 0], [0.13, 0.3, 0.14])
    part(
      arm,
      sphere,
      colors.skin,
      [side * 0.025, -0.66, 0.01],
      [0.06, 0.07, 0.06],
    )
    body.add(arm)
    return arm
  })

  function animate(time: number, speed: number) {
    const swing = Math.sin(time * 8.5)
    legs[0].rotation.x = swing * 0.45 * speed
    legs[1].rotation.x = -swing * 0.45 * speed
    arms[0].rotation.x = -swing * 0.32 * speed
    arms[1].rotation.x = swing * 0.32 * speed
    body.position.y = 1 + Math.abs(swing) * 0.04 * speed
  }

  root.traverse((o) => {
    if (o instanceof T.Mesh) o.castShadow = true
  })
  return { root, animate }
}
