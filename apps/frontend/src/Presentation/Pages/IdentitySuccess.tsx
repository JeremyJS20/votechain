import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '@/Presentation/Components/Common/TopAppBar'
import InstitutionalFooter from '@/Presentation/Components/Common/InstitutionalFooter'
import { useVerificationContext } from '@/Presentation/Contexts/VerificationContext'

const IdentitySuccess: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId } = useVerificationContext()
  
  // Format current date with institutional precision for the metadata grid
  const authDate = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col transition-colors duration-500">
      <TopAppBar isTransactional={false} />
      
      <main className="flex-grow flex flex-col items-center justify-center px-6 relative overflow-hidden pt-16">
        {/* Abstract Background Textures - Replicating design depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed opacity-10 rounded-full blur-3xl -mr-48 -mt-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-fixed opacity-20 rounded-full blur-3xl -ml-32 -mb-16 pointer-events-none"></div>

        <div className="max-w-xl w-full flex flex-col items-center text-center space-y-12 py-12 relative z-10">
          
          {/* Hero Success Indicator: Concentric Circular Depth */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-surface-container-low flex items-center justify-center relative shadow-sm">
              {/* Layered Circular Depth - Institutional Aesthetic */}
              <div className="absolute inset-2 rounded-full bg-surface-container-high opacity-40"></div>
              <div className="absolute inset-4 rounded-full bg-primary-fixed opacity-50"></div>
              
              {/* Main Checkmark Container - Success Gradient */}
              <div className="w-20 h-20 rounded-full success-gradient flex items-center justify-center shadow-[0_20px_40px_rgba(20,27,44,0.12)]">
                <span className="material-symbols text-white text-5xl !font-bold" style={{ fontVariationSettings: "'wght' 600" }}>check</span>
              </div>
            </div>

            {/* Floating Blockchain Badge - Live Status */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-4 -right-8 glass-badge px-3 py-1.5 rounded-full border border-outline-variant/20 flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant font-display">
                {t('identity.badges.live_encryption')}
              </span>
            </motion.div>
          </motion.div>

          {/* Typography Content */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-display text-5xl font-extrabold tracking-tight text-on-surface leading-tight"
            >
              {t('biometric.success_title')}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-body text-lg text-secondary max-w-md mx-auto leading-relaxed opacity-80"
            >
              {t('success.subtitle')}
            </motion.p>
          </div>

          {/* Verification Metadata Bento Grid */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Auth Protocol Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl text-left border border-outline-variant/10 shadow-sm hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols text-primary !text-xl">encrypted</span>
                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">
                   {t('success.auth_protocol')}
                </span>
              </div>
              <div className="font-display text-lg font-bold text-on-surface">
                {t('success.zk_proof_validated')}
              </div>
              <div className="font-mono text-[10px] text-secondary mt-1 tracking-wider">
                HASH: {userId?.substring(0, 8).toUpperCase() || '0x71C...4F92'}
              </div>
            </div>

            {/* Timestamp Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl text-left border border-outline-variant/10 shadow-sm hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols text-primary !text-xl">history</span>
                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">
                  {t('success.timestamp_label')}
                </span>
              </div>
              <div className="font-display text-lg font-bold text-on-surface">
                {authDate}
              </div>
              <div className="font-body text-[10px] text-secondary mt-1">
                {t('success.local_time')}
              </div>
            </div>
          </motion.div>

          {/* Action Area */}
          <div className="w-full flex flex-col items-center pt-8 space-y-6">
            <motion.button 
              whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/vote', { viewTransition: true })}
              className="w-full max-w-sm h-16 success-gradient text-white font-display text-lg font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all"
            >
              {t('success.cta_proceed')}
              <span className="material-symbols !font-bold">arrow_forward</span>
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2 text-secondary"
            >
              <span className="material-symbols text-sm">security</span>
              <span className="text-[0.65rem] uppercase tracking-[0.15em] font-bold">
                {t('success.security_active')}
              </span>
            </motion.div>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  )
}

export default IdentitySuccess
