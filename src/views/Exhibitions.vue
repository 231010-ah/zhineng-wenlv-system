<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getExhibitions, getVenues } from '../api/tourism'

gsap.registerPlugin(ScrollTrigger)

const pageRef = ref(null)
const exhibitions = ref([])
const venues = ref([])
const activeVenue = ref('all')
let cleanupMotion

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
  '--exhibit-surface': item.theme?.surface || '#111'
})

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
  const [exhibitionData, venueData] = await Promise.all([getExhibitions(), getVenues()])
  exhibitions.value = exhibitionData
  venues.value = venueData
  await nextTick()
  initMotion()
  ScrollTrigger.refresh()
})

watch(activeVenue, async () => {
  await nextTick()
  animateFilteredCards()
  ScrollTrigger.refresh()
})

onUnmounted(() => {
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

    <div class="filter-row" data-reveal>
      <button class="mini-button" :class="{ active: activeVenue === 'all' }" type="button" @click="activeVenue = 'all'">全部</button>
      <button v-for="venue in venues" :key="venue.id" class="mini-button dark-button" :class="{ active: activeVenue === venue.id }" @click="activeVenue = venue.id">
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
          <strong class="detail-entry">查看特色物品 <span aria-hidden="true">→</span></strong>
        </div>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.exhibitions-page {
  width: min(1180px, calc(100% - 32px));
  padding-top: 126px;
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
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.filter-row .active {
  background: var(--text);
  color: #050505;
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
  border-color: color-mix(in srgb, var(--exhibit-accent) 34%, transparent);
  background:
    radial-gradient(circle at 22% 18%, var(--exhibit-accent-soft), transparent 18rem),
    radial-gradient(circle at 88% 8%, var(--exhibit-glow), transparent 16rem),
    linear-gradient(145deg, color-mix(in srgb, var(--exhibit-surface) 82%, transparent), rgba(8, 8, 8, 0.72));
}

.exhibition-card:hover {
  border-color: color-mix(in srgb, var(--exhibit-accent) 62%, rgba(255, 255, 255, 0.24));
  box-shadow: 0 28px 78px rgba(0, 0, 0, 0.42), 0 0 34px var(--exhibit-glow);
  transform: translateY(-3px);
}

.exhibition-card:hover img {
  transform: scale(1.035);
}

.exhibition-card,
.exhibition-card img {
  transition: transform 260ms ease, border-color 220ms ease, box-shadow 220ms ease;
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
}

.detail-entry span {
  transition: transform 180ms ease;
}

.exhibition-card:hover .detail-entry span {
  transform: translateX(4px);
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
