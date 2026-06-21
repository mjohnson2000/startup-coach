export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface IntakeData {
  businessIdea: string
  blocker: string
  timeline: string
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  intake: IntakeData
}

export interface ChatResponse {
  message: string
  todaysAction?: string
  isMock?: boolean
}
