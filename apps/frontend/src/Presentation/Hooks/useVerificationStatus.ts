import { useState, useEffect, useCallback, useRef } from 'react'
import { VerificationService } from '@/Infrastructure/Services/VerificationService'
import { useVerificationContext } from '@/Presentation/Contexts/VerificationContext'

export const useVerificationStatus = () => {
  const { setVerificationStatus, setUserVerified, setErrorMessage } = useVerificationContext()
  const [isPolling, setIsPolling] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
      setIsPolling(false)
    }
  }, [])

  const pollStatus = useCallback(async (userId: string) => {
    try {
      const data = await VerificationService.getVerificationStatus(userId)
      console.log('[useVerificationStatus] Polling Status:', data.status)

      if (data.status === 'Approved') {
        setVerificationStatus('approved')
        setUserVerified(true)
        stopPolling()
      } else if (data.status === 'Declined') {
        setVerificationStatus('declined')
        setErrorMessage('Your biometric verification was declined by the registry.')
        stopPolling()
      }
      // If status is "In Review" or "Not Started", we keep polling
    } catch (error: any) {
      console.error('[useVerificationStatus] Polling Error:', error)
      // We don't stop polling on a single network error, just log it
    }
  }, [setVerificationStatus, setUserVerified, setErrorMessage, stopPolling])

  const startPolling = useCallback((userId: string | null) => {
    if (!userId) {
      console.warn('[useVerificationStatus] Cannot start polling without userId')
      return
    }

    if (pollIntervalRef.current) return // Already polling

    console.log('[useVerificationStatus] Starting polling for user:', userId)
    setIsPolling(true)
    
    // Initial check
    pollStatus(userId)
    
    // Set interval
    pollIntervalRef.current = setInterval(() => {
      pollStatus(userId)
    }, 2000)
  }, [pollStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return {
    isPolling,
    startPolling,
    stopPolling
  }
}
