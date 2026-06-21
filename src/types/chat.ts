export interface IntakeData {
  businessIdea: string
  blocker: string
  timeline: string
}

export type FollowUpStatus = 'completed' | 'partial' | 'not_yet'

export interface FollowUpContext {
  lastAction: string
  status: FollowUpStatus
}

export interface SavedSession {
  intake: IntakeData
  lastAction: string
  lastActionAt: number
  visitCount: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  hidden?: boolean
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  intake: IntakeData
  followUp?: FollowUpContext
}

export interface ChatResponse {
  message: string
  todaysAction?: string
  isMock?: boolean
}
