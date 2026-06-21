export type FeedbackRating = 'up' | 'down'
export type FeedbackContext = 'chat' | 'general'

export interface FeedbackEntry {
  id: string
  timestamp: number
  rating: FeedbackRating
  comment: string
  context: FeedbackContext
  visitorId: string
  path: string
  todaysAction?: string
}

export interface FeedbackSummary {
  total: number
  positive: number
  negative: number
}

export interface FeedbackResponse {
  summary: FeedbackSummary
  entries: FeedbackEntry[]
}
