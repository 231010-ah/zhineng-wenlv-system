import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginApi, registerApi } from '../api/auth'

const TOKEN_KEY = 'smart-tourism-token'
const USER_KEY = 'smart-tourism-user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const isAuthenticated = computed(() => Boolean(token.value))

  const persist = (payload) => {
    token.value = payload.token
    user.value = payload.user
    localStorage.setItem(TOKEN_KEY, payload.token)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
  }

  const login = async (credentials) => {
    const payload = await loginApi(credentials)
    persist(payload)
    return payload
  }

  const register = async (form) => {
    const payload = await registerApi(form)
    persist(payload)
    return payload
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, isAuthenticated, login, register, logout }
})
