// The 3D island: terrain, water, scenery, stations, the walker, and the camera.
// Adapted from island-portfolio by panggungunvibe (MIT License).
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import {
  agave,
  animateWalker,
  makeWalker,
  mesh,
  oliveTree,
  pine,
  rock,
  roundTree,
  grassTuft,
  station,
} from './models'
import {
  ARRIVAL_RADIUS,
  type StationSite,
  SPAWN,
  findRoute,
  slideStep,
  type Obstacle,
  type Point,
} from './navigation'
import { themeIds, themes, type ThemeId } from './themes'

const TAU = Math.PI * 2
const RADIUS = 13.8
const POND = { x: -1.15, z: -0.65, r: 1.8 }
export function groundHeight(x: number, z: number) {
  const r = Math.hypot(x, z)
  let y =
    0.15 +
    1.65 * Math.max(0, 1 - (r / RADIUS) ** 2) +
    0.06 * Math.sin(x * 0.55) * Math.cos(z * 0.7)
  const d = Math.hypot(x - POND.x, z - POND.z)
  if (d < 2.15) {
    const t = T.MathUtils.smoothstep(d, 1.5, 2.15)
    y = 0.94 * (1 - t) + y * t
  }
  return y
}

// Deterministic random numbers, so the island looks the same on every visit
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

// Combine many small meshes into one per material, for speed
function mergeScenery(root: T.Group) {
  root.updateMatrixWorld(true)
  const byMaterial = new Map<T.Material, T.BufferGeometry[]>()
  root.traverse((o) => {
    if (!(o instanceof T.Mesh) || Array.isArray(o.material)) return
    const geo = o.geometry.index
      ? o.geometry.toNonIndexed()
      : o.geometry.clone()
    geo.applyMatrix4(o.matrixWorld)
    byMaterial.set(o.material, [...(byMaterial.get(o.material) ?? []), geo])
  })
  root.clear()
  for (const [material, geos] of byMaterial) {
    const geometry = mergeGeometries(geos, false)
    if (geometry) {
      const m = new T.Mesh(geometry, material)
      m.castShadow = true
      m.receiveShadow = true
      root.add(m)
    }
    geos.forEach((g) => g.dispose())
  }
}

export type FrameInfo = {
  labels: { x: number; y: number; visible: boolean }[]
  player: Point
  azimuth: number
  near: number
  hover: number
}

type Options = {
  sites: StationSite[]
  onReady?: () => void
  onArrive?: (index: number) => void
  onLeave?: () => void
  onMove?: () => void
  onBlocked?: () => void
  onFrame?: (info: FrameInfo) => void
}

export function createIsland(container: HTMLElement, options: Options) {
  const { sites } = options
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7))
  renderer.setSize(innerWidth, innerHeight)
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap
  const canvas = renderer.domElement
  canvas.setAttribute(
    'aria-label',
    '3D island. Drag to look around, click the ground to walk.',
  )
  container.appendChild(canvas)

  const scene = new T.Scene()
  scene.background = new T.Color()
  scene.fog = new T.Fog('#ffffff', 65, 135)

  const camera = new T.PerspectiveCamera(
    innerWidth < 700 ? 55 : 38,
    innerWidth / innerHeight,
    0.1,
    180,
  )
  const controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 0.8, 0)
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.075
  controls.rotateSpeed = 0.65
  controls.zoomSpeed = 0.7
  controls.minPolarAngle = Math.PI * 0.12
  controls.maxPolarAngle = Math.PI * 0.37

  // --- Lights ---
  const hemi = new T.HemisphereLight('#ffffff', '#999999', 1.4)
  scene.add(hemi)
  const sun = new T.DirectionalLight('#ffffff', 2.3)
  sun.position.set(-12, 25, 16)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, {
    left: -20,
    right: 20,
    top: 20,
    bottom: -20,
    near: 1,
    far: 65,
  })
  sun.shadow.normalBias = 0.03
  sun.shadow.radius = 4
  scene.add(sun)
  const fill = new T.DirectionalLight('#dfe8f0', 0.6)
  fill.position.set(15, 8, -12)
  scene.add(fill)

  // --- Terrain: a gently domed disc built from concentric rings ---
  const verts = [0, groundHeight(0, 0), 0]
  const indices: number[] = []
  const sectors = 112
  const rings = 40
  for (let j = 1; j <= rings; j++)
    for (let i = 0; i < sectors; i++) {
      const a = (i / sectors) * TAU
      const r = (j / rings) * RADIUS
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      verts.push(x, groundHeight(x, z), z)
    }
  for (let i = 0; i < sectors; i++)
    indices.push(0, 1 + ((i + 1) % sectors), 1 + i)
  for (let j = 1; j < rings; j++)
    for (let i = 0; i < sectors; i++) {
      const a = 1 + (j - 1) * sectors + i
      const b = 1 + (j - 1) * sectors + ((i + 1) % sectors)
      const c = 1 + j * sectors + i
      const d = 1 + j * sectors + ((i + 1) % sectors)
      indices.push(a, b, c, b, d, c)
    }
  const landGeo = new T.BufferGeometry()
  landGeo.setAttribute('position', new T.Float32BufferAttribute(verts, 3))
  landGeo.setIndex(indices)
  landGeo.computeVertexNormals()
  const landMat = new T.MeshStandardMaterial({ roughness: 1 })
  const land = new T.Mesh(landGeo, landMat)
  land.receiveShadow = true
  scene.add(land)

  const sandMat = new T.MeshStandardMaterial({ roughness: 1 })
  mesh(
    scene,
    new T.CylinderGeometry(14.15, 13.9, 0.42, 112),
    sandMat,
    [0, -0.1, 0],
  ).castShadow = false
  const earthMat = new T.MeshStandardMaterial({ roughness: 1 })
  mesh(
    scene,
    new T.CylinderGeometry(13.9, 12.7, 1.2, 112),
    earthMat,
    [0, -0.75, 0],
  )

  // --- Water: soft rings around the island, fading into the fog ---
  const waterMat = new T.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new T.Color() },
      far: { value: new T.Color() },
    },
    vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float time;uniform vec3 color;uniform vec3 far;varying vec3 vP;void main(){vec2 p=vP.xz;float r=length(p);float waves=sin(r*2.4-time*.45+sin(atan(p.y,p.x)*7.)*.18)*.5+.5;float rings=pow(waves,18.)*exp(-max(0.,r-14.)*.1);float shore=exp(-pow((r-14.7)/.6,2.));vec3 c=color+vec3(.08)*rings+shore*vec3(.1);c=mix(c,far,smoothstep(28.,90.,r)*.75);gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  })
  const ocean = mesh(
    scene,
    new T.PlaneGeometry(240, 240).rotateX(-Math.PI / 2),
    waterMat,
    [0, -0.7, 0],
  )
  ocean.castShadow = false
  const lakeMat = new T.MeshStandardMaterial({ roughness: 0.2, metalness: 0.1 })
  mesh(scene, new T.CircleGeometry(1.87, 64).rotateX(-Math.PI / 2), lakeMat, [
    POND.x,
    1.12,
    POND.z,
  ]).castShadow = false

  // --- Obstacles: pond, stations, and the ring of trees ---
  const random = seeded(83)
  const trees = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * TAU + (random() - 0.5) * 0.12
    const r = 10.85 + random() * 1.9
    return {
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      scale: 0.7 + random() * 0.45,
    }
  })
  const obstacles: Obstacle[] = [
    { ...POND, r: 2.05 },
    ...sites.map((s) => ({ x: s.position[0], z: s.position[1], r: 1.35 })),
    ...trees
      .filter((t) => Math.hypot(t.x, t.z) < 12.2)
      .map((t) => ({ x: t.x, z: t.z, r: 0.4 })),
  ]
  const nearStation = (x: number, z: number, pad: number) =>
    sites.some(
      (s) =>
        Math.hypot(x - s.arrival[0], z - s.arrival[1]) < pad ||
        Math.hypot(x - s.position[0], z - s.position[1]) < pad + 0.6,
    )

  // --- One scenery set per theme; only the active one is visible ---
  const biomes = {} as Record<ThemeId, T.Group>
  const stationGroups = {} as Record<ThemeId, T.Group>
  for (const id of themeIds) {
    const t = themes[id]
    const root = new T.Group()
    const scenery = new T.Group()
    const props = new T.Group()
    root.add(scenery, props)
    scene.add(root)
    biomes[id] = root
    stationGroups[id] = props
    const rng = seeded(16)

    trees.forEach((tree, i) => {
      const y = groundHeight(tree.x, tree.z)
      if (id === 'forest')
        (i % 3 === 0 ? roundTree : pine)(
          scenery,
          tree.x,
          y,
          tree.z,
          tree.scale,
          t,
        )
      else if (id === 'desert') {
        if (i % 3 === 0) oliveTree(scenery, tree.x, y, tree.z, tree.scale, t)
        else if (i % 3 === 1) agave(scenery, tree.x, y, tree.z, tree.scale, t)
        else rock(scenery, tree.x, y, tree.z, tree.scale * 0.7, t.rock)
      } else
        (i % 2 === 0 ? pine : roundTree)(
          scenery,
          tree.x,
          y,
          tree.z,
          tree.scale * 0.9,
          t,
        )
    })

    for (let i = 0; i < 50; i++) {
      const a = (i / 50) * TAU
      const r = 13.3 + rng() * 0.4
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      rock(scenery, x, groundHeight(x, z), z, 0.28 + rng() * 0.35, t.rock)
    }

    for (let i = 0; i < 140; i++) {
      const a = rng() * TAU
      const r = 3 + rng() * 9.8
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      if (Math.hypot(x - POND.x, z - POND.z) < 2.4 || nearStation(x, z, 1.25))
        continue
      const y = groundHeight(x, z)
      if (i % 3 === 0) rock(scenery, x, y, z, 0.08 + rng() * 0.1, t.rock)
      else grassTuft(scenery, x, y, z, t.grass)
    }

    if (id === 'forest')
      for (let i = 0; i < 3; i++) {
        const x = -3 + i * 1.8
        const z = -11.3
        const h = 1.5 + (i === 1 ? 1.2 : 0)
        mesh(
          scenery,
          new T.ConeGeometry(1, 1, 5),
          '#97a29d',
          [x, groundHeight(x, z) + h * 0.5, z],
          [1.35, h, 1.3],
        )
      }

    mergeScenery(scenery)

    sites.forEach((site, i) => {
      const prop = station(site.kind, t)
      prop.position.set(
        site.position[0],
        groundHeight(...site.position),
        site.position[1],
      )
      // Face the building toward the island center
      prop.rotation.y = Math.atan2(-site.position[0], -site.position[1])
      prop.traverse((o) => (o.userData.station = i))
      props.add(prop)
    })
  }

  // --- Arrival markers: a thin ring in front of each station ---
  const markers = sites.map((site) => {
    const [x, z] = site.arrival
    const ringMat = new T.MeshBasicMaterial({ transparent: true, opacity: 0.8 })
    const ring = mesh(scene, new T.TorusGeometry(0.6, 0.018, 6, 48), ringMat, [
      x,
      groundHeight(x, z) + 0.06,
      z,
    ])
    ring.rotation.x = -Math.PI / 2
    ring.castShadow = false
    const diskMat = new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    })
    const disk = mesh(
      scene,
      new T.CircleGeometry(0.58, 48).rotateX(-Math.PI / 2),
      diskMat,
      [x, groundHeight(x, z) + 0.065, z],
    )
    disk.castShadow = false
    return { ring, ringMat, diskMat }
  })

  // --- The walker ---
  const walker = makeWalker()
  scene.add(walker)
  let position: Point = [...SPAWN]
  walker.rotation.y = 0.25
  const targetMarker = mesh(
    scene,
    new T.TorusGeometry(0.2, 0.02, 6, 32),
    new T.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.85,
    }),
  )
  targetMarker.rotation.x = -Math.PI / 2
  targetMarker.visible = false

  let theme: ThemeId = 'forest'
  let path: Point[] = []
  let near = -1
  let hover = -1
  let speed = 0
  let targetYaw = 0.25
  let walkTime = 0
  let lastTime = performance.now()
  let overviewAnim: { from: T.Vector3; to: T.Vector3; start: number } | null =
    null
  let isOverview = true
  let layout = { panelOpen: false, introOpen: true }
  let viewOffset = { x: 0, y: 0 }
  let frameId = 0
  let frameCount = 0
  const keys = new Set<string>()
  const raycaster = new T.Raycaster()
  const pointer = new T.Vector2()
  const vec = new T.Vector3()

  function setTheme(id: ThemeId) {
    theme = id
    const t = themes[id]
    for (const k of themeIds) biomes[k].visible = k === id
    ;(scene.background as T.Color).set(t.background)
    scene.fog!.color.set(t.background)
    hemi.color.set(t.sky)
    hemi.groundColor.set(t.ground)
    sun.color.set(t.sun)
    landMat.color.set(t.ground)
    sandMat.color.set(t.sand)
    earthMat.color.set(t.earth)
    lakeMat.color.set(t.lake)
    waterMat.uniforms.color.value.set(t.water)
    waterMat.uniforms.far.value.set(t.background)
    markers.forEach((m) => {
      m.ringMat.color.set(t.accent)
      m.diskMat.color.set(t.accent)
    })
  }

  function resetCamera(animate: boolean) {
    const narrow = innerWidth < 700
    const distance = narrow ? 68 : Math.max(40, 47 / camera.aspect)
    controls.minDistance = narrow ? 33 : 23
    controls.maxDistance = narrow ? 80 : Math.max(46, 54 / camera.aspect)
    const to = new T.Vector3(19, 25, 30)
      .normalize()
      .multiplyScalar(distance)
      .add(new T.Vector3(0, 0.8, 0))
    if (animate && !reduced)
      overviewAnim = {
        from: camera.position.clone(),
        to,
        start: performance.now(),
      }
    else {
      camera.position.copy(to)
      controls.update()
    }
    isOverview = true
  }

  function moveTo(destination: Point) {
    const route = findRoute(position, destination, obstacles)
    if (!route.length) {
      options.onBlocked?.()
      return
    }
    path = route
    const end = route[route.length - 1]
    targetMarker.position.set(end[0], groundHeight(...end) + 0.07, end[1])
    targetMarker.visible = true
    options.onMove?.()
  }

  function travelTo(index: number) {
    const site = sites[index]
    if (!site) return
    if (
      Math.hypot(position[0] - site.arrival[0], position[1] - site.arrival[1]) <
      ARRIVAL_RADIUS
    ) {
      near = index
      options.onArrive?.(index)
    } else moveTo(site.arrival)
  }

  // --- Input: drag to orbit, click to walk, WASD / arrows to steer ---
  function cast(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
  }
  let pointerDown: { x: number; y: number; id: number } | null = null
  const onPointerDown = (e: PointerEvent) => {
    pointerDown = { x: e.clientX, y: e.clientY, id: e.pointerId }
    overviewAnim = null
    isOverview = false
  }
  const onPointerMove = (e: PointerEvent) => {
    if (pointerDown) return
    cast(e)
    const hit = raycaster.intersectObjects(
      stationGroups[theme].children,
      true,
    )[0]
    hover = hit?.object.userData.station ?? -1
    canvas.style.cursor = hover >= 0 ? 'pointer' : 'grab'
  }
  const onPointerUp = (e: PointerEvent) => {
    if (!pointerDown || pointerDown.id !== e.pointerId) return
    const moved =
      Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 6
    pointerDown = null
    if (moved || e.button !== 0) return
    cast(e)
    const prop = raycaster.intersectObjects(
      stationGroups[theme].children,
      true,
    )[0]
    if (prop) return travelTo(prop.object.userData.station)
    const hit = raycaster.intersectObject(land)[0]
    if (hit) moveTo([hit.point.x, hit.point.z])
  }
  const onPointerCancel = () => (pointerDown = null)
  const steerKeys = [
    'w',
    'a',
    's',
    'd',
    'arrowup',
    'arrowleft',
    'arrowdown',
    'arrowright',
  ]
  const onKey = (e: KeyboardEvent, down: boolean) => {
    const target = e.target as HTMLElement
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      target.closest('input,textarea,select,[data-panel]')
    )
      return
    const key = e.key.toLowerCase()
    if (!steerKeys.includes(key)) return
    e.preventDefault()
    if (down) {
      if (!keys.size) options.onMove?.()
      keys.add(key)
      path = []
    } else keys.delete(key)
  }
  const onKeyDown = (e: KeyboardEvent) => onKey(e, true)
  const onKeyUp = (e: KeyboardEvent) => onKey(e, false)
  const onBlur = () => keys.clear()
  const onResize = () => {
    const narrow = innerWidth < 700
    camera.aspect = innerWidth / innerHeight
    camera.fov = narrow ? 55 : 38
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
    if (isOverview) resetCamera(false)
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerCancel)
  controls.addEventListener('start', onPointerCancel)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  window.addEventListener('resize', onResize)

  setTheme(theme)
  resetCamera(false)

  // --- Main loop ---
  function render(now: number) {
    frameId = requestAnimationFrame(render)
    const dt = Math.min((now - lastTime) / 1000, 0.04)
    lastTime = now
    if (document.hidden) return

    // Movement: keys steer relative to the camera; otherwise follow the clicked path
    let dx =
      (keys.has('d') || keys.has('arrowright') ? 1 : 0) -
      (keys.has('a') || keys.has('arrowleft') ? 1 : 0)
    let dz =
      (keys.has('s') || keys.has('arrowdown') ? 1 : 0) -
      (keys.has('w') || keys.has('arrowup') ? 1 : 0)
    let next = position
    if (dx || dz) {
      const len = Math.hypot(dx, dz)
      dx /= len
      dz /= len
      const az = controls.getAzimuthalAngle()
      next = slideStep(
        position,
        [
          (dx * Math.cos(az) + dz * Math.sin(az)) * dt * 3.2,
          (-dx * Math.sin(az) + dz * Math.cos(az)) * dt * 3.2,
        ],
        obstacles,
      )
    } else if (path.length) {
      const target = path[0]
      const d = Math.hypot(target[0] - position[0], target[1] - position[1])
      if (d < 0.07) {
        next = target
        path.shift()
      } else {
        const step = Math.min(d, dt * 3.2)
        next = [
          position[0] + ((target[0] - position[0]) / d) * step,
          position[1] + ((target[1] - position[1]) / d) * step,
        ]
      }
    }
    const moving =
      Math.hypot(next[0] - position[0], next[1] - position[1]) > 0.0001
    if (moving) {
      targetYaw = Math.atan2(next[0] - position[0], next[1] - position[1])
      position = next
      walkTime += dt
    }
    if (!path.length) targetMarker.visible = false
    speed = T.MathUtils.lerp(speed, moving ? 1 : 0, 1 - Math.exp(-dt * 12))
    walker.position.set(
      position[0],
      groundHeight(...position) + 0.04,
      position[1],
    )
    const turn =
      T.MathUtils.euclideanModulo(
        targetYaw - walker.rotation.y + Math.PI,
        TAU,
      ) - Math.PI
    walker.rotation.y += turn * (1 - Math.exp(-dt * 10))
    animateWalker(walker, walkTime, reduced ? 0 : speed)

    // Arriving at or leaving a station
    const nextNear = sites.findIndex(
      (s) =>
        Math.hypot(position[0] - s.arrival[0], position[1] - s.arrival[1]) <
        ARRIVAL_RADIUS,
    )
    if (nextNear !== near) {
      near = nextNear
      if (near >= 0) options.onArrive?.(near)
      else options.onLeave?.()
    }

    // Camera
    if (overviewAnim) {
      const p = Math.min(1, (now - overviewAnim.start) / 800)
      camera.position.lerpVectors(
        overviewAnim.from,
        overviewAnim.to,
        p * p * (3 - 2 * p),
      )
      if (p === 1) overviewAnim = null
    }
    controls.update()

    // Shift the view so the island isn't hidden behind the intro or the panel
    const narrow = innerWidth < 700
    const goal = {
      x:
        innerWidth > 1100
          ? layout.panelOpen
            ? 0.12
            : layout.introOpen
              ? -0.1
              : 0
          : 0,
      y: narrow && (layout.panelOpen || layout.introOpen) ? 0.2 : 0,
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 7)
    viewOffset = {
      x: T.MathUtils.lerp(viewOffset.x, goal.x, k),
      y: T.MathUtils.lerp(viewOffset.y, goal.y, k),
    }
    if (Math.abs(viewOffset.x) > 0.0005 || Math.abs(viewOffset.y) > 0.0005)
      camera.setViewOffset(
        innerWidth,
        innerHeight,
        innerWidth * viewOffset.x,
        innerHeight * viewOffset.y,
        innerWidth,
        innerHeight,
      )
    else camera.clearViewOffset()

    // Gentle water motion and marker pulse
    waterMat.uniforms.time.value = reduced ? 0 : now / 1000
    markers.forEach((m, i) => {
      m.ring.scale.setScalar(reduced ? 1 : 1 + Math.sin(now / 600 + i) * 0.03)
      m.diskMat.opacity = near === i || hover === i ? 0.22 : 0.08
    })

    // Report label positions for the HTML overlay
    const labels = sites.map((s) => {
      vec
        .set(s.position[0], groundHeight(...s.position) + 3.6, s.position[1])
        .project(camera)
      const x = (vec.x * 0.5 + 0.5) * innerWidth
      const y = (-vec.y * 0.5 + 0.5) * innerHeight
      return {
        x,
        y,
        visible:
          vec.z < 1 &&
          x > 30 &&
          x < innerWidth - 30 &&
          y > 85 &&
          y < innerHeight - 85,
      }
    })
    options.onFrame?.({
      labels,
      player: position,
      azimuth: controls.getAzimuthalAngle(),
      near,
      hover,
    })

    renderer.render(scene, camera)
    if (++frameCount === 2) options.onReady?.()
  }
  frameId = requestAnimationFrame(render)

  return {
    travelTo,
    setTheme,
    overview: () => resetCamera(true),
    setLayout: (next: { panelOpen: boolean; introOpen: boolean }) =>
      (layout = next),
    stop: () => {
      path = []
      keys.clear()
    },
    destroy() {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      scene.traverse((o) => {
        if (o instanceof T.Mesh) o.geometry.dispose()
      })
      renderer.dispose()
      canvas.remove()
    },
  }
}

export type Island = ReturnType<typeof createIsland>
