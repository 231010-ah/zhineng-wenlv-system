<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import anime from 'animejs'

const props = defineProps({
  currentPage: {
    type: String,
    default: 'home'
  }
})

const canvasRef = ref(null)

let renderer = null
let scene = null
let camera = null
let sceneGroup = null
let animationFrameId = null
let geometry = null
let pointsMaterial = null
let lineMaterial = null
let pointsObj = null
let linesObj = null

// Background Twinkling & Interactive Stars
const N_STARS = 250
const starData = []
let starsGeometry = null
let starsMaterial = null
let starsObj = null

const N_COLS = 40
const N_ROWS = 25
const TOTAL_POINTS = N_COLS * N_ROWS // 1000

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Transition state between shapes
const transitionState = {
  progress: 1.0,
  sourcePage: 'home',
  targetPage: 'home'
}

// Ripple shockwave state
const ripple = {
  x: 0,
  y: 0,
  z: 0,
  time: 0,
  active: false,
  maxTime: 1.5,
  speed: 16.0,
  amplitude: 3.5
}

// Camera parallax rotation
let targetRotationX = 0
let targetRotationY = 0
let currentRotationX = 0
let currentRotationY = 0

// Map page names to theme colors
const getThemeColor = (page) => {
  switch (page) {
    case 'traffic': return 0x00E676      // Cyber Green
    case 'cluster': return 0x7C4DFF      // Cyber Purple
    case 'recommendation': return 0xFF4081 // Cyber Pink (AI recomendations)
    case 'reservation': return 0x00E5FF  // Cyber Blue
    case 'admin': return 0x7C4DFF        // Cyber Purple
    default: return 0x00E5FF             // Home default (Cyber Blue)
  }
}

// Generate coordinates for any page shape at a given run time
const getShapeCoords = (page, i, j, time) => {
  const u = i / 39
  const v = j / 24
  
  if (page === 'home') {
    // 1. Home: Undulating cybernetic landscape wave
    const x = (u - 0.5) * 34
    const z = (v - 0.5) * 22
    const y = Math.sin(u * 5.5 + time * 1.5) * Math.cos(v * 5.5 + time * 1.5) * 2.8
    return [x, y, z]
  }
  
  if (page === 'reservation') {
    // 2. Reservation: Four venue sphere clusters
    const group = Math.min(3, Math.floor(j / 6))
    const groupRow = j % 6
    const numGroupRows = group === 3 ? 7 : 6
    const gu = i / 39
    const gv = groupRow / (numGroupRows - 1)
    
    const R = 2.0
    const theta = gu * Math.PI * 2
    const phi = gv * Math.PI
    const sx = R * Math.sin(phi) * Math.cos(theta)
    const sy = R * Math.sin(phi) * Math.sin(theta)
    const sz = R * Math.cos(phi)
    
    let Cx = 0, Cy = 0, Cz = 0
    if (group === 0) { Cx = -11; Cy = 5; Cz = -3 }
    else if (group === 1) { Cx = 11; Cy = 4; Cz = -4 }
    else if (group === 2) { Cx = -8; Cy = -5; Cz = 1 }
    else if (group === 3) { Cx = 9; Cy = -4; Cz = -1 }
    
    if (!prefersReducedMotion) {
      Cx += Math.sin(time * 0.8 + group) * 0.6
      Cy += Math.cos(time * 0.6 + group) * 0.6
      Cz += Math.sin(time * 0.5 + group) * 0.3
    }
    
    return [Cx + sx, Cy + sy, Cz + sz]
  }
  
  if (page === 'traffic') {
    // 3. Traffic: Double helix ladder rotating on Y-axis
    const theta = v * Math.PI * 4.5 + time * 1.0
    const R = 4.2
    const x0 = R * Math.cos(theta)
    const z0 = R * Math.sin(theta)
    const x1 = R * Math.cos(theta + Math.PI)
    const z1 = R * Math.sin(theta + Math.PI)
    
    const x = (1 - u) * x0 + u * x1
    const z = (1 - u) * z0 + u * z1
    const y = (v - 0.5) * 22
    return [x, y, z]
  }
  
  if (page === 'cluster') {
    // 4. Cluster: Breathing sphere globe
    const theta = u * Math.PI * 2 + time * 0.25
    const phi = v * Math.PI
    const R = 7.5 * (1.0 + (prefersReducedMotion ? 0 : 0.08 * Math.sin(time * 2.0)))
    
    const x = R * Math.sin(phi) * Math.cos(theta)
    const y = R * Math.cos(phi)
    const z = R * Math.sin(phi) * Math.sin(theta)
    return [x, y, z]
  }
  
  if (page === 'recommendation') {
    // 5. Recommendation: Concentric gyroscopic spinning brainwave rings
    const ringId = j < 8 ? 0 : (j < 16 ? 1 : 2)
    const ringJ = j < 8 ? j : (j < 16 ? j - 8 : j - 16)
    const ringHeight = ringId === 2 ? 9 : 8
    const rv = ringJ / (ringHeight - 1)
    
    const R = ringId === 0 ? 4.5 : (ringId === 1 ? 8.0 : 11.5)
    const theta = u * Math.PI * 2
    const rx = R * Math.cos(theta)
    const rz = R * Math.sin(theta)
    const ry = (rv - 0.5) * 1.5
    
    let x = 0, y = 0, z = 0
    const spinTime = prefersReducedMotion ? 0 : time
    if (ringId === 0) {
      x = rx * Math.cos(spinTime * 0.9) - rz * Math.sin(spinTime * 0.9)
      z = rx * Math.sin(spinTime * 0.9) + rz * Math.cos(spinTime * 0.9)
      y = ry
    } else if (ringId === 1) {
      x = rx
      y = ry * Math.cos(spinTime * 0.7) - rz * Math.sin(spinTime * 0.7)
      z = ry * Math.sin(spinTime * 0.7) + rz * Math.cos(spinTime * 0.7)
    } else {
      x = rx * Math.cos(spinTime * 0.5) - ry * Math.sin(spinTime * 0.5)
      y = rx * Math.sin(spinTime * 0.5) + ry * Math.cos(spinTime * 0.5)
      z = rz
    }
    return [x, y, z]
  }
  
  if (page === 'admin') {
    // 6. Admin: Stacked horizontal layered database sheets
    const sheetId = j < 8 ? 0 : (j < 16 ? 1 : 2)
    const sheetJ = j < 8 ? j : (j < 16 ? j - 8 : j - 16)
    const sheetHeight = sheetId === 2 ? 9 : 8
    const sv = sheetJ / (sheetHeight - 1)
    
    const x = (u - 0.5) * 26.0
    const z = (sv - 0.5) * 22.0
    let y = sheetId === 0 ? 5.5 : (sheetId === 1 ? 0.0 : -5.5)
    
    if (!prefersReducedMotion) {
      y += Math.sin(u * 5 + time * 1.2 + sheetId) * 0.4
    }
    return [x, y, z]
  }
  
  return [0, 0, 0]
}

// Interpolate positions between active shapes in the render loop
const updateGeometry = (time) => {
  if (!geometry) return
  const positions = geometry.attributes.position.array
  
  let ptr = 0
  for (let j = 0; j < N_ROWS; j++) {
    for (let i = 0; i < N_COLS; i++) {
      const coordsSource = getShapeCoords(transitionState.sourcePage, i, j, time)
      const coordsTarget = getShapeCoords(transitionState.targetPage, i, j, time)
      
      let x = coordsSource[0] + (coordsTarget[0] - coordsSource[0]) * transitionState.progress
      let y = coordsSource[1] + (coordsTarget[1] - coordsSource[1]) * transitionState.progress
      let z = coordsSource[2] + (coordsTarget[2] - coordsSource[2]) * transitionState.progress
      
      // Apply Click Shockwave displacement
      if (ripple.active && !prefersReducedMotion) {
        const rx = ripple.x
        const ry = ripple.y
        const rz = ripple.z
        const dx = x - rx
        const dy = y - ry
        const dz = z - rz
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const w = ripple.time * ripple.speed
        
        // Displace points inside the wave front thickness boundary
        if (d < w && d > w - 3.5) {
          const fade = Math.max(0, 1 - ripple.time / ripple.maxTime)
          const distanceFade = 1.0 / (1.0 + d * 0.08)
          const waveVal = Math.sin((d - w) * 1.8) * ripple.amplitude * fade * distanceFade
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
          
          x += (dx / len) * waveVal
          y += (dy / len) * waveVal
          z += (dz / len) * waveVal
        }
      }
      
      positions[ptr++] = x
      positions[ptr++] = y
      positions[ptr++] = z
    }
  }
  
  geometry.attributes.position.needsUpdate = true
}

const resize = () => {
  if (!canvasRef.value || !camera || !renderer) return
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const handleMouseMove = (e) => {
  if (prefersReducedMotion) return
  targetRotationX = (e.clientY / window.innerHeight - 0.5) * 0.18
  targetRotationY = (e.clientX / window.innerWidth - 0.5) * 0.25
}

const handleWindowClick = (e) => {
  if (prefersReducedMotion || !camera) return
  
  // Back-project screen coordinates onto Z=0 plane
  const aspect = window.innerWidth / window.innerHeight
  const frustumHeight = 2.0 * 26.0 * Math.tan((60 * Math.PI) / 360.0)
  const frustumWidth = frustumHeight * aspect
  
  const clickX = ((e.clientX / window.innerWidth) - 0.5) * frustumWidth
  const clickY = -((e.clientY / window.innerHeight) - 0.5) * frustumHeight
  
  ripple.x = clickX
  ripple.y = clickY
  ripple.z = 0
  ripple.time = 0
  ripple.active = true
}

// Generate circular, soft radial-gradient glowing dot texture
const createDotTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(0, 229, 255, 0.8)')
  gradient.addColorStop(0.5, 'rgba(124, 77, 255, 0.25)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 16, 16)
  return new THREE.CanvasTexture(canvas)
}

let currentAnime = null
let lineColorAnime = null
let pointColorAnime = null

const morphTo = (newPage) => {
  if (prefersReducedMotion) {
    transitionState.sourcePage = transitionState.targetPage
    transitionState.targetPage = newPage
    transitionState.progress = 1.0
    
    const tc = getThemeColor(newPage)
    const colorObj = new THREE.Color(tc)
    if (lineMaterial) lineMaterial.color.copy(colorObj)
    if (pointsMaterial) pointsMaterial.color.copy(colorObj)
    updateGeometry(0)
    return
  }
  
  if (currentAnime) currentAnime.pause()
  if (lineColorAnime) lineColorAnime.pause()
  if (pointColorAnime) pointColorAnime.pause()
  
  transitionState.sourcePage = transitionState.targetPage
  transitionState.targetPage = newPage
  transitionState.progress = 0
  
  currentAnime = anime({
    targets: transitionState,
    progress: 1.0,
    duration: 1500,
    easing: 'easeOutQuint'
  })
  
  const tc = getThemeColor(newPage)
  const targetColor = new THREE.Color(tc)
  
  lineColorAnime = anime({
    targets: lineMaterial.color,
    r: targetColor.r,
    g: targetColor.g,
    b: targetColor.b,
    duration: 1000,
    easing: 'linear'
  })
  
  pointColorAnime = anime({
    targets: pointsMaterial.color,
    r: targetColor.r,
    g: targetColor.g,
    b: targetColor.b,
    duration: 1000,
    easing: 'linear'
  })
}

watch(() => props.currentPage, (newVal) => {
  morphTo(newVal)
})

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
  
  // scene container for camera parallax rotation
  sceneGroup = new THREE.Group()
  scene.add(sceneGroup)
  
  // Camera looking straight down Z axis
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 100)
  camera.position.z = 26
  
  // Shared geometry array
  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(TOTAL_POINTS * 3)
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  
  // Pre-generate grid wireframe topology indices
  const indices = []
  for (let j = 0; j < N_ROWS; j++) {
    for (let i = 0; i < N_COLS; i++) {
      const idx = j * N_COLS + i
      if (i < N_COLS - 1) {
        indices.push(idx, idx + 1)
      }
      if (j < N_ROWS - 1) {
        indices.push(idx, idx + N_COLS)
      }
    }
  }
  geometry.setIndex(indices)
  
  // Material setup
  const initialColor = getThemeColor(props.currentPage)
  
  pointsMaterial = new THREE.PointsMaterial({
    size: 1.0,
    map: createDotTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: initialColor
  })
  
  lineMaterial = new THREE.LineBasicMaterial({
    color: initialColor,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  pointsObj = new THREE.Points(geometry, pointsMaterial)
  linesObj = new THREE.LineSegments(geometry, lineMaterial)
  
  sceneGroup.add(pointsObj)
  sceneGroup.add(linesObj)
  
  // Initialize Background Star Particles
  starsGeometry = new THREE.BufferGeometry()
  const starPositions = new Float32Array(N_STARS * 3)
  const starColors = new Float32Array(N_STARS * 3)
  const colObj = new THREE.Color(initialColor)

  for (let i = 0; i < N_STARS; i++) {
    const x = (Math.random() - 0.5) * 80
    const y = (Math.random() - 0.5) * 50
    const z = -20 - Math.random() * 25
    
    starPositions[i * 3] = x
    starPositions[i * 3 + 1] = y
    starPositions[i * 3 + 2] = z
    
    starData.push({
      baseX: x,
      baseY: y,
      baseZ: z,
      x: x,
      y: y,
      z: z,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.04,
      twinkleSpeed: 0.6 + Math.random() * 1.6,
      twinklePhase: Math.random() * Math.PI * 2
    })
    
    starColors[i * 3] = colObj.r
    starColors[i * 3 + 1] = colObj.g
    starColors[i * 3 + 2] = colObj.b
  }
  
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  
  starsMaterial = new THREE.PointsMaterial({
    size: 0.7,
    map: createDotTexture(),
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  })
  
  starsObj = new THREE.Points(starsGeometry, starsMaterial)
  sceneGroup.add(starsObj)
  
  // Seed initial geometry
  transitionState.sourcePage = props.currentPage
  transitionState.targetPage = props.currentPage
  transitionState.progress = 1.0
  updateGeometry(0)
  
  const clock = new THREE.Clock()
  
  // 60FPS WebGL Render animation loop
  const animate = () => {
    const time = clock.getElapsedTime()
    const delta = clock.getDelta()
    
    if (ripple.active) {
      ripple.time += delta
      if (ripple.time > ripple.maxTime) {
        ripple.active = false
      }
    }
    
    updateGeometry(time)

    // Update stars positions, hover repulsion and independent twinkling
    if (starsGeometry && pointsMaterial && !prefersReducedMotion) {
      const starPosArr = starsGeometry.attributes.position.array
      const starColArr = starsGeometry.attributes.color.array
      const colObj = pointsMaterial.color
      
      const mouseX3D = targetRotationY * 110
      const mouseY3D = -targetRotationX * 70
      
      for (let i = 0; i < N_STARS; i++) {
        const s = starData[i]
        
        // Background drift
        s.x += s.vx * 0.05
        s.y += s.vy * 0.05
        
        // Repulsion from mouse pointer coords
        const dx = s.x - mouseX3D
        const dy = s.y - mouseY3D
        const distSq = dx * dx + dy * dy
        const repulsionRadius = 14
        
        if (distSq < repulsionRadius * repulsionRadius) {
          const dist = Math.sqrt(distSq) || 1
          const force = (repulsionRadius - dist) / repulsionRadius
          const pushX = (dx / dist) * force * 1.5
          const pushY = (dy / dist) * force * 1.5
          
          s.x += (mouseX3D + (dx / dist) * repulsionRadius - s.x) * 0.1
          s.x += pushX * 0.15
          s.y += pushY * 0.15
        } else {
          s.x += (s.baseX - s.x) * 0.05
          s.y += (s.baseY - s.y) * 0.05
        }
        
        if (Math.abs(s.x) > 50) s.x = s.baseX
        if (Math.abs(s.y) > 30) s.y = s.baseY
        
        starPosArr[i * 3] = s.x
        starPosArr[i * 3 + 1] = s.y
        starPosArr[i * 3 + 2] = s.z
        
        // Dynamic independent twinkling
        const brightness = 0.25 + 0.75 * Math.abs(Math.sin(time * s.twinkleSpeed + s.twinklePhase))
        starColArr[i * 3] = colObj.r * brightness
        starColArr[i * 3 + 1] = colObj.g * brightness
        starColArr[i * 3 + 2] = colObj.b * brightness
      }
      starsGeometry.attributes.position.needsUpdate = true
      starsGeometry.attributes.color.needsUpdate = true
    }
    
    // Smooth camera tilt parallax
    if (!prefersReducedMotion) {
      currentRotationX += (targetRotationX - currentRotationX) * 0.05
      currentRotationY += (targetRotationY - currentRotationY) * 0.05
      sceneGroup.rotation.x = currentRotationX
      sceneGroup.rotation.y = currentRotationY
    }
    
    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animate)
  }
  
  animate()
  
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('click', handleWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('click', handleWindowClick)
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (renderer) {
    renderer.dispose()
  }
  if (geometry) {
    geometry.dispose()
  }
  if (pointsMaterial) {
    pointsMaterial.dispose()
  }
  if (lineMaterial) {
    lineMaterial.dispose()
  }
  if (starsGeometry) {
    starsGeometry.dispose()
  }
  if (starsMaterial) {
    starsMaterial.dispose()
  }
  if (currentAnime) currentAnime.pause()
  if (lineColorAnime) lineColorAnime.pause()
  if (pointColorAnime) pointColorAnime.pause()
})
</script>

<template>
  <canvas 
    ref="canvasRef" 
    class="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#0A0D14]"
  />
</template>
