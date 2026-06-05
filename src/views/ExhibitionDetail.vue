<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { exhibitions } from '../mock/exhibitions'
import { venues } from '../mock/venues'

const route = useRoute()

const exhibition = computed(() => exhibitions.find((item) => item.id === route.params.exhibitionId))
const venue = computed(() => venues.find((item) => item.id === exhibition.value?.venueId))
const featuredObject = computed(() => exhibition.value?.featuredObject)
const themeStyle = computed(() => ({
  '--detail-accent': exhibition.value?.theme?.accent || 'var(--cyan)',
  '--detail-accent-soft': exhibition.value?.theme?.accentSoft || 'rgba(158, 216, 223, 0.24)',
  '--detail-glow': exhibition.value?.theme?.glow || 'rgba(158, 216, 223, 0.18)',
  '--detail-surface': exhibition.value?.theme?.surface || '#111'
}))
const pageClasses = computed(() => ({
  [`is-${route.params.exhibitionId}`]: Boolean(route.params.exhibitionId)
}))
const backButtonLabel = computed(() => (route.params.exhibitionId === 'canal-civilization' ? '返航' : 'Back'))
const imageSrc = computed(() => featuredObject.value?.image || exhibition.value?.image)
const imageAlt = computed(() => featuredObject.value?.name || exhibition.value?.title || '特色物品图片')
const tags = computed(() => [
  venue.value?.name,
  venue.value?.area,
  exhibition.value?.theme?.name,
  exhibition.value?.date,
  venue.value?.type
].filter(Boolean))
const introParagraphs = computed(() => [
  featuredObject.value?.intro,
  exhibition.value?.summary,
  venue.value?.intro
].filter(Boolean))
</script>

<template>
  <main class="page-shell exhibition-detail-page" :class="pageClasses" :style="themeStyle">
    <template v-if="exhibition && venue && featuredObject">
      <section class="simple-detail glass-panel">
        <div class="detail-image">
          <img :src="imageSrc" :alt="imageAlt" decoding="async" fetchpriority="high" />
        </div>

        <article class="detail-copy">
          <div class="detail-topline">
            <div class="dragon-back-frame">
              <button class="glass-back-button" type="button" aria-label="返回上一页" @click="$router.back()">
                <ArrowLeft class="back-button-icon" aria-hidden="true" />
                <span>{{ backButtonLabel }}</span>
              </button>
            </div>
            <span>特色物品介绍</span>
          </div>

          <h1>{{ featuredObject.name }}</h1>
          <p v-for="paragraph in introParagraphs" :key="paragraph">{{ paragraph }}</p>

          <div class="tag-row">
            <span v-for="tag in tags" :key="tag">{{ tag }}</span>
          </div>

          <div v-if="featuredObject.details?.length" class="feature-list">
            <h2>{{ exhibition.title }}</h2>
            <ul>
              <li v-for="detail in featuredObject.details" :key="detail">{{ detail }}</li>
            </ul>
          </div>

          <router-link class="liquid-button" :to="`/reservation/${exhibition.venueId}`">查看预约建议</router-link>
        </article>
      </section>
    </template>

    <section v-else class="empty-state glass-panel">
      <span>未找到介绍</span>
      <h1>这个特色物品暂未开放介绍</h1>
      <p>返回展览列表，选择其他特色物品继续浏览。</p>
      <router-link class="liquid-button" to="/exhibitions">返回展览</router-link>
    </section>
  </main>
</template>

<style scoped>
.exhibition-detail-page {
  width: min(1180px, calc(100% - 32px));
  padding-top: 126px;
  color: var(--text);
}

.exhibition-detail-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 20%, var(--detail-accent-soft), transparent 24rem),
    radial-gradient(circle at 82% 26%, var(--detail-glow), transparent 22rem),
    linear-gradient(180deg, rgba(1, 9, 20, 0.08), rgba(1, 8, 18, 0.44));
}

.simple-detail {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(340px, 0.82fr);
  min-height: 500px;
  overflow: hidden;
  border-radius: 30px;
}

.detail-image {
  position: relative;
  min-height: 500px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, var(--detail-accent-soft), transparent 18rem),
    linear-gradient(145deg, var(--detail-surface), rgba(5, 12, 22, 0.86));
}

.detail-image::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent 62%, rgba(3, 10, 20, 0.22)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 28%, rgba(0, 0, 0, 0.2));
}

.detail-image img {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: block;
  object-fit: contain;
  padding: clamp(16px, 2.6vw, 28px);
}

.detail-copy {
  display: grid;
  align-content: center;
  padding: clamp(24px, 3.2vw, 40px);
  background:
    radial-gradient(circle at 10% 0%, var(--detail-glow), transparent 18rem),
    rgba(3, 12, 24, 0.42);
}

.detail-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  color: var(--muted);
  font-size: 13px;
}

.glass-back-button,
.detail-topline span {
  color: var(--detail-accent);
  font-weight: 700;
}

.dragon-back-frame {
  --dragon-black: #161513;
  --dragon-black-deep: #0d0c0a;
  --dragon-gold: #e5c583;
  --dragon-gold-hi: #fff2d3;
  --dragon-gold-dark: #937341;
  position: relative;
  display: inline-grid;
  place-items: center;
  padding: 5px;
  border-radius: 999px;
  isolation: isolate;
  filter:
    drop-shadow(0 5px 0 rgba(0, 0, 0, 0.34))
    drop-shadow(0 0 12px rgba(229, 197, 131, 0.12));
}

.dragon-back-frame::before {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: -1;
  border-radius: inherit;
  padding: 2px;
  background:
    linear-gradient(145deg, var(--dragon-gold-hi), var(--dragon-gold) 28%, var(--dragon-gold-dark) 56%, var(--dragon-gold) 82%, var(--dragon-gold-hi));
  box-shadow:
    0 0 0 1px rgba(229, 197, 131, 0.62),
    inset 0 0 0 1px rgba(13, 12, 10, 0.92),
    inset 0 -2px 7px rgba(0, 0, 0, 0.74);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.dragon-back-frame::after {
  content: "";
  position: absolute;
  inset: -4px -10px;
  z-index: 0;
  border-radius: inherit;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='30' viewBox='0 0 112 30'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23937341' stroke-width='2.5' opacity='.72'%3E%3Cpath d='M7 18c10-10 22-10 33 0s22 10 33 0 22-10 32 0'/%3E%3C/g%3E%3Cg stroke='%23e5c583' stroke-width='1.35' opacity='.84'%3E%3Cpath d='M8 16c10-8 21-8 32 0s22 8 33 0 21-8 31 0'/%3E%3Cpath d='M23 14c3-5 8-5 12 0M77 14c3-5 8-5 12 0'/%3E%3Cpath d='M49 12l7-6 7 6'/%3E%3C/g%3E%3Cg stroke='%23fff2d3' stroke-width='.7' opacity='.42'%3E%3Cpath d='M13 13c7-5 14-5 21 0M78 13c7-5 14-5 21 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 86% 60% no-repeat,
    radial-gradient(ellipse at 50% 52%, rgba(229, 197, 131, 0.07), transparent 46%);
  filter:
    drop-shadow(-1px -1px 0 rgba(255, 242, 211, 0.22))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.48));
  opacity: 0.58;
  pointer-events: none;
}

.glass-back-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  isolation: isolate;
  overflow: hidden;
  min-width: 118px;
  min-height: 44px;
  padding: 0 26px;
  border: 1px solid var(--dragon-gold);
  border-radius: 999px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='86' height='30' viewBox='0 0 86 30'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23937341' stroke-width='3.4' opacity='.42'%3E%3Cpath d='M12 16c9-13 20-12 30 1s20 12 32-1'/%3E%3C/g%3E%3Cg stroke='%23e5c583' stroke-width='1.8' opacity='.5'%3E%3Cpath d='M12 14c9-11 20-11 30 0s21 11 33 0'/%3E%3Cpath d='M25 12c4-7 10-7 15 0M47 12c4-7 10-7 15 0'/%3E%3Cpath d='M39 8l4-5 4 5'/%3E%3C/g%3E%3Cg stroke='%23fff2d3' stroke-width='.85' opacity='.38'%3E%3Cpath d='M17 11c7-6 15-6 22 0M47 11c7-6 15-6 22 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 86px 30px no-repeat,
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='34' viewBox='0 0 72 34'%3E%3Cg fill='none' stroke='%23e5c583' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' opacity='.05'%3E%3Cpath d='M6 23c9-12 20-12 29 0s21 12 31 0'/%3E%3Cpath d='M12 11c5-5 10-5 15 0M45 11c5-5 10-5 15 0M20 27c5 3 10 3 15 0M37 27c5 3 10 3 15 0'/%3E%3Cpath d='M31 8l5-5 5 5M5 15c6-3 12-3 18 0M49 15c6-3 12-3 18 0'/%3E%3C/g%3E%3C/svg%3E") center / 52px 25px repeat,
    linear-gradient(135deg, rgba(255, 242, 211, 0.08), transparent 32%),
    linear-gradient(180deg, var(--dragon-black), var(--dragon-black-deep));
  box-shadow:
    0 5px 0 rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.34),
    0 0 16px rgba(229, 197, 131, 0.12),
    inset 0 0 0 1px rgba(13, 12, 10, 0.92),
    inset 0 1px 0 rgba(255, 242, 211, 0.42),
    inset 0 -12px 18px rgba(0, 0, 0, 0.46);
  color: var(--dragon-gold);
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0;
  text-shadow:
    -1px -1px 0 rgba(255, 242, 211, 0.25),
    1px 1px 0 rgba(0, 0, 0, 0.74);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease, text-shadow 180ms ease;
}

.back-button-icon {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.56));
}

.glass-back-button::before {
  content: "";
  position: absolute;
  inset: 2px;
  z-index: -1;
  border-radius: inherit;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='34' viewBox='0 0 72 34'%3E%3Cg fill='none' stroke='%23e5c583' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' opacity='.55'%3E%3Cpath d='M6 23c9-12 20-12 29 0s21 12 31 0'/%3E%3Cpath d='M12 11c5-5 10-5 15 0M45 11c5-5 10-5 15 0M20 27c5 3 10 3 15 0M37 27c5 3 10 3 15 0'/%3E%3Cpath d='M31 8l5-5 5 5M5 15c6-3 12-3 18 0M49 15c6-3 12-3 18 0'/%3E%3C/g%3E%3C/svg%3E") center / 52px 25px repeat,
    radial-gradient(circle at 22% 18%, rgba(255, 242, 211, 0.11), transparent 18%),
    linear-gradient(180deg, rgba(229, 197, 131, 0.04), rgba(13, 12, 10, 0.2));
  opacity: 0.16;
  pointer-events: none;
}

.glass-back-button::after {
  content: "";
  position: absolute;
  inset: 7px 17px;
  z-index: -1;
  border-radius: inherit;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='28' viewBox='0 0 84 28'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23937341' stroke-width='3' opacity='.85'%3E%3Cpath d='M14 15c8-12 18-11 27 1s19 11 29-1'/%3E%3C/g%3E%3Cg stroke='%23e5c583' stroke-width='1.7'%3E%3Cpath d='M13 13c8-10 18-10 27 0s20 10 31 0'/%3E%3Cpath d='M25 11c4-7 10-7 14 0M47 11c4-7 10-7 14 0'/%3E%3Cpath d='M38 8l4-5 4 5'/%3E%3C/g%3E%3Cg stroke='%23fff2d3' stroke-width='.8' opacity='.78'%3E%3Cpath d='M17 10c7-6 14-6 21 0M46 10c7-6 14-6 21 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 78px 25px no-repeat;
  filter:
    drop-shadow(-1px -1px 0 rgba(255, 242, 211, 0.28))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.68));
  opacity: 0.42;
  pointer-events: none;
}

.glass-back-button:hover {
  transform: translateY(-1px);
  border-color: var(--dragon-gold-hi);
  color: var(--dragon-gold-hi);
  box-shadow:
    0 6px 0 rgba(0, 0, 0, 0.44),
    0 12px 22px rgba(0, 0, 0, 0.38),
    0 0 20px rgba(229, 197, 131, 0.16),
    inset 0 0 0 1px rgba(13, 12, 10, 0.95),
    inset 0 1px 0 rgba(255, 242, 211, 0.55),
    inset 0 -12px 18px rgba(0, 0, 0, 0.42);
}

.glass-back-button:hover::before {
  opacity: 0.22;
}

.exhibition-detail-page.is-ancient-china .dragon-back-frame {
  --bronze-deep: #13221e;
  --bronze-dark: #243a31;
  --bronze-mid: #6f7450;
  --bronze-warm: #a07f43;
  --bronze-edge: #c2a35f;
  --bronze-patina: #67b7a7;
  --bronze-patina-soft: rgba(103, 183, 167, 0.52);
  filter:
    drop-shadow(0 5px 0 rgba(1, 10, 9, 0.46))
    drop-shadow(0 0 14px rgba(103, 183, 167, 0.18));
}

.exhibition-detail-page.is-ancient-china .dragon-back-frame::before {
  background:
    conic-gradient(from 35deg, var(--bronze-edge), var(--bronze-patina) 14%, var(--bronze-warm) 30%, var(--bronze-dark) 52%, var(--bronze-patina) 70%, var(--bronze-edge));
  box-shadow:
    0 0 0 1px rgba(103, 183, 167, 0.48),
    inset 0 0 0 1px rgba(10, 22, 19, 0.9),
    inset 0 -2px 8px rgba(0, 0, 0, 0.7);
}

.exhibition-detail-page.is-ancient-china .dragon-back-frame::after {
  inset: -5px -12px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='124' height='34' viewBox='0 0 124 34'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%2367b7a7' stroke-width='1.5' opacity='.55'%3E%3Cpath d='M8 22h18l7-9 7 9h18l7-9 7 9h18l7-9 7 9h12'/%3E%3Cpath d='M19 17c4-6 10-6 14 0M51 17c4-6 10-6 14 0M83 17c4-6 10-6 14 0'/%3E%3C/g%3E%3Cg stroke='%23c2a35f' stroke-width='1' opacity='.62'%3E%3Cpath d='M12 12h100M16 26h92M34 12v14M62 12v14M90 12v14'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 92% 62% no-repeat,
    radial-gradient(ellipse at 50% 50%, rgba(103, 183, 167, 0.16), transparent 52%);
  filter:
    drop-shadow(-1px -1px 0 rgba(194, 163, 95, 0.2))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.55));
  opacity: 0.72;
}

.exhibition-detail-page.is-ancient-china .glass-back-button {
  border-color: rgba(194, 163, 95, 0.88);
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='86' height='34' viewBox='0 0 86 34'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%2367b7a7' stroke-width='1.7' opacity='.5'%3E%3Cpath d='M7 23h13l6-9 6 9h13l6-9 6 9h20'/%3E%3Cpath d='M18 17c4-6 9-6 13 0M50 17c4-6 9-6 13 0'/%3E%3C/g%3E%3Cg stroke='%23c2a35f' stroke-width='.95' opacity='.6'%3E%3Cpath d='M10 11h66M12 27h62M28 11v16M43 11v16M58 11v16'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 82px 32px no-repeat,
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='58' height='38' viewBox='0 0 58 38'%3E%3Cg fill='none' stroke='%2367b7a7' stroke-width='1' stroke-linecap='round' opacity='.18'%3E%3Cpath d='M4 9h18M36 9h18M13 9l8 10 8-10 8 10 8-10M8 28h42M18 24c4 4 8 4 12 0M34 24c4 4 8 4 12 0'/%3E%3C/g%3E%3C/svg%3E") center / 52px 34px repeat,
    radial-gradient(circle at 25% 18%, rgba(146, 220, 204, 0.32), transparent 18%),
    radial-gradient(circle at 76% 72%, rgba(96, 152, 135, 0.26), transparent 26%),
    linear-gradient(135deg, rgba(194, 163, 95, 0.2), transparent 30%),
    linear-gradient(180deg, var(--bronze-mid), var(--bronze-dark) 48%, var(--bronze-deep));
  box-shadow:
    0 5px 0 rgba(0, 0, 0, 0.45),
    0 11px 22px rgba(0, 0, 0, 0.34),
    0 0 18px rgba(103, 183, 167, 0.16),
    inset 0 0 0 1px rgba(16, 31, 27, 0.92),
    inset 0 1px 0 rgba(226, 204, 147, 0.5),
    inset 0 -12px 20px rgba(4, 13, 12, 0.48);
  color: #d9c58b;
  text-shadow:
    -1px -1px 0 rgba(226, 204, 147, 0.24),
    1px 1px 0 rgba(0, 0, 0, 0.78),
    0 0 8px rgba(103, 183, 167, 0.32);
}

.exhibition-detail-page.is-ancient-china .glass-back-button::before {
  background:
    radial-gradient(circle at 18% 24%, rgba(103, 183, 167, 0.34) 0 3px, transparent 4px),
    radial-gradient(circle at 78% 66%, rgba(103, 183, 167, 0.24) 0 2px, transparent 3px),
    repeating-linear-gradient(135deg, rgba(194, 163, 95, 0.12) 0 1px, transparent 1px 10px);
  opacity: 0.34;
}

.exhibition-detail-page.is-ancient-china .glass-back-button::after {
  inset: 8px 18px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='26' viewBox='0 0 80 26'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%2367b7a7' stroke-width='1.8' opacity='.82'%3E%3Cpath d='M7 17h13l5-8 5 8h13l5-8 5 8h20'/%3E%3Cpath d='M18 13c4-5 8-5 12 0M49 13c4-5 8-5 12 0'/%3E%3C/g%3E%3Cg stroke='%23d8bd73' stroke-width='.85' opacity='.72'%3E%3Cpath d='M10 8h60M12 21h56M31 8v13M48 8v13'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 76px 24px no-repeat;
  filter:
    drop-shadow(-1px -1px 0 rgba(216, 189, 115, 0.2))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.68));
  opacity: 0.48;
}

.exhibition-detail-page.is-ancient-china .glass-back-button:hover {
  border-color: var(--bronze-patina);
  color: #efe0ae;
  box-shadow:
    0 6px 0 rgba(0, 0, 0, 0.46),
    0 12px 22px rgba(0, 0, 0, 0.38),
    0 0 22px rgba(103, 183, 167, 0.22),
    inset 0 0 0 1px rgba(16, 31, 27, 0.95),
    inset 0 1px 0 rgba(226, 204, 147, 0.58),
    inset 0 -12px 18px rgba(4, 13, 12, 0.42);
}

.exhibition-detail-page.is-ancient-china .glass-back-button:hover::before {
  opacity: 0.42;
}

.exhibition-detail-page.is-heaven-architecture .dragon-back-frame {
  --heaven-deep: #071827;
  --heaven-navy: #0c2f4c;
  --heaven-blue: #145a9d;
  --heaven-azure: #8ec5ff;
  --heaven-porcelain: #eef8ff;
  --heaven-gold: #d8bd73;
  --heaven-gold-deep: #9b7938;
  filter:
    drop-shadow(0 5px 0 rgba(1, 12, 24, 0.42))
    drop-shadow(0 0 16px rgba(142, 197, 255, 0.22));
}

.exhibition-detail-page.is-heaven-architecture .dragon-back-frame::before {
  background:
    conic-gradient(from 18deg, var(--heaven-porcelain), var(--heaven-azure) 15%, var(--heaven-blue) 34%, var(--heaven-gold) 50%, var(--heaven-blue) 66%, var(--heaven-azure) 84%, var(--heaven-porcelain));
  box-shadow:
    0 0 0 1px rgba(142, 197, 255, 0.58),
    inset 0 0 0 1px rgba(6, 25, 44, 0.9),
    inset 0 -2px 8px rgba(0, 0, 0, 0.68);
}

.exhibition-detail-page.is-heaven-architecture .dragon-back-frame::after {
  inset: -7px -13px;
  background:
    linear-gradient(90deg, transparent 6%, rgba(238, 248, 255, 0.24) 6% 8%, transparent 8% 92%, rgba(238, 248, 255, 0.24) 92% 94%, transparent 94%),
    radial-gradient(ellipse at 50% 56%, rgba(142, 197, 255, 0.22) 0 36%, transparent 37%),
    repeating-radial-gradient(ellipse at 50% 56%, transparent 0 11px, rgba(216, 189, 115, 0.42) 12px 13px, transparent 14px 20px);
  filter:
    drop-shadow(-1px -1px 0 rgba(238, 248, 255, 0.22))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.52));
  opacity: 0.82;
}

.exhibition-detail-page.is-heaven-architecture .glass-back-button {
  border-color: rgba(238, 248, 255, 0.78);
  background:
    radial-gradient(ellipse at 50% 116%, transparent 0 34%, rgba(216, 189, 115, 0.5) 35% 37%, transparent 38%),
    radial-gradient(ellipse at 50% 116%, transparent 0 50%, rgba(142, 197, 255, 0.45) 51% 53%, transparent 54%),
    linear-gradient(90deg, transparent 0 14%, rgba(238, 248, 255, 0.08) 14% 16%, transparent 16% 84%, rgba(238, 248, 255, 0.08) 84% 86%, transparent 86%),
    repeating-linear-gradient(90deg, rgba(142, 197, 255, 0.08) 0 1px, transparent 1px 15px),
    radial-gradient(circle at 22% 20%, rgba(238, 248, 255, 0.35), transparent 19%),
    linear-gradient(135deg, rgba(216, 189, 115, 0.28), transparent 34%),
    linear-gradient(180deg, var(--heaven-blue), var(--heaven-navy) 52%, var(--heaven-deep));
  box-shadow:
    0 5px 0 rgba(0, 0, 0, 0.43),
    0 12px 22px rgba(0, 0, 0, 0.34),
    0 0 22px rgba(142, 197, 255, 0.2),
    inset 0 0 0 1px rgba(5, 24, 42, 0.9),
    inset 0 1px 0 rgba(238, 248, 255, 0.62),
    inset 0 -13px 19px rgba(2, 12, 24, 0.52);
  color: var(--heaven-porcelain);
  text-shadow:
    0 1px 0 rgba(8, 26, 43, 0.82),
    0 0 10px rgba(142, 197, 255, 0.45);
}

.exhibition-detail-page.is-heaven-architecture .glass-back-button::before {
  background:
    radial-gradient(circle at 18% 26%, rgba(238, 248, 255, 0.62) 0 2px, transparent 3px),
    radial-gradient(circle at 78% 66%, rgba(142, 197, 255, 0.36) 0 2px, transparent 3px),
    repeating-radial-gradient(ellipse at 50% 112%, transparent 0 8px, rgba(238, 248, 255, 0.24) 9px 10px, transparent 11px 16px);
  opacity: 0.4;
}

.exhibition-detail-page.is-heaven-architecture .glass-back-button::after {
  inset: 7px 18px;
  background:
    linear-gradient(90deg, rgba(216, 189, 115, 0.75) 0 100%) center 13px / 64px 1px no-repeat,
    radial-gradient(ellipse at 50% 100%, transparent 0 38%, rgba(238, 248, 255, 0.72) 39% 41%, transparent 42%),
    radial-gradient(ellipse at 50% 100%, transparent 0 56%, rgba(142, 197, 255, 0.72) 57% 59%, transparent 60%);
  filter:
    drop-shadow(-1px -1px 0 rgba(238, 248, 255, 0.24))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.62));
  opacity: 0.52;
}

.exhibition-detail-page.is-heaven-architecture .glass-back-button:hover {
  border-color: var(--heaven-azure);
  color: #ffffff;
  box-shadow:
    0 6px 0 rgba(0, 0, 0, 0.46),
    0 13px 23px rgba(0, 0, 0, 0.38),
    0 0 26px rgba(142, 197, 255, 0.3),
    inset 0 0 0 1px rgba(5, 24, 42, 0.94),
    inset 0 1px 0 rgba(238, 248, 255, 0.72),
    inset 0 -12px 18px rgba(2, 12, 24, 0.46);
}

.exhibition-detail-page.is-heaven-architecture .glass-back-button:hover::before {
  opacity: 0.52;
}

.exhibition-detail-page.is-imperial-garden .dragon-back-frame {
  --corridor-ink: #0b1720;
  --corridor-teal: #0d7f72;
  --corridor-jade: #39b894;
  --corridor-blue: #1d64b7;
  --corridor-porcelain: #eaf4ff;
  --corridor-vermilion: #a83c2e;
  --corridor-gold: #d7b457;
  --corridor-ochre: #b9802e;
  filter:
    drop-shadow(0 5px 0 rgba(3, 12, 14, 0.46))
    drop-shadow(0 0 16px rgba(57, 184, 148, 0.18));
}

.exhibition-detail-page.is-imperial-garden .dragon-back-frame::before {
  background:
    conic-gradient(from 42deg, var(--corridor-porcelain), var(--corridor-blue) 14%, var(--corridor-gold) 28%, var(--corridor-vermilion) 43%, var(--corridor-teal) 60%, var(--corridor-gold) 76%, var(--corridor-porcelain));
  box-shadow:
    0 0 0 1px rgba(215, 180, 87, 0.58),
    inset 0 0 0 1px rgba(8, 24, 28, 0.9),
    inset 0 -2px 8px rgba(0, 0, 0, 0.7);
}

.exhibition-detail-page.is-imperial-garden .dragon-back-frame::after {
  inset: -7px -14px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='132' height='36' viewBox='0 0 132 36'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23d7b457' stroke-width='1.25' opacity='.76'%3E%3Cpath d='M9 20c9-11 20-12 31-1s22 10 32-1 22-10 32 1 14 8 19 1'/%3E%3Cpath d='M19 15c4-7 11-7 15 0M55 15c4-7 11-7 15 0M91 15c4-7 11-7 15 0'/%3E%3C/g%3E%3Cg stroke='%231d64b7' stroke-width='2' opacity='.58'%3E%3Cpath d='M12 25c12-8 23-8 34 0s23 8 34 0 23-8 40 0'/%3E%3C/g%3E%3Cg stroke='%23a83c2e' stroke-width='1' opacity='.48'%3E%3Cpath d='M18 9h96M25 29h82'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 94% 64% no-repeat,
    radial-gradient(ellipse at 50% 54%, rgba(57, 184, 148, 0.16), transparent 54%);
  filter:
    drop-shadow(-1px -1px 0 rgba(234, 244, 255, 0.18))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.58));
  opacity: 0.84;
}

.exhibition-detail-page.is-imperial-garden .glass-back-button {
  border-color: rgba(215, 180, 87, 0.9);
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='92' height='34' viewBox='0 0 92 34'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23d7b457' stroke-width='1.5' opacity='.58'%3E%3Cpath d='M8 20c8-10 18-10 27 0s19 10 28 0 15-8 21 0'/%3E%3Cpath d='M19 15c4-6 9-6 13 0M57 15c4-6 9-6 13 0'/%3E%3C/g%3E%3Cg stroke='%231d64b7' stroke-width='2.5' opacity='.38'%3E%3Cpath d='M8 25c11-7 21-7 31 0s21 7 31 0 10-5 14 0'/%3E%3C/g%3E%3Cg stroke='%23a83c2e' stroke-width='1' opacity='.5'%3E%3Cpath d='M12 8h68M14 29h64'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 86px 31px no-repeat,
    repeating-linear-gradient(90deg, rgba(234, 244, 255, 0.06) 0 1px, transparent 1px 14px),
    radial-gradient(circle at 24% 19%, rgba(234, 244, 255, 0.28), transparent 18%),
    radial-gradient(circle at 78% 72%, rgba(57, 184, 148, 0.24), transparent 25%),
    linear-gradient(90deg, rgba(168, 60, 46, 0.46) 0 8px, transparent 8px calc(100% - 8px), rgba(168, 60, 46, 0.46) calc(100% - 8px)),
    linear-gradient(135deg, rgba(215, 180, 87, 0.24), transparent 34%),
    linear-gradient(180deg, #145b66, #113442 48%, var(--corridor-ink));
  box-shadow:
    0 5px 0 rgba(0, 0, 0, 0.45),
    0 12px 22px rgba(0, 0, 0, 0.35),
    0 0 20px rgba(57, 184, 148, 0.16),
    inset 0 0 0 1px rgba(7, 22, 27, 0.92),
    inset 0 1px 0 rgba(234, 244, 255, 0.42),
    inset 0 -12px 19px rgba(3, 13, 18, 0.5);
  color: #dbead9;
  text-shadow:
    -1px -1px 0 rgba(234, 244, 255, 0.2),
    1px 1px 0 rgba(0, 0, 0, 0.76),
    0 0 8px rgba(57, 184, 148, 0.24);
}

.exhibition-detail-page.is-imperial-garden .glass-back-button::before {
  background:
    radial-gradient(circle at 20% 24%, rgba(215, 180, 87, 0.42) 0 2px, transparent 3px),
    radial-gradient(circle at 80% 68%, rgba(29, 100, 183, 0.42) 0 2px, transparent 3px),
    repeating-linear-gradient(135deg, rgba(215, 180, 87, 0.12) 0 1px, transparent 1px 9px);
  opacity: 0.42;
}

.exhibition-detail-page.is-imperial-garden .glass-back-button::after {
  inset: 8px 18px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='26' viewBox='0 0 80 26'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23d7b457' stroke-width='1.5' opacity='.82'%3E%3Cpath d='M7 15c8-8 17-8 25 0s17 8 25 0 11-5 16 0'/%3E%3Cpath d='M16 11c4-5 8-5 12 0M49 11c4-5 8-5 12 0'/%3E%3C/g%3E%3Cg stroke='%231d64b7' stroke-width='2' opacity='.62'%3E%3Cpath d='M8 20c10-6 20-6 30 0s20 6 34 0'/%3E%3C/g%3E%3Cg stroke='%23a83c2e' stroke-width='.8' opacity='.62'%3E%3Cpath d='M11 7h58M13 23h54'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 76px 24px no-repeat;
  filter:
    drop-shadow(-1px -1px 0 rgba(234, 244, 255, 0.18))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.68));
  opacity: 0.5;
}

.exhibition-detail-page.is-imperial-garden .glass-back-button:hover {
  border-color: var(--corridor-jade);
  color: #f4f8e7;
  box-shadow:
    0 6px 0 rgba(0, 0, 0, 0.47),
    0 13px 23px rgba(0, 0, 0, 0.38),
    0 0 24px rgba(57, 184, 148, 0.24),
    inset 0 0 0 1px rgba(7, 22, 27, 0.95),
    inset 0 1px 0 rgba(234, 244, 255, 0.5),
    inset 0 -12px 18px rgba(3, 13, 18, 0.44);
}

.exhibition-detail-page.is-imperial-garden .glass-back-button:hover::before {
  opacity: 0.52;
}

.exhibition-detail-page.is-beijing-memory .dragon-back-frame {
  --folk-ink: #261410;
  --folk-door: #5b1e18;
  --folk-red: #9f2f24;
  --folk-red-hi: #d24e39;
  --folk-gold: #e3b667;
  --folk-gold-hi: #ffe5a8;
  --folk-paper: #f3d8a2;
  filter:
    drop-shadow(0 5px 0 rgba(24, 8, 5, 0.5))
    drop-shadow(0 0 15px rgba(210, 78, 57, 0.16));
}

.exhibition-detail-page.is-beijing-memory .dragon-back-frame::before {
  background:
    linear-gradient(90deg, var(--folk-gold-hi), var(--folk-gold) 18%, var(--folk-red-hi) 35%, var(--folk-door) 52%, var(--folk-red-hi) 68%, var(--folk-gold) 84%, var(--folk-gold-hi));
  box-shadow:
    0 0 0 1px rgba(227, 182, 103, 0.64),
    inset 0 0 0 1px rgba(42, 15, 10, 0.92),
    inset 0 -2px 8px rgba(0, 0, 0, 0.72);
}

.exhibition-detail-page.is-beijing-memory .dragon-back-frame::after {
  inset: -7px -13px;
  background:
    linear-gradient(90deg, transparent 0 8%, rgba(227, 182, 103, 0.58) 8% 10%, transparent 10% 90%, rgba(227, 182, 103, 0.58) 90% 92%, transparent 92%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='132' height='36' viewBox='0 0 132 36'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23e3b667' stroke-width='1.4' opacity='.76'%3E%3Cpath d='M13 22h106M22 13h88M32 13v18M52 13v18M80 13v18M100 13v18'/%3E%3Cpath d='M19 22c6-8 14-8 20 0M93 22c6-8 14-8 20 0'/%3E%3C/g%3E%3Cg stroke='%23d24e39' stroke-width='1.6' opacity='.62'%3E%3Cpath d='M12 27c14-5 28-5 42 0s28 5 42 0 17-4 24 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 94% 64% no-repeat,
    radial-gradient(ellipse at 50% 56%, rgba(159, 47, 36, 0.18), transparent 54%);
  filter:
    drop-shadow(-1px -1px 0 rgba(255, 229, 168, 0.2))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.58));
  opacity: 0.86;
}

.exhibition-detail-page.is-beijing-memory .glass-back-button {
  border-color: rgba(227, 182, 103, 0.92);
  background:
    linear-gradient(90deg, rgba(227, 182, 103, 0.72) 0 1px, transparent 1px calc(100% - 1px), rgba(227, 182, 103, 0.72) calc(100% - 1px)),
    linear-gradient(90deg, rgba(243, 216, 162, 0.1) 0 13%, transparent 13% 87%, rgba(243, 216, 162, 0.1) 87%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='92' height='34' viewBox='0 0 92 34'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23e3b667' stroke-width='1.1' opacity='.62'%3E%3Cpath d='M10 10h72M12 26h68M25 10v16M45 10v16M65 10v16'/%3E%3Cpath d='M18 20c6-7 13-7 19 0M55 20c6-7 13-7 19 0'/%3E%3C/g%3E%3Cg stroke='%23f3d8a2' stroke-width='.8' opacity='.36'%3E%3Cpath d='M15 15h60M18 21h54'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 86px 31px no-repeat,
    repeating-linear-gradient(0deg, rgba(243, 216, 162, 0.08) 0 1px, transparent 1px 7px),
    radial-gradient(circle at 22% 18%, rgba(255, 229, 168, 0.32), transparent 18%),
    linear-gradient(135deg, rgba(255, 229, 168, 0.16), transparent 32%),
    linear-gradient(180deg, var(--folk-red), var(--folk-door) 52%, var(--folk-ink));
  box-shadow:
    0 5px 0 rgba(0, 0, 0, 0.45),
    0 12px 22px rgba(0, 0, 0, 0.36),
    0 0 20px rgba(210, 78, 57, 0.18),
    inset 0 0 0 1px rgba(42, 15, 10, 0.92),
    inset 0 1px 0 rgba(255, 229, 168, 0.5),
    inset 0 -12px 19px rgba(21, 7, 5, 0.48);
  color: var(--folk-paper);
  text-shadow:
    -1px -1px 0 rgba(255, 229, 168, 0.18),
    1px 1px 0 rgba(0, 0, 0, 0.76),
    0 0 8px rgba(227, 182, 103, 0.24);
}

.exhibition-detail-page.is-beijing-memory .glass-back-button::before {
  background:
    radial-gradient(circle at 19% 24%, rgba(255, 229, 168, 0.5) 0 2px, transparent 3px),
    radial-gradient(circle at 81% 68%, rgba(255, 229, 168, 0.38) 0 2px, transparent 3px),
    repeating-linear-gradient(90deg, rgba(227, 182, 103, 0.12) 0 1px, transparent 1px 10px);
  opacity: 0.42;
}

.exhibition-detail-page.is-beijing-memory .glass-back-button::after {
  inset: 8px 18px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='26' viewBox='0 0 80 26'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23e3b667' stroke-width='1.1' opacity='.86'%3E%3Cpath d='M9 8h62M11 20h58M23 8v12M40 8v12M57 8v12'/%3E%3Cpath d='M15 15c6-6 12-6 18 0M47 15c6-6 12-6 18 0'/%3E%3C/g%3E%3Cg stroke='%23ffe5a8' stroke-width='.65' opacity='.55'%3E%3Cpath d='M17 12h46M19 17h42'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 76px 24px no-repeat;
  filter:
    drop-shadow(-1px -1px 0 rgba(255, 229, 168, 0.2))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.68));
  opacity: 0.52;
}

.exhibition-detail-page.is-beijing-memory .glass-back-button:hover {
  border-color: var(--folk-gold-hi);
  color: #fff0bd;
  box-shadow:
    0 6px 0 rgba(0, 0, 0, 0.47),
    0 13px 23px rgba(0, 0, 0, 0.38),
    0 0 24px rgba(210, 78, 57, 0.26),
    inset 0 0 0 1px rgba(42, 15, 10, 0.95),
    inset 0 1px 0 rgba(255, 229, 168, 0.58),
    inset 0 -12px 18px rgba(21, 7, 5, 0.43);
}

.exhibition-detail-page.is-beijing-memory .glass-back-button:hover::before {
  opacity: 0.52;
}

.exhibition-detail-page.is-canal-civilization .dragon-back-frame {
  --canal-night: #07151b;
  --canal-deep: #0c2530;
  --canal-water: #1d7d8f;
  --canal-water-hi: #76d6e0;
  --canal-ripple: #b8f4ef;
  --canal-wood: #8f6a3a;
  --canal-wood-hi: #d7b779;
  --canal-rope: #efd9ad;
  filter:
    drop-shadow(0 5px 0 rgba(2, 13, 18, 0.48))
    drop-shadow(0 0 16px rgba(118, 214, 224, 0.2));
}

.exhibition-detail-page.is-canal-civilization .dragon-back-frame::before {
  background:
    linear-gradient(145deg, var(--canal-ripple), var(--canal-water-hi) 18%, var(--canal-wood-hi) 34%, var(--canal-wood) 52%, var(--canal-water) 72%, var(--canal-ripple));
  box-shadow:
    0 0 0 1px rgba(118, 214, 224, 0.58),
    inset 0 0 0 1px rgba(5, 23, 31, 0.92),
    inset 0 -2px 8px rgba(0, 0, 0, 0.72);
}

.exhibition-detail-page.is-canal-civilization .dragon-back-frame::after {
  inset: -7px -14px;
  background:
    linear-gradient(90deg, transparent 0 9%, rgba(239, 217, 173, 0.54) 9% 11%, transparent 11% 89%, rgba(239, 217, 173, 0.54) 89% 91%, transparent 91%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='134' height='38' viewBox='0 0 134 38'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23d7b779' stroke-width='1.5' opacity='.76'%3E%3Cpath d='M18 23h82l12-7 10 7H18z'/%3E%3Cpath d='M32 23l10-10h39l11 10M48 13v10M67 13v10M86 13v10'/%3E%3C/g%3E%3Cg stroke='%2376d6e0' stroke-width='1.6' opacity='.72'%3E%3Cpath d='M10 28c12-6 24-6 36 0s24 6 36 0 24-6 42 0'/%3E%3Cpath d='M14 33c14-5 28-5 42 0s28 5 42 0'/%3E%3C/g%3E%3Cg stroke='%23efd9ad' stroke-width='.9' opacity='.6'%3E%3Cpath d='M26 18c10-4 20-4 30 0M72 18c10-4 20-4 30 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 94% 66% no-repeat,
    radial-gradient(ellipse at 50% 58%, rgba(118, 214, 224, 0.17), transparent 56%);
  filter:
    drop-shadow(-1px -1px 0 rgba(184, 244, 239, 0.18))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.62));
  opacity: 0.84;
}

.exhibition-detail-page.is-canal-civilization .glass-back-button {
  min-width: 126px;
  border-color: rgba(215, 183, 121, 0.9);
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='34' viewBox='0 0 96 34'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23d7b779' stroke-width='1.4' opacity='.62'%3E%3Cpath d='M13 20h57l10-6 8 6H13z'/%3E%3Cpath d='M25 20l8-9h29l9 9M38 11v9M51 11v9M64 11v9'/%3E%3C/g%3E%3Cg stroke='%2376d6e0' stroke-width='1.6' opacity='.54'%3E%3Cpath d='M8 26c10-5 20-5 30 0s20 5 30 0 12-4 20 0'/%3E%3Cpath d='M12 30c11-4 22-4 33 0s22 4 39 0'/%3E%3C/g%3E%3Cg stroke='%23efd9ad' stroke-width='.8' opacity='.5'%3E%3Cpath d='M23 16c8-4 15-4 23 0M55 16c8-4 15-4 23 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 90px 31px no-repeat,
    repeating-linear-gradient(0deg, rgba(143, 106, 58, 0.2) 0 1px, transparent 1px 8px),
    radial-gradient(circle at 23% 18%, rgba(184, 244, 239, 0.34), transparent 18%),
    radial-gradient(circle at 78% 72%, rgba(29, 125, 143, 0.32), transparent 26%),
    linear-gradient(90deg, rgba(239, 217, 173, 0.14) 0 12%, transparent 12% 88%, rgba(239, 217, 173, 0.14) 88%),
    linear-gradient(135deg, rgba(215, 183, 121, 0.26), transparent 35%),
    linear-gradient(180deg, var(--canal-water), var(--canal-deep) 50%, var(--canal-night));
  box-shadow:
    0 5px 0 rgba(0, 0, 0, 0.45),
    0 12px 22px rgba(0, 0, 0, 0.36),
    0 0 20px rgba(118, 214, 224, 0.18),
    inset 0 0 0 1px rgba(5, 23, 31, 0.92),
    inset 0 1px 0 rgba(184, 244, 239, 0.46),
    inset 0 -12px 19px rgba(2, 12, 17, 0.5);
  color: #f2dfb4;
  text-shadow:
    -1px -1px 0 rgba(184, 244, 239, 0.16),
    1px 1px 0 rgba(0, 0, 0, 0.78),
    0 0 8px rgba(118, 214, 224, 0.28);
}

.exhibition-detail-page.is-canal-civilization .glass-back-button::before {
  background:
    radial-gradient(circle at 19% 24%, rgba(184, 244, 239, 0.5) 0 2px, transparent 3px),
    radial-gradient(circle at 82% 68%, rgba(215, 183, 121, 0.42) 0 2px, transparent 3px),
    repeating-linear-gradient(90deg, rgba(239, 217, 173, 0.11) 0 1px, transparent 1px 10px),
    repeating-linear-gradient(0deg, rgba(118, 214, 224, 0.1) 0 1px, transparent 1px 7px);
  opacity: 0.42;
}

.exhibition-detail-page.is-canal-civilization .glass-back-button::after {
  inset: 8px 18px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='82' height='26' viewBox='0 0 82 26'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg stroke='%23d7b779' stroke-width='1.2' opacity='.86'%3E%3Cpath d='M9 15h49l9-5 7 5H9z'/%3E%3Cpath d='M20 15l7-8h24l8 8M31 7v8M43 7v8M55 7v8'/%3E%3C/g%3E%3Cg stroke='%2376d6e0' stroke-width='1.3' opacity='.78'%3E%3Cpath d='M8 20c9-4 18-4 27 0s18 4 27 0 8-3 13 0'/%3E%3Cpath d='M12 24c10-3 20-3 30 0s20 3 33 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") center / 78px 24px no-repeat;
  filter:
    drop-shadow(-1px -1px 0 rgba(184, 244, 239, 0.18))
    drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.68));
  opacity: 0.52;
}

.exhibition-detail-page.is-canal-civilization .glass-back-button:hover {
  border-color: var(--canal-ripple);
  color: #fff0c9;
  box-shadow:
    0 6px 0 rgba(0, 0, 0, 0.47),
    0 13px 23px rgba(0, 0, 0, 0.39),
    0 0 26px rgba(118, 214, 224, 0.3),
    inset 0 0 0 1px rgba(5, 23, 31, 0.95),
    inset 0 1px 0 rgba(184, 244, 239, 0.58),
    inset 0 -12px 18px rgba(2, 12, 17, 0.44);
}

.exhibition-detail-page.is-canal-civilization .glass-back-button:hover::before {
  opacity: 0.52;
}

.detail-copy h1 {
  margin: 0;
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", serif;
  font-size: clamp(32px, 4vw, 50px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: 0;
}

.detail-copy p {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.68;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.tag-row span {
  padding: 7px 11px;
  border: 1px solid color-mix(in srgb, var(--detail-accent) 30%, transparent);
  border-radius: 999px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.045);
  font-size: 12px;
}

.feature-list {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
}

.feature-list h2 {
  margin: 0 0 10px;
  color: var(--detail-accent);
  font-size: 15px;
}

.feature-list ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
}

.feature-list li {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.56;
}

.liquid-button {
  width: fit-content;
  margin-top: 20px;
}

.empty-state {
  width: min(760px, 100%);
  margin: 80px auto;
  padding: 36px;
  border-radius: 26px;
}

.empty-state span {
  color: var(--detail-accent);
  font-size: 13px;
  font-weight: 700;
}

.empty-state h1 {
  margin: 14px 0;
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", serif;
  font-size: clamp(34px, 5vw, 58px);
  font-weight: 900;
  line-height: 1.08;
}

.empty-state p {
  color: var(--muted);
  line-height: 1.78;
}

@media (max-width: 900px) {
  .exhibition-detail-page {
    width: min(100% - 20px, 1180px);
    padding-top: 146px;
  }

  .simple-detail {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .detail-image,
  .detail-image img {
    min-height: auto;
  }

  .detail-image img {
    aspect-ratio: 16 / 11;
  }
}

@media (max-width: 560px) {
  .simple-detail,
  .empty-state {
    border-radius: 22px;
  }

  .detail-copy,
  .empty-state {
    padding: 20px;
  }

  .detail-topline {
    align-items: flex-start;
    flex-direction: column;
  }

  .dragon-back-frame {
    margin-left: 0;
  }
}
</style>
