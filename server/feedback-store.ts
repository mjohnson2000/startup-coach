import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getExcludedVisitorIds, isVisitorExcluded } from './analytics-exclusions'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl')

export type FeedbackRating = 'up' | 'down'
export type FeedbackContext = 'chat' | 'general'

export interface FeedbackEntry {
  id: string
  timestamp: number
  rating: FeedbackRating
  comment: string
  context: FeedbackContext
  visitorId: string
  path: string
  todaysAction?: string
}

export interface FeedbackInput {
  rating: FeedbackRating
  comment?: string
  context: FeedbackContext
  visitorId: string
  path: string
  todaysAction?: string
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function recordFeedback(input: FeedbackInput): FeedbackEntry | null {
  if (isVisitorExcluded(input.visitorId)) {
    return null
  }

  ensureDataDir()

  const entry: FeedbackEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    rating: input.rating,
    comment: input.comment?.trim() ?? '',
    context: input.context,
    visitorId: input.visitorId,
    path: input.path,
    todaysAction: input.todaysAction?.trim() || undefined,
  }

  fs.appendFileSync(FEEDBACK_FILE, `${JSON.stringify(entry)}\n`, 'utf8')
  return entry
}

function readAllFeedback(): FeedbackEntry[] {
  if (!fs.existsSync(FEEDBACK_FILE)) return []

  return fs
    .readFileSync(FEEDBACK_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as FeedbackEntry)
}

export function listFeedback(): FeedbackEntry[] {
  const excluded = getExcludedVisitorIds()

  return readAllFeedback()
    .filter((entry) => !excluded.has(entry.visitorId))
    .reverse()
}

export function getFeedbackSummary(): {
  total: number
  positive: number
  negative: number
} {
  const entries = listFeedback()
  const positive = entries.filter((entry) => entry.rating === 'up').length
  const negative = entries.filter((entry) => entry.rating === 'down').length

  return {
    total: entries.length,
    positive,
    negative,
  }
}
