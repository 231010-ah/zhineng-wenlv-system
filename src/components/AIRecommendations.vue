<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import anime from 'animejs'
import * as echarts from 'echarts'

const recommendationsRef = ref(null)
const chartRef = ref(null)
let chartInstance = null
let observer = null

const recommendations = ref([
  {
    id: 1,
    title: '三星堆金沙古蜀全息巡展',
    match: 98.6,
    reason: '匹配您的历史历史考古/青铜文化浏览偏好',
    date: '10:00 - 11:30',
    venue: '历史博物馆 3F厅',
    icon: 'fa-brain',
    tag: '深度探索'
  },
  {
    id: 2,
    title: '算法之声：交互式电子乐特展',
    match: 94.2,
    reason: '推荐算法识别出您偏好新潮视听艺术',
    date: '14:00 - 16:00',
    venue: '艺术中心 A厅',
    icon: 'fa-music',
    tag: '潮流声学'
  },
  {
    id: 3,
    title: '超弦空间：多维量子全息投影',
    match: 89.8,
    reason: '基于同城相似文旅爱好者热度趋势匹配',
    date: '16:30 - 18:00',
    venue: '科技馆 核心元宇宙区',
    icon: 'fa-infinity',
    tag: '硬核物理'
  }
])

// Initialize ECharts with starry/cyber colors
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 13, 20, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      textStyle: { color: '#e5e7eb', fontSize: 11 },
      axisPointer: { type: 'line', lineStyle: { color: '#7C4DFF', width: 1, type: 'dashed' } }
    },
    legend: {
      data: ['历史馆负载', '艺术中心负载', '科技馆负载'],
      textStyle: { color: '#9ca3af', fontSize: 10 },
      bottom: '0%',
      icon: 'circle'
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '12%',
      bottom: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'],
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '在馆率 %',
      nameTextStyle: { color: '#9ca3af', fontSize: 10 },
      axisLine: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.04)' } }
    },
    series: [
      {
        name: '历史馆负载',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#00E5FF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 229, 255, 0.25)' },
            { offset: 1, color: 'rgba(0, 229, 255, 0)' }
          ])
        },
        data: [35, 62, 85, 92, 70, 48, 20]
      },
      {
        name: '艺术中心负载',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#7C4DFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124, 77, 255, 0.25)' },
            { offset: 1, color: 'rgba(124, 77, 255, 0)' }
          ])
        },
        data: [20, 40, 55, 80, 88, 75, 45]
      },
      {
        name: '科技馆负载',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#00E676' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 230, 118, 0.2)' },
            { offset: 1, color: 'rgba(0, 230, 118, 0)' }
          ])
        },
        data: [15, 30, 72, 65, 82, 60, 30]
      }
    ]
  }

  chartInstance.setOption(option)
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)

  // Stagger reveal animation for recommendations
  const container = recommendationsRef.value
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        anime({
          targets: '.rec-card',
          translateX: [100, 0],
          opacity: [0, 1],
          delay: anime.stagger(150),
          duration: 1000,
          easing: 'easeOutQuint'
        })
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  if (container) {
    observer.observe(container)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  if (observer) observer.disconnect()
})
</script>

<template>
  <div ref="recommendationsRef" class="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
    <div class="glass-panel p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden bg-gradient-to-br from-cyber-slate/30 to-cyber-dark/80">
      
      <!-- Backdrop Purple Shimmer Glow -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyber-purple/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Left Side: Custom ECharts Load Predictor -->
        <div class="col-span-1 lg:col-span-7 flex flex-col">
          <div class="mb-6">
            <span class="text-xs font-display text-cyber-green tracking-widest uppercase flex items-center">
              <i class="fas fa-chart-line mr-2"></i>PREDICTIVE MODELING DEMAND
            </span>
            <h3 class="text-2xl md:text-3xl font-bold text-white mt-2 font-art tracking-wider">
              全域 AI 动态客流与负载预测看板
            </h3>
            <p class="text-gray-400 text-sm mt-2 leading-relaxed">
              分析历史十亿级数据交互，实时生成场馆未来24小时客流承载模型，指导错峰智能预约。
            </p>
          </div>

          <!-- Chart Div -->
          <div class="w-full bg-cyber-dark/60 border border-white/5 rounded-2xl p-4">
            <div ref="chartRef" class="w-full h-[280px]"></div>
          </div>
        </div>

        <!-- Right Side: AI Recommends -->
        <div class="col-span-1 lg:col-span-5 flex flex-col space-y-6">
          <div>
            <span class="text-xs font-display text-cyber-purple tracking-widest uppercase flex items-center">
              <i class="fas fa-brain mr-2"></i>INTELLIGENT PREFERENCE MATCHING
            </span>
            <h3 class="text-2xl md:text-3xl font-bold text-white mt-1 font-art tracking-wider">
              AI 兴趣智慧推荐
            </h3>
            <p class="text-gray-400 text-xs mt-1">
              基于您的数字画像及客流拥堵预测，精准避堵推荐特展。
            </p>
          </div>

          <!-- Recommendations Carousel List -->
          <div class="flex flex-col space-y-4">
            <div 
              v-for="rec in recommendations" 
              :key="rec.id"
              class="rec-card opacity-0 group flex items-start space-x-4 p-4 rounded-2xl bg-cyber-slate/20 border border-white/5 hover:border-cyber-purple/40 hover:bg-cyber-slate/30 transition-all duration-300 cursor-pointer"
            >
              <!-- Icon Container -->
              <div class="p-3.5 rounded-xl bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple text-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-cyber-purple/20">
                <i class="fas" :class="[rec.icon]"></i>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-display text-cyber-blue font-semibold">{{ rec.venue }}</span>
                  <span class="text-xs font-bold font-display text-cyber-green flex items-center">
                    <i class="fas fa-brain mr-1 text-[10px]"></i>
                    {{ rec.match }}% Match
                  </span>
                </div>
                <h4 class="text-base font-bold text-white mt-1 truncate group-hover:text-cyber-blue transition-colors duration-200 font-art tracking-wider">
                  {{ rec.title }}
                </h4>
                <p class="text-gray-400 text-xs mt-1 line-clamp-2">
                  {{ rec.reason }}
                </p>
                <div class="flex items-center justify-between mt-3 text-[10px] text-gray-500 font-display">
                  <span>{{ rec.date }}</span>
                  <span class="px-2 py-0.5 rounded bg-cyber-dark text-cyber-purple border border-cyber-purple/20 font-bold">{{ rec.tag }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>
