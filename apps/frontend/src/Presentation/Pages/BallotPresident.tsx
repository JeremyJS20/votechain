import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '@/Presentation/Components/Common/TopAppBar'
import CandidateCard from '@/Presentation/Components/Ballot/CandidateCard'
import InstitutionalButton from '@/Presentation/Components/Common/InstitutionalButton'
import InstitutionalFooter from '@/Presentation/Components/Common/InstitutionalFooter'
import { useBallot } from '@/Presentation/Contexts/BallotContext'
import type { Candidate } from '@votechain/common'

const BallotPresident: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selections, setSelection, candidates } = useBallot()

  const handleNext = () => {
    navigate('/vote/review') 
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] dark:bg-[#020617] text-[#141b2c] dark:text-slate-100 flex flex-col font-body">
      <TopAppBar 
        showBallotNav={true}
        activeSection="president"
      />
      
      <main className="pt-32 pb-64 px-8 md:px-16 max-w-7xl mx-auto w-full flex-grow">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-baseline gap-4 mb-4"
          >
            <span className="bg-[#0052cc] text-white px-3 py-1 rounded-sm text-[10px] font-inter font-black tracking-[0.2em] uppercase">
              {t('ballot.step_label')}
            </span>
            <h1 className="font-manrope text-4xl font-bold tracking-tight text-[#141b2c] dark:text-white">
              {t('ballot.title_president')}
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed"
          >
            {t('ballot.subtitle_president')}
          </motion.p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {candidates.map((candidate: Candidate, index: number) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <CandidateCard 
                id={candidate.id}
                name={candidate.name}
                party={candidate.party}
                imageUrl={undefined}
                isAbstain={candidate.id.includes('abstencion')}
                isSelected={selections.candidateId === candidate.id}
                onSelect={(id) => setSelection({ candidateId: id })}
              />
            </motion.div>
          ))}
        </section>
      </main>

      {/* Institutional Action Bar - Integrated Style */}
      <div className="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-[#f9f9ff] via-[#f9f9ff]/90 to-transparent z-40 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end items-center pointer-events-auto">
          <InstitutionalButton 
            isDisabled={!selections.candidateId}
            onClick={handleNext}
            icon="arrow_forward"
            className="!min-h-[64px] !px-16 shadow-2xl"
          >
            {t('ballot.actions.continue')}
          </InstitutionalButton>
        </div>
      </div>

      <InstitutionalFooter className="mt-auto" />
    </div>
  )
}

export default BallotPresident
