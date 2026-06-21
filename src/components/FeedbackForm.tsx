import { useState } from 'react'
import { submitFeedback } from '../lib/feedback-api'
import type { FeedbackContext, FeedbackRating } from '../types/feedback'

interface FeedbackFormProps {
  context: FeedbackContext
  todaysAction?: string
  onSubmitted?: () => void
  compact?: boolean
}

export function FeedbackForm({
  context,
  todaysAction,
  onSubmitted,
  compact = false,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(selectedRating: FeedbackRating) {
    setRating(selectedRating)
    setError(null)
    setIsSubmitting(true)

    try {
      await submitFeedback({
        rating: selectedRating,
        comment: comment.trim() || undefined,
        context,
        todaysAction,
      })
      setIsDone(true)
      onSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
      setRating(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <p className={`text-sm text-teal-300 ${compact ? 'px-1 py-2' : 'px-4 py-3'}`}>
        Thanks — that helps us improve Starter.
      </p>
    )
  }

  return (
    <div
      className={
        compact
          ? 'rounded-xl border border-white/[0.06] bg-navy-850/80 p-4'
          : 'border-b border-white/[0.04] bg-navy-900/40 px-4 py-4 sm:px-6'
      }
    >
      <p className={`font-medium text-slate-200 ${compact ? 'mb-3 text-sm' : 'mb-1 text-sm'}`}>
        Was Starter helpful?
      </p>
      {!compact && (
        <p className="mb-3 text-xs text-slate-500">
          Quick feedback helps us improve for young entrepreneurs like you.
        </p>
      )}

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSubmit('up')}
          className={`rounded-xl border px-4 py-2 text-sm transition disabled:opacity-50 ${
            rating === 'up'
              ? 'border-teal-500/40 bg-teal-500/15 text-teal-200'
              : 'border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
          }`}
        >
          👍 Yes
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSubmit('down')}
          className={`rounded-xl border px-4 py-2 text-sm transition disabled:opacity-50 ${
            rating === 'down'
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
              : 'border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
          }`}
        >
          👎 Not really
        </button>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs text-slate-500">
          Optional — what would make it better?
        </span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={compact ? 2 : 3}
          placeholder="One sentence is plenty"
          className="w-full rounded-xl border border-white/[0.06] bg-navy-900/50 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-600 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
        />
      </label>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
