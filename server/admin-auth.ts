import crypto from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

const ADMIN_COOKIE = 'starter_admin'
const SESSION_MS = 7 * 24 * 60 * 60 * 1000
const sessions = new Map<string, number>()

function getAdminPassword(): string | undefined {
  const password = process.env.ADMIN_PASSWORD?.trim()
  return password || undefined
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword())
}

export function createAdminSession(): string | null {
  if (!getAdminPassword()) return null
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, Date.now() + SESSION_MS)
  return token
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword()
  if (!expected) return false
  return password === expected
}

function getCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie
  if (!raw) return undefined
  const match = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1]
}

export function verifyAdminSession(req: Request): boolean {
  const token = getCookie(req, ADMIN_COOKIE)
  if (!token) return false

  const expiresAt = sessions.get(token)
  if (!expiresAt || expiresAt < Date.now()) {
    sessions.delete(token)
    return false
  }

  return true
}

export function clearAdminSession(req: Request): void {
  const token = getCookie(req, ADMIN_COOKIE)
  if (token) sessions.delete(token)
}

export function setAdminCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MS / 1000}${secure ? '; Secure' : ''}`,
  )
}

export function clearAdminCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`)
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminConfigured()) {
    res.status(503).json({ error: 'Admin not configured. Set ADMIN_PASSWORD on the server.' })
    return
  }

  if (!verifyAdminSession(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}
