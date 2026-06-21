import { useEffect, useState } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { Header } from './components/Header'
import { IntakeForm } from './components/IntakeForm'
import { ReturnVisit } from './components/ReturnVisit'
import {
  clearSavedSession,
  loadSavedSession,
  recordReturnVisit,
} from './lib/session-storage'
import type { FollowUpContext, FollowUpStatus, IntakeData, SavedSession } from './types/chat'

type AppView = 'loading' | 'return' | 'intake' | 'chat'

export default function App() {
  const [view, setView] = useState<AppView>('loading')
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null)
  const [intake, setIntake] = useState<IntakeData | null>(null)
  const [followUp, setFollowUp] = useState<FollowUpContext | undefined>()
  const [sessionKey, setSessionKey] = useState(0)
  const [isMockMode, setIsMockMode] = useState(false)

  useEffect(() => {
    const session = loadSavedSession()
    if (session) {
      setSavedSession(session)
      setView('return')
    } else {
      setView('intake')
    }
  }, [])

  function handleIntakeSubmit(data: IntakeData) {
    setIntake(data)
    setFollowUp(undefined)
    setIsMockMode(false)
    setSessionKey((key) => key + 1)
    setView('chat')
  }

  function handleReturnContinue(status: FollowUpStatus) {
    if (!savedSession) return

    recordReturnVisit()
    setIntake(savedSession.intake)
    setFollowUp({ lastAction: savedSession.lastAction, status })
    setIsMockMode(false)
    setSessionKey((key) => key + 1)
    setView('chat')
  }

  function handleStartFresh() {
    clearSavedSession()
    setSavedSession(null)
    setIntake(null)
    setFollowUp(undefined)
    setIsMockMode(false)
    setSessionKey((key) => key + 1)
    setView('intake')
  }

  function handleReset() {
    clearSavedSession()
    setSavedSession(null)
    setIntake(null)
    setFollowUp(undefined)
    setIsMockMode(false)
    setSessionKey((key) => key + 1)
    setView('intake')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-navy-950 via-navy-925 to-navy-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/15 via-transparent to-transparent" />
      <div className="relative flex min-h-dvh flex-col">
        <Header isMockMode={isMockMode} />
        {view === 'loading' && null}
        {view === 'return' && savedSession && (
          <ReturnVisit
            session={savedSession}
            onContinue={handleReturnContinue}
            onStartFresh={handleStartFresh}
          />
        )}
        {view === 'intake' && <IntakeForm onSubmit={handleIntakeSubmit} />}
        {view === 'chat' && intake && (
          <ChatInterface
            key={sessionKey}
            intake={intake}
            followUp={followUp}
            onReset={handleReset}
            onMockModeChange={setIsMockMode}
          />
        )}
      </div>
    </div>
  )
}
