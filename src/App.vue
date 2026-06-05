<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const userMenu = ref(null)
const userMenuOpen = ref(false)
const headerScrolled = ref(false)

const navItems = [
  { label: '首页', to: '/' },
  { label: '景点', to: '/venues' },
  { label: '展览', to: '/exhibitions' },
  { label: '预约建议', to: '/reservation' },
  { label: '客流', to: '/traffic' },
  { label: '兴趣推荐', to: '/recommendations' },
  { label: '门票', to: '/tickets' }
]

const avatarStyles = [
  { id: 'porcelain', label: '青瓷' },
  { id: 'sunrise', label: '晨光' },
  { id: 'jade', label: '青玉' },
  { id: 'ink', label: '玄墨' }
]

const isAuthPage = computed(() => ['login', 'register'].includes(route.name))
const userInitial = computed(() => (auth.user?.name || '用户').slice(0, 1).toUpperCase())
const activeAvatarStyle = computed(() => auth.user?.avatarStyle || 'porcelain')
const avatarClass = computed(() => `avatar-${activeAvatarStyle.value}`)
const avatarImage = computed(() => auth.user?.avatarImage || '')

const setAvatarStyle = (style) => {
  auth.updateUser({ avatarStyle: style, avatarImage: '' })
}

const uploadAvatar = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    event.target.value = ''
    return
  }

  if (file.size > 1.5 * 1024 * 1024) {
    event.target.value = ''
    window.alert('头像图片不能超过 1.5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    auth.updateUser({ avatarImage: reader.result })
    event.target.value = ''
  }
  reader.readAsDataURL(file)
}

const removeAvatarImage = () => {
  auth.updateUser({ avatarImage: '' })
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenuOnOutsideClick = (event) => {
  if (!userMenu.value?.contains(event.target)) {
    closeUserMenu()
  }
}

const logout = () => {
  closeUserMenu()
  auth.logout()
  router.push('/')
}

const updateHeaderGlass = () => {
  headerScrolled.value = window.scrollY > 24
}

onMounted(() => {
  document.addEventListener('click', closeUserMenuOnOutsideClick)
  updateHeaderGlass()
  window.addEventListener('scroll', updateHeaderGlass, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeUserMenuOnOutsideClick)
  window.removeEventListener('scroll', updateHeaderGlass)
})
</script>

<template>
  <div class="app-shell">
    <div class="liquid-scene" aria-hidden="true">
      <span class="light-band band-one"></span>
      <span class="light-band band-two"></span>
      <span class="glass-orbit orbit-one"></span>
      <span class="glass-orbit orbit-two"></span>
    </div>

    <header v-if="!isAuthPage" class="site-header" :class="{ 'is-scrolled': headerScrolled }">
      <router-link to="/" class="brand-mark" aria-label="北京文旅智能推荐助手首页">
        <span class="brand-emblem" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img">
            <path class="emblem-paper" d="M12.5 8.5c8.2-2.3 31.8-2 39.4.5c3.6 1.2 4.2 7.6 4.3 15.2c.2 10.1-.7 24.4-4.2 28.5c-4.6 5.4-32.8 5.9-40.6 1.3c-5.2-3.1-5.1-36.6 1.1-45.5Z" />
            <path class="emblem-stamp" d="M15.5 13.4c7.2-2.2 28.3-2 34.5.1c2.4.9 3.1 5.5 3.1 11.6c.1 8.2-.7 20.6-3.1 23.6c-3.6 4.5-28.6 4.9-34.8 1.2c-4.1-2.5-4.1-31.5.3-36.5Z" />
            <path class="emblem-hill" d="M13.8 38.5c6-6.8 10.4-5.7 15.1-11.7c2.9-3.8 5.5-5.2 8.9-1.4c4 4.4 7.1 5.1 12.4 1.5" />
            <path class="emblem-water" d="M15 44.6c6.4-2.1 11.6 1.7 17.3-.1c4.7-1.5 7.8-4.6 16-2.1M18.6 48.5c5.5-1.1 9.3 1.3 13.4.3c5.1-1.2 8.3-3.1 14.4-1" />
            <path class="emblem-gate" d="M21.2 36h22.5M24.5 36V25.7h15.9V36M27.4 25.7l4.9-5.5l5.2 5.5M30.1 36v-6h4.7v6" />
            <path class="emblem-route" d="M18.4 20.7c7.1-3 15.9-3.4 23.1.6c3.3 1.8 5.5 4.4 7.8 7.3" />
          </svg>
        </span>
        <span class="brand-copy">
          <strong><span>京脉</span>文旅</strong>
          <small>Beijing Heritage Routes</small>
        </span>
      </router-link>

      <nav class="pill-nav" aria-label="主导航">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to">
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header-actions">
        <template v-if="auth.isAuthenticated">
          <div ref="userMenu" class="user-menu" :class="{ open: userMenuOpen }">
            <button
              class="user-trigger"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="userMenuOpen"
              aria-label="打开个人菜单"
              @click.stop="toggleUserMenu"
            >
              <span class="user-avatar" :class="avatarClass" aria-hidden="true">
                <img v-if="avatarImage" :src="avatarImage" alt="" />
                <span v-else>{{ userInitial }}</span>
              </span>
              <span class="user-name">{{ auth.user?.name || '用户' }}</span>
            </button>
            <div class="user-popover" role="menu">
              <div class="user-card">
                <span class="user-avatar large" :class="avatarClass" aria-hidden="true">
                  <img v-if="avatarImage" :src="avatarImage" alt="" />
                  <span v-else>{{ userInitial }}</span>
                </span>
                <span>
                  <strong>{{ auth.user?.name || '用户' }}</strong>
                  <small>{{ auth.user?.role || '已登录账号' }}</small>
                </span>
              </div>
              <label class="avatar-upload">
                <input type="file" accept="image/*" @change="uploadAvatar" />
                <span>上传图片头像</span>
              </label>
              <button v-if="avatarImage" class="menu-action subtle" type="button" @click="removeAvatarImage">恢复样式头像</button>
              <div class="avatar-picker" aria-label="头像样式">
                <span>头像样式</span>
                <div>
                  <button
                    v-for="style in avatarStyles"
                    :key="style.id"
                    class="avatar-choice"
                    :class="[`avatar-${style.id}`, { active: activeAvatarStyle === style.id }]"
                    type="button"
                    :aria-pressed="activeAvatarStyle === style.id"
                    :title="style.label"
                    @click="setAvatarStyle(style.id)"
                  >
                    {{ userInitial }}
                  </button>
                </div>
              </div>
              <router-link to="/records" class="menu-action" role="menuitem" @click="closeUserMenu">预约记录</router-link>
              <button class="menu-action danger" type="button" role="menuitem" @click="logout">退出登录</button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="ghost-link">登录</router-link>
          <router-link to="/register" class="mini-button">注册</router-link>
        </template>
      </div>
    </header>

    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
