<script setup>
import { onMounted, ref } from 'vue'
import { getVenues } from '../api/tourism'

const venues = ref([])

onMounted(async () => {
  venues.value = await getVenues()
})
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">北京景点推荐</span>
      <h1>热门与小众文旅地点</h1>
      <p>覆盖故宫、天坛、颐和园、国家博物馆、首都博物馆、大运河博物馆、中国美术馆、胡同 city walk 等北京文旅场景。</p>
    </section>

    <section class="venue-grid">
      <article v-for="venue in venues" :key="venue.id" class="venue-card glass-card">
        <div class="image-frame">
          <img :src="venue.image" :alt="venue.name" />
        </div>
        <div class="venue-body">
          <div class="venue-meta">
            <span>{{ venue.type }}</span>
            <span>{{ venue.area }}</span>
          </div>
          <h2>{{ venue.name }}</h2>
          <p>{{ venue.intro }}</p>
          <div class="tag-row">
            <span v-for="tag in venue.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="venue-stats">
            <strong>{{ venue.remaining }}</strong>
            <span>预约余量</span>
            <strong>{{ venue.crowd }}%</strong>
            <span>在馆率</span>
          </div>
          <router-link class="liquid-button" :to="`/reservation/${venue.id}`">查看预约建议</router-link>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.venue-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.venue-card .image-frame {
  width: 100%;
  height: 260px;
}

.venue-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-body {
  padding: 24px;
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
  color: var(--gold);
  font-size: 13px;
}

h2 {
  margin: 12px 0 10px;
  font-family: "ZQKNBCGPST", serif;
  font-size: 30px;
}

p {
  color: var(--muted);
  line-height: 1.7;
}

.tag-row {
  margin: 18px 0;
}

.tag-row span {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--muted);
  font-size: 12px;
}

.venue-stats {
  margin-bottom: 18px;
  color: var(--faint);
}

.venue-stats strong {
  color: var(--text);
  font-size: 24px;
}

@media (max-width: 760px) {
  .venue-grid {
    grid-template-columns: 1fr;
  }
}
</style>
