<script setup>
import { onMounted, onUnmounted, ref, inject } from 'vue'
import anime from 'animejs'

const switchPage = inject('switchPage')
const goToReservation = () => {
  if (switchPage) {
    switchPage('reservation')
  }
}

const showcaseRef = ref(null)
let observer = null

const items = ref([
  {
    id: 1,
    title: '数字孪生历史博物馆',
    subtitle: 'Digital Twin History Museum',
    category: '国家一级场馆',
    image: 'https://picsum.photos/seed/museum/800/600',
    visitors: '1,248 人在馆',
    status: '免预约',
    badgeIcon: 'fa-landmark',
    cols: 'md:col-span-8',
    color: '#00E5FF',
    desc: '集成高保真数字孪生系统，跨越时空展现千年华夏遗迹，3D全息文物即时互动。'
  },
  {
    id: 2,
    title: '极光未来艺术中心',
    subtitle: 'Aurora Future Art Space',
    category: '光影沉浸特展',
    image: 'https://picsum.photos/seed/art/600/600',
    visitors: '412 人在馆',
    status: '剩余24张',
    badgeIcon: 'fa-palette',
    cols: 'md:col-span-4',
    color: '#7C4DFF',
    desc: '数字媒体与极光交织，感受算法浪潮下的情感共鸣。'
  },
  {
    id: 3,
    title: 'AI智慧科技探索馆',
    subtitle: 'AI Science & Tech Pavilion',
    category: '微服务交互中心',
    image: 'https://picsum.photos/seed/tech/600/600',
    visitors: '856 人在馆',
    status: '紧张预约',
    badgeIcon: 'fa-microchip',
    cols: 'md:col-span-4',
    color: '#00E676',
    desc: '机器人交互、神经网络可视化，沉浸式体验AGI未来的微缩轮廓。'
  },
  {
    id: 4,
    title: '全息光影大剧院',
    subtitle: 'Holographic Neon Theatre',
    category: '声学沉浸舞台',
    image: 'https://picsum.photos/seed/theater/800/600',
    visitors: '1,590 人在馆',
    status: '火热进行',
    badgeIcon: 'fa-masks-theater',
    cols: 'md:col-span-8',
    color: '#FF4081',
    desc: '声影联合呈现，采用全息空气成像技术重现经典昆曲与交响乐的双重交融。'
  }
])

// Staggered fade-in on scroll entrance
onMounted(() => {
  const container = showcaseRef.value
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Run stagger entry animations
        anime({
          targets: '.exhibition-card',
          translateY: [70, 0],
          opacity: [0, 1],
          scale: [0.96, 1],
          delay: anime.stagger(120),
          duration: 1200,
          easing: 'easeOutElastic(1, .85)'
        })
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  if (container) {
    observer.observe(container)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Interactive 3D Tilt logic
const handleMouseMove = (e, id) => {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  // Calculate offset relative to card center
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = ((y - centerY) / centerY) * -10 // max 10 degrees tilt
  const rotateY = ((x - centerX) / centerX) * 10
  
  // Apply smooth transforms via standard inline styles
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`
  
  // Spotlight follow effect
  const glow = card.querySelector('.spotlight-glow')
  if (glow) {
    glow.style.left = `${x}px`
    glow.style.top = `${y}px`
    glow.style.opacity = '0.18'
  }
}

const handleMouseLeave = (e) => {
  const card = e.currentTarget
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  
  const glow = card.querySelector('.spotlight-glow')
  if (glow) {
    glow.style.opacity = '0'
  }
}
</script>

<template>
  <div ref="showcaseRef" class="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-10">
    <!-- Header -->
    <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between">
      <div>
        <span class="text-cyber-blue font-display text-sm tracking-widest uppercase flex items-center">
          <i class="fas fa-compass-drafting mr-2 animate-spin-slow"></i>CULTURAL VENUES SHOWCASE
        </span>
        <h2 class="text-3xl md:text-5xl font-extrabold tracking-wider text-white mt-2 font-art">
          非对称场馆/核心特展流
        </h2>
      </div>
      <p class="text-gray-400 max-w-[45ch] text-sm md:text-base mt-4 md:mt-0 leading-relaxed border-l-2 border-cyber-purple pl-4">
        依托微服务底座的动态资源调配，打造多维数字虚拟世界与物理世界的实时映像。
      </p>
    </div>

    <!-- Asymmetric Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div 
        v-for="item in items" 
        :key="item.id"
        :class="[item.cols, 'exhibition-card opacity-0']"
        class="group relative overflow-hidden rounded-[2.5rem] bg-cyber-slate/20 border border-white/5 cursor-pointer transition-all duration-300 ease-out"
        style="will-change: transform;"
        @mousemove="handleMouseMove($event, item.id)"
        @mouseleave="handleMouseLeave($event)"
        @click="goToReservation"
      >
        <!-- Card Background Spotlight Effect -->
        <div class="spotlight-glow absolute w-60 h-60 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full blur-3xl opacity-0 pointer-events-none transition-opacity duration-300"></div>

        <!-- Image Container -->
        <div class="relative w-full h-[260px] md:h-[340px] overflow-hidden">
          <img 
            :src="item.image" 
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105 filter brightness-90 saturate-75 group-hover:brightness-100 group-hover:saturate-100"
          />
          <!-- Image overlay gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-cyber-bg via-cyber-bg/40 to-transparent"></div>
          
          <!-- Floating Category Badge -->
          <div class="absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-cyber-bg/70 border border-white/10 text-white flex items-center space-x-2">
            <i class="fas" :class="[item.badgeIcon]" :style="{ color: item.color }"></i>
            <span>{{ item.category }}</span>
          </div>

          <!-- Live Visitors Badge -->
          <div class="absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-display font-semibold tracking-wide backdrop-blur-md bg-black/60 border border-cyber-green/30 text-cyber-green flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 bg-cyber-green rounded-full animate-ping"></span>
            <span>{{ item.visitors }}</span>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-8 pt-0 relative z-10 flex flex-col justify-between -mt-6">
          <div>
            <!-- Subtitle -->
            <span class="text-xs font-display tracking-wider uppercase" :style="{ color: item.color }">
              {{ item.subtitle }}
            </span>
            <!-- Title -->
            <h3 class="text-2xl font-bold text-white mt-1 group-hover:text-glow-blue transition-all duration-300 font-art tracking-wider">
              {{ item.title }}
            </h3>
            <!-- Description -->
            <p class="text-gray-400 text-sm mt-3 leading-relaxed max-w-[65ch]">
              {{ item.desc }}
            </p>
          </div>

          <!-- Booking Trigger & Details -->
          <div class="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono py-0.5 px-2 rounded bg-cyber-slate/50 border border-white/5 text-gray-300">
                {{ item.status }}
              </span>
            </div>
            <!-- Booking Button -->
            <div class="flex items-center space-x-2 text-xs font-semibold text-white group-hover:text-cyber-blue transition-colors duration-300">
              <span>立即探索</span>
              <span class="p-2 rounded-full bg-white/5 group-hover:bg-cyber-blue/20 transition-all duration-300 transform group-hover:translate-x-1">
                <i class="fas fa-ticket-simple"></i>
              </span>
            </div>
          </div>
        </div>

        <!-- Decorative Border Corner Accents -->
        <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-30 pointer-events-none" :style="{ borderColor: item.color }"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-30 pointer-events-none" :style="{ borderColor: item.color }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
