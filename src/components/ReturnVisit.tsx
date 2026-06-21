import type { FollowUpStatus, SavedSession } from '../types/chat'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'
import { formatActionAge } from '../lib/session-storage'

interface ReturnVisitProps {
  session: SavedSession
  onContinue: (status: FollowUpStatus) => void
  onStartFresh: () => void
}

const STATUS_OPTIONS: Array<{ status: FollowUpStatus; label: string; hint: string }> = [
  { status: 'completed', label: 'Yes, I did it', hint: 'Build on momentum' },
  { status: 'partial', label: 'Partly', hint: 'Some progress, not finished' },
  { status: 'not_yet', label: 'Not yet', hint: 'No shame — shrink the step' },
]

export function ReturnVisit({ session, onContinue, onStartFresh }: ReturnVisitProps) {
  const actionAge = formatActionAge(session.lastActionAt)

  return (
    <section className="animate-fade-in mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-teal-500/10 bg-navy-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <StarterAvatar size="lg" className="mt-0.5" />
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-teal-400">
              Welcome back
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-50">
              Did you do your action?
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              {STARTER_NAME} assigned this {actionAge}. Pick what happened — then we&apos;ll figure
              out your next move on{' '}
              <span className="text-slate-300">{session.intake.businessIdea}</span>.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-teal-500/20 bg-teal-950/30 px-4 py-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-teal-400">
            Your last action
          </p>
          <p className="text-sm font-medium leading-snug text-teal-50">{session.lastAction}</p>
        </div>

        <div className="space-y-2">
          {STATUS_OPTIONS.map(({ status, label, hint }) => (
            <button
              key={status}
              type="button"
              onClick={() => onContinue(status)}
              className="flex w-full items-center justify-between rounded-xl border border-teal-500/10 bg-navy-950/60 px-4 py-3.5 text-left transition hover:border-teal-500/30 hover:bg-navy-900/80"
            >
              <span className="text-sm font-semibold text-slate-50">{label}</span>
              <span className="text-xs text-slate-500">{hint}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onStartFresh}
          className="mt-5 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
        >
          Start with a new idea instead
        </button>
      </div>
    </section>
  )
}
