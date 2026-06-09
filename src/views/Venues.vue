<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getVenues } from '../api/tourism'

gsap.registerPlugin(ScrollTrigger)

const pageRef = ref(null)
const venues = ref([])
let cleanupMotion

const totalRemaining = computed(() => venues.value.reduce((total, venue) => total + venue.remaining, 0))
const averageCrowd = computed(() => {
  if (!venues.value.length) return 0
  return Math.round(venues.value.reduce((total, venue) => total + venue.crowd, 0) / venues.value.length)
})
const calmVenues = computed(() => venues.value.filter((venue) => venue.crowd <= 65).length)
const signalStats = computed(() => [
  { label: '预约余量', value: totalRemaining.value, suffix: '' },
  { label: '平均在馆率', value: averageCrowd.value, suffix: '%' },
  { label: '舒适点位', value: calmVenues.value, suffix: '' }
])
const journeySteps = computed(() => [
  { title: '早场入园', value: '08:30', copy: '优先选择核心场馆早场，减少排队和安检等待。' },
  { title: '主题串联', value: '3 条', copy: '中轴线、博物馆、胡同漫游三类路线拆分清晰。' },
  { title: '客流判断', value: `${averageCrowd.value}%`, copy: '结合预约余量和在馆率，给出更稳的出行节奏。' }
])

const getCrowdTone = (crowd) => {
  if (crowd >= 80) return '#8f3a32'
  if (crowd < 60) return '#84a889'
  return '#bfa276'
}

const getCrowdProgressStyle = (crowd) => ({
  '--progress-value': `${Math.min(crowd, 100)}%`,
  '--progress-color': getCrowdTone(crowd)
})

const getRemainingProgressStyle = (venue) => {
  const availability = venue.capacity ? Math.min(Math.round((venue.remaining / venue.capacity) * 100), 100) : 0
  return {
    '--progress-value': `${availability}%`,
    '--progress-color': getCrowdTone(venue.crowd)
  }
}

const setCounterValue = (element, value) => {
  element.textContent = `${Math.round(value).toLocaleString('zh-CN')}${element.dataset.suffix || ''}`
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
      const { isDesktop, isMobile, reduceMotion } = context.conditions
      const q = gsap.utils.selector(root)
      const revealTargets = q('[data-reveal], [data-card]')

      if (reduceMotion) {
        gsap.set(revealTargets, { autoAlpha: 1, y: 0, clearProps: 'transform' })
        q('[data-counter]').forEach((element) => setCounterValue(element, Number(element.dataset.count || 0)))
        return
      }

      gsap.set(revealTargets, { autoAlpha: 0, y: isMobile ? 18 : 34 })
      gsap.set(q('[data-motion-line]'), { scaleY: 0, transformOrigin: 'top center' })

      gsap
        .timeline({ defaults: { duration: 0.72, ease: 'power3.out' } })
        .fromTo(q('[data-hero]'), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.08 })
        .fromTo(q('[data-hero-panel]'), { autoAlpha: 0, y: 24, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1 }, '<0.18')

      ScrollTrigger.batch(revealTargets, {
        start: 'top 84%',
        once: true,
        interval: 0.08,
        batchMax: () => (isMobile ? 2 : 4),
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
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
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true
          },
          onUpdate: () => setCounterValue(element, counter.value)
        })
      })

      gsap.to(q('[data-motion-line]'), {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: q('[data-scroll-story]')[0],
          start: 'top 72%',
          end: 'bottom 38%',
          scrub: 0.8
        }
      })

      if (isDesktop) {
        gsap.to(q('[data-parallax]'), {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: q('[data-parallax-wrap]')[0],
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

onMounted(async () => {
  venues.value = await getVenues()
  await nextTick()
  initMotion()
  ScrollTrigger.refresh()
})

onUnmounted(() => {
  cleanupMotion?.()
})
</script>

<template>
  <main ref="pageRef" class="page-shell venues-page motion-page">
    <section class="venue-hero">
      <div class="page-title">
        <span class="eyebrow" data-hero>北京景点推荐</span>
        <h1 data-hero>热门与小众文旅地点</h1>
        <p data-hero>覆盖故宫、天坛、颐和园、国家博物馆、首都博物馆、大运河博物馆、中国美术馆、胡同 city walk 等北京文旅场景。</p>
      </div>

      <aside class="venue-signal glass-panel" data-hero-panel>
        <span class="glass-badge">今日判断</span>
        <strong>
          <span data-counter :data-count="venues.length">{{ venues.length }}</span>
          个地点
        </strong>
        <p>结合预约余量、在馆率和主题标签，把适合立即出发的地点前置。</p>
        <div class="signal-grid">
          <span v-for="stat in signalStats" :key="stat.label" class="signal-metric">
            <b data-counter :data-count="stat.value" :data-suffix="stat.suffix">{{ stat.value }}{{ stat.suffix }}</b>
            {{ stat.label }}
          </span>
        </div>
      </aside>
    </section>

    <section class="venue-journey glass-panel" data-scroll-story data-reveal>
      <div class="journey-copy">
        <span class="glass-badge">路线节奏</span>
        <h2>从预约到离馆的低干扰决策</h2>
        <p>把地点推荐拆成时间、主题和客流三段判断，适合快速做出当天参观选择。</p>
      </div>
      <div class="journey-steps">
        <span class="journey-line" data-motion-line></span>
        <article v-for="step in journeySteps" :key="step.title" data-reveal>
          <strong>{{ step.value }}</strong>
          <h3>{{ step.title }}</h3>
          <p>{{ step.copy }}</p>
        </article>
      </div>
      <div class="journey-image" data-parallax-wrap>
        <img v-if="venues[0]" data-parallax :src="venues[0].image" :alt="venues[0].name" />
      </div>
    </section>

    <section class="venue-grid">
      <article v-for="venue in venues" :key="venue.id" class="venue-card glass-card" data-card>
        <div class="image-frame">
          <img :src="venue.image" :alt="venue.name" />
        </div>
        <div class="venue-body">
          <div class="venue-meta">
            <span class="venue-type">{{ venue.type }}</span>
            <span class="location-badge">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 14s5-4.6 5-8.2A5 5 0 0 0 3 5.8C3 9.4 8 14 8 14Z" />
                <circle cx="8" cy="5.8" r="1.8" />
              </svg>
              {{ venue.area }}
            </span>
          </div>
          <h2>{{ venue.name }}</h2>
          <p>{{ venue.intro }}</p>
          <div class="tag-row">
            <span v-for="tag in venue.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="venue-stats">
            <div class="stat-block">
              <span>预约余量</span>
              <strong>{{ venue.remaining.toLocaleString('zh-CN') }}</strong>
              <i class="progress-track" :style="getRemainingProgressStyle(venue)"></i>
            </div>
            <div class="stat-block">
              <span>在馆率</span>
              <strong>{{ venue.crowd }}%</strong>
              <i class="progress-track" :style="getCrowdProgressStyle(venue.crowd)"></i>
            </div>
          </div>
          <router-link class="venue-action liquid-button" :to="`/reservation/${venue.id}`">查看预约建议</router-link>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.venues-page {
  width: min(1180px, calc(100% - 32px));
  padding-top: 126px;
}

.venue-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 22px;
  align-items: stretch;
  margin-bottom: 22px;
}

.venues-page .page-title {
  margin-bottom: 0;
}

.venues-page .page-title h1 {
  font-size: clamp(38px, 5.4vw, 68px);
  line-height: 1.05;
}

.venues-page .page-title p {
  max-width: 650px;
  font-size: 15px;
  line-height: 1.72;
}

.venue-signal {
  padding: 22px;
  border-radius: 22px;
}

.venue-signal strong {
  display: block;
  margin: 14px 0 8px;
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: 16px;
  padding: 12px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.018)),
    rgba(4, 13, 24, 0.24);
}

.signal-metric {
  position: relative;
  display: grid;
  gap: 5px;
  min-height: 58px;
  align-content: center;
  padding: 4px 12px;
  color: var(--faint);
  font-size: 12px;
  text-align: center;
}

.signal-metric:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-50%);
}

.signal-metric b {
  color: var(--text);
  font-family: "Inter", "DIN Alternate", "PingFang SC", system-ui, sans-serif;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 0 18px rgba(212, 175, 55, 0.16);
}

.venue-journey {
  display: grid;
  grid-template-columns: minmax(240px, 0.84fr) minmax(260px, 1fr) minmax(240px, 0.86fr);
  gap: 20px;
  align-items: stretch;
  margin-bottom: 22px;
  padding: 22px;
  border-radius: 22px;
  overflow: hidden;
}

.journey-copy h2 {
  margin: 14px 0 10px;
  font-size: clamp(24px, 3.2vw, 34px);
  line-height: 1.1;
}

.journey-steps {
  position: relative;
  display: grid;
  gap: 16px;
}

.journey-line {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 8px;
  width: 1px;
  background: rgba(255, 215, 0, 0.2);
  opacity: 1;
}

.journey-steps article {
  position: relative;
  padding-left: 28px;
}

.journey-steps article::before {
  content: "";
  position: absolute;
  top: 9px;
  left: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 14px rgba(212, 175, 55, 0.34);
}

.journey-steps strong {
  color: #d4af37;
  font-size: 22px;
  font-weight: 700;
  text-shadow: 0 0 13px rgba(212, 175, 55, 0.36);
}

.journey-steps h3 {
  margin: 6px 0;
  font-size: 18px;
}

.journey-image {
  min-height: 220px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(234, 244, 255, 0.18);
}

.journey-image img {
  width: 100%;
  height: 118%;
  object-fit: cover;
}

.venue-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.venue-card .image-frame {
  width: 100%;
  height: 220px;
}

.venue-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-body {
  padding: 20px;
}

.venue-card {
  will-change: transform;
}

.venue-card:hover,
.venue-card:focus-within {
  border-color: rgba(234, 244, 255, 0.38);
  box-shadow:
    0 34px 82px rgba(0, 0, 0, 0.48),
    0 0 34px rgba(191, 162, 118, 0.14);
  transform: translateY(-4px);
}

.venue-card:hover img,
.venue-card:focus-within img {
  transform: scale(1.035);
}

.venue-card img,
.venue-card,
.venue-action {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.venue-meta,
.venue-stats,
.tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.venue-meta {
  justify-content: space-between;
  font-size: 13px;
}

.venue-type {
  color: rgba(246, 242, 234, 0.58);
}

.location-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #bfa276;
  white-space: nowrap;
  text-shadow: 0 0 12px rgba(191, 162, 118, 0.18);
}

.location-badge svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.35;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
}

h2 {
  margin: 10px 0 8px;
  font-family: "ZQKNBCGPST", serif;
  font-size: 24px;
  line-height: 1.12;
}

p {
  color: var(--muted);
  line-height: 1.62;
}

.tag-row {
  margin: 14px 0;
  gap: 7px;
}

.tag-row span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1;
}

.venue-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
  color: var(--faint);
}

.stat-block {
  display: grid;
  gap: 7px;
}

.stat-block span {
  font-size: 12px;
}

.stat-block strong {
  color: var(--text);
  font-size: 20px;
  font-family: "Inter", "DIN Alternate", "PingFang SC", system-ui, sans-serif;
  font-weight: 760;
  line-height: 1;
}

.progress-track {
  position: relative;
  display: block;
  width: 100%;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.11);
}

.progress-track::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--progress-value);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), var(--progress-color));
  box-shadow: 0 0 12px color-mix(in srgb, var(--progress-color) 58%, transparent);
  transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1), background 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.venue-action.liquid-button {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  box-shadow: none;
}

.venue-action.liquid-button:hover {
  transform: none;
  box-shadow: none;
}

.venue-card:hover .venue-action.liquid-button,
.venue-card:focus-within .venue-action.liquid-button {
  background: #fff;
  border-color: #fff;
  color: #060606;
}

@media (max-width: 760px) {
  .venues-page {
    width: min(100% - 20px, 1180px);
    padding-top: 146px;
  }

  .venue-hero,
  .venue-journey {
    grid-template-columns: 1fr;
  }

  .venue-signal,
  .venue-journey {
    padding: 18px;
    border-radius: 22px;
  }

  .signal-grid {
    grid-template-columns: 1fr;
  }

  .signal-metric:not(:last-child)::after {
    top: auto;
    right: 22px;
    bottom: 0;
    left: 22px;
    width: auto;
    height: 1px;
    transform: none;
  }

  .venue-grid {
    grid-template-columns: 1fr;
  }
}
</style>
