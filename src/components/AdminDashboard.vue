<script setup>
import { onMounted, onUnmounted, ref, reactive, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import anime from 'animejs'

// Mock Active Booking Database
const bookings = ref([
  { id: 'TKT129038', name: '李建国', phone: '138****9201', venueName: '数字孪生历史博物馆', slot: '09:00 - 12:00', status: 'verified', statusText: '已核销', date: '2026-05-23' },
  { id: 'TKT890234', name: '张明阳', phone: '159****2382', venueName: '极光未来艺术中心', slot: '13:00 - 16:00', status: 'booked', statusText: '已出票', date: '2026-05-23' },
  { id: 'TKT450281', name: '王志华', phone: '173****0194', venueName: 'AI智慧科技探索馆', slot: '09:30 - 12:30', status: 'booked', statusText: '已出票', date: '2026-05-23' },
  { id: 'TKT560291', name: '陈晓梅', phone: '186****5678', venueName: '全息光影大剧院', slot: '14:00 - 16:30', status: 'booked', statusText: '已出票', date: '2026-05-23' },
  { id: 'TKT789230', name: '刘小雨', phone: '135****4321', venueName: '数字孪生历史博物馆', slot: '12:00 - 15:00', status: 'verified', statusText: '已核销', date: '2026-05-23' },
  { id: 'TKT183029', name: '赵爱莲', phone: '150****8899', venueName: '极光未来艺术中心', slot: '16:00 - 19:00', status: 'pending', statusText: '锁票中', date: '2026-05-23' }
])

const statistics = reactive({
  reservationsToday: 3842,
  clusterQps: 845,
  gatewaySla: 99.98,
  containerCpu: 38.5
})

const adminLogs = ref([
  { id: 1, time: '03:55:01', level: 'INFO', logger: 'c.a.c.s.g.f.AuthFilter', msg: 'Token validation success for UID: 82019.' },
  { id: 2, time: '03:55:02', level: 'DEBUG', logger: 'c.a.c.b.m.TicketMapper', msg: 'execute SELECT count(*) FROM ticket WHERE date="2026-05-23"' },
  { id: 3, time: '03:55:05', level: 'INFO', logger: 'o.s.c.a.n.r.NacosServiceRegistry', msg: 'registering service booking-service with instance 192.168.1.102:8081' },
  { id: 4, time: '03:55:08', level: 'WARN', logger: 'c.a.c.r.s.RecommendationEngine', msg: 'Neural match latency exceeded 120ms for session SEC_9281' }
])

const distributionChartRef = ref(null)
let distributionChart = null
let refreshInterval = null

// Dynamic log generation
const addAdminLog = () => {
  const loggers = [
    'c.a.c.s.g.f.AuthFilter',
    'c.a.c.b.m.TicketMapper',
    'o.s.c.a.n.r.NacosServiceRegistry',
    'c.a.c.r.s.RecommendationEngine',
    'c.a.c.w.w.WebTrafficController',
    'o.s.s.c.SentinelFlowInterceptor'
  ]
  const msgs = [
    'User cache hit in Redis cluster. TTL extended to 1800s.',
    'Gateway load balancing selected booking-service-replica-2',
    'Sentinel rule synchronized. QPS throttling boundary is updated.',
    'Database pool connection leased. active=14, idle=42, max=100',
    'Asynchronous ticket printing task submitted to RabbitMQ queue: tkt-print-exchange',
    'Distributed transaction completed. Seata global-session XID: 192.168.1.100:9091:123'
  ]
  const levels = ['INFO', 'INFO', 'DEBUG', 'WARN']
  const level = Math.random() > 0.9 ? 'WARN' : levels[Math.floor(Math.random() * levels.length)]
  const logger = loggers[Math.floor(Math.random() * loggers.length)]
  const msg = msgs[Math.floor(Math.random() * msgs.length)]
  const time = new Date().toTimeString().split(' ')[0]

  adminLogs.value.unshift({ id: Date.now(), time, level, logger, msg })
  if (adminLogs.value.length > 25) {
    adminLogs.value.pop()
  }
}

// Simulated active booking feed addition
const addNewBookingFeed = () => {
  const names = ['曾小梅', '廖明华', '彭大勇', '许建飞', '陆婉莹', '邓小军']
  const venues = ['数字孪生历史博物馆', '极光未来艺术中心', 'AI智慧科技探索馆', '全息光影大剧院']
  const slots = ['09:00 - 12:00', '13:00 - 16:00', '19:00 - 21:30']
  const statusList = ['verified', 'booked', 'pending']
  const statusTexts = { verified: '已核销', booked: '已出票', pending: '锁票中' }

  const status = statusList[Math.floor(Math.random() * statusList.length)]
  const newB = {
    id: 'TKT' + Math.floor(Math.random() * 900000 + 100000),
    name: names[Math.floor(Math.random() * names.length)],
    phone: '1' + ['3', '5', '8', '7'][Math.floor(Math.random() * 4)] + '****' + Math.floor(Math.random() * 9000 + 1000),
    venueName: venues[Math.floor(Math.random() * venues.length)],
    slot: slots[Math.floor(Math.random() * slots.length)],
    status,
    statusText: statusTexts[status],
    date: '2026-05-23'
  }

  bookings.value.unshift(newB)
  if (bookings.value.length > 8) {
    bookings.value.pop()
  }

  // Flash row index 0 row using anime.js
  setTimeout(() => {
    anime({
      targets: '.booking-table-row-0',
      backgroundColor: ['rgba(0,229,255,0.15)', 'rgba(0,0,0,0)'],
      duration: 1000,
      easing: 'easeOutQuad'
    })
  }, 50)
  
  // Increment statistics
  statistics.reservationsToday++
}

// Cancel Booking Callback
const cancelBooking = (id) => {
  const idx = bookings.value.findIndex(b => b.id === id)
  if (idx !== -1) {
    bookings.value[idx].status = 'cancelled'
    bookings.value[idx].statusText = '已取消'
    
    addAdminLog()
    adminLogs.value.unshift({
      id: Date.now(),
      time: new Date().toTimeString().split(' ')[0],
      level: 'WARN',
      logger: 'c.a.c.b.m.TicketMapper',
      msg: `[Admin Action] ticket id ${id} cancelled by sys_admin override.`
    })

    anime({
      targets: `#row-${id}`,
      opacity: [1, 0.5],
      duration: 350,
      easing: 'easeOutQuad'
    })
  }
}

// Render Request distribution chart
const initDistributionChart = () => {
  if (!distributionChartRef.value) return
  distributionChart = echarts.init(distributionChartRef.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0D0E12',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e5e7eb' }
    },
    series: [
      {
        name: '微服务链路请求分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#0d0e12', borderWidth: 2 },
        label: {
          show: true,
          color: '#9ca3af',
          fontSize: 9,
          position: 'outside',
          formatter: '{b}: {d}%'
        },
        labelLine: {
          lineStyle: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        data: [
          { value: 1240, name: 'booking-service', itemStyle: { color: '#FF4081' } },
          { value: 850, name: 'api-gateway', itemStyle: { color: '#00E5FF' } },
          { value: 450, name: 'auth-service', itemStyle: { color: '#7C4DFF' } },
          { value: 310, name: 'recommend-service', itemStyle: { color: '#00E676' } }
        ]
      }
    ]
  }
  distributionChart.setOption(option)
}

const handleResize = () => {
  distributionChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initDistributionChart()
  })

  // Start telemetry fluctuations & live feeds
  refreshInterval = setInterval(() => {
    addAdminLog()
    if (Math.random() > 0.6) {
      addNewBookingFeed()
    }

    // Fluctuating metric tiles
    statistics.clusterQps = Math.max(700, Math.min(1200, statistics.clusterQps + Math.floor(Math.random() * 51) - 25))
    statistics.containerCpu = parseFloat(Math.max(25, Math.min(85, statistics.containerCpu + Math.random() * 4 - 2)).toFixed(1))
  }, 4000)

  window.addEventListener('resize', handleResize)

  // Stagger entry widgets
  anime({
    targets: '.stat-widget-card',
    opacity: [0, 1],
    translateY: [25, 0],
    delay: anime.stagger(100),
    duration: 800,
    easing: 'easeOutElastic(1, .85)'
  })
})

onUnmounted(() => {
  clearInterval(refreshInterval)
  window.removeEventListener('resize', handleResize)
  distributionChart?.dispose()
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
    <!-- Header -->
    <div class="mb-12">
      <span class="text-rose-500 font-display text-xs tracking-widest uppercase flex items-center">
        <i class="fas fa-eye mr-2"></i>ADMIN OBSERVATION POST
      </span>
      <h2 class="text-3xl md:text-5xl font-art text-white tracking-wider mt-2 hologram-text-purple">
        科研观察哨 / 后台管理
      </h2>
      <p class="text-gray-400 text-sm mt-3">
        微服务后台特权控制台。提供系统全局吞吐统计指标、活跃预订条目表、与核心集群链路数据包调用分发遥测。
      </p>
    </div>

    <!-- Stats summary grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <!-- Card 1 -->
      <div class="stat-widget-card opacity-0 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyber-blue/5 blur-xl pointer-events-none"></div>
        <div class="flex justify-between items-start text-gray-500 text-[10px] font-display uppercase tracking-wider">
          <span>今日预订总容量</span>
          <i class="fas fa-ticket-simple text-cyber-blue"></i>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-display font-bold text-white">{{ statistics.reservationsToday }}</span>
          <span class="text-[9px] text-cyber-green font-display ml-2 font-semibold">新增+12.4%</span>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="stat-widget-card opacity-0 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyber-green/5 blur-xl pointer-events-none"></div>
        <div class="flex justify-between items-start text-gray-500 text-[10px] font-display uppercase tracking-wider">
          <span>集群总并发吞吐</span>
          <i class="fas fa-network-wired text-cyber-green"></i>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-display font-bold text-white">{{ statistics.clusterQps }}</span>
          <span class="text-[9px] text-gray-500 font-display ml-2 uppercase">QPS</span>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="stat-widget-card opacity-0 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyber-purple/5 blur-xl pointer-events-none"></div>
        <div class="flex justify-between items-start text-gray-500 text-[10px] font-display uppercase tracking-wider">
          <span>网关健康率 SLA</span>
          <i class="fas fa-shield-halved text-cyber-purple"></i>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-display font-bold text-white">{{ statistics.gatewaySla }}%</span>
          <span class="text-[9px] text-cyber-green font-display ml-2 font-semibold">STABLE</span>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="stat-widget-card opacity-0 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-rose-500/5 blur-xl pointer-events-none"></div>
        <div class="flex justify-between items-start text-gray-500 text-[10px] font-display uppercase tracking-wider">
          <span>容器宿主 CPU 载荷</span>
          <i class="fas fa-microchip text-rose-500"></i>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-display font-bold text-white">{{ statistics.containerCpu }}%</span>
          <span class="text-[9px] text-gray-500 font-display ml-2">8 NODE SHARD</span>
        </div>
      </div>

    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left: Active bookings records -->
      <div class="col-span-1 lg:col-span-8 flex flex-col space-y-6">
        
        <!-- Table container -->
        <div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between flex-1 overflow-hidden">
          <h3 class="text-sm font-art text-white mb-6 flex items-center tracking-wide">
            <i class="fas fa-server text-cyber-blue mr-2"></i>活跃预订事务实例库
          </h3>

          <div class="flex-1 overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-white/5 text-gray-500 font-display">
                  <th class="pb-3.5 pl-2">流水单号</th>
                  <th class="pb-3.5">姓名</th>
                  <th class="pb-3.5">场馆</th>
                  <th class="pb-3.5">预约时段</th>
                  <th class="pb-3.5">状态</th>
                  <th class="pb-3.5 text-right pr-4">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-gray-300 font-display">
                <tr 
                  v-for="(booking, idx) in bookings" 
                  :key="booking.id"
                  :id="`row-${booking.id}`"
                  class="hover:bg-white/5 transition-colors"
                  :class="idx === 0 ? 'booking-table-row-0' : ''"
                >
                  <td class="py-4 pl-2 font-bold" :class="booking.status === 'cancelled' ? 'text-gray-600 line-through' : 'text-cyber-blue'">{{ booking.id }}</td>
                  <td class="py-4 font-semibold font-art tracking-wide">{{ booking.name }}</td>
                  <td class="py-4 text-gray-400 font-sans">{{ booking.venueName }}</td>
                  <td class="py-4 text-[10px]">{{ booking.slot }}</td>
                  <td class="py-4">
                    <span 
                      class="px-2 py-0.5 rounded text-[9px] font-bold"
                      :class="[
                        booking.status === 'verified' ? 'bg-cyber-green/10 text-cyber-green' : '',
                        booking.status === 'booked' ? 'bg-cyber-blue/10 text-cyber-blue' : '',
                        booking.status === 'pending' ? 'bg-amber-400/10 text-amber-400' : '',
                        booking.status === 'cancelled' ? 'bg-white/5 text-gray-500' : ''
                      ]"
                    >
                      {{ booking.statusText }}
                    </span>
                  </td>
                  <td class="py-4 text-right pr-4">
                    <button 
                      v-if="booking.status !== 'cancelled' && booking.status !== 'verified'"
                      class="text-rose-500 hover:text-rose-400 hover:underline active:scale-95 transition-all text-[10px] font-sans"
                      @click="cancelBooking(booking.id)"
                    >
                      撤销
                    </button>
                    <span v-else class="text-gray-600 text-[10px] font-sans">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>

      <!-- Right: Charts & Raw console logs -->
      <div class="col-span-1 lg:col-span-4 flex flex-col space-y-6">
        
        <!-- Echarts service load distribution -->
        <div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
          <h3 class="text-sm font-art text-white mb-4 flex items-center tracking-wide">
            <i class="fas fa-chart-pie text-cyber-purple mr-2"></i>微服务链路调用分布
          </h3>
          <div ref="distributionChartRef" class="w-full h-[180px]"></div>
        </div>

        <!-- Raw trace events logs console -->
        <div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex-1 min-h-[300px] flex flex-col justify-between">
          <h3 class="text-xs font-display uppercase tracking-widest text-gray-400 mb-4 flex items-center">
            <i class="fas fa-terminal mr-2 text-rose-500"></i>
            微服务分布式追踪日志 (Stdout)
          </h3>

          <div class="flex-1 overflow-y-auto max-h-[220px] space-y-2.5 pr-2 font-display text-[9px] leading-tight">
            <div 
              v-for="log in adminLogs" 
              :key="log.id"
              class="border-b border-white/5 pb-2 last:border-0"
            >
              <div class="flex items-center justify-between text-gray-500 mb-1">
                <span>[{{ log.time }}]</span>
                <span 
                  :class="[
                    log.level === 'WARN' ? 'text-amber-400 font-bold' : '',
                    log.level === 'INFO' ? 'text-cyber-green' : '',
                    log.level === 'DEBUG' ? 'text-cyber-blue' : ''
                  ]"
                >
                  [{{ log.level }}]
                </span>
              </div>
              <div class="text-gray-400 font-semibold text-[8px] truncate mb-0.5">{{ log.logger }}</div>
              <div class="text-gray-200">{{ log.msg }}</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* Table scrollbar rules */
</style>
