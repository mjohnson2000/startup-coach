import { useState } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AnalyticsTracker } from './components/AnalyticsTracker'
import { PageShell } from './components/PageShell'
import { AdminPage } from './pages/AdminPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  const [isMockMode, setIsMockMode] = useState(false)

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <PageShell isMockMode={isMockMode}>
          <Routes>
            <Route path="/" element={<HomePage onMockModeChange={setIsMockMode} />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </PageShell>
      </BrowserRouter>
    </HelmetProvider>
  )
}
