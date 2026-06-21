import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PageShell } from './components/PageShell'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  const [isMockMode, setIsMockMode] = useState(false)

  return (
    <BrowserRouter>
      <PageShell isMockMode={isMockMode}>
        <Routes>
          <Route path="/" element={<HomePage onMockModeChange={setIsMockMode} />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  )
}
