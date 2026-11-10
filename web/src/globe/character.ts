// The traveler: a VRM avatar (made in VRoid Studio, served from public/avatar.vrm)
// with a code-driven walk and idle, a soft halo, and motes of light.
// Feet sit at y = 0 and the figure faces +Z.
import * as T from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  VRMLoaderPlugin,
  VRMUtils,
  type VRM,
  type VRMHumanBoneName,
} from '@pixiv/three-vrm'

const AVATAR_URL = `${import.meta.env.BASE_URL}avatar.vrm`
// How tall the avatar stands, in traveler units
const HEIGHT = 2.2
const GLOW = '#ffe2a3'

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
  let vrm: VRM | null = null

  new GLTFLoader()
    .register((parser) => new VRMLoaderPlugin(parser))
    .loadAsync(AVATAR_URL)
    .then((gltf) => {
      vrm = gltf.userData.vrm as VRM
      VRMUtils.removeUnnecessaryVertices(gltf.scene)
      VRMUtils.combineSkeletons(gltf.scene)
      // Older (VRM 0.x) exports face -Z; turn them to face +Z
      VRMUtils.rotateVRM0(vrm)
      const box = new T.Box3().setFromObject(vrm.scene)
      vrm.scene.scale.setScalar(HEIGHT / (box.max.y - box.min.y))
      vrm.scene.traverse((o) => {
        o.frustumCulled = false
        if (o instanceof T.Mesh) o.castShadow = true
      })
      root.add(vrm.scene)
    })
    .catch((error) => console.warn('Could not load the avatar:', error))

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
  const light = new T.PointLight(GLOW, 4, 3.5, 1.5)
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

  let nextBlink = 2

  function pose(name: VRMHumanBoneName, x: number, y = 0, z = 0) {
    vrm?.humanoid.getNormalizedBoneNode(name)?.rotation.set(x, y, z)
  }

  function animate(walkTime: number, speed: number, time: number) {
    if (vrm) {
      const swing = Math.sin(walkTime * 7)
      const breathe = Math.sin(time * 2)
      // Legs swing from the hips; knees bend as each foot comes forward
      pose('leftUpperLeg', -swing * 0.45 * speed)
      pose('rightUpperLeg', swing * 0.45 * speed)
      pose('leftLowerLeg', Math.max(0, swing) * 0.7 * speed)
      pose('rightLowerLeg', Math.max(0, -swing) * 0.7 * speed)
      // Arms rest by the sides and swing opposite the legs
      pose('leftUpperArm', swing * 0.35 * speed, 0, -1.2 + breathe * 0.02)
      pose('rightUpperArm', -swing * 0.35 * speed, 0, 1.2 - breathe * 0.02)
      pose('leftLowerArm', 0, 0, -0.15)
      pose('rightLowerArm', 0, 0, 0.15)
      // A small lean into the walk, and a gentle sway when standing
      pose('spine', 0.06 * speed + breathe * 0.01, swing * 0.05 * speed)
      pose('head', 0, 0, (1 - speed) * Math.sin(time * 0.7) * 0.05)
      vrm.scene.position.y = Math.abs(Math.cos(walkTime * 7)) * 0.04 * speed

      // Blink every few seconds
      if (time > nextBlink) nextBlink = time + 2.5 + Math.random() * 3
      const blink = Math.max(0, 1 - Math.abs(nextBlink - time - 0.1) * 10)
      vrm.expressionManager?.setValue('blink', time > 0 ? blink : 0)

      // Applies the pose and lets hair and clothes sway
      // Apply the pose and face. Hair physics (vrm.update) is skipped on
      // purpose: on a turning globe it flings the hair up, and at this
      // size still hair looks better.
      vrm.humanoid.update()
      vrm.expressionManager?.update()
    }

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

  return { root, animate }
}
