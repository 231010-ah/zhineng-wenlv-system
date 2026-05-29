<script setup>
import { ref, nextTick } from 'vue'
import anime from 'animejs'
import StarfieldBackground from './StarfieldBackground.vue'

const emit = defineEmits(['login-success'])

const starfieldRef = ref(null)
const isRegister = ref(false)

// Form states
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Validation/Feedback states
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

const toggleState = () => {
  if (isLoading.value) return

  // 1. Trigger Three.js warp speed animation
  if (starfieldRef.value) {
    starfieldRef.value.triggerWarp()
  }

  // 2. Animate the form exit
  anime({
    targets: '.auth-form-inner',
    opacity: [1, 0],
    translateX: isRegister.value ? [0, 50] : [0, -50],
    scale: [1, 0.95],
    duration: 350,
    easing: 'easeInQuad',
    complete: () => {
      // Toggle state
      isRegister.value = !isRegister.value
      
      // Reset form states
      username.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      errorMsg.value = ''
      successMsg.value = ''

      // 3. Animate the new form entrance
      nextTick(() => {
        anime({
          targets: '.auth-form-inner',
          opacity: [0, 1],
          translateX: isRegister.value ? [-50, 0] : [50, 0],
          scale: [0.95, 1],
          duration: 500,
          easing: 'easeOutQuad'
        })
      })
    }
  })
}

const handleLogin = () => {
  if (isLoading.value) return
  errorMsg.value = ''
  successMsg.value = ''

  if (!username.value || !password.value) {
    errorMsg.value = '请填写完整的登录凭证。'
    return
  }

  isLoading.value = true

  // Simulate server validation delay
  setTimeout(() => {
    isLoading.value = false
    if (username.value === 'admin' && password.value === '123456') {
      successMsg.value = '认证成功！正在同步数智视屏...'
      
      // Staggered login transition
      anime({
        targets: '.auth-panel-card',
        scale: [1, 0.95],
        opacity: [1, 0],
        translateY: [0, 30],
        duration: 600,
        easing: 'easeInBack',
        complete: () => {
          emit('login-success')
        }
      })
    } else {
      errorMsg.value = '访问被拒绝：用户名或密码错误。'
    }
  }, 1200)
}

const handleRegister = () => {
  if (isLoading.value) return
  errorMsg.value = ''
  successMsg.value = ''

  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = '请填空所有注册字段。'
    return
  }

  // Simple email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMsg.value = '邮箱格式不正确。'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = '密码长度不能少于 6 位。'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的密码不一致。'
    return
  }

  isLoading.value = true

  // Simulate register api delay
  setTimeout(() => {
    isLoading.value = false
    successMsg.value = '系统账号注册成功！即将切换至登录。'
    
    // Auto toggle back to login after 1.5s
    setTimeout(() => {
      toggleState()
    }, 1500)
  }, 1200)
}
</script>

<template>
  <div class="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-cyber-bg px-4 md:px-8 py-10 selection:bg-cyber-purple selection:text-white">
    
    <!-- Three.js Starfield Background -->
    <StarfieldBackground ref="starfieldRef" />

    <!-- Auth Grid Container -->
    <div class="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      
      <!-- Left side: System Branding Title (Desktop only) -->
      <div class="hidden lg:flex lg:col-span-6 flex-col text-left space-y-6 select-none pointer-events-none">
        
        <!-- HUD Logo Badge -->
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-[10px] font-display tracking-widest uppercase w-max">
          <i class="fas fa-satellite-dish animate-pulse"></i>
          <span>Orbital Telemetry Guard v3.4</span>
        </div>

        <div class="space-y-2">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none text-white font-art">
            <span class="hologram-text">数智孪生</span>
            <span class="text-cyber-blue hologram-text-purple ml-2">
              云影文旅
            </span>
          </h1>
          <p class="text-sm font-display text-cyber-green uppercase tracking-widest">
            Smart Venue Cloud Microservices
          </p>
        </div>

        <p class="text-gray-400 text-sm max-w-[45ch] leading-relaxed">
          微服务核心授权控制中心。连接 Nacos 注册中心与 Sentinel 流量哨兵，确保场馆客流预测、分布式集群与 AI 脑舱的并发稳定性。
        </p>

        <!-- Tech Indicators Grid -->
        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 font-display text-[10px] text-gray-500">
          <div class="flex flex-col">
            <span class="text-gray-400 font-bold">SHA-256</span>
            <span>Security Layer</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 font-bold">SENTINEL</span>
            <span>Flow Protected</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 font-bold">99.99%</span>
            <span>SLA Standard</span>
          </div>
        </div>

      </div>

      <!-- Right side: Authentication Card -->
      <div class="lg:col-span-6 flex justify-center">
        <div class="auth-panel-card w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0D0E12]/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 relative overflow-hidden">
          
          <!-- Liquid refraction border indicator -->
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>

          <!-- Dynamic Auth Layout -->
          <div class="auth-form-inner w-full flex flex-col space-y-6">
            
            <!-- Card Header -->
            <div class="flex flex-col space-y-2">
              <h2 class="text-2xl font-bold text-white tracking-wider font-art">
                {{ isRegister ? '创建核心账户' : '微服务控制台授权' }}
              </h2>
              <p class="text-xs text-gray-400">
                {{ isRegister ? '注册新的管理员凭证以授权节点访问' : '请输入系统管理员账号进入微服务看板' }}
              </p>
            </div>

            <!-- Error and Success Feedback Alerts -->
            <div v-if="errorMsg" class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center space-x-2">
              <i class="fas fa-triangle-exclamation text-sm"></i>
              <span>{{ errorMsg }}</span>
            </div>
            <div v-if="successMsg" class="p-3.5 rounded-xl bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-xs font-mono flex items-center space-x-2">
              <i class="fas fa-circle-check text-sm"></i>
              <span>{{ successMsg }}</span>
            </div>

            <!-- Form Fields -->
            <form @submit.prevent="isRegister ? handleRegister() : handleLogin()" class="space-y-4">
              
              <!-- Username input block -->
              <div class="flex flex-col gap-1.5">
                <label for="username" class="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                  管理员账号
                </label>
                <div class="relative flex items-center">
                  <i class="fas fa-user-astronaut absolute left-4 text-gray-500 text-sm"></i>
                  <input 
                    id="username"
                    v-model="username" 
                    type="text" 
                    placeholder="请输入管理员账户" 
                    autocomplete="username"
                    required
                    class="w-full h-11 bg-cyber-slate/30 border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-cyber-blue/50 focus:bg-cyber-slate/50 transition-all font-mono"
                  />
                </div>
              </div>

              <!-- Email input block (Register only) -->
              <div v-if="isRegister" class="flex flex-col gap-1.5">
                <label for="email" class="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                  安全邮箱地址
                </label>
                <div class="relative flex items-center">
                  <i class="fas fa-envelope absolute left-4 text-gray-500 text-sm"></i>
                  <input 
                    id="email"
                    v-model="email" 
                    type="email" 
                    placeholder="name@microservice.com" 
                    autocomplete="email"
                    required
                    class="w-full h-11 bg-cyber-slate/30 border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-cyber-blue/50 focus:bg-cyber-slate/50 transition-all font-mono"
                  />
                </div>
              </div>

              <!-- Password input block -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center">
                  <label for="password" class="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                    授权令牌密码
                  </label>
                  <span v-if="!isRegister" class="text-[10px] text-cyber-blue font-mono hover:underline cursor-pointer">
                    忘记密码?
                  </span>
                </div>
                <div class="relative flex items-center">
                  <i class="fas fa-lock absolute left-4 text-gray-500 text-sm"></i>
                  <input 
                    id="password"
                    v-model="password" 
                    type="password" 
                    placeholder="请输入登录密码" 
                    autocomplete="current-password"
                    required
                    class="w-full h-11 bg-cyber-slate/30 border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-cyber-blue/50 focus:bg-cyber-slate/50 transition-all font-mono"
                  />
                </div>
                <!-- Demo login credentials hint -->
                <span v-if="!isRegister" class="text-[9px] text-gray-500 font-mono">
                  演示凭证: admin / 123456
                </span>
              </div>

              <!-- Confirm Password input block (Register only) -->
              <div v-if="isRegister" class="flex flex-col gap-1.5">
                <label for="confirmPassword" class="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
                  确认授权密码
                </label>
                <div class="relative flex items-center">
                  <i class="fas fa-shield-halved absolute left-4 text-gray-500 text-sm"></i>
                  <input 
                    id="confirmPassword"
                    v-model="confirmPassword" 
                    type="password" 
                    placeholder="请再次确认输入密码" 
                    autocomplete="new-password"
                    required
                    class="w-full h-11 bg-cyber-slate/30 border border-white/5 rounded-xl pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-cyber-blue/50 focus:bg-cyber-slate/50 transition-all font-mono"
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit"
                :disabled="isLoading"
                class="w-full h-11 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white text-xs font-semibold tracking-widest uppercase rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-[0_4px_20px_rgba(124,77,255,0.15)]"
              >
                <i v-if="isLoading" class="fas fa-circle-notch animate-spin text-sm"></i>
                <span v-else>{{ isRegister ? '确认注册授权' : '确认登录系统' }}</span>
                <i v-if="!isLoading" class="fas fa-key-skeleton"></i>
              </button>

            </form>

            <!-- Toggle Register/Login -->
            <div class="pt-4 border-t border-white/5 flex items-center justify-center text-xs text-gray-500">
              <span>{{ isRegister ? '已有授权账号?' : '尚未拥有授权账号?' }}</span>
              <button 
                @click="toggleState"
                class="text-cyber-blue font-semibold ml-2 hover:underline focus:outline-none cursor-pointer"
              >
                {{ isRegister ? '立即登录' : '立即注册' }}
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>

  </div>
</template>
