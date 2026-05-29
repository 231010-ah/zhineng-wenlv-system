<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { label: '首页', to: '/' },
  { label: '景点', to: '/venues' },
  { label: '展览', to: '/exhibitions' },
  { label: '预约建议', to: '/reservation' },
  { label: '客流', to: '/traffic' },
  { label: '兴趣推荐', to: '/recommendations' },
  { label: '门票', to: '/tickets' }
]

const isAuthPage = computed(() => ['login', 'register'].includes(route.name))

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="app-shell">
    <div class="liquid-scene" aria-hidden="true">
      <span class="light-band band-one"></span>
      <span class="light-band band-two"></span>
      <span class="glass-orbit orbit-one"></span>
      <span class="glass-orbit orbit-two"></span>
    </div>

    <header v-if="!isAuthPage" class="site-header">
      <router-link to="/" class="brand-mark" aria-label="北京文旅智能推荐助手首页">
        <span class="brand-icon">京</span>
        <span>
          <strong>北京文旅助手</strong>
          <small>Beijing Culture Travel AI</small>
        </span>
      </router-link>

      <nav class="pill-nav" aria-label="主导航">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to">
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header-actions">
        <template v-if="auth.isAuthenticated">
          <router-link to="/records" class="ghost-link">{{ auth.user?.name || '用户' }}</router-link>
          <button class="mini-button" type="button" @click="logout">退出</button>
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
