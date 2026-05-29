import { mockDelay } from './http'
import { venues } from '../mock/venues'
import { exhibitions } from '../mock/exhibitions'
import { trafficTips } from '../mock/traffic'
import { recommendations } from '../mock/recommendations'
import { seedReviews } from '../mock/reviews'

export const getVenues = () => mockDelay(venues)
export const getExhibitions = () => mockDelay(exhibitions)
export const getTrafficTips = () => mockDelay(trafficTips)
export const getRecommendations = () => mockDelay(recommendations)
export const getTickets = (tickets = []) => mockDelay(tickets)
export const getRecords = (records = []) => mockDelay(records)
export const submitReview = (payload) => mockDelay({ ...payload, id: `rv-${Date.now()}` })
export const createReservation = (payload) => mockDelay({ ...payload, id: `TKT${Date.now().toString().slice(-8)}` })
export const getSeedReviews = () => mockDelay(seedReviews)
