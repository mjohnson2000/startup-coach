export type BlockerType =
  | 'too_many_ideas'
  | 'analysis_paralysis'
  | 'validation_fear'
  | 'no_first_step'
  | 'custom'

export interface IntakeData {
  businessIdea: string
  blocker: string
  blockerType?: BlockerType
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

export interface BlockerOption {
  type: BlockerType
  label: string
  text: string
}

export const BLOCKER_OPTIONS: BlockerOption[] = [
  {
    type: 'too_many_ideas',
    label: 'Too many ideas',
    text: "I have too many business ideas and can't pick one to start.",
  },
  {
    type: 'analysis_paralysis',
    label: 'Stuck researching',
    text: 'I keep researching and planning but never take the first step.',
  },
  {
    type: 'validation_fear',
    label: 'Not sure anyone would pay',
    text: "I'm not sure anyone would actually pay for this yet.",
  },
  {
    type: 'no_first_step',
    label: "Don't know first step",
    text: "I don't know what the first real step should be.",
  },
]
