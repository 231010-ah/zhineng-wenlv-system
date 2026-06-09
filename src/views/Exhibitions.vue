<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getExhibitions, getVenues } from '../api/tourism'

gsap.registerPlugin(ScrollTrigger)

const pageRef = ref(null)
const filterRef = ref(null)
const filterIndicatorStyle = ref({
  width: '0px',
  height: '0px',
  transform: 'translate3d(0, 0, 0)',
  opacity: 0
})
const exhibitions = ref([])
const venues = ref([])
const activeVenue = ref('all')
const filterTabRefs = new Map()
let cleanupMotion

const venueAmbientGlow = {
  'palace-museum': {
    base: 'rgba(141, 37, 34, 0.08)',
    hover: 'rgba(141, 37, 34, 0.16)'
  },
  'temple-of-heaven': {
    base: 'rgba(26, 85, 153, 0.08)',
    hover: 'rgba(26, 85, 153, 0.16)'
  },
  'summer-palace': {
    base: 'rgba(46, 125, 50, 0.06)',
    hover: 'rgba(46, 125, 50, 0.13)'
  }
}

const filtered = computed(() => {
  if (activeVenue.value === 'all') return exhibitions.value
  return exhibitions.value.filter((item) => item.venueId === activeVenue.value)
})

const venueName = (id) => venues.value.find((venue) => venue.id === id)?.name || '文化场馆'
const preloadedImages = new Set()

const exhibitionThemeStyle = (item) => ({
  '--exhibit-accent': item.theme?.accent || 'var(--cyan)',
  '--exhibit-accent-soft': item.theme?.accentSoft || 'rgba(158, 216, 223, 0.24)',
  '--exhibit-glow': item.theme?.glow || 'rgba(158, 216, 223, 0.18)',
  '--exhibit-surface': item.theme?.surface || '#111',
  '--venue-ambient-glow': venueAmbientGlow[item.venueId]?.base || 'rgba(158, 216, 223, 0.07)',
  '--venue-ambient-glow-hover': venueAmbientGlow[item.venueId]?.hover || 'rgba(158, 216, 223, 0.14)'
})

const setFilterTabRef = (id, element) => {
  if (element) {
    filterTabRefs.set(id, element)
  } else {
    filterTabRefs.delete(id)
  }
}

const updateFilterIndicator = () => {
  const row = filterRef.value
  const activeTab = filterTabRefs.get(activeVenue.value)

  if (!row || !activeTab) return

  const rowRect = row.getBoundingClientRect()
  const tabRect = activeTab.getBoundingClientRect()

  filterIndicatorStyle.value = {
    width: `${tabRect.width}px`,
    height: `${tabRect.height}px`,
    transform: `translate3d(${tabRect.left - rowRect.left}px, ${tabRect.top - rowRect.top}px, 0)`,
    opacity: 1
  }
}

const preloadDetailImage = (item) => {
  const imageUrl = item.featuredObject?.image
  if (!imageUrl || preloadedImages.has(imageUrl)) return

  preloadedImages.add(imageUrl)
  const image = new Image()
  image.decoding = 'async'
  image.src = imageUrl
}

const animateFilteredCards = () => {
  if (!pageRef.value) return
  const cards = pageRef.value.querySelectorAll('[data-card]')
  gsap.fromTo(
    cards,
    { autoAlpha: 0, y: 18, scale: 0.985 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.48,
      stagger: 0.06,
      ease: 'power3.out',
      overwrite: true
    }
  )
}

const initMotion = () => {
  cleanupMotion?.()
  if (!pageRef.value) return

  const root = pageRef.value
  const mm = gsap.matchMedia()

  mm.add(
    {
      isDesktop: '(min-width: 900px)',
      isMobile: '(max-width: 899px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    (context) => {
      const { isMobile, reduceMotion } = context.conditions
      const q = gsap.utils.selector(root)
      const revealTargets = q('[data-reveal], [data-card]')

      if (reduceMotion) {
        gsap.set(revealTargets, { autoAlpha: 1, y: 0, clearProps: 'transform' })
        return
      }

      gsap.set(revealTargets, { autoAlpha: 0, y: isMobile ? 18 : 32 })
      gsap
        .timeline({ defaults: { duration: 0.68, ease: 'power3.out' } })
        .fromTo(q('[data-hero]'), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.08 })

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
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: true
          })
        }
      })

    },
    root
  )

  cleanupMotion = () => mm.revert()
}

onMounted(async () => {
  await nextTick()
  updateFilterIndicator()

  const [exhibitionData, venueData] = await Promise.all([getExhibitions(), getVenues()])
  exhibitions.value = exhibitionData
  venues.value = venueData
  await nextTick()
  updateFilterIndicator()
  document.fonts?.ready.then(updateFilterIndicator)
  window.addEventListener('resize', updateFilterIndicator)
  initMotion()
  ScrollTrigger.refresh()
})

watch(activeVenue, async () => {
  await nextTick()
  updateFilterIndicator()
  animateFilteredCards()
  ScrollTrigger.refresh()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateFilterIndicator)
  cleanupMotion?.()
})
</script>

<template>
  <main ref="pageRef" class="page-shell exhibitions-page motion-page">
    <section class="exhibition-hero">
      <div class="page-title">
        <span class="eyebrow" data-hero>北京展览与活动</span>
        <h1 data-hero>展览查看</h1>
        <p data-hero>按北京文旅地点筛选展览、展陈和漫游主题，查看特色物品展示与介绍，并进入预约建议。</p>
      </div>
    </section>

    <div ref="filterRef" class="filter-row" data-reveal>
      <span class="filter-indicator" :style="filterIndicatorStyle" aria-hidden="true"></span>
      <button :ref="(el) => setFilterTabRef('all', el)" class="mini-button filter-tab" :class="{ active: activeVenue === 'all' }" type="button" @click="activeVenue = 'all'">全部</button>
      <button
        v-for="venue in venues"
        :key="venue.id"
        :ref="(el) => setFilterTabRef(venue.id, el)"
        class="mini-button dark-button filter-tab"
        :class="{ active: activeVenue === venue.id }"
        @click="activeVenue = venue.id"
      >
        {{ venue.name }}
      </button>
    </div>

    <section class="exhibition-grid">
      <router-link
        v-for="item in filtered"
        :key="item.id"
        class="glass-card exhibition-card"
        data-card
        :style="exhibitionThemeStyle(item)"
        :to="{ name: 'exhibition-detail', params: { exhibitionId: item.id } }"
        :aria-label="`查看${item.featuredObject?.name || item.title}特色物品介绍`"
        @mouseenter="preloadDetailImage(item)"
        @focus="preloadDetailImage(item)"
      >
        <div class="image-frame">
          <img :src="item.image" :alt="item.title" loading="lazy" decoding="async" />
        </div>
        <div>
          <span>{{ venueName(item.venueId) }} · {{ item.featuredObject?.name || item.theme?.name || '特色物品' }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary }}</p>
          <small>{{ item.date }}</small>
          <strong class="detail-entry">查看特色物品 <span class="cta-arrow" aria-hidden="true">→</span></strong>
        </div>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.exhibitions-page {
  position: relative;
  width: min(1180px, calc(100% - 32px));
  padding-top: 126px;
}

:global(.app-shell:has(.exhibitions-page)::before),
:global(.app-shell:has(.exhibitions-page)::after) {
  opacity: 0.15;
}

.exhibition-hero {
  margin-bottom: 22px;
}

.exhibitions-page .page-title {
  margin-bottom: 0;
}

.exhibitions-page .page-title h1 {
  font-size: clamp(38px, 5.4vw, 66px);
  line-height: 1.05;
}

.exhibitions-page .page-title p {
  max-width: 620px;
  font-size: 15px;
  line-height: 1.72;
}

.filter-row {
  position: relative;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: fit-content;
  max-width: 100%;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid rgba(234, 244, 255, 0.12);
  border-radius: 999px;
  background: rgba(4, 12, 24, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 48px rgba(0, 0, 0, 0.18);
  -webkit-backdrop-filter: blur(12px) saturate(125%);
  backdrop-filter: blur(12px) saturate(125%);
}

.filter-indicator {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  border-radius: 999px;
  background: var(--text);
  box-shadow:
    0 10px 26px rgba(246, 242, 234, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: width, height, transform;
}

.filter-tab {
  position: relative;
  z-index: 1;
  min-height: 36px;
  border-color: transparent;
  background: transparent;
  color: rgba(246, 242, 234, 0.76);
  box-shadow: none;
  transform: none;
  transition: color 220ms ease, text-shadow 220ms ease;
}

.filter-tab:hover {
  color: var(--text);
  box-shadow: none;
  transform: none;
}

.filter-row .active {
  background: transparent;
  color: #050505;
  text-shadow: none;
}

.exhibition-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.exhibition-card {
  display: grid;
  grid-template-columns: 42% 1fr;
  color: inherit;
  cursor: pointer;
  will-change: transform;
  border-radius: 28px;
  border-color: color-mix(in srgb, var(--exhibit-accent) 34%, transparent);
  background:
    radial-gradient(circle at 22% 18%, color-mix(in srgb, var(--exhibit-accent-soft) 78%, transparent), transparent 18rem),
    radial-gradient(circle at 88% 8%, var(--venue-ambient-glow), transparent 17rem),
    linear-gradient(145deg, color-mix(in srgb, var(--exhibit-surface) 84%, rgba(255, 255, 255, 0.02)), rgba(10, 10, 10, 0.74));
  box-shadow:
    0 20px 64px rgba(0, 0, 0, 0.32),
    0 4px 30px var(--venue-ambient-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.13);
  -webkit-backdrop-filter: blur(4px) saturate(118%);
  backdrop-filter: blur(4px) saturate(118%);
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  contain: paint;
}

.exhibition-card:hover {
  border-color: color-mix(in srgb, var(--exhibit-accent) 38%, rgba(255, 255, 255, 0.14));
  box-shadow:
    0 24px 62px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transform: translate3d(0, -3px, 0);
}

.exhibition-card::before,
.exhibition-card::after {
  border-radius: inherit;
  transition: opacity 420ms ease, transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

.exhibition-card::before {
  opacity: 0.28;
  transform: rotate(-13deg) scale(0.98);
}

.exhibition-card::after {
  inset: 1px;
  z-index: 1;
  border-radius: 27px;
  background:
    radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--exhibit-accent) 12%, transparent), transparent 12rem),
    radial-gradient(circle at 88% 10%, var(--venue-ambient-glow-hover), transparent 14rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.036), transparent 34%, rgba(255, 255, 255, 0.025));
  mix-blend-mode: normal;
  opacity: 0.2;
}

.exhibition-card:hover::before {
  opacity: 0.32;
  transform: rotate(-13deg) scale(0.98);
}

.exhibition-card:hover::after {
  opacity: 0.34;
}

.exhibition-card:hover img {
  transform: scale(1.035);
}

.exhibition-card,
.exhibition-card img {
  transition:
    transform 520ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 320ms ease,
    box-shadow 420ms ease;
}

.exhibition-card .image-frame {
  width: 100%;
  height: 100%;
  min-height: 220px;
}

.exhibition-card img {
  width: 100%;
  height: 100%;
  min-height: 220px;
  object-fit: cover;
}

.exhibition-card > div:not(.image-frame) {
  position: relative;
  z-index: 2;
  padding: 20px;
}

.exhibition-card span,
.exhibition-card small {
  color: var(--exhibit-accent);
}

.exhibition-card h2 {
  margin: 10px 0 8px;
  font-size: 23px;
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", serif;
  font-weight: 900;
  line-height: 1.16;
}

.exhibition-card p {
  color: var(--muted);
  line-height: 1.62;
}

.detail-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  color: var(--exhibit-accent);
  font-size: 14px;
  transition: color 300ms ease, text-shadow 300ms ease;
}

.detail-entry .cta-arrow {
  display: inline-block;
  color: inherit;
  transition: transform 0.3s ease;
  will-change: transform;
}

.exhibition-card:hover .detail-entry {
  color: color-mix(in srgb, var(--exhibit-accent) 72%, #ffffff);
  text-shadow: 0 0 18px color-mix(in srgb, var(--exhibit-accent) 34%, transparent);
}

.exhibition-card:hover .detail-entry .cta-arrow {
  transform: translateX(5px);
}

@media (max-width: 880px) {
  .exhibitions-page {
    width: min(100% - 20px, 1180px);
    padding-top: 146px;
  }

  .exhibition-grid,
  .exhibition-card {
    grid-template-columns: 1fr;
  }
}
</style>
