import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleChat } from './chat-handler'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT) || 3000
const host = process.env.HOST ?? '0.0.0.0'
const distPath = path.join(__dirname, '..', 'dist')

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

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
})
