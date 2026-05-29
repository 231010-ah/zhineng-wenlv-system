<script setup>
import { onMounted, ref } from 'vue'
import { getRecommendations } from '../api/tourism'

const recommendations = ref([])

onMounted(async () => {
  recommendations.value = await getRecommendations()
})
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">AI 兴趣推荐</span>
      <h1>AI 兴趣推荐</h1>
      <p>根据历史文化、古建筑、博物馆、艺术展览、非遗体验、亲子研学、胡同文化、美食探店、城市漫游、摄影打卡、夜游经济和红色文化等标签生成北京推荐路线。</p>
    </section>

    <section class="recommend-grid">
      <article v-for="item in recommendations" :key="item.id" class="glass-card recommend-card">
        <div class="score">
          <strong>{{ item.match }}%</strong>
          <span>Match</span>
        </div>
        <div>
          <span class="venue-name">{{ item.venue }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.reason }}</p>
          <router-link class="liquid-button dark-button" :to="item.route">按兴趣预约</router-link>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.recommend-grid {
  display: grid;
  gap: 18px;
}

.recommend-card {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 24px;
  padding: 28px;
}

.score {
  min-height: 150px;
  display: grid;
  place-items: center;
  align-content: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.07);
}

.score strong {
  color: var(--cyan);
  font-size: 42px;
}

.score span,
.venue-name {
  color: var(--gold);
}

h2 {
  margin: 10px 0;
  font-family: "ZQKNBCGPST", serif;
  font-size: 34px;
}

p {
  color: var(--muted);
  line-height: 1.8;
}

.liquid-button {
  margin-top: 18px;
}

@media (max-width: 680px) {
  .recommend-card {
    grid-template-columns: 1fr;
  }
}
</style>
