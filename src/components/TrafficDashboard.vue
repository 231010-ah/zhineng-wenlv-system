<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const flowChartRef = ref(null)
const ageChartRef = ref(null)
const durationChartRef = ref(null)

let flowChart = null
let ageChart = null
let durationChart = null

const alertThreshold = ref(80) // default 80% threshold
const currentLoadRatio = ref(68)
const isAlertActive = ref(false)

const logs = ref([
  { id: 1, time: '03:52:10', type: 'info', msg: 'Gateway dynamic flow router configured. SLA online.' },
  { id: 2, time: '03:53:15', type: 'info', msg: 'System check: 4 cluster nodes successfully synchronized.' },
  { id: 3, time: '03:54:02', type: 'success', msg: 'Visitor check-in: Ticket TKT78923012 validated at Museum.' },
  { id: 4, time: '03:54:40', type: 'success', msg: 'Visitor check-in: Ticket TKT18302919 validated at Art Space.' }
])

let logInterval = null
let resizeObserver = null

// Randomly generate stream logs
const addLogEvent = () => {
  const venues = ['历史博物馆', '未来艺术中心', '智慧科技馆', '光影大剧院']
  const types = ['success', 'info', 'warning']
  const type = Math.random() > 0.85 ? 'warning' : Math.random() > 0.4 ? 'success' : 'info'
  const time = new Date().toTimeString().split(' ')[0]
  
  let msg = ''
  if (type === 'success') {
    const ticketId = 'TKT' + Math.floor(Math.random() * 900000 + 100000)
    msg = `游客入馆: 电子门禁成功验证 ${ticketId} @ ${venues[Math.floor(Math.random() * venues.length)]}`
  } else if (type === 'warning') {
    msg = `负荷预警: ${venues[Math.floor(Math.random() * venues.length)]} 局部区域瞬时人流密度较高`
  } else {
    msg = `微服务心跳: 节点 booking-service [192.168.2.14:8081] 负载指标响应正常`
  }

  logs.value.unshift({ id: Date.now(), time, type, msg })
  if (logs.value.length > 25) {
    logs.value.pop()
  }
}

// Watch alert threshold and current load
watch([alertThreshold, currentLoadRatio], () => {
  if (currentLoadRatio.value >= alertThreshold.value) {
    isAlertActive.value = true
    if (!logs.value.some(l => l.msg.includes('【告警】系统触及用户设定阈值'))) {
      logs.value.unshift({
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        type: 'danger',
        msg: `【告警】系统总体在馆率 (${currentLoadRatio.value}%) 触及设定阈值 (${alertThreshold.value}%)`
      })
    }
  } else {
    isAlertActive.value = false
  }
})

// Periodic load simulation
const startLoadFluctuation = () => {
  logInterval = setInterval(() => {
    addLogEvent()
    // Fluctuate load ratio between 60% and 92%
    const change = Math.floor(Math.random() * 5) - 2
    currentLoadRatio.value = Math.max(55, Math.min(95, currentLoadRatio.value + change))
  }, 3000)
}

// Render hourly traffic chart
const initFlowChart = () => {
  if (!flowChartRef.value) return
  flowChart = echarts.init(flowChartRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#0D0E12', borderColor: 'rgba(255,255,255,0.1)' },
    grid: { top: '10%', bottom: '15%', left: '5%', right: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'],
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
    },
    series: [{
      name: '在馆客流趋势',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: [1200, 2400, 3100, 4200, 3800, 2100, 800],
      lineStyle: { width: 3, color: '#00E5FF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 229, 255, 0.25)' },
          { offset: 1, color: 'rgba(0, 229, 255, 0)' }
        ])
      }
    }]
  }
  flowChart.setOption(option)
}

// Render age donut chart
const initAgeChart = () => {
  if (!ageChartRef.value) return
  ageChart = echarts.init(ageChartRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#0D0E12', borderColor: 'rgba(255,255,255,0.1)' },
    legend: { show: false },
    series: [{
      name: '参观年龄分布',
      type: 'pie',
      radius: ['55%', '80%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#0d0e12', borderWidth: 2 },
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 1842, name: '青年 (18-35)', itemStyle: { color: '#00E5FF' } },
        { value: 1205, name: '中年 (36-55)', itemStyle: { color: '#7C4DFF' } },
        { value: 654, name: '亲子儿童', itemStyle: { color: '#00E676' } },
        { value: 342, name: '老年 (56+)', itemStyle: { color: '#FF4081' } }
      ]
    }]
  }
  ageChart.setOption(option)
}

// Render dwell duration bar chart
const initDurationChart = () => {
  if (!durationChartRef.value) return
  durationChart = echarts.init(durationChartRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: '5%', bottom: '15%', left: '5%', right: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
    },
    yAxis: {
      type: 'category',
      data: ['<1h', '1-2h', '2-4h', '4h+'],
      axisLabel: { color: '#9ca3af', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    series: [{
      name: '停留时长分布',
      type: 'bar',
      barWidth: '50%',
      data: [
        { value: 450, itemStyle: { color: '#FF4081' } },
        { value: 1200, itemStyle: { color: '#7C4DFF' } },
        { value: 1850, itemStyle: { color: '#00E5FF' } },
        { value: 920, itemStyle: { color: '#00E676' } }
      ],
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  }
  durationChart.setOption(option)
}

const handleResize = () => {
  flowChart?.resize()
  ageChart?.resize()
  durationChart?.resize()
}

onMounted(() => {
  initFlowChart()
  initAgeChart()
  initDurationChart()
  startLoadFluctuation()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (logInterval) clearInterval(logInterval)
  flowChart?.dispose()
  ageChart?.dispose()
  durationChart?.dispose()
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
    <!-- Header -->
    <div class="mb-12">
      <span class="text-cyber-blue font-display text-xs tracking-widest uppercase flex items-center">
        <i class="fas fa-chart-pie mr-2"></i>REALTIME CROWD ANALYTICS
      </span>
      <h2 class="text-3xl md:text-5xl font-art text-white tracking-wider mt-2 hologram-text">
        全域实时客流看板
      </h2>
      <p class="text-gray-400 text-sm mt-3">
        运用IoT网关及三维红外客流计数器，实现毫秒级客流汇聚、多维画像渲染及动态超限报警。
      </p>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column: Controls & Console -->
      <div class="col-span-1 lg:col-span-4 flex flex-col space-y-6">
        
        <!-- Controller Card -->
        <div 
          class="glass-panel p-6 rounded-[2rem] border transition-all duration-500 relative"
          :class="isAlertActive ? 'border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.15)] bg-rose-950/10' : 'border-white/5'"
        >
          <!-- Alert warning header flashing -->
          <div v-if="isAlertActive" class="absolute inset-x-0 top-0 h-1 bg-rose-500 animate-pulse"></div>

          <h3 class="text-base font-art text-white flex items-center justify-between tracking-wide">
            <span>预警控制中枢</span>
            <span 
              class="w-2.5 h-2.5 rounded-full"
              :class="isAlertActive ? 'bg-rose-500 animate-ping' : 'bg-cyber-green'"
            ></span>
          </h3>

          <!-- Load Ratio details -->
          <div class="mt-6 flex justify-between items-baseline">
            <span class="text-xs text-gray-400">总体在馆率</span>
            <div class="flex items-baseline space-x-1">
              <span class="text-3xl font-display font-bold text-white" :class="isAlertActive ? 'text-rose-500 text-glow-purple' : 'text-cyber-blue text-glow-blue'">{{ currentLoadRatio }}</span>
              <span class="text-xs text-gray-500 font-display">%</span>
            </div>
          </div>

          <!-- Alert threshold controller slider -->
          <div class="mt-6 space-y-2">
            <div class="flex justify-between text-[11px] text-gray-400 font-display">
              <span>告警阈值上限</span>
              <span class="text-cyber-blue font-bold">{{ alertThreshold }}%</span>
            </div>
            <input 
              v-model="alertThreshold" 
              type="range" 
              min="50" 
              max="95" 
              class="w-full h-1 bg-cyber-slate rounded-lg appearance-none cursor-pointer accent-cyber-blue"
            />
          </div>

          <p class="text-[10px] text-gray-500 leading-relaxed mt-5">
            配置阈值上限后，若总体在馆负荷越线，系统将自适应限制预约名额、下发微服务降级熔断策略，并联动发送现场限流通知。
          </p>
        </div>

        <!-- Terminal Log Console -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 flex-1 flex flex-col min-h-[300px]">
          <h3 class="text-xs font-display uppercase tracking-widest text-gray-400 mb-4 flex items-center">
            <i class="fas fa-terminal mr-2 text-cyber-blue"></i>
            实时数据流监视器
          </h3>

          <!-- Live Scrolling Logs wrapper -->
          <div class="flex-1 overflow-y-auto max-h-[360px] space-y-3 pr-2 font-display text-[10px]">
            <div 
              v-for="log in logs" 
              :key="log.id"
              class="flex items-start space-x-2 border-b border-white/5 pb-2 last:border-0"
            >
              <!-- Log types -->
              <span class="text-gray-500 font-bold shrink-0">[{{ log.time }}]</span>
              
              <span 
                v-if="log.type === 'success'" 
                class="text-cyber-green font-semibold shrink-0"
              >
                [INLET]
              </span>
              <span 
                v-else-if="log.type === 'warning'" 
                class="text-amber-400 font-semibold shrink-0"
              >
                [WARN]
              </span>
              <span 
                v-else-if="log.type === 'danger'" 
                class="text-rose-500 font-extrabold shrink-0"
              >
                [CRIT]
              </span>
              <span 
                v-else 
                class="text-cyber-blue font-semibold shrink-0"
              >
                [INFO]
              </span>

              <span class="text-gray-300">{{ log.msg }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: ECharts Bento Dashboard -->
      <div class="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Hour peak Load line -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 md:col-span-2">
          <h3 class="text-sm font-semibold text-white mb-4 flex items-center">
            <i class="fas fa-clock text-cyber-blue mr-2"></i>24小时客流负荷趋势
          </h3>
          <div ref="flowChartRef" class="w-full h-[220px]"></div>
        </div>

        <!-- Age donut -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold text-white mb-2 flex items-center">
              <i class="fas fa-circle-half-stroke text-cyber-purple mr-2"></i>参观人群画像分布
            </h3>
            <span class="text-[10px] text-gray-500">依据智能摄像头身份比对样本汇总</span>
          </div>

          <div class="flex items-center justify-between mt-4">
            <!-- Legend display -->
            <div class="space-y-2 text-xs">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyber-blue"></span>
                <span class="text-gray-400">青年 42%</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyber-purple"></span>
                <span class="text-gray-400">中年 30%</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyber-green"></span>
                <span class="text-gray-400">儿童 18%</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span class="text-gray-400">老年 10%</span>
              </div>
            </div>
            
            <div ref="ageChartRef" class="w-[120px] h-[120px]"></div>
          </div>
        </div>

        <!-- Dwell Duration bar -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold text-white mb-2 flex items-center">
              <i class="fas fa- hourglass text-cyber-green mr-2"></i>游客停留时长统计
            </h3>
            <span class="text-[10px] text-gray-500">在馆时长区间占比及趋势监控</span>
          </div>
          <div ref="durationChartRef" class="w-full h-[140px] mt-2"></div>
        </div>

      </div>

    </div>
  </div>
</template>
