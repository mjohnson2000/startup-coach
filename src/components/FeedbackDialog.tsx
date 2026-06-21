import { useState } from 'react'
import { FeedbackForm } from './FeedbackForm'

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false)

  function close() {
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="touch-target rounded-full px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200 sm:text-sm"
      >
        Feedback
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close feedback"
            className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm sm:hidden"
            onClick={close}
          />

          <div className="safe-bottom safe-x fixed inset-x-3 bottom-0 z-[60] max-h-[min(85dvh,520px)] overflow-y-auto pb-3 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-80 sm:pb-0">
            <div className="rounded-xl shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-navy-850/95 px-4 py-3 sm:hidden">
                <p className="text-sm font-medium text-slate-200">Feedback</p>
                <button
                  type="button"
                  onClick={close}
                  className="touch-target rounded-lg px-3 text-sm text-slate-400"
                >
                  Close
                </button>
              </div>
              <FeedbackForm
                context="general"
                compact
                onSubmitted={() => {
                  window.setTimeout(close, 1500)
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
