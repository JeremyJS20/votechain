import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import WelcomeScreen from '../Presentation/Pages/WelcomeScreen'
import IdentityVerification from '../Presentation/Pages/IdentityVerification'
import VerifyingIdentity from '../Presentation/Pages/VerifyingIdentity'
import IdentitySuccess from '../Presentation/Pages/IdentitySuccess'

import { VerificationProvider, useVerificationContext } from '../Presentation/Contexts/VerificationContext'

// A wrapper to protect routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userVerified } = useVerificationContext()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!userVerified) {
      navigate('/verification/identity', { replace: true })
    }
  }, [userVerified, navigate])

  if (!userVerified) return null
  return <>{children}</>
}

const ViewTransitionRoutes = () => {
  const navigate = useNavigate()

  const navigateWithTransition = (to: string) => {
    navigate(to, { viewTransition: true })
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<WelcomeScreen onBegin={() => navigateWithTransition('/verification/identity')} />} 
      />
      <Route 
        path="/verification/identity" 
        element={<IdentityVerification onBack={() => navigateWithTransition('/')} onSuccess={() => navigateWithTransition('/verification/biometric')} />} 
      />
      <Route 
        path="/verification/biometric" 
        element={<VerifyingIdentity onSuccess={() => navigateWithTransition('/verification/success')} />} 
      />
      <Route 
        path="/verification/success" 
        element={<ProtectedRoute><IdentitySuccess /></ProtectedRoute>} 
      />
      
      {/* Protected Routes Example */}
      <Route 
        path="/vote" 
        element={<ProtectedRoute><div className="p-10 text-white font-bold text-2xl">Dashboard (Protected)</div></ProtectedRoute>} 
      />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <VerificationProvider>
      <BrowserRouter>
        <ViewTransitionRoutes />
      </BrowserRouter>
    </VerificationProvider>
  )
}

export default App
