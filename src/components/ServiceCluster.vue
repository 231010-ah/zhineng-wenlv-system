<script setup>
import { onMounted, onUnmounted, ref, reactive, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import anime from 'animejs'

// Microservice nodes data
const nodes = ref([
  { id: 'gateway', name: 'api-gateway', label: '网关路由', icon: 'fa-network-wired', status: 'healthy', qps: 340, latency: 4.2, cpu: 22, mem: 45, ip: '192.168.1.100', instances: 2, maxInstances: 4 },
  { id: 'auth', name: 'auth-service', label: '安全鉴权', icon: 'fa-shield-halved', status: 'healthy', qps: 180, latency: 8.5, cpu: 15, mem: 55, ip: '192.168.1.101', instances: 2, maxInstances: 3 },
  { id: 'booking', name: 'booking-service', label: '预约服务', icon: 'fa-ticket-simple', status: 'healthy', qps: 220, latency: 12.1, cpu: 34, mem: 62, ip: '192.168.1.102', instances: 3, maxInstances: 5 },
  { id: 'recommend', name: 'recommend-service', label: '推荐智舱', icon: 'fa-brain', status: 'healthy', qps: 80, latency: 24.3, cpu: 48, mem: 75, ip: '192.168.1.103', instances: 2, maxInstances: 4 },
  { id: 'nacos', name: 'nacos-registry', label: '注册与配置中心', icon: 'fa-folder-tree', status: 'healthy', qps: 50, latency: 2.1, cpu: 12, mem: 38, ip: '192.168.1.50', instances: 3, maxInstances: 3 },
  { id: 'sentinel', name: 'sentinel-dashboard', label: '限流熔断防护哨', icon: 'fa-user-shield', status: 'healthy', qps: 25, latency: 1.5, cpu: 10, mem: 30, ip: '192.168.1.51', instances: 1, maxInstances: 1 },
  { id: 'database', name: 'db-cluster', label: '高可用数据库', icon: 'fa-database', status: 'healthy', qps: 450, latency: 3.8, cpu: 41, mem: 80, ip: '192.168.1.200', instances: 3, maxInstances: 3 }
])

const selectedNodeId = ref('booking')
const selectedNode = ref(nodes.value.find(n => n.id === 'booking'))

// Sentinel configs
const sentinelRule = reactive({
  enableFlowLimit: false,
  flowLimitQps: 150,
  enableLatencyInjection: false,
  injectedLatency: 1.2,
  circuitBreakerActive: false
})

const liveQpsLog = ref([])

// Telemetry ECharts config
const telemetryChartRef = ref(null)
let telemetryChart = null
let updateTimer = null
let chartDataPoints = {
  cpu: Array(10).fill(0).map(() => Math.floor(Math.random() * 20) + 20),
  mem: Array(10).fill(0).map(() => Math.floor(Math.random() * 10) + 50),
  timestamps: Array(10).fill(0).map((_, i) => {
    const d = new Date()
    d.setSeconds(d.getSeconds() - (10 - i) * 3)
    return d.toTimeString().split(' ')[0]
  })
}

// Watch selected node change to refresh chart titles and reset data spikes
watch(selectedNodeId, (newId) => {
  selectedNode.value = nodes.value.find(n => n.id === newId)
  if (telemetryChart) {
    chartDataPoints.cpu = Array(10).fill(0).map(() => Math.floor(Math.random() * 20) + selectedNode.value.cpu - 10)
    chartDataPoints.mem = Array(10).fill(0).map(() => Math.floor(Math.random() * 5) + selectedNode.value.mem - 2)
    updateChart()
  }
  
  // Trigger card highlight anime
  anime({
    targets: `.node-detail-panel`,
    opacity: [0, 1],
    translateX: [20, 0],
    duration: 350,
    easing: 'easeOutQuad'
  })
})

const initChart = () => {
  if (!telemetryChartRef.value) return
  telemetryChart = echarts.init(telemetryChartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!telemetryChart) return
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0D0E12',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e5e7eb' }
    },
    legend: {
      data: ['CPU 使用率', '内存 使用率'],
      textStyle: { color: '#9ca3af', fontSize: 10 },
      top: '0%'
    },
    grid: { top: '15%', bottom: '15%', left: '3%', right: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartDataPoints.timestamps,
      axisLabel: { color: '#9ca3af', fontSize: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#9ca3af', fontSize: 9, formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
    },
    series: [
      {
        name: 'CPU 使用率',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartDataPoints.cpu,
        lineStyle: { width: 2, color: '#00E5FF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 229, 255, 0.15)' },
            { offset: 1, color: 'rgba(0, 229, 255, 0)' }
          ])
        }
      },
      {
        name: '内存 使用率',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartDataPoints.mem,
        lineStyle: { width: 2, color: '#7C4DFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124, 77, 255, 0.15)' },
            { offset: 1, color: 'rgba(124, 77, 255, 0)' }
          ])
        }
      }
    ]
  }
  telemetryChart.setOption(option)
}

const handleResize = () => {
  telemetryChart?.resize()
}

// Scale replicas up/down
const adjustReplicas = (node, delta) => {
  const nextVal = node.instances + delta
  if (nextVal >= 1 && nextVal <= node.maxInstances) {
    node.instances = nextVal
    
    // Add event log
    const type = delta > 0 ? 'info' : 'warning'
    const act = delta > 0 ? '扩容' : '缩容'
    addQpsLog(type, `[Nacos Config] 节点 ${node.name} 触发弹性动态${act}，当前副本数: ${node.instances}`)
    
    // Play scale visual pulse
    anime({
      targets: `#node-card-${node.id}`,
      scale: [1, 1.05, 1],
      duration: 500,
      easing: 'easeInOutQuad'
    })
  }
}

// Toggle Node Health (Simulate Failover)
const toggleNodeHealth = (node) => {
  node.status = node.status === 'healthy' ? 'unhealthy' : 'healthy'
  const logType = node.status === 'healthy' ? 'success' : 'danger'
  const statusStr = node.status === 'healthy' ? '重连上线' : '断开连接 (模拟宕机故障)'
  addQpsLog(logType, `[节点注册变更] 拓扑节点 ${node.name} ${statusStr}. Nacos 注册表执行实时同步`)
  
  if (node.status === 'unhealthy') {
    node.qps = 0
    node.cpu = 0
  }
}

// Add logs to local dashboard monitor
const addQpsLog = (type, msg) => {
  const time = new Date().toTimeString().split(' ')[0]
  liveQpsLog.value.unshift({ id: Date.now(), time, type, msg })
  if (liveQpsLog.value.length > 15) liveQpsLog.value.pop()
}

// Update simulation statistics
const stepSimulation = () => {
  nodes.value.forEach(n => {
    if (n.status === 'unhealthy') return

    // Standard metric fluctuations
    let qpsChange = Math.floor(Math.random() * 21) - 10
    n.qps = Math.max(10, n.qps + qpsChange)
    
    let cpuChange = Math.floor(Math.random() * 9) - 4
    n.cpu = Math.max(5, Math.min(95, n.cpu + cpuChange))

    let memChange = Math.floor(Math.random() * 3) - 1
    n.mem = Math.max(15, Math.min(95, n.mem + memChange))

    // Booking service behavior is affected by flow control rules
    if (n.id === 'booking') {
      // Latency injection check
      if (sentinelRule.enableLatencyInjection) {
        n.latency = parseFloat((12.1 + sentinelRule.injectedLatency * 1000 + (Math.random() * 5)).toFixed(1))
        
        // Trigger degradation if latency is high and limit exists
        if (n.latency > 500 && !sentinelRule.circuitBreakerActive) {
          sentinelRule.circuitBreakerActive = true
          n.status = 'degraded'
          addQpsLog('danger', `[Sentinel 熔断] booking-service 平均响应延迟达 ${n.latency}ms，触发服务熔断降级！下发 Fallback 默认容错兜底数据`)
        }
      } else {
        n.latency = parseFloat((12.1 + (Math.random() * 4)).toFixed(1))
        if (sentinelRule.circuitBreakerActive) {
          sentinelRule.circuitBreakerActive = false
          n.status = 'healthy'
          addQpsLog('success', `[Sentinel 熔断恢复] booking-service 延迟指标恢复至正常区间，服务熔断器关闭，重新接入主干业务`)
        }
      }

      // QPS flow limit check
      if (sentinelRule.enableFlowLimit) {
        if (n.qps > sentinelRule.flowLimitQps) {
          const rejectedQps = n.qps - sentinelRule.flowLimitQps
          n.qps = sentinelRule.flowLimitQps
          addQpsLog('warning', `[Sentinel 限流] booking-service 瞬时流量达 ${n.qps + rejectedQps}QPS，拦截并阻断 ${rejectedQps} 次越限请求，SLA 拦截率: ${(rejectedQps/(n.qps+rejectedQps)*100).toFixed(1)}%`)
        }
      }
    }
  })

  // Append new data point to the graph
  if (telemetryChart && selectedNode.value) {
    chartDataPoints.timestamps.push(new Date().toTimeString().split(' ')[0])
    chartDataPoints.timestamps.shift()

    chartDataPoints.cpu.push(selectedNode.value.cpu)
    chartDataPoints.cpu.shift()

    chartDataPoints.mem.push(selectedNode.value.mem)
    chartDataPoints.mem.shift()

    updateChart()
  }
}

onMounted(() => {
  addQpsLog('info', 'Sentinel 限流监控底座加载完毕. 心跳检测已同 Nacos 完成互锁')
  addQpsLog('success', 'Nacos 负载均衡策略就绪: dynamic-round-robin. 集群注册数: 7')
  
  nextTick(() => {
    initChart()
  })

  updateTimer = setInterval(stepSimulation, 3000)
  window.addEventListener('resize', handleResize)
  
  // Stagger load nodes animation
  anime({
    targets: '.node-card-item',
    opacity: [0, 1],
    translateY: [30, 0],
    delay: anime.stagger(80),
    duration: 600,
    easing: 'easeOutQuad'
  })
})

onUnmounted(() => {
  clearInterval(updateTimer)
  window.removeEventListener('resize', handleResize)
  telemetryChart?.dispose()
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
    <!-- Header -->
    <div class="mb-12">
      <span class="text-cyber-purple font-display text-xs tracking-widest uppercase flex items-center">
        <i class="fas fa-network-wired mr-2"></i>MICROSERVICE CLUSTER GRAPH
      </span>
      <h2 class="text-3xl md:text-5xl font-art text-white tracking-wider mt-2 hologram-text-purple">
        云原生微服务集群拓扑
      </h2>
      <p class="text-gray-400 text-sm mt-3">
        实时监控高并发文旅微服务注册状态，支持 Nacos 分布式副本伸缩管理与 Sentinel 双重熔断限流仿真控制。
      </p>
    </div>

    <!-- Cluster Grid Dashboard Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column: Cluster Topology Network -->
      <div class="col-span-1 lg:col-span-8 flex flex-col space-y-6">
        
        <!-- Live Node Registry Topology -->
        <div class="glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex-1">
          <!-- Glass background decor -->
          <div class="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyber-purple/5 blur-3xl pointer-events-none"></div>

          <h3 class="text-sm font-semibold text-white mb-6 flex items-center">
            <i class="fas fa-diagram-project text-cyber-purple mr-2"></i>Nacos 微服务注册拓扑架构
          </h3>

          <!-- Node Connections Graphic Layout -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative">
            <div 
              v-for="node in nodes" 
              :key="node.id"
              :id="`node-card-${node.id}`"
              class="node-card-item glass-card p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 relative"
              :class="[
                selectedNodeId === node.id ? 'border-cyber-purple bg-cyber-purple/5 shadow-glow-purple/10' : 'border-white/5 hover:border-white/15',
                node.status === 'unhealthy' ? 'opacity-40 border-rose-500/20' : '',
                node.status === 'degraded' ? 'border-amber-500/40 bg-amber-500/5' : ''
              ]"
              @click="selectedNodeId = node.id"
            >
              <!-- Small Badge indicator -->
              <span class="absolute top-3 right-3 flex h-2 w-2">
                <span 
                  class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  :class="node.status === 'healthy' ? 'bg-cyber-green' : node.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'"
                ></span>
                <span 
                  class="relative inline-flex rounded-full h-2 w-2"
                  :class="node.status === 'healthy' ? 'bg-cyber-green' : node.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'"
                ></span>
              </span>

              <div>
                <!-- Icon + Title -->
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center border text-sm"
                    :style="{ 
                      color: node.id === 'booking' ? '#FF4081' : node.id === 'recommend' ? '#7C4DFF' : '#00E5FF',
                      borderColor: node.id === 'booking' ? '#FF408120' : node.id === 'recommend' ? '#7C4DFF20' : '#00E5FF20'
                    }"
                  >
                    <i class="fas" :class="[node.icon]"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-display font-bold text-white">{{ node.name }}</h4>
                    <p class="text-[10px] text-gray-500 font-semibold font-art">{{ node.label }}</p>
                  </div>
                </div>

                <!-- Info summary parameters -->
                <div class="mt-4 space-y-1.5 text-[10px] font-display">
                  <div class="flex justify-between">
                    <span class="text-gray-500">IP 地址:</span>
                    <span class="text-gray-300">{{ node.ip }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">副本数量:</span>
                    <span class="text-gray-300">{{ node.instances }} / {{ node.maxInstances }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">网络吞吐:</span>
                    <span class="text-gray-300 font-bold" :style="{ color: node.status === 'degraded' ? '#ffb300' : '#00E676' }">
                      {{ node.qps }} QPS
                    </span>
                  </div>
                </div>
              </div>

              <!-- Footer Buttons -->
              <div class="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <div class="flex space-x-1">
                  <button 
                    class="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-[9px] transition-colors"
                    title="缩减副本"
                    @click.stop="adjustReplicas(node, -1)"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <button 
                    class="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-[9px] transition-colors"
                    title="增加副本"
                    @click.stop="adjustReplicas(node, 1)"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>

                <button 
                  class="px-2.5 py-0.5 rounded text-[8px] font-semibold border transition-all active:scale-95"
                  :class="node.status === 'healthy' || node.status === 'degraded' ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20'"
                  @click.stop="toggleNodeHealth(node)"
                >
                  {{ node.status === 'healthy' || node.status === 'degraded' ? '拔线宕机' : '插线重连' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminal Output Logger Console -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 min-h-[220px] flex flex-col justify-between">
          <h3 class="text-xs font-display uppercase tracking-widest text-gray-400 mb-4 flex items-center">
            <i class="fas fa-chart-line mr-2 text-cyber-purple"></i>
            微服务调度心跳日志流
          </h3>

          <div class="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-2 font-display text-[10px]">
            <div 
              v-for="log in liveQpsLog" 
              :key="log.id"
              class="flex items-start space-x-2 border-b border-white/5 pb-1 last:border-0"
            >
              <span class="text-gray-500 shrink-0">[{{ log.time }}]</span>
              
              <span 
                v-if="log.type === 'success'" 
                class="text-cyber-green font-semibold shrink-0"
              >
                [NACOS]
              </span>
              <span 
                v-else-if="log.type === 'warning'" 
                class="text-amber-400 font-semibold shrink-0"
              >
                [LIMIT]
              </span>
              <span 
                v-else-if="log.type === 'danger'" 
                class="text-rose-500 font-extrabold shrink-0 animate-pulse"
              >
                [FAILOVER]
              </span>
              <span 
                v-else 
                class="text-cyber-blue font-semibold shrink-0"
              >
                [TUNNEL]
              </span>

              <span class="text-gray-300">{{ log.msg }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Control Panel & Live telemetry -->
      <div class="col-span-1 lg:col-span-4 flex flex-col space-y-6">
        
        <!-- Sentinel Rule panel -->
        <div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 class="text-base font-art text-white flex items-center justify-between tracking-wide">
              <span>Sentinel 智能防护哨</span>
              <i class="fas fa-shield text-cyber-purple"></i>
            </h3>
            
            <p class="text-[10px] text-gray-500 mt-2 leading-relaxed">
              部署于 Gateway 及预约业务层。当高并发时段流量超出单机阈值，自动丢弃越限请求以维持容器 SLA 存活率。
            </p>

            <!-- Rules toggle list -->
            <div class="mt-6 space-y-6">
              
              <!-- Rule 1 QPS limit -->
              <div class="p-4 rounded-2xl bg-cyber-slate/40 border border-white/5 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-xs font-art text-white tracking-wide">QPS 流量阈值限流</span>
                    <span class="text-[9px] text-gray-500">当 QPS 越限时进行流量拦截</span>
                  </div>
                  <input 
                    v-model="sentinelRule.enableFlowLimit"
                    type="checkbox"
                    class="w-9 h-5 rounded-full bg-cyber-slate appearance-none cursor-pointer relative checked:bg-cyber-purple transition-all duration-300 before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-[2px] before:left-[2px] checked:before:left-[18px] before:transition-all"
                  />
                </div>

                <div v-if="sentinelRule.enableFlowLimit" class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-display text-gray-400">
                    <span>QPS 熔断上限值:</span>
                    <span class="text-cyber-purple font-semibold">{{ sentinelRule.flowLimitQps }} QPS</span>
                  </div>
                  <input 
                    v-model="sentinelRule.flowLimitQps"
                    type="range"
                    min="50"
                    max="300"
                    class="w-full h-1 bg-cyber-slate rounded-lg appearance-none cursor-pointer accent-cyber-purple"
                  />
                </div>
              </div>

              <!-- Rule 2 Latency inject -->
              <div class="p-4 rounded-2xl bg-cyber-slate/40 border border-white/5 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-xs font-art text-white tracking-wide">高延迟故障注入</span>
                    <span class="text-[9px] text-gray-500">模拟下游依赖出现数据库挂起</span>
                  </div>
                  <input 
                    v-model="sentinelRule.enableLatencyInjection"
                    type="checkbox"
                    class="w-9 h-5 rounded-full bg-cyber-slate appearance-none cursor-pointer relative checked:bg-cyber-purple transition-all duration-300 before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-[2px] before:left-[2px] checked:before:left-[18px] before:transition-all"
                  />
                </div>

                <div v-if="sentinelRule.enableLatencyInjection" class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-display text-gray-400">
                    <span>注入响应延迟:</span>
                    <span class="text-amber-400 font-semibold">{{ sentinelRule.injectedLatency }} 秒</span>
                  </div>
                  <input 
                    v-model="sentinelRule.injectedLatency"
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    class="w-full h-1 bg-cyber-slate rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

            </div>
          </div>

          <div 
            v-if="sentinelRule.circuitBreakerActive"
            class="mt-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-[10px] text-rose-300 font-mono flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <i class="fas fa-triangle-exclamation text-rose-500 text-xs animate-pulse"></i>
              <span>熔断降级已拉起: Circuit Breaker Open</span>
            </div>
            <span class="text-[9px] bg-rose-500 text-white font-bold px-1 rounded uppercase">DEGRADED</span>
          </div>
        </div>

        <!-- Node telemetry chart -->
        <div class="node-detail-panel glass-panel p-6 rounded-[2.5rem] border border-white/5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold text-white mb-2 flex items-center">
              <i class="fas fa-chart-area text-cyber-blue mr-2"></i>
              <span class="font-display text-xs">{{ selectedNode?.name }}</span> 遥测面板
            </h3>
            <div class="grid grid-cols-2 gap-4 mt-4 font-display text-xs">
              <div class="p-3 bg-cyber-slate/30 border border-white/5 rounded-xl">
                <span class="text-[9px] text-gray-500 block font-sans">CPU 负荷率</span>
                <span class="text-lg font-bold text-white">{{ selectedNode?.cpu }}%</span>
              </div>
              <div class="p-3 bg-cyber-slate/30 border border-white/5 rounded-xl">
                <span class="text-[9px] text-gray-500 block font-sans">内存 占用率</span>
                <span class="text-lg font-bold text-white">{{ selectedNode?.mem }}%</span>
              </div>
            </div>
          </div>

          <!-- Chart container -->
          <div class="mt-6 flex-1 min-h-[180px]">
            <div ref="telemetryChartRef" class="w-full h-[180px]"></div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
