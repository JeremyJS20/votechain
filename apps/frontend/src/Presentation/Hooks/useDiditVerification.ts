import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DiditSdk } from '@didit-protocol/sdk-web'
import { VerificationService } from '../../Infrastructure/Services/VerificationService'
import { useVerificationContext } from '../Contexts/VerificationContext'

export const useDiditVerification = () => {
  const { i18n } = useTranslation()
  const { 
    setVerificationStatus, 
    setUserVerified, 
    setErrorMessage,
    cachedUrl,
    setCachedUrl,
    userId,
    resetSession
  } = useVerificationContext()

  const startVerification = useCallback(async (cedula?: string) => {
    try {
      setErrorMessage(null)
      setVerificationStatus('initializing')
      setUserVerified(false)

      let verification_url = cachedUrl

      // 1. Hit backend to create session ONLY IF we don't have a cached one
      if (!verification_url) {
        const langCode = i18n.language.split('-')[0] || 'en'
        const response = await VerificationService.createSession(langCode, userId || undefined, cedula)
        verification_url = response.verification_url
        setCachedUrl(verification_url)
      } else {
        console.log('[useDiditVerification] Reusing cached session URL:', verification_url)
      }
      
      // 2. Mock mode hook bypass 
      if (verification_url?.includes('localhost:5174/mock-verification')) {
        setVerificationStatus('authenticating')
        setTimeout(() => {
          setVerificationStatus('approved')
          setUserVerified(true)
        }, 2000)
        return
      }

      // 3. Setup Listeners on the Singleton
      DiditSdk.shared.onStateChange = (state: any, error?: string) => {
        console.log('[useDiditVerification] State Change:', state, error)
        if (state === 'loading') {
          setVerificationStatus('authenticating')
        } else if (state === 'ready') {
          setVerificationStatus('active')
        } else if (state === 'error') {
          // Only switch to error status if we're not already active/approved
          setVerificationStatus('error')
          setErrorMessage(error || 'Internal SDK Error')
        }
      }

      DiditSdk.shared.onEvent = (event: any) => {
        console.log('[useDiditVerification] Event:', event.type, event.data)
        if (event.type === 'didit:ready') {
          setVerificationStatus('active')
        } else if (event.type === 'didit:error') {
          setVerificationStatus('error')
          setErrorMessage(event.data?.error || 'SDK Event Error')
        }
      }

      DiditSdk.shared.onComplete = (result: any) => {
        console.log('[useDiditVerification] onComplete:', result)
        if (result.type === 'completed' && result.session) {
          const status = result.session.status
          if (status === 'Approved') {
            // Bypass backend polling: Trust SDK 'Approved' signal immediately
            setVerificationStatus('approved')
            setUserVerified(true)
            setCachedUrl(null)
          } else if (status === 'Declined') {
            setVerificationStatus('declined')
            setErrorMessage('Your identity could not be verified. Please try again with clear lighting and your original document.')
            setCachedUrl(null)
          }
        } else if (result.type === 'cancelled') {
          resetSession()
        } else if (result.type === 'failed') {
          setVerificationStatus('error')
          setErrorMessage(result.error?.message || 'Verification failed. Please try again.')
          setCachedUrl(null)
        }
      }

      // 4. Start SDK UI Flow
      // Wait for React to definitely have the container in DOM
      setTimeout(() => {
        if (!verification_url) {
          console.error('[useDiditVerification] No verification URL provided to SDK')
          setVerificationStatus('error')
          setErrorMessage('Could not initialize verification: URL missing')
          return
        }

        console.log('[useDiditVerification] Calling startVerification with URL:', verification_url)
        DiditSdk.shared.startVerification({
          url: verification_url,
          configuration: {
            loggingEnabled: true,
            embedded: true,
            embeddedContainerId: 'didit-verification-container',
            zIndex: 1000
          }
        })
      }, 300)

    } catch (error: any) {
      console.error('[useDiditVerification] Error:', error)
      setVerificationStatus('error')
      setErrorMessage(error.message || 'Network error while creating session')
    }
  }, [setVerificationStatus, setUserVerified, setErrorMessage, cachedUrl, setCachedUrl, i18n.language, userId])

  return {
    startVerification
  }
}
