import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../lib/api'
import type { ChatMessage, IntakeData } from '../types/chat'
import { MessageBubble } from './MessageBubble'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'
import { TodaysAction } from './TodaysAction'

interface ChatInterfaceProps {
  intake: IntakeData
  onReset: () => void
  onMockModeChange?: (isMock: boolean) => void
}

const SUGGESTED_REPLIES = [
  "I have too many ideas and can't pick one",
  'I know what I want but keep putting it off',
  "I don't know how to actually start",
]

const MIN_TYPING_MS = 450

function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function ChatInterface({ intake, onReset, onMockModeChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [todaysAction, setTodaysAction] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (hasStarted) return

    async function startSession() {
      setHasStarted(true)
      setIsLoading(true)
      setError(null)

      try {
        const kickoff = `I want to start a business but I'm stuck. Ideas I'm considering: "${intake.businessIdea}". What's keeping me stuck: ${intake.blocker}. I want to start ${intake.timeline.toLowerCase()}.`
        const userMessage = createMessage('user', kickoff)

        const [response] = await Promise.all([
          sendChatMessage({
            messages: [{ role: 'user', content: kickoff }],
            intake,
          }),
          wait(MIN_TYPING_MS),
        ])

        setMessages([userMessage, createMessage('assistant', response.message)])
        if (response.todaysAction) setTodaysAction(response.todaysAction)
        if (response.isMock) onMockModeChange?.(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setHasStarted(false)
      } finally {
        setIsLoading(false)
      }
    }

    startSession()
  }, [hasStarted, intake, onMockModeChange])

  async function sendUserMessage(trimmed: string) {
    if (!trimmed || isLoading) return

    const userMessage = createMessage('user', trimmed)
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const [response] = await Promise.all([
        sendChatMessage({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          intake,
        }),
        wait(MIN_TYPING_MS),
      ])

      setMessages((prev) => [...prev, createMessage('assistant', response.message)])
      if (response.todaysAction) setTodaysAction(response.todaysAction)
      if (response.isMock) onMockModeChange?.(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await sendUserMessage(input.trim())
  }

  function handleSuggestedReply(text: string) {
    void sendUserMessage(text)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSubmit(event)
    }
  }

  const showSuggestedReplies = !isLoading && messages.length >= 2 && !input.trim()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-teal-500/5 px-4 py-2 sm:px-6">
        <p className="truncate text-xs text-slate-500">
          {STARTER_NAME}: <span className="text-slate-300">{intake.businessIdea}</span>
        </p>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 text-xs text-slate-500 transition hover:text-slate-300"
        >
          New session
        </button>
      </div>

      {todaysAction && <TodaysAction action={todaysAction} />}

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-end gap-2">
              <StarterAvatar size="sm" className="mb-1" />
              <div className="rounded-2xl rounded-bl-md border border-teal-500/10 bg-navy-900/80 px-4 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                  {STARTER_NAME}
                </p>
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-teal-400" />
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-teal-400 [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-teal-400 [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <p className="px-4 pb-2 text-center text-sm text-red-400 sm:px-6">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-teal-500/10 bg-navy-950/60 px-4 py-4 backdrop-blur-md sm:px-6"
      >
        {showSuggestedReplies && (
          <div className="mx-auto mb-3 flex max-w-3xl flex-wrap justify-center gap-2">
            {SUGGESTED_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleSuggestedReply(reply)}
                className="rounded-full border border-teal-500/10 bg-navy-900/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-teal-500/30 hover:bg-navy-800/80 hover:text-slate-50"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's keeping you stuck?"
            rows={1}
            disabled={isLoading}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-teal-500/10 bg-navy-900/80 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-600">
          Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}
