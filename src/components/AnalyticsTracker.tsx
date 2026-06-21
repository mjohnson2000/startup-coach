import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isAnalyticsExcludedLocally, trackEvent } from '../lib/analytics'

export function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return
    if (isAnalyticsExcludedLocally()) return
    void trackEvent('page_view', { path: location.pathname })
  }, [location.pathname])

  return null
}
