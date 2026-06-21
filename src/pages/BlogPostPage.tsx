import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import { Seo } from '../components/Seo'
import { fetchPublishedPost } from '../lib/blog-api'
import { trackEvent } from '../lib/analytics'
import type { BlogPost } from '../types/blog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setPost(null)
      return
    }

    fetchPublishedPost(slug)
      .then((result) => {
        setPost(result)
        if (result) void trackEvent('blog_post_view', { slug: result.slug })
      })
      .catch((err: Error) => setError(err.message))
  }, [slug])

  if (post === undefined && !error) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-slate-500">Loading article…</p>
      </main>
    )
  }

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const seoTitle = post.seo?.metaTitle || post.title
  const seoDescription = post.seo?.metaDescription || post.excerpt

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/blog/${post.slug}`}
        type="article"
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        image={post.seo?.ogImage}
        keywords={post.seo?.keywords}
      />

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

        <div className="blog-prose">
          <Markdown>{post.content}</Markdown>
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
