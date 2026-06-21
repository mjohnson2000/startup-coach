import type { IntakeData, SavedSession } from '../types/chat'

const STORAGE_KEY = 'starter-session'

export function loadSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as SavedSession
    if (!parsed.intake?.businessIdea || !parsed.lastAction) return null

    return parsed
  } catch {
    return null
  }
}

export function saveSession(intake: IntakeData, lastAction: string): void {
  const existing = loadSavedSession()

  const session: SavedSession = {
    intake,
    lastAction,
    lastActionAt: Date.now(),
    visitCount: existing?.visitCount ?? 1,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function recordReturnVisit(): void {
  const existing = loadSavedSession()
  if (!existing) return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...existing, visitCount: existing.visitCount + 1 }),
  )
}

export function clearSavedSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatActionAge(timestamp: number): string {
  const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}
