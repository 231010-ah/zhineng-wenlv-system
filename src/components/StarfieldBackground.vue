<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import anime from 'animejs'

const canvasRef = ref(null)
let renderer = null
let scene = null
let camera = null
let animationFrameId = null
let starsGeometry = null
let starsPositions = null
let starData = []

const STAR_COUNT = 900
const BASE_SPEED = 1.0
let speedMultiplier = 1.0

// Neon theme desaturated palette
const COLOR_PALETTE = [
  new THREE.Color(0.0, 0.9, 1.0),   // cyber-blue (#00E5FF)
  new THREE.Color(0.48, 0.3, 1.0),  // cyber-purple (#7C4DFF)
  new THREE.Color(0.0, 0.9, 0.46)   // cyber-green (#00E676)
]

const resize = () => {
  if (!canvasRef.value || !camera || !renderer) return
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const width = window.innerWidth
  const height = window.innerHeight

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Scene
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0d0e12, 0.0025)

  // Camera
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000)
  camera.position.z = 0

  // Geometry Setup
  starsPositions = new Float32Array(STAR_COUNT * 2 * 3) // 2 vertices (start & end) * 3 coordinates
  const starsColors = new Float32Array(STAR_COUNT * 2 * 3)

  for (let i = 0; i < STAR_COUNT; i++) {
    // Distribute stars in a cylinder tunnel or scatter them around
    const x = (Math.random() - 0.5) * 700
    const y = (Math.random() - 0.5) * 700
    const z = -Math.random() * 1000

    starData.push({
      x,
      y,
      z,
      speed: Math.random() * 0.8 + 0.4
    })

    const idx = i * 6
    // Vertex 1: Front
    starsPositions[idx] = x
    starsPositions[idx + 1] = y
    starsPositions[idx + 2] = z
    // Vertex 2: Rear (start with a small length)
    starsPositions[idx + 3] = x
    starsPositions[idx + 4] = y
    starsPositions[idx + 5] = z - 2.0

    // Assign color
    const col = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    starsColors[idx] = col.r
    starsColors[idx + 1] = col.g
    starsColors[idx + 2] = col.b
    starsColors[idx + 3] = col.r
    starsColors[idx + 4] = col.g
    starsColors[idx + 5] = col.b
  }

  starsGeometry = new THREE.BufferGeometry()
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3))

  const starsMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    linewidth: 1.5
  })

  const starField = new THREE.LineSegments(starsGeometry, starsMaterial)
  scene.add(starField)

  // Render animation loop
  const animate = () => {
    if (!starsGeometry || !camera || !renderer) return
    const positions = starsGeometry.attributes.position.array

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = starData[i]
      
      // Move star forward (towards camera)
      const currentSpeed = BASE_SPEED * star.speed * speedMultiplier
      star.z += currentSpeed

      // If star passes the camera, reset it far back in the tunnel
      if (star.z > 10) {
        star.z = -1000
        star.x = (Math.random() - 0.5) * 700
        star.y = (Math.random() - 0.5) * 700
        star.speed = Math.random() * 0.8 + 0.4
      }

      // Star line stretches matching the speed multiplier
      const tailLength = Math.max(2.0, currentSpeed * 1.8)

      const idx = i * 6
      // Front vertex
      positions[idx] = star.x
      positions[idx + 1] = star.y
      positions[idx + 2] = star.z
      
      // Rear vertex
      positions[idx + 3] = star.x
      positions[idx + 4] = star.y
      positions[idx + 5] = star.z - tailLength
    }

    starsGeometry.attributes.position.needsUpdate = true
    
    // Slow rotational drift of space tunnel
    starField.rotation.z += 0.0006

    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (renderer) {
    renderer.dispose()
  }
  if (starsGeometry) {
    starsGeometry.dispose()
  }
  starData = []
})

// Starwarp transition trigger (1.5 seconds)
const triggerWarp = () => {
  if (!camera) return
  
  const warpParams = { speed: speedMultiplier, fov: camera.fov }
  
  // Acceleration then snap-back deceleration
  anime.timeline()
    .add({
      targets: warpParams,
      speed: 40.0,
      fov: 115,
      duration: 650,
      easing: 'easeInQuad',
      update: () => {
        speedMultiplier = warpParams.speed
        if (camera) {
          camera.fov = warpParams.fov
          camera.updateProjectionMatrix()
        }
      }
    })
    .add({
      targets: warpParams,
      speed: 1.0,
      fov: 60,
      duration: 950,
      easing: 'easeOutElastic(1, .85)',
      update: () => {
        speedMultiplier = warpParams.speed
        if (camera) {
          camera.fov = warpParams.fov
          camera.updateProjectionMatrix()
        }
      }
    })
}

defineExpose({
  triggerWarp
})
</script>

<template>
  <canvas 
    ref="canvasRef" 
    class="absolute inset-0 w-full h-full pointer-events-none z-0 bg-[#07090D]"
  />
</template>
