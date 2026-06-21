import { Link, Navigate, useParams } from 'react-router-dom'
import { getBlogPost } from '../data/blog-posts'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/blog"
        className="mb-6 inline-flex text-sm text-slate-500 transition hover:text-slate-300"
      >
        ← Back to blog
      </Link>

      <article>
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span>·</span>
          <span>{post.readMinutes} min read</span>
        </div>

        <h1 className="mb-6 text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
          {post.title}
        </h1>

        <div className="blog-prose space-y-4">
          {post.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </article>

      <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-950/25 p-6 text-center">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
          Stuck on what to do next?
        </p>
        <p className="mb-4 text-sm text-slate-300">
          Tell Starter your ideas and get one action you can do in the next 30 minutes.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500"
        >
          Talk to Starter
        </Link>
      </div>
    </main>
  )
}
