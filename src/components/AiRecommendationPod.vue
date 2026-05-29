<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import anime from 'animejs'

const switchPage = inject('switchPage')
const goToReservation = () => {
  if (switchPage) {
    switchPage('reservation')
  }
}

// Interest tags
const tags = ref([
  { id: 'archeology', label: '三维古物考古', desc: '古代遗迹重构与文物复刻', icon: 'fa-monument', selected: true },
  { id: 'lightShadow', label: '数字光影沉浸', desc: '算法渲染与光子瀑布流', icon: 'fa-wand-magic-sparkles', selected: false },
  { id: 'aiSim', label: '计算机物理仿真与AI', desc: '大语言模型与边缘计算实体', icon: 'fa-robot', selected: false },
  { id: 'acoustics', label: '跨次元声学戏剧', desc: '全息空间音频与互动剧场', icon: 'fa-masks-theater', selected: true },
  { id: 'astronomy', label: '物理与宇宙星图', desc: '数字太空望远镜与暗物质模拟', icon: 'fa-user-astronaut', selected: false },
  { id: 'generative', label: '分形生成艺术', desc: '生成式对抗网络与数学流体', icon: 'fa-bezier-curve', selected: false }
])

const isScanning = ref(false)
const scanProgress = ref(0)
const hasScanned = ref(false)
const recommendations = ref([])

// Mock database matching
const venueDatabase = [
  {
    id: 'museum',
    name: '数字孪生历史博物馆',
    tags: ['archeology', 'lightShadow'],
    matchText: '提取到高频“历史碎片”电磁波，与您的古物考古及数字重构兴趣完美互振。',
    bg: 'from-cyan-500/20 to-blue-500/10',
    color: '#00E5FF'
  },
  {
    id: 'art',
    name: '极光未来艺术中心',
    tags: ['lightShadow', 'generative'],
    matchText: '感知大脑突触对分形美学及流体着色器有强烈兴奋信号，该艺术展包含实时粒子互动。',
    bg: 'from-purple-500/20 to-pink-500/10',
    color: '#7C4DFF'
  },
  {
    id: 'tech',
    name: 'AI智慧科技探索馆',
    tags: ['aiSim', 'astronomy'],
    matchText: '您的逻辑皮层活动剧烈，系统推演表明人形仿真实验室及量子流图谱能为您带来极佳体验。',
    bg: 'from-emerald-500/20 to-teal-500/10',
    color: '#00E676'
  },
  {
    id: 'theater',
    name: '全息光影大剧院',
    tags: ['acoustics', 'lightShadow'],
    matchText: '空间听觉通路与前额叶视觉重叠度较高，推荐观赏声影音浪编织的沉浸式音画演出。',
    bg: 'from-rose-500/20 to-purple-500/10',
    color: '#FF4081'
  }
]

const toggleTag = (tag) => {
  if (isScanning.value) return
  tag.selected = !tag.selected
}

const triggerBrainwaveSync = () => {
  if (isScanning.value) return
  
  isScanning.value = true
  hasScanned.value = false
  scanProgress.value = 0
  recommendations.value = []

  // 1. High speed rotation of HUD circles
  anime({
    targets: '.hud-circle-outer',
    rotate: [0, 360],
    duration: 2000,
    easing: 'linear',
    loop: true
  })
  
  anime({
    targets: '.hud-circle-inner',
    rotate: [0, -360],
    duration: 1500,
    easing: 'linear',
    loop: true
  })

  // 2. Play moving green laser scanner line
  anime({
    targets: '.scanner-laser-bar',
    top: ['0%', '100%'],
    opacity: [0, 1, 1, 0],
    duration: 1200,
    direction: 'alternate',
    loop: 2,
    easing: 'easeInOutQuad'
  })

  // 3. Scan progress ticker
  const progressObj = { value: 0 }
  anime({
    targets: progressObj,
    value: 100,
    round: 1,
    duration: 2400,
    easing: 'easeInOutQuad',
    update: () => {
      scanProgress.value = progressObj.value
    },
    complete: () => {
      isScanning.value = false
      hasScanned.value = true
      
      // Stop HUD loops
      anime.remove('.hud-circle-outer')
      anime.remove('.hud-circle-inner')
      
      calculateMatches()
    }
  })
}

const calculateMatches = () => {
  const selectedTagIds = tags.value.filter(t => t.selected).map(t => t.id)
  
  if (selectedTagIds.length === 0) {
    recommendations.value = [
      {
        name: '空脑域适配状态',
        matchScore: 30,
        matchText: '未检索到选择的脑电突触倾向，建议您重新配对兴趣磁条以获取更精准匹配。',
        bg: 'from-gray-500/10 to-gray-500/5',
        color: '#9ca3af'
      }
    ]
    return
  }

  const results = []
  
  venueDatabase.forEach(venue => {
    // Find overlap
    const overlap = venue.tags.filter(t => selectedTagIds.includes(t))
    if (overlap.length > 0) {
      // Calculate match score
      let score = 60 + Math.floor((overlap.length / venue.tags.length) * 30) + Math.floor(Math.random() * 9)
      score = Math.min(99, score)
      
      results.push({
        ...venue,
        matchScore: score
      })
    }
  })

  // Sort by score descending
  results.sort((a, b) => b.matchScore - a.matchScore)
  
  // If nothing matched, pick one randomly with low score
  if (results.length === 0) {
    const randomVenue = venueDatabase[Math.floor(Math.random() * venueDatabase.length)]
    results.push({
      ...randomVenue,
      matchScore: 45,
      matchText: '依据脑干静止状态推测，我们为您推荐通用型展馆以激活探索兴趣。'
    })
  }

  recommendations.value = results

  // Stagger animate recommended cards
  setTimeout(() => {
    anime({
      targets: '.rec-match-card',
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(120),
      duration: 650,
      easing: 'easeOutElastic(1, .8)'
    })
  }, 50)
}

onMounted(() => {
  // Rotate concentric HUDs slowly on idle
  anime({
    targets: '.hud-circle-outer',
    rotate: [0, 360],
    duration: 20000,
    easing: 'linear',
    loop: true
  })
  
  anime({
    targets: '.hud-circle-inner',
    rotate: [0, -360],
    duration: 15000,
    easing: 'linear',
    loop: true
  })
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
    <!-- Header -->
    <div class="mb-12">
      <span class="text-cyber-green font-display text-xs tracking-widest uppercase flex items-center">
        <i class="fas fa-brain mr-2 animate-pulse"></i>AI RECOMMENDER POD
      </span>
      <h2 class="text-3xl md:text-5xl font-art text-white tracking-wider mt-2 hologram-text">
        AI 智能推荐脑舱
      </h2>
      <p class="text-gray-400 text-sm mt-3">
        戴上虚拟脑电采集束，选取您当下的探索锚点，AI 将通过脑电波神经元匹配，为您定制今日文化场馆观展动线。
      </p>
    </div>

    <!-- Main Brain Capsule Split Screen -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      
      <!-- Left: Interactive Mind Tag Registry Panel -->
      <div class="col-span-1 lg:col-span-5 flex flex-col space-y-6">
        
        <div class="glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between flex-1 relative overflow-hidden">
          
          <div>
            <h3 class="text-sm font-art text-white mb-2 flex items-center tracking-wide">
              <i class="fas fa-microchip text-cyber-green mr-2"></i>神经元突触锚点配置
            </h3>
            <p class="text-[10px] text-gray-500 mb-6">点击选取您当下大脑最为活跃或倾向的文化领域，支持多选互串</p>

            <!-- Tags Grid List -->
            <div class="space-y-3">
              <div 
                v-for="tag in tags" 
                :key="tag.id"
                class="glass-card p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-300 select-none"
                :class="[
                  tag.selected ? 'border-cyber-green bg-cyber-green/5' : 'border-white/5 hover:border-white/12',
                  isScanning ? 'pointer-events-none opacity-50' : ''
                ]"
                @click="toggleTag(tag)"
              >
                <div class="flex items-center space-x-3.5">
                  <div 
                    class="w-9 h-9 rounded-lg flex items-center justify-center border text-xs"
                    :class="tag.selected ? 'text-cyber-green border-cyber-green/30 bg-cyber-green/5' : 'text-gray-400 border-white/5 bg-white/5'"
                  >
                    <i class="fas" :class="[tag.icon]"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-art text-white tracking-wide">{{ tag.label }}</h4>
                    <p class="text-[9px] text-gray-500 mt-0.5 leading-none font-sans">{{ tag.desc }}</p>
                  </div>
                </div>

                <div 
                  class="w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-300"
                  :class="tag.selected ? 'bg-cyber-green border-cyber-green text-cyber-bg' : 'border-white/20'"
                >
                  <i v-if="tag.selected" class="fas fa-check text-[9px] font-bold"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Trigger Sync Sync CTA Button -->
          <div class="mt-8 border-t border-white/5 pt-6 flex flex-col space-y-4">
            <button 
              class="w-full h-12 rounded-2xl text-xs font-semibold text-white tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg bg-cyber-green relative overflow-hidden"
              :class="isScanning ? 'opacity-70 pointer-events-none' : ''"
              @click="triggerBrainwaveSync"
            >
              <i class="fas fa-satellite-dish" :class="{ 'animate-spin': isScanning }"></i>
              <span>{{ isScanning ? '脑电波同振捕获中...' : '同步兴趣脑电波' }}</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Right: Immersive Laser Scanning Simulation Screen -->
      <div class="col-span-1 lg:col-span-7 flex flex-col space-y-6">
        
        <!-- Interactive Brain Scanning Monitor -->
        <div class="glass-panel p-8 rounded-[2.5rem] border border-white/5 min-h-[380px] flex flex-col items-center justify-center relative overflow-hidden">
          
          <!-- Moving Scanning Laser Line Overlay -->
          <div 
            class="scanner-laser-bar absolute left-0 right-0 h-[3px] bg-cyber-green opacity-0 shadow-[0_0_15px_#00E676] pointer-events-none"
            style="top: 0;"
          ></div>

          <!-- Concentric Ring HUD and Rotating brain symbol -->
          <div class="relative w-48 h-48 flex items-center justify-center">
            
            <!-- Concentric HUD Ring Outer (concentric dotted/dashed) -->
            <div class="hud-circle-outer absolute inset-0 rounded-full border border-dashed border-cyber-green/20"></div>
            <!-- Concentric HUD Ring Inner (dashed) -->
            <div class="hud-circle-inner absolute inset-3 rounded-full border border-dashed border-cyber-green/40 opacity-70"></div>
            <!-- Inner Solid border with rotating markers -->
            <div class="absolute inset-8 rounded-full border border-white/5 bg-black/40 flex items-center justify-center">
              
              <!-- Large flashing pulsing brain icon -->
              <div class="text-4xl text-cyber-green flex items-center justify-center relative z-10">
                <i class="fas fa-brain" :class="{ 'animate-pulse text-glow-green': isScanning }"></i>
              </div>

              <!-- Scanning status info text overlay inside circle -->
              <div v-if="isScanning" class="absolute bottom-5 text-[8px] font-display text-cyber-green font-bold animate-pulse">
                SCANNING: {{ scanProgress }}%
              </div>
            </div>

          </div>

          <!-- Description and status message below HUD -->
          <div class="text-center mt-6 max-w-[40ch]">
            <span v-if="!isScanning && !hasScanned" class="text-xs text-gray-500 font-display">
              [等待同振信号] 请配置左侧脑区倾向并按下按钮开始。
            </span>
            <span v-else-if="isScanning" class="text-xs text-cyber-green font-display flex items-center justify-center space-x-1.5">
              <span class="w-1.5 h-1.5 bg-cyber-green rounded-full animate-ping"></span>
              <span>正在向微服务推荐引擎下发偏好散列谱...</span>
            </span>
            <span v-else class="text-xs text-gray-400 font-semibold font-display">
              [适配完成] 神经递质画像推演结束，推荐如下匹配场馆：
            </span>
          </div>

        </div>

        <!-- Matching results output container -->
        <div v-if="hasScanned" class="space-y-4">
          <div 
            v-for="rec in recommendations" 
            :key="rec.name"
            class="rec-match-card opacity-0 p-5 rounded-2xl border border-white/5 bg-gradient-to-r flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-300 hover:border-white/15"
            :class="[rec.bg]"
          >
            <div class="flex-1">
              <!-- Name & Score -->
              <div class="flex items-center space-x-3">
                <span class="text-xs font-display font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5" :style="{ color: rec.color }">
                  匹配度 {{ rec.matchScore }}%
                </span>
                <h4 class="text-base font-art text-white tracking-wide">{{ rec.name }}</h4>
              </div>
              <p class="text-[11px] text-gray-400 mt-2.5 leading-relaxed pr-6">
                {{ rec.matchText }}
              </p>
            </div>

            <!-- Action Swapping Page reservation shortcut -->
            <div class="mt-4 md:mt-0 flex justify-end shrink-0">
              <button 
                class="px-5 h-9 rounded-xl text-[10px] font-semibold text-white tracking-wider flex items-center space-x-1 hover:brightness-110 active:scale-95 transition-all shadow-md"
                :style="{ backgroundColor: rec.color || '#00E676' }"
                @click="goToReservation"
              >
                <span>锁定此方案</span>
                <i class="fas fa-chevron-right text-[9px]"></i>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* Circular HUD animations done by Anime.js but keep layout centered */
</style>
