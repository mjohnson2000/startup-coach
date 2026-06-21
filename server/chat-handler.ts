import type { FollowUpContext, IntakeData } from '../src/types/chat'
import { buildSystemPrompt, extractTodaysAction } from '../src/lib/coach'
import OpenAI from 'openai'

export interface ChatMessageInput {
  role: 'user' | 'assistant'
  content: string
}

type ConversationStage = 'opening' | 'exploring' | 'action' | 'follow-up'

function getLastUserMessage(messages: ChatMessageInput[]): string {
  return [...messages].reverse().find((m) => m.role === 'user')?.content.trim() ?? ''
}

function getLastAssistantMessage(messages: ChatMessageInput[]): string {
  return [...messages].reverse().find((m) => m.role === 'assistant')?.content.trim() ?? ''
}

function getUserTurnCount(messages: ChatMessageInput[]): number {
  return messages.filter((m) => m.role === 'user').length
}

function getStage(userTurn: number): ConversationStage {
  if (userTurn <= 1) return 'opening'
  if (userTurn <= 3) return 'exploring'
  if (userTurn <= 5) return 'action'
  return 'follow-up'
}

function pickVariant(seed: number, variants: string[]): string {
  return variants[Math.abs(seed) % variants.length]
}

function openReply(userText: string, turn: number): string {
  const openers = [
    '',
    'Fair point. ',
    'Okay — ',
    'That tracks. ',
    'Right. ',
  ]

  if (turn % 4 === 0 && userText.length <= 80) {
    const snippet = userText.length > 50 ? `${userText.slice(0, 47)}...` : userText
    return `On "${snippet}" — `
  }

  return pickVariant(turn, openers)
}

function withAction(body: string, action: string): string {
  return `${body.trim()}\n\nTODAY'S ACTION: ${action}`
}

function isConfused(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('what do you mean') ||
    lower.includes('not sure what you mean') ||
    lower.includes("don't understand") ||
    lower.includes('do not understand') ||
    lower.includes('confused') ||
    lower.includes('explain that') ||
    lower.includes('what does that mean') ||
    lower.includes('huh?') ||
    lower.includes('what?')
  )
}

function isUncertain(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    /\bnot sure\b/.test(lower) ||
    /\bdon'?t know\b/.test(lower) ||
    /\bunsure\b/.test(lower) ||
    /\bidk\b/.test(lower) ||
    lower === 'no idea' ||
    lower.includes("don't know where to start") ||
    lower.includes('not sure where to start')
  )
}

function mentionsTalkingToPeople(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('ask someone') ||
    lower.includes('talk to') ||
    lower.includes('reach out') ||
    lower.includes('interview') ||
    lower.includes('survey') ||
    lower.includes('ask people') ||
    lower.includes('ask a friend') ||
    lower.includes('message someone') ||
    lower.includes('dm someone')
  )
}

function isPushback(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes("won't work") ||
    lower.includes('already tried') ||
    lower.includes('tried that') ||
    lower.includes("doesn't help") ||
    lower.includes('but what if') ||
    lower.includes('too hard') ||
    lower.includes("can't do that")
  )
}

function mentionsProgress(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('done') ||
    lower.includes('finished') ||
    lower.includes('completed') ||
    lower.includes('i did') ||
    lower.includes('sent the') ||
    lower.includes('talked to')
  )
}

function mentionsTimeConstraint(text: string): boolean {
  const lower = text.toLowerCase()
  return lower.includes('no time') || lower.includes('busy') || lower.includes("don't have time")
}

function mentionsFear(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    lower.includes('scared') ||
    lower.includes('afraid') ||
    lower.includes('fear') ||
    lower.includes('nervous') ||
    lower.includes('embarrass')
  )
}

function alreadySuggestedCustomerTalk(assistantText: string): boolean {
  return /talk to|reach out|message|conversation|customer|interview|ask them/i.test(assistantText)
}

function getMockResponse(messages: ChatMessageInput[], intake: IntakeData): string {
  const lastUser = getLastUserMessage(messages)
  const lastAssistant = getLastAssistantMessage(messages)
  const userTurn = getUserTurnCount(messages)
  const stage = getStage(userTurn)
  const opener = openReply(lastUser, userTurn)
  const ideaSnippet =
    intake.businessIdea.length > 40
      ? `${intake.businessIdea.slice(0, 37)}...`
      : intake.businessIdea

  if (stage === 'opening') {
    const openings = [
      withAction(
        `Good — showing up beats another round of "I'll start Monday."

You mentioned ${intake.blocker.toLowerCase()} is in the way. Let's not fix everything — just find one person who might have the problem you're solving with ${ideaSnippet}.

What's the smallest way you could learn something real from one conversation this week?`,
        'Write down 3 people you could ask about this problem in the next 48 hours — names, not categories.',
      ),
      withAction(
        `Alright, let's skip the perfect plan.

Your blocker sounds like "${intake.blocker}" — totally common. The move now isn't branding; it's one real signal from someone who might actually want ${ideaSnippet}.

Who's one person you could talk to without pitching anything yet?`,
        'Pick one name and draft a 2-sentence message asking if you can ask them 2 quick questions.',
      ),
    ]
    return pickVariant(userTurn, openings)
  }

  if (isConfused(lastUser)) {
    return withAction(
      `${opener}Sorry if that was fuzzy — here's the simple version.

An assumption is something you believe but haven't checked yet. For ${ideaSnippet}, that might be "people want this" or "they'll pay."

You don't need a survey. One short conversation can test one assumption.`,
      'Finish this sentence: "I assume ___." Then name one person you could ask yes/no about it today.',
    )
  }

  if (isUncertain(lastUser) && !mentionsTalkingToPeople(lastUser)) {
    if (stage === 'exploring') {
      return withAction(
        `${opener}You don't need the perfect answer — just one small experiment.

Think: who already deals with the problem behind ${ideaSnippet}? A friend, coworker, or someone in an online group counts.`,
        "Send one message: \"I'm exploring [problem] — can I ask you 2 quick questions?\" No pitch yet.",
      )
    }

    return withAction(
      `${opener}"Not sure" is okay — staying stuck isn't. Let's make this easy:

A) Talk to 1 potential customer this week
B) Post one sentence about the problem and see who responds

Which feels doable?`,
      'Reply A or B, then do that one thing in the next 30 minutes.',
    )
  }

  if (mentionsTalkingToPeople(lastUser)) {
    return withAction(
      `${opener}That's the right instinct — real conversations beat more research.

Keep it tiny: one person, two questions — "Do you have this problem?" and "What have you tried?"`,
      "Name the person you'll message today and paste the exact 2 questions you'll ask.",
    )
  }

  if (mentionsFear(lastUser)) {
    return withAction(
      `${opener}That nervous feeling is normal — it usually means you care about doing this right.

You don't need confidence first. You need a low-stakes test: one DM or one conversation that takes 15 minutes and is easy to undo.`,
      'Pick one 15-minute test (one DM, one post, or one call) and do it before opening another tab.',
    )
  }

  if (mentionsTimeConstraint(lastUser)) {
    return withAction(
      `${opener}"No time" often means "not prioritized yet." You don't need 40 hours — 30 focused minutes can move ${ideaSnippet} forward.

Treat it like a meeting with your future self: phone away, one outcome only.`,
      `Block 30 minutes tomorrow labeled "Start ${ideaSnippet.slice(0, 25)}" and do the single ugliest first step.`,
    )
  }

  if (mentionsProgress(lastUser)) {
    return withAction(
      `${opener}Nice — that's real momentum. Most people never get this far.

While the energy is here, pick the next tiny step so you don't lose the thread.`,
      'Reply with what you learned from that action, then choose the next 20-minute task.',
    )
  }

  if (isPushback(lastUser)) {
    return withAction(
      `${opener}I hear the skepticism — let's make this smaller so it's actually testable.

What's the cheapest version of this that still gives you a yes/no signal about ${ideaSnippet}?`,
      'Describe a 20-minute experiment you could run today, even if it feels imperfect.',
    )
  }

  if (stage === 'follow-up' && alreadySuggestedCustomerTalk(lastAssistant)) {
    const followUps = [
      withAction(
        `${opener}Last time we talked about reaching someone — any movement there, or did something else come up?

Either way, one step today beats another planning session.`,
        'Report what happened (or what blocked you) and pick one 20-minute follow-up.',
      ),
      withAction(
        `${opener}Let's stay concrete. What's one thing you've learned from a real person so far about ${ideaSnippet}?

If nothing yet, that's the gap — one conversation changes more than a week of notes.`,
        'Identify one person with the problem and ask them one question before you reply again.',
      ),
    ]
    return pickVariant(userTurn, followUps)
  }

  const fallbacks = [
    withAction(
      `${opener}Let's make this tangible. What's one thing you believe about ${ideaSnippet} that you haven't tested yet?

Examples: people want this, they'll pay, you can reach them, you can deliver quickly.`,
      "Pick the riskiest untested belief and write how you'd check it in 20 minutes.",
    ),
    withAction(
      `${opener}Progress here isn't a business plan — it's evidence from real people.

What's the smallest step that would teach you something useful about ${ideaSnippet} today?`,
      'Complete one concrete validation step in the next 30 minutes, then report back.',
    ),
    withAction(
      `${opener}You might be polishing when you should be learning. That's common with "${intake.blocker}."

Name one assumption you could prove or disprove today with zero budget.`,
      'Do that one step in the next 30 minutes — message, post, or conversation counts.',
    ),
  ]

  return pickVariant(userTurn - 2, fallbacks)
}

function hasValidApiKey(key: string | undefined): key is string {
  if (!key || key === 'undefined' || key.trim() === '') return false
  return true
}

export async function handleChat(
  messages: ChatMessageInput[],
  intake: IntakeData,
  followUp?: FollowUpContext,
): Promise<{ message: string; todaysAction?: string; isMock: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY
  const userTurnCount = getUserTurnCount(messages)

  if (!hasValidApiKey(apiKey)) {
    const message = getMockResponse(messages, intake)
    return { message, todaysAction: extractTodaysAction(message), isMock: true }
  }

  try {
    const openai = new OpenAI({ apiKey })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(intake, userTurnCount, followUp) },
        ...messages,
      ],
      max_tokens: 450,
      temperature: 0.7,
    })

    const message = response.choices[0]?.message?.content ?? 'Something went wrong. Try again.'
    return { message, todaysAction: extractTodaysAction(message), isMock: false }
  } catch (error) {
    console.error('OpenAI request failed, using mock response:', error)
    const message = getMockResponse(messages, intake)
    return { message, todaysAction: extractTodaysAction(message), isMock: true }
  }
}
