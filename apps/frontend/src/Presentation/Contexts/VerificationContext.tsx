import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type VerificationStatus = 'idle' | 'initializing' | 'authenticating' | 'active' | 'approved' | 'declined' | 'cancelled' | 'error' | 'verifying'

interface VerificationContextState {
  verificationStatus: VerificationStatus
  errorMessage: string | null
  setVerificationStatus: (status: VerificationStatus) => void
  setErrorMessage: (message: string | null) => void
  userVerified: boolean
  setUserVerified: (verified: boolean) => void
  cachedUrl: string | null
  setCachedUrl: (url: string | null) => void
  userId: string | null
  setUserId: (id: string | null) => void
  cedula: string | null
  setCedula: (cedula: string | null) => void
  resetSession: () => void
}

const VerificationContext = createContext<VerificationContextState | undefined>(undefined)

export const VerificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cachedUrl, setCachedUrl] = useState<string | null>(null)
  
  // Initialize from sessionStorage to handle refreshes
  const [userId, setUserId] = useState<string | null>(() => sessionStorage.getItem('votechain_user_id'))
  const [cedula, setCedula] = useState<string | null>(() => sessionStorage.getItem('votechain_cedula'))
  const [userVerified, setUserVerified] = useState<boolean>(() => sessionStorage.getItem('votechain_verified') === 'true')

  // Persist to sessionStorage whenever they change
  useEffect(() => {
    if (userId) sessionStorage.setItem('votechain_user_id', userId)
    else sessionStorage.removeItem('votechain_user_id')
  }, [userId])

  useEffect(() => {
    if (cedula) sessionStorage.setItem('votechain_cedula', cedula)
    else sessionStorage.removeItem('votechain_cedula')
  }, [cedula])

  useEffect(() => {
    sessionStorage.setItem('votechain_verified', String(userVerified))
  }, [userVerified])

  const resetSession = () => {
    setVerificationStatus('idle')
    setErrorMessage(null)
    setUserVerified(false)
    setCachedUrl(null)
    setUserId(null)
    setCedula(null)
    sessionStorage.removeItem('votechain_user_id')
    sessionStorage.removeItem('votechain_cedula')
    sessionStorage.removeItem('votechain_verified')
    sessionStorage.removeItem('votechain_selections')
  }

  return (
    <VerificationContext.Provider value={{
      verificationStatus,
      errorMessage,
      setVerificationStatus,
      setErrorMessage,
      userVerified,
      setUserVerified,
      cachedUrl,
      setCachedUrl,
      userId,
      setUserId,
      cedula,
      setCedula,
      resetSession
    }}>
      {children}
    </VerificationContext.Provider>
  )
}

export const useVerificationContext = (): VerificationContextState => {
  const context = useContext(VerificationContext)
  if (!context) {
    throw new Error('useVerificationContext must be used within a VerificationProvider')
  }
  return context
}
