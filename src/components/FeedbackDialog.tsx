import { useState } from 'react'
import { FeedbackForm } from './FeedbackForm'

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200 sm:text-sm"
      >
        Feedback
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="rounded-full px-3 py-1.5 text-xs font-medium text-teal-300 transition hover:bg-white/[0.04] sm:text-sm"
      >
        Close
      </button>
      <div className="absolute right-0 top-full z-20 mt-2 w-72 sm:w-80">
        <FeedbackForm
          context="general"
          compact
          onSubmitted={() => {
            window.setTimeout(() => setIsOpen(false), 1500)
          }}
        />
      </div>
    </div>
  )
}
