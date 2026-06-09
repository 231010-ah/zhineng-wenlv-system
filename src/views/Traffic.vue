<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { Clock, DataAnalysis, Location, TrendCharts, Warning } from '@element-plus/icons-vue'
import { getTrafficTips } from '../api/tourism'

const chartRef = ref()
const traffic = ref(null)
let chart = null

const venueMeta = [
  { key: 'history', name: '故宫博物院', shortName: '故宫', theme: '宫廷历史', color: '#d7b46a', advice: '优先早场入馆，避开午后中轴线人群。' },
  { key: 'art', name: '国家博物馆', shortName: '国博', theme: '大型展厅', color: '#9ed8df', advice: '建议提前完成安检预约，午后分散到专题展厅。' },
  { key: 'science', name: '天坛公园', shortName: '天坛', theme: '公园游线', color: '#95bfa4', advice: '适合上午从东门进入，保留祈年殿周边停留时间。' },
  { key: 'theater', name: '什刹海夜游', shortName: '夜游', theme: '水岸夜线', color: '#d79a8d', advice: '夜间热度升高，建议错开 19:00 后核心水岸。' }
]

const formatNumber = (value) => Number(value || 0).toLocaleString('zh-CN')

const seriesRows = computed(() => traffic.value?.series || [])

const venueLoads = computed(() => {
  if (!seriesRows.value.length) return []

  return venueMeta
    .map((venue) => {
      const values = seriesRows.value.map((item) => item[venue.key])
      const peak = Math.max(...values)
      const peakIndex = values.indexOf(peak)
      const current = values[values.length - 1]
      const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)

      return {
        ...venue,
        peak,
        current,
        average,
        peakTime: seriesRows.value[peakIndex]?.time || '-'
      }
    })
    .sort((a, b) => b.peak - a.peak)
})

const timeSegments = computed(() =>
  seriesRows.value.map((item) => {
    const average = Math.round(
      venueMeta.reduce((sum, venue) => sum + item[venue.key], 0) / venueMeta.length
    )
    const level = average >= 78 ? 'busy' : average >= 58 ? 'steady' : 'calm'

    return {
      time: item.time,
      average,
      level,
      label: level === 'busy' ? '高峰' : level === 'steady' ? '平稳' : '舒适'
    }
  })
)

const quietSlots = computed(() => timeSegments.value.filter((item) => item.level === 'calm').slice(0, 3))
const peakSegment = computed(() => [...timeSegments.value].sort((a, b) => b.average - a.average)[0])

const kpis = computed(() => {
  if (!traffic.value) return []

  return [
    {
      label: '今日总客流',
      value: formatNumber(traffic.value.overview.totalVisitors),
      suffix: '人次',
      note: '全域预约与入园汇总',
      icon: DataAnalysis
    },
    {
      label: '平均在馆率',
      value: traffic.value.overview.averageCrowd,
      suffix: '%',
      note: peakSegment.value ? `${peakSegment.value.time} 达到日内高点` : '实时滚动更新',
      icon: TrendCharts
    },
    {
      label: '推荐时段',
      value: traffic.value.overview.bestSlot,
      suffix: '',
      note: quietSlots.value.length ? `另有 ${quietSlots.value.length} 个舒适窗口` : '建议提前预约',
      icon: Clock
    }
  ]
})

const getLoadTone = (load) => {
  if (load >= 85) return 'danger'
  if (load >= 72) return 'warning'
  if (load >= 55) return 'steady'
  return 'calm'
}

const getLoadStyle = (load, color) => ({
  '--load-value': `${Math.min(load, 100)}%`,
  '--load-color': color
})

const renderChart = () => {
  if (!chartRef.value || !traffic.value) return
  chart?.dispose()
  chart = echarts.init(chartRef.value)
  const times = traffic.value.series.map((item) => item.time)
  chart.setOption({
    backgroundColor: 'transparent',
    color: venueMeta.map((item) => item.color),
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 13, 24, .94)',
      borderColor: 'rgba(234,244,255,.18)',
      borderWidth: 1,
      padding: [12, 14],
      textStyle: { color: '#f3efe7' },
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(234,244,255,.28)', type: 'dashed' }
      },
      valueFormatter: (value) => `${value}%`
    },
    legend: {
      top: 0,
      right: 0,
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 8,
      textStyle: { color: 'rgba(246,242,234,.66)', fontSize: 12 }
    },
    grid: { top: 58, left: 36, right: 18, bottom: 34 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisTick: { show: false },
      axisLabel: { color: 'rgba(246,242,234,.58)', margin: 14 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.12)' } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: 'rgba(246,242,234,.58)', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    series: venueMeta.map((venue) => ({
      name: venue.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbolSize: 8,
      emphasis: { focus: 'series' },
      data: traffic.value.series.map((item) => item[venue.key]),
      lineStyle: { color: venue.color, width: 3, shadowBlur: 12, shadowColor: `${venue.color}55` },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${venue.color}33` },
          { offset: 1, color: `${venue.color}00` }
        ])
      }
    }))
  })
}

const resize = () => chart?.resize()

onMounted(async () => {
  traffic.value = await getTrafficTips()
  await nextTick()
  renderChart()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <main class="page-shell traffic-page">
    <section class="traffic-hero">
      <div class="page-title">
        <span class="eyebrow">客流控制建议</span>
        <h1>AI 客流提示</h1>
        <p>根据节假日、周末、热门场馆和热门时间段，汇总北京文旅客流压力、错峰窗口与现场调度建议。</p>
      </div>
    </section>

    <section class="traffic-kpis" v-if="traffic">
      <article v-for="item in kpis" :key="item.label" class="glass-card kpi-card">
        <span class="kpi-icon">
          <component :is="item.icon" />
        </span>
        <div>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}<small>{{ item.suffix }}</small></strong>
          <p>{{ item.note }}</p>
        </div>
      </article>
    </section>

    <section class="traffic-layout" v-if="traffic">
      <section class="chart-panel glass-panel">
        <div class="panel-heading">
          <div>
            <span class="glass-badge">Load Curve</span>
            <h2>热门场馆全天负荷趋势</h2>
          </div>
          <span class="panel-note">单位：在馆率</span>
        </div>
        <div ref="chartRef" class="chart"></div>
      </section>

      <aside class="traffic-side">
        <section class="glass-panel rank-panel">
          <div class="panel-heading compact">
            <div>
              <span class="glass-badge">Pressure</span>
              <h2>场馆压力排行</h2>
            </div>
            <Warning />
          </div>

          <div class="venue-loads">
            <article
              v-for="venue in venueLoads"
              :key="venue.key"
              class="venue-load"
              :class="getLoadTone(venue.peak)"
              :style="getLoadStyle(venue.peak, venue.color)"
            >
              <div class="load-head">
                <span class="venue-dot" :style="{ backgroundColor: venue.color }"></span>
                <div>
                  <strong>{{ venue.name }}</strong>
                  <small>{{ venue.theme }} · {{ venue.peakTime }} 峰值</small>
                </div>
                <b>{{ venue.peak }}%</b>
              </div>
              <div class="load-bar"><span></span></div>
              <p>{{ venue.advice }}</p>
            </article>
          </div>
        </section>

        <section class="glass-panel slot-panel">
          <div class="panel-heading compact">
            <div>
              <span class="glass-badge">Off-peak</span>
              <h2>错峰窗口</h2>
            </div>
            <Location />
          </div>

          <div class="slot-grid">
            <span v-for="slot in timeSegments" :key="slot.time" class="time-chip" :class="slot.level">
              <b>{{ slot.time }}</b>
              <small>{{ slot.label }} {{ slot.average }}%</small>
            </span>
          </div>
        </section>
      </aside>
    </section>

    <section class="glass-panel warning-panel" v-if="traffic">
      <div class="suggestion-icon">
        <Warning />
      </div>
      <div>
        <span class="glass-badge">AI Suggestion</span>
        <h2>今日调度建议</h2>
        <p>{{ traffic.overview.warning }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.traffic-page {
  width: min(1240px, calc(100% - 32px));
}

.traffic-hero {
  margin-bottom: 26px;
}

.traffic-page .page-title {
  margin-bottom: 0;
}

.load-bar {
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.load-bar span {
  display: block;
  width: var(--load-value);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--load-color), rgba(255, 255, 255, 0.72));
  box-shadow: 0 0 22px color-mix(in srgb, var(--load-color), transparent 45%);
}

.traffic-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.kpi-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  min-height: 150px;
  padding: 22px;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: var(--porcelain);
  background:
    linear-gradient(145deg, rgba(234, 244, 255, 0.16), rgba(20, 90, 157, 0.14)),
    rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.kpi-icon svg {
  width: 22px;
  height: 22px;
}

.kpi-card span:not(.kpi-icon) {
  color: var(--muted);
}

.kpi-card strong {
  display: block;
  margin-top: 10px;
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1.05;
}

.kpi-card small {
  margin-left: 5px;
  color: var(--faint);
  font-size: 13px;
  font-weight: 700;
}

.kpi-card p {
  margin: 12px 0 0;
  color: var(--faint);
  font-size: 13px;
  line-height: 1.6;
}

.traffic-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(330px, 0.85fr);
  gap: 24px;
}

.chart-panel,
.rank-panel,
.slot-panel,
.warning-panel {
  overflow: hidden;
  border-radius: 28px;
  padding: 24px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.panel-heading.compact {
  align-items: center;
}

.panel-heading h2 {
  margin: 12px 0 0;
  font-size: 22px;
}

.panel-heading.compact h2 {
  font-size: 18px;
}

.panel-heading svg {
  width: 22px;
  height: 22px;
  color: var(--gold);
}

.panel-note {
  color: var(--faint);
  font-size: 13px;
}

.chart {
  height: 468px;
}

.traffic-side {
  display: grid;
  gap: 24px;
}

.venue-loads {
  display: grid;
  gap: 12px;
}

.venue-load {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
}

.venue-load.danger {
  border-color: rgba(215, 154, 141, 0.26);
  background: rgba(215, 154, 141, 0.055);
}

.venue-load.warning {
  border-color: rgba(215, 180, 106, 0.24);
}

.load-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}

.venue-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 14px currentColor;
}

.load-head strong,
.load-head small {
  display: block;
}

.load-head strong {
  font-size: 15px;
}

.load-head small {
  margin-top: 4px;
  color: var(--faint);
  font-size: 12px;
}

.load-head b {
  color: var(--text);
  font-size: 18px;
}

.load-bar {
  height: 6px;
  margin-top: 12px;
}

.venue-load p {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.time-chip {
  display: grid;
  gap: 6px;
  min-height: 70px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
}

.time-chip b {
  font-size: 16px;
}

.time-chip small {
  color: var(--faint);
}

.time-chip.calm {
  border-color: rgba(149, 191, 164, 0.28);
  background: rgba(149, 191, 164, 0.08);
}

.time-chip.busy {
  border-color: rgba(215, 154, 141, 0.26);
  background: rgba(215, 154, 141, 0.07);
}

.warning-panel {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  margin-top: 22px;
}

.suggestion-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #f2dfb8;
  background: rgba(215, 180, 106, 0.12);
}

.suggestion-icon svg {
  width: 24px;
  height: 24px;
}

.warning-panel h2 {
  margin: 12px 0 8px;
  font-size: 22px;
}

.warning-panel p {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}

@media (max-width: 1020px) {
  .traffic-layout {
    grid-template-columns: 1fr;
  }

  .traffic-side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .traffic-kpis {
    grid-template-columns: 1fr;
  }

  .traffic-side,
  .slot-grid {
    grid-template-columns: 1fr;
  }

  .chart-panel,
  .rank-panel,
  .slot-panel,
  .warning-panel {
    border-radius: 22px;
    padding: 18px;
  }

  .chart {
    height: 360px;
  }

  .warning-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .traffic-page {
    width: min(100% - 20px, 1240px);
  }

  .kpi-card {
    grid-template-columns: 1fr;
  }

  .panel-heading {
    display: grid;
  }
}
</style>
