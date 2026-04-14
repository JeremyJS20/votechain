import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import TopAppBar from '../Components/Common/TopAppBar'
import InstitutionalButton from '../Components/Common/InstitutionalButton'

interface WelcomeScreenProps {
  onBegin: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20 flex flex-col pt-20 overflow-x-hidden transition-colors duration-500">
      <TopAppBar />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-8 md:px-16 py-12 md:py-24 overflow-hidden">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left Content: Editorial Typography */}
          <section className="md:col-span-7 flex flex-col gap-8 md:pr-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-full w-fit border border-on-surface/5">
                  <span className="material-symbols text-tertiary text-sm fill-1">lock</span>
                  <span className="label-md !text-[10px] text-on-surface-variant uppercase tracking-widest">{t('welcome.encryption_badge')}</span>
                </div>
                
                {/* Monumental Hardened Title */}
                <h1 className="text-5xl lg:text-[4.5rem] font-extrabold tracking-[-0.02em] leading-[1.1] text-[#141b2c] font-display">
                  {t('welcome.title_main')} <br />
                  <span className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] bg-clip-text text-transparent">
                    {t('welcome.title_highlight')}
                  </span> {t('welcome.title_suffix')}
                </h1>
              </div>

              <p className="body-lg text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl mt-8 opacity-90">
                {t('welcome.subtext')}
              </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center mt-10">
            <InstitutionalButton icon="arrow_forward" onClick={onBegin}>
              {t('welcome.cta_main')}
            </InstitutionalButton>
          </div>

              {/* Trust Section with Ghost Borders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-12 border-t border-on-surface/10">
                <div className="flex flex-col gap-3">
                  <span className="material-symbols text-primary text-3xl">shield_lock</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{t('welcome.proof.e2e')}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 opacity-70">{t('welcome.proof.e2e_sub')}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="material-symbols text-primary text-3xl">fingerprint</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{t('welcome.proof.biometric')}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 opacity-70">{t('welcome.proof.biometric_sub')}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="material-symbols text-primary text-3xl">account_balance</span>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{t('welcome.proof.institutional')}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 opacity-70">{t('welcome.proof.institutional_sub')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Right Visual: The "Digital Monument" */}
          <section className="md:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              {/* Decorative Abstract Glows */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-tertiary/5 rounded-full blur-[100px]" />
              
              <div className="relative grid grid-cols-2 gap-4">
                {/* Main ID Panel */}
                <div className="col-span-2 aspect-[16/9] bg-surface-container-lowest rounded-xl shadow-institutional p-6 overflow-hidden flex flex-col justify-between ghost-border">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                      <span className="material-symbols text-primary">contact_page</span>
                    </div>
                    <div className="bg-surface-container-high/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{t('nav.node_realtime')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40 mb-2">
                      {t('welcome.bento.node_tag')}
                    </p>
                    <div className="h-1.5 w-1/2 bg-on-surface/5 rounded-full mb-1.5" />
                    <div className="h-1.5 w-3/4 bg-on-surface/5 rounded-full" />
                  </div>
                  <div className="relative h-24 mt-4 rounded-lg bg-surface-container-low/50 border border-on-surface/5 flex items-center justify-center group overflow-hidden">
                    <img 
                      className="absolute inset-0 w-full h-full object-cover opacity-10" 
                      src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop" 
                      alt="Security graphic" 
                    />
                    <span className="material-symbols text-primary/40 text-4xl">fingerprint</span>
                  </div>
                </div>

                {/* Bottom Bento Items */}
                <div className="aspect-square bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300 border border-on-surface/5">
                  <span className="material-symbols text-primary text-3xl group-hover:scale-110 transition-transform">link</span>
                  <p className="text-[10px] font-bold leading-tight uppercase tracking-wider text-on-surface-variant">{t('welcome.bento.blockchain_record')}</p>
                </div>
                <div className="aspect-square bg-primary text-white rounded-xl p-6 flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                  <span className="material-symbols text-white text-3xl fill-1 group-hover:scale-110 transition-transform">fact_check</span>
                  <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">{t('welcome.bento.audit_ready')}</p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer Restored to Balanced max-w-7xl */}
      <footer className="bg-surface-dim py-12 border-t border-on-surface/5 px-8 md:px-16">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <span className="font-black text-2xl text-on-surface tracking-tighter uppercase font-display leading-none">{t('nav.brand_name')}</span>
            <p className="text-xs text-on-surface-variant leading-relaxed opacity-60 max-w-sm mt-1">
              {t('nav.digital_institution')} | {t('footer.mission')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {['privacy_policy', 'security_protocol', 'accessibility', 'voter_rights', 'terms'].map((key) => (
              <a key={key} className="text-on-surface-variant text-sm hover:text-primary transition-colors opacity-70 hover:opacity-100" href="#">
                {t(`footer.links.${key}`)}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-on-surface/5 text-center">
            <p className="text-[10px] text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">
                {t('footer.copyright')}
            </p>
        </div>
      </footer>
    </div>
  )
}

export default WelcomeScreen
