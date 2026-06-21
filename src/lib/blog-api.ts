import type { BlogPost, BlogPostInput } from '../types/blog'

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/blog/posts')
  if (!response.ok) {
    throw new Error('Failed to load blog posts')
  }
  return response.json() as Promise<BlogPost[]>
}

export async function fetchPublishedPost(slug: string): Promise<BlogPost | null> {
  const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}`)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error('Failed to load blog post')
  }
  return response.json() as Promise<BlogPost>
}

export async function fetchAdminPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/admin/blog/posts', { credentials: 'include' })
  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    throw new Error(data.error ?? 'Failed to load posts')
  }
  return response.json() as Promise<BlogPost[]>
}

export async function createAdminPost(input: BlogPostInput): Promise<BlogPost> {
  const response = await fetch('/api/admin/blog/posts', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = (await response.json()) as BlogPost | { error?: string }
  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to create post')
  }
  return data as BlogPost
}

export async function updateAdminPost(id: string, input: BlogPostInput): Promise<BlogPost> {
  const response = await fetch(`/api/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = (await response.json()) as BlogPost | { error?: string }
  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Failed to update post')
  }
  return data as BlogPost
}

export async function deleteAdminPost(id: string): Promise<void> {
  const response = await fetch(`/api/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    throw new Error(data.error ?? 'Failed to delete post')
  }
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export function emptyPostInput(): BlogPostInput {
  const today = new Date().toISOString().slice(0, 10)
  return {
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    publishedAt: today,
    seo: {},
  }
}

export function postToInput(post: BlogPost): BlogPostInput {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    publishedAt: post.publishedAt,
    seo: post.seo ?? {},
  }
}
