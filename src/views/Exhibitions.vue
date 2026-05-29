<script setup>
import { computed, onMounted, ref } from 'vue'
import { getExhibitions, getVenues } from '../api/tourism'

const exhibitions = ref([])
const venues = ref([])
const activeVenue = ref('all')

const filtered = computed(() => {
  if (activeVenue.value === 'all') return exhibitions.value
  return exhibitions.value.filter((item) => item.venueId === activeVenue.value)
})

const venueName = (id) => venues.value.find((venue) => venue.id === id)?.name || '文化场馆'

onMounted(async () => {
  const [exhibitionData, venueData] = await Promise.all([getExhibitions(), getVenues()])
  exhibitions.value = exhibitionData
  venues.value = venueData
})
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">北京展览与活动</span>
      <h1>展览查看</h1>
      <p>按北京文旅地点筛选展览、展陈和漫游主题，结合热度与客流提示选择参观计划。</p>
    </section>

    <div class="filter-row">
      <button class="mini-button" :class="{ active: activeVenue === 'all' }" @click="activeVenue = 'all'">全部</button>
      <button v-for="venue in venues" :key="venue.id" class="mini-button dark-button" :class="{ active: activeVenue === venue.id }" @click="activeVenue = venue.id">
        {{ venue.name }}
      </button>
    </div>

    <section class="exhibition-grid">
      <article v-for="item in filtered" :key="item.id" class="glass-card exhibition-card">
        <div class="image-frame">
          <img :src="item.image" :alt="item.title" />
        </div>
        <div>
          <span>{{ venueName(item.venueId) }} · 热度 {{ item.heat }}%</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary }}</p>
          <small>{{ item.date }}</small>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.filter-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.filter-row .active {
  background: var(--text);
  color: #050505;
}

.exhibition-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.exhibition-card {
  display: grid;
  grid-template-columns: 42% 1fr;
}

.exhibition-card .image-frame {
  width: 100%;
  height: 100%;
  min-height: 260px;
}

.exhibition-card img {
  width: 100%;
  height: 100%;
  min-height: 260px;
  object-fit: cover;
}

.exhibition-card > div:not(.image-frame) {
  padding: 24px;
}

.exhibition-card span,
.exhibition-card small {
  color: var(--gold);
}

.exhibition-card h2 {
  margin: 12px 0;
  font-size: 28px;
  font-family: "ZQKNBCGPST", serif;
}

.exhibition-card p {
  color: var(--muted);
  line-height: 1.7;
}

@media (max-width: 880px) {
  .exhibition-grid,
  .exhibition-card {
    grid-template-columns: 1fr;
  }
}
</style>
