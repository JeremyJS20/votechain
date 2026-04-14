import React from 'react'
import { Button, ButtonProps } from '@heroui/react'

interface InstitutionalButtonProps extends Omit<ButtonProps, 'children' | 'variant'> {
  variant?: 'solid' | 'flat' | 'bordered'
  icon?: string
  children?: React.ReactNode
}

const InstitutionalButton: React.FC<InstitutionalButtonProps> = ({ 
  children, 
  variant = 'solid', 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "min-h-[64px] px-10 rounded-xl headline-md !text-lg interactive-touch flex items-center justify-center gap-3 transition-all duration-200"
  
  const variants = {
    solid: "bg-gradient-to-br from-[#003d9b] to-[#0052cc] text-white shadow-[0_20px_40px_rgba(0,61,155,0.15)]",
    flat: "bg-surface-container-highest text-primary hover:bg-primary/10",
    bordered: "border-2 border-primary/20 text-primary hover:bg-primary/5"
  }

  return (
    <Button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="flex items-center gap-3">
        {children}
        {icon && <span className="material-symbols text-2xl">{icon}</span>}
      </span>
    </Button>
  )
}

export default InstitutionalButton
