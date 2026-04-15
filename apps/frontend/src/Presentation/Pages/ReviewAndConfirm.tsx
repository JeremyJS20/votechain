import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopAppBar from '../Components/Common/TopAppBar'
import InstitutionalButton from '../Components/Common/InstitutionalButton'
import InstitutionalFooter from '../Components/Common/InstitutionalFooter'
import { useBallot } from '../Contexts/BallotContext'
import { useVoting } from '../Contexts/VotingContext'
import type { Candidate } from '@votechain/common'

// ── Summary row ───────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{
  label: string
  value: string
  onEdit: () => void
  disabled: boolean
  editLabel: string
}> = ({ label, value, onEdit, disabled, editLabel }) => (
  <div className="flex items-center justify-between py-4 border-b border-on-surface/5 last:border-0">
    <div>
      <p className="font-sans text-xs font-bold text-primary uppercase tracking-[0.15em]">{label}</p>
      <p className="font-display font-bold text-on-surface text-lg mt-0.5">{value}</p>
    </div>
    <button
      onClick={onEdit}
      disabled={disabled}
      className="text-primary font-bold text-xs uppercase tracking-[0.2em] px-3 py-1.5 hover:bg-primary/5 rounded-lg active:scale-95 transition-all disabled:opacity-30"
    >
      {editLabel}
    </button>
  </div>
)

const findName = (candidates: Candidate[], id?: string): string => {
  if (!id) return '—'
  return candidates.find(c => c.id === id)?.name ?? '—'
}

// ── ReviewAndConfirm ──────────────────────────────────────────────────────────

const ReviewAndConfirm: React.FC = () => {
  const navigate = useNavigate()
  const { electionId } = useParams<{ electionId: string }>()
  const { t } = useTranslation()

  const {
    activeElectionType,
    candidates,
    selections,
    isSelectionComplete,
  } = useBallot()

  const {
    signAndSubmitVote,
    voteStatus,
    voteReceipt,
    voteError,
    cryptoStatus,
    cryptoError,
    resetVoteError,
  } = useVoting()

  const [confirming, setConfirming] = useState(false)

  React.useEffect(() => {
    if (voteStatus === 'success' && voteReceipt) {
      navigate('/vote/success', { state: { receipt: voteReceipt } })
    }
  }, [voteStatus, voteReceipt, navigate])

  const handleConfirm = async () => {
    setConfirming(true)
    await signAndSubmitVote()
    setConfirming(false)
  }

  const handleDismissError = () => {
    resetVoteError()
    setConfirming(false)
  }

  const isSubmitting  = voteStatus === 'signing' || voteStatus === 'submitting' || confirming
  const isCryptoReady = cryptoStatus === 'ready'
  const canSubmit     = isSelectionComplete() && isCryptoReady && !isSubmitting && !cryptoError

  const getSubmitLabel = () => {
    if (cryptoStatus === 'generating')  return t('review.status.generating_keys')
    if (cryptoStatus === 'registering') return t('review.status.registering_keys')
    if (cryptoStatus === 'error')       return t('review.status.crypto_error')
    if (voteStatus === 'signing')       return t('review.status.signing')
    if (voteStatus === 'submitting')    return t('review.status.submitting')
    return t('ballot.actions.confirm_vote')
  }

  const backPath  = `/vote/ballot/${electionId}`
  const editLabel = t('ballot.actions.edit')

  const renderSummary = () => {
    if (!activeElectionType) return null

    if (activeElectionType === 'PRESIDENTIAL') {
      return (
        <SummaryRow
          label={t('review.labels.president')}
          value={findName(candidates, selections.candidateId)}
          onEdit={() => navigate(backPath)}
          disabled={isSubmitting}
          editLabel={editLabel}
        />
      )
    }

    if (activeElectionType === 'CONGRESSIONAL') {
      return (
        <>
          <SummaryRow
            label={t('review.labels.senador')}
            value={findName(candidates, selections.senadorId)}
            onEdit={() => navigate(backPath)}
            disabled={isSubmitting}
            editLabel={editLabel}
          />
          <SummaryRow
            label={t('review.labels.diputado')}
            value={findName(candidates, selections.diputadoId)}
            onEdit={() => navigate(backPath)}
            disabled={isSubmitting}
            editLabel={editLabel}
          />
        </>
      )
    }

    if (activeElectionType === 'MUNICIPAL') {
      const regidorNames = (selections.regidores ?? [])
        .map(id => findName(candidates, id))
        .join(', ')

      return (
        <>
          <SummaryRow
            label={t('review.labels.alcalde')}
            value={findName(candidates, selections.alcalde)}
            onEdit={() => navigate(backPath)}
            disabled={isSubmitting}
            editLabel={editLabel}
          />
          <div className="py-4 border-b border-on-surface/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-xs font-bold text-primary uppercase tracking-[0.15em]">
                  {t('review.labels.regidores')}
                  {' '}
                  <span className="text-secondary normal-case tracking-normal font-medium">
                    ({selections.regidores?.length ?? 0})
                  </span>
                </p>
                <p className="font-display font-bold text-on-surface text-base mt-1 leading-snug">
                  {regidorNames || '—'}
                </p>
              </div>
              <button
                onClick={() => navigate(backPath)}
                disabled={isSubmitting}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] px-3 py-1.5 hover:bg-primary/5 rounded-lg active:scale-95 transition-all disabled:opacity-30 shrink-0"
              >
                {editLabel}
              </button>
            </div>
          </div>
        </>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body selection:bg-primary-fixed">
      <TopAppBar showBallotNav={false} />

      <div className="flex-1 pt-24 pb-48 flex justify-center">
        <main className="flex-1 max-w-3xl px-8 md:px-16 py-12">

          {/* Header */}
          <header className="mb-10">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-4xl text-on-surface tracking-tight mb-4"
            >
              {t('review.title')}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl"
            >
              <span className="material-symbols text-primary text-2xl">info</span>
              <p className="text-on-surface text-sm leading-relaxed">
                {t('review.immutable_warning')}{' '}
                <strong>{t('review.immutable_bold')}</strong>
              </p>
            </motion.div>
          </header>

          {/* Crypto status banners */}
          <AnimatePresence>
            {(cryptoStatus === 'generating' || cryptoStatus === 'registering') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-5 bg-[#e8f0fe] rounded-xl flex items-center gap-4 border border-primary/10"
              >
                <span className="material-symbols text-primary text-2xl animate-spin" style={{ animationDuration: '2s' }}>autorenew</span>
                <div>
                  <p className="font-display font-bold text-primary text-sm uppercase tracking-wide">
                    {cryptoStatus === 'generating' ? t('review.crypto_generating') : t('review.crypto_registering')}
                  </p>
                  <p className="text-primary/70 text-xs mt-0.5">{t('review.crypto_wait')}</p>
                </div>
              </motion.div>
            )}

            {cryptoStatus === 'ready' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-5 bg-[#e6f4ea] rounded-xl flex items-center gap-4 border border-green-700/10"
              >
                <span className="material-symbols text-green-700 text-2xl">verified_user</span>
                <div>
                  <p className="font-display font-bold text-green-800 text-sm uppercase tracking-wide">
                    {t('review.crypto_ready_title')}
                  </p>
                  <p className="text-green-700/70 text-xs mt-0.5">{t('review.crypto_ready_sub')}</p>
                </div>
              </motion.div>
            )}

            {(cryptoError || voteError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-5 bg-error-container rounded-xl flex items-start gap-4 border border-on-error-container/10"
              >
                <span className="material-symbols text-on-error-container text-2xl mt-0.5">error</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-on-error-container text-sm uppercase tracking-wide">
                    {cryptoError ? t('review.error_crypto') : t('review.error_vote')}
                  </p>
                  <p className="text-on-error-container/80 text-sm mt-1">
                    {t((cryptoError || voteError) ?? 'errors.common.unexpected')}
                  </p>
                </div>
                {voteError && (
                  <button onClick={handleDismissError} className="text-on-error-container/60 hover:text-on-error-container">
                    <span className="material-symbols text-xl">close</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-low rounded-xl p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols text-primary text-2xl">ballot</span>
              <div>
                <p className="font-sans text-xs font-bold text-primary uppercase tracking-[0.15em]">
                  {activeElectionType
                    ? t(`election.types.${activeElectionType}`, { defaultValue: activeElectionType })
                    : t('review.election_label')}
                </p>
                <p className="text-on-surface/40 text-xs font-mono">ID: {electionId?.substring(0, 20)}…</p>
              </div>
              {isCryptoReady && (
                <div className="ml-auto flex gap-3">
                  <span className="glass-badge px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-primary border border-primary/5 shadow-sm">
                    {t('review.signed_badge')}
                  </span>
                  <span className="glass-badge px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-on-surface/60 border border-on-surface/5 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {t('review.blockchain_badge')}
                  </span>
                </div>
              )}
            </div>

            {renderSummary()}
          </motion.div>

        </main>
      </div>

      {/* Fixed footer bar */}
      <div className="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-surface via-surface/90 to-transparent z-40 pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-between items-center pointer-events-auto">
          <InstitutionalButton
            variant="bordered"
            onClick={() => navigate(backPath)}
            isDisabled={isSubmitting}
            className="!min-h-[56px] !px-8 shadow-sm bg-white/50 backdrop-blur-sm"
          >
            {t('ballot.actions.go_back')}
          </InstitutionalButton>

          <InstitutionalButton
            isDisabled={!canSubmit}
            onClick={handleConfirm}
            icon={isSubmitting ? undefined : 'task_alt'}
            className="!min-h-[64px] !px-16 shadow-2xl"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="material-symbols text-xl animate-spin" style={{ animationDuration: '1.2s' }}>autorenew</span>
                {getSubmitLabel()}
              </span>
            ) : getSubmitLabel()}
          </InstitutionalButton>
        </div>
      </div>

      <InstitutionalFooter className="mt-auto" />
    </div>
  )
}

export default ReviewAndConfirm
