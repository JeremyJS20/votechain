import React from 'react'
import { useTranslation } from 'react-i18next'

interface InstitutionalFooterProps {
  className?: string
}

const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({ className }) => {
  const { t } = useTranslation()

  return (
    <footer className={`bg-surface py-6 px-10 border-t border-on-surface/5 ${className}`}>
      <div className="flex justify-center items-center">
        <p className="font-label text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest text-center">
          {t('nav.digital_institution')}
        </p>
      </div>
    </footer>
  )
}

export default InstitutionalFooter
