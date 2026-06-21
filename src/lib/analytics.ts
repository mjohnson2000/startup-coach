const VISITOR_KEY = 'starter-visitor-id'

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

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export async function trackEvent(
  type: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!VALID_EVENTS.has(type)) return

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
