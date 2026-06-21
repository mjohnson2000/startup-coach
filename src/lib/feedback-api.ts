import { getVisitorId, isAnalyticsExcludedLocally } from './analytics'
import type { FeedbackContext, FeedbackRating, FeedbackResponse } from '../types/feedback'

interface SubmitFeedbackInput {
  rating: FeedbackRating
  comment?: string
  context: FeedbackContext
  todaysAction?: string
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  if (isAnalyticsExcludedLocally()) return

  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      visitorId: getVisitorId(),
      path: window.location.pathname,
    }),
  })

  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    throw new Error(data.error ?? 'Failed to submit feedback')
  }
}

export async function fetchAdminFeedback(): Promise<FeedbackResponse> {
  const response = await fetch('/api/admin/feedback', { credentials: 'include' })
  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    throw new Error(data.error ?? 'Failed to load feedback')
  }
  return response.json() as Promise<FeedbackResponse>
}
