import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  clearAdminCookie,
  clearAdminSession,
  createAdminSession,
  isAdminConfigured,
  requireAdmin,
  setAdminCookie,
  verifyAdminPassword,
} from './admin-auth'
import { getAnalyticsStats, recordEvent, type AnalyticsEventType } from './analytics-store'
import { handleChat } from './chat-handler'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT) || 3000
const host = process.env.HOST ?? '0.0.0.0'
const distPath = path.join(__dirname, '..', 'dist')

const VALID_EVENT_TYPES = new Set<AnalyticsEventType>([
  'page_view',
  'intake_submitted',
  'return_visit_shown',
  'return_visit_answered',
  'chat_started',
  'chat_message_sent',
  'new_session',
  'blog_post_view',
])

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

app.post('/api/analytics/event', (req, res) => {
  try {
    const { type, path: eventPath, visitorId, metadata } = req.body as {
      type?: string
      path?: string
      visitorId?: string
      metadata?: Record<string, unknown>
    }

    if (!type || !VALID_EVENT_TYPES.has(type as AnalyticsEventType)) {
      res.status(400).json({ error: 'Invalid event type' })
      return
    }

    if (!eventPath || typeof eventPath !== 'string' || !visitorId || typeof visitorId !== 'string') {
      res.status(400).json({ error: 'Missing path or visitorId' })
      return
    }

    recordEvent({
      type: type as AnalyticsEventType,
      path: eventPath,
      visitorId,
      metadata,
    })

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to record event' })
  }
})

app.post('/api/admin/login', (req, res) => {
  if (!isAdminConfigured()) {
    res.status(503).json({ error: 'Admin not configured. Set ADMIN_PASSWORD on the server.' })
    return
  }

  const password = String(req.body?.password ?? '')
  if (!verifyAdminPassword(password)) {
    res.status(401).json({ error: 'Invalid password' })
    return
  }

  const token = createAdminSession()
  if (!token) {
    res.status(503).json({ error: 'Admin not configured' })
    return
  }

  setAdminCookie(res, token)
  res.json({ ok: true })
})

app.post('/api/admin/logout', (req, res) => {
  clearAdminSession(req)
  clearAdminCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/stats', requireAdmin, (_req, res) => {
  res.json(getAnalyticsStats())
})

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, intake, followUp } = req.body
    const result = await handleChat(messages, intake, followUp)

    res.json({
      message: result.message,
      todaysAction: result.todaysAction,
      isMock: result.isMock,
    })
  } catch {
    res.status(500).json({ error: 'Failed to get coach response' })
  }
})

app.use(express.static(distPath))

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, host, () => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim())
  console.log(`Startup Coach running on http://${host}:${port}`)
  console.log(`OpenAI key loaded: ${hasKey ? 'yes' : 'no'}`)
  console.log(`Admin dashboard: ${isAdminConfigured() ? 'enabled' : 'disabled (set ADMIN_PASSWORD)'}`)
})
