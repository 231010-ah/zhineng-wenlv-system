<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getRecommendations, getTrafficTips, getVenues } from '../api/tourism'

gsap.registerPlugin(ScrollTrigger)

const homeRoot = ref(null)
const venues = ref([])
const traffic = ref(null)
const recommendations = ref([])
const animatedStats = ref({
  crowd: 0,
  recommendations: 0
})

const abilityCards = [
  {
    title: '北京景点推荐',
    text: '覆盖故宫、天坛、颐和园、圆明园、国家博物馆、首都博物馆、大运河博物馆、798、首钢园和中轴线景点。'
  },
  {
    title: '场馆预约建议',
    text: '结合时间、兴趣、人数和出行方式，输出推荐场馆、适合人群、开放时间、游览时长和预约注意事项。'
  },
  {
    title: '个性化路线规划',
    text: '支持一日游、两日游、周末游、亲子研学、博物馆、古都文化、胡同 city walk、夜游、非遗和红色文化路线。'
  },
  {
    title: 'AI 兴趣推荐',
    text: '根据历史文化、古建筑、博物馆、艺术展览、非遗体验、亲子研学、胡同文化、美食探店和摄影打卡生成推荐。'
  }
]

const interestTags = ['历史文化', '古建筑', '博物馆', '艺术展览', '非遗体验', '亲子研学', '胡同文化', '美食探店', '城市漫游', '摄影打卡', '夜游经济', '红色文化']

const trafficMetrics = computed(() => {
  const series = traffic.value?.series || []
  const groups = [
    { key: 'history', label: '历史文化' },
    { key: 'art', label: '艺术展览' },
    { key: 'science', label: '研学场馆' },
    { key: 'theater', label: '夜游演艺' }
  ]

  return groups.map((group) => ({
    ...group,
    value: series.reduce((peak, item) => Math.max(peak, item[group.key] || 0), 0)
  }))
})

let animationContext
let mediaContext
let hoverCleanups = []

const clearHoverAnimations = () => {
  hoverCleanups.forEach((cleanup) => cleanup())
  hoverCleanups = []
}

const bindHoverMotion = (selector, enterVars, leaveVars) => {
  gsap.utils.toArray(selector, homeRoot.value).forEach((element) => {
    const onEnter = () => gsap.to(element, { ...enterVars, overwrite: 'auto' })
    const onLeave = () => gsap.to(element, { ...leaveVars, overwrite: 'auto' })

    element.addEventListener('mouseenter', onEnter)
    element.addEventListener('mouseleave', onLeave)
    element.addEventListener('focusin', onEnter)
    element.addEventListener('focusout', onLeave)
    hoverCleanups.push(() => {
      element.removeEventListener('mouseenter', onEnter)
      element.removeEventListener('mouseleave', onLeave)
      element.removeEventListener('focusin', onEnter)
      element.removeEventListener('focusout', onLeave)
    })
  })
}

const animateStats = () => {
  const crowd = traffic.value?.overview?.averageCrowd || 0
  const recommendationCount = recommendations.value.length || 0

  if (!crowd && !recommendationCount) return

  const counter = { crowd: 0, recommendations: 0 }
  gsap.to(counter, {
    crowd,
    recommendations: recommendationCount,
    duration: 1.25,
    ease: 'power2.out',
    snap: { crowd: 1, recommendations: 1 },
    onUpdate: () => {
      animatedStats.value = {
        crowd: counter.crowd,
        recommendations: counter.recommendations
      }
    },
    scrollTrigger: {
      trigger: '.stats-section',
      start: 'top 76%',
      once: true
    }
  })
}

const setupMotion = () => {
  if (!homeRoot.value) return

  animationContext?.revert()
  mediaContext?.revert()
  clearHoverAnimations()

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finalCrowd = traffic.value?.overview?.averageCrowd || 0
  const finalRecommendations = recommendations.value.length || 0

  if (reduceMotion) {
    animatedStats.value = {
      crowd: finalCrowd,
      recommendations: finalRecommendations
    }
    gsap.set(homeRoot.value.querySelectorAll('.reveal-item'), { autoAlpha: 1, y: 0, scale: 1 })
    return
  }

  animationContext = gsap.context(() => {
    const q = gsap.utils.selector(homeRoot.value)

    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8
    })

    gsap.set(q('.reveal-item'), {
      autoAlpha: 0,
      y: 42,
      scale: 0.985
    })
    gsap.set(q('.chart-fill'), {
      scaleX: 0,
      transformOrigin: 'left center'
    })

    mediaContext = gsap.matchMedia()
    mediaContext.add(
      {
        isDesktop: '(min-width: 861px)',
        isMobile: '(max-width: 860px)'
      },
      ({ conditions }) => {
        const isMobile = conditions.isMobile

        gsap.timeline({
          defaults: {
            duration: isMobile ? 0.62 : 0.9,
            ease: 'power3.out'
          }
        })
          .from(q('.cosmic-backdrop'), { autoAlpha: 0, scale: 1.04, duration: 1.2 })
          .from(q('.cosmic-slider-top'), { autoAlpha: 0, y: isMobile ? -14 : -36, rotation: -8 }, '<0.05')
          .from(q('.cosmic-slider-bottom'), { autoAlpha: 0, y: isMobile ? 14 : 36, rotation: 7 }, '<0.05')
          .from(q('.cosmic-eyebrow, .cosmic-title, .cosmic-role, .cosmic-copy, .cosmic-actions'), {
            autoAlpha: 0,
            y: (index) => [12, 32, 18, 14, 12][index] || 14,
            stagger: 0.08
          }, '<0.18')
          .from(q('.scroll-cue'), { autoAlpha: 0, y: -8, duration: 0.5 }, '-=0.24')

        ScrollTrigger.batch(q('.reveal-item'), {
          start: 'top 84%',
          once: true,
          interval: 0.08,
          batchMax: isMobile ? 3 : 6,
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: isMobile ? 0.62 : 0.78,
              stagger: 0.08,
              overwrite: true
            })
          }
        })

        gsap.utils.toArray('.cosmic-section, .cosmic-explorations', homeRoot.value).forEach((section) => {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 72%',
            end: 'bottom 28%',
            toggleClass: { targets: section, className: 'module-active' }
          })
        })

        if (!isMobile) {
          gsap.to(q('.cosmic-backdrop'), {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: q('.cosmic-hero')[0],
              start: 'top top',
              end: 'bottom top',
              scrub: 1
            }
          })

          gsap.to(q('.cosmic-slider-top'), {
            xPercent: -8,
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: q('.cosmic-hero')[0],
              start: 'top top',
              end: 'bottom top',
              scrub: 1
            }
          })

          gsap.to(q('.cosmic-slider-bottom'), {
            xPercent: 8,
            yPercent: -9,
            ease: 'none',
            scrollTrigger: {
              trigger: q('.cosmic-hero')[0],
              start: 'top top',
              end: 'bottom top',
              scrub: 1
            }
          })

          gsap.to(q('.pierce-column:first-child'), {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: q('.cosmic-explorations')[0],
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          })

          gsap.to(q('.pierce-column:nth-child(2)'), {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: q('.cosmic-explorations')[0],
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          })
        }

        gsap.timeline({
          scrollTrigger: {
            trigger: q('.cosmic-explorations')[0],
            start: 'top 70%',
            end: 'bottom 32%',
            scrub: isMobile ? 0.65 : 1.1
          }
        })
          .fromTo(q('.exploration-center'), {
            autoAlpha: 0.72,
            scale: 0.965
          }, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35
          })
          .to(q('.tag-cloud-cosmic span'), {
            y: isMobile ? -2 : -8,
            color: '#f5f5f5',
            borderColor: 'rgba(137, 170, 204, 0.56)',
            stagger: { amount: 0.42, from: 'center' },
            duration: 0.65
          }, '<0.15')

        gsap.to(q('.chart-fill'), {
          scaleX: 1,
          duration: isMobile ? 0.7 : 0.95,
          stagger: 0.09,
          scrollTrigger: {
            trigger: q('.insight-panel')[0],
            start: 'top 80%',
            once: true
          }
        })

        animateStats()

        ScrollTrigger.refresh()
      }
    )

    bindHoverMotion('.cosmic-button', {
      y: -3,
      scale: 1.045,
      duration: 0.22,
      ease: 'power2.out'
    }, {
      y: 0,
      scale: 1,
      duration: 0.24,
      ease: 'power2.out'
    })

    bindHoverMotion('.bento-card, .journal-pill, .stats-grid article, .insight-bar', {
      y: -6,
      scale: 1.012,
      duration: 0.24,
      ease: 'power2.out'
    }, {
      y: 0,
      scale: 1,
      duration: 0.28,
      ease: 'power2.out'
    })
  }, homeRoot.value)
}

onMounted(async () => {
  const [venueList, trafficTips, recommendationList] = await Promise.all([
    getVenues(),
    getTrafficTips(),
    getRecommendations()
  ])

  venues.value = venueList.slice(0, 4)
  traffic.value = trafficTips
  recommendations.value = recommendationList

  await nextTick()
  setupMotion()
})

onBeforeUnmount(() => {
  clearHoverAnimations()
  mediaContext?.revert()
  animationContext?.revert()
})
</script>

<template>
  <main ref="homeRoot" class="cosmic-home" aria-label="北京文旅智能推荐助手">
    <section class="cosmic-hero">
      <div class="cosmic-backdrop" aria-hidden="true"></div>
      <div class="cosmic-slider cosmic-slider-top" aria-hidden="true">
        <div class="cosmic-track slide-left">
          <article v-for="venue in [...venues, ...venues]" :key="`top-${venue.id}`" class="cosmic-slide-card">
            <img :src="venue.image" :alt="venue.name" />
            <span>{{ venue.name }}</span>
          </article>
        </div>
      </div>
      <div class="cosmic-slider cosmic-slider-bottom" aria-hidden="true">
        <div class="cosmic-track slide-right">
          <article v-for="ability in [...abilityCards, ...abilityCards]" :key="`bottom-${ability.title}`" class="cosmic-slide-chip">
            {{ ability.title }}
          </article>
        </div>
      </div>

      <div class="cosmic-hero-content">
        <p class="cosmic-eyebrow">BEIJING CULTURE '26</p>
        <h1 class="cosmic-title">
          懂北京，
          <span>也懂你的</span>
          文旅行程。
        </h1>
        <p class="cosmic-role">
          A <span>北京文旅智能推荐助手</span> lives in Beijing.
        </p>
        <p class="cosmic-copy">
          熟悉北京文化、旅游、博物馆、展览、历史街区、非遗体验、城市漫游和亲子研学路线。根据你的时间、兴趣、人数和出行方式，生成推荐、讲解、路线规划、预约建议和个性化行程方案。
        </p>
        <div class="cosmic-actions">
          <router-link class="cosmic-button outline secondary" to="/venues">查看北京景点</router-link>
          <router-link class="cosmic-button solid primary" to="/recommendations">生成兴趣推荐</router-link>
        </div>
      </div>

      <div class="scroll-cue" aria-hidden="true">
        <span>SCROLL</span>
        <i></i>
      </div>
    </section>

    <section class="cosmic-section">
      <div class="cosmic-section-head reveal-item">
        <div>
          <p class="cosmic-label">Selected Work</p>
          <h2>热门 <span>景点推荐</span></h2>
          <p>覆盖故宫、天坛、颐和园、国家博物馆、首都博物馆、大运河博物馆、中国美术馆、胡同 city walk 等北京文旅场景。</p>
        </div>
        <router-link class="cosmic-button outline desktop-only" to="/venues">View all work</router-link>
      </div>

      <div class="bento-grid">
        <article v-for="(venue, index) in venues" :key="venue.id" class="bento-card reveal-item" :class="index % 3 === 0 ? 'wide' : ''">
          <img :src="venue.image" :alt="venue.name" />
          <div class="bento-overlay">
            <span>View — <em>{{ venue.name }}</em></span>
          </div>
          <div class="bento-caption">
            <p>{{ venue.type }}</p>
            <h3>{{ venue.name }}</h3>
          </div>
        </article>
      </div>
    </section>

    <section class="cosmic-section journal-section">
      <div class="cosmic-section-head reveal-item">
        <div>
          <p class="cosmic-label">Core Capabilities</p>
          <h2>核心 <span>能力</span></h2>
          <p>推荐、讲解、预约、路线规划一体化。支持一日游、两日游、周末游、亲子研学、博物馆路线、古都文化路线、胡同 city walk、夜游北京、非遗体验和红色文化路线。</p>
        </div>
      </div>
      <div class="journal-list">
        <article v-for="ability in abilityCards" :key="ability.title" class="journal-pill reveal-item">
          <strong>{{ ability.title }}</strong>
          <span>{{ ability.text }}</span>
        </article>
      </div>
    </section>

    <section class="cosmic-explorations">
      <div class="exploration-center reveal-item">
        <p class="cosmic-label">Explorations</p>
        <h2>Visual <span>playground</span></h2>
        <p>面向北京文化、旅游、博物馆、展览、历史街区、非遗体验、城市漫游和亲子研学，为用户提供推荐、讲解、路线规划、预约建议和个性化行程方案。</p>
        <div class="tag-cloud-cosmic">
          <span v-for="tag in interestTags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="pierce-gallery" aria-hidden="true">
        <div class="pierce-column slide-left">
          <div v-for="venue in [...venues, ...venues]" :key="`left-${venue.id}`" class="pierce-card">
            <img :src="venue.image" :alt="venue.name" />
          </div>
        </div>
        <div class="pierce-column slide-right">
          <div v-for="venue in [...venues].reverse().concat(venues)" :key="`right-${venue.id}`" class="pierce-card">
            <img :src="venue.image" :alt="venue.name" />
          </div>
        </div>
      </div>
    </section>

    <section class="cosmic-section stats-section">
      <div class="stats-grid">
        <article class="reveal-item">
          <strong v-if="traffic?.overview.averageCrowd"><span class="stat-number">{{ animatedStats.crowd }}</span>%</strong>
          <strong v-else>--</strong>
          <span>当前整体在馆率</span>
        </article>
        <article class="reveal-item">
          <strong>{{ traffic?.overview.bestSlot || '--' }}</strong>
          <span>推荐预约时段</span>
        </article>
        <article class="reveal-item">
          <strong v-if="recommendations.length"><span class="stat-number">{{ animatedStats.recommendations }}</span></strong>
          <strong v-else>--</strong>
          <span>AI 兴趣推荐</span>
        </article>
      </div>
      <div class="insight-panel reveal-item" aria-label="重点文旅场景热度峰值">
        <div class="insight-copy">
          <p class="cosmic-label">Live Culture Flow</p>
          <h3>重点文旅场景热度峰值</h3>
          <span>根据当日客流序列生成，滚动进入视口后逐条呈现。</span>
        </div>
        <div class="insight-chart">
          <article v-for="metric in trafficMetrics" :key="metric.key" class="insight-bar">
            <div>
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}%</strong>
            </div>
            <i>
              <b class="chart-fill" :style="{ width: `${metric.value}%` }"></b>
            </i>
          </article>
        </div>
      </div>
      <p class="cosmic-copy wide-copy">{{ traffic?.overview.warning }}</p>
      <router-link class="cosmic-button solid" to="/traffic">查看预测看板</router-link>
    </section>
  </main>
</template>

<style scoped>
.cosmic-home {
  --cosmic-bg: #050505;
  --cosmic-surface: #14100f;
  --cosmic-text: #f5f5f5;
  --cosmic-muted: #8c8c8c;
  --cosmic-stroke: rgba(229, 205, 151, 0.16);
  --cosmic-gradient: linear-gradient(90deg, #d8b86c 0%, #f1efe7 46%, #7bb2bd 100%);
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(circle at top, #140505 0%, #050505 60%, #000000 100%),
    var(--cosmic-bg);
  color: var(--cosmic-text);
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.cosmic-home::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 10%, rgba(216, 184, 108, 0.08), transparent 28rem),
    linear-gradient(115deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 18px),
    linear-gradient(180deg, rgba(109, 37, 27, 0.16), transparent 34%, rgba(0, 0, 0, 0.42));
  background-size: auto, 18px 18px, auto;
  opacity: 0.42;
  mix-blend-mode: screen;
}

.cosmic-hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(112px, 15vh, 140px) 24px clamp(40px, 7vh, 70px);
  isolation: isolate;
}

.cosmic-backdrop {
  position: absolute;
  inset: 0;
  z-index: -3;
  background:
    radial-gradient(circle at 50% 38%, rgba(216, 184, 108, 0.13), transparent 24rem),
    radial-gradient(circle at 18% 18%, rgba(126, 39, 31, 0.24), transparent 22rem),
    radial-gradient(circle at 82% 70%, rgba(123, 178, 189, 0.11), transparent 20rem),
    radial-gradient(circle at top, #140505 0%, #050505 60%, #000000 100%);
}

.cosmic-backdrop::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background:
    radial-gradient(circle, rgba(255, 245, 214, 0.38) 0 0.7px, transparent 1.2px),
    linear-gradient(90deg, rgba(255, 245, 214, 0.05) 0 1px, transparent 1px 52px),
    linear-gradient(0deg, rgba(255, 245, 214, 0.035) 0 1px, transparent 1px 52px);
  background-size: 48px 48px, 52px 52px, 52px 52px;
  mask-image: radial-gradient(circle at center, black, transparent 70%);
}

.cosmic-backdrop,
.cosmic-hero-content,
.scroll-cue,
.pierce-column,
.exploration-center,
.reveal-item,
.chart-fill {
  will-change: transform, opacity;
}

.cosmic-slider {
  position: absolute;
  left: -10vw;
  width: 120vw;
  z-index: -1;
  overflow: hidden;
  opacity: 0.38;
  mask-image: linear-gradient(90deg, transparent, black 14%, black 86%, transparent);
  transform: rotate(-6deg);
  will-change: transform, opacity;
}

.cosmic-slider-top {
  top: clamp(10px, 4vh, 42px);
}

.cosmic-slider-bottom {
  bottom: clamp(24px, 6vh, 60px);
  transform: rotate(5deg);
}

.cosmic-track {
  display: flex;
  width: max-content;
  gap: 16px;
  will-change: transform;
}

.slide-left {
  animation: cosmic-slide-left 28s linear infinite;
}

.slide-right {
  animation: cosmic-slide-right 30s linear infinite;
}

.cosmic-slide-card,
.cosmic-slide-chip {
  flex: 0 0 auto;
  border: 1px solid rgba(229, 205, 151, 0.14);
  background: rgba(20, 10, 9, 0.72);
  backdrop-filter: blur(14px);
}

.cosmic-slide-card {
  width: clamp(154px, 14vw, 220px);
  border-radius: 22px;
  overflow: hidden;
}

.cosmic-slide-card img {
  width: 100%;
  height: clamp(86px, 8vw, 120px);
  object-fit: cover;
  display: block;
}

.cosmic-slide-card span,
.cosmic-slide-chip {
  display: block;
  padding: 9px 12px;
  color: var(--cosmic-text);
  font-size: 11px;
}

.cosmic-slide-chip {
  border-radius: 999px;
  padding: 10px 16px;
}

.cosmic-hero-content {
  position: relative;
  z-index: 2;
  width: min(720px, 100%);
  text-align: center;
}

.cosmic-eyebrow,
.cosmic-label {
  margin: 0 0 28px;
  color: #8c8c8c;
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.cosmic-title,
.cosmic-section h2,
.exploration-center h2 {
  margin: 0;
  font-family: "ZQKNBCGPST", serif;
  font-style: italic;
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0;
}

.cosmic-title {
  font-size: clamp(58px, 9.6vw, 132px);
  color: #fbf6e9;
  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.12),
    0 0 28px rgba(215, 180, 106, 0.1),
    0 18px 40px rgba(0, 0, 0, 0.42);
}

.cosmic-title span,
.cosmic-section h2 span,
.exploration-center h2 span {
  display: block;
}

.cosmic-role {
  margin: 18px 0 10px;
  color: var(--cosmic-muted);
  font-size: clamp(17px, 1.7vw, 23px);
}

.cosmic-role span {
  color: var(--cosmic-text);
  font-family: "ZQKNBCGPST", serif;
  font-style: italic;
}

.cosmic-copy {
  width: min(590px, 100%);
  margin: 0 auto;
  color: var(--cosmic-muted);
  line-height: 1.65;
  font-size: 14px;
}

.cosmic-actions {
  display: inline-flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: clamp(24px, 4vh, 34px);
}

.cosmic-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  isolation: isolate;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
  will-change: transform;
}

.cosmic-button.solid {
  border: 1px solid rgba(229, 205, 151, 0.54);
  background:
    linear-gradient(135deg, rgba(241, 239, 231, 0.96), rgba(216, 184, 108, 0.86) 48%, rgba(123, 178, 189, 0.82));
  color: #120807;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 14px 34px rgba(0, 0, 0, 0.34),
    0 0 34px rgba(216, 184, 108, 0.18);
}

.cosmic-button.outline {
  border: 1px solid rgba(245, 245, 245, 0.34);
  background: rgba(5, 5, 5, 0.48);
  color: var(--cosmic-text);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 12px 28px rgba(0, 0, 0, 0.24);
}

.cosmic-button.primary::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  padding: 1px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, transparent 0 28%, rgba(255, 252, 231, 0.94), rgba(216, 184, 108, 0.86), transparent 58% 100%);
  pointer-events: none;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-beam 3.8s linear infinite;
}

.cosmic-button.outline:hover,
.cosmic-button.solid:hover {
  border-color: rgba(245, 245, 245, 0.62);
  color: var(--cosmic-text);
  background:
    linear-gradient(rgba(5, 5, 5, 0.84), rgba(5, 5, 5, 0.84)) padding-box,
    var(--cosmic-gradient) border-box;
}

.cosmic-button.primary:hover {
  color: #090605;
  border-color: rgba(255, 252, 231, 0.76);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 18px 42px rgba(0, 0, 0, 0.38),
    0 0 42px rgba(216, 184, 108, 0.3);
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  gap: 10px;
  color: var(--cosmic-muted);
  font-size: 11px;
  letter-spacing: 0.2em;
}

.scroll-cue i {
  position: relative;
  display: block;
  width: 1px;
  height: 42px;
  overflow: hidden;
  background: var(--cosmic-stroke);
}

.scroll-cue i::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--cosmic-gradient);
  animation: scroll-down 1.5s ease-in-out infinite;
}

.cosmic-section {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 88px 0;
  transition: filter 420ms ease, opacity 420ms ease;
}

.cosmic-section.module-active,
.cosmic-explorations.module-active {
  filter: saturate(1.08);
}

.cosmic-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 36px;
}

.cosmic-section h2,
.exploration-center h2 {
  font-size: clamp(48px, 8vw, 104px);
  color: #fbf6e9;
  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.12),
    0 0 24px rgba(215, 180, 106, 0.08);
}

.cosmic-section-head p:last-child,
.exploration-center p {
  max-width: 520px;
  color: var(--cosmic-muted);
  line-height: 1.8;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

.bento-card {
  position: relative;
  grid-column: span 5;
  min-height: 420px;
  overflow: hidden;
  border: 1px solid rgba(229, 205, 151, 0.16);
  border-radius: 8px;
  background: var(--cosmic-surface);
  transform-origin: center;
  will-change: transform;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.bento-card.wide {
  grid-column: span 7;
}

.bento-card img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  display: block;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.bento-card:hover img {
  transform: scale(1.065);
}

.bento-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.12;
  mix-blend-mode: multiply;
  transition: opacity 0.5s ease;
}

.bento-card:hover::after {
  opacity: 0;
}

.bento-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  opacity: 0;
  background: transparent;
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.bento-card:hover .bento-overlay {
  opacity: 0;
}

.bento-overlay span {
  padding: 12px 18px;
  border-radius: 999px;
  background:
    linear-gradient(#fff, #fff) padding-box,
    var(--cosmic-gradient) border-box;
  border: 2px solid transparent;
  color: #0a0a0a;
  font-weight: 600;
}

.bento-overlay em {
  font-family: "ZQKNBCGPST", serif;
}

.bento-caption {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 20px;
  z-index: 3;
  color: white;
  text-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
}

.bento-caption p {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.72);
}

.bento-caption h3 {
  margin: 0;
  font-size: clamp(26px, 4vw, 48px);
  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.12),
    0 0 24px rgba(215, 180, 106, 0.1),
    0 8px 26px rgba(0, 0, 0, 0.48);
}

.journal-list {
  display: grid;
  gap: 14px;
}

.journal-pill {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 22px;
  border: 1px solid rgba(229, 205, 151, 0.15);
  border-radius: 999px;
  background: rgba(20, 10, 9, 0.34);
  transition: background 180ms ease, border-color 180ms ease;
  transform-origin: center;
  will-change: transform;
}

.journal-pill:hover {
  background: var(--cosmic-surface);
  border-color: rgba(216, 184, 108, 0.38);
}

.journal-pill strong {
  min-width: 150px;
}

.journal-pill span {
  color: var(--cosmic-muted);
  line-height: 1.6;
}

.cosmic-explorations {
  position: relative;
  min-height: 180svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 120px 20px;
}

.exploration-center {
  position: sticky;
  top: 18vh;
  z-index: 2;
  width: min(620px, 100%);
  text-align: center;
}

.exploration-center p {
  margin: 20px auto;
}

.tag-cloud-cosmic {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

.tag-cloud-cosmic span {
  border: 1px solid var(--cosmic-stroke);
  border-radius: 999px;
  padding: 7px 12px;
  color: var(--cosmic-muted);
  font-size: 12px;
  will-change: transform, color, border-color;
}

.pierce-gallery {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(48px, 14vw, 180px);
  align-items: center;
  padding: 0 8vw;
  opacity: 0.45;
  pointer-events: none;
  mask-image: linear-gradient(180deg, transparent, black 16%, black 84%, transparent);
}

.pierce-column {
  display: flex;
  gap: 24px;
  width: max-content;
}

.pierce-column:nth-child(2) {
  justify-self: end;
}

.pierce-card {
  width: clamp(180px, 20vw, 320px);
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--cosmic-stroke);
  border-radius: 30px;
  background: var(--cosmic-surface);
  transform: rotate(-4deg);
}

.pierce-column:nth-child(2) .pierce-card {
  transform: rotate(5deg);
}

.pierce-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 34px;
}

.stats-grid article {
  border-top: 1px solid var(--cosmic-stroke);
  padding-top: 18px;
  transform-origin: center;
  will-change: transform;
}

.stats-grid strong {
  display: block;
  font-family: "ZQKNBCGPST", serif;
  font-size: clamp(48px, 8vw, 92px);
  font-style: italic;
  font-weight: 400;
}

.stats-grid strong span {
  color: inherit;
}

.stats-grid span {
  color: var(--cosmic-muted);
}

.insight-panel {
  display: grid;
  grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
  gap: clamp(24px, 5vw, 68px);
  align-items: center;
  margin: 26px 0 34px;
  padding: clamp(22px, 4vw, 38px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 28px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(20, 20, 20, 0.48);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.insight-copy .cosmic-label {
  margin-bottom: 18px;
}

.insight-copy h3 {
  margin: 0 0 14px;
  font-family: "ZQKNBCGPST", serif;
  font-size: clamp(28px, 4vw, 54px);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
}

.insight-copy span {
  display: block;
  color: var(--cosmic-muted);
  line-height: 1.8;
}

.insight-chart {
  display: grid;
  gap: 18px;
}

.insight-bar {
  display: grid;
  gap: 10px;
  transform-origin: center;
  will-change: transform;
}

.insight-bar > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.insight-bar span {
  color: var(--cosmic-muted);
  font-size: 13px;
}

.insight-bar strong {
  color: var(--cosmic-text);
  font-size: 16px;
}

.insight-bar i {
  position: relative;
  display: block;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
}

.insight-bar b {
  position: absolute;
  inset: 0 auto 0 0;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(137, 170, 204, 0.92), rgba(245, 245, 245, 0.88));
  box-shadow: 0 0 28px rgba(137, 170, 204, 0.26);
}

.wide-copy {
  margin: 0 0 28px;
}

@keyframes cosmic-slide-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes cosmic-slide-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

@keyframes scroll-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(200%); }
}

@keyframes border-beam {
  to { transform: rotate(1turn); }
}

@media (max-width: 860px) {
  .cosmic-hero {
    min-height: 100svh;
    padding: 140px 18px 34px;
  }

  .cosmic-eyebrow {
    margin-bottom: 18px;
    letter-spacing: 0.18em;
  }

  .cosmic-hero-content {
    margin-top: -44px;
  }

  .cosmic-title {
    font-size: clamp(42px, 13vw, 76px);
  }

  .cosmic-role {
    margin: 10px 0 8px;
    font-size: 16px;
  }

  .cosmic-copy {
    display: -webkit-box;
    font-size: 13px;
    line-height: 1.5;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .cosmic-actions {
    margin-top: 16px;
  }

  .cosmic-button {
    min-height: 38px;
    padding: 0 18px;
    font-size: 13px;
  }

  .cosmic-slider-top {
    top: 10px;
  }

  .cosmic-slider-bottom {
    bottom: 12px;
  }

  .cosmic-slide-card {
    width: 128px;
    border-radius: 18px;
  }

  .cosmic-slide-card img {
    height: 70px;
  }

  .cosmic-slide-chip {
    padding: 8px 13px;
    font-size: 11px;
  }

  .cosmic-section-head,
  .journal-pill {
    align-items: flex-start;
    flex-direction: column;
  }

  .desktop-only {
    display: none;
  }

  .bento-card,
  .bento-card.wide {
    grid-column: 1 / -1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .insight-panel {
    grid-template-columns: 1fr;
    border-radius: 22px;
  }

  .cosmic-slider,
  .pierce-gallery {
    opacity: 0.24;
  }
}

@media (max-width: 720px) {
  .cosmic-hero {
    min-height: 100svh;
    padding-top: 132px;
  }

  .cosmic-eyebrow {
    margin-bottom: 12px;
  }
}

@media (max-width: 540px) {
  .cosmic-hero {
    min-height: 100svh;
    padding: 122px 16px 42px;
  }

  .cosmic-slider-top {
    top: 4px;
  }

  .cosmic-slider-bottom {
    bottom: 6px;
  }

  .cosmic-title {
    font-size: clamp(42px, 18vw, 72px);
  }

  .cosmic-hero-content {
    margin-top: -24px;
  }

  .cosmic-role {
    font-size: 16px;
  }

  .cosmic-copy {
    -webkit-line-clamp: 3;
  }

  .cosmic-actions {
    gap: 10px;
  }

  .scroll-cue {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-left,
  .slide-right,
  .scroll-cue i::after,
  .cosmic-button.primary::before {
    animation: none;
  }

  .cosmic-button,
  .bento-card img,
  .bento-card::after,
  .journal-pill,
  .cosmic-section {
    transition-duration: 1ms;
  }
}
</style>
