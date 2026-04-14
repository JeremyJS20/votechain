import React from 'react'

interface GlassBadgeProps {
  icon: string
  label: string
  sublabel?: string
  color?: 'primary' | 'success' | 'warning' | 'tertiary'
  isSecurityStatus?: boolean
}

const GlassBadge: React.FC<GlassBadgeProps> = ({ 
  icon, 
  label, 
  sublabel,
  isSecurityStatus = false
}) => {
  return (
    <div className="glass-security p-6 rounded-[32px] flex flex-col justify-between h-full group hover:translate-y-[-4px] transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols text-primary text-3xl group-hover:scale-110 transition-transform">{icon}</span>
        </div>
        
        {isSecurityStatus && (
          <div className="flex items-center gap-2 px-3 py-1 bg-tertiary/5 rounded-full border border-tertiary/10">
            <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Live</span>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h4 className="label-md text-on-surface leading-tight">{label}</h4>
        {sublabel && (
          <p className="text-xs text-on-surface-variant font-medium mt-1 leading-tight">{sublabel}</p>
        )}
      </div>
    </div>
  )
}

export default GlassBadge
