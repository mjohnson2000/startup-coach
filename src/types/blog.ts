export type BlogPostStatus = 'draft' | 'published'

export interface BlogPostSeo {
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  ogImage?: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  status: BlogPostStatus
  publishedAt: string
  updatedAt: string
  readMinutes: number
  seo: BlogPostSeo
}

export interface BlogPostInput {
  slug: string
  title: string
  excerpt: string
  content: string
  status: BlogPostStatus
  publishedAt: string
  seo?: BlogPostSeo
}

export const SITE_NAME = 'Starter'
export const SITE_URL = 'https://bizstarteragent.com'
