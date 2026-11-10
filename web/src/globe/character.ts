// The traveler: a young woman with long curly hair and brown glasses, in a robe
// and cape with a glowing hem, a soft halo, and motes of light around her.
// Feet sit at y = 0 and the figure faces +Z.
import * as T from 'three'

const colors = {
  cape: '#2f4b63',
  robe: '#b9c8d4',
  legs: '#26303a',
  hair: '#2b211d',
  skin: '#f2d4bf',
  skinShade: '#e3b9a0',
  lips: '#c27c6c',
  crease: '#a77c68',
  glasses: '#7a4b2a',
  glow: '#ffe2a3',
}

// A thin curved line through three points (eyelid crease, smile)
function curve(
  parent: T.Object3D,
  color: string,
  points: [number, number, number][],
  radius = 0.004,
) {
  const path = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)))
  parent.add(
    new T.Mesh(new T.TubeGeometry(path, 12, radius, 5), material(color)),
  )
}

function material(color: string, glow = 0) {
  return new T.MeshStandardMaterial({
    color,
    roughness: 0.8,
    emissive: glow ? colors.glow : '#000000',
    emissiveIntensity: glow,
    side: T.DoubleSide,
  })
}

function part(
  parent: T.Object3D,
  geometry: T.BufferGeometry,
  mat: T.Material,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
) {
  const mesh = new T.Mesh(geometry, mat)
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  parent.add(mesh)
  return mesh
}

// A soft round glow, drawn once and reused for the halo and the motes
function glowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  g.addColorStop(0, 'rgba(255, 236, 190, 1)')
  g.addColorStop(0.35, 'rgba(255, 220, 150, 0.6)')
  g.addColorStop(1, 'rgba(255, 226, 163, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  return texture
}

export type Traveler = {
  root: T.Group
  animate: (walkTime: number, speed: number, time: number) => void
}

export function createTraveler(): Traveler {
  const root = new T.Group()
  const sphere = new T.SphereGeometry(1, 20, 14)
  const capsule = new T.CapsuleGeometry(0.5, 1, 4, 10)

  // Short legs peeking out under the robe
  const legs = [-1, 1].map((side) => {
    const leg = new T.Group()
    leg.position.set(side * 0.1, 0.5, 0)
    part(leg, capsule, material(colors.legs), [0, -0.25, 0], [0.11, 0.25, 0.12])
    part(
      leg,
      sphere,
      material(colors.legs),
      [0, -0.48, 0.05],
      [0.08, 0.05, 0.12],
    )
    root.add(leg)
    return leg
  })

  const body = new T.Group()
  root.add(body)

  // Robe: a bell shape from the hem up to the shoulders
  const robeShape = [
    new T.Vector2(0.36, 0.38),
    new T.Vector2(0.33, 0.6),
    new T.Vector2(0.26, 0.95),
    new T.Vector2(0.2, 1.25),
    new T.Vector2(0.12, 1.36),
  ]
  part(
    body,
    new T.LatheGeometry(robeShape, 24),
    material(colors.robe),
    [0, 0, 0],
  )

  // Cape: an open half-cone hanging from the shoulders, with a glowing hem
  const cape = new T.Group()
  cape.position.y = 1.32
  body.add(cape)
  // Covers the back 70% of the way around, so the robe shows at the sides
  const arc = [Math.PI * 0.65, Math.PI * 0.7] as const
  const capeGeo = new T.CylinderGeometry(0.18, 0.42, 0.85, 24, 1, true, ...arc)
  part(cape, capeGeo, material(colors.cape), [0, -0.42, -0.02])
  const trimGeo = new T.CylinderGeometry(0.42, 0.43, 0.05, 24, 1, true, ...arc)
  part(cape, trimGeo, material(colors.glow, 1.6), [0, -0.85, -0.02])

  // Small arms in the robe's sleeves
  const arms = [-1, 1].map((side) => {
    const arm = new T.Group()
    arm.position.set(side * 0.2, 1.2, 0)
    part(
      arm,
      capsule,
      material(colors.robe),
      [side * 0.04, -0.2, 0],
      [0.09, 0.18, 0.09],
    )
    part(
      arm,
      sphere,
      material(colors.skin),
      [side * 0.05, -0.42, 0.01],
      [0.055, 0.055, 0.055],
    )
    body.add(arm)
    return arm
  })

  // Head
  const head = new T.Group()
  head.position.y = 1.62
  body.add(head)
  part(head, sphere, material(colors.skin), [0, 0, 0], [0.25, 0.27, 0.25])

  // Hair: a cap on top, side-swept bangs, and long curls down the back
  const hair = material(colors.hair)
  part(head, sphere, hair, [0, 0.07, -0.06], [0.27, 0.26, 0.26])
  part(head, sphere, hair, [-0.08, 0.16, 0.17], [0.16, 0.07, 0.08]).rotation.z =
    0.35
  part(head, sphere, hair, [0.1, 0.18, 0.15], [0.12, 0.06, 0.08]).rotation.z =
    -0.2
  for (let i = 0; i < 11; i++) {
    // Strands spread around the back and sides, leaving the face clear
    const a = Math.PI * (0.32 + (i / 10) * 1.36)
    const out = new T.Vector3(Math.sin(a), 0, Math.cos(a))
    const side = new T.Vector3(Math.cos(a), 0, -Math.sin(a))
    for (let k = 0; k < 6; k++) {
      const wave = Math.sin(k * 1.9 + i * 1.3) * 0.035
      const r = 0.23 + k * 0.012
      const p = out.clone().multiplyScalar(r).addScaledVector(side, wave)
      part(
        head,
        sphere,
        hair,
        [p.x, -0.04 - k * 0.11, p.z - 0.02],
        [0.075 - k * 0.004, 0.08, 0.075 - k * 0.004],
      )
    }
  }

  // Face: eyes with a double-eyelid crease, brows, nose, and a small smile
  for (const side of [-1, 1]) {
    const x = side * 0.085
    part(
      head,
      sphere,
      material(colors.hair),
      [x, -0.01, 0.222],
      [0.032, 0.026, 0.02],
    )
    part(
      head,
      sphere,
      material('#ffffff'),
      [x + 0.01, 0.0, 0.24],
      [0.008, 0.008, 0.004],
    )
    curve(head, colors.crease, [
      [x - 0.034, 0.016, 0.228],
      [x, 0.032, 0.238],
      [x + 0.034, 0.016, 0.228],
    ])
    part(
      head,
      new T.BoxGeometry(1, 1, 1),
      hair,
      [x, 0.075, 0.232],
      [0.06, 0.012, 0.01],
    ).rotation.z = side * -0.08
  }
  part(
    head,
    sphere,
    material(colors.skinShade),
    [0, -0.06, 0.245],
    [0.018, 0.02, 0.015],
  )
  curve(
    head,
    colors.lips,
    [
      [-0.03, -0.112, 0.228],
      [0, -0.124, 0.236],
      [0.03, -0.112, 0.228],
    ],
    0.005,
  )

  // Brown round glasses
  const frame = colors.glasses
  for (const side of [-1, 1]) {
    part(head, new T.TorusGeometry(0.058, 0.008, 8, 28), material(frame), [
      side * 0.085,
      -0.005,
      0.262,
    ])
    curve(
      head,
      frame,
      [
        [side * 0.143, 0, 0.255],
        [side * 0.22, 0.01, 0.15],
        [side * 0.25, 0.02, 0.02],
      ],
      0.006,
    )
  }
  curve(
    head,
    frame,
    [
      [-0.027, 0.005, 0.265],
      [0, 0.015, 0.27],
      [0.027, 0.005, 0.265],
    ],
    0.006,
  )

  // Halo behind the figure, and a warm light that falls on the ground
  const texture = glowTexture()
  const halo = new T.Sprite(
    new T.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    }),
  )
  halo.position.y = 1.1
  halo.scale.setScalar(2.6)
  halo.renderOrder = -1
  root.add(halo)
  const light = new T.PointLight(colors.glow, 4, 3.5, 1.5)
  light.position.y = 0.9
  root.add(light)

  // Motes of light that rise around the figure and fade out
  const motes = Array.from({ length: 7 }, (_, i) => {
    const mote = new T.Sprite(
      new T.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
    )
    mote.userData.offset = i / 7
    root.add(mote)
    return mote
  })

  function animate(walkTime: number, speed: number, time: number) {
    const swing = Math.sin(walkTime * 9)
    legs[0].rotation.x = swing * 0.5 * speed
    legs[1].rotation.x = -swing * 0.5 * speed
    arms[0].rotation.x = -swing * 0.35 * speed
    arms[1].rotation.x = swing * 0.35 * speed
    body.position.y =
      Math.abs(swing) * 0.05 * speed + Math.sin(time * 2) * 0.015
    // The cape lifts behind them as they walk
    cape.rotation.x = 0.08 + 0.3 * speed + Math.sin(time * 3) * 0.03

    halo.material.opacity = 0.5 + Math.sin(time * 1.6) * 0.08
    motes.forEach((mote, i) => {
      const t = (time * 0.25 + mote.userData.offset) % 1
      const angle = i * 2.4 + time * 0.4
      mote.position.set(
        Math.cos(angle) * 0.55,
        0.3 + t * 1.9,
        Math.sin(angle) * 0.55,
      )
      mote.scale.setScalar(0.18 * (1 - t * 0.6))
      mote.material.opacity = Math.sin(t * Math.PI) * 0.9
    })
  }

  root.traverse((o) => {
    if (o instanceof T.Mesh) o.castShadow = true
  })
  return { root, animate }
}
