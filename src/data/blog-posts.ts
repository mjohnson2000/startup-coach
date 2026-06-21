export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readMinutes: number
  paragraphs: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'too-many-business-ideas',
    title: 'Too Many Business Ideas? How to Pick One and Start',
    excerpt:
      'Five ideas on your notes app and zero launched? Here is a simple way to choose one business idea and take a real first step today.',
    publishedAt: '2026-06-21',
    readMinutes: 4,
    paragraphs: [
      'If you have a notes app full of business ideas and nothing launched yet, you are not alone. Most young entrepreneurs do not fail because they lack ideas — they fail because they cannot pick one.',
      'Analysis paralysis feels productive. Researching markets, watching tutorials, and asking AI for more ideas all feel like progress. But none of them count until a real person responds to something you offer.',
      'When you are stuck between ideas, use the 48-hour test: which idea could you test with one conversation, one post, or one small paid trial before the weekend? Not which idea is biggest. Not which idea sounds coolest. Which one is fastest to get a yes-or-no signal from the real world.',
      'Rank your top three ideas on three questions: Can I talk to a potential customer this week? Can I offer something small without spending money I do not have? Would I still work on this if nobody clapped on social media? The idea that wins two out of three is your starting point.',
      'Your first step is not a logo, LLC, or business plan. It is one validation move: message three people who might have the problem, post a simple offer in a local group, or do one trial job at a fair price. You are not committing forever — you are running a tiny experiment.',
      'Starter exists for this exact moment — when you have ideas but need someone to help you pick one and name the next small step. If you are stuck right now, that is a better use of the next ten minutes than adding idea number six to your list.',
    ],
  },
  {
    slug: 'analysis-paralysis-starting-business',
    title: 'Analysis Paralysis: Why You Keep Researching Instead of Starting',
    excerpt:
      'Research feels safe. Starting feels risky. Here is why your brain keeps looping — and how to break out with one 30-minute action.',
    publishedAt: '2026-06-20',
    readMinutes: 5,
    paragraphs: [
      'You know the loop. Watch a video about starting a business. Open a new tab to research competitors. Ask ChatGPT for a better angle. Save three more ideas. Close the laptop feeling busy but having done nothing a customer would notice.',
      'That is analysis paralysis — and it hits young entrepreneurs hard because you have access to unlimited information. Every answer is one search away, so starting never feels ready.',
      'Research is low-risk. If you only plan, you cannot fail publicly. Your brain prefers that to the awkwardness of messaging someone, posting an offer nobody buys, or finding out an idea is weaker than you hoped.',
      'The fix is not more motivation. It is smaller stakes. Shrink the step until it feels almost too easy: one DM, one question to a friend, one hour of paid help, one post asking if anyone has this problem. The goal is data, not perfection.',
      'Set a rule: no new research until you complete one real-world test on your current top idea. New ideas are not free — they cost the momentum you would have spent learning something useful.',
      'If you are in the loop right now, stop reading after this paragraph and do one thing in the next 30 minutes that a future customer could see or respond to. Everything else can wait.',
    ],
  },
  {
    slug: 'first-step-local-or-online-business',
    title: 'Your First Business Step Does Not Have to Be Online',
    excerpt:
      'Not every business starts with a website. Food trucks, tutoring, lawn care, and local services all begin with one real conversation.',
    publishedAt: '2026-06-19',
    readMinutes: 4,
    paragraphs: [
      'A lot of startup advice assumes you are building an app, a digital product, or a personal brand. But plenty of young entrepreneurs want to start local — tutoring, cleaning, food, trades, events, mobile services.',
      'If that is you, you do not need a polished website before you start. You need proof that someone will pay for the problem you solve.',
      'For local businesses, the fastest tests look like this: talk to five people who might be customers, offer to do one job at a discount in exchange for honest feedback, or post in a neighborhood group describing the problem you solve and asking who relates.',
      'For online businesses, the same principle applies with different tools: a simple offer post, three DMs, a one-page listing, or a short Loom explaining what you are trying and asking for reactions.',
      'The business type changes the tactic. The rule does not: validate before you invest weeks building something nobody asked for.',
      'Pick the channel your customers actually use — not the one startup Twitter says you should. Then take one step there today.',
    ],
  },
  {
    slug: '30-minute-rule-stuck-entrepreneurs',
    title: 'The 30-Minute Rule for Entrepreneurs Who Feel Stuck',
    excerpt:
      'You do not need a free week to start a business. You need one focused half-hour and a single next action.',
    publishedAt: '2026-06-18',
    readMinutes: 3,
    paragraphs: [
      'When you have lots of ideas and zero momentum, big plans make things worse. A 90-day roadmap sounds responsible but often becomes another document you never follow.',
      'Try the 30-minute rule instead: one timer, one outcome, no switching tabs. Examples: write the exact message you will send to three potential customers. List ten people who might pay for your idea and circle one to contact. Draft a one-sentence offer and post it somewhere real people will see it.',
      'If 30 minutes ends and you have something sent, posted, or scheduled — you win. If you only have more notes, you were researching again. Adjust tomorrow’s step to be smaller.',
      'Starter is built around this rhythm — one clear action per session, then a check-in when you come back. Starting a business is mostly a chain of small moves, not one heroic launch day.',
      'Set a timer for 30 minutes after you close this article. Pick one idea. Do one thing that creates a response from the outside world. That is what starting looks like.',
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
