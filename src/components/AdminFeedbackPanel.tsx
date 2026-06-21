import { useEffect, useState } from 'react'
import { fetchAdminFeedback } from '../lib/feedback-api'
import type { FeedbackEntry, FeedbackSummary } from '../types/feedback'

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-4">
      <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-50">{value.toLocaleString()}</p>
    </div>
  )
}

export function AdminFeedbackPanel() {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminFeedback()
      .then((data) => {
        setSummary(data.summary)
        setEntries(data.entries)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading feedback…</p>
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">User feedback</h2>
        <p className="mt-1 text-sm text-slate-400">
          Thumbs and comments from real users. Your test devices are excluded.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total responses" value={summary.total} />
        <SummaryCard label="Positive" value={summary.positive} />
        <SummaryCard label="Negative" value={summary.negative} />
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No feedback yet. Share the link and check back here.</p>
      ) : (
        <section className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            All feedback
          </h3>
          <div className="space-y-4">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-white/[0.04] bg-navy-900/40 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatTime(entry.timestamp)}</span>
                  <span>·</span>
                  <span>{entry.context === 'chat' ? 'After coaching' : 'General'}</span>
                  <span>·</span>
                  <span className={entry.rating === 'up' ? 'text-teal-300' : 'text-amber-300'}>
                    {entry.rating === 'up' ? '👍 Helpful' : '👎 Not helpful'}
                  </span>
                </div>
                {entry.comment && (
                  <p className="text-sm leading-relaxed text-slate-200">"{entry.comment}"</p>
                )}
                {!entry.comment && (
                  <p className="text-sm italic text-slate-500">No comment left.</p>
                )}
                {entry.todaysAction && (
                  <p className="mt-2 text-xs text-slate-500">
                    Action shown: {entry.todaysAction}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
