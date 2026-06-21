import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BlogPost, BlogPostInput } from '../types/blog'
import {
  createAdminPost,
  deleteAdminPost,
  emptyPostInput,
  fetchAdminPosts,
  postToInput,
  slugifyTitle,
  updateAdminPost,
} from '../lib/blog-api'

const inputClass =
  'mobile-input w-full rounded-xl border border-white/[0.06] bg-navy-900/50 px-4 py-3 text-slate-50 outline-none transition focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/15'

function StatusBadge({ status }: { status: BlogPost['status'] }) {
  const styles =
    status === 'published'
      ? 'bg-emerald-500/15 text-emerald-300'
      : 'bg-amber-500/15 text-amber-300'

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles}`}>
      {status}
    </span>
  )
}

export function AdminBlogPanel({ startInCreateMode = false }: { startInCreateMode?: boolean }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(startInCreateMode ? 'new' : null)
  const [form, setForm] = useState<BlogPostInput>(emptyPostInput())
  const [slugTouched, setSlugTouched] = useState(false)

  const loadPosts = useCallback(async () => {
    const data = await fetchAdminPosts()
    setPosts(data)
  }, [])

  useEffect(() => {
    loadPosts()
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [loadPosts])

  function startCreate() {
    setEditingId('new')
    setForm(emptyPostInput())
    setSlugTouched(false)
    setError(null)
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id)
    setForm(postToInput(post))
    setSlugTouched(true)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyPostInput())
    setSlugTouched(false)
    setError(null)
  }

  function updateField<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === 'title' && !slugTouched) {
        next.slug = slugifyTitle(String(value))
      }
      return next
    })
  }

  function updateSeoField(key: keyof NonNullable<BlogPostInput['seo']>, value: string) {
    setForm((current) => ({
      ...current,
      seo: { ...current.seo, [key]: value },
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      if (editingId === 'new') {
        await createAdminPost(form)
      } else if (editingId) {
        await updateAdminPost(editingId, form)
      }
      await loadPosts()
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return

    setError(null)
    try {
      await deleteAdminPost(id)
      if (editingId === id) cancelEdit()
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading blog posts…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Blog posts</h2>
          <p className="mt-1 text-sm text-slate-400">
            Write, edit, publish, or delete articles. Markdown supported in the body.
          </p>
        </div>
        {!editingId && (
          <button
            type="button"
            onClick={startCreate}
            className="touch-target rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500"
          >
            New post
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {editingId && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5 sm:p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-50">
            {editingId === 'new' ? 'New post' : 'Edit post'}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">URL slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  updateField('slug', event.target.value)
                }}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Publish date</span>
              <input
                type="date"
                value={form.publishedAt}
                onChange={(event) => updateField('publishedAt', event.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => updateField('excerpt', event.target.value)}
                required
                rows={2}
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">
                Content (Markdown)
              </span>
              <textarea
                value={form.content}
                onChange={(event) => updateField('content', event.target.value)}
                required
                rows={14}
                className={`${inputClass} font-mono text-xs leading-relaxed`}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  updateField('status', event.target.value as BlogPostInput['status'])
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.04] bg-navy-900/40 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-200">SEO</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">
                  Meta title (optional — defaults to post title)
                </span>
                <input
                  type="text"
                  value={form.seo?.metaTitle ?? ''}
                  onChange={(event) => updateSeoField('metaTitle', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">
                  Meta description (optional — defaults to excerpt)
                </span>
                <textarea
                  value={form.seo?.metaDescription ?? ''}
                  onChange={(event) => updateSeoField('metaDescription', event.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">Keywords</span>
                <input
                  type="text"
                  value={form.seo?.keywords ?? ''}
                  onChange={(event) => updateSeoField('keywords', event.target.value)}
                  placeholder="startup, business ideas, first step"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">
                  Social image URL
                </span>
                <input
                  type="url"
                  value={form.seo?.ogImage ?? ''}
                  onChange={(event) => updateSeoField('ogImage', event.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="touch-target rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : editingId === 'new' ? 'Publish post' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-white/[0.06] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-white/[0.06] bg-navy-850/80 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          All posts ({posts.length})
        </h3>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts yet. Create your first one above.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/[0.04] bg-navy-900/40 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-100">{post.title}</p>
                    <StatusBadge status={post.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    /blog/{post.slug} · {post.publishedAt} · {post.readMinutes} min
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.status === 'published' && (
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.04]"
                    >
                      View
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.04]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(post.id, post.title)}
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
