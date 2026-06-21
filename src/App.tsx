import { useState } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { Header } from './components/Header'
import { IntakeForm } from './components/IntakeForm'
import type { IntakeData } from './types/chat'

export default function App() {
  const [intake, setIntake] = useState<IntakeData | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const [isMockMode, setIsMockMode] = useState(false)

  function handleIntakeSubmit(data: IntakeData) {
    setIntake(data)
    setIsMockMode(false)
    setSessionKey((key) => key + 1)
  }

  function handleReset() {
    setIntake(null)
    setIsMockMode(false)
    setSessionKey((key) => key + 1)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-navy-950 via-navy-925 to-navy-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/15 via-transparent to-transparent" />
      <div className="relative flex min-h-dvh flex-col">
        <Header isMockMode={isMockMode} />
        {!intake ? (
          <IntakeForm onSubmit={handleIntakeSubmit} />
        ) : (
          <ChatInterface
            key={sessionKey}
            intake={intake}
            onReset={handleReset}
            onMockModeChange={setIsMockMode}
          />
        )}
      </div>
    </div>
  )
}
