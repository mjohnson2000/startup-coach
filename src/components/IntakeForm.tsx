import { useState } from 'react'
import type { BlockerType, IntakeData } from '../types/chat'
import { BLOCKER_OPTIONS } from '../types/chat'
import { trackEvent } from '../lib/analytics'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'

interface IntakeFormProps {
  onSubmit: (data: IntakeData) => void
}

const TIMELINE_OPTIONS = [
  'This week',
  'This month',
  'Within 3 months',
  'Still exploring ideas',
]

export function IntakeForm({ onSubmit }: IntakeFormProps) {
  const [blockerType, setBlockerType] = useState<BlockerType | null>(null)
  const [blocker, setBlocker] = useState('')

  function selectBlocker(type: BlockerType, text: string) {
    setBlockerType(type)
    setBlocker(text)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const blockerText = blocker.trim()

    if (!blockerText) return

    onSubmit({
      businessIdea: String(formData.get('businessIdea') ?? '').trim(),
      blocker: blockerText,
      blockerType: blockerType ?? 'custom',
      timeline: String(formData.get('timeline') ?? TIMELINE_OPTIONS[0]),
    })
    void trackEvent('intake_submitted')
  }

  return (
    <section className="animate-fade-in safe-x mx-auto w-full max-w-lg px-4 py-6 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5 shadow-xl shadow-black/25 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <StarterAvatar size="lg" className="mt-0.5" />
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
              Young entrepreneur, lots of ideas?
            </p>
            <h2 className="mb-2 text-xl font-bold text-slate-50 sm:text-2xl">
              Pick one and start
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Full of business ideas but stuck choosing? Online or local — tell {STARTER_NAME}{' '}
              what you&apos;re weighing and get one clear first step, not more research.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-200">
              Your business idea (or top few you&apos;re weighing)
            </span>
            <input
              name="businessIdea"
              required
              placeholder="e.g. Food truck, tutoring, lawn care, Etsy shop, freelance — list a few if you're torn"
              className="w-full rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
            />
          </label>

          <fieldset className="block">
            <legend className="mb-1.5 block text-sm font-medium text-slate-200">
              What&apos;s keeping you stuck?
            </legend>
            <p className="mb-3 text-xs text-slate-500">
              Pick the closest match, then edit the details if you want.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {BLOCKER_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => selectBlocker(option.type, option.text)}
                  className={`touch-target rounded-full border px-3 py-2 text-xs transition ${
                    blockerType === option.type
                      ? 'border-teal-500/40 bg-teal-500/15 text-teal-200'
                      : 'border-white/[0.06] bg-navy-900/50 text-slate-300 hover:border-teal-500/25 hover:text-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <textarea
              name="blocker"
              required
              rows={3}
              value={blocker}
              onChange={(event) => {
                setBlocker(event.target.value)
                if (!blockerType) setBlockerType('custom')
              }}
              placeholder="Pick an option above or describe what's blocking you in your own words"
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
            />
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-200">
              When do you want to start?
            </span>
            <select
              name="timeline"
              defaultValue={TIMELINE_OPTIONS[0]}
              className="w-full rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
            >
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-navy-900">
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={!blocker.trim()}
            className="touch-target w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/25 transition hover:from-teal-400 hover:to-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Help me start
          </button>
        </form>
      </div>
    </section>
  )
}
