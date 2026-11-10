// The traveler: a Memoji-style young woman with long curly hair and round
// glasses, in a robe and cape with a glowing hem, a soft halo, and motes of light.
// Feet sit at y = 0 and the figure faces +Z.
import * as T from 'three'

const colors = {
  cape: '#2f4b63',
  robe: '#b9c8d4',
  legs: '#26303a',
  hair: '#1d1714',
  skin: '#efc9ad',
  skinShade: '#e2b293',
  lipUpper: '#c97f6f',
  lipLower: '#d48a7a',
  liner: '#2a1d18',
  crease: '#c99a80',
  iris: '#4a3b33',
  glasses: '#b07a3c',
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

  // Head: big and round, Memoji-style
  const head = new T.Group()
  head.position.y = 1.72
  body.add(head)
  const skin = material(colors.skin)
  part(head, sphere, skin, [0, 0, 0], [0.33, 0.38, 0.32])
  part(head, sphere, skin, [0, -0.12, 0.02], [0.27, 0.22, 0.26])
  for (const side of [-1, 1]) {
    part(head, sphere, skin, [side * 0.325, -0.02, 0], [0.05, 0.07, 0.04])
    part(
      head,
      sphere,
      material('#ffffff'),
      [side * 0.335, -0.1, 0.02],
      [0.022, 0.022, 0.022],
    )
  }

  // Eyes: white, iris, pupil, highlight, eyeliner, and a double-eyelid crease
  for (const side of [-1, 1]) {
    const x = side * 0.12
    part(head, sphere, material('#ffffff'), [x, 0, 0.285], [0.075, 0.058, 0.03])
    part(
      head,
      sphere,
      material(colors.iris),
      [x, -0.003, 0.311],
      [0.045, 0.045, 0.012],
    )
    part(
      head,
      sphere,
      material('#111111'),
      [x, -0.003, 0.321],
      [0.022, 0.022, 0.006],
    )
    part(
      head,
      sphere,
      material('#ffffff'),
      [x + 0.015, 0.016, 0.326],
      [0.011, 0.011, 0.004],
    )
    curve(
      head,
      colors.liner,
      [
        [x - 0.078, 0.008, 0.298],
        [x, 0.06, 0.32],
        [x + 0.078, 0.012, 0.298],
      ],
      0.007,
    )
    curve(
      head,
      colors.crease,
      [
        [x - 0.066, 0.045, 0.302],
        [x, 0.088, 0.314],
        [x + 0.066, 0.048, 0.302],
      ],
      0.0035,
    )
    // Brows rise from the inner end and taper outward
    curve(
      head,
      colors.liner,
      [
        [side * 0.05, 0.15, 0.31],
        [x, 0.172, 0.31],
        [side * 0.19, 0.152, 0.285],
      ],
      0.011,
    )
  }
  part(
    head,
    sphere,
    material(colors.liner),
    [-0.105, -0.085, 0.305],
    [0.008, 0.008, 0.004],
  )

  // Nose and lips
  part(
    head,
    sphere,
    material(colors.skinShade),
    [0, -0.09, 0.322],
    [0.035, 0.03, 0.035],
  )
  part(
    head,
    sphere,
    material(colors.lipUpper),
    [0, -0.178, 0.3],
    [0.06, 0.018, 0.025],
  )
  part(
    head,
    sphere,
    material(colors.lipLower),
    [0, -0.2, 0.296],
    [0.055, 0.022, 0.025],
  )

  // Thin round gold-brown glasses
  const frame = new T.MeshStandardMaterial({
    color: colors.glasses,
    roughness: 0.4,
    metalness: 0.3,
  })
  for (const side of [-1, 1]) {
    part(head, new T.TorusGeometry(0.088, 0.006, 8, 36), frame, [
      side * 0.12,
      0,
      0.335,
    ])
    curve(
      head,
      colors.glasses,
      [
        [side * 0.208, 0, 0.31],
        [side * 0.3, 0.02, 0.12],
        [side * 0.33, 0, -0.02],
      ],
      0.005,
    )
  }
  curve(
    head,
    colors.glasses,
    [
      [-0.032, 0.01, 0.338],
      [0, 0.03, 0.342],
      [0.032, 0.01, 0.338],
    ],
    0.005,
  )

  // Hair: a smooth center-parted crown, side curtains, long volume, and fine spiral curls
  const hair = new T.MeshStandardMaterial({
    color: colors.hair,
    roughness: 0.45,
  })
  const hairLight = new T.MeshStandardMaterial({
    color: '#2e2420',
    roughness: 0.45,
  })
  part(head, sphere, hair, [0, 0.07, -0.07], [0.36, 0.41, 0.35])
  curve(
    head,
    colors.skin,
    [
      [0, 0.25, 0.24],
      [0, 0.42, 0.11],
      [0, 0.47, -0.06],
    ],
    0.008,
  )
  for (const side of [-1, 1]) {
    part(
      head,
      sphere,
      hair,
      [side * 0.28, -0.04, 0.15],
      [0.1, 0.32, 0.12],
    ).rotation.z = side * 0.18
    part(head, sphere, hair, [side * 0.31, -0.32, 0.02], [0.11, 0.38, 0.15])
  }
  part(head, sphere, hair, [0, -0.36, -0.17], [0.38, 0.55, 0.28])
  for (let i = 0; i < 20; i++) {
    // Curls spread around the sides and back, leaving the face clear
    const a = Math.PI * (0.32 + (i / 19) * 1.36)
    const out = new T.Vector3(Math.sin(a), 0, Math.cos(a))
    const across = new T.Vector3(Math.cos(a), 0, -Math.sin(a))
    const length = 0.62 + ((i * 7) % 5) * 0.05
    const points: T.Vector3[] = []
    for (let k = 0; k <= 48; k++) {
      const t = k / 48
      const turn = t * 4.5 * Math.PI * 2 + i * 1.7
      const p = out
        .clone()
        .multiplyScalar(0.3 + t * 0.09 + Math.sin(turn) * 0.035)
      p.addScaledVector(across, Math.cos(turn) * 0.035)
      p.y = -0.18 - t * length
      points.push(p)
    }
    const tube = new T.TubeGeometry(
      new T.CatmullRomCurve3(points),
      96,
      0.027,
      6,
    )
    part(head, tube, i % 3 === 0 ? hairLight : hair, [0, 0, -0.04])
  }

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
  halo.position.y = 1.3
  halo.scale.setScalar(3)
  halo.renderOrder = -1
  root.add(halo)
  const light = new T.PointLight(colors.glow, 4, 3.5, 1.5)
  light.position.y = 0.15
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
