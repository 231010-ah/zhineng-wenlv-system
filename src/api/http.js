import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/mock-api',
  timeout: 8000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart-tourism-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const mockDelay = (data, delay = 180) => new Promise((resolve) => {
  window.setTimeout(() => resolve(structuredClone(data)), delay)
})
