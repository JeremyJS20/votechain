import React from 'react'
import { useTranslation } from 'react-i18next'
import { Accordion, AccordionItem, AccordionHeading, AccordionTrigger, AccordionPanel } from '@heroui/react'
import InstitutionalModal from './InstitutionalModal'

export type HelpContext = 'identity' | 'ballot' | 'success' | 'general'

interface HelpModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  context?: HelpContext
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onOpenChange, context = 'general' }) => {
  const { t } = useTranslation()

  // Define which sections are relevant for each context with specific versioned keys
  const getRelevantSections = () => {
    switch (context) {
      case 'identity':
        return ['identity', 'overview_identity', 'troubleshooting_identity']
      case 'ballot':
        return ['voting', 'security', 'troubleshooting_ballot']
      case 'success':
        return ['security', 'overview_ballot', 'troubleshooting_ballot']
      default:
        // Use identity version for general if not specified, it's safer for newcomers
        return ['overview_identity', 'security', 'troubleshooting_identity']
    }
  }

  // Determine which section to expand by default based on context
  const getDefaultExpandedKey = () => {
    switch (context) {
      case 'identity': return 'identity'
      case 'ballot': return 'voting'
      case 'success': return 'security'
      default: return 'overview_identity'
    }
  }

  const sections = getRelevantSections()

  return (
    <InstitutionalModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('help_modal.title')}
      subtitle={t('help_modal.subtitle')}
      icon="help"
      statusPulse="primary"
      actionText={t('help_modal.close_cta')}
      onAction={() => onOpenChange(false)}
      maxWidthClassName="max-w-3xl"
    >
      <div className="px-1 pb-4">
        <Accordion 
          variant="surface"
          defaultExpandedKeys={[getDefaultExpandedKey()]}
        >
          {sections.map((key) => (
            <AccordionItem key={key} id={key}>
              <AccordionHeading>
                <AccordionTrigger className="w-full text-left font-display font-bold text-on-surface text-lg px-4 py-6 hover:bg-surface-container-low rounded-xl flex items-center transition-colors">
                  <span className="material-symbols text-primary opacity-60 text-2xl mr-3">
                    {key.startsWith('overview') && 'info'}
                    {key === 'identity' && 'badge'}
                    {key === 'voting' && 'how_to_vote'}
                    {key === 'security' && 'shield_lock'}
                    {key.startsWith('troubleshooting') && 'build'}
                  </span>
                  {t(`help_modal.sections.${key}.title`)}
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel className="px-4 pb-8 pt-0 text-secondary leading-relaxed">
                <div 
                  className="prose prose-base max-w-none text-secondary !text-on-surface/80"
                  dangerouslySetInnerHTML={{ __html: t(`help_modal.sections.${key}.content`) }} 
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </InstitutionalModal>
  )
}

export default HelpModal
