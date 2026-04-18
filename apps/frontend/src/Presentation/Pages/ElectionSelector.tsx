import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVerificationContext } from '@/Presentation/Contexts/VerificationContext'
import { VotingService, type ElectionStatusItem } from '@/Infrastructure/Services/VotingService'
import TopAppBar from '@/Presentation/Components/Common/TopAppBar'
import InstitutionalFooter from '@/Presentation/Components/Common/InstitutionalFooter'

const ELECTION_ICONS: Record<string, string> = {
  PRESIDENTIAL:  'account_balance',
  CONGRESSIONAL: 'gavel',
  MUNICIPAL:     'location_city',
}

const ElectionSelector: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userId, resetSession } = useVerificationContext()

  const [elections, setElections]       = useState<ElectionStatusItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [showConfirm, setShowConfirm]   = useState(false)

  const allVoted = elections.length > 0 && elections.every(e => e.hasVoted)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    VotingService.fetchElectionStatus(userId)
      .then(status => {
        setElections(status)
        const pending = status.filter(e => !e.hasVoted)
        if (pending.length === 1) {
          navigate(`/vote/ballot/${pending[0].id}`, { replace: true })
        }
      })
      .catch(err => {
        setError(err?.response?.data?.error || 'errors.common.unexpected')
      })
      .finally(() => setLoading(false))
  }, [userId, navigate, t])

  // ── Full session nuke ───────────────────────────────────────────────────────
  const handleFinishSession = () => {
    // Clear all sessionStorage
    sessionStorage.removeItem('votechain_ballot')
    sessionStorage.removeItem('votechain_user_id')
    sessionStorage.removeItem('votechain_user_name')
    sessionStorage.removeItem('votechain_verified')
    sessionStorage.removeItem('votechain_cedula')

    // Reset in-memory verification context (auth, user state, cached data)
    resetSession()

    // Navigate to home — user is now fully de-authed
    navigate('/', { replace: true })
  }

  const handleSelect = (electionId: string) => {
    navigate(`/vote/ballot/${electionId}`)
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body">
      <TopAppBar showBallotNav={false} />

      <main className="flex-1 pt-28 pb-48 px-8 md:px-16 max-w-4xl mx-auto w-full">

        {/* ── ALL ELECTIONS COMPLETED STATE ─────────────────────────────────── */}
        {!loading && !error && allVoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center pt-8"
          >
            {/* Success visual */}
            <div className="relative mb-10">
              <div className="absolute inset-0 scale-[2] rounded-full bg-primary-fixed opacity-15 blur-3xl" />
              <div className="relative w-40 h-40 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-institutional">
                <span
                  className="material-symbols text-[100px] text-surface-tint"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  task_alt
                </span>
              </div>
            </div>

            <h1 className="font-display font-bold text-4xl tracking-tight text-on-surface mb-4">
              {t('post_vote.all_complete_title')}
            </h1>
            <p className="text-secondary text-lg leading-relaxed max-w-lg mb-12">
              {t('post_vote.all_complete_subtitle')}
            </p>

            {/* Voted elections summary */}
            <div className="w-full max-w-md space-y-3 mb-12">
              {elections.map(election => (
                <div
                  key={election.id}
                  className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-on-surface/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed/50 flex items-center justify-center">
                    <span className="material-symbols text-primary text-xl">
                      {ELECTION_ICONS[election.type] ?? 'how_to_vote'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-display font-bold text-on-surface text-sm">
                      {t(`election.types.${election.type}`, { defaultValue: election.type })}
                    </p>
                    <p className="text-secondary text-xs">{election.year}</p>
                  </div>
                  <span className="material-symbols text-surface-tint text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-gradient-primary text-on-primary font-display font-bold text-lg py-5 px-16 rounded-xl transition-all active:scale-[0.98] shadow-institutional hover:opacity-90 interactive-touch"
            >
              {t('post_vote.cta_finish')}
            </button>
          </motion.div>
        )}

        {/* ── CONFIRMATION MODAL ───────────────────────────────────────────── */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-scrim/60 backdrop-blur-sm"
                onClick={() => setShowConfirm(false)}
              />

              {/* Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 z-10"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols text-primary text-3xl">shield_lock</span>
                </div>

                <h2 className="font-display font-bold text-2xl text-on-surface text-center mb-3">
                  {t('post_vote.confirm_title')}
                </h2>
                <p className="text-secondary text-center text-sm leading-relaxed mb-10">
                  {t('post_vote.confirm_message')}
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinishSession}
                    className="w-full bg-gradient-primary text-on-primary font-display font-bold text-base py-4 rounded-xl transition-all active:scale-[0.98] shadow-institutional hover:opacity-90"
                  >
                    {t('post_vote.confirm_yes')}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="w-full text-secondary font-display font-bold text-base py-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors active:scale-[0.98]"
                  >
                    {t('post_vote.confirm_no')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NORMAL SELECTION STATE ────────────────────────────────────────── */}
        {!allVoted && (
          <>
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-sm text-[10px] font-sans font-black tracking-[0.2em] uppercase">
                  {t('election.period_label')}
                </span>
                <h1 className="font-display font-bold text-4xl tracking-tight text-on-surface">
                  {t('election.select_title')}
                </h1>
              </div>
              <p className="text-secondary text-lg leading-relaxed">
                {t('election.select_subtitle')}
              </p>
            </motion.header>

            {/* Loading */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-4 p-8 bg-surface-container-low rounded-xl"
                >
                  <span className="material-symbols text-primary text-3xl animate-spin" style={{ animationDuration: '2s' }}>
                    autorenew
                  </span>
                  <p className="text-on-surface-variant font-body">{t('election.loading')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="p-6 bg-error-container rounded-xl flex items-start gap-4">
                <span className="material-symbols text-on-error-container text-2xl">error</span>
                <div>
                  <p className="font-display font-bold text-on-error-container text-sm uppercase tracking-wide">
                    {t('election.load_error')}
                  </p>
                  <p className="text-on-error-container/80 text-sm mt-1">{t(error) || t('errors.common.unexpected')}</p>
                </div>
              </div>
            )}

            {/* Election cards */}
            {!loading && !error && (
              <div className="space-y-4">
                {elections.length === 0 && (
                  <div className="p-8 bg-surface-container-low rounded-xl text-center">
                    <span className="material-symbols text-4xl text-secondary mb-3 block">event_busy</span>
                    <p className="text-on-surface-variant">{t('election.no_active')}</p>
                  </div>
                )}

                {elections.map((election, i) => {
                  const label       = t(`election.types.${election.type}`, { defaultValue: election.type })
                  const description = t(`election.descriptions.${election.type}`, { defaultValue: '' })
                  const icon        = ELECTION_ICONS[election.type] ?? 'how_to_vote'
                  const voted       = election.hasVoted

                  return (
                    <motion.div
                      key={election.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <button
                        disabled={voted}
                        onClick={() => handleSelect(election.id)}
                        className={`w-full text-left p-8 rounded-xl border transition-all duration-300 group relative ${
                          voted
                            ? 'bg-surface-container-lowest border-on-surface/5 opacity-60 cursor-not-allowed'
                            : 'bg-surface-container-low border-primary/5 hover:shadow-institutional hover:border-primary/20 active:scale-[0.99]'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                            voted ? 'bg-surface-container' : 'bg-primary-fixed group-hover:bg-primary/10 transition-colors'
                          }`}>
                            <span className={`material-symbols text-3xl ${voted ? 'text-on-surface/30' : 'text-primary'}`}>
                              {voted ? 'check_circle' : icon}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h2 className="font-display font-bold text-xl text-on-surface">{label}</h2>
                              {voted && (
                                <span className="glass-badge px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-surface-tint border border-surface-tint/10">
                                  {t('election.vote_cast_badge')}
                                </span>
                              )}
                            </div>
                            <p className="text-secondary text-sm">{description}</p>
                            <p className="text-on-surface/30 text-xs mt-1 font-mono">
                              {election.year} · ID: {election.id.substring(0, 16)}…
                            </p>
                          </div>

                          {!voted && (
                            <span className="material-symbols text-2xl text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all">
                              arrow_forward
                            </span>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  )
                })}

                {elections.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-center text-xs text-on-surface/40 pt-4 font-body"
                  >
                    {t('election.independent_note')}
                  </motion.p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <InstitutionalFooter className="mt-auto" />
    </div>
  )
}

export default ElectionSelector
