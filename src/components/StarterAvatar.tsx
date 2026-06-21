export const STARTER_NAME = 'Starter'
export const STARTER_TAGLINE = 'Lots of ideas? Start here.'

const SIZE_PX = {
  sm: 28,
  md: 40,
  lg: 48,
} as const

interface StarterAvatarProps {
  size?: keyof typeof SIZE_PX
  className?: string
}

export function StarterAvatar({ size = 'md', className = '' }: StarterAvatarProps) {
  const px = SIZE_PX[size]

  return (
    <div
      role="img"
      aria-label={`${STARTER_NAME}, your startup coach`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 p-[2px] shadow-md shadow-teal-500/20 ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full rounded-full bg-navy-900"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" fill="#111827" />

        {/* Blazer shoulders */}
        <path
          d="M7 42c0-6 6.5-9.5 17-9.5s17 3.5 17 9.5"
          fill="#1a2332"
        />
        <path d="M11 34.5h26c0 0-1 9.5-13 9.5S11 34.5 11 34.5z" fill="#1e293b" />

        {/* Lapels + shirt collar */}
        <path d="M24 32.5 16.5 42h4.5l3-5.5 3 5.5h4.5L24 32.5z" fill="#162032" />
        <path d="M20.5 32.5 24 35.5 27.5 32.5" stroke="#94a3b8" strokeWidth="0.7" strokeLinejoin="round" />

        {/* Teal tie */}
        <path d="M23.2 32.2h1.6l.4 1.6-1.2.8-1.2-.8.4-1.6z" fill="#14b8a6" />
        <path d="M24 34.2 22.2 41.5h3.6L24 34.2z" fill="#0d9488" />

        {/* Briefcase */}
        <rect x="32" y="35.5" width="8.5" height="5.5" rx="0.7" fill="#475569" />
        <rect x="32" y="35.5" width="8.5" height="1.4" rx="0.3" fill="#334155" />
        <path
          d="M34.5 35.5V33.8M39 35.5V33.8M34.5 33.8h4.5"
          stroke="#94a3b8"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <rect x="35.8" y="37.8" width="1.4" height="1" rx="0.2" fill="#2dd4bf" />

        {/* Hair accent */}
        <path
          d="M24 7.5c-4.5 0-8 2.8-9 6.5"
          stroke="#2dd4bf"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Friendly eyebrows */}
        <path
          d="M14 17.2q3.5-1.5 6 0"
          stroke="#2dd4bf"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M28 17.2q2.5-1.5 6 0"
          stroke="#2dd4bf"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Big warm eyes */}
        <circle cx="17.5" cy="20.5" r="2.8" fill="#2dd4bf" />
        <circle cx="30.5" cy="20.5" r="2.8" fill="#2dd4bf" />
        <circle cx="18.3" cy="19.7" r="0.85" fill="#0f172a" />
        <circle cx="31.3" cy="19.7" r="0.85" fill="#0f172a" />
        <circle cx="18.8" cy="19.1" r="0.35" fill="#f0fdfa" opacity="0.85" />
        <circle cx="31.8" cy="19.1" r="0.35" fill="#f0fdfa" opacity="0.85" />

        {/* Warm smile */}
        <path
          d="M17 28.5c2.5 3.5 11.5 3.5 14 0"
          stroke="#34d399"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
