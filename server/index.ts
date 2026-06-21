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
import {
  excludeVisitor,
  includeVisitor,
  listExcludedVisitors,
} from './analytics-exclusions'
import { getAnalyticsStats, recordEvent, type AnalyticsEventType } from './analytics-store'
import {
  createPost,
  deletePost,
  getPublishedPost,
  listAllPosts,
  listPublishedPosts,
  updatePost,
} from './blog-store'
import { handleChat } from './chat-handler'
import { getFeedbackSummary, listFeedback, recordFeedback } from './feedback-store'

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

  const visitorId = String(req.body?.visitorId ?? '').trim()
  if (visitorId) {
    excludeVisitor(visitorId, 'My device')
  }

  setAdminCookie(res, token)
  res.json({ ok: true, visitorExcluded: Boolean(visitorId) })
})

app.post('/api/admin/logout', (req, res) => {
  clearAdminSession(req)
  clearAdminCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const visitorId = String(req.query.visitorId ?? '').trim()
  res.json(getAnalyticsStats(visitorId || undefined))
})

app.get('/api/admin/exclusions', requireAdmin, (_req, res) => {
  res.json({ exclusions: listExcludedVisitors() })
})

app.post('/api/admin/exclusions', requireAdmin, (req, res) => {
  try {
    const visitorId = String(req.body?.visitorId ?? '').trim()
    const label = String(req.body?.label ?? 'Admin device').trim()
    const entry = excludeVisitor(visitorId, label || 'Admin device')
    res.json({ ok: true, exclusion: entry })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to exclude device' })
  }
})

app.delete('/api/admin/exclusions/:visitorId', requireAdmin, (req, res) => {
  try {
    includeVisitor(String(req.params.visitorId))
    res.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to include device'
    res.status(message === 'Visitor not found in exclusions' ? 404 : 400).json({ error: message })
  }
})

app.get('/api/blog/posts', (_req, res) => {
  res.json(listPublishedPosts())
})

app.get('/api/blog/posts/:slug', (req, res) => {
  const post = getPublishedPost(String(req.params.slug))
  if (!post) {
    res.status(404).json({ error: 'Post not found' })
    return
  }
  res.json(post)
})

app.get('/sitemap.xml', (_req, res) => {
  const posts = listPublishedPosts()
  const urls: Array<{
    loc: string
    changefreq: string
    priority: string
    lastmod?: string
  }> = [
    { loc: 'https://bizstarteragent.com/', changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://bizstarteragent.com/blog', changefreq: 'weekly', priority: '0.8' },
    ...posts.map((post) => ({
      loc: `https://bizstarteragent.com/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: post.updatedAt,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  res.type('application/xml').send(xml)
})

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://bizstarteragent.com/sitemap.xml
`)
})

app.get('/api/admin/blog/posts', requireAdmin, (_req, res) => {
  res.json(listAllPosts())
})

app.post('/api/admin/blog/posts', requireAdmin, (req, res) => {
  try {
    const post = createPost(req.body)
    res.status(201).json(post)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create post' })
  }
})

app.put('/api/admin/blog/posts/:id', requireAdmin, (req, res) => {
  try {
    const post = updatePost(String(req.params.id), req.body)
    res.json(post)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update post'
    res.status(message === 'Post not found' ? 404 : 400).json({ error: message })
  }
})

app.delete('/api/admin/blog/posts/:id', requireAdmin, (req, res) => {
  try {
    deletePost(String(req.params.id))
    res.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete post'
    res.status(message === 'Post not found' ? 404 : 400).json({ error: message })
  }
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

app.post('/api/feedback', (req, res) => {
  try {
    const rating = req.body?.rating
    const visitorId = String(req.body?.visitorId ?? '').trim()
    const pathValue = String(req.body?.path ?? '/').trim()
    const context = req.body?.context

    if (rating !== 'up' && rating !== 'down') {
      res.status(400).json({ error: 'Invalid rating' })
      return
    }

    if (!visitorId) {
      res.status(400).json({ error: 'Missing visitorId' })
      return
    }

    if (context !== 'chat' && context !== 'general') {
      res.status(400).json({ error: 'Invalid context' })
      return
    }

    const entry = recordFeedback({
      rating,
      comment: String(req.body?.comment ?? ''),
      context,
      visitorId,
      path: pathValue,
      todaysAction: String(req.body?.todaysAction ?? ''),
    })

    res.status(201).json({ ok: true, id: entry?.id ?? null })
  } catch {
    res.status(500).json({ error: 'Failed to save feedback' })
  }
})

app.get('/api/admin/feedback', requireAdmin, (_req, res) => {
  res.json({
    summary: getFeedbackSummary(),
    entries: listFeedback(),
  })
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
