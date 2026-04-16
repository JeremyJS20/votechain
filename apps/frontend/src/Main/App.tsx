import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate, Outlet } from 'react-router-dom'
import WelcomeScreen from '../Presentation/Pages/WelcomeScreen'
import IdentityVerification from '../Presentation/Pages/IdentityVerification'
import VerifyingIdentity from '../Presentation/Pages/VerifyingIdentity'
import IdentitySuccess from '../Presentation/Pages/IdentitySuccess'
import ElectionSelector from '../Presentation/Pages/ElectionSelector'
import BallotPage from '../Presentation/Pages/BallotPage'
import ReviewAndConfirm from '../Presentation/Pages/ReviewAndConfirm'
import VoteSuccess from '../Presentation/Pages/VoteSuccess'

import { VerificationProvider, useVerificationContext } from '../Presentation/Contexts/VerificationContext'
import { BallotProvider } from '../Presentation/Contexts/BallotContext'
import { VotingProvider } from '../Presentation/Contexts/VotingContext'

// ── Route Guard ───────────────────────────────────────────────────────────────
const ProtectedRoute: React.FC = () => {
  const { userVerified } = useVerificationContext()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!userVerified) navigate('/verification/identity', { replace: true })
  }, [userVerified, navigate])

  if (!userVerified) return null
  return <Outlet />
}

// ── Voting Layout ─────────────────────────────────────────────────────────────
// Wraps ballot + review in a SINGLE VotingProvider instance so that the
// cryptographic key pair persists when navigating ballot → review and back.
const VotingLayout: React.FC = () => (
  <VotingProvider>
    <Outlet />
  </VotingProvider>
)

// ── Routes ────────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const navigate = useNavigate()
  const go = (to: string) => navigate(to, { viewTransition: true })

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={<WelcomeScreen onBegin={() => go('/verification/identity')} />}
      />
      <Route
        path="/verification/identity"
        element={
          <IdentityVerification
            onBack={() => go('/')}
            onSuccess={() => go('/verification/biometric')}
          />
        }
      />
      <Route
        path="/verification/biometric"
        element={<VerifyingIdentity onSuccess={() => go('/verification/success')} />}
      />

      {/* Protected — outer guard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/verification/success" element={<IdentitySuccess />} />

        {/* Election selector (no VotingProvider needed) */}
        <Route path="/vote"        element={<ElectionSelector />} />
        <Route path="/vote/select" element={<ElectionSelector />} />

        {/* Ballot + Review share a single VotingProvider so keys persist */}
        <Route element={<VotingLayout />}>
          <Route path="/vote/ballot/:electionId" element={<BallotPage />} />
          <Route path="/vote/review/:electionId" element={<ReviewAndConfirm />} />
        </Route>

        {/* Success (just shows receipt from navigation state) */}
        <Route path="/vote/success" element={<VoteSuccess />} />
      </Route>
    </Routes>
  )
}

// ── App Root ──────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <VerificationProvider>
    <BallotProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </BallotProvider>
  </VerificationProvider>
)

export default App
