import type { ChatRequest, ChatResponse } from '../types/chat'
import { extractTodaysAction } from './coach'

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Starter is unavailable right now. Try again in a moment.')
  }

  const data = (await response.json()) as ChatResponse
  return {
    message: data.message,
    todaysAction: data.todaysAction ?? extractTodaysAction(data.message),
    isMock: data.isMock,
  }
}
