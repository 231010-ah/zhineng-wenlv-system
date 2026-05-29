<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getTrafficTips } from '../api/tourism'

const chartRef = ref()
const traffic = ref(null)
let chart = null

const renderChart = () => {
  if (!chartRef.value || !traffic.value) return
  chart = echarts.init(chartRef.value)
  const times = traffic.value.series.map((item) => item.time)
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#111', borderColor: 'rgba(255,255,255,.16)', textStyle: { color: '#fff' } },
    legend: { bottom: 0, textStyle: { color: 'rgba(246,242,234,.62)' } },
    grid: { top: 24, left: 36, right: 18, bottom: 54 },
    xAxis: { type: 'category', data: times, axisLabel: { color: 'rgba(246,242,234,.58)' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,.12)' } } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: 'rgba(246,242,234,.58)', formatter: '{value}%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } } },
    series: [
      { name: '故宫博物院', type: 'line', smooth: true, data: traffic.value.series.map((i) => i.history), lineStyle: { color: '#d7b46a', width: 3 }, areaStyle: { color: 'rgba(215,180,106,.13)' } },
      { name: '国家博物馆', type: 'line', smooth: true, data: traffic.value.series.map((i) => i.art), lineStyle: { color: '#9ed8df', width: 3 }, areaStyle: { color: 'rgba(158,216,223,.12)' } },
      { name: '天坛公园', type: 'line', smooth: true, data: traffic.value.series.map((i) => i.science), lineStyle: { color: '#95bfa4', width: 3 }, areaStyle: { color: 'rgba(149,191,164,.12)' } },
      { name: '什刹海夜游', type: 'line', smooth: true, data: traffic.value.series.map((i) => i.theater), lineStyle: { color: '#d79a8d', width: 3 }, areaStyle: { color: 'rgba(215,154,141,.12)' } }
    ]
  })
}

const resize = () => chart?.resize()

onMounted(async () => {
  traffic.value = await getTrafficTips()
  renderChart()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">客流控制建议</span>
      <h1>AI 客流提示</h1>
      <p>根据节假日、周末、热门场馆和热门时间段，给出北京文旅客流提示与错峰建议。</p>
    </section>

    <section class="traffic-kpis" v-if="traffic">
      <article class="glass-card">
        <span>今日总客流</span>
        <strong>{{ traffic.overview.totalVisitors }}</strong>
      </article>
      <article class="glass-card">
        <span>平均在馆率</span>
        <strong>{{ traffic.overview.averageCrowd }}%</strong>
      </article>
      <article class="glass-card">
        <span>推荐时段</span>
        <strong>{{ traffic.overview.bestSlot }}</strong>
      </article>
    </section>

    <section class="chart-panel glass-panel">
      <div ref="chartRef" class="chart"></div>
    </section>

    <section class="glass-panel warning-panel" v-if="traffic">
      <span class="glass-badge">AI Suggestion</span>
      <p>{{ traffic.overview.warning }}</p>
    </section>
  </main>
</template>

<style scoped>
.traffic-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.traffic-kpis article {
  padding: 22px;
}

.traffic-kpis span {
  color: var(--muted);
}

.traffic-kpis strong {
  display: block;
  margin-top: 10px;
  font-size: 34px;
}

.chart-panel,
.warning-panel {
  border-radius: 30px;
  padding: 24px;
}

.chart {
  height: 420px;
}

.warning-panel {
  margin-top: 22px;
}

.warning-panel p {
  color: var(--muted);
  line-height: 1.8;
}

@media (max-width: 760px) {
  .traffic-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
