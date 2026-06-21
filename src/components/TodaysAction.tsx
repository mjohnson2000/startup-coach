interface TodaysActionProps {
  action: string
}

export function TodaysAction({ action }: TodaysActionProps) {
  return (
    <div className="safe-x animate-fade-in mx-4 mb-3 shrink-0 rounded-2xl border border-amber-500/25 bg-amber-950/30 px-4 py-3.5 shadow-lg shadow-amber-950/20 sm:mx-6">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
        Today&apos;s one action
      </p>
      <p className="break-words text-sm font-medium leading-snug text-amber-50 sm:text-[15px]">{action}</p>
    </div>
  )
}
