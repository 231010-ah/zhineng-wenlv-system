import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createReservation as createReservationApi, submitReview } from '../api/tourism'
import { seedReviews } from '../mock/reviews'
import { venues } from '../mock/venues'

const RECORDS_KEY = 'beijing-tourism-records'
const REVIEWS_KEY = 'beijing-tourism-reviews'

const readJson = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))

export const useBookingStore = defineStore('booking', () => {
  const records = ref(readJson(RECORDS_KEY, []))
  const reviews = ref(readJson(REVIEWS_KEY, seedReviews))
  const tickets = computed(() => records.value.filter((record) => record.status === 'booked'))

  const persistRecords = () => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records.value))
  }

  const persistReviews = () => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews.value))
  }

  const createReservation = async (payload) => {
    const venue = venues.find((item) => item.id === payload.venueId)
    const ticket = await createReservationApi(payload)
    const record = {
      ...ticket,
      venueName: venue?.name || payload.venueName,
      venueType: venue?.type || '文化场馆',
      image: venue?.image,
      status: 'booked',
      statusText: '已出票',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    }
    records.value.unshift(record)
    persistRecords()
    return record
  }

  const cancelReservation = (id) => {
    const target = records.value.find((record) => record.id === id)
    if (target) {
      target.status = 'cancelled'
      target.statusText = '已取消'
      persistRecords()
    }
  }

  const verifyReservation = (id) => {
    const target = records.value.find((record) => record.id === id)
    if (target) {
      target.status = 'verified'
      target.statusText = '已核销'
      target.verifiedAt = new Date().toLocaleString('zh-CN', { hour12: false })
      persistRecords()
    }
  }

  const addReview = async (payload) => {
    const review = await submitReview({
      ...payload,
      time: new Date().toLocaleString('zh-CN', { hour12: false })
    })
    reviews.value.unshift(review)
    persistReviews()
    return review
  }

  return { records, tickets, reviews, createReservation, cancelReservation, verifyReservation, addReview }
})
