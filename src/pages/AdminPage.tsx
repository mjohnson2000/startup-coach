import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminBlogPanel } from '../components/AdminBlogPanel'
import { AdminFeedbackPanel } from '../components/AdminFeedbackPanel'
import { Seo } from '../components/Seo'
import {
  getVisitorId,
  setAnalyticsExcludedLocally,
} from '../lib/analytics'

interface AnalyticsStats {
  totalEvents: number
  pageViews: number
  uniqueVisitors: number
  intakeSubmissions: number
  chatStarts: number
  returnVisits: number
  viewsByPath: Array<{ path: string; count: number }>
  eventsByType: Array<{ type: string; count: number }>
  viewsByDay: Array<{ date: string; count: number }>
  recentEvents: Array<{
    id: string
    timestamp: number
    type: string
    path: string
    visitorId: string
    metadata?: Record<string, unknown>
  }>
  excludedDeviceCount: number
  currentVisitorExcluded: boolean
}

interface ExcludedVisitor {
  visitorId: string
  label: string
  excludedAt: string
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-4">
      <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-50">{value.toLocaleString()}</p>
    </div>
  )
}

type AdminTab = 'analytics' | 'blog' | 'feedback'

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')
  const [openBlogEditor, setOpenBlogEditor] = useState(false)
  const [exclusions, setExclusions] = useState<ExcludedVisitor[]>([])
  const [isUpdatingExclusion, setIsUpdatingExclusion] = useState(false)

  const loadStats = useCallback(async () => {
    const visitorId = getVisitorId()
    const response = await fetch(
      `/api/admin/stats?visitorId=${encodeURIComponent(visitorId)}`,
      { credentials: 'include' },
    )
    if (response.status === 401) {
      setIsAuthed(false)
      setStats(null)
      return false
    }
    if (!response.ok) {
      const data = (await response.json()) as { error?: string }
      throw new Error(data.error ?? 'Failed to load stats')
    }
    setStats((await response.json()) as AnalyticsStats)
    setIsAuthed(true)
    return true
  }, [])

  const loadExclusions = useCallback(async () => {
    const response = await fetch('/api/admin/exclusions', { credentials: 'include' })
    if (!response.ok) return
    const data = (await response.json()) as { exclusions: ExcludedVisitor[] }
    setExclusions(data.exclusions)
  }, [])

  useEffect(() => {
    loadStats()
      .then((authed) => {
        if (authed) return loadExclusions()
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [loadStats, loadExclusions])

  useEffect(() => {
    if (stats?.currentVisitorExcluded) {
      setAnalyticsExcludedLocally(true)
    }
  }, [stats?.currentVisitorExcluded])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, visitorId: getVisitorId() }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Login failed')
      }

      setAnalyticsExcludedLocally(true)
      setPassword('')
      await loadStats()
      await loadExclusions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setIsAuthed(false)
    setStats(null)
    setExclusions([])
  }

  async function handleExcludeDevice(visitorId?: string, label = 'My device') {
    setIsUpdatingExclusion(true)
    setError(null)

    try {
      const id = visitorId ?? getVisitorId()
      const response = await fetch('/api/admin/exclusions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: id, label }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to exclude device')
      }

      if (id === getVisitorId()) {
        setAnalyticsExcludedLocally(true)
      }

      await loadStats()
      await loadExclusions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exclude device')
    } finally {
      setIsUpdatingExclusion(false)
    }
  }

  async function handleIncludeDevice(visitorId: string) {
    setIsUpdatingExclusion(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/exclusions/${encodeURIComponent(visitorId)}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to include device')
      }

      if (visitorId === getVisitorId()) {
        setAnalyticsExcludedLocally(false)
      }

      await loadStats()
      await loadExclusions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to include device')
    } finally {
      setIsUpdatingExclusion(false)
    }
  }

  const excludedVisitorIds = new Set(exclusions.map((entry) => entry.visitorId))

  if (isLoading && !stats) {
    return (
      <main className="safe-x mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-center text-sm text-slate-500">Loading admin…</p>
      </main>
    )
  }

  if (!isAuthed) {
    return (
      <main className="safe-x mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-6">
        <Seo title="Admin" description="Starter admin dashboard" path="/admin" noIndex />
        <div className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-6 sm:p-8">
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
            Admin
          </p>
          <h1 className="mb-2 text-2xl font-bold text-slate-50">Starter dashboard</h1>
          <p className="mb-6 text-sm text-slate-400">Sign in to manage analytics and blog posts.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15"
              />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50"
            >
              Sign in
            </button>
          </form>

          <Link to="/" className="mt-6 block text-center text-xs text-slate-500 hover:text-slate-300">
            ← Back to app
          </Link>
        </div>
      </main>
    )
  }

  if (!stats) return null

  const maxDayViews = Math.max(...stats.viewsByDay.map((day) => day.count), 1)

  return (
    <main className="safe-x mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <Seo title="Admin" description="Starter admin dashboard" path="/admin" noIndex />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Analytics and blog management.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('blog')
              setOpenBlogEditor(true)
            }}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500"
          >
            Write blog post
          </button>
          {activeTab === 'analytics' && (
            <button
              type="button"
              onClick={() => void loadStats().catch((err: Error) => setError(err.message))}
              className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04]"
            >
              Refresh
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04]"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'analytics'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Analytics
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('blog')
            setOpenBlogEditor(false)
          }}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'blog'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Blog
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'feedback'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Feedback
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {activeTab === 'blog' ? (
        <AdminBlogPanel
          key={openBlogEditor ? 'create' : 'list'}
          startInCreateMode={openBlogEditor}
        />
      ) : activeTab === 'feedback' ? (
        <AdminFeedbackPanel />
      ) : (
        <>
      <section className="mb-8 rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Your devices
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Exclude any device you use for testing — phone, laptop, etc. Admin page visits are
              never counted.
            </p>
            <p className="mt-2 font-mono text-xs text-slate-500">
              This device: {getVisitorId().slice(0, 8)}…
              {stats.currentVisitorExcluded ? ' · excluded' : ' · counting in stats'}
            </p>
          </div>
          {!stats.currentVisitorExcluded && (
            <button
              type="button"
              disabled={isUpdatingExclusion}
              onClick={() => void handleExcludeDevice()}
              className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
            >
              Exclude this device
            </button>
          )}
        </div>

        {exclusions.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
            {exclusions.map((entry) => (
              <div
                key={entry.visitorId}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <span className="font-mono text-xs text-slate-400">
                    {entry.visitorId.slice(0, 8)}…
                  </span>
                  <span className="ml-2 text-slate-500">{entry.label}</span>
                </div>
                <button
                  type="button"
                  disabled={isUpdatingExclusion}
                  onClick={() => void handleIncludeDevice(entry.visitorId)}
                  className="text-xs text-slate-400 transition hover:text-slate-200 disabled:opacity-50"
                >
                  Include again
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Page views" value={stats.pageViews} />
        <StatCard label="Unique visitors" value={stats.uniqueVisitors} />
        <StatCard label="Intake submissions" value={stats.intakeSubmissions} />
        <StatCard label="Chat sessions" value={stats.chatStarts} />
        <StatCard label="Return visits" value={stats.returnVisits} />
        <StatCard label="Total events" value={stats.totalEvents} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Top paths
          </h2>
          <div className="space-y-2">
            {stats.viewsByPath.length === 0 && (
              <p className="text-sm text-slate-500">No page views yet.</p>
            )}
            {stats.viewsByPath.map(({ path, count }) => (
              <div key={path} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-300">{path}</span>
                <span className="ml-3 shrink-0 text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Events by type
          </h2>
          <div className="space-y-2">
            {stats.eventsByType.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{type.replaceAll('_', ' ')}</span>
                <span className="text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {stats.viewsByDay.length > 0 && (
        <section className="mb-8 rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Page views by day
          </h2>
          <div className="space-y-2">
            {stats.viewsByDay.map(({ date, count }) => (
              <div key={date} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-slate-500">{date}</span>
                <div className="h-2 flex-1 rounded-full bg-navy-900/80">
                  <div
                    className="h-2 rounded-full bg-teal-500/70"
                    style={{ width: `${(count / maxDayViews) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-slate-400">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Recent activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Event</th>
                <th className="pb-2 pr-4 font-medium">Path</th>
                <th className="pb-2 font-medium">Visitor</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {stats.recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-white/[0.04] text-slate-300">
                  <td className="py-2 pr-4 whitespace-nowrap text-slate-500">
                    {formatTime(event.timestamp)}
                  </td>
                  <td className="py-2 pr-4">{event.type.replaceAll('_', ' ')}</td>
                  <td className="py-2 pr-4">{event.path}</td>
                  <td className="py-2 font-mono text-xs text-slate-500">
                    {event.visitorId.slice(0, 8)}…
                  </td>
                  <td className="py-2 text-right">
                    {!excludedVisitorIds.has(event.visitorId) && (
                      <button
                        type="button"
                        disabled={isUpdatingExclusion}
                        onClick={() => void handleExcludeDevice(event.visitorId, 'My device')}
                        className="text-xs text-slate-400 transition hover:text-teal-300 disabled:opacity-50"
                      >
                        Exclude
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </>
      )}
    </main>
  )
}
