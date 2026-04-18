import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
// useNavigate removed
import HttpClient from '@/Infrastructure/HttpClient'
import TopAppBar from '@/Presentation/Components/Common/TopAppBar'
import InstitutionalButton from '@/Presentation/Components/Common/InstitutionalButton'
import InstitutionalModal from '@/Presentation/Components/Common/InstitutionalModal'
import InstitutionalFooter from '@/Presentation/Components/Common/InstitutionalFooter'
import { useVerificationContext } from '@/Presentation/Contexts/VerificationContext'

interface IdentityVerificationProps {
  onBack: () => void
  onSuccess?: () => void
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({ onBack, onSuccess }) => {
  const { t } = useTranslation()
  const { setUserId, setCedula: setPersistentCedula, resetSession, cedula: initialCedula } = useVerificationContext()
  const [cedula, setLocalCedula] = useState(initialCedula || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [civicProfile, setCivicProfile] = useState<any>(null)

  // HeroUI v3 utilizes standard state for visibility
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync keyboard entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (cedula.length < 11) setCedula(prev => prev + e.key)
      } else if (e.key === 'Backspace') {
        setCedula(prev => prev.slice(0, -1))
      } else if (e.key === 'Enter' && cedula.length === 11) {
        handleContinue()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cedula, isLoading, isModalOpen])

  const setCedula = (val: string | ((prev: string) => string)) => {
    const newVal = typeof val === 'function' ? val(cedula) : val
    setLocalCedula(newVal)
    setPersistentCedula(newVal)
  }

  const handleKeypadPress = (val: string) => {
    if (isLoading || isModalOpen) return
    if (val === 'backspace') {
      setCedula(prev => prev.slice(0, -1))
    } else if (val === 'check_circle') {
      if (cedula.length === 11) handleContinue()
    } else {
      if (cedula.length < 11) setCedula(prev => prev + val)
    }
    setError('')
  }

  const handleContinue = async () => {
    if (cedula.length !== 11) return

    setIsLoading(true)
    setError('')

    try {
      const response = await HttpClient.post('/identity/verify', {
        cedula
      })

      if (response.data.success) {
        setCivicProfile(response.data.data)
        setUserId(response.data.data.userId)
        setPersistentCedula(cedula) // Save raw cedula for the biometric matching session
        setIsModalOpen(true) // Open validation modal
      }
    } catch (err: any) {
      setError(t(err.response?.data?.error) || t('errors.common.unexpected'));
    } finally {
      setIsLoading(false)
    }
  }

  // Exact Dominican Cédula Format: 000-0000000-0
  const formatCedula = (val: string) => {
    if (!val) return '000-0000000-0'
    let masked = val
    if (val.length > 3) masked = val.slice(0, 3) + '-' + val.slice(3)
    if (val.length > 10) masked = val.slice(0, 3) + '-' + val.slice(3, 10) + '-' + val.slice(10)
    return masked
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col antialiased">
      <TopAppBar isTransactional onCancel={() => { resetSession(); onBack(); }} />

      <main className="flex-grow pt-32 pb-12 px-6 flex flex-col items-center overflow-x-hidden">
        <div className="w-full max-w-lg mt-8">


          {/* Content Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-4 leading-tight">
              {t('identity.title')}
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-md mx-auto sm:mx-0 opacity-80">
              {t('identity.subtext')}
            </p>
          </div>

          {/* Input Section - Focused Central Layout */}
          <div className="flex flex-col w-full gap-8">
            <div className="relative">
              <label className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block opacity-90">
                {t('identity.input_label')}
              </label>
              <div className={`bg-surface-container-lowest h-20 flex items-center px-6 rounded-xl shadow-sm border-b-2 transition-all duration-300 ${error ? 'border-error' : 'border-primary'}`}>
                <span className={`material-symbols ${error ? 'text-error' : 'text-on-surface-variant opacity-40'} mr-4 text-3xl transition-opacity`}>fingerprint</span>
                <div className={`w-full bg-transparent border-none text-3xl font-headline font-bold tracking-[0.25em] transition-all whitespace-nowrap overflow-hidden ${cedula.length === 0 ? 'text-on-surface-variant opacity-30' : 'text-on-surface'}`}>
                  {formatCedula(cedula)}
                </div>
                {cedula.length === 11 && !isLoading && !error && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="material-symbols text-success text-3xl">check_circle</motion.span>
                )}
                {isLoading && (
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                )}
              </div>

              <div className="mt-4 h-6 flex items-center justify-between">
                {error ? (
                  <span className="text-error text-[10px] font-bold uppercase tracking-wider">{error}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-surface-container-low px-3 py-1.5 rounded-full flex items-center gap-2 border border-on-surface/5">
                      <span className="w-2 h-2 rounded-full bg-[#0c56d0] animate-pulse"></span>
                      <span className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('identity.badges.live_encryption')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Digital Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full mt-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', '0', 'check_circle'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleKeypadPress(btn)}
                  disabled={isLoading || isModalOpen}
                  className="h-16 bg-surface-container-low hover:bg-surface-container-high active:scale-[0.95] disabled:opacity-50 transition-all rounded-xl font-headline font-bold text-2xl text-on-surface flex items-center justify-center border border-on-surface/5"
                >
                  {btn === 'backspace' || btn === 'check_circle' ? (
                    <span className={`material-symbols text-2xl ${btn === 'check_circle' && cedula.length === 11 ? 'text-success' : 'text-on-surface-variant'}`}>{btn}</span>
                  ) : (
                    <span className="opacity-90">{btn}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-4 w-full flex flex-col gap-4">
              <InstitutionalButton
                onClick={handleContinue}
                isDisabled={cedula.length !== 11 || isLoading || isModalOpen}
                className="w-full text-lg h-16 py-0 shadow-[0_20px_40px_rgba(20,27,44,0.06)]"
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('identity.cta_verify')}</span>
                      <span className="material-symbols text-xl">arrow_forward</span>
                    </>
                  )}
                </div>
              </InstitutionalButton>

              <div className="flex items-center justify-center gap-6 mt-2">
                <button
                  onClick={() => { resetSession(); onBack(); }}
                  disabled={isLoading || isModalOpen}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  <span className="material-symbols text-lg">close</span>
                  <span>{t('nav.cancel')}</span>
                </button>

                <div className="w-px h-3 bg-on-surface/10" />

                <button
                  onClick={() => {/* Help logic */ }}
                  disabled={isLoading || isModalOpen}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  <span className="material-symbols text-lg">help</span>
                  <span>{t('nav.help')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <InstitutionalModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        icon="how_to_reg"
        title={t('identity.modal.title')}
        subtitle={t('identity.modal.subtitle')}
        statusPulse="success"
        secondaryActionText={t('ballot.actions.go_back')}
        onSecondaryAction={() => setIsModalOpen(false)}
        actionText={t('identity.modal.proceed_cta')}
        actionIcon="fingerprint"
        onAction={() => {
          setIsModalOpen(false)
          if (onSuccess) onSuccess()
        }}
      >
        {civicProfile && (
          <div className="flex flex-col gap-4">
            {/* Profile Header Card */}
            <div className="flex items-center gap-4 bg-surface-container p-5 rounded-2xl border border-on-surface/5 shadow-sm">
              <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center border border-on-surface/10 flex-shrink-0">
                <span className="material-symbols text-on-surface-variant text-3xl opacity-70">person</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] opacity-90 mb-1">{t('identity.modal.citizen_name')}</label>
                <p className="font-headline font-bold text-lg text-on-surface leading-tight truncate">{civicProfile.name}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container p-4 rounded-2xl border border-on-surface/5 flex flex-col justify-center">
                <label className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] opacity-90 mb-1.5">{t('identity.modal.document')}</label>
                <p className="font-body text-sm font-bold text-on-surface">{civicProfile.document_type || t('identity.modal.default_document')}</p>
              </div>
              <div className="bg-surface-container p-4 rounded-2xl border border-on-surface/5 flex flex-col justify-center">
                <label className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] opacity-90 mb-1.5">{t('identity.modal.registry_node')}</label>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols text-[14px] text-primary opacity-80">link</span>
                  <p className="font-body text-sm font-bold text-on-surface truncate">{civicProfile.verification_node || t('identity.modal.default_node')}</p>
                </div>
              </div>
            </div>

            {/* Secure Timestamp */}
            <div className="flex items-center justify-center gap-2 mt-4 opacity-70">
              <span className="material-symbols text-[12px] text-on-surface-variant">lock_clock</span>
              <p className="text-[9px] font-mono text-on-surface-variant tracking-widest uppercase">{t('identity.modal.secure_session')} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        )}
      </InstitutionalModal>

      <InstitutionalFooter />
    </div>
  )
}

export default IdentityVerification
