import type { IntakeData } from '../types/chat'
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
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    onSubmit({
      businessIdea: String(formData.get('businessIdea') ?? '').trim(),
      blocker: String(formData.get('blocker') ?? '').trim(),
      timeline: String(formData.get('timeline') ?? TIMELINE_OPTIONS[0]),
    })
  }

  return (
    <section className="animate-fade-in mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-6 shadow-xl shadow-black/25 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <StarterAvatar size="lg" className="mt-0.5" />
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
              Young, lots of ideas?
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-50">
              Pick one and start
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Starting out or between jobs, good with AI and online tools, but sitting on a pile of
              business ideas? Tell {STARTER_NAME} what you&apos;re weighing — get one clear first
              step toward actually starting, not more research.
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
              placeholder="e.g. AI freelance, a simple app, Etsy shop — list a few if you're torn"
              className="w-full rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-200">
              What&apos;s keeping you stuck?
            </span>
            <textarea
              name="blocker"
              required
              rows={3}
              placeholder="e.g. I have 5 ideas and can't choose — I use AI and watch tutorials but never launch"
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
            />
          </label>

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
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-teal-500/25 transition hover:from-teal-400 hover:to-emerald-500 active:scale-[0.99]"
          >
            Help me start
          </button>
        </form>
      </div>
    </section>
  )
}
