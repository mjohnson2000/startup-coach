import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL } from '../types/blog'

interface SeoProps {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
  image?: string
  keywords?: string
  noIndex?: boolean
}

export function Seo({
  title,
  description,
  path,
  type = 'website',
  publishedAt,
  updatedAt,
  image,
  keywords,
  noIndex = false,
}: SeoProps) {
  const canonical = `${SITE_URL}${path}`
  const ogImage = image || `${SITE_URL}/favicon.svg`
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  const jsonLd =
    type === 'article' && publishedAt
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          datePublished: publishedAt,
          dateModified: updatedAt || publishedAt,
          author: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
          mainEntityOfPage: canonical,
          image: ogImage,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description,
        }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
