import type { ReactNode } from 'react'
import { Header } from './Header'

interface PageShellProps {
  children: ReactNode
  isMockMode?: boolean
}

export function PageShell({ children, isMockMode }: PageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-navy-950 via-navy-925 to-navy-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/12 via-transparent to-transparent" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-900/8 via-transparent to-transparent" />
      <div className="relative flex min-h-dvh flex-col overflow-x-clip">
        <Header isMockMode={isMockMode} />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
