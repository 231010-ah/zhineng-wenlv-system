<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ArrowRight, Clock, Guide, Location, MapLocation, Van } from '@element-plus/icons-vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getRecommendations } from '../api/tourism'

gsap.registerPlugin(ScrollTrigger)

const recommendations = ref([])
const activeRouteId = ref('')
const mapViewport = ref(null)
const pageRef = ref(null)

const mapPresets = {
  'rec-1': {
    area: '东城 · 中轴线',
    camera: '南向北高空俯瞰',
    routeColor: '#25d7ff',
    points: [
      [-4.8, 3.2],
      [-3.4, 1.9],
      [-1.4, 0.5],
      [1.2, -0.8],
      [4.2, -2.6]
    ],
    labels: [
      ['10%', '72%'],
      ['23%', '61%'],
      ['43%', '48%'],
      ['65%', '38%'],
      ['84%', '25%']
    ],
    roadLabels: [
      { name: '长安街', left: '23%', top: '77%', rotate: '-18deg' },
      { name: '中轴线', left: '52%', top: '50%', rotate: '-26deg' },
      { name: '景山前街', left: '78%', top: '29%', rotate: '-18deg' }
    ]
  },
  'rec-2': {
    area: '东城 · 天安门广场',
    camera: '广场东侧俯瞰',
    routeColor: '#59e89a',
    points: [
      [-5.0, 2.7],
      [-3.0, 1.4],
      [-0.8, 0.2],
      [1.9, -0.7],
      [4.7, -2.1]
    ],
    labels: [
      ['9%', '68%'],
      ['30%', '56%'],
      ['48%', '46%'],
      ['68%', '39%'],
      ['86%', '30%']
    ],
    roadLabels: [
      { name: '长安街', left: '25%', top: '70%', rotate: '-20deg' },
      { name: '广场东侧路', left: '54%', top: '48%', rotate: '-18deg' },
      { name: '东长安街', left: '76%', top: '34%', rotate: '-14deg' }
    ]
  },
  'rec-3': {
    area: '西城 · 什刹海胡同',
    camera: '湖区低空倾斜俯瞰',
    routeColor: '#ffcf5a',
    points: [
      [-5.2, 1.7],
      [-3.1, 2.5],
      [-1.0, 1.1],
      [1.2, -0.7],
      [4.5, -2.4]
    ],
    labels: [
      ['9%', '57%'],
      ['28%', '42%'],
      ['48%', '51%'],
      ['65%', '62%'],
      ['86%', '74%']
    ],
    roadLabels: [
      { name: '地安门西大街', left: '22%', top: '56%', rotate: '15deg' },
      { name: '烟袋斜街', left: '48%', top: '50%', rotate: '-28deg' },
      { name: '南锣鼓巷', left: '76%', top: '70%', rotate: '-22deg' }
    ]
  },
  'rec-4': {
    area: '西城至通州 · 双馆研学',
    camera: '跨区动线俯瞰',
    routeColor: '#bda4ff',
    points: [
      [-5.1, 2.9],
      [-3.3, 1.2],
      [-0.9, -0.2],
      [2.0, -1.3],
      [4.9, -2.8]
    ],
    labels: [
      ['9%', '68%'],
      ['27%', '53%'],
      ['47%', '43%'],
      ['67%', '35%'],
      ['88%', '26%']
    ],
    roadLabels: [
      { name: '复兴门外大街', left: '20%', top: '66%', rotate: '-22deg' },
      { name: '地铁换乘线', left: '49%', top: '44%', rotate: '-18deg' },
      { name: '城市副中心线', left: '76%', top: '30%', rotate: '-14deg' }
    ]
  }
}

const activeRoute = computed(() => recommendations.value.find((item) => item.id === activeRouteId.value) || recommendations.value[0])
const activeMap = computed(() => mapPresets[activeRoute.value?.id] || mapPresets['rec-1'])
const activeStartStop = computed(() => activeRoute.value?.stops[0])
const activeEndStop = computed(() => activeRoute.value?.stops[activeRoute.value.stops.length - 1])
const averageMatch = computed(() => {
  if (!recommendations.value.length) return 0
  return Math.round(recommendations.value.reduce((total, item) => total + item.match, 0) / recommendations.value.length)
})
const totalStops = computed(() => recommendations.value.reduce((total, item) => total + item.stops.length, 0))
const routeChartRows = computed(() => recommendations.value.map((item) => ({ id: item.id, label: item.venue, value: item.match })))
const routeSignals = computed(() => [
  { label: '推荐路线', value: recommendations.value.length, suffix: '' },
  { label: '平均匹配', value: averageMatch.value, suffix: '%' },
  { label: '行程节点', value: totalStops.value, suffix: '' }
])
const mapLabels = computed(() => {
  if (!activeRoute.value) return []
  return activeRoute.value.stops.map((stop, index) => {
    const [left, top] = activeMap.value.labels[index] || ['50%', '50%']
    return { ...stop, left, top, index: index + 1 }
  })
})

let renderer
let scene
let camera
let animationFrame = 0
let resizeObserver
let routeLayer
let pulseDot
let cleanupMotion

const selectRoute = (routeId) => {
  activeRouteId.value = routeId
}

const setCounterValue = (element, value) => {
  element.textContent = `${Math.round(value).toLocaleString('zh-CN')}${element.dataset.suffix || ''}`
}

const animateRoutePanel = () => {
  if (!pageRef.value) return
  const q = gsap.utils.selector(pageRef.value)
  gsap.fromTo(
    q('[data-route-dynamic]'),
    { autoAlpha: 0, y: 16 },
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true }
  )
  q('[data-route-count]').forEach((element) => {
    const target = Number(element.dataset.count || 0)
    const counter = { value: target }
    gsap.to(counter, {
      value: target,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => setCounterValue(element, counter.value)
    })
  })
}

const initMotion = () => {
  cleanupMotion?.()
  if (!pageRef.value) return

  const root = pageRef.value
  const mm = gsap.matchMedia()

  mm.add(
    {
      isDesktop: '(min-width: 920px)',
      isMobile: '(max-width: 919px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    (context) => {
      const { isDesktop, isMobile, reduceMotion } = context.conditions
      const q = gsap.utils.selector(root)
      const revealTargets = q('[data-reveal], [data-route-item]')

      if (reduceMotion) {
        gsap.set(revealTargets, { autoAlpha: 1, y: 0, clearProps: 'transform' })
        q('[data-counter], [data-route-count]').forEach((element) => setCounterValue(element, Number(element.dataset.count || 0)))
        return
      }

      gsap.set(revealTargets, { autoAlpha: 0, y: isMobile ? 18 : 32 })
      gsap.set(q('[data-chart-bar]'), { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(q('[data-route-line]'), { scaleY: 0, transformOrigin: 'top center' })

      gsap
        .timeline({ defaults: { duration: 0.7, ease: 'power3.out' } })
        .fromTo(q('[data-hero]'), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.08 })
        .fromTo(q('[data-hero-panel]'), { autoAlpha: 0, y: 22, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1 }, '<0.18')

      ScrollTrigger.batch(revealTargets, {
        start: 'top 84%',
        once: true,
        interval: 0.08,
        batchMax: () => (isMobile ? 2 : 4),
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: 'power3.out',
            overwrite: true
          })
        }
      })

      q('[data-counter], [data-route-count]').forEach((element) => {
        const target = Number(element.dataset.count || 0)
        const counter = { value: target }
        gsap.to(counter, {
          value: target,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true
          },
          onUpdate: () => setCounterValue(element, counter.value)
        })
      })

      q('[data-chart-bar]').forEach((bar) => {
        gsap.to(bar, {
          scaleX: 1,
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: bar,
            start: 'top 88%',
            once: true
          }
        })
      })

      gsap.to(q('[data-route-line]'), {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: q('[data-route-scrub]')[0],
          start: 'top 72%',
          end: 'bottom 42%',
          scrub: 0.8
        }
      })

      if (isDesktop) {
        gsap.to(q('[data-map-viewport]'), {
          yPercent: -4,
          scale: 1.025,
          ease: 'none',
          scrollTrigger: {
            trigger: q('[data-route-scrub]')[0],
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        })
      }
    },
    root
  )

  cleanupMotion = () => mm.revert()
}

const createBuilding = (x, z, width, depth, height, color = 0x193b57) => {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.18,
    transparent: true,
    opacity: 0.78
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, height / 2, z)
  return mesh
}

const createRoad = (x, z, width, depth, rotation = 0) => {
  const group = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.04, depth),
    new THREE.MeshBasicMaterial({ color: 0x34556b, transparent: true, opacity: 0.94 })
  )
  const lane = new THREE.Mesh(
    new THREE.BoxGeometry(width > depth ? width : 0.03, 0.045, width > depth ? 0.03 : depth),
    new THREE.MeshBasicMaterial({ color: 0xb7f3ff, transparent: true, opacity: 0.34 })
  )
  base.position.y = 0.04
  lane.position.y = 0.075
  group.position.set(x, 0, z)
  group.rotation.y = rotation
  group.add(base, lane)
  return group
}

const createRouteTube = (points, color) => {
  const curvePoints = points.map(([x, z]) => new THREE.Vector3(x, 0.18, z))
  const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.18)
  const glow = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, 0.2, 18, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.34 })
  )
  const core = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, 0.07, 14, false),
    new THREE.MeshBasicMaterial({ color })
  )
  return { curve, glow, core }
}

const renderRouteMap = () => {
  if (!scene || !activeRoute.value) return
  if (routeLayer) {
    scene.remove(routeLayer)
  }

  routeLayer = new THREE.Group()
  const preset = activeMap.value
  const routeColor = new THREE.Color(preset.routeColor)
  const { curve, glow, core } = createRouteTube(preset.points, routeColor)
  routeLayer.add(glow, core)

  preset.points.forEach(([x, z], index) => {
    const marker = new THREE.Group()
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.38, 0.14, 32),
      new THREE.MeshBasicMaterial({ color: index === 0 ? 0x7df8ff : routeColor })
    )
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.48, 14),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72 })
    )
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16),
      new THREE.MeshBasicMaterial({ color: index === preset.points.length - 1 ? 0xffd36b : routeColor })
    )
    base.position.y = 0.16
    stem.position.y = 0.42
    pin.position.y = 0.76
    marker.position.set(x, 0, z)
    marker.add(base, stem, pin)
    routeLayer.add(marker)
  })

  pulseDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  pulseDot.userData.curve = curve
  routeLayer.add(pulseDot)
  scene.add(routeLayer)
}

const initRouteMap = () => {
  if (!mapViewport.value || renderer) return

  const rect = mapViewport.value.getBoundingClientRect()
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x0a2234, 9, 30)

  camera = new THREE.PerspectiveCamera(38, rect.width / rect.height, 0.1, 80)
  camera.position.set(0, 10.8, 7.6)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(rect.width, rect.height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  mapViewport.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xd8f7ff, 1.35))
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
  keyLight.position.set(1.5, 6, 4)
  scene.add(keyLight)
  const sideLight = new THREE.PointLight(0x2ccfff, 44, 20)
  sideLight.position.set(-4, 3.6, 2)
  scene.add(sideLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 11, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x123349, roughness: 0.82, metalness: 0.08 })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const grid = new THREE.GridHelper(16, 20, 0x6da4b9, 0x325066)
  grid.position.y = 0.055
  scene.add(grid)

  const roads = new THREE.Group()
  ;[
    [-1.8, 1.9, 13, 0.18, -0.36],
    [1.9, -1.4, 12, 0.16, -0.38],
    [-3.8, -0.2, 0.16, 8.5, 0.28],
    [0.2, 0.2, 0.16, 9.4, -0.24],
    [3.7, 0.2, 0.16, 9.5, 0.18],
    [0.4, 3.7, 11.5, 0.14, 0.04],
    [0, -3.7, 12, 0.14, -0.02]
  ].forEach(([x, z, width, depth, rotation]) => roads.add(createRoad(x, z, width, depth, rotation)))
  scene.add(roads)

  const city = new THREE.Group()
  const buildingLayout = [
    [-6.1, 3.7, 0.7, 0.8, 0.75],
    [-5.0, 2.4, 0.55, 1.1, 0.95],
    [-4.4, -2.8, 0.8, 0.6, 0.7],
    [-2.2, 3.1, 0.7, 0.7, 1.1],
    [-1.2, 2.0, 0.55, 0.95, 0.85],
    [-1.2, -2.6, 0.7, 0.8, 1.15],
    [0.5, 3.1, 0.8, 0.62, 0.82],
    [1.2, 1.6, 0.55, 0.8, 1.2],
    [1.7, -2.7, 0.9, 0.7, 0.95],
    [3.2, 2.8, 0.7, 0.8, 1.05],
    [4.2, 1.2, 0.55, 1, 0.78],
    [4.8, -3.0, 0.8, 0.6, 0.9],
    [5.8, -0.8, 0.7, 0.8, 1.16]
  ]
  buildingLayout.forEach(([x, z, width, depth, height], index) => {
    const color = index % 3 === 0 ? 0x24465f : index % 3 === 1 ? 0x17324a : 0x2f5164
    city.add(createBuilding(x, z, width, depth, height, color))
  })
  scene.add(city)

  renderRouteMap()

  const resize = () => {
    if (!renderer || !camera || !mapViewport.value) return
    const nextRect = mapViewport.value.getBoundingClientRect()
    camera.aspect = nextRect.width / nextRect.height
    camera.updateProjectionMatrix()
    renderer.setSize(nextRect.width, nextRect.height)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(mapViewport.value)

  const animate = (time = 0) => {
    animationFrame = requestAnimationFrame(animate)
    if (pulseDot?.userData.curve) {
      const progress = (time * 0.00008) % 1
      const point = pulseDot.userData.curve.getPointAt(progress)
      pulseDot.position.copy(point)
      pulseDot.position.y += 0.24 + Math.sin(time * 0.006) * 0.05
    }
    renderer.render(scene, camera)
  }
  animate()
}

onMounted(async () => {
  recommendations.value = await getRecommendations()
  activeRouteId.value = recommendations.value[0]?.id || ''
  await nextTick()
  initRouteMap()
  initMotion()
  ScrollTrigger.refresh()
})

watch(activeRoute, async () => {
  await nextTick()
  initRouteMap()
  renderRouteMap()
  animateRoutePanel()
  ScrollTrigger.refresh()
})

onUnmounted(() => {
  cleanupMotion?.()
  if (animationFrame) cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
})
</script>

<template>
  <main ref="pageRef" class="page-shell recommendation-page motion-page">
    <section class="page-title">
      <span class="eyebrow" data-hero>AI 兴趣路线图</span>
      <h1 data-hero>从兴趣到出发的完整旅行路线</h1>
      <p data-hero>根据历史文化、古建筑、博物馆、艺术展览、非遗体验、亲子研学、胡同文化、美食探店、城市漫游、摄影打卡、夜游经济和红色文化等标签，把推荐结果拆成可执行的到达、参观、转场和离开节点。</p>
    </section>

    <section class="interest-dashboard glass-panel" data-hero-panel>
      <div class="interest-signal" v-for="signal in routeSignals" :key="signal.label">
        <strong data-counter :data-count="signal.value" :data-suffix="signal.suffix">{{ signal.value }}{{ signal.suffix }}</strong>
        <span>{{ signal.label }}</span>
      </div>
      <div class="match-bars">
        <div v-for="row in routeChartRows" :key="`match-${row.id}`" class="match-row">
          <span>{{ row.label }}</span>
          <div>
            <i data-chart-bar :style="{ width: `${row.value}%` }"></i>
          </div>
          <b>{{ row.value }}%</b>
        </div>
      </div>
    </section>

    <section v-if="activeRoute" class="route-planner glass-panel" data-route-scrub data-reveal>
      <aside class="route-sidebar">
        <span class="glass-badge" data-route-dynamic>推荐路线</span>
        <h2 data-route-dynamic>{{ activeRoute.title }}</h2>
        <p data-route-dynamic>{{ activeRoute.reason }}</p>

        <div class="route-stats">
          <div class="route-stat" data-route-dynamic>
            <Clock />
            <span>{{ activeRoute.duration }}</span>
          </div>
          <div class="route-stat" data-route-dynamic>
            <MapLocation />
            <span>{{ activeRoute.depart }}</span>
          </div>
          <div class="route-stat" data-route-dynamic>
            <Van />
            <span>{{ activeRoute.transport }}</span>
          </div>
        </div>

        <router-link class="liquid-button dark-button" :to="activeRoute.route">
          按路线预约
          <ArrowRight />
        </router-link>
      </aside>

      <div class="route-map-board">
        <div class="map-board-head">
          <div>
            <span class="venue-name">{{ activeRoute.venue }}</span>
            <h2>{{ activeRoute.title }}</h2>
            <span class="pace-label">{{ activeRoute.pace }}</span>
          </div>
          <div class="score">
            <strong data-route-count :data-count="activeRoute.match" data-suffix="%">{{ activeRoute.match }}%</strong>
            <span>兴趣匹配</span>
          </div>
        </div>

        <div class="highlight-row" data-route-dynamic>
          <span v-for="tag in activeRoute.highlights" :key="tag">{{ tag }}</span>
        </div>

        <div class="route-selector" aria-label="切换推荐路线">
          <button
            v-for="item in recommendations"
            :key="item.id"
            type="button"
            :class="{ active: item.id === activeRoute.id }"
            @click="selectRoute(item.id)"
          >
            <span>{{ item.match }}%</span>
            {{ item.venue }}
          </button>
        </div>

        <section class="aerial-route-map" aria-label="3D 高空俯瞰路线图" data-reveal>
          <div ref="mapViewport" class="map-viewport" data-map-viewport></div>
          <div class="map-route-summary">
            <span v-if="activeStartStop"><b>起</b>{{ activeStartStop.name }}</span>
            <i></i>
            <span v-if="activeEndStop"><b>终</b>{{ activeEndStop.name }}</span>
          </div>
          <div class="map-overlay top-left">
            <span>3D AIR ROUTE</span>
            <strong>{{ activeMap.area }}</strong>
          </div>
          <div class="map-overlay top-right">
            <span>{{ activeMap.camera }}</span>
            <strong>{{ activeRoute.transport }}</strong>
          </div>
          <div class="map-compass" aria-hidden="true">
            <span>N</span>
          </div>
          <div class="map-scale" aria-hidden="true">
            <span></span>
            <small>500m</small>
          </div>
          <div
            v-for="road in activeMap.roadLabels"
            :key="`${activeRoute.id}-${road.name}`"
            class="map-road-label"
            :style="{ left: road.left, top: road.top, transform: `translate(-50%, -50%) rotate(${road.rotate})` }"
          >
            {{ road.name }}
          </div>
          <div class="floating-stop" v-for="label in mapLabels" :key="`${activeRoute.id}-map-${label.time}`" :style="{ left: label.left, top: label.top }">
            <b>{{ label.index }}</b>
            <span>{{ label.name }}</span>
          </div>
        </section>

        <ol class="route-map" aria-label="旅行路线图">
          <span class="route-progress-line" data-route-line></span>
          <li v-for="(stop, index) in activeRoute.stops" :key="`${activeRoute.id}-${stop.time}`" class="route-stop" data-route-item data-route-dynamic>
            <div class="stop-marker">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="stop-content">
              <div class="stop-meta">
                <span>{{ stop.time }}</span>
                <span>{{ stop.stay }}</span>
              </div>
              <h3>{{ stop.name }}</h3>
              <p>{{ stop.action }}</p>
              <div class="transfer-tip">
                <Guide />
                <span>{{ stop.transfer }}</span>
              </div>
            </div>
          </li>
        </ol>

        <div class="travel-notes" data-reveal>
          <div class="notes-title">
            <Location />
            <span>旅行判断</span>
          </div>
          <ul>
            <li v-for="note in activeRoute.notes" :key="note">{{ note }}</li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.recommendation-page {
  width: min(1220px, calc(100% - 32px));
  padding-top: 126px;
}

.recommendation-page.page-shell {
  padding-bottom: 76px;
}

.recommendation-page .page-title {
  max-width: 860px;
  margin-bottom: 24px;
}

.recommendation-page .page-title h1 {
  font-size: clamp(32px, 4.7vw, 58px);
  line-height: 1.08;
}

.recommendation-page .page-title p {
  max-width: 760px;
  font-size: 15px;
  line-height: 1.72;
}

.interest-dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 0.28fr)) minmax(320px, 1fr);
  gap: 12px;
  align-items: stretch;
  margin: 0 0 22px;
  padding: 16px;
  border-radius: 22px;
}

.interest-signal {
  display: grid;
  align-content: center;
  gap: 7px;
  min-height: 92px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);
}

.interest-signal strong {
  color: var(--cyan);
  font-size: 28px;
  line-height: 1;
}

.interest-signal span {
  color: var(--muted);
  font-size: 13px;
}

.match-bars {
  display: grid;
  align-content: center;
  gap: 11px;
  min-width: 0;
  padding: 8px 4px 8px 10px;
}

.match-row {
  display: grid;
  grid-template-columns: minmax(116px, 170px) 1fr 46px;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 13px;
}

.match-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-row div {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
}

.match-row i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--cyan), var(--gold));
}

.match-row b {
  color: var(--text);
  text-align: right;
}

.route-planner {
  display: grid;
  grid-template-columns: minmax(280px, 0.34fr) minmax(0, 1fr);
  gap: 22px;
  padding: 22px;
  border-radius: 24px;
}

.route-sidebar {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
  padding: 4px 2px 4px 0;
}

.route-sidebar h2,
.map-board-head h2 {
  margin: 0;
  font-family: "ZQKNBCGPST", serif;
  letter-spacing: 0;
}

.route-sidebar h2 {
  font-size: clamp(23px, 2.6vw, 34px);
  line-height: 1.12;
}

.route-sidebar p {
  margin: 0;
  color: var(--muted);
  line-height: 1.62;
  font-size: 14px;
}

.route-stats {
  display: grid;
  gap: 10px;
}

.route-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 9px 11px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  color: var(--muted);
  font-size: 13px;
}

.route-stat svg,
.liquid-button svg,
.transfer-tip svg,
.notes-title svg {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.route-stat svg {
  color: var(--cyan);
}

.route-selector {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 18px;
}

.route-selector button {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 9px 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  color: var(--muted);
  text-align: left;
  cursor: pointer;
  transition: 180ms ease;
}

.route-selector button span {
  min-width: 46px;
  color: var(--gold);
  font-weight: 800;
}

.route-selector button:hover,
.route-selector button.active {
  border-color: rgba(158, 216, 223, 0.34);
  background: rgba(158, 216, 223, 0.1);
  color: var(--text);
}

.aerial-route-map {
  position: relative;
  min-height: 390px;
  margin-bottom: 24px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(158, 216, 223, 0.32);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(20, 52, 72, 0.98), rgba(8, 24, 38, 0.98)),
    radial-gradient(circle at 48% 36%, rgba(37, 215, 255, 0.28), transparent 17rem);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 26px 70px rgba(0, 0, 0, 0.24);
}

.aerial-route-map::before,
.aerial-route-map::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.aerial-route-map::before {
  background:
    linear-gradient(90deg, rgba(198, 242, 255, 0.14) 1px, transparent 1px),
    linear-gradient(0deg, rgba(198, 242, 255, 0.14) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.2));
}

.aerial-route-map::after {
  background:
    radial-gradient(circle at center, transparent 46%, rgba(2, 9, 17, 0.42) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 22%, rgba(0, 0, 0, 0.14));
}

.map-viewport {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.map-viewport canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.map-overlay,
.map-compass,
.map-scale,
.map-route-summary,
.map-road-label,
.floating-stop {
  position: absolute;
  z-index: 4;
}

.map-route-summary {
  left: 50%;
  bottom: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 54px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  width: min(680px, calc(100% - 120px));
  transform: translateX(-50%);
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  background: rgba(4, 14, 25, 0.76);
  backdrop-filter: blur(16px);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.26);
}

.map-route-summary span {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--text);
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.map-route-summary span:last-child {
  justify-content: flex-end;
}

.map-route-summary b {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: 7px;
  background: #31d5ff;
  color: #03101c;
  font-size: 12px;
}

.map-route-summary span:last-child b {
  background: var(--gold);
}

.map-route-summary i {
  position: relative;
  height: 2px;
  background: linear-gradient(90deg, #31d5ff, var(--gold));
}

.map-route-summary i::after {
  content: "";
  position: absolute;
  right: -1px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-top: 2px solid var(--gold);
  border-right: 2px solid var(--gold);
  transform: translateY(-50%) rotate(45deg);
}

.map-overlay {
  display: grid;
  gap: 4px;
  max-width: min(280px, calc(100% - 40px));
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(4, 14, 25, 0.66);
  backdrop-filter: blur(14px);
}

.map-road-label {
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(211, 240, 250, 0.13);
  color: rgba(235, 249, 255, 0.9);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.46);
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

.map-overlay span {
  color: rgba(234, 244, 255, 0.56);
  font-size: 11px;
  letter-spacing: 0;
}

.map-overlay strong {
  color: var(--text);
  font-size: 14px;
}

.top-left {
  top: 16px;
  left: 16px;
}

.top-right {
  top: 16px;
  right: 16px;
  text-align: right;
}

.map-compass {
  right: 18px;
  bottom: 92px;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(158, 216, 223, 0.24);
  border-radius: 50%;
  background: rgba(4, 14, 25, 0.62);
  color: var(--cyan);
  font-size: 13px;
  font-weight: 900;
  backdrop-filter: blur(12px);
}

.map-compass::before {
  content: "";
  position: absolute;
  top: 7px;
  width: 0;
  height: 0;
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  border-bottom: 12px solid var(--gold);
}

.map-scale {
  left: 16px;
  bottom: 88px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(234, 244, 255, 0.7);
  font-size: 12px;
}

.map-scale span {
  width: 86px;
  height: 8px;
  border-right: 2px solid rgba(234, 244, 255, 0.78);
  border-bottom: 2px solid rgba(234, 244, 255, 0.78);
  border-left: 2px solid rgba(234, 244, 255, 0.78);
}

.floating-stop {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 190px;
  transform: translate(-50%, -50%);
  padding: 7px 9px;
  border: 1px solid rgba(185, 239, 255, 0.46);
  border-radius: 12px;
  background: rgba(5, 19, 32, 0.82);
  color: rgba(246, 252, 255, 0.96);
  font-size: 12px;
  line-height: 1.2;
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.34), 0 0 18px rgba(37, 215, 255, 0.13);
}

.floating-stop::after {
  content: "";
  position: absolute;
  left: 18px;
  bottom: -7px;
  width: 10px;
  height: 10px;
  border-right: 1px solid rgba(185, 239, 255, 0.38);
  border-bottom: 1px solid rgba(185, 239, 255, 0.38);
  background: rgba(5, 19, 32, 0.82);
  transform: rotate(45deg);
}

.floating-stop b {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--cyan);
  color: #05111f;
  font-size: 12px;
}

.floating-stop span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-map-board {
  min-width: 0;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.02)),
    radial-gradient(circle at 85% 12%, rgba(215, 180, 106, 0.14), transparent 18rem);
}

.map-board-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.score {
  width: 100px;
  min-height: 76px;
  display: grid;
  place-items: center;
  align-content: center;
  flex: 0 0 auto;
  border: 1px solid rgba(215, 180, 106, 0.24);
  border-radius: 16px;
  background: rgba(215, 180, 106, 0.08);
}

.score strong {
  color: var(--cyan);
  font-size: 26px;
  line-height: 1;
}

.score span,
.venue-name {
  color: var(--gold);
}

.score span {
  margin-top: 6px;
  font-size: 12px;
}

.venue-name {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 14px;
}

.map-board-head h2 {
  font-size: clamp(24px, 3.2vw, 36px);
  line-height: 1.12;
}

.pace-label {
  display: inline-block;
  margin-top: 10px;
  color: var(--muted);
  font-size: 14px;
}

.highlight-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.highlight-row span {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted);
  font-size: 13px;
}

.route-map {
  position: relative;
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-map::before {
  content: "";
  position: absolute;
  top: 20px;
  bottom: 42px;
  left: 23px;
  width: 2px;
  background: linear-gradient(180deg, var(--cyan), var(--gold), var(--green));
  opacity: 0.72;
}

.route-progress-line {
  position: absolute;
  top: 20px;
  bottom: 42px;
  left: 23px;
  z-index: 1;
  width: 2px;
  background: linear-gradient(180deg, #ffffff, var(--cyan), var(--gold));
  box-shadow: 0 0 22px rgba(158, 216, 223, 0.28);
  pointer-events: none;
}

.route-stop {
  position: relative;
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 14px;
  padding-bottom: 18px;
}

.route-stop:last-child {
  padding-bottom: 0;
}

.stop-marker {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(158, 216, 223, 0.34);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(158, 216, 223, 0.22), rgba(158, 216, 223, 0.08)),
    rgba(6, 29, 58, 0.82);
  color: var(--text);
  font-weight: 900;
  box-shadow: 0 0 28px rgba(158, 216, 223, 0.16);
}

.stop-content {
  min-width: 0;
  padding: 0 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.route-stop:last-child .stop-content {
  padding-bottom: 0;
  border-bottom: 0;
}

.stop-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.stop-meta span {
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--muted);
  font-size: 12px;
}

.stop-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  line-height: 1.24;
}

.stop-content p {
  margin: 0;
  color: var(--muted);
  line-height: 1.62;
  font-size: 14px;
}

.transfer-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  color: rgba(234, 244, 255, 0.78);
  font-size: 13px;
  line-height: 1.6;
}

.transfer-tip svg,
.notes-title svg {
  color: var(--gold);
  margin-top: 2px;
}

.travel-notes {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.notes-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--text);
  font-weight: 800;
}

.travel-notes ul {
  display: grid;
  gap: 9px;
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.7;
}

.liquid-button {
  width: fit-content;
  margin-top: 4px;
}

@media (max-width: 920px) {
  .interest-dashboard {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .match-bars {
    grid-column: 1 / -1;
  }

  .route-planner {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .route-sidebar {
    padding-right: 0;
  }

  .route-map-board {
    order: -1;
  }

  .route-selector {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .aerial-route-map {
    min-height: 340px;
  }

  .map-route-summary {
    width: min(620px, calc(100% - 40px));
  }
}

@media (max-width: 640px) {
  .recommendation-page {
    width: min(100% - 20px, 1220px);
    padding-top: 146px;
  }

  .interest-dashboard {
    grid-template-columns: 1fr;
    padding: 14px;
    border-radius: 20px;
  }

  .match-bars {
    grid-column: auto;
    padding: 0;
  }

  .match-row {
    grid-template-columns: 1fr 44px;
  }

  .match-row span {
    grid-column: 1 / -1;
  }

  .route-planner,
  .route-map-board {
    padding: 16px;
    border-radius: 20px;
  }

  .route-selector {
    grid-template-columns: 1fr;
  }

  .aerial-route-map {
    min-height: 320px;
    border-radius: 18px;
  }

  .top-right {
    top: 68px;
    right: 12px;
    bottom: auto;
    text-align: left;
  }

  .top-left {
    top: 12px;
    left: 12px;
  }

  .map-overlay {
    max-width: calc(100% - 24px);
    padding: 8px 10px;
  }

  .map-route-summary {
    bottom: 12px;
    grid-template-columns: 1fr;
    gap: 6px;
    width: calc(100% - 24px);
    padding: 8px 10px;
  }

  .map-route-summary i {
    display: none;
  }

  .map-route-summary span,
  .map-route-summary span:last-child {
    justify-content: flex-start;
    font-size: 12px;
    white-space: normal;
  }

  .map-road-label {
    font-size: 10px;
  }

  .map-compass {
    display: none;
  }

  .map-scale {
    display: none;
  }

  .floating-stop {
    max-width: 128px;
    padding: 5px 7px;
    font-size: 11px;
  }

  .map-board-head {
    display: grid;
  }

  .score {
    width: 100%;
    min-height: 74px;
  }

  .route-stop {
    grid-template-columns: 40px 1fr;
    gap: 12px;
  }

  .route-map::before {
    left: 19px;
  }

  .stop-marker {
    width: 40px;
    height: 40px;
  }

  .stop-content h3 {
    font-size: 19px;
  }
}
</style>
