import { stripTodaysActionLine } from '../lib/coach'
import type { ChatMessage } from '../types/chat'
import { STARTER_NAME, StarterAvatar } from './StarterAvatar'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const displayContent = isUser
    ? message.content
    : stripTodaysActionLine(message.content)

  if (isUser) {
    return (
      <div className="animate-fade-in flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-teal-500 to-emerald-600 px-4 py-3 text-sm font-medium leading-relaxed text-navy-950 sm:max-w-[75%] sm:text-[15px]">
          <p className="whitespace-pre-wrap">{displayContent}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in flex items-end gap-2">
      <StarterAvatar size="sm" className="mb-1" />
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-teal-500/10 bg-navy-900/80 px-4 py-3 text-sm leading-relaxed text-slate-100 sm:max-w-[75%] sm:text-[15px]">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-teal-400">
          {STARTER_NAME}
        </p>
        <p className="whitespace-pre-wrap">{displayContent}</p>
      </div>
    </div>
  )
}
