import { useEffect } from 'react'
import type { FollowUpStatus, SavedSession } from '../types/chat'
import { trackEvent } from '../lib/analytics'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'
import { formatActionAge } from '../lib/session-storage'

interface ReturnVisitProps {
  session: SavedSession
  onContinue: (status: FollowUpStatus) => void
  onStartFresh: () => void
}

const STATUS_OPTIONS: Array<{
  status: FollowUpStatus
  label: string
  hint: string
  hoverClass: string
}> = [
  {
    status: 'completed',
    label: 'Yes, I did it',
    hint: 'Build on momentum',
    hoverClass: 'hover:border-amber-500/30 hover:bg-amber-950/20',
  },
  {
    status: 'partial',
    label: 'Partly',
    hint: 'Some progress, not finished',
    hoverClass: 'hover:border-teal-500/25 hover:bg-teal-950/15',
  },
  {
    status: 'not_yet',
    label: 'Not yet',
    hint: 'No shame — shrink the step',
    hoverClass: 'hover:border-white/10 hover:bg-navy-800/90',
  },
]

export function ReturnVisit({ session, onContinue, onStartFresh }: ReturnVisitProps) {
  const actionAge = formatActionAge(session.lastActionAt)

  useEffect(() => {
    void trackEvent('return_visit_shown')
  }, [])

  return (
    <section className="animate-fade-in mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-6 shadow-xl shadow-black/25 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <StarterAvatar size="lg" className="mt-0.5" />
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
              Welcome back
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-50">
              Did you do your action?
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              {STARTER_NAME} assigned this {actionAge}. Pick what happened — then we&apos;ll figure
              out your next move on{' '}
              <span className="text-slate-200">{session.intake.businessIdea}</span>.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-950/25 px-4 py-3.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
            Your last action
          </p>
          <p className="text-sm font-medium leading-snug text-amber-50">{session.lastAction}</p>
        </div>

        <div className="space-y-2.5">
          {STATUS_OPTIONS.map(({ status, label, hint, hoverClass }) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                void trackEvent('return_visit_answered', { status })
                onContinue(status)
              }}
              className={`flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-navy-900/50 px-4 py-4 text-left transition ${hoverClass}`}
            >
              <span className="text-sm font-semibold text-slate-50">{label}</span>
              <span className="text-xs text-slate-500">{hint}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onStartFresh}
          className="mt-6 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
        >
          Start with a new idea instead
        </button>
      </div>
    </section>
  )
}
