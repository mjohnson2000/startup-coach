import { STARTER_NAME, STARTER_TAGLINE, StarterAvatar } from './StarterAvatar'

interface HeaderProps {
  isMockMode?: boolean
}

export function Header({ isMockMode }: HeaderProps) {
  return (
    <header className="border-b border-teal-500/10 bg-navy-950/50 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StarterAvatar size="md" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              {STARTER_NAME}
            </h1>
            <p className="text-xs text-slate-400 sm:text-sm">{STARTER_TAGLINE}</p>
          </div>
        </div>
        {isMockMode && (
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-teal-300 sm:text-xs">
            Demo mode
          </span>
        )}
      </div>
    </header>
  )
}
