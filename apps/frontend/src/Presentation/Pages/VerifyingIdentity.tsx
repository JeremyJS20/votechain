import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import TopAppBar from '@/Presentation/Components/Common/TopAppBar'
import InstitutionalButton from '@/Presentation/Components/Common/InstitutionalButton'
import { useDiditVerification } from '@/Presentation/Hooks/useDiditVerification'
import { useVerificationContext } from '@/Presentation/Contexts/VerificationContext'

interface VerifyingIdentityProps {
  onSuccess?: () => void
}

const VerifyingIdentity: React.FC<VerifyingIdentityProps> = ({ onSuccess }) => {
  const { t } = useTranslation()
  const { startVerification } = useDiditVerification()
  const { verificationStatus, userVerified, errorMessage, cedula, resetSession } = useVerificationContext()
  const navigate = useNavigate()

  // Guard: If no cedula in session, redirect to entry
  useEffect(() => {
    if (!cedula && verificationStatus !== 'approved') {
      console.warn('[VerifyingIdentity] No identification found in session. Redirecting to home.')
      navigate('/')
    }
  }, [cedula, navigate, verificationStatus])

  useEffect(() => {
    if (userVerified && onSuccess) {
      const timer = setTimeout(() => onSuccess(), 500)
      return () => clearTimeout(timer)
    }
  }, [userVerified, onSuccess])

  /* Polling disabled: Frontend now trusts SDK signals directly per User Request */
  /*
  useEffect(() => {
    if (verificationStatus === 'verifying' && userId) {
      startPolling(userId)
    }
  }, [verificationStatus, userId, startPolling])
  */

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col overflow-hidden relative">
      <TopAppBar isTransactional onCancel={() => { resetSession(); navigate('/'); }} />

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] bg-secondary-container/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-lg text-center space-y-10 relative z-10">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-surface-container-lowest/70 backdrop-blur-[24px] rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                  <motion.span 
                    className="material-symbols text-6xl text-primary [font-variation-settings:'FILL'1] relative z-10"
                    animate={ verificationStatus === 'authenticating' || verificationStatus === 'initializing' ? 
                              { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } : {} }
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    fingerprint
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{t('biometric.title')}</h1>
              <p className="font-body text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                {t('biometric.subtitle')}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 text-left">
             <div className="flex justify-between items-center mb-4">
                <span className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant">{t('biometric.status')}</span>
                <span className={`font-label font-bold text-xs px-2 py-1 rounded-full uppercase ${
                  verificationStatus === 'approved' ? 'bg-primary-container text-on-primary-container' :
                  verificationStatus === 'error' || verificationStatus === 'declined' ? 'bg-error-container text-on-error-container' :
                  verificationStatus === 'authenticating' || verificationStatus === 'initializing' ? 'bg-tertiary-container text-on-tertiary-container animate-pulse' :
                  verificationStatus === 'active' ? 'bg-primary-container text-on-primary-container' :
                  'bg-surface-container-highest text-on-surface'
                }`}>
                  {verificationStatus === 'active' ? t('common.verified') : verificationStatus}
                </span>
             </div>
             <p className="text-sm text-on-surface-variant mb-6">
               {t('biometric.instruction')}
             </p>
             <AnimatePresence mode="wait">
               {userVerified ? (
                 <motion.div 
                   key="success"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full py-8 text-center text-primary font-headline font-bold flex flex-col items-center justify-center gap-4"
                 >
                   <span className="material-symbols text-6xl [font-variation-settings:'FILL'1]">check_circle</span>
                   <span className="text-2xl">{t('biometric.success_title')}</span>
                 </motion.div>
               ) : (
                 <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                   {verificationStatus === 'idle' || ((verificationStatus === 'error' || verificationStatus === 'declined') && !errorMessage) ? (
                     <InstitutionalButton 
                       variant="solid" 
                       className="w-full h-16 text-lg"
                       onClick={() => startVerification(cedula || undefined)}
                     >
                       {t('biometric.cta_start')}
                     </InstitutionalButton>
                   ) : (
                     <div className="w-full min-h-[700px] bg-white/50 backdrop-blur-sm rounded-2xl border border-outline-variant/30 overflow-hidden shadow-inner bg-surface-container-low transition-all duration-500 relative flex flex-col items-center justify-center">
                       {/* Force the SDK iframe to fill the container */}
                       <style>
                         {`#didit-verification-container iframe { width: 100% !important; height: 100% !important; min-height: 700px; border: none; }`}
                       </style>
                       
                       {/* SDK Container - Only visible if not in error/verifying/declined */}
                       <div 
                         id="didit-verification-container" 
                         className={`w-full h-full min-h-[700px] transition-opacity duration-300 ${verificationStatus === 'active' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                       ></div>
                       
                       {/* Syncing State - When scan is done but polling backend */}
                       {verificationStatus === 'verifying' && (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex flex-col items-center justify-center gap-6 p-10 text-center relative z-20"
                         >
                           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                           </div>
                           <div className="space-y-2">
                             <h3 className="text-xl font-headline font-bold text-on-surface">{t('biometric.syncing_title')}</h3>
                             <p className="text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                               {t('biometric.syncing_subtext')}
                             </p>
                           </div>
                         </motion.div>
                       )}

                       {/* Error/Declined State - Matches container size */}
                       {(verificationStatus === 'error' || verificationStatus === 'declined') && errorMessage && (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="flex flex-col items-center justify-center gap-6 p-10 text-center relative z-20"
                         >
                           <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-2">
                             <span className="material-symbols text-error text-5xl">
                               {verificationStatus === 'declined' ? 'person_off' : 'error'}
                             </span>
                           </div>
                           <div className="space-y-2">
                             <h3 className="text-xl font-headline font-bold text-error">
                               {verificationStatus === 'declined' ? t('biometric.declined_title') : t('biometric.error_title')}
                             </h3>
                             <p className="text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">{errorMessage}</p>
                           </div>
                           <InstitutionalButton 
                             variant="solid" 
                             className="min-w-[200px]"
                             onClick={() => startVerification(cedula || undefined)}
                           >
                             {verificationStatus === 'declined' ? t('biometric.retry_cta') : t('biometric.cta_retry')}
                           </InstitutionalButton>
                         </motion.div>
                       )}

                       {/* Subtle Non-Blocking Spinner - Only during init/auth */}
                       {(verificationStatus === 'initializing' || verificationStatus === 'authenticating') && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                           <motion.div 
                             className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
                             animate={{ rotate: 360 }}
                             transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                           />
                           <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-60">{t('biometric.loading_layer')}</p>
                         </div>
                       )}
                     </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="pt-4 max-w-lg mx-auto flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols text-xs text-outline">lock</span>
              <span className="font-label text-xs tracking-wide text-on-surface-variant">{t('biometric.handshake')}</span>
            </div>

            <div className="flex items-center justify-center gap-6 mt-2">
              <button 
                onClick={() => { resetSession(); navigate('/'); }}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                <span className="material-symbols text-lg">close</span>
                <span>{t('nav.cancel')}</span>
              </button>
              
              <div className="w-px h-3 bg-on-surface/10" />

              <button 
                onClick={() => {/* Help logic */}}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                <span className="material-symbols text-lg">help</span>
                <span>{t('nav.help')}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto bg-surface py-6 px-10 border-t border-on-surface/5">
        <div className="flex justify-center items-center">
          <p className="font-label text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest text-center">
            {t('nav.digital_institution')}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default VerifyingIdentity
