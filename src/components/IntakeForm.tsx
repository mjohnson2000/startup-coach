import type { IntakeData } from '../types/chat'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'

interface IntakeFormProps {
  onSubmit: (data: IntakeData) => void
}

const TIMELINE_OPTIONS = [
  'This week',
  'This month',
  'Within 3 months',
  'Just exploring',
]

export function IntakeForm({ onSubmit }: IntakeFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    onSubmit({
      businessIdea: String(formData.get('businessIdea') ?? '').trim(),
      blocker: String(formData.get('blocker') ?? '').trim(),
      timeline: String(formData.get('timeline') ?? TIMELINE_OPTIONS[1]),
    })
  }

  return (
    <section className="animate-fade-in mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-teal-500/10 bg-navy-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <StarterAvatar size="lg" className="mt-0.5" />
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-teal-400">
              Meet {STARTER_NAME}
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-50">
              What are you building?
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Share your idea, biggest blocker, and timeline. {STARTER_NAME} is
              your friendly mentor — focused first session, no fluff.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-200">
              Business idea
            </span>
            <input
              name="businessIdea"
              required
              placeholder="e.g. Meal prep for busy parents"
              className="w-full rounded-xl border border-teal-500/10 bg-navy-950/60 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-200">
              What&apos;s blocking you?
            </span>
            <textarea
              name="blocker"
              required
              rows={3}
              placeholder="e.g. I keep researching instead of talking to customers"
              className="w-full resize-none rounded-xl border border-teal-500/10 bg-navy-950/60 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-200">
              When do you want to launch?
            </span>
            <select
              name="timeline"
              defaultValue={TIMELINE_OPTIONS[1]}
              className="w-full rounded-xl border border-teal-500/10 bg-navy-950/60 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
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
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/25 transition hover:from-teal-400 hover:to-emerald-500 active:scale-[0.99]"
          >
            Start with {STARTER_NAME}
          </button>
        </form>
      </div>
    </section>
  )
}
