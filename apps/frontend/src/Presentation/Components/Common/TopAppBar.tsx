import React from 'react'
import { useTranslation } from 'react-i18next'

interface TopAppBarProps {
  isTransactional?: boolean
  onCancel?: () => void
}

const TopAppBar: React.FC<TopAppBarProps> = ({ isTransactional, onCancel }) => {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-surface/80 backdrop-blur-2xl z-50 flex items-center justify-center shadow-[0_20px_40px_rgba(20,27,44,0.06)] px-8 md:px-16">
      <nav className="flex items-center justify-between w-full max-w-7xl h-full relative">
        {/* Brand */}
        <div className="flex flex-col">
          <div className="text-2xl font-black tracking-tighter uppercase text-on-surface font-display leading-none">
            {t('nav.brand_name')}
          </div>
          <div className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] opacity-80 mt-1">
            {t('nav.node_realtime')}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors border border-on-surface/5 group"
          >
            <span className="material-symbols text-sm text-primary opacity-60 group-hover:opacity-100 transition-opacity">language</span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface">
              {i18n.language === 'en' ? 'ES' : 'EN'}
            </span>
          </button>

          {isTransactional && (
            <div className="flex items-center gap-3">
              <button className="h-10 px-3 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface/60 hover:text-primary transition-colors gap-2">
                <span className="material-symbols text-xl">help</span>
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{t('nav.help')}</span>
              </button>
              <button 
                onClick={onCancel}
                className="h-10 px-4 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-error/10 text-on-surface/60 hover:text-error transition-all gap-2 border border-transparent hover:border-error/20"
              >
                <span className="material-symbols text-xl text-error">close</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">
                  {t('nav.cancel')}
                </span>
              </button>
            </div>
          )}
        </div>
        
        {/* Subtle bottom border line from asset */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-on-surface/5" />
      </nav>
    </header>
  )
}

export default TopAppBar
