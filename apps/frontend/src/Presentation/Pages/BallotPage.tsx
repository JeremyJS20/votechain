import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import TopAppBar from '@/Presentation/Components/Common/TopAppBar'
import InstitutionalButton from '@/Presentation/Components/Common/InstitutionalButton'
import InstitutionalFooter from '@/Presentation/Components/Common/InstitutionalFooter'
import { useBallot } from '@/Presentation/Contexts/BallotContext'
import type { Candidate } from '@votechain/common'

// ── Presidential ──────────────────────────────────────────────────────────────

interface PresidentialSectionProps {
  t: (key: string) => string
  candidates: Candidate[]
  selectedId: string | undefined
  onSelect: (id: string) => void
}

const PresidentialSection: React.FC<PresidentialSectionProps> = ({ t, candidates, selectedId, onSelect }) => (
  <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
    {candidates.map(c => (
      <motion.button
        key={c.id}
        onClick={() => onSelect(c.id)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`text-left p-6 rounded-xl border transition-all duration-200 ${
          selectedId === c.id
            ? 'bg-primary/5 border-primary/30 shadow-institutional'
            : 'bg-surface-container-low border-on-surface/5 hover:border-primary/15'
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-surface-container-highest overflow-hidden mb-4 border-2 border-white shadow-sm" />
        <p className="font-display font-bold text-on-surface text-base leading-tight mb-1">{c.name}</p>
        <p className="text-secondary text-xs font-medium">{c.party}</p>
        {selectedId === c.id && (
          <div className="mt-3 flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-wider">
            <span className="material-symbols text-sm">check_circle</span>
            {t('ballot.actions.selected')}
          </div>
        )}
      </motion.button>
    ))}
  </section>
)

// ── Congressional ─────────────────────────────────────────────────────────────

interface CongressionalSectionProps {
  t: (key: string) => string
  candidates: Candidate[]
  senadorId: string | undefined
  diputadoId: string | undefined
  onSelectSenador: (id: string) => void
  onSelectDiputado: (id: string) => void
}

const CandidatePickerRow: React.FC<{
  candidates: Candidate[]
  selectedId: string | undefined
  onSelect: (id: string) => void
}> = ({ candidates, selectedId, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {candidates.map(c => (
      <motion.button
        key={c.id}
        onClick={() => onSelect(c.id)}
        whileTap={{ scale: 0.98 }}
        className={`text-left p-5 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
          selectedId === c.id
            ? 'bg-primary/5 border-primary/30 shadow-institutional'
            : 'bg-surface-container-low border-on-surface/5 hover:border-primary/15'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
          <span className="material-symbols text-xl text-on-surface/40">person</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-on-surface text-sm leading-tight">{c.name}</p>
          <p className="text-secondary text-xs truncate">{c.party}</p>
        </div>
        {selectedId === c.id && (
          <span className="material-symbols text-primary text-xl shrink-0">check_circle</span>
        )}
      </motion.button>
    ))}
  </div>
)

const CongressionalSection: React.FC<CongressionalSectionProps> = ({
  t, candidates, senadorId, diputadoId, onSelectSenador, onSelectDiputado
}) => {
  const senators = candidates.filter(c => c.position === 'senador')
  const deputies = candidates.filter(c => c.position === 'diputado')

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h3 className="font-sans font-black text-xs uppercase tracking-[0.2em] text-primary">
          {t('ballot.positions.senador')}
        </h3>
        <CandidatePickerRow candidates={senators} selectedId={senadorId} onSelect={onSelectSenador} />
      </div>
      <div className="space-y-3">
        <h3 className="font-sans font-black text-xs uppercase tracking-[0.2em] text-primary">
          {t('ballot.positions.diputado')}
        </h3>
        <CandidatePickerRow candidates={deputies} selectedId={diputadoId} onSelect={onSelectDiputado} />
      </div>
    </div>
  )
}

// ── Municipal ─────────────────────────────────────────────────────────────────

interface MunicipalSectionProps {
  t: (key: string, opts?: Record<string, unknown>) => string
  candidates: Candidate[]
  alcaldeId: string | undefined
  regidores: string[]
  onSelectAlcalde: (id: string) => void
  onToggleRegidor: (id: string) => void
}

const MunicipalSection: React.FC<MunicipalSectionProps> = ({
  t, candidates, alcaldeId, regidores, onSelectAlcalde, onToggleRegidor
}) => {
  const mayors      = candidates.filter(c => c.position === 'mayor')
  const regidorList = candidates.filter(c => c.position === 'regidor')

  return (
    <div className="space-y-10">
      {/* Alcalde — single select */}
      <div className="space-y-3">
        <h3 className="font-sans font-black text-xs uppercase tracking-[0.2em] text-primary">
          {t('ballot.positions.alcalde')}
        </h3>
        <CandidatePickerRow candidates={mayors} selectedId={alcaldeId} onSelect={onSelectAlcalde} />
      </div>

      {/* Regidores — multi-select */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h3 className="font-sans font-black text-xs uppercase tracking-[0.2em] text-primary">
            {t('ballot.positions.regidores')}
          </h3>
          <span className="text-xs text-secondary">{t('ballot.positions.regidores_hint')}</span>
          {regidores.length > 0 && (
            <span className="glass-badge px-2 py-0.5 rounded-full text-[10px] font-black text-primary border border-primary/10">
              {regidores.length}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {regidorList.map(c => {
            const selected = regidores.includes(c.id)
            return (
              <motion.button
                key={c.id}
                onClick={() => onToggleRegidor(c.id)}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                  selected
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-surface-container-low border-on-surface/5 hover:border-primary/15'
                }`}
              >
                <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                  selected ? 'bg-primary border-primary' : 'border-on-surface/20'
                }`}>
                  {selected && <span className="material-symbols text-on-primary text-[14px]">check</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-on-surface text-sm leading-tight">{c.name}</p>
                  <p className="text-secondary text-xs truncate">{c.party}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Ballot headings per type ──────────────────────────────────────────────────

const ELECTION_STEP_KEY: Record<string, string> = {
  PRESIDENTIAL:  'ballot.positions.president',
  CONGRESSIONAL: 'ballot.positions.congressional',
  MUNICIPAL:     'ballot.positions.municipal',
}

const ELECTION_TITLE_KEY: Record<string, { title: string; subtitle: string }> = {
  PRESIDENTIAL:  { title: 'ballot.title_president',          subtitle: 'ballot.subtitle_president' },
  CONGRESSIONAL: { title: 'election.types.CONGRESSIONAL',    subtitle: 'election.descriptions.CONGRESSIONAL' },
  MUNICIPAL:     { title: 'election.types.MUNICIPAL',        subtitle: 'election.descriptions.MUNICIPAL' },
}

// ── Main BallotPage ───────────────────────────────────────────────────────────

const BallotPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    activeElectionType,
    candidates,
    ballotLoadStatus,
    ballotError,
    hasVoted,
    selections,
    loadBallot,
    setSelection,
    toggleRegidor,
    isSelectionComplete,
  } = useBallot()

  useEffect(() => {
    if (electionId) loadBallot(electionId)
  }, [electionId, loadBallot])

  useEffect(() => {
    if (ballotLoadStatus === 'loaded' && hasVoted) {
      navigate('/vote/select', { replace: true })
    }
  }, [ballotLoadStatus, hasVoted, navigate])

  const stepKey  = activeElectionType ? ELECTION_STEP_KEY[activeElectionType] : null
  const titleKey = activeElectionType ? ELECTION_TITLE_KEY[activeElectionType] : null
  const canProceed = isSelectionComplete()

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body">
      <TopAppBar showBallotNav={false} />

      <main className="pt-28 pb-64 px-8 md:px-16 max-w-7xl mx-auto w-full flex-grow">

        {/* Header */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-baseline gap-4 mb-4"
          >
            {stepKey && (
              <span className="bg-primary text-on-primary px-3 py-1 rounded-sm text-[10px] font-sans font-black tracking-[0.2em] uppercase">
                {t(stepKey)}
              </span>
            )}
            <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface">
              {titleKey ? t(titleKey.title) : t('election.loading')}
            </h1>
          </motion.div>
          {titleKey && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-secondary text-lg leading-relaxed"
            >
              {t(titleKey.subtitle)}
            </motion.p>
          )}
        </header>

        {/* Loading */}
        <AnimatePresence>
          {ballotLoadStatus === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-4 p-8 bg-surface-container-low rounded-xl"
            >
              <span className="material-symbols text-primary text-3xl animate-spin" style={{ animationDuration: '2s' }}>autorenew</span>
              <p className="text-on-surface-variant">{t('ballot.loading')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {ballotLoadStatus === 'error' && ballotError && (
          <div className="p-6 bg-error-container rounded-xl flex items-start gap-4">
            <span className="material-symbols text-on-error-container text-2xl">error</span>
            <div>
              <p className="font-display font-bold text-on-error-container text-sm uppercase tracking-wide">
                {t('ballot.error_title')}
              </p>
              <p className="text-on-error-container/80 text-sm mt-1">
                {t(ballotError) || t('errors.common.unexpected')}
              </p>
            </div>
          </div>
        )}

        {/* Ballot content */}
        {ballotLoadStatus === 'loaded' && activeElectionType && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {activeElectionType === 'PRESIDENTIAL' && (
              <PresidentialSection
                t={t}
                candidates={candidates}
                selectedId={selections.candidateId}
                onSelect={id => setSelection({ candidateId: id })}
              />
            )}
            {activeElectionType === 'CONGRESSIONAL' && (
              <CongressionalSection
                t={t}
                candidates={candidates}
                senadorId={selections.senadorId}
                diputadoId={selections.diputadoId}
                onSelectSenador={id => setSelection({ senadorId: id })}
                onSelectDiputado={id => setSelection({ diputadoId: id })}
              />
            )}
            {activeElectionType === 'MUNICIPAL' && (
              <MunicipalSection
                t={t}
                candidates={candidates}
                alcaldeId={selections.alcalde}
                regidores={selections.regidores ?? []}
                onSelectAlcalde={id => setSelection({ alcalde: id })}
                onToggleRegidor={toggleRegidor}
              />
            )}
          </motion.div>
        )}
      </main>

      {/* Fixed action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-surface via-surface/90 to-transparent z-40 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <InstitutionalButton
            variant="bordered"
            onClick={() => navigate('/vote/select')}
            className="!min-h-[56px] !px-8 shadow-sm bg-white/50 backdrop-blur-sm"
          >
            {t('ballot.actions.back')}
          </InstitutionalButton>
          <InstitutionalButton
            isDisabled={!canProceed || ballotLoadStatus !== 'loaded'}
            onClick={() => navigate(`/vote/review/${electionId}`)}
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

export default BallotPage
