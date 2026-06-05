import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue'), meta: { title: '首页' } },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { title: '登录', guestOnly: true, public: true } },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue'), meta: { title: '注册', guestOnly: true, public: true } },
  { path: '/venues', name: 'venues', component: () => import('../views/Venues.vue'), meta: { title: '文化场馆' } },
  { path: '/exhibitions', name: 'exhibitions', component: () => import('../views/Exhibitions.vue'), meta: { title: '展览查看' } },
  { path: '/exhibitions/:exhibitionId', name: 'exhibition-detail', component: () => import('../views/ExhibitionDetail.vue'), meta: { title: '特色物品介绍' } },
  { path: '/reservation/:venueId?', name: 'reservation', component: () => import('../views/Reservation.vue'), meta: { title: '预约建议', requiresAuth: true } },
  { path: '/tickets', name: 'tickets', component: () => import('../views/Tickets.vue'), meta: { title: '预约凭证', requiresAuth: true } },
  { path: '/records', name: 'records', component: () => import('../views/Records.vue'), meta: { title: '预约记录', requiresAuth: true } },
  { path: '/reviews', name: 'reviews', component: () => import('../views/Reviews.vue'), meta: { title: '用户评价', requiresAuth: true } },
  { path: '/traffic', name: 'traffic', component: () => import('../views/Traffic.vue'), meta: { title: 'AI 客流提示' } },
  { path: '/recommendations', name: 'recommendations', component: () => import('../views/Recommendations.vue'), meta: { title: 'AI 兴趣推荐' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  document.title = `${to.meta.title || '北京文旅'} - 北京文旅智能推荐助手`

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }

  return true
})

export default router
