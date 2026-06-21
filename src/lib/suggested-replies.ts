import type { BlockerType, FollowUpContext, FollowUpStatus, IntakeData } from '../types/chat'

export interface ConversationContext {
  intake: IntakeData
  followUp?: FollowUpContext
  userMessageCount: number
  hasTodaysAction: boolean
}

export function inferBlockerType(intake: IntakeData): BlockerType {
  if (intake.blockerType && intake.blockerType !== 'custom') {
    return intake.blockerType
  }

  const text = `${intake.blocker} ${intake.businessIdea}`.toLowerCase()

  if (/too many|can't pick|which idea|several ideas|multiple ideas|pick one/.test(text)) {
    return 'too_many_ideas'
  }
  if (/research|planning|never start|tutorial|watching videos|analysis/.test(text)) {
    return 'analysis_paralysis'
  }
  if (/pay|customer|would anyone|validate|nobody would|no one would/.test(text)) {
    return 'validation_fear'
  }
  if (/first step|don't know where|where to start|how to start|what to do/.test(text)) {
    return 'no_first_step'
  }

  return 'custom'
}

function getBlockerReplies(type: BlockerType, stage: 'opening' | 'mid' | 'deep'): string[] {
  const replies: Record<BlockerType, Record<'opening' | 'mid' | 'deep', string[]>> = {
    too_many_ideas: {
      opening: [
        'Help me pick between my top two ideas',
        'Which idea is fastest to test this week?',
        'I keep adding new ideas instead of starting',
      ],
      mid: [
        'I narrowed it to two — help me choose',
        'What would you test first if you were me?',
        'I still cannot commit to one idea',
      ],
      deep: [
        'Give me one idea to test by this weekend',
        'What is the smallest test for my top idea?',
        'Help me stop comparing and start',
      ],
    },
    analysis_paralysis: {
      opening: [
        'I researched more instead of doing anything',
        'What is the smallest real-world test?',
        'I need a step I can do in 15 minutes',
      ],
      mid: [
        'I am stuck in another research loop',
        'What counts as enough planning?',
        'Push me toward one concrete move',
      ],
      deep: [
        'No more research — what should I do today?',
        'What is one thing a customer could see today?',
        'Make the next step embarrassingly small',
      ],
    },
    validation_fear: {
      opening: [
        'I am scared to talk to potential customers',
        'How do I find my first customer?',
        'What if nobody responds?',
      ],
      mid: [
        'I know who to talk to but have not reached out',
        'Help me write the first outreach message',
        'What is a low-pressure way to validate this?',
      ],
      deep: [
        'Give me the exact message to send someone',
        'Who should I talk to first?',
        'How do I ask without feeling salesy?',
      ],
    },
    no_first_step: {
      opening: [
        'What should I do today?',
        'What is step one for this kind of business?',
        'I have the idea but no plan',
      ],
      mid: [
        'That still feels too big — make it smaller',
        'What can I do with no money?',
        'What would you do in the next 30 minutes?',
      ],
      deep: [
        'Give me one action for tonight',
        'What is the first step for a local business?',
        'What is the first step for an online business?',
      ],
    },
    custom: {
      opening: [
        'Help me figure out the next step',
        'I am still stuck on the same thing',
        'What should I focus on first?',
      ],
      mid: [
        'Can you make the next step smaller?',
        'I tried thinking it through — still stuck',
        'What would you do in my shoes?',
      ],
      deep: [
        'Give me one thing to do in the next 30 minutes',
        'What is the fastest way to get a real signal?',
        'Help me stop overthinking and start',
      ],
    },
  }

  return replies[type][stage]
}

function getFollowUpReplies(status: FollowUpStatus, hasTodaysAction: boolean): string[] {
  if (hasTodaysAction) {
    switch (status) {
      case 'completed':
        return ['I did it — here is what happened', 'It went well — what is next?', 'Can we build on that momentum?']
      case 'partial':
        return ['I started but did not finish', 'I got partway — need a smaller finish step', 'Something blocked me halfway']
      default:
        return ['I did not do it yet — make it smaller', 'I procrastinated again', 'What is a 15-minute version?']
    }
  }

  switch (status) {
    case 'completed':
      return ['Here is what I learned', 'It went better than I expected', 'What should I do next?']
    case 'partial':
      return ['I made some progress', 'Something blocked me', 'Help me finish the rest']
    default:
      return ['I did not get to it yet', 'Something got in the way', 'I need a smaller next step']
  }
}

function getStage(userMessageCount: number): 'opening' | 'mid' | 'deep' {
  if (userMessageCount <= 0) return 'opening'
  if (userMessageCount === 1) return 'mid'
  return 'deep'
}

export function getSuggestedReplies(context: ConversationContext): string[] {
  const { intake, followUp, userMessageCount, hasTodaysAction } = context

  if (followUp) {
    return getFollowUpReplies(followUp.status, hasTodaysAction)
  }

  if (hasTodaysAction) {
    return [
      "I'll try that today",
      'That feels too big for me',
      'Can you break it into something smaller?',
    ]
  }

  const blockerType = inferBlockerType(intake)
  return getBlockerReplies(blockerType, getStage(userMessageCount))
}

export function getChatPlaceholder(context: ConversationContext): string {
  const { followUp, userMessageCount, hasTodaysAction } = context

  if (followUp) {
    if (followUp.status === 'completed') return 'Tell Starter what you learned or what happened...'
    if (followUp.status === 'partial') return 'What did you finish, and what blocked you?'
    return 'What got in the way since last time?'
  }

  if (hasTodaysAction) return 'Questions about your next step, or how it went...'
  if (userMessageCount === 0) return 'Reply to Starter or add more context...'
  return 'What would help you take the next step?'
}
