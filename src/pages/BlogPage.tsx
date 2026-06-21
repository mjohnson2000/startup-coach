import { Link } from 'react-router-dom'
import { BLOG_POSTS } from '../data/blog-posts'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">Blog</p>
        <h1 className="mb-3 text-3xl font-bold text-slate-50">Ideas, starting, and getting unstuck</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Short reads for young entrepreneurs with lots of ideas — how to pick one, stop researching,
          and take a real first step. Online or local.
        </p>
      </div>

      <div className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5 transition hover:border-teal-500/20 sm:p-6"
          >
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span>·</span>
              <span>{post.readMinutes} min read</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-50">
              <Link to={`/blog/${post.slug}`} className="transition hover:text-teal-300">
                {post.title}
              </Link>
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
            <Link
              to={`/blog/${post.slug}`}
              className="text-sm font-medium text-teal-400 transition hover:text-teal-300"
            >
              Read article →
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-950/25 p-6 text-center">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
          Ready to move?
        </p>
        <p className="mb-4 text-sm text-slate-300">
          Pick an idea and get one clear next step from Starter — free.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500"
        >
          Help me start
        </Link>
      </div>
    </main>
  )
}
