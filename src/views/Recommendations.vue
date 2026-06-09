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

const coverImages = {
  'rec-1': 'https://commons.wikimedia.org/wiki/Special:FilePath/Forbidden%20City%2C%20Beijing.jpg',
  'rec-2': 'https://commons.wikimedia.org/wiki/Special:FilePath/National%20Museum%20of%20China%2C%20Beijing.jpg',
  'rec-3': 'https://commons.wikimedia.org/wiki/Special:FilePath/Shichahai%2C%20Xicheng%2C%20Beijing%2C%20China%20-%20panoramio%20%282%29.jpg',
  'rec-4': 'https://commons.wikimedia.org/wiki/Special:FilePath/Capital%20Museum%20in%20Beijing.jpg'
}

const routeEditorial = {
  'rec-1': {
    title: '一天读懂北京中轴线',
    titleLines: ['一天读懂', '北京中轴线'],
    summary: '从故宫到钟鼓楼，体验一条属于北京的文化探索路线。',
    intro: '结合开放时间、步行节奏与城市氛围，为游客提供更自然的文化体验路线。',
    time: '4.5h',
    best: '上午',
    distance: '3.2km',
    audience: '摄影 / 历史 / Citywalk',
    mood: '清晨入城，沿中轴线向北展开',
    cta: '预约这条路线',
    saved: '2,381 人收藏',
    weekly: '本周 641 人体验',
    season: '适合秋季',
    feature: '摄影推荐'
  },
  'rec-2': {
    title: '在广场东侧读一部中国通史',
    titleLines: ['广场东侧', '读一部中国通史'],
    summary: '用半日时间串联国家博物馆与天安门广场。',
    intro: '适合把宏大的历史叙事放慢，留出展厅停顿、广场步行和亲子交流的空间。',
    time: '4h',
    best: '上午',
    distance: '2.1km',
    audience: '亲子 / 红色文化 / 博物馆',
    mood: '从展厅到广场，节奏沉稳',
    cta: '查看预约建议',
    saved: '1,946 人收藏',
    weekly: '本周 528 人体验',
    season: '雨天友好',
    feature: '亲子推荐'
  },
  'rec-3': {
    title: '把傍晚留给什刹海的水岸',
    titleLines: ['傍晚留给', '什刹海水岸'],
    summary: '从湖面、斜街到胡同支线，感受北京的日常层次。',
    intro: '这不是打卡路线，更适合慢行、停留、转进安静支巷，等天色把街灯点亮。',
    time: '3.5h',
    best: '傍晚',
    distance: '3.8km',
    audience: '胡同 / 美食 / 夜游',
    mood: '水岸慢行，夜色收尾',
    cta: '安排傍晚路线',
    saved: '3,104 人收藏',
    weekly: '本周 782 人体验',
    season: '适合夏夜',
    feature: '夜游推荐'
  },
  'rec-4': {
    title: '一日双馆的城市历史课',
    titleLines: ['一日双馆', '城市历史课'],
    summary: '上午首博，下午大运河，让孩子看到北京如何生长。',
    intro: '把展览压缩成几个清晰问题，减少信息过载，让研学更像一次家庭共同探索。',
    time: '7h',
    best: '工作日',
    distance: '跨区',
    audience: '亲子 / 研学 / 城市历史',
    mood: '两段式参观，留足转场',
    cta: '规划亲子研学',
    saved: '1,287 人收藏',
    weekly: '本周 319 人体验',
    season: '周末友好',
    feature: '研学推荐'
  }
}

const mapPresets = {
  'rec-1': {
    area: '东城 · 中轴线',
    camera: '南向北漫游视角',
    routeColor: '#F5D08A',
    cameraPos: { x: -1.0, y: 11.0, z: 8.5 },
    cameraLookAt: { x: -0.5, y: 0, z: 0.2 },
    points: [
      [-4.8, 3.2],
      [-3.1, 1.3],
      [-1.6, 0.9],
      [0.9, -1.35],
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
    camera: '广场东侧步行视角',
    routeColor: '#F5D08A',
    cameraPos: { x: -3.5, y: 9.5, z: 7.5 },
    cameraLookAt: { x: -2.0, y: 0, z: 0.5 },
    points: [
      [-5.0, 2.7],
      [-3.2, 1.0],
      [-0.5, 0.35],
      [1.4, -1.25],
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
    camera: '湖区低空漫游视角',
    routeColor: '#F5D08A',
    cameraPos: { x: 2.5, y: 10.0, z: 8.0 },
    cameraLookAt: { x: 0.5, y: 0, z: 0.2 },
    points: [
      [-5.2, 1.7],
      [-3.4, 2.8],
      [-1.1, 0.65],
      [1.6, -0.25],
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
    camera: '跨区转场视角',
    routeColor: '#F5D08A',
    cameraPos: { x: 0.5, y: 12.0, z: 6.0 },
    cameraLookAt: { x: -0.2, y: 0, z: -0.5 },
    points: [
      [-5.1, 2.9],
      [-3.8, 0.8],
      [-0.8, 0.15],
      [1.4, -1.8],
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
const activeRouteMeta = computed(() => routeEditorial[activeRoute.value?.id] || routeEditorial['rec-1'])
const activeStartStop = computed(() => activeRoute.value?.stops[0])
const activeEndStop = computed(() => activeRoute.value?.stops[activeRoute.value.stops.length - 1])
const routeSignals = computed(() => [
  { label: '路线时长', value: activeRouteMeta.value.time },
  { label: '最佳时段', value: activeRouteMeta.value.best },
  { label: '步行距离', value: activeRouteMeta.value.distance },
  { label: '适合人群', value: activeRouteMeta.value.audience }
])
const productSignals = computed(() => [
  activeRouteMeta.value.saved,
  activeRouteMeta.value.weekly,
  activeRouteMeta.value.feature,
  activeRouteMeta.value.season
])
const relatedRoutes = computed(() => recommendations.value.filter((item) => item.id !== activeRoute.value?.id).slice(0, 3))
const travelReviews = [
  {
    name: '林女士',
    role: '第一次来北京',
    quote: '上午从午门进入的节奏很好，不赶，也能拍到中轴线的空镜。'
  },
  {
    name: '陈先生',
    role: '亲子研学',
    quote: '时间轴很像一份真正能执行的旅行攻略，孩子也知道下一站要看什么。'
  }
]
const mapLabels = computed(() => {
  if (!activeRoute.value) return []
  return activeRoute.value.stops.map((stop, index) => {
    const [left, top] = activeMap.value.labels[index] || ['50%', '50%']
    return { ...stop, left, top, index: index + 1 }
  })
})
const routeSvgPoints = computed(() => activeMap.value.labels.map(([left, top]) => `${parseFloat(left)},${parseFloat(top)}`).join(' '))
const currentStopIndex = computed(() => {
  const stopCount = activeRoute.value?.stops.length || 0
  return Math.min(stopCount - 1, Math.max(0, Math.floor(stopCount * 0.68)))
})

let renderer
let scene
let camera
let animationFrame = 0
let resizeObserver
let routeLayer
let pulseDot
let cleanupMotion
let cameraTarget = new THREE.Vector3(0, 0, 0)
let flowParticles = []
let waveRings = []
let pins = []

const selectRoute = (routeId) => {
  activeRouteId.value = routeId
}

const handleMouseMove = (e) => {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  card.style.setProperty('--mouse-x', `${x}px`)
  card.style.setProperty('--mouse-y', `${y}px`)
}

const handlePageMouseMove = (e) => {
  pageRef.value?.style.setProperty('--page-x', `${e.clientX}px`)
  pageRef.value?.style.setProperty('--page-y', `${e.clientY}px`)
}

const getStopPeriod = (index) => {
  if (index < 2) return 'Morning'
  if (index < 4) return 'Midday'
  return 'Noon'
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
}

const initMotion = () => {
  cleanupMotion?.()
  if (!pageRef.value) return

  const root = pageRef.value
  const mm = gsap.matchMedia()

  mm.add(
    {
      isDesktop: '(min-width: 1081px)',
      isMobile: '(max-width: 1080px)',
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
      
      if (isDesktop) {
        gsap.set(q('[data-route-line]'), { scaleX: 0, scaleY: 1, transformOrigin: 'left center' })
      } else {
        gsap.set(q('[data-route-line]'), { scaleY: 0, scaleX: 1, transformOrigin: 'top center' })
      }

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

      q('[data-counter]').forEach((element) => {
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

      const timelineEl = q('.timeline-story')[0]
      if (timelineEl) {
        gsap.to(q('[data-route-line]'), {
          ...(isDesktop ? { scaleX: 1 } : { scaleY: 1 }),
          ease: 'none',
          scrollTrigger: {
            trigger: timelineEl,
            start: 'top 75%',
            end: 'bottom 50%',
            scrub: 0.8
          }
        })
      }

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

        q('.hero-media img').forEach((image) => {
          gsap.fromTo(
            image,
            { yPercent: -3, scale: 1.04 },
            {
              yPercent: 4,
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: image.closest('section, article'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
              }
            }
          )
        })

        const showcase = q('.route-showcase')[0]
        const featuredCard = q('.featured-route-card')[0]
        const featuredImage = q('.featured-route-card > img')[0]
        const featuredContent = q('.featured-route-content')[0]
        const showcaseHeader = document.querySelector('.site-header')

        if (showcase && featuredCard && featuredImage && featuredContent) {
          gsap.set(featuredCard, {
            clipPath: 'inset(7% 2.4% 7% 2.4% round 34px)',
            scale: 0.965,
            y: 56,
            transformOrigin: 'center center'
          })
          gsap.set(featuredImage, { scale: 1.12, yPercent: -4, transformOrigin: 'center center' })
          gsap.set(featuredContent, { autoAlpha: 0.52, y: 78, filter: 'blur(10px)' })

          ScrollTrigger.create({
            trigger: featuredCard,
            start: 'top bottom',
            end: 'top 12%',
            scrub: 1.35,
            onUpdate: (self) => {
              const p = gsap.parseEase('power3.inOut')(self.progress)
              const contentP = gsap.parseEase('power2.out')(Math.min(1, Math.max(0, (self.progress - 0.18) / 0.72)))

              gsap.set(featuredCard, {
                clipPath: `inset(${7 * (1 - p)}% ${2.4 * (1 - p)}% ${7 * (1 - p)}% ${2.4 * (1 - p)}% round ${34 * (1 - p)}px)`,
                scale: 0.965 + 0.035 * p,
                y: 56 * (1 - p)
              })
              gsap.set(featuredImage, {
                scale: 1.12 - 0.085 * p,
                yPercent: -4 * (1 - p)
              })
              gsap.set(featuredContent, {
                autoAlpha: 0.52 + 0.48 * contentP,
                y: 78 * (1 - contentP),
                filter: `blur(${10 * (1 - contentP)}px)`
              })
            }
          })

          if (showcaseHeader) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: featuredCard,
                  start: 'top 74%',
                  end: 'bottom 18%',
                  scrub: 1.65
                },
                defaults: { ease: 'power2.inOut' }
              })
              .to(showcaseHeader, {
                autoAlpha: 0,
                y: -58,
                scale: 0.985,
                duration: 0.34,
                overwrite: 'auto'
              }, 0)
              .to(showcaseHeader, {
                autoAlpha: 0,
                y: -58,
                duration: 0.42
              }, 0.34)
              .to(showcaseHeader, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.24
              }, 0.76)
          }
        }

        const mapStory = q('.map-story')[0]
        const mapBoard = q('.route-map-board')[0]
        const aerialMap = q('.aerial-route-map')[0]
        const mapHeader = document.querySelector('.site-header')

        if (mapStory && mapBoard && aerialMap) {
          gsap.set(mapBoard, {
            clipPath: 'inset(6% 1.4% 6% 1.4% round 32px)',
            scale: 0.972,
            y: 48,
            transformOrigin: 'center center'
          })
          gsap.set(aerialMap, {
            borderRadius: 28,
            transformOrigin: 'center center'
          })

          ScrollTrigger.create({
            trigger: mapBoard,
            start: 'top bottom',
            end: 'top 10%',
            scrub: 1.35,
            onUpdate: (self) => {
              const p = gsap.parseEase('power3.inOut')(self.progress)
              gsap.set(mapBoard, {
                clipPath: `inset(${6 * (1 - p)}% ${1.4 * (1 - p)}% ${6 * (1 - p)}% ${1.4 * (1 - p)}% round ${32 * (1 - p)}px)`,
                scale: 0.972 + 0.028 * p,
                y: 48 * (1 - p)
              })
              gsap.set(aerialMap, {
                borderRadius: 28 * (1 - p)
              })
            }
          })

          if (mapHeader) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: mapBoard,
                  start: 'top 74%',
                  end: 'bottom 18%',
                  scrub: 1.65
                },
                defaults: { ease: 'power2.inOut' }
              })
              .to(mapHeader, {
                autoAlpha: 0,
                y: -58,
                scale: 0.985,
                duration: 0.34,
                overwrite: 'auto'
              }, 0)
              .to(mapHeader, {
                autoAlpha: 0,
                y: -58,
                duration: 0.42
              }, 0.34)
              .to(mapHeader, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.24
              }, 0.76)
          }
        }
      }

      const header = document.querySelector('.site-header')
      if (header) {
        ScrollTrigger.create({
          trigger: root,
          start: 'top -40px',
          end: 'bottom top',
          toggleClass: { targets: header, className: 'route-scroll-glass' }
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
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 0.35
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, height / 2, z)

  const edges = new THREE.EdgesGeometry(geometry)
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0x25d7ff,
      transparent: true,
      opacity: 0.15
    })
  )
  mesh.add(line)

  return mesh
}

const createRoad = (x, z, width, depth, rotation = 0) => {
  const group = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.04, depth),
    new THREE.MeshBasicMaterial({ color: 0x2b3442, transparent: true, opacity: 0.72 })
  )
  const lane = new THREE.Mesh(
    new THREE.BoxGeometry(width > depth ? width : 0.03, 0.045, width > depth ? 0.03 : depth),
    new THREE.MeshBasicMaterial({ color: 0xd6b36a, transparent: true, opacity: 0.22 })
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
    new THREE.TubeGeometry(curve, 96, 0.14, 18, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12 })
  )
  const core = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, 0.055, 14, false),
    new THREE.MeshBasicMaterial({ color })
  )
  return { curve, glow, core }
}

const renderRouteMap = () => {
  if (!scene || !activeRoute.value) return
  if (routeLayer) {
    scene.remove(routeLayer)
  }

  flowParticles = []
  waveRings = []
  pins = []

  routeLayer = new THREE.Group()
  const preset = activeMap.value
  const routeColor = new THREE.Color(preset.routeColor)
  const { curve, glow, core } = createRouteTube(preset.points, routeColor)
  
  const outerGlow = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, 0.28, 18, false),
    new THREE.MeshBasicMaterial({ color: routeColor, transparent: true, opacity: 0.04 })
  )
  routeLayer.add(outerGlow, glow, core)

  const numParticles = 8
  for (let i = 0; i < numParticles; i++) {
    const pColor = i % 2 === 0 ? 0xf5d08a : 0x8b6cff
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.8 })
    )
    p.position.set(0, -999, 0)
    routeLayer.add(p)
    flowParticles.push(p)
  }

  preset.points.forEach(([x, z], index) => {
    const marker = new THREE.Group()
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.38, 0.14, 32),
      new THREE.MeshBasicMaterial({ color: routeColor, transparent: true, opacity: 0.84 })
    )
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.48, 14),
      new THREE.MeshBasicMaterial({ color: 0xf3efe7, transparent: true, opacity: 0.5 })
    )
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16),
      new THREE.MeshBasicMaterial({ color: index === preset.points.length - 1 ? 0xf3efe7 : routeColor })
    )
    base.position.y = 0.16
    stem.position.y = 0.42
    pin.position.y = 0.76
    marker.position.set(x, 0, z)
    marker.scale.set(0.001, 0.001, 0.001)
    marker.add(base, stem, pin)
    routeLayer.add(marker)
    pins.push(pin)

    gsap.to(marker.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.8,
      delay: index * 0.15,
      ease: 'elastic.out(1, 0.65)'
    })

    const ringGeo = new THREE.RingGeometry(0.01, 0.45, 32)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8b6cff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.set(x, 0.06, z)
    routeLayer.add(ring)
    waveRings.push({ mesh: ring, delay: index * 0.25 })
  })

  pulseDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xf8e2a5 })
  )
  pulseDot.userData.curve = curve
  routeLayer.add(pulseDot)
  scene.add(routeLayer)
}

const initRouteMap = () => {
  if (!mapViewport.value || renderer) return

  const rect = mapViewport.value.getBoundingClientRect()
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x07111f, 12, 28)

  const preset = activeMap.value
  const camPos = preset.cameraPos || { x: 0, y: 10.8, z: 7.6 }
  const camLook = preset.cameraLookAt || { x: 0, y: 0, z: 0 }
  cameraTarget.copy(camLook)

  camera = new THREE.PerspectiveCamera(38, rect.width / rect.height, 0.1, 80)
  camera.position.set(camPos.x, camPos.y, camPos.z)
  camera.lookAt(cameraTarget)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(rect.width, rect.height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  mapViewport.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xf3efe7, 1.18))
  const keyLight = new THREE.DirectionalLight(0xf8e2a5, 1.45)
  keyLight.position.set(1.5, 6, 4)
  scene.add(keyLight)
  const sideLight = new THREE.PointLight(0xd6b36a, 18, 18)
  sideLight.position.set(-4, 3.6, 2)
  scene.add(sideLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 11, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x141c28, roughness: 0.9, metalness: 0.04 })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const grid = new THREE.GridHelper(16, 12, 0xd6b36a, 0x354052)
  grid.position.y = 0.055
  grid.material.transparent = true
  grid.material.opacity = 0.08
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
    const color = index % 3 === 0 ? 0x2a3341 : index % 3 === 1 ? 0x202936 : 0x303845
    const b = createBuilding(x, z, width, depth, height, color)
    b.scale.y = 0.001
    b.position.y = 0.001
    city.add(b)

    gsap.to(b.scale, {
      y: 1,
      duration: 1.2 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        b.position.y = (height * b.scale.y) / 2
      }
    })
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
    
    if (camera && cameraTarget) {
      camera.lookAt(cameraTarget)
    }

    if (pulseDot?.userData.curve) {
      const progress = (time * 0.00008) % 1
      const point = pulseDot.userData.curve.getPointAt(progress)
      pulseDot.position.copy(point)
      pulseDot.position.y += 0.24 + Math.sin(time * 0.006) * 0.05
    }

    if (flowParticles && flowParticles.length > 0 && pulseDot?.userData.curve) {
      flowParticles.forEach((p, index) => {
        const progress = (time * 0.00005 + index / flowParticles.length) % 1
        const point = pulseDot.userData.curve.getPointAt(progress)
        p.position.copy(point)
        p.position.y += 0.2 + Math.sin(time * 0.005 + index) * 0.02
        const fade = Math.sin(progress * Math.PI)
        p.material.opacity = 0.85 * fade
      })
    }

    if (pins && pins.length > 0) {
      pins.forEach((pin, idx) => {
        pin.position.y = 0.76 + Math.sin(time * 0.004 + idx * 1.5) * 0.08
      })
    }

    if (waveRings && waveRings.length > 0) {
      waveRings.forEach((item) => {
        const ring = item.mesh
        const p = ((time * 0.001 + item.delay) % 1)
        const scaleVal = 1 + p * 2.2
        ring.scale.set(scaleVal, scaleVal, scaleVal)
        ring.material.opacity = 0.6 * (1 - p)
      })
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

  if (camera) {
    const preset = activeMap.value
    const camPos = preset.cameraPos || { x: 0, y: 10.8, z: 7.6 }
    const camLook = preset.cameraLookAt || { x: 0, y: 0, z: 0 }
    
    gsap.to(camera.position, {
      x: camPos.x,
      y: camPos.y,
      z: camPos.z,
      duration: 1.6,
      ease: 'power3.inOut',
      overwrite: 'auto'
    })
    
    gsap.to(cameraTarget, {
      x: camLook.x,
      y: camLook.y,
      z: camLook.z,
      duration: 1.6,
      ease: 'power3.inOut',
      overwrite: 'auto'
    })
  }

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
  flowParticles = []
  waveRings = []
  pins = []
})
</script>

<template>
  <main ref="pageRef" class="page-shell recommendation-page motion-page" @mousemove="handlePageMouseMove">
    <div class="vibe-noise"></div>
    <div class="vibe-scanline"></div>
    <section v-if="activeRoute" class="route-hero">
      <div class="hero-copy-block">
        <span class="eyebrow" data-hero>Beijing Heritage Route</span>
        <h1 data-hero class="glitch-text" :data-text="activeRouteMeta.title">
          <span v-for="line in activeRouteMeta.titleLines" :key="line">{{ line }}</span>
        </h1>
        <p class="hero-lead" data-hero>
          从故宫到钟鼓楼，<br>
          体验一条属于北京的文化探索路线。
        </p>
        <p class="hero-desc" data-hero>{{ activeRouteMeta.intro }}</p>
        <div class="hero-actions" data-hero>
          <router-link class="liquid-button dark-button" :to="activeRoute.route">
            {{ activeRouteMeta.cta }}
            <ArrowRight />
          </router-link>
          <span>{{ activeRouteMeta.mood }}</span>
        </div>
        <div class="product-signals" data-hero>
          <span v-for="signal in productSignals" :key="signal">{{ signal }}</span>
        </div>
      </div>

      <div class="hero-media" data-hero-panel @mousemove="handleMouseMove">
        <img :src="coverImages[activeRoute.id]" :alt="activeRoute.title">
        <div class="hero-media-caption">
          <span>{{ activeRoute.venue }}</span>
          <strong>{{ activeRoute.pace }}</strong>
        </div>
      </div>
    </section>

    <!-- Real-time AI Telemetry Dashboard Status Bar -->
    <section v-if="activeRoute" class="realtime-telemetry-bar" data-hero-panel @mousemove="handleMouseMove">
      <div class="telemetry-item">
        <span class="status-indicator live"></span>
        <div class="telemetry-info">
          <span class="telemetry-label">当前景区客流</span>
          <strong class="telemetry-val text-green">舒适 (Comfortable)</strong>
        </div>
      </div>
      <div class="telemetry-divider"></div>
      <div class="telemetry-item">
        <div class="telemetry-info">
          <span class="telemetry-label">故宫午门排队</span>
          <strong class="telemetry-val">12 分钟排队</strong>
        </div>
      </div>
      <div class="telemetry-divider"></div>
      <div class="telemetry-item">
        <div class="telemetry-info">
          <span class="telemetry-label">最佳游览时段</span>
          <strong class="telemetry-val">推荐 08:30 前</strong>
        </div>
      </div>
      <div class="telemetry-divider"></div>
      <div class="telemetry-item">
        <div class="telemetry-info">
          <span class="telemetry-label">今日天气状况</span>
          <strong class="telemetry-val">22°C 微风晴</strong>
        </div>
      </div>
      <div class="telemetry-divider"></div>
      <div class="telemetry-item progress-item">
        <div class="telemetry-info">
          <span class="telemetry-label">今日路线探索进度</span>
          <strong class="telemetry-val text-gold">68%</strong>
        </div>
        <div class="telemetry-progress-bg">
          <div class="telemetry-progress-fill" style="width: 68%;"></div>
        </div>
      </div>
    </section>

    <section class="journey-facts" aria-label="路线概览" data-hero-panel>
      <div class="journey-fact" v-for="signal in routeSignals" :key="signal.label" @mousemove="handleMouseMove">
        <span>{{ signal.label }}</span>
        <strong>{{ signal.value }}</strong>
      </div>
    </section>

    <section v-if="activeRoute" class="story-section route-showcase" data-reveal>
      <div class="section-kicker">
        <span>精选路线</span>
        <h2>把路线做成一次从容的城市阅读。</h2>
      </div>

      <article class="featured-route-card" data-route-dynamic @mousemove="handleMouseMove">
        <img :src="coverImages[activeRoute.id]" :alt="activeRoute.title">
        <div class="featured-route-content">
          <span>{{ activeRoute.venue }}</span>
          <h3>{{ activeRoute.title }}</h3>
          <p>{{ activeRouteMeta.summary }}</p>
          <div class="highlight-row">
            <span v-for="tag in activeRoute.highlights" :key="tag">{{ tag }}</span>
          </div>
          <div class="route-stats">
            <div class="route-stat">
              <Clock />
              <span>{{ activeRoute.duration }}</span>
            </div>
            <div class="route-stat">
              <MapLocation />
              <span>{{ activeRoute.depart }}</span>
            </div>
            <div class="route-stat">
              <Van />
              <span>{{ activeRoute.transport }}</span>
            </div>
          </div>
          <router-link class="liquid-button dark-button" :to="activeRoute.route">
            {{ activeRouteMeta.cta }}
            <ArrowRight />
          </router-link>
        </div>
      </article>

      <div class="route-selector" aria-label="切换推荐路线">
        <button
          v-for="item in recommendations"
          :key="item.id"
          type="button"
          :class="{ active: item.id === activeRoute.id }"
          @click="selectRoute(item.id)"
          @mousemove="handleMouseMove"
        >
          <img :src="coverImages[item.id]" :alt="item.venue">
          <span>
            <b>{{ item.venue }}</b>
            <small>{{ routeEditorial[item.id].best }} · {{ routeEditorial[item.id].distance }}</small>
          </span>
        </button>
      </div>
    </section>

    <section v-if="activeRoute" class="story-section map-story" data-route-scrub data-reveal>
      <div class="section-kicker">
        <span>路线地图</span>
        <h2>像 Apple Maps 一样轻，像 Citywalk 一样自然。</h2>
      </div>

      <div class="route-map-board" @mousemove="handleMouseMove">
        <section class="aerial-route-map" aria-label="路线地图" data-reveal>
          <div ref="mapViewport" class="map-viewport" data-map-viewport></div>
          <svg class="map-route-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="route-flow-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#F5D08A" />
                <stop offset="56%" stop-color="#8B6CFF" />
                <stop offset="100%" stop-color="#F3EFE7" />
              </linearGradient>
            </defs>
            <polyline class="map-route-flow-glow" :points="routeSvgPoints" />
            <polyline class="map-route-flow-core" :points="routeSvgPoints" />
          </svg>
          <div class="map-route-summary">
            <span v-if="activeStartStop"><b>起</b>{{ activeStartStop.name }}</span>
            <i></i>
            <span v-if="activeEndStop"><b>终</b>{{ activeEndStop.name }}</span>
          </div>
          <div class="map-overlay top-left">
            <span>Heritage Route</span>
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
            <b aria-hidden="true"></b>
            <span>{{ label.name }}</span>
          </div>
        </section>
      </div>
    </section>

    <section v-if="activeRoute" class="story-section timeline-story" data-reveal>
      <div class="section-kicker">
        <span>时间轴</span>
        <h2>少一点说明，多一点可执行的旅行节奏。</h2>
      </div>

      <div class="timeline-header">
        <span>DAY WALK PROGRESS</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill"></div>
        </div>
      </div>

      <ol class="route-map" aria-label="旅行路线图">
        <span class="route-progress-line" data-route-line></span>
        <li
          v-for="(stop, index) in activeRoute.stops"
          :key="`${activeRoute.id}-${stop.time}`"
          class="route-stop"
          :class="{ 'is-current': index === currentStopIndex }"
          data-route-item
          data-route-dynamic
        >
          <div class="stop-marker">
            <span>{{ index + 1 }}</span>
          </div>
          <div class="stop-content" @mousemove="handleMouseMove">
            <span class="stop-period">{{ getStopPeriod(index) }}</span>
            <div class="stop-time">{{ stop.time }}</div>
            <h3>{{ stop.name }}</h3>
            <p>{{ stop.action }}</p>
            <span class="stay-pill">停留：{{ stop.stay }}</span>
          </div>
        </li>
      </ol>
    </section>

    <section v-if="activeRoute" class="story-section notes-story" data-reveal>
      <div class="travel-notes" @mousemove="handleMouseMove">
        <div class="notes-title">
          <Location />
          <span>旅行提示</span>
        </div>
        <ul>
          <li v-for="note in activeRoute.notes" :key="note">{{ note }}</li>
        </ul>
      </div>

      <div class="related-routes" @mousemove="handleMouseMove">
        <h2>相关推荐</h2>
        <article v-for="item in relatedRoutes" :key="item.id" class="related-card" @click="selectRoute(item.id)" @mousemove="handleMouseMove">
          <img :src="coverImages[item.id]" :alt="item.venue">
          <div>
            <span>{{ routeEditorial[item.id].best }}</span>
            <h3>{{ item.title }}</h3>
          </div>
        </article>
      </div>
    </section>

    <section class="story-section review-story" data-reveal>
      <div class="section-kicker">
        <span>用户评价</span>
        <h2>真实的路线价值，来自旅途里的停顿。</h2>
      </div>
      <div class="review-grid">
        <article v-for="review in travelReviews" :key="review.name" class="review-card" @mousemove="handleMouseMove">
          <p>“{{ review.quote }}”</p>
          <span>{{ review.name }} · {{ review.role }}</span>
        </article>
      </div>
    </section>

    <footer class="route-footer" data-reveal @mousemove="handleMouseMove">
      <div>
        <span>京脉文旅</span>
        <p>Premium Beijing Heritage Routes</p>
      </div>
      <nav aria-label="页脚导航">
        <a href="#">城市探索</a>
        <a href="#">路线计划</a>
        <a href="#">文化专题</a>
        <a href="#">关于我们</a>
      </nav>
    </footer>
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

.recommendation-page {
  --route-bg: #07111f;
  --route-gold: #F5D08A;
  --route-text: #f3efe7;
  --route-secondary: #7d8ca3;
  --route-panel: rgba(255, 255, 255, 0.03);
  --route-line: rgba(255, 255, 255, 0.06);
  --route-radius: 24px;
  --cyan: #8B6CFF;
  --gold: #F5D08A;
  width: min(1240px, calc(100% - 32px));
  padding-top: 132px;
  color: var(--route-text);
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}

.recommendation-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at top, rgba(32, 42, 68, 0.35), transparent 40%),
    linear-gradient(180deg, #07111f 0%, #08131f 35%, #050816 100%);
}

.recommendation-page::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.36;
  background:
    url("data:image/svg+xml,%3Csvg width='960' height='960' viewBox='0 0 960 960' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d6b36a' stroke-opacity='.16'%3E%3Cpath d='M480 80v800M390 150h180M360 270h240M330 430h300M360 590h240M390 740h180'/%3E%3Cpath d='M260 230c110 40 250 40 360 0M260 730c110-40 250-40 360 0'/%3E%3C/g%3E%3Cg fill='%23ffffff' fill-opacity='.06'%3E%3Ccircle cx='190' cy='230' r='1.5'/%3E%3Ccircle cx='720' cy='340' r='1.5'/%3E%3Ccircle cx='270' cy='710' r='1.5'/%3E%3Ccircle cx='650' cy='780' r='1.5'/%3E%3C/g%3E%3C/svg%3E"),
    radial-gradient(circle at 30% 20%, rgba(255,255,255,.06) 0 1px, transparent 1px);
  background-size: 960px 960px, 26px 26px;
  background-position: 50% -110px, 0 0;
}

.route-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.96fr) minmax(360px, 0.86fr);
  gap: clamp(28px, 5vw, 76px);
  align-items: center;
  min-height: calc(100vh - 170px);
  padding-bottom: clamp(34px, 8vh, 84px);
}

.hero-copy-block {
  display: grid;
  gap: 22px;
  max-width: 740px;
}

.recommendation-page .eyebrow,
.recommendation-page .glass-badge {
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.035);
  color: rgba(243, 239, 231, 0.68);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(20px);
}

.hero-copy-block h1,
.section-kicker h2,
.featured-route-content h3,
.related-routes h2,
.route-footer span {
  font-family: "Source Han Serif SC", "ZQKNBCGPST", "Songti SC", serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.hero-copy-block h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(48px, 7.8vw, 108px);
  line-height: 0.96;
}

.hero-lead,
.hero-desc {
  margin: 0;
  max-width: 590px;
  color: rgba(243, 239, 231, 0.78);
}

.hero-lead {
  font-size: clamp(22px, 2.8vw, 36px);
  line-height: 1.34;
}

.hero-desc {
  color: var(--route-secondary);
  font-size: 16px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}

.hero-actions > span {
  color: rgba(243, 239, 231, 0.52);
  font-size: 14px;
}

.hero-media,
.featured-route-card,
.aerial-route-map,
.journey-fact,
.travel-notes,
.related-routes,
.review-card,
.route-footer {
  border: 1px solid var(--route-line);
  border-radius: 28px;
  background: var(--route-panel);
  transition: all 0.3s ease;
}

.hero-media {
  position: relative;
  min-height: min(62vh, 620px);
  overflow: hidden;
  isolation: isolate;
}

.hero-media img,
.featured-route-card > img,
.route-selector img,
.related-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.86) contrast(1.03) brightness(0.82);
}

.hero-media::after,
.featured-route-card::after,
.related-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(15, 23, 34, 0.08), rgba(15, 23, 34, 0.72)),
    radial-gradient(circle at 18% 20%, rgba(214, 179, 106, 0.18), transparent 34%);
}

.hero-media-caption {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 17px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(18, 18, 18, 0.45);
  backdrop-filter: blur(20px);
}

.hero-media-caption span,
.hero-media-caption strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-media-caption span {
  color: rgba(243, 239, 231, 0.72);
}

.hero-media-caption strong {
  color: var(--route-gold);
}

.journey-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 0 0 clamp(78px, 11vw, 132px);
}

.journey-fact {
  min-height: 104px;
  display: grid;
  align-content: center;
  gap: 10px;
  padding: 20px;
  border-radius: 24px;
  backdrop-filter: blur(18px);
}

.journey-fact span,
.section-kicker span,
.featured-route-content > span,
.related-card span,
.review-card span,
.route-footer p {
  color: var(--route-secondary);
  font-size: 13px;
}

.journey-fact strong {
  color: var(--route-text);
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 600;
}

.story-section {
  scroll-margin-top: 132px;
  margin-bottom: clamp(78px, 11vw, 132px);
}

.section-kicker {
  display: grid;
  grid-template-columns: minmax(120px, 0.22fr) minmax(0, 0.78fr);
  gap: 24px;
  align-items: end;
  margin-bottom: 24px;
}

.section-kicker h2 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(30px, 4.5vw, 64px);
  line-height: 1.05;
}

.featured-route-card {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow: hidden;
  isolation: isolate;
  border-radius: 0;
}

.featured-route-content {
  position: absolute;
  z-index: 2;
  left: clamp(22px, 4vw, 54px);
  right: clamp(22px, 4vw, 54px);
  bottom: clamp(22px, 4vw, 54px);
  display: grid;
  gap: 16px;
  max-width: 600px;
}

.featured-route-content h3 {
  margin: 0;
  font-size: clamp(30px, 4vw, 56px);
  line-height: 1.05;
}

.featured-route-content p {
  margin: 0;
  color: rgba(243, 239, 231, 0.78);
  font-size: 16px;
  line-height: 1.7;
}

.highlight-row {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin: 0;
}

.highlight-row span {
  padding: 7px 11px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(243, 239, 231, 0.78);
  font-size: 13px;
}

.route-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.route-stat {
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 999px;
  background: rgba(18, 18, 18, 0.36);
  color: rgba(243, 239, 231, 0.72);
  backdrop-filter: blur(14px);
}

.route-stat svg,
.liquid-button svg,
.notes-title svg {
  width: 18px;
  height: 18px;
  color: var(--route-gold);
}

.route-selector {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0 0;
}

.route-selector button {
  min-height: 118px;
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 13px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--route-text);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.route-selector button:hover {
  transform: translateY(-3px) scale(1.01);
  border-color: rgba(214, 179, 106, 0.4);
  background: rgba(214, 179, 106, 0.08);
}

.route-selector button.active {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--route-gold) !important;
  background: rgba(214, 179, 106, 0.14) !important;
  box-shadow: 0 10px 24px rgba(214, 179, 106, 0.15);
}

.route-selector img {
  aspect-ratio: 1;
  border-radius: 18px;
}

.route-selector b,
.route-selector small {
  display: block;
  min-width: 0;
}

.route-selector b {
  color: var(--route-text);
  font-size: 14px;
  line-height: 1.35;
}

.route-selector small {
  margin-top: 8px;
  color: var(--route-secondary);
  font-size: 12px;
}

.route-map-board {
  padding: 0;
  border: 0;
  border-radius: 28px;
  background: transparent;
}

.aerial-route-map {
  min-height: 560px;
  margin: 0;
  overflow: hidden;
  isolation: isolate;
  border-color: rgba(255, 255, 255, 0.05);
  border-radius: 28px;
  background:
    radial-gradient(circle at 44% 30%, rgba(214, 179, 106, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(24, 33, 45, 0.96), rgba(13, 19, 29, 0.98));
  box-shadow: none;
}

.aerial-route-map::before {
  background:
    linear-gradient(120deg, transparent 20%, rgba(214, 179, 106, 0.045), transparent 68%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,.035) 0 1px, transparent 1px);
  background-size: auto, 42px 42px;
  opacity: 0.45;
}

.aerial-route-map::after {
  background:
    radial-gradient(circle at center, transparent 48%, rgba(15, 23, 34, 0.58) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 28%, rgba(0, 0, 0, 0.16));
}

.map-route-summary,
.map-overlay,
.map-compass {
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(18, 18, 18, 0.45);
  backdrop-filter: blur(20px);
  box-shadow: none;
}

.map-route-summary b {
  background: var(--route-gold);
  color: #111827;
}

.map-route-summary i {
  background: linear-gradient(90deg, rgba(214, 179, 106, 0.25), var(--route-gold));
}

.map-route-summary i::after {
  border-color: var(--route-gold);
}

.map-overlay span,
.map-scale,
.map-route-summary span {
  color: rgba(243, 239, 231, 0.66);
}

.map-overlay strong,
.map-route-summary span {
  color: var(--route-text);
}

.map-road-label {
  border: 1px solid rgba(214, 179, 106, 0.14);
  background: rgba(15, 23, 34, 0.46);
  color: rgba(243, 239, 231, 0.62);
  text-shadow: none;
}

.floating-stop {
  border: 1px solid rgba(214, 179, 106, 0.3);
  background: rgba(17, 24, 39, 0.72);
  color: var(--route-text);
  box-shadow: none;
}

.floating-stop::after {
  border-color: rgba(214, 179, 106, 0.26);
  background: rgba(17, 24, 39, 0.72);
}

.floating-stop b,
.map-compass::before {
  background: var(--route-gold);
  color: #111827;
}

.map-compass {
  color: var(--route-gold);
}

.map-compass::before {
  background: transparent;
  border-bottom-color: var(--route-gold);
}

.route-map {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-map::before,
.route-progress-line {
  top: 34px;
  bottom: auto;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(214, 179, 106, 0.22);
  transform-origin: left center;
  box-shadow: none;
}

.route-progress-line {
  z-index: 1;
  background: linear-gradient(90deg, var(--cyan), var(--gold), #ffffff);
  box-shadow: 0 0 10px rgba(139, 108, 255, 0.5), 0 0 20px rgba(245, 208, 138, 0.4);
}

.route-stop {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 0;
}

.stop-marker {
  z-index: 2;
  width: 68px;
  height: 68px;
  border: 1px solid rgba(214, 179, 106, 0.24);
  border-radius: 50%;
  background: rgba(15, 23, 34, 0.82);
  color: var(--route-gold);
  box-shadow: none;
  backdrop-filter: blur(14px);
}

.stop-content {
  min-height: 260px;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
}

.stop-time {
  color: var(--route-gold);
  font-size: clamp(24px, 3vw, 38px);
  font-weight: 600;
  line-height: 1;
}

.stop-content h3 {
  margin: 0;
  color: var(--route-text);
  font-size: 20px;
}

.stop-content p {
  margin: 0;
  color: rgba(243, 239, 231, 0.68);
  font-size: 14px;
  line-height: 1.7;
}

.stay-pill {
  width: fit-content;
  margin-top: auto;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(214, 179, 106, 0.09);
  color: rgba(243, 239, 231, 0.78);
  font-size: 12px;
}

.notes-story {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.7fr);
  gap: 18px;
}

.travel-notes,
.related-routes {
  padding: 24px;
  border-radius: 24px;
}

.notes-title {
  color: var(--route-text);
}

.travel-notes ul {
  gap: 10px;
  padding-left: 18px;
  color: rgba(243, 239, 231, 0.68);
}

.related-routes {
  display: grid;
  gap: 12px;
}

.related-routes h2 {
  margin: 0 0 4px;
  font-size: 24px;
}

.related-card {
  position: relative;
  min-height: 138px;
  display: grid;
  align-items: end;
  overflow: hidden;
  border-radius: 20px;
  cursor: pointer;
}

.related-card img {
  position: absolute;
  inset: 0;
}

.related-card div {
  position: relative;
  z-index: 2;
  padding: 18px;
}

.related-card h3 {
  margin: 6px 0 0;
  color: var(--route-text);
  font-size: 17px;
  line-height: 1.35;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.review-card {
  padding: clamp(24px, 3vw, 34px);
  border-radius: 24px;
}

.review-card p {
  margin: 0 0 20px;
  color: rgba(243, 239, 231, 0.82);
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.5;
}

.route-footer {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 24px;
}

.route-footer span {
  color: var(--route-text);
  font-size: 22px;
}

.route-footer p {
  margin: 0;
}

.recommendation-page .liquid-button {
  min-height: 46px;
  padding: 0 19px;
  border-color: rgba(214, 179, 106, 0.24);
  background: rgba(214, 179, 106, 0.12);
  color: var(--route-text);
  box-shadow: none;
}

.recommendation-page .liquid-button:hover {
  transform: translateY(-2px);
  border-color: rgba(214, 179, 106, 0.42);
  background: rgba(214, 179, 106, 0.18);
  box-shadow: none;
}

@media (max-width: 1080px) {
  .route-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-media {
    min-height: 480px;
  }

  .journey-facts,
  .route-selector {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .route-map {
    grid-template-columns: 1fr;
  }

  .route-map::before,
  .route-progress-line {
    top: 0;
    bottom: 0;
    left: 34px;
    width: 1px;
    height: auto;
    transform-origin: top center;
  }

  .route-stop {
    grid-template-columns: 68px 1fr;
  }

  .notes-story,
  .review-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .recommendation-page {
    width: min(100% - 20px, 1240px);
    padding-top: 150px;
  }

  .hero-copy-block h1 {
    font-size: clamp(42px, 15vw, 72px);
  }

  .hero-media,
  .featured-route-card,
  .aerial-route-map {
    min-height: 390px;
    border-radius: 24px;
  }

  .journey-facts,
  .route-selector,
  .section-kicker {
    grid-template-columns: 1fr;
  }

  .featured-route-content {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    padding: 22px;
    background: rgba(15, 23, 34, 0.88);
  }

  .featured-route-card {
    display: grid;
  }

  .featured-route-card > img {
    position: absolute;
    inset: 0;
  }

  .route-selector button {
    grid-template-columns: 78px 1fr;
    min-height: 98px;
  }

  .map-route-summary {
    width: calc(100% - 24px);
  }

  .route-stop {
    grid-template-columns: 52px 1fr;
  }

  .stop-marker {
    width: 52px;
    height: 52px;
  }

  .route-map::before,
  .route-progress-line {
    left: 26px;
  }

  .stop-content {
    min-height: 0;
    padding: 18px;
  }

  .route-footer {
    display: grid;
  }
}

/* Phase 2: wider editorial product page refinement. */
.recommendation-page {
  --premium-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --cyan: #8B6CFF;
  --gold: #F5D08A;
  --route-gold: #F5D08A;
  width: min(1440px, calc(100% - 40px));
  padding-top: 136px;
}

.recommendation-page::before {
  background:
    radial-gradient(circle at top, rgba(32, 42, 68, 0.35), transparent 40%),
    linear-gradient(180deg, #07111f 0%, #08131f 35%, #050816 100%);
}

.recommendation-page::after {
  opacity: 0.28;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.45) 62%, transparent);
}

.route-hero::before,
.route-showcase::before,
.map-story::before {
  content: "";
  position: absolute;
  z-index: -1;
  width: min(46vw, 560px);
  height: min(46vw, 560px);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 210, 120, 0.12), transparent 62%);
  filter: blur(120px);
  opacity: 0.6;
  pointer-events: none;
}

.route-hero,
.route-showcase,
.map-story,
.timeline-story,
.notes-story,
.review-story {
  position: relative;
}

.route-hero::before {
  right: 4vw;
  top: 6vh;
}

.route-showcase::before {
  left: -10vw;
  top: 22%;
}

.map-story::before {
  right: -8vw;
  top: 12%;
}

.route-hero {
  grid-template-columns: 42% 58%;
  gap: clamp(28px, 4vw, 64px);
  min-height: calc(100vh - 132px);
}

.hero-media {
  min-height: min(70vh, 700px);
  transform: translateY(8px);
}

.hero-copy-block {
  gap: 26px;
}

.hero-copy-block h1 {
  font-size: clamp(64px, 8vw, 110px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 700;
  text-wrap: balance;
  font-feature-settings: "ss01" on, "ss02" on;
}

.hero-copy-block h1 span {
  display: block;
  white-space: nowrap;
}

.hero-lead,
.hero-desc {
  line-height: 1.8;
  opacity: 0.72;
}

.hero-lead {
  font-size: clamp(24px, 2.5vw, 38px);
}

.hero-desc {
  max-width: 420px;
}

.product-signals {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 620px;
}

.product-signals span {
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.025);
  color: rgba(243, 239, 231, 0.62);
  font-size: 13px;
  backdrop-filter: blur(18px);
}

.hero-media img,
.featured-route-card > img,
.route-selector img,
.related-card img {
  filter: contrast(1.05) saturate(1.08) brightness(0.95);
  transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), filter 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero-media::after,
.featured-route-card::after,
.related-card::after {
  background:
    linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.55) 100%),
    radial-gradient(circle at 16% 18%, rgba(139, 108, 255, 0.1), transparent 36%);
  z-index: 2;
}

.hero-media:hover img,
.featured-route-card:hover > img,
.related-card:hover img {
  transform: scale(1.03);
}

.journey-facts {
  grid-template-columns: 1.08fr 0.92fr 1fr 1.25fr;
  gap: 18px;
}

.journey-fact,
.featured-route-card,
.route-selector button,
.stop-content,
.travel-notes,
.related-routes,
.review-card {
  transition: all 0.8s var(--premium-ease);
}

.journey-fact:nth-child(2),
.route-selector button:nth-child(2),
.review-card:nth-child(2) {
  transform: translateY(12px);
}

.journey-fact:nth-child(3),
.route-selector button:nth-child(3) {
  transform: translateY(-8px) rotate(-0.35deg);
}

.journey-fact:nth-child(4),
.route-selector button:nth-child(4) {
  transform: translateY(18px) rotate(0.3deg);
}

.journey-fact:hover,
.route-selector button:hover,
.review-card:hover,
.travel-notes:hover,
.related-routes:hover {
  transform: translateY(-4px);
}

.featured-route-card {
  min-height: 720px;
  transform: rotate(-0.35deg);
}

.featured-route-card:hover {
  transform: translateY(-6px) rotate(-0.15deg);
}

.route-selector {
  gap: 18px;
  margin-top: 24px;
}

.route-selector button {
  min-height: 132px;
  grid-template-columns: 96px minmax(0, 1fr);
}

.section-kicker {
  margin-bottom: 34px;
}

.section-kicker h2 {
  max-width: 900px;
  letter-spacing: -0.04em;
}

.story-section {
  margin-bottom: clamp(96px, 12vw, 164px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
}

.map-story {
  mask-image: none;
}

.aerial-route-map {
  min-height: 640px;
  border-radius: 32px;
}

.aerial-route-map::before {
  opacity: 0.22;
  background:
    radial-gradient(circle at 50% 50%, rgba(243, 239, 231, 0.03) 0 1px, transparent 1px),
    linear-gradient(120deg, transparent 18%, rgba(214, 179, 106, 0.035), transparent 70%);
  background-size: 52px 52px, auto;
}

.map-route-summary {
  bottom: 22px;
  max-width: 780px;
}

.floating-stop {
  gap: 6px;
  max-width: 170px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(243, 239, 231, 0.72);
  font-size: 11px;
  letter-spacing: 0;
  line-height: 1.3;
  backdrop-filter: none;
}

.floating-stop::after {
  display: none;
}

.floating-stop b {
  width: 8px;
  height: 8px;
  border: 1px solid rgba(243, 239, 231, 0.82);
  background: var(--route-gold);
  box-shadow: 0 0 0 6px rgba(214, 179, 106, 0.08);
}

.floating-stop span {
  overflow: visible;
  color: rgba(243, 239, 231, 0.62);
  font-weight: 500;
  white-space: normal;
}

.map-overlay,
.map-compass,
.map-scale {
  opacity: 0.78;
}

.route-map {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

.route-stop {
  grid-column: span 2;
}

.route-stop:nth-of-type(1) {
  grid-column: 1 / span 2;
  transform: translateY(20px) rotate(-0.45deg);
}

.route-stop:nth-of-type(2) {
  grid-column: 3 / span 2;
  transform: translateY(-8px);
}

.route-stop:nth-of-type(3) {
  grid-column: 5 / span 3;
  transform: translateY(28px) rotate(0.35deg);
}

.route-stop:nth-of-type(4) {
  grid-column: 8 / span 2;
  transform: translateY(4px) rotate(-0.25deg);
}

.route-stop:nth-of-type(5) {
  grid-column: 10 / span 3;
  transform: translateY(34px);
}

.route-map::before,
.route-progress-line {
  top: 42px;
  opacity: 0.62;
}

.route-stop {
  cursor: pointer;
}

.stop-marker {
  width: 36px;
  height: 36px;
  margin-left: 14px;
  font-size: 13px;
  transition: transform 0.4s var(--premium-ease), border-color 0.4s var(--premium-ease), box-shadow 0.4s var(--premium-ease), color 0.4s var(--premium-ease);
}

.stop-content {
  min-height: 286px;
  padding: 24px;
  border-radius: 28px;
  transition: transform 0.4s var(--premium-ease), border-color 0.4s var(--premium-ease), background-color 0.4s var(--premium-ease), box-shadow 0.4s var(--premium-ease);
}

.route-stop:hover .stop-content {
  transform: translateY(-8px) scale(1.02) !important;
  border-color: rgba(214, 179, 106, 0.38) !important;
  background: rgba(214, 179, 106, 0.06) !important;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
}

.route-stop:hover .stop-marker {
  transform: scale(1.15) !important;
  border-color: rgba(214, 179, 106, 0.6) !important;
  box-shadow: 0 0 18px rgba(214, 179, 106, 0.5) !important;
  color: var(--route-text) !important;
}

.stop-period {
  color: rgba(243, 239, 231, 0.42);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stop-time {
  font-size: clamp(30px, 3.2vw, 46px);
  letter-spacing: -0.04em;
}

.stop-content:nth-child(even) {
  transform: translateY(8px);
}

.notes-story {
  grid-template-columns: minmax(0, 0.78fr) minmax(420px, 0.62fr);
  gap: 24px;
}

.review-grid {
  gap: 24px;
}

.review-card:nth-child(1) {
  transform: rotate(-0.3deg);
}

.review-card:nth-child(2) {
  transform: translateY(18px) rotate(0.25deg);
}

.route-footer {
  position: relative;
  align-items: end;
  min-height: 260px;
  padding: clamp(34px, 5vw, 72px);
  overflow: hidden;
  border-radius: 32px;
  background:
    radial-gradient(circle at 12% 12%, rgba(214, 179, 106, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012));
}

.route-footer::before {
  content: "";
  position: absolute;
  inset: -30% -10% auto;
  height: 70%;
  background: linear-gradient(180deg, rgba(214, 179, 106, 0.08), transparent);
  filter: blur(34px);
  pointer-events: none;
}

.route-footer span {
  font-size: clamp(36px, 5vw, 72px);
  letter-spacing: -0.05em;
}

.route-footer nav {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 16px 24px;
}

.route-footer a {
  color: rgba(243, 239, 231, 0.64);
  font-size: 14px;
  transition: color 0.8s var(--premium-ease), transform 0.8s var(--premium-ease);
}

.route-footer a:hover {
  color: var(--route-gold);
  transform: translateY(-2px);
}

@media (max-width: 1080px) {
  .recommendation-page {
    width: min(100% - 28px, 1440px);
  }

  .route-hero {
    grid-template-columns: 1fr;
  }

  .journey-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .route-map {
    grid-template-columns: 1fr;
  }

  .route-stop,
  .route-stop:nth-of-type(n) {
    grid-column: auto;
    transform: none;
  }

  .stop-marker {
    width: 52px;
    height: 52px;
    margin-left: 0;
  }

  .notes-story {
    grid-template-columns: 1fr;
  }

  .route-progress-line {
    background: linear-gradient(180deg, var(--cyan), var(--gold), #ffffff) !important;
    box-shadow: 0 0 10px rgba(37, 215, 255, 0.6), 0 0 20px rgba(214, 179, 106, 0.4) !important;
  }
}

@media (max-width: 700px) {
  .recommendation-page {
    width: min(100% - 20px, 1440px);
  }

  .hero-copy-block h1 {
    font-size: clamp(52px, 15vw, 76px);
    letter-spacing: -0.05em;
  }

  .hero-media,
  .featured-route-card,
  .aerial-route-map {
    min-height: 420px;
  }

  .journey-facts {
    grid-template-columns: 1fr;
  }

  .journey-fact:nth-child(n),
  .route-selector button:nth-child(n),
  .review-card:nth-child(n) {
    transform: none;
  }

  .route-selector button {
    grid-template-columns: 86px 1fr;
  }

  .route-footer {
    min-height: 300px;
    align-items: start;
  }

  .route-footer nav {
    justify-content: flex-start;
  }
}

/* Card levels hierarchy */
.hero-media,
.route-map-board,
.realtime-telemetry-bar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35) !important;
  backdrop-filter: blur(20px) !important;
}

.stop-content,
.travel-notes,
.review-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

.highlight-row span,
.route-selector button,
.related-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
}

/* Card Mouse Halo Spotlight Effect */
.hero-media,
.featured-route-card,
.route-selector button,
.stop-content,
.travel-notes,
.related-card,
.review-card,
.realtime-telemetry-bar {
  position: relative;
  overflow: hidden;
}

.hero-media::before,
.featured-route-card::before,
.route-selector button::before,
.stop-content::before,
.travel-notes::before,
.related-card::before,
.review-card::before,
.realtime-telemetry-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  background: radial-gradient(
    600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
    rgba(255, 255, 255, 0.06),
    transparent 40%
  );
}

.hero-media:hover::before,
.featured-route-card:hover::before,
.route-selector button:hover::before,
.stop-content:hover::before,
.travel-notes:hover::before,
.related-card:hover::before,
.review-card:hover::before,
.realtime-telemetry-bar:hover::before {
  opacity: 1;
}

/* Real-time AI Telemetry Dashboard Status Bar */
.realtime-telemetry-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: center;
  margin-top: -80px; /* pull it up closer to Hero */
  margin-bottom: 42px;
  padding: 20px 28px;
  border-radius: 24px;
  position: relative;
  z-index: 10;
}

.telemetry-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.live {
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
  animation: pulseLive 2s infinite;
}

@keyframes pulseLive {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.telemetry-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.telemetry-label {
  font-size: 10px;
  color: var(--route-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.telemetry-val {
  font-size: 15px;
  color: var(--route-text);
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(139, 108, 255, 0.4);
  letter-spacing: -0.02em;
}

.telemetry-val.text-green {
  color: #4ade80;
  text-shadow: 0 0 12px rgba(74, 222, 128, 0.5);
}

.telemetry-val.text-gold {
  color: var(--route-gold);
  text-shadow: 0 0 12px rgba(245, 208, 138, 0.5);
}

.telemetry-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

.telemetry-progress-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 4px;
}

.telemetry-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cyan), var(--gold));
  border-radius: 99px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* Timeline progress upgrades */
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 4px;
}

.timeline-header span {
  font-size: 12px;
  color: var(--route-gold);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.progress-bar-container {
  width: 160px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  width: 68%;
  height: 100%;
  background: linear-gradient(90deg, var(--cyan), var(--gold));
}

.stop-time {
  font-size: 40px !important;
  font-weight: 700 !important;
  opacity: 0.95 !important;
  color: var(--route-gold) !important;
  line-height: 1.1;
  font-family: "Inter", sans-serif;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

@media (max-width: 1080px) {
  .realtime-telemetry-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: -20px;
  }
  .telemetry-divider {
    display: none;
  }
  .progress-item {
    grid-column: span 2;
  }
}

/* Vibe Coding Effects */
.vibe-noise {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

.vibe-scanline {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9998;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(139, 108, 255, 0.03) 50%,
    rgba(139, 108, 255, 0.03)
  );
  background-size: 100% 4px;
  opacity: 0.8;
}

.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  pointer-events: none;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 var(--cyan);
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim 3s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 var(--gold);
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim 2.5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% { clip: rect(32px, 9999px, 28px, 0); }
  5% { clip: rect(87px, 9999px, 11px, 0); }
  10% { clip: rect(110px, 9999px, 105px, 0); }
  15% { clip: rect(25px, 9999px, 76px, 0); }
  20% { clip: rect(59px, 9999px, 49px, 0); }
  25% { clip: rect(48px, 9999px, 98px, 0); }
  30% { clip: rect(86px, 9999px, 112px, 0); }
  35% { clip: rect(100px, 9999px, 24px, 0); }
  40% { clip: rect(3px, 9999px, 90px, 0); }
  45% { clip: rect(15px, 9999px, 34px, 0); }
  50% { clip: rect(112px, 9999px, 73px, 0); }
  55% { clip: rect(98px, 9999px, 55px, 0); }
  60% { clip: rect(4px, 9999px, 64px, 0); }
  65% { clip: rect(47px, 9999px, 89px, 0); }
  70% { clip: rect(10px, 9999px, 108px, 0); }
  75% { clip: rect(72px, 9999px, 22px, 0); }
  80% { clip: rect(90px, 9999px, 66px, 0); }
  85% { clip: rect(105px, 9999px, 3px, 0); }
  90% { clip: rect(26px, 9999px, 45px, 0); }
  95% { clip: rect(54px, 9999px, 82px, 0); }
  100% { clip: rect(81px, 9999px, 12px, 0); }
}

/* Final route page art direction: Apple Maps x premium citywalk product. */
.recommendation-page {
  --route-bg: #07111f;
  --route-gold: #f5d08a;
  --route-purple: #8b6cff;
  --route-text: #f3efe7;
  --route-secondary: rgba(206, 216, 230, 0.66);
  --route-panel: rgba(255, 255, 255, 0.03);
  --route-line: rgba(255, 255, 255, 0.08);
  --route-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  isolation: isolate;
  width: min(1440px, calc(100% - 40px));
  padding-top: 134px;
  color: var(--route-text);
}

.recommendation-page::before {
  background:
    radial-gradient(circle at top, rgba(32, 42, 68, 0.35), transparent 40%),
    linear-gradient(180deg, #07111f 0%, #08131f 35%, #050816 100%);
}

.recommendation-page::after {
  opacity: 1;
  background:
    radial-gradient(600px circle at var(--page-x, 50vw) var(--page-y, 30vh), rgba(255, 255, 255, 0.06), transparent 40%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: auto, 72px 72px, 72px 72px;
  mask-image: linear-gradient(180deg, #000, rgba(0, 0, 0, 0.68) 70%, transparent);
}

:global(.site-header.route-scroll-glass) {
  border-color: rgba(245, 208, 138, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(10, 15, 25, 0.46)),
    rgba(8, 13, 22, 0.62);
  box-shadow:
    0 22px 70px rgba(0, 0, 0, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.26);
  backdrop-filter: blur(30px) saturate(150%);
}

.glitch-text::before,
.glitch-text::after {
  display: none;
}

.vibe-scanline {
  opacity: 0.22;
}

.route-hero,
.route-showcase,
.map-story,
.timeline-story {
  position: relative;
}

.route-hero::before,
.map-story::before,
.timeline-story::before {
  width: min(58vw, 680px);
  height: min(34vw, 420px);
  border-radius: 999px;
  background: rgba(255, 210, 120, 0.12);
  filter: blur(120px);
  opacity: 0.54;
}

.route-hero {
  grid-template-columns: minmax(0, 0.42fr) minmax(480px, 0.58fr);
  gap: clamp(32px, 4.6vw, 72px);
  align-items: center;
  min-height: calc(100vh - 128px);
  padding-bottom: clamp(42px, 7vh, 86px);
}

.hero-copy-block {
  max-width: 560px;
  gap: 24px;
}

.hero-copy-block h1 {
  max-width: 620px;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: clamp(58px, 6.8vw, 104px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: 0;
  text-wrap: balance;
  font-feature-settings: "ss01" on, "ss02" on;
}

.hero-copy-block h1 span {
  white-space: normal;
}

.hero-lead {
  max-width: 500px;
  font-size: clamp(22px, 2.5vw, 34px);
  line-height: 1.34;
  opacity: 0.78;
}

.hero-desc {
  max-width: 420px;
  line-height: 1.8;
  opacity: 0.72;
}

.hero-media {
  min-height: min(72vh, 720px);
  border-radius: 30px;
}

.hero-media,
.aerial-route-map,
.route-map-board {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hero-media img,
.featured-route-card > img,
.related-card img {
  filter: contrast(1.05) saturate(1.08) brightness(0.95);
  transition: transform 1.2s var(--route-ease), filter 1.2s var(--route-ease);
}

.hero-media::after,
.featured-route-card::after,
.related-card::after {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.55) 100%),
    radial-gradient(circle at 20% 15%, rgba(245, 208, 138, 0.14), transparent 36%);
}

.hero-media:hover img,
.featured-route-card:hover > img,
.related-card:hover img {
  transform: scale(1.03);
}

.hero-media-caption,
.map-route-summary,
.map-overlay,
.map-compass {
  background: rgba(10, 15, 25, 0.55);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(20px) saturate(145%);
}

.product-signals span,
.highlight-row span,
.route-selector button,
.stay-pill {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.journey-fact,
.stop-content,
.travel-notes,
.related-routes,
.review-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.055);
}

.journey-fact,
.featured-route-card,
.route-selector button,
.stop-content,
.travel-notes,
.related-routes,
.review-card,
.realtime-telemetry-bar {
  transition:
    transform 520ms var(--route-ease),
    border-color 520ms var(--route-ease),
    background 520ms var(--route-ease),
    box-shadow 520ms var(--route-ease);
}

.journey-fact:hover,
.route-selector button:hover,
.stop-content:hover,
.travel-notes:hover,
.related-routes:hover,
.review-card:hover,
.realtime-telemetry-bar:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: rgba(245, 208, 138, 0.26);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.28);
}

.realtime-telemetry-bar {
  grid-template-columns: minmax(150px, 1fr) 1px minmax(145px, 0.92fr) 1px minmax(145px, 0.96fr) 1px minmax(135px, 0.82fr) 1px minmax(170px, 1.15fr);
  margin-top: -54px;
  margin-bottom: 58px;
  padding: 18px 22px;
  border-radius: 24px;
}

.telemetry-label {
  color: rgba(206, 216, 230, 0.58);
  letter-spacing: 0.08em;
}

.telemetry-val {
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  letter-spacing: 0;
}

.section-kicker {
  grid-template-columns: minmax(112px, 0.18fr) minmax(0, 0.82fr);
}

.section-kicker span {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-kicker h2 {
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: 0;
  text-wrap: balance;
}

.featured-route-card {
  min-height: min(88vh, 780px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 76px rgba(0, 0, 0, 0.34);
}

.route-showcase {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow: visible;
  mask-image: none;
}

.route-showcase .section-kicker {
  width: min(1440px, calc(100% - 40px));
  margin-inline: auto;
}

.route-showcase .featured-route-card {
  width: 100vw;
  height: 100svh;
  min-height: 720px;
  margin: 0;
  border: 0;
  border-radius: 0;
  transform: none;
  will-change: transform, clip-path;
  box-shadow: 0 36px 110px rgba(0, 0, 0, 0.42);
}

.route-showcase .featured-route-card:hover {
  transform: none;
}

.route-showcase .featured-route-card > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.route-showcase .featured-route-content {
  left: clamp(32px, 5vw, 76px);
  right: clamp(28px, 8vw, 120px);
  bottom: clamp(38px, 8vh, 92px);
  max-width: min(760px, calc(100% - 64px));
  gap: 18px;
  will-change: transform, opacity, filter;
}

.route-showcase .featured-route-content > span {
  color: rgba(243, 239, 231, 0.72);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.route-showcase .featured-route-content h3 {
  max-width: 780px;
  font-size: clamp(52px, 6.8vw, 112px);
  line-height: 0.93;
  font-weight: 700;
  text-wrap: balance;
}

.route-showcase .featured-route-content p {
  max-width: 560px;
  color: rgba(243, 239, 231, 0.74);
  font-size: clamp(15px, 1.25vw, 18px);
}

.route-showcase .highlight-row,
.route-showcase .route-stats {
  max-width: 720px;
}

.route-showcase .route-stats {
  gap: 12px;
}

.route-showcase .route-stat {
  background: rgba(10, 15, 25, 0.46);
  border-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px) saturate(135%);
}

.route-showcase .featured-route-content .liquid-button {
  position: relative;
  isolation: isolate;
  min-height: 58px;
  width: fit-content;
  min-width: 218px;
  padding: 0 26px 0 30px;
  overflow: hidden;
  border: 1px solid rgba(245, 208, 138, 0.52);
  border-radius: 999px;
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.2), transparent 28%),
    linear-gradient(135deg, rgba(245, 208, 138, 0.24), rgba(139, 108, 255, 0.1) 52%, rgba(10, 15, 25, 0.72)),
    rgba(10, 15, 25, 0.62);
  color: rgba(255, 248, 228, 0.96);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 16px rgba(245, 208, 138, 0.24);
  box-shadow:
    0 18px 46px rgba(0, 0, 0, 0.36),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 38px rgba(245, 208, 138, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -18px 34px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(22px) saturate(150%);
  transition:
    transform 520ms var(--route-ease),
    border-color 520ms var(--route-ease),
    box-shadow 520ms var(--route-ease),
    background 520ms var(--route-ease);
}

.route-showcase .featured-route-content .liquid-button::before,
.route-showcase .featured-route-content .liquid-button::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

.route-showcase .featured-route-content .liquid-button::before {
  inset: 1px;
  z-index: -1;
  border-radius: inherit;
  background:
    linear-gradient(110deg, transparent 8%, rgba(255, 255, 255, 0.34) 28%, transparent 46%),
    radial-gradient(circle at 88% 50%, rgba(245, 208, 138, 0.22), transparent 36%);
  opacity: 0.58;
  transform: translateX(-42%);
  transition: transform 680ms var(--route-ease), opacity 520ms var(--route-ease);
}

.route-showcase .featured-route-content .liquid-button::after {
  right: 17px;
  top: 50%;
  z-index: -1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(245, 208, 138, 0.14);
  box-shadow: 0 0 24px rgba(245, 208, 138, 0.22);
  transform: translateY(-50%) scale(0.82);
  transition: transform 520ms var(--route-ease), background 520ms var(--route-ease);
}

.route-showcase .featured-route-content .liquid-button svg {
  width: 19px;
  height: 19px;
  color: var(--route-gold);
  filter: drop-shadow(0 0 10px rgba(245, 208, 138, 0.4));
  transition: transform 520ms var(--route-ease), color 520ms var(--route-ease);
}

.route-showcase .featured-route-content .liquid-button:hover {
  transform: translateY(-4px) scale(1.018);
  border-color: rgba(255, 226, 162, 0.82);
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.26), transparent 30%),
    linear-gradient(135deg, rgba(245, 208, 138, 0.34), rgba(139, 108, 255, 0.16) 52%, rgba(10, 15, 25, 0.64)),
    rgba(10, 15, 25, 0.66);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.44),
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 0 52px rgba(245, 208, 138, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 -18px 34px rgba(0, 0, 0, 0.18);
}

.route-showcase .featured-route-content .liquid-button:hover::before {
  opacity: 0.88;
  transform: translateX(36%);
}

.route-showcase .featured-route-content .liquid-button:hover::after {
  background: rgba(245, 208, 138, 0.22);
  transform: translateY(-50%) scale(1);
}

.route-showcase .featured-route-content .liquid-button:hover svg {
  color: #fff8e4;
  transform: translateX(5px);
}

.route-showcase .featured-route-content .liquid-button:active {
  transform: translateY(-1px) scale(0.992);
}

.featured-route-content h3,
.related-routes h2,
.route-footer span {
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  letter-spacing: 0;
}

.route-selector button.active {
  transform: translateY(-8px) scale(1.01);
  border-color: rgba(245, 208, 138, 0.58) !important;
  background:
    linear-gradient(180deg, rgba(245, 208, 138, 0.14), rgba(255, 255, 255, 0.035)) !important;
  box-shadow: 0 18px 38px rgba(245, 208, 138, 0.16);
}

.route-map-board {
  padding: 18px;
  border-radius: 32px;
}

.map-story {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow: visible;
  mask-image: none;
}

.map-story .section-kicker {
  width: min(1440px, calc(100% - 40px));
  margin-inline: auto;
}

.map-story .route-map-board {
  width: 100vw;
  height: 100svh;
  min-height: 720px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  will-change: transform, clip-path;
}

.map-story .aerial-route-map {
  height: 100%;
  min-height: 100%;
  margin: 0;
  border: 0;
  border-radius: 0;
  will-change: border-radius;
}

.aerial-route-map {
  min-height: 650px;
  border-radius: 26px;
  background:
    radial-gradient(circle at 48% 26%, rgba(245, 208, 138, 0.12), transparent 26%),
    radial-gradient(circle at 70% 66%, rgba(139, 108, 255, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(24, 33, 45, 0.96), rgba(11, 16, 26, 0.98));
}

.aerial-route-map::after {
  background:
    radial-gradient(circle at center, transparent 46%, rgba(5, 8, 16, 0.62) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 26%, rgba(0, 0, 0, 0.22));
}

.map-viewport {
  filter: contrast(1.04) saturate(1.08);
}

.map-route-flow {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
}

.map-route-flow polyline {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.map-route-flow-glow {
  stroke: rgba(245, 208, 138, 0.34);
  stroke-width: 12;
  filter: blur(7px);
}

.map-route-flow-core {
  stroke: url("#route-flow-gradient");
  stroke-width: 2.4;
  stroke-dasharray: 12 14;
  animation: routePathMove 12s linear infinite;
  filter: drop-shadow(0 0 8px rgba(245, 208, 138, 0.52)) drop-shadow(0 0 14px rgba(139, 108, 255, 0.34));
}

@keyframes routePathMove {
  to {
    stroke-dashoffset: -260;
  }
}

.floating-stop {
  z-index: 5;
}

.floating-stop b {
  animation: landmarkBreath 2.6s ease-out infinite;
}

@keyframes landmarkBreath {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 220, 120, 0.5), 0 0 16px rgba(245, 208, 138, 0.3);
  }
  70% {
    box-shadow: 0 0 0 14px rgba(255, 220, 120, 0), 0 0 22px rgba(245, 208, 138, 0.34);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 220, 120, 0), 0 0 16px rgba(245, 208, 138, 0.3);
  }
}

.timeline-header {
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(18px);
}

.progress-bar-fill,
.telemetry-progress-fill,
.route-progress-line {
  background: linear-gradient(90deg, var(--route-gold), var(--route-purple), rgba(255, 255, 255, 0.92));
  background-size: 180% 100%;
  animation: progressGlow 6s linear infinite;
}

@keyframes progressGlow {
  to {
    background-position: 180% 0;
  }
}

.route-stop.is-current {
  z-index: 4;
}

.route-stop.is-current .stop-content {
  transform: translateY(-8px);
  border-color: rgba(255, 220, 120, 0.6) !important;
  background:
    linear-gradient(180deg, rgba(245, 208, 138, 0.09), rgba(255, 255, 255, 0.035)) !important;
  box-shadow:
    0 24px 58px rgba(0, 0, 0, 0.32),
    0 0 34px rgba(245, 208, 138, 0.12);
}

.route-stop.is-current .stop-marker {
  transform: scale(1.12);
  border-color: rgba(255, 220, 120, 0.66);
  background: rgba(245, 208, 138, 0.16);
  color: var(--route-text);
  box-shadow: 0 0 0 8px rgba(245, 208, 138, 0.06), 0 0 28px rgba(245, 208, 138, 0.28);
}

.stop-time {
  font-size: clamp(34px, 3.2vw, 46px) !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
}

@media (max-width: 1080px) {
  .recommendation-page {
    width: min(100% - 28px, 1440px);
  }

  .route-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-copy-block {
    max-width: 720px;
  }

  .hero-media {
    min-height: 540px;
  }

  .route-showcase .featured-route-card {
    min-height: 780px;
  }

  .route-showcase .featured-route-content h3 {
    font-size: clamp(44px, 9vw, 82px);
  }

  .realtime-telemetry-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: -24px;
  }

  .telemetry-divider {
    display: none;
  }
}

@media (max-width: 700px) {
  .recommendation-page {
    width: min(100% - 20px, 1440px);
    padding-top: 142px;
  }

  .hero-copy-block h1 {
    font-size: clamp(44px, 14vw, 72px);
  }

  .hero-lead {
    font-size: clamp(20px, 7vw, 30px);
  }

  .hero-media,
  .aerial-route-map {
    min-height: 430px;
    border-radius: 24px;
  }

  .route-showcase {
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
  }

  .route-showcase .section-kicker {
    width: min(100% - 20px, 1440px);
  }

  .route-showcase .featured-route-card {
    height: 100svh;
    min-height: 720px;
    border-radius: 0;
  }

  .route-showcase .featured-route-content {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 34px;
    max-width: none;
    padding: 0;
    background: transparent;
  }

  .route-showcase .featured-route-content h3 {
    font-size: clamp(38px, 13vw, 58px);
  }

  .route-showcase .featured-route-content p {
    max-width: 320px;
  }

  .route-showcase .featured-route-content .liquid-button {
    min-height: 54px;
    min-width: 196px;
    padding: 0 22px 0 24px;
    font-size: 14px;
  }

  .realtime-telemetry-bar {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .progress-item {
    grid-column: auto;
  }

  .route-map-board {
    padding: 10px;
    border-radius: 24px;
  }

  .map-route-flow {
    opacity: 0.82;
  }

  .timeline-header {
    display: grid;
    gap: 12px;
  }

  .progress-bar-container {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-route-flow-core,
  .floating-stop b,
  .progress-bar-fill,
  .telemetry-progress-fill,
  .route-progress-line,
  .status-indicator.live {
    animation: none !important;
  }

  .hero-media img,
  .featured-route-card > img,
  .related-card img,
  .journey-fact,
  .route-selector button,
  .stop-content,
  .travel-notes,
  .related-routes,
  .review-card,
  .realtime-telemetry-bar {
    transition: none !important;
  }
}
</style>
