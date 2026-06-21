const VISITOR_KEY = 'starter-visitor-id'
const EXCLUDED_KEY = 'starter-analytics-excluded'

const VALID_EVENTS = new Set([
  'page_view',
  'intake_submitted',
  'return_visit_shown',
  'return_visit_answered',
  'chat_started',
  'chat_message_sent',
  'new_session',
  'blog_post_view',
])

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function isAnalyticsExcludedLocally(): boolean {
  return localStorage.getItem(EXCLUDED_KEY) === '1'
}

export function setAnalyticsExcludedLocally(excluded: boolean): void {
  if (excluded) {
    localStorage.setItem(EXCLUDED_KEY, '1')
  } else {
    localStorage.removeItem(EXCLUDED_KEY)
  }
}

function shouldTrack(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (isAnalyticsExcludedLocally()) return false
  return true
}

export async function trackEvent(
  type: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!VALID_EVENTS.has(type)) return
  if (!shouldTrack(window.location.pathname)) return

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        type,
        path: window.location.pathname,
        visitorId: getVisitorId(),
        metadata,
      }),
    })
  } catch {
    // Analytics should never block the app
  }
}
