import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminBlogPanel } from '../components/AdminBlogPanel'
import { Seo } from '../components/Seo'

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

type AdminTab = 'analytics' | 'blog'

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')
  const [openBlogEditor, setOpenBlogEditor] = useState(false)

  const loadStats = useCallback(async () => {
    const response = await fetch('/api/admin/stats', { credentials: 'include' })
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

  useEffect(() => {
    loadStats()
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [loadStats])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Login failed')
      }

      setPassword('')
      await loadStats()
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
  }

  if (isLoading && !stats) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-slate-500">Loading admin…</p>
      </main>
    )
  }

  if (!isAuthed) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 sm:px-6">
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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
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
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {activeTab === 'blog' ? (
        <AdminBlogPanel
          key={openBlogEditor ? 'create' : 'list'}
          startInCreateMode={openBlogEditor}
        />
      ) : (
        <>
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
