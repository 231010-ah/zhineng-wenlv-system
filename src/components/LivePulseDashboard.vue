<script setup>
import anime from 'animejs'
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue'

// Target values for mock data
const targetInVenue = ref(2458)
const totalCapacity = 5000

// Reactive counts object for Anime.js rolling animation
const counts = reactive({
  inVenue: 0,
  availableTickets: 1240,
  apiRequests: 843
})

// Current traffic warning level: 'safe' (green), 'warning' (yellow), 'congested' (red)
const statusLevel = computed(() => {
  const ratio = counts.inVenue / totalCapacity
  if (ratio < 0.5) return 'safe'
  if (ratio < 0.8) return 'warning'
  return 'congested'
})

// Active warning light color
const warningColorClass = computed(() => {
  switch (statusLevel.value) {
    case 'safe': return 'text-cyber-green bg-cyber-green/10 border-cyber-green/40 shadow-glow-green'
    case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
    case 'congested': return 'text-rose-500 bg-rose-500/10 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
  }
})

// Active microservice status list
const services = ref([
  { id: 'gateway', name: 'Gateway', icon: 'fa-route', status: 'online', x: 40, y: 50 },
  { id: 'nacos', name: 'Nacos Registry', icon: 'fa-database', status: 'online', x: 140, y: 20 },
  { id: 'auth', name: 'Auth Service', icon: 'fa-shield-halved', status: 'online', x: 140, y: 80 },
  { id: 'venue', name: 'Venue Service', icon: 'fa-ticket-simple', status: 'online', x: 260, y: 50 }
])

let pulseTimer = null
let animationRef = null

// Initialize number-rolling animations
const initRollingAnimations = () => {
  // Animate on load
  anime({
    targets: counts,
    inVenue: targetInVenue.value,
    availableTickets: 2548,
    apiRequests: 1492,
    round: 1,
    duration: 3000,
    easing: 'easeOutExpo'
  })
}

// Periodically update statistics (fluctuation simulation)
const startStatsFluctuation = () => {
  pulseTimer = setInterval(() => {
    // Generate organic changes
    const trafficChange = Math.floor(Math.random() * 200) - 80 // bias positive
    targetInVenue.value = Math.max(800, Math.min(4800, targetInVenue.value + trafficChange))
    
    // Dynamic tickets decrease as people enter
    const ticketChange = -Math.floor(trafficChange * 0.4)
    const newTickets = Math.max(100, Math.min(3000, counts.availableTickets + ticketChange))

    // API rate spikes
    const newApiRate = Math.floor(Math.random() * 800) + 1200

    // Smoothly animate fluctuations
    anime({
      targets: counts,
      inVenue: targetInVenue.value,
      availableTickets: newTickets,
      apiRequests: newApiRate,
      round: 1,
      duration: 1500,
      easing: 'easeInOutQuad'
    })

    // Trigger pulse warning lamp scale transition
    anime({
      targets: '.warning-lamp-ring',
      scale: [1, 1.4, 1],
      opacity: [1, 0.4, 1],
      duration: 800,
      easing: 'easeOutQuad'
    })
  }, 5000)
}

onMounted(() => {
  initRollingAnimations()
  startStatsFluctuation()

  // Node connection animation setup using animejs for SVGs
  anime({
    targets: '.service-link-flow',
    strokeDashoffset: [100, 0],
    duration: 3000,
    loop: true,
    easing: 'linear'
  })
})

onUnmounted(() => {
  if (pulseTimer) clearInterval(pulseTimer)
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 relative z-10 -mt-16">
    <div class="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-glass grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      
      <!-- Part 1: Visitor Live Counts -->
      <div class="col-span-1 lg:col-span-4 flex items-center space-x-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
        <div class="p-4 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-2xl flex items-center justify-center">
          <i class="fas fa-users"></i>
        </div>
        <div class="flex-1">
          <p class="text-xs uppercase tracking-widest text-gray-400 font-display">实时在馆人流 (Live Traffic)</p>
          <div class="flex items-baseline space-x-2 mt-1">
            <span class="text-4xl font-display font-bold tracking-tight text-white">{{ counts.inVenue }}</span>
            <span class="text-xs text-gray-400 font-display">/ {{ totalCapacity }} 人</span>
          </div>
          <div class="w-full bg-cyber-slate/50 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
            <div 
              class="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple transition-all duration-1000 ease-out rounded-full"
              :style="{ width: `${(counts.inVenue / totalCapacity) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Part 2: Security and API Health Status -->
      <div class="col-span-1 lg:col-span-4 grid grid-cols-2 gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
        <!-- Ticket availability -->
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-widest text-gray-400 flex items-center font-display">
            <i class="fas fa-ticket-simple text-cyber-purple mr-1.5"></i>今日余票
          </span>
          <span class="text-2xl font-display font-bold text-white mt-1">{{ counts.availableTickets }}</span>
          <span class="text-[10px] text-cyber-purple/80 mt-0.5">智能实时调配</span>
        </div>

        <!-- Warning Light Indicator -->
        <div class="flex items-center space-x-3 bg-cyber-slate/30 border border-white/5 rounded-xl p-3">
          <div class="relative flex items-center justify-center w-6 h-6">
            <div 
              class="warning-lamp-ring absolute inset-0 rounded-full border border-current opacity-40"
              :class="statusLevel === 'safe' ? 'text-cyber-green' : statusLevel === 'warning' ? 'text-amber-400' : 'text-rose-500'"
            ></div>
            <div 
              class="w-3.5 h-3.5 rounded-full border shadow-sm transition-colors duration-500"
              :class="warningColorClass"
            ></div>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-white">
              {{ statusLevel === 'safe' ? '安全运行' : statusLevel === 'warning' ? '客流预警' : '限流预留' }}
            </span>
            <span class="text-[10px] text-gray-400">客流负荷监控</span>
          </div>
        </div>
      </div>

      <!-- Part 3: Microservice Cluster Topology -->
      <div class="col-span-1 lg:col-span-4 flex flex-col justify-center">
        <div class="flex justify-between items-center mb-2 px-1">
          <span class="text-xs uppercase tracking-widest text-gray-400 flex items-center font-display">
            <i class="fas fa-microchip text-cyber-blue mr-1.5"></i>云原生微服务网路
          </span>
          <span class="text-[10px] font-display text-cyber-green flex items-center font-semibold">
            <span class="w-1.5 h-1.5 bg-cyber-green rounded-full animate-ping mr-1.5"></span>
            99.98% SLA
          </span>
        </div>

        <!-- SVG Topology Diagram -->
        <div class="relative w-full h-[90px] bg-cyber-dark/40 border border-white/5 rounded-2xl overflow-hidden p-2 flex items-center justify-center">
          <svg viewBox="0 0 300 100" class="w-full h-full max-w-[320px]">
            <!-- Glowing Connections -->
            <path d="M 40,50 L 140,20 L 260,50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
            <path d="M 40,50 L 140,80 L 260,50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
            <path d="M 40,50 L 260,50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />

            <!-- Anime.js Animated flow lines -->
            <path d="M 40,50 L 140,20 L 260,50" fill="none" stroke="url(#blue-gradient)" stroke-width="2" stroke-dasharray="10 20" class="service-link-flow" />
            <path d="M 40,50 L 140,80 L 260,50" fill="none" stroke="url(#purple-gradient)" stroke-width="2" stroke-dasharray="8 25" class="service-link-flow" />
            <path d="M 40,50 L 260,50" fill="none" stroke="url(#green-gradient)" stroke-width="2" stroke-dasharray="12 18" class="service-link-flow" />

            <!-- Gradients Definition -->
            <defs>
              <linearGradient id="blue-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.1"/>
                <stop offset="50%" stop-color="#00E5FF" stop-opacity="1"/>
                <stop offset="100%" stop-color="#7C4DFF" stop-opacity="0.1"/>
              </linearGradient>
              <linearGradient id="purple-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#7C4DFF" stop-opacity="0.1"/>
                <stop offset="50%" stop-color="#7C4DFF" stop-opacity="1"/>
                <stop offset="100%" stop-color="#00E5FF" stop-opacity="0.1"/>
              </linearGradient>
              <linearGradient id="green-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.1"/>
                <stop offset="50%" stop-color="#00E676" stop-opacity="1"/>
                <stop offset="100%" stop-color="#00E5FF" stop-opacity="0.1"/>
              </linearGradient>
            </defs>

            <!-- Render Nodes -->
            <g v-for="node in services" :key="node.id" :transform="`translate(${node.x}, ${node.y})`">
              <!-- Glow background -->
              <circle r="14" fill="#0D0E12" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
              <circle r="12" fill="rgba(30, 34, 48, 0.6)" />
              
              <!-- Icon inside circle -->
              <foreignObject x="-8" y="-9" width="16" height="16">
                <div class="flex items-center justify-center text-[10px] w-full h-full" :class="node.id === 'gateway' ? 'text-cyber-green' : node.id === 'nacos' ? 'text-cyber-blue' : node.id === 'auth' ? 'text-amber-400' : 'text-cyber-purple'">
                  <i :class="`fas ${node.icon}`"></i>
                </div>
              </foreignObject>

              <!-- Node label -->
              <text y="24" text-anchor="middle" fill="rgba(255, 255, 255, 0.45)" font-size="6" font-family="monospace">
                {{ node.name }}
              </text>
            </g>
          </svg>

          <!-- Floating Data Rate overlay -->
          <div class="absolute bottom-1 right-2 text-[8px] font-display text-gray-500 tracking-wider">
            RATE: <span class="text-cyber-blue font-bold">{{ counts.apiRequests }} req/s</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
