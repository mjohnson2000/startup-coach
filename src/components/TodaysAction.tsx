interface TodaysActionProps {
  action: string
}

export function TodaysAction({ action }: TodaysActionProps) {
  return (
    <div className="animate-fade-in mx-4 mb-3 rounded-xl border border-teal-500/25 bg-teal-950/40 px-4 py-3 shadow-lg shadow-teal-900/20 sm:mx-6">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-teal-400">
        Today&apos;s one action
      </p>
      <p className="text-sm font-medium leading-snug text-teal-50 sm:text-[15px]">
        {action}
      </p>
    </div>
  )
}
