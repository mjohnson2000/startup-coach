import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const EXCLUSIONS_FILE = path.join(DATA_DIR, 'excluded-visitors.json')

export interface ExcludedVisitor {
  visitorId: string
  label: string
  excludedAt: string
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readExclusions(): ExcludedVisitor[] {
  ensureDataDir()
  if (!fs.existsSync(EXCLUSIONS_FILE)) return []
  return JSON.parse(fs.readFileSync(EXCLUSIONS_FILE, 'utf8')) as ExcludedVisitor[]
}

function writeExclusions(exclusions: ExcludedVisitor[]): void {
  ensureDataDir()
  fs.writeFileSync(EXCLUSIONS_FILE, JSON.stringify(exclusions, null, 2), 'utf8')
}

export function getExcludedVisitorIds(): Set<string> {
  return new Set(readExclusions().map((entry) => entry.visitorId))
}

export function listExcludedVisitors(): ExcludedVisitor[] {
  return readExclusions()
}

export function isVisitorExcluded(visitorId: string): boolean {
  if (!visitorId) return false
  return getExcludedVisitorIds().has(visitorId)
}

export function excludeVisitor(visitorId: string, label = 'Admin device'): ExcludedVisitor {
  if (!visitorId.trim()) {
    throw new Error('Visitor ID is required')
  }

  const exclusions = readExclusions()
  const existing = exclusions.find((entry) => entry.visitorId === visitorId)

  if (existing) {
    return existing
  }

  const entry: ExcludedVisitor = {
    visitorId,
    label,
    excludedAt: new Date().toISOString(),
  }

  exclusions.push(entry)
  writeExclusions(exclusions)
  return entry
}

export function includeVisitor(visitorId: string): void {
  const exclusions = readExclusions()
  const next = exclusions.filter((entry) => entry.visitorId !== visitorId)

  if (next.length === exclusions.length) {
    throw new Error('Visitor not found in exclusions')
  }

  writeExclusions(next)
}
