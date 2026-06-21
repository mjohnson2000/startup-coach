import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Connect } from 'vite'
import { handleChat } from './server/chat-handler'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function chatApiPlugin() {
  return {
    name: 'chat-api',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(
        '/api/chat',
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.method !== 'POST') {
            next()
            return
          }

          try {
            const body = await readBody(req)
            const { messages, intake } = JSON.parse(body)
            const result = await handleChat(messages, intake)

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(
              JSON.stringify({
                message: result.message,
                todaysAction: result.todaysAction,
                isMock: result.isMock,
              }),
            )
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to get coach response' }))
          }
        },
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load OPENAI_API_KEY from .env for the dev server API proxy (server-side only).
  const env = loadEnv(mode, process.cwd(), '')
  if (env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  }

  return {
    plugins: [react(), tailwindcss(), chatApiPlugin()],
  }
})
