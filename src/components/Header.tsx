import { Link, useLocation } from 'react-router-dom'
import { FeedbackDialog } from './FeedbackDialog'
import { STARTER_NAME, STARTER_TAGLINE, StarterAvatar } from './StarterAvatar'

interface HeaderProps {
  isMockMode?: boolean
}

export function Header({ isMockMode }: HeaderProps) {
  const { pathname } = useLocation()
  const onBlog = pathname.startsWith('/blog')
  const onAdmin = pathname.startsWith('/admin')

  return (
    <header className="relative z-40 border-b border-white/[0.05] bg-navy-950/60 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3 transition hover:opacity-90">
          <StarterAvatar size="md" />
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              {STARTER_NAME}
            </p>
            <p className="truncate text-xs text-slate-400 sm:text-sm">{STARTER_TAGLINE}</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isMockMode && (
            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-teal-300 sm:text-xs">
              Demo mode
            </span>
          )}
          {!onAdmin && <FeedbackDialog />}
          <Link
            to="/blog"
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              onBlog
                ? 'bg-teal-500/15 text-teal-300'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
            }`}
          >
            Blog
          </Link>
        </div>
      </div>
    </header>
  )
}
