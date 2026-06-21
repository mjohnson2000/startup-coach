import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BlogPost, BlogPostInput, BlogPostStatus } from '../src/types/blog'
import { SEED_BLOG_POSTS } from './blog-seed'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const BLOG_FILE = path.join(DATA_DIR, 'blog-posts.json')

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readPosts(): BlogPost[] {
  ensureDataDir()
  if (!fs.existsSync(BLOG_FILE)) {
    const seeded = SEED_BLOG_POSTS.map((post) => ({
      ...post,
      id: crypto.randomUUID(),
      updatedAt: post.publishedAt,
      readMinutes: estimateReadMinutes(post.content),
      seo: post.seo ?? {},
    }))
    fs.writeFileSync(BLOG_FILE, JSON.stringify(seeded, null, 2), 'utf8')
    return seeded
  }

  return JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8')) as BlogPost[]
}

function writePosts(posts: BlogPost[]): void {
  ensureDataDir()
  fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf8')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export function estimateReadMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function listPublishedPosts(): BlogPost[] {
  return readPosts()
    .filter((post) => post.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function listAllPosts(): BlogPost[] {
  return readPosts().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getPublishedPost(slug: string): BlogPost | undefined {
  return readPosts().find((post) => post.slug === slug && post.status === 'published')
}

export function getPostById(id: string): BlogPost | undefined {
  return readPosts().find((post) => post.id === id)
}

function slugInUse(slug: string, excludeId?: string): boolean {
  return readPosts().some((post) => post.slug === slug && post.id !== excludeId)
}

export function createPost(input: BlogPostInput): BlogPost {
  const posts = readPosts()
  const slug = slugify(input.slug || input.title)

  if (!slug) {
    throw new Error('Slug is required')
  }

  if (slugInUse(slug)) {
    throw new Error('A post with this slug already exists')
  }

  const now = new Date().toISOString().slice(0, 10)
  const post: BlogPost = {
    id: crypto.randomUUID(),
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    status: input.status,
    publishedAt: input.publishedAt || now,
    updatedAt: now,
    readMinutes: estimateReadMinutes(input.content),
    seo: input.seo ?? {},
  }

  posts.push(post)
  writePosts(posts)
  return post
}

export function updatePost(id: string, input: BlogPostInput): BlogPost {
  const posts = readPosts()
  const index = posts.findIndex((post) => post.id === id)

  if (index === -1) {
    throw new Error('Post not found')
  }

  const slug = slugify(input.slug || input.title)
  if (!slug) {
    throw new Error('Slug is required')
  }

  if (slugInUse(slug, id)) {
    throw new Error('A post with this slug already exists')
  }

  const updated: BlogPost = {
    ...posts[index],
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    status: input.status as BlogPostStatus,
    publishedAt: input.publishedAt,
    updatedAt: new Date().toISOString().slice(0, 10),
    readMinutes: estimateReadMinutes(input.content),
    seo: input.seo ?? {},
  }

  posts[index] = updated
  writePosts(posts)
  return updated
}

export function deletePost(id: string): void {
  const posts = readPosts()
  const next = posts.filter((post) => post.id !== id)

  if (next.length === posts.length) {
    throw new Error('Post not found')
  }

  writePosts(next)
}
