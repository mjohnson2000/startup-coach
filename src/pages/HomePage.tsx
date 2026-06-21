import { useEffect, useState } from 'react'
import { ChatInterface } from '../components/ChatInterface'
import { IntakeForm } from '../components/IntakeForm'
import { ReturnVisit } from '../components/ReturnVisit'
import {
  clearSavedSession,
  loadSavedSession,
  recordReturnVisit,
} from '../lib/session-storage'
import { trackEvent } from '../lib/analytics'
import type { FollowUpContext, FollowUpStatus, IntakeData, SavedSession } from '../types/chat'

type HomeView = 'loading' | 'return' | 'intake' | 'chat'

interface HomePageProps {
  onMockModeChange?: (isMock: boolean) => void
}

export function HomePage({ onMockModeChange }: HomePageProps) {
  const [view, setView] = useState<HomeView>('loading')
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null)
  const [intake, setIntake] = useState<IntakeData | null>(null)
  const [followUp, setFollowUp] = useState<FollowUpContext | undefined>()
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    const session = loadSavedSession()
    if (session) {
      setSavedSession(session)
      setView('return')
    } else {
      setView('intake')
    }
  }, [])

  useEffect(() => {
    if (view !== 'chat') onMockModeChange?.(false)
  }, [view, onMockModeChange])

  function handleIntakeSubmit(data: IntakeData) {
    setIntake(data)
    setFollowUp(undefined)
    onMockModeChange?.(false)
    setSessionKey((key) => key + 1)
    setView('chat')
  }

  function handleReturnContinue(status: FollowUpStatus) {
    if (!savedSession) return

    recordReturnVisit()
    setIntake(savedSession.intake)
    setFollowUp({ lastAction: savedSession.lastAction, status })
    onMockModeChange?.(false)
    setSessionKey((key) => key + 1)
    setView('chat')
  }

  function handleStartFresh() {
    clearSavedSession()
    setSavedSession(null)
    setIntake(null)
    setFollowUp(undefined)
    onMockModeChange?.(false)
    setSessionKey((key) => key + 1)
    setView('intake')
  }

  function handleReset() {
    clearSavedSession()
    setSavedSession(null)
    setIntake(null)
    setFollowUp(undefined)
    onMockModeChange?.(false)
    setSessionKey((key) => key + 1)
    setView('intake')
    void trackEvent('new_session')
  }

  return (
    <div
      className={
        view === 'chat'
          ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
          : 'flex-1'
      }
    >
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
          onMockModeChange={onMockModeChange}
        />
      )}
    </div>
  )
}
