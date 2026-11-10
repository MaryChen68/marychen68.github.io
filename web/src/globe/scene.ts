// The 3D globe: solid land on a pale ocean, section markers, and a traveler.
// The globe keeps north up and only turns when dragged or when a route needs it.
import * as T from 'three'
import { createTraveler } from './character'
import { isLand } from './landmask'

const R = 5 // globe radius
const TRAVELER_SCALE = 0.55
const WALK_SPEED = 0.35 // radians per second along the surface
const ARRIVE_ANGLE = 0.07 // how close counts as "arrived", in radians
// Keep the traveler this far above the center of the view (radians), so we see them standing
const VIEW_LIFT = 0.85
const MAX_TILT = 1.1

const INK = '#2e332f'
const LAND = '#9aa392'
const OCEAN = '#e3e6e2'
const ACCENT = '#b4532a'
const UP = new T.Vector3(0, 1, 0)
const RIGHT = new T.Vector3(1, 0, 0)
const FRONT = new T.Vector3(0, 0, 1)

export type Place = { lat: number; lon: number }

export type FrameInfo = {
  labels: { x: number; y: number; visible: boolean }[]
  near: number
  hover: number
}

type Options = {
  places: Place[]
  start: Place
  onReady?: () => void
  onArrive?: (index: number) => void
  onLeave?: () => void
  onMove?: () => void
  onFrame?: (info: FrameInfo) => void
}

// Latitude/longitude in degrees → unit vector
export function toVector({ lat, lon }: Place) {
  const phi = T.MathUtils.degToRad(90 - lat)
  const theta = T.MathUtils.degToRad(lon + 180)
  return new T.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  )
}

// Rotation that maps (up, forward) onto (toUp, toForward)
function alignment(
  up: T.Vector3,
  forward: T.Vector3,
  toUp: T.Vector3,
  toForward: T.Vector3,
) {
  const from = new T.Matrix4().makeBasis(
    forward,
    up,
    new T.Vector3().crossVectors(forward, up),
  )
  const to = new T.Matrix4().makeBasis(
    toForward,
    toUp,
    new T.Vector3().crossVectors(toForward, toUp),
  )
  return new T.Quaternion().setFromRotationMatrix(to.multiply(from.transpose()))
}

// A direction along the surface at `up` that isn't degenerate near the poles
function anyTangent(up: T.Vector3) {
  const ref = Math.abs(up.y) < 0.9 ? UP : RIGHT
  return new T.Vector3().crossVectors(ref, up).normalize()
}

// The globe turn (yaw around Y, then tilt around X) that brings point `p` to the front
function viewOf(p: T.Vector3) {
  const yaw = Math.atan2(-p.x, p.z)
  const tilt = Math.atan2(p.y, Math.hypot(p.x, p.z)) - VIEW_LIFT
  return { yaw, tilt: T.MathUtils.clamp(tilt, -MAX_TILT, MAX_TILT) }
}

// Paint the land map onto a canvas, with smoothed coastlines, to wrap around the sphere
function landTexture() {
  const small = document.createElement('canvas')
  small.width = 720
  small.height = 360
  const sctx = small.getContext('2d')!
  const img = sctx.createImageData(720, 360)
  for (let y = 0; y < 360; y++)
    for (let x = 0; x < 720; x++)
      if (isLand(90 - (y + 0.5) / 2, (x + 0.5) / 2 - 180))
        img.data[(y * 720 + x) * 4 + 3] = 255
  sctx.putImageData(img, 0, 0)

  // Scale up with a slight blur, then cut at 50% for smooth, crisp edges
  const big = document.createElement('canvas')
  big.width = 2048
  big.height = 1024
  const ctx = big.getContext('2d')!
  ctx.filter = 'blur(2px)'
  ctx.drawImage(small, 0, 0, big.width, big.height)
  const out = ctx.getImageData(0, 0, big.width, big.height)
  // Canvas pixels are sRGB bytes, so read the hex colors directly
  const rgb = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const land = rgb(LAND)
  const ocean = rgb(OCEAN)
  for (let i = 0; i < out.data.length; i += 4) {
    const c = out.data[i + 3] > 127 ? land : ocean
    out.data[i] = c[0]
    out.data[i + 1] = c[1]
    out.data[i + 2] = c[2]
    out.data[i + 3] = 255
  }
  ctx.putImageData(out, 0, 0)

  const texture = new T.CanvasTexture(big)
  texture.colorSpace = T.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createGlobe(container: HTMLElement, options: Options) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  const canvas = renderer.domElement
  canvas.style.touchAction = 'none'
  canvas.setAttribute(
    'aria-label',
    '3D globe. Drag to turn it, click a marker to travel there.',
  )
  container.appendChild(canvas)

  const scene = new T.Scene()
  const camera = new T.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 200)
  let distance = innerWidth < 700 ? 30 : 20

  scene.add(new T.HemisphereLight('#ffffff', '#ddd8cc', 2.8))
  const key = new T.DirectionalLight('#fff4e6', 1.3)
  key.position.set(6, 8, 12)
  scene.add(key)

  // Everything on the planet lives in this group, so turning it turns them all
  const planet = new T.Group()
  scene.add(planet)

  const globe = new T.Mesh(
    new T.SphereGeometry(R, 96, 64),
    new T.MeshStandardMaterial({ map: landTexture(), roughness: 1 }),
  )
  planet.add(globe)
  scene.add(
    new T.Mesh(
      new T.SphereGeometry(R * 1.02, 64, 48),
      new T.MeshBasicMaterial({ color: '#d8d3c8', side: T.BackSide }),
    ),
  )

  // --- Markers: a slim pin with a pulsing ring at each place ---
  const placeVectors = options.places.map(toVector)
  const ringMaterial = new T.MeshBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0.6,
    side: T.DoubleSide,
  })
  const markers = placeVectors.map((v, i) => {
    const pin = new T.Group()
    pin.position.copy(v).multiplyScalar(R)
    pin.quaternion.copy(alignment(UP, RIGHT, v, anyTangent(v)))
    const stem = new T.Mesh(
      new T.CylinderGeometry(0.02, 0.02, 0.9, 6),
      new T.MeshBasicMaterial({ color: INK }),
    )
    stem.position.y = 0.45
    const head = new T.Mesh(
      new T.SphereGeometry(0.13, 16, 12),
      new T.MeshBasicMaterial({ color: ACCENT }),
    )
    head.position.y = 0.95
    const ring = new T.Mesh(new T.RingGeometry(0.32, 0.36, 40), ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.02
    // A larger invisible target makes the pin easy to click
    const hitbox = new T.Mesh(
      new T.CylinderGeometry(0.35, 0.35, 1.3, 8),
      new T.MeshBasicMaterial({ visible: false }),
    )
    hitbox.position.y = 0.6
    pin.add(stem, head, ring, hitbox)
    pin.traverse((o) => (o.userData.place = i))
    planet.add(pin)
    return { pin, ring }
  })

  // --- Traveler ---
  const traveler = createTraveler()
  traveler.root.scale.setScalar(TRAVELER_SCALE)
  planet.add(traveler.root)
  const position = toVector(options.start)
  // Start facing east, so we see them in profile
  const forward = anyTangent(position)
  let destination: T.Vector3 | null = null
  let speed = 0
  let walkTime = 0

  // --- View: yaw/tilt of the globe; it follows the route while traveling ---
  let view = viewOf(position)
  let follow = false

  let layout = { panelOpen: false, introOpen: true }
  let viewOffset = { x: 0, y: 0 }
  let near = -1
  let hover = -1
  let lastTime = performance.now()
  let frameId = 0
  let frameCount = 0
  const raycaster = new T.Raycaster()
  const pointer = new T.Vector2()
  const tmp = new T.Vector3()
  const toCamera = new T.Vector3()
  const yawQ = new T.Quaternion()
  const tiltQ = new T.Quaternion()

  function walkTo(target: T.Vector3) {
    destination = target.clone().normalize()
    follow = true
    options.onMove?.()
  }

  function travelTo(index: number) {
    const target = placeVectors[index]
    if (!target) return
    if (position.angleTo(target) < ARRIVE_ANGLE) {
      follow = true
      options.onArrive?.(index)
    } else walkTo(target)
  }

  // --- Input: drag to turn the globe, scroll to zoom, click to walk ---
  function cast(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
  }
  const pickMarker = (): number =>
    raycaster.intersectObjects(
      markers.map((m) => m.pin),
      true,
    )[0]?.object.userData.place ?? -1

  let drag: {
    x: number
    y: number
    lastX: number
    lastY: number
    moved: boolean
  } | null = null
  const onPointerDown = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId)
    drag = {
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    }
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!drag) {
      cast(e)
      hover = pickMarker()
      canvas.style.cursor = hover >= 0 ? 'pointer' : 'grab'
      return
    }
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6)
      drag.moved = true
    if (!drag.moved) return
    follow = false
    view = {
      yaw: view.yaw + (e.clientX - drag.lastX) * 0.005,
      tilt: T.MathUtils.clamp(
        view.tilt + (e.clientY - drag.lastY) * 0.005,
        -MAX_TILT,
        MAX_TILT,
      ),
    }
    drag.lastX = e.clientX
    drag.lastY = e.clientY
    canvas.style.cursor = 'grabbing'
  }
  const onPointerUp = (e: PointerEvent) => {
    if (!drag) return
    const moved = drag.moved
    drag = null
    canvas.style.cursor = 'grab'
    if (moved || e.button !== 0) return
    cast(e)
    const place = pickMarker()
    if (place >= 0) return travelTo(place)
    const hit = raycaster.intersectObject(globe)[0]
    if (hit) walkTo(planet.worldToLocal(hit.point.clone()))
  }
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    distance = T.MathUtils.clamp(distance + e.deltaY * 0.01, 13, 34)
  }
  const onResize = () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('resize', onResize)

  function render(now: number) {
    frameId = requestAnimationFrame(render)
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    if (document.hidden) return

    // Walk along the great circle toward the destination
    let moving = false
    if (destination) {
      const angle = position.angleTo(destination)
      const step = WALK_SPEED * dt
      if (angle <= step) {
        position.copy(destination)
        destination = null
      } else {
        const axis = tmp.crossVectors(position, destination).normalize()
        position.applyAxisAngle(axis, step).normalize()
        forward.crossVectors(axis, position).normalize()
        moving = true
        walkTime += dt
      }
    }
    // Keep "forward" flat against the surface
    forward
      .sub(position.clone().multiplyScalar(forward.dot(position)))
      .normalize()
    speed = T.MathUtils.lerp(speed, moving ? 1 : 0, 1 - Math.exp(-dt * 12))
    traveler.root.position.copy(position).multiplyScalar(R)
    traveler.root.quaternion.copy(alignment(UP, FRONT, position, forward))
    traveler.animate(walkTime, reduced ? 0 : speed)

    // Arriving at or leaving a place
    const nextNear = placeVectors.findIndex(
      (v) => position.angleTo(v) < ARRIVE_ANGLE,
    )
    if (nextNear !== near) {
      near = nextNear
      if (near >= 0) options.onArrive?.(near)
      else options.onLeave?.()
    }

    // While traveling, turn the globe so the rest of the route stays in view
    if (follow) {
      const focus = destination
        ? position.clone().add(destination).normalize()
        : position
      const goal = viewOf(focus)
      const k = reduced ? 1 : 1 - Math.exp(-dt * 2)
      const yawDiff =
        T.MathUtils.euclideanModulo(
          goal.yaw - view.yaw + Math.PI,
          Math.PI * 2,
        ) - Math.PI
      view = {
        yaw: view.yaw + yawDiff * k,
        tilt: T.MathUtils.lerp(view.tilt, goal.tilt, k),
      }
    }
    yawQ.setFromAxisAngle(UP, view.yaw)
    tiltQ.setFromAxisAngle(RIGHT, view.tilt)
    planet.quaternion.copy(tiltQ).multiply(yawQ)

    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)

    // Shift the view so the globe isn't hidden behind the intro or the panel
    const narrow = innerWidth < 700
    const goal = {
      x:
        innerWidth > 1100
          ? layout.panelOpen
            ? 0.13
            : layout.introOpen
              ? -0.12
              : 0
          : 0,
      y: narrow && (layout.panelOpen || layout.introOpen) ? 0.18 : 0,
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 6)
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
    camera.updateMatrixWorld()

    // Pulse the marker rings
    markers.forEach((m, i) => {
      const pulse = reduced ? 1 : 1 + Math.sin(now / 500 + i) * 0.08
      m.ring.scale.setScalar(near === i || hover === i ? 1.3 * pulse : pulse)
    })

    // Report label positions for the HTML overlay; hide labels on the far side
    toCamera.copy(camera.position).normalize()
    const labels = placeVectors.map((v) => {
      const normal = tmp.copy(v).applyQuaternion(planet.quaternion)
      const facing = normal.dot(toCamera)
      normal.multiplyScalar(R + 1.25).project(camera)
      const x = (normal.x * 0.5 + 0.5) * innerWidth
      const y = (-normal.y * 0.5 + 0.5) * innerHeight
      return { x, y, visible: facing > 0.2 && normal.z < 1 }
    })
    options.onFrame?.({ labels, near, hover })

    renderer.render(scene, camera)
    if (++frameCount === 2) options.onReady?.()
  }
  frameId = requestAnimationFrame(render)

  return {
    travelTo,
    setLayout: (next: { panelOpen: boolean; introOpen: boolean }) =>
      (layout = next),
    // Stop walking and bring the traveler back into view
    overview: () => {
      destination = null
      follow = true
    },
    destroy() {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose()
          ;(o.material as T.Material).dispose()
        }
      })
      renderer.dispose()
      canvas.remove()
    },
  }
}

export type Globe = ReturnType<typeof createGlobe>
