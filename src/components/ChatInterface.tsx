import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { saveSession } from '../lib/session-storage'
import { getChatPlaceholder, getSuggestedReplies } from '../lib/suggested-replies'
import type { ChatMessage, FollowUpContext, IntakeData } from '../types/chat'
import { FeedbackForm } from './FeedbackForm'
import { MessageBubble } from './MessageBubble'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'
import { TodaysAction } from './TodaysAction'

interface ChatInterfaceProps {
  intake: IntakeData
  followUp?: FollowUpContext
  onReset: () => void
  onMockModeChange?: (isMock: boolean) => void
}

const MIN_TYPING_MS = 450

function createMessage(
  role: 'user' | 'assistant',
  content: string,
  options?: { hidden?: boolean },
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
    hidden: options?.hidden,
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildKickoff(intake: IntakeData, followUp?: FollowUpContext): string {
  if (followUp) {
    const statusLabel =
      followUp.status === 'completed'
        ? 'Yes, I completed it'
        : followUp.status === 'partial'
          ? 'I made partial progress'
          : 'Not yet — I did not complete it'

    return `I'm back for a follow-up on my business ideas ("${intake.businessIdea}"). Last session Starter asked me to: "${followUp.lastAction}". Status: ${statusLabel}. What's still keeping me stuck: ${intake.blocker}.`
  }

  return `I'm a young entrepreneur and want to start a business but I'm stuck. I have a lot of ideas — top ones: "${intake.businessIdea}". What's keeping me stuck: ${intake.blocker}. I want to start ${intake.timeline.toLowerCase()}.`
}

export function ChatInterface({
  intake,
  followUp,
  onReset,
  onMockModeChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [todaysAction, setTodaysAction] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (todaysAction) {
      saveSession(intake, todaysAction)
      setShowFeedback(true)
    }
  }, [intake, todaysAction])

  useEffect(() => {
    if (hasStarted) return

    async function startSession() {
      setHasStarted(true)
      setIsLoading(true)
      setError(null)

      try {
        const kickoff = buildKickoff(intake, followUp)
        const userMessage = createMessage('user', kickoff, { hidden: true })

        const [response] = await Promise.all([
          sendChatMessage({
            messages: [{ role: 'user', content: kickoff }],
            intake,
            followUp,
          }),
          wait(MIN_TYPING_MS),
        ])

        setMessages([userMessage, createMessage('assistant', response.message)])
        if (response.todaysAction) setTodaysAction(response.todaysAction)
        if (response.isMock) onMockModeChange?.(true)
        void trackEvent('chat_started', { followUp: Boolean(followUp) })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setHasStarted(false)
      } finally {
        setIsLoading(false)
      }
    }

    startSession()
  }, [followUp, hasStarted, intake, onMockModeChange])

  async function sendUserMessage(trimmed: string) {
    if (!trimmed || isLoading) return

    const userMessage = createMessage('user', trimmed)
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setError(null)
    void trackEvent('chat_message_sent')

    try {
      const [response] = await Promise.all([
        sendChatMessage({
          messages: nextMessages
            .filter((message) => !message.hidden)
            .map(({ role, content }) => ({ role, content })),
          intake,
          followUp,
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

  const visibleMessages = messages.filter((message) => !message.hidden)
  const userMessageCount = visibleMessages.filter((message) => message.role === 'user').length
  const conversationContext = {
    intake,
    followUp,
    userMessageCount,
    hasTodaysAction: Boolean(todaysAction),
  }
  const suggestedReplies = getSuggestedReplies(conversationContext)
  const chatPlaceholder = getChatPlaceholder(conversationContext)
  const showSuggestedReplies = !isLoading && visibleMessages.length >= 1 && !input.trim()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="safe-x flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.04] px-4 py-2 sm:px-6">
        <p className="min-w-0 truncate text-xs text-slate-500">
          {STARTER_NAME}: <span className="text-slate-300">{intake.businessIdea}</span>
        </p>
        <button
          type="button"
          onClick={onReset}
          className="touch-target shrink-0 rounded-lg px-2 text-xs text-slate-500 transition hover:text-slate-300"
        >
          New session
        </button>
      </div>

      {todaysAction && <TodaysAction action={todaysAction} />}

      {showFeedback && (
        <div className="shrink-0">
          <FeedbackForm context="chat" todaysAction={todaysAction ?? undefined} />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) =>
            message.hidden ? null : <MessageBubble key={message.id} message={message} />,
          )}

          {isLoading && (
            <div className="flex items-end gap-2">
              <StarterAvatar size="sm" className="mb-1" />
              <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-navy-850/90 px-4 py-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
        className="safe-bottom safe-x shrink-0 border-t border-white/[0.05] bg-navy-950/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4"
      >
        {showSuggestedReplies && (
          <div className="scrollbar-hidden mx-auto mb-3 flex max-w-3xl gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {suggestedReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleSuggestedReply(reply)}
                className="touch-target shrink-0 rounded-full border border-white/[0.06] bg-navy-850/70 px-3 py-2 text-left text-xs leading-snug text-slate-300 transition hover:border-teal-500/25 hover:bg-navy-800/80 hover:text-slate-50 sm:py-1.5 sm:text-center"
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
            placeholder={chatPlaceholder}
            rows={1}
            disabled={isLoading}
            className="mobile-input max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/[0.06] bg-navy-850/80 px-4 py-3 text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="touch-target shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mx-auto mt-2 hidden max-w-3xl text-center text-[11px] text-slate-600 sm:block">
          Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}
