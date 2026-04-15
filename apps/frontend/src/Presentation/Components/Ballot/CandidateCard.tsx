import React from 'react'
import { motion } from 'framer-motion'
// useTranslation removed

interface CandidateCardProps {
  id: string
  name: string
  party: string
  imageUrl?: string
  imageAlt?: string
  isSelected?: boolean
  isAbstain?: boolean
  onSelect: (id: string) => void
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  id,
  name,
  party,
  imageUrl,
  imageAlt,
  isSelected,
  isAbstain,
  onSelect
}) => {
  // Context usage simplified
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(id)}
      className={`
        group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-[#dae2ff] dark:bg-blue-900/40 border-2 border-[#003d9b] shadow-xl shadow-[#003d9b]/10' 
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg'
        }
      `}
    >
      {/* Selection Indicator Overlay */}
      <div className={`absolute top-4 right-4 z-10 p-1 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-sm transition-transform duration-300 ${isSelected ? 'scale-110' : 'scale-100'}`}>
        <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-primary' : 'text-on-surface/40'}`} style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </div>

      <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
        {isAbstain ? (
          <div className="flex flex-col items-center gap-4 text-on-surface/60 dark:text-slate-400">
            <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'wght' 300" }}>
              block
            </span>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={imageAlt || name} 
            className={`w-full h-full object-cover transition-all duration-400 group-hover:scale-105 ${isSelected ? 'grayscale-0' : 'grayscale-[0.6] group-hover:grayscale-0'}`}
          />
        )}
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-1">
          <h3 className={`font-manrope text-xl font-bold transition-colors ${isSelected ? 'text-primary dark:text-blue-300' : 'text-on-surface'}`}>
            {name}
          </h3>
          <p className={`text-sm font-inter font-bold tracking-widest uppercase transition-colors ${isSelected ? 'text-primary/80' : 'text-on-surface-variant'}`}>
            {party}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateCard
