<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import anime from 'animejs'
import TicketQrCode from './TicketQrCode.vue'

const venues = ref([
  {
    id: 'museum',
    name: '数字孪生历史博物馆',
    subtitle: 'History Museum',
    icon: 'fa-landmark',
    color: '#00E5FF',
    capacity: 2000,
    remaining: 852,
    slots: ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00'],
    description: '采用高精度雷达采集和三维重构，重现历史遗迹与数字文物交互。'
  },
  {
    id: 'art',
    name: '极光未来艺术中心',
    subtitle: 'Art Space',
    icon: 'fa-palette',
    color: '#7C4DFF',
    capacity: 1000,
    remaining: 124,
    slots: ['10:00 - 13:00', '13:00 - 16:00', '16:00 - 19:00'],
    description: '数字光影特展，感受计算机算法渲染出的唯美极光与粒子瀑布。'
  },
  {
    id: 'tech',
    name: 'AI智慧科技探索馆',
    subtitle: 'Science Tech Space',
    icon: 'fa-microchip',
    color: '#00E676',
    capacity: 1500,
    remaining: 562,
    slots: ['09:30 - 12:30', '12:30 - 15:30', '15:30 - 18:30'],
    description: '集装箱式微服务仿真体验、人形机器人与大语言模型交互实验区。'
  },
  {
    id: 'theater',
    name: '全息光影大剧院',
    subtitle: 'Holographic Theatre',
    icon: 'fa-masks-theater',
    color: '#FF4081',
    capacity: 800,
    remaining: 45,
    slots: ['14:00 - 16:30', '19:00 - 21:30'],
    description: '无缝空间音频与光粒子成像，跨次元体验声影交织的高端剧场演出。'
  }
])

// Timer for ticket fluctuations
let ticketTimer = null

const selectedVenue = ref(null)
const showModal = ref(false)
const showTicket = ref(false)

const form = reactive({
  name: '',
  phone: '',
  date: '2026-05-23',
  slot: ''
})

const errors = reactive({
  name: '',
  phone: '',
  slot: ''
})

const printedTicket = reactive({
  id: '',
  venueName: '',
  venueColor: '',
  date: '',
  slot: '',
  visitor: '',
  phone: '',
  qrData: ''
})

const openBooking = (venue) => {
  selectedVenue.value = venue
  form.slot = venue.slots[0]
  form.name = ''
  form.phone = ''
  errors.name = ''
  errors.phone = ''
  showModal.value = true
  
  // Animate modal entry
  setTimeout(() => {
    anime({
      targets: '.booking-modal-panel',
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuint'
    })
  }, 50)
}

const closeModal = () => {
  anime({
    targets: '.booking-modal-panel',
    translateY: [0, 40],
    opacity: [1, 0],
    duration: 350,
    easing: 'easeInQuint',
    complete: () => {
      showModal.value = false
      selectedVenue.value = null
    }
  })
}

const validateForm = () => {
  let isValid = true
  errors.name = ''
  errors.phone = ''

  if (!form.name.trim()) {
    errors.name = '请输入参观者姓名'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = '姓名长度至少为2位字符'
    isValid = false
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!form.phone.trim()) {
    errors.phone = '请输入手机号'
    isValid = false
  } else if (!phoneRegex.test(form.phone)) {
    errors.phone = '请输入合法的11位手机号'
    isValid = false
  }

  return isValid
}

const handleBookSubmit = () => {
  if (!validateForm()) return

  // Close reservation form modal
  showModal.value = false

  // Generate ticket info
  const ticketId = 'TKT' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100)
  printedTicket.id = ticketId
  printedTicket.venueName = selectedVenue.value.name
  printedTicket.venueColor = selectedVenue.value.color
  printedTicket.date = form.date
  printedTicket.slot = form.slot
  printedTicket.visitor = form.name
  printedTicket.phone = form.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  printedTicket.qrData = `V:${selectedVenue.value.id}|T:${ticketId}|D:${form.date}|S:${form.slot}`

  // Subtract ticket availability count
  if (selectedVenue.value.remaining > 0) {
    selectedVenue.value.remaining--
  }

  // Open holographic ticket presentation modal
  showTicket.value = true

  // Anime.js printing sequence
  setTimeout(() => {
    // 1. Slide down & scale up from printing port
    anime.timeline()
      .add({
        targets: '.holo-ticket-card',
        translateY: [-200, 0],
        rotateX: [60, 0],
        scale: [0.3, 1],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutElastic(1, .8)'
      })
      .add({
        // 2. Play neon scan line wipe
        targets: '.ticket-scan-line',
        top: ['0%', '100%'],
        opacity: [1, 0],
        duration: 1500,
        easing: 'easeInOutQuad'
      }, '-=400')
      .add({
        // 3. Highlight/scale barcode slightly
        targets: '.ticket-barcode',
        scaleY: [1, 1.15, 1],
        duration: 400,
        easing: 'easeInOutSine'
      }, '-=800')
  }, 50)
}

const closeTicket = () => {
  anime({
    targets: '.holo-ticket-card',
    scale: [1, 0.7],
    opacity: [1, 0],
    rotateY: [0, 45],
    duration: 500,
    easing: 'easeInBack',
    complete: () => {
      showTicket.value = false
    }
  })
}

onMounted(() => {
  // Ticket count minor fluctuation
  ticketTimer = setInterval(() => {
    venues.value.forEach(v => {
      // Simulate entries and ticket bookings
      const change = Math.random() > 0.55 ? 1 : -1
      // Avoid letting numbers exceed limits
      v.remaining = Math.max(2, Math.min(v.capacity - 100, v.remaining + change))
    })
  }, 4000)
})

onUnmounted(() => {
  if (ticketTimer) clearInterval(ticketTimer)
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
    <!-- Header -->
    <div class="mb-12 text-center md:text-left">
      <span class="text-cyber-green font-display text-xs tracking-widest uppercase flex items-center justify-center md:justify-start">
        <i class="fas fa-ticket-simple mr-2"></i>VENUES RESERVATION SYSTEM
      </span>
      <h2 class="text-3xl md:text-5xl font-art text-white mt-2 hologram-text-purple tracking-wider">
        云原生场馆预约中心
      </h2>
      <p class="text-gray-400 text-sm mt-3 max-w-[65ch]">
        选择您计划访问的文化场馆，查看动态余票负荷，并通过微服务预调配机制秒级锁票。
      </p>
    </div>

    <!-- Venue Card Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div 
        v-for="venue in venues" 
        :key="venue.id"
        class="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all duration-300 relative overflow-hidden"
      >
        <!-- Corner color glow accent -->
        <div class="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" :style="{ backgroundColor: venue.color }"></div>

        <div>
          <!-- Header info -->
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center border text-xl"
                :style="{ 
                  color: venue.color, 
                  borderColor: `${venue.color}30`, 
                  backgroundColor: `${venue.color}08` 
                }"
              >
                <i class="fas" :class="[venue.icon]"></i>
              </div>
              <div>
                <h3 class="text-xl font-art text-white tracking-wide">{{ venue.name }}</h3>
                <span class="text-xs font-display text-gray-500 uppercase tracking-widest">{{ venue.subtitle }}</span>
              </div>
            </div>
            
            <!-- Realtime Available tickets badge -->
            <div class="text-right">
              <div class="text-2xl font-display font-bold" :class="venue.remaining < 50 ? 'text-rose-500 text-glow-purple' : venue.remaining < 200 ? 'text-amber-400' : 'text-cyber-green text-glow-green'">
                {{ venue.remaining }}
              </div>
              <div class="text-[9px] uppercase tracking-widest text-gray-500 font-semibold font-display">动态余票</div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-400 text-sm mt-6 leading-relaxed">
            {{ venue.description }}
          </p>

          <!-- Slots info -->
          <div class="mt-6 flex flex-wrap gap-2">
            <span 
              v-for="slot in venue.slots" 
              :key="slot" 
              class="text-[10px] font-display py-1 px-2.5 rounded-lg bg-cyber-slate/30 border border-white/5 text-gray-400"
            >
              {{ slot }}
            </span>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div class="text-xs text-gray-500 font-display">
            今日馆容上限: <span class="text-white font-bold">{{ venue.capacity }}人</span>
          </div>
          
          <button 
            class="h-10 px-6 rounded-xl text-xs font-semibold text-white tracking-wider flex items-center space-x-1.5 active:scale-95 transition-all shadow-md"
            :style="{ backgroundColor: venue.color }"
            @click="openBooking(venue)"
          >
            <span>预约排卡</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- RESERVATION MODAL -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div 
        class="booking-modal-panel opacity-0 glass-panel w-full max-w-lg rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden"
      >
        <div class="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <h3 class="text-xl font-art text-white flex items-center tracking-wider">
            <i class="fas fa-ticket-simple mr-2" :style="{ color: selectedVenue?.color }"></i>
            场馆预约申请
          </h3>
          <button 
            class="text-gray-500 hover:text-white transition-colors"
            @click="closeModal"
          >
            <i class="fas fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="space-y-5">
          <!-- Venue display -->
          <div class="p-4 rounded-2xl bg-cyber-slate/40 border border-white/5 flex items-center justify-between">
            <span class="text-xs text-gray-400 font-semibold">目标预约场馆</span>
            <span class="text-sm font-art text-white tracking-wider" :style="{ color: selectedVenue?.color }">
              {{ selectedVenue?.name }}
            </span>
          </div>

          <!-- Date picker -->
          <div class="flex flex-col space-y-1">
            <label class="text-xs font-semibold text-gray-400">选择预约日期</label>
            <input 
              v-model="form.date"
              type="date" 
              class="w-full h-11 px-4 rounded-xl bg-cyber-dark/80 border border-white/5 text-white text-sm outline-none focus:border-cyber-blue transition-colors"
            />
          </div>

          <!-- Slot picker -->
          <div class="flex flex-col space-y-1">
            <label class="text-xs font-semibold text-gray-400">选择时段</label>
            <select 
              v-model="form.slot"
              class="w-full h-11 px-4 rounded-xl bg-cyber-dark/80 border border-white/5 text-white text-sm outline-none focus:border-cyber-blue transition-colors font-display"
            >
              <option 
                v-for="slot in selectedVenue?.slots" 
                :key="slot" 
                :value="slot"
              >
                {{ slot }}
              </option>
            </select>
          </div>

          <!-- Visitor Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-xs font-semibold text-gray-400">参观者真实姓名</label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="请输入姓名"
              class="w-full h-11 px-4 rounded-xl bg-cyber-dark/80 border border-white/5 text-white text-sm outline-none focus:border-cyber-blue transition-colors"
              :class="{ 'border-rose-500/50': errors.name }"
            />
            <span v-if="errors.name" class="text-[10px] text-rose-500 ml-1 mt-0.5">{{ errors.name }}</span>
          </div>

          <!-- Mobile Phone -->
          <div class="flex flex-col space-y-1">
            <label class="text-xs font-semibold text-gray-400">联系电话 (11位手机号)</label>
            <input 
              v-model="form.phone"
              type="tel" 
              placeholder="请输入手机号"
              class="w-full h-11 px-4 rounded-xl bg-cyber-dark/80 border border-white/5 text-white text-sm outline-none focus:border-cyber-blue transition-colors"
              :class="{ 'border-rose-500/50': errors.phone }"
            />
            <span v-if="errors.phone" class="text-[10px] text-rose-500 ml-1 mt-0.5">{{ errors.phone }}</span>
          </div>
        </div>

        <!-- Submit -->
        <div class="mt-8 flex items-center justify-end space-x-4">
          <button 
            class="px-5 h-11 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 transition-colors"
            @click="closeModal"
          >
            取消
          </button>
          
          <button 
            class="px-8 h-11 rounded-xl text-xs font-semibold text-white tracking-wider active:scale-95 transition-all flex items-center space-x-1.5 shadow-md"
            :style="{ backgroundColor: selectedVenue?.color }"
            @click="handleBookSubmit"
          >
            <span>提交申请</span>
            <i class="fas fa-circle-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- HOLOGRAPHIC TICKET OVERLAY -->
    <div 
      v-if="showTicket" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
    >
      <!-- Ticket container -->
      <div 
        class="holo-ticket-card opacity-0 relative w-[320px] rounded-3xl p-6 border text-white shadow-2xl flex flex-col justify-between overflow-hidden"
        :style="{ 
          borderColor: `${printedTicket.venueColor}40`,
          background: `linear-gradient(135deg, #0D0E12 0%, #151824 100%)`,
          boxShadow: `0 20px 40px -10px ${printedTicket.venueColor}30, inset 0 1px 0 rgba(255,255,255,0.08)`
        }"
      >
        <!-- Moving Scan Line -->
        <div 
          class="ticket-scan-line absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_10px_#fff] opacity-0 pointer-events-none"
          :style="{ backgroundColor: printedTicket.venueColor, boxShadow: `0 0 10px ${printedTicket.venueColor}` }"
        ></div>

        <!-- Header -->
        <div class="border-b border-white/10 pb-4 mb-4">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-display text-gray-500 uppercase tracking-widest">Holographic Ticket</span>
            <span class="text-xs font-display font-bold" :style="{ color: printedTicket.venueColor }">
              {{ printedTicket.id }}
            </span>
          </div>
          <h4 class="text-lg font-art text-white mt-2 tracking-wide">{{ printedTicket.venueName }}</h4>
        </div>

        <!-- Ticket Info -->
        <div class="space-y-3.5 flex-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[8px] uppercase tracking-wider text-gray-500 font-semibold block">参观日期</span>
              <span class="text-xs font-display font-semibold text-white">{{ printedTicket.date }}</span>
            </div>
            <div>
              <span class="text-[8px] uppercase tracking-wider text-gray-500 font-semibold block">时段</span>
              <span class="text-xs font-display font-semibold text-white">{{ printedTicket.slot }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[8px] uppercase tracking-wider text-gray-500 font-semibold block">参观人</span>
              <span class="text-xs font-art text-white tracking-wide">{{ printedTicket.visitor }}</span>
            </div>
            <div>
              <span class="text-[8px] uppercase tracking-wider text-gray-500 font-semibold block">联系方式</span>
              <span class="text-xs font-display text-white">{{ printedTicket.phone }}</span>
            </div>
          </div>

          <!-- Divider dotted line -->
          <div class="border-t border-dashed border-white/25 py-2"></div>

          <!-- Ticket QR Code -->
          <div class="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/5 relative">
            <!-- Neon corner decorations -->
            <div class="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l opacity-50" :style="{ borderColor: printedTicket.venueColor }"></div>
            <div class="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r opacity-50" :style="{ borderColor: printedTicket.venueColor }"></div>
            <div class="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l opacity-50" :style="{ borderColor: printedTicket.venueColor }"></div>
            <div class="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r opacity-50" :style="{ borderColor: printedTicket.venueColor }"></div>
            
            <TicketQrCode
              class="w-28 h-28"
              :payload="printedTicket.qrData"
              dark-color="#050505"
              :accent-color="printedTicket.venueColor"
            />
            <span class="text-[8px] font-mono text-gray-500 mt-2">扫码通过电子闸机</span>
          </div>
        </div>

        <!-- Footer Barcode & Close -->
        <div class="mt-5 border-t border-white/10 pt-4 flex flex-col items-center">
          <!-- Barcode representation -->
          <div class="ticket-barcode w-full h-8 flex justify-center space-x-[2px] opacity-75 mb-4">
            <span v-for="w in [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 4, 1]" :key="w" class="h-full bg-white" :style="{ width: `${w}px` }"></span>
          </div>
          
          <button 
            class="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all"
            @click="closeTicket"
          >
            完成并离舱
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
