import React, { ReactNode } from 'react'
import { Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalHeader, ModalBody, ModalFooter, ModalHeading, ModalIcon } from '@heroui/react'
import { motion } from 'framer-motion'
import InstitutionalButton from '@/Presentation/Components/Common/InstitutionalButton'

interface InstitutionalModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  icon?: string
  title: string
  subtitle?: string
  statusPulse?: 'success' | 'primary' | 'warning' | 'error' | null
  children: ReactNode
  actionText?: string
  actionIcon?: string
  onAction?: () => void
  secondaryActionText?: string
  secondaryActionIcon?: string
  onSecondaryAction?: () => void
  maxWidthClassName?: string
}

const badgeStyles = {
  success: 'bg-success/10 border-success/20 text-success',
  primary: 'bg-primary/10 border-primary/20 text-primary',
  warning: 'bg-warning/10 border-warning/20 text-warning',
  error: 'bg-error/10 border-error/20 text-error'
}

const dotStyles = {
  success: 'bg-success',
  primary: 'bg-primary',
  warning: 'bg-warning',
  error: 'bg-error'
}

const glowStyles = {
  success: 'bg-success/10',
  primary: 'bg-primary/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
  none: 'bg-primary/10'
}

const InstitutionalModal: React.FC<InstitutionalModalProps> = ({
  isOpen,
  onOpenChange,
  icon = 'info',
  title,
  subtitle,
  statusPulse = null,
  children,
  actionText,
  actionIcon,
  onAction,
  secondaryActionText,
  secondaryActionIcon,
  onSecondaryAction,
  maxWidthClassName = 'max-w-md'
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop className="bg-[#141b2c]/40 backdrop-blur-xl flex items-center justify-center p-4">
        <ModalContainer className="w-full flex justify-center">
          <ModalDialog className={`bg-surface-container-low backdrop-blur-2xl border border-on-surface/5 shadow-[0_20px_40px_rgba(20,27,44,0.08)] rounded-[2rem] p-6 w-full ${maxWidthClassName} overflow-hidden relative outline-none`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 ${glowStyles[statusPulse || 'none']} blur-[60px] rounded-full pointer-events-none`} />

            <ModalHeader className="flex flex-col gap-3 items-center pt-6 pb-6 border-b border-on-surface/5 relative z-10 w-full bg-transparent">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 bg-gradient-to-br from-[#0c56d0] to-[#042866] rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(12,86,208,0.2)] border border-primary/20"
              >
                <ModalIcon className="text-white text-4xl leading-none">
                  <span className="material-symbols">{icon}</span>
                </ModalIcon>
              </motion.div>
              <div className="flex flex-col items-center">
                <ModalHeading className="font-headline font-extrabold text-3xl text-on-surface tracking-tight pb-2 text-center w-full">
                  {title}
                </ModalHeading>
                {subtitle && statusPulse && (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${badgeStyles[statusPulse]}`}>
                    <span className={`w-2 h-2 rounded-full ${dotStyles[statusPulse]} animate-pulse`} />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-center">{subtitle}</p>
                  </div>
                )}
              </div>
            </ModalHeader>
            
            <ModalBody className="py-6 relative z-10 w-full px-2 bg-transparent text-on-surface">
              {children}
            </ModalBody>
            
            {(actionText || secondaryActionText) && (
              <ModalFooter className="pt-2 pb-6 border-t border-transparent relative z-10 w-full px-2 mt-auto bg-transparent">
                <div className="flex flex-col w-full gap-3">
                  {actionText && onAction && (
                    <InstitutionalButton 
                      onClick={onAction} 
                      className="w-full !min-h-[56px]"
                    >
                      <span className="flex items-center gap-2 justify-center w-full">
                        <span>{actionText}</span>
                        {actionIcon && <span className="material-symbols text-xl">{actionIcon}</span>}
                      </span>
                    </InstitutionalButton>
                  )}
                  {secondaryActionText && (
                    <InstitutionalButton 
                      variant="flat" 
                      onClick={onSecondaryAction || (() => onOpenChange(false))}
                      className="w-full !min-h-[56px]"
                    >
                      <span className="flex items-center gap-2 justify-center w-full">
                        {secondaryActionIcon && <span className="material-symbols text-xl">{secondaryActionIcon}</span>}
                        <span>{secondaryActionText}</span>
                      </span>
                    </InstitutionalButton>
                  )}
                </div>
              </ModalFooter>
            )}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  )
}

export default InstitutionalModal
