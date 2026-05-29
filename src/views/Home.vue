<script setup>
import { onMounted, ref } from 'vue'
import { getRecommendations, getTrafficTips, getVenues } from '../api/tourism'

const venues = ref([])
const traffic = ref(null)
const recommendations = ref([])

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

onMounted(async () => {
  venues.value = (await getVenues()).slice(0, 4)
  traffic.value = await getTrafficTips()
  recommendations.value = await getRecommendations()
})
</script>

<template>
  <main class="cosmic-home" aria-label="北京文旅智能推荐助手">
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
          <router-link class="cosmic-button solid" to="/venues">查看北京景点</router-link>
          <router-link class="cosmic-button outline" to="/recommendations">生成兴趣推荐</router-link>
        </div>
      </div>

      <div class="scroll-cue" aria-hidden="true">
        <span>SCROLL</span>
        <i></i>
      </div>
    </section>

    <section class="cosmic-section">
      <div class="cosmic-section-head">
        <div>
          <p class="cosmic-label">Selected Work</p>
          <h2>热门 <span>景点推荐</span></h2>
          <p>覆盖故宫、天坛、颐和园、国家博物馆、首都博物馆、大运河博物馆、中国美术馆、胡同 city walk 等北京文旅场景。</p>
        </div>
        <router-link class="cosmic-button outline desktop-only" to="/venues">View all work</router-link>
      </div>

      <div class="bento-grid">
        <article v-for="(venue, index) in venues" :key="venue.id" class="bento-card" :class="index % 3 === 0 ? 'wide' : ''">
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
      <div class="cosmic-section-head">
        <div>
          <p class="cosmic-label">Recent Thoughts</p>
          <h2>核心 <span>能力</span></h2>
          <p>推荐、讲解、预约、路线规划一体化。支持一日游、两日游、周末游、亲子研学、博物馆路线、古都文化路线、胡同 city walk、夜游北京、非遗体验和红色文化路线。</p>
        </div>
      </div>
      <div class="journal-list">
        <article v-for="ability in abilityCards" :key="ability.title" class="journal-pill">
          <strong>{{ ability.title }}</strong>
          <span>{{ ability.text }}</span>
        </article>
      </div>
    </section>

    <section class="cosmic-explorations">
      <div class="exploration-center">
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
        <article>
          <strong>{{ traffic?.overview.averageCrowd || '--' }}%</strong>
          <span>当前整体在馆率</span>
        </article>
        <article>
          <strong>{{ traffic?.overview.bestSlot || '--' }}</strong>
          <span>推荐预约时段</span>
        </article>
        <article>
          <strong>{{ recommendations.length || '--' }}</strong>
          <span>AI 兴趣推荐</span>
        </article>
      </div>
      <p class="cosmic-copy wide-copy">{{ traffic?.overview.warning }}</p>
      <router-link class="cosmic-button solid" to="/traffic">查看预测看板</router-link>
    </section>
  </main>
</template>

<style scoped>
.cosmic-home {
  --cosmic-bg: #0a0a0a;
  --cosmic-surface: #141414;
  --cosmic-text: #f5f5f5;
  --cosmic-muted: #878787;
  --cosmic-stroke: #202020;
  --cosmic-gradient: linear-gradient(90deg, #89aacc 0%, #4e85bf 100%);
  min-height: 100vh;
  overflow: hidden;
  background: var(--cosmic-bg);
  color: var(--cosmic-text);
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.cosmic-hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 128px 24px 80px;
  isolation: isolate;
}

.cosmic-backdrop {
  position: absolute;
  inset: 0;
  z-index: -3;
  background:
    radial-gradient(circle at 50% 42%, rgba(137, 170, 204, 0.22), transparent 22rem),
    radial-gradient(circle at 18% 18%, rgba(78, 133, 191, 0.22), transparent 20rem),
    radial-gradient(circle at 82% 70%, rgba(255, 255, 255, 0.1), transparent 18rem),
    linear-gradient(180deg, rgba(0, 0, 0, 0.1), #0a0a0a 88%);
}

.cosmic-backdrop::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.36;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0 1px, transparent 1.5px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at center, black, transparent 70%);
}

.cosmic-slider {
  position: absolute;
  left: -8vw;
  width: 116vw;
  z-index: -1;
  overflow: hidden;
  opacity: 0.42;
  mask-image: linear-gradient(90deg, transparent, black 14%, black 86%, transparent);
  transform: rotate(-6deg);
}

.cosmic-slider-top {
  top: 12%;
}

.cosmic-slider-bottom {
  bottom: 12%;
  transform: rotate(5deg);
}

.cosmic-track {
  display: flex;
  width: max-content;
  gap: 18px;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 20, 0.76);
  backdrop-filter: blur(14px);
}

.cosmic-slide-card {
  width: 220px;
  border-radius: 28px;
  overflow: hidden;
}

.cosmic-slide-card img {
  width: 100%;
  height: 124px;
  object-fit: cover;
  display: block;
}

.cosmic-slide-card span,
.cosmic-slide-chip {
  display: block;
  padding: 12px 14px;
  color: var(--cosmic-text);
  font-size: 12px;
}

.cosmic-slide-chip {
  border-radius: 999px;
  padding: 12px 18px;
}

.cosmic-hero-content {
  position: relative;
  z-index: 2;
  width: min(760px, 100%);
  text-align: center;
}

.cosmic-eyebrow,
.cosmic-label {
  margin: 0 0 28px;
  color: var(--cosmic-muted);
  font-size: 12px;
  letter-spacing: 0.3em;
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
  font-size: clamp(68px, 11vw, 154px);
}

.cosmic-title span,
.cosmic-section h2 span,
.exploration-center h2 span {
  display: block;
}

.cosmic-role {
  margin: 24px 0 14px;
  color: var(--cosmic-muted);
  font-size: clamp(18px, 2vw, 26px);
}

.cosmic-role span {
  color: var(--cosmic-text);
  font-family: "ZQKNBCGPST", serif;
  font-style: italic;
}

.cosmic-copy {
  width: min(560px, 100%);
  margin: 0 auto;
  color: var(--cosmic-muted);
  line-height: 1.8;
}

.cosmic-actions {
  display: inline-flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 42px;
}

.cosmic-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 26px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.cosmic-button:hover {
  transform: scale(1.05);
}

.cosmic-button.solid {
  background: var(--cosmic-text);
  color: var(--cosmic-bg);
}

.cosmic-button.outline {
  border: 2px solid var(--cosmic-stroke);
  background: var(--cosmic-bg);
  color: var(--cosmic-text);
}

.cosmic-button.outline:hover,
.cosmic-button.solid:hover {
  border-color: transparent;
  color: var(--cosmic-text);
  background:
    linear-gradient(var(--cosmic-bg), var(--cosmic-bg)) padding-box,
    var(--cosmic-gradient) border-box;
  border: 2px solid transparent;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 28px;
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
  border: 1px solid var(--cosmic-stroke);
  border-radius: 32px;
  background: var(--cosmic-surface);
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
  transition: transform 500ms ease;
}

.bento-card:hover img {
  transform: scale(1.05);
}

.bento-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.2;
  mix-blend-mode: multiply;
}

.bento-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  opacity: 0;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(18px);
  transition: opacity 260ms ease;
}

.bento-card:hover .bento-overlay {
  opacity: 1;
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
  border: 1px solid var(--cosmic-stroke);
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.3);
  transition: background 180ms ease;
}

.journal-pill:hover {
  background: var(--cosmic-surface);
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
}

.stats-grid strong {
  display: block;
  font-family: "ZQKNBCGPST", serif;
  font-size: clamp(48px, 8vw, 92px);
  font-style: italic;
  font-weight: 400;
}

.stats-grid span {
  color: var(--cosmic-muted);
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

@media (max-width: 860px) {
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
}
</style>
