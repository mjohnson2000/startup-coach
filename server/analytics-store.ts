import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const EVENTS_FILE = path.join(DATA_DIR, 'analytics-events.jsonl')

export type AnalyticsEventType =
  | 'page_view'
  | 'intake_submitted'
  | 'return_visit_shown'
  | 'return_visit_answered'
  | 'chat_started'
  | 'chat_message_sent'
  | 'new_session'
  | 'blog_post_view'

export interface AnalyticsEvent {
  id: string
  timestamp: number
  type: AnalyticsEventType
  path: string
  visitorId: string
  metadata?: Record<string, unknown>
}

export interface AnalyticsStats {
  totalEvents: number
  pageViews: number
  uniqueVisitors: number
  intakeSubmissions: number
  chatStarts: number
  returnVisits: number
  viewsByPath: Array<{ path: string; count: number }>
  eventsByType: Array<{ type: string; count: number }>
  viewsByDay: Array<{ date: string; count: number }>
  recentEvents: AnalyticsEvent[]
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function recordEvent(input: Omit<AnalyticsEvent, 'id' | 'timestamp'>): AnalyticsEvent {
  ensureDataDir()

  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...input,
  }

  fs.appendFileSync(EVENTS_FILE, `${JSON.stringify(event)}\n`, 'utf8')
  return event
}

function readAllEvents(): AnalyticsEvent[] {
  if (!fs.existsSync(EVENTS_FILE)) return []

  return fs
    .readFileSync(EVENTS_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AnalyticsEvent)
}

export function getAnalyticsStats(): AnalyticsStats {
  const events = readAllEvents()
  const visitors = new Set<string>()
  const pathCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  const dayCounts = new Map<string, number>()

  let pageViews = 0
  let intakeSubmissions = 0
  let chatStarts = 0
  let returnVisits = 0

  for (const event of events) {
    visitors.add(event.visitorId)
    typeCounts.set(event.type, (typeCounts.get(event.type) ?? 0) + 1)

    if (event.type === 'page_view') {
      pageViews += 1
      pathCounts.set(event.path, (pathCounts.get(event.path) ?? 0) + 1)
      const day = new Date(event.timestamp).toISOString().slice(0, 10)
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
    }

    if (event.type === 'intake_submitted') intakeSubmissions += 1
    if (event.type === 'chat_started') chatStarts += 1
    if (event.type === 'return_visit_shown') returnVisits += 1
  }

  const viewsByPath = [...pathCounts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)

  const eventsByType = [...typeCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  const viewsByDay = [...dayCounts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)

  return {
    totalEvents: events.length,
    pageViews,
    uniqueVisitors: visitors.size,
    intakeSubmissions,
    chatStarts,
    returnVisits,
    viewsByPath,
    eventsByType,
    viewsByDay,
    recentEvents: [...events].reverse().slice(0, 40),
  }
}
