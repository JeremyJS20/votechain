import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVerificationContext } from '../Contexts/VerificationContext'
import { VotingService, type ElectionStatusItem } from '../../Infrastructure/Services/VotingService'
import type { VoteReceipt } from '@votechain/common'
import TopAppBar from '../Components/Common/TopAppBar'
import InstitutionalFooter from '../Components/Common/InstitutionalFooter'

interface LocationState {
  receipt: VoteReceipt
}

const ELECTION_ICONS: Record<string, string> = {
  PRESIDENTIAL:  'account_balance',
  CONGRESSIONAL: 'gavel',
  MUNICIPAL:     'location_city',
}

const VoteSuccess: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t }    = useTranslation()
  const { userId, resetSession } = useVerificationContext()
  const state    = location.state as LocationState | null
  const receipt  = state?.receipt

  const [chainValid, setChainValid]       = useState<boolean | null>(null)
  const [copied, setCopied]               = useState(false)
  const [remaining, setRemaining]         = useState<ElectionStatusItem[]>([])
  const [allComplete, setAllComplete]     = useState(false)
  const [electionsLoaded, setElectionsLoaded] = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)

  // ── On mount: validate chain + fetch election status ────────────────────────
  useEffect(() => {
    if (!receipt) {
      navigate('/', { replace: true })
      return
    }

    VotingService.validateBlockchain()
      .then(res => setChainValid(res.valid))
      .catch(() => setChainValid(false))

    if (userId) {
      VotingService.fetchElectionStatus(userId)
        .then(status => {
          const pending = status.filter(e => !e.hasVoted)
          setRemaining(pending)
          setAllComplete(pending.length === 0)
          setElectionsLoaded(true)
        })
        .catch(() => {
          setElectionsLoaded(true)
        })
    }
  }, [receipt, navigate, userId])

  if (!receipt) return null

  const truncateHash = (hash: string) =>
    hash ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}` : '0x---'

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.voteId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Full session nuke (only when all elections are done) ─────────────────────
  const handleFinishSession = () => {
    sessionStorage.removeItem('votechain_ballot')
    sessionStorage.removeItem('votechain_user_id')
    sessionStorage.removeItem('votechain_user_name')
    sessionStorage.removeItem('votechain_verified')
    sessionStorage.removeItem('votechain_cedula')
    resetSession()
    navigate('/', { replace: true })
  }

  const handleContinueElection = (electionId: string) => {
    sessionStorage.removeItem('votechain_ballot')
    navigate(`/vote/ballot/${electionId}`, { replace: true })
  }

  const formattedDate = new Date(receipt.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).toUpperCase()

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col items-center overflow-x-hidden relative">

      {/* Background ambient blobs */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary-fixed/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-48 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none" />

      <TopAppBar showBallotNav={false} />

      {/* Main content */}
      <main className="w-full max-w-4xl px-6 pt-28 pb-32 flex flex-col items-center">
        <div className="relative w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">

          {/* LEFT: Visual anchor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="flex-1 flex justify-center items-center"
          >
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-primary-fixed opacity-20 blur-3xl" />
              <div className="relative w-48 h-48 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-institutional">
                <span
                  className="material-symbols text-[120px] text-surface-tint"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>

              <div className="glass-badge absolute -bottom-4 -right-4 px-4 py-2 rounded-full border border-outline-variant/20 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface">
                  {t('vote_success.blockchain_badge')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex-1 text-center md:text-left space-y-8"
          >
            {/* Heading */}
            <div>
              <h1 className="font-display font-bold text-on-background tracking-tight text-4xl mb-4 leading-tight">
                {t('vote_success.title_line1')}<br />{t('vote_success.title_line2')}
              </h1>
              <p className="font-body text-secondary text-lg leading-relaxed">
                {t('vote_success.subtitle')}
              </p>
            </div>

            {/* Receipt card */}
            <div className="bg-surface-container-low rounded-xl p-8 space-y-6">

              {receipt.electionType && (
                <div className="space-y-1">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
                    {t('vote_success.receipt.election_type')}
                  </span>
                  <p className="font-body font-semibold text-on-surface text-sm">
                    {t(`election.types.${receipt.electionType}`, { defaultValue: receipt.electionType })}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
                  {t('vote_success.receipt.tx_hash')}
                </span>
                <div className="flex items-center gap-2 bg-surface-container-lowest p-4 rounded-lg">
                  <span className="font-mono text-sm text-primary break-all flex-1">
                    {truncateHash(receipt.voteId)}
                  </span>
                  <button
                    onClick={handleCopy}
                    title={t('vote_success.receipt.tx_hash')}
                    className="material-symbols text-sm cursor-pointer text-secondary hover:text-primary transition-colors ml-auto shrink-0"
                  >
                    {copied ? 'check' : 'content_copy'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/20 pt-6 gap-4">
                <div className="space-y-1">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
                    {t('vote_success.receipt.timestamp')}
                  </span>
                  <p className="font-body font-semibold text-on-surface text-sm">{formattedDate}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
                    {t('vote_success.receipt.node_status')}
                  </span>
                  <p className="font-body font-semibold text-surface-tint flex items-center justify-end gap-1.5 text-sm">
                    {chainValid === null && (
                      <>
                        <span className="material-symbols text-xs animate-spin" style={{ animationDuration: '2s' }}>autorenew</span>
                        {t('vote_success.receipt.validating')}
                      </>
                    )}
                    {chainValid === true && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-surface-tint" />
                        {t('vote_success.receipt.finalized')}
                      </>
                    )}
                    {chainValid === false && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-error" />
                        <span className="text-error">{t('vote_success.receipt.pending')}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <span className="font-label text-xs text-secondary uppercase tracking-widest">
                  {t('vote_success.receipt.block_index')}
                </span>
                <span className="font-mono text-sm font-semibold text-primary">#{receipt.blockIndex}</span>
              </div>
            </div>

            {/* ── CONDITIONAL: Remaining elections OR all-complete ── */}
            <AnimatePresence mode="wait">
              {electionsLoaded && !allComplete && remaining.length > 0 && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-5"
                >
                  {/* Pending elections banner */}
                  <div className="flex items-center gap-4 p-5 bg-[#e8f0fe] rounded-xl border border-primary/10">
                    <span className="material-symbols text-primary text-2xl">how_to_vote</span>
                    <div>
                      <p className="font-display font-bold text-primary text-sm">
                        {t('vote_success.pending_title')}
                      </p>
                      <p className="text-primary/70 text-xs mt-0.5">
                        {t('vote_success.pending_subtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Remaining election cards */}
                  <div className="space-y-3">
                    {remaining.map((election, i) => {
                      const label = t(`election.types.${election.type}`, { defaultValue: election.type })
                      const desc  = t(`election.descriptions.${election.type}`, { defaultValue: '' })
                      const icon  = ELECTION_ICONS[election.type] ?? 'how_to_vote'

                      return (
                        <motion.button
                          key={election.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.08 }}
                          onClick={() => handleContinueElection(election.id)}
                          className="w-full text-left p-6 rounded-xl bg-surface-container-low border border-primary/5 hover:shadow-institutional hover:border-primary/20 active:scale-[0.99] transition-all duration-300 group flex items-center gap-5"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary-fixed group-hover:bg-primary/10 transition-colors flex items-center justify-center shrink-0">
                            <span className="material-symbols text-2xl text-primary">{icon}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-display font-bold text-on-surface text-base">{label}</p>
                            <p className="text-secondary text-xs">{desc}</p>
                          </div>
                          <span className="material-symbols text-xl text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all">
                            arrow_forward
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                  <p className="text-xs text-on-surface/40 text-center">
                    {t('vote_success.receipt_note')}
                  </p>
                </motion.div>
              )}

              {electionsLoaded && allComplete && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-5"
                >
                  {/* All-complete banner */}
                  <div className="flex items-center gap-4 p-5 bg-[#e6f4ea] rounded-xl border border-green-700/10">
                    <span className="material-symbols text-green-700 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      task_alt
                    </span>
                    <div>
                      <p className="font-display font-bold text-green-800 text-sm">
                        {t('post_vote.all_complete_title')}
                      </p>
                      <p className="text-green-700/70 text-xs mt-0.5">
                        {t('post_vote.all_complete_subtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Finish CTA */}
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full bg-gradient-primary text-on-primary font-display font-bold text-xl py-5 px-12 rounded-xl transition-all active:scale-[0.98] shadow-institutional hover:opacity-90 interactive-touch"
                  >
                    {t('post_vote.cta_finish')}
                  </button>

                  <p className="text-center font-body text-sm text-secondary">
                    {t('vote_success.session_terminated')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* ── CONFIRMATION MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-scrim/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 z-10"
            >
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

      <InstitutionalFooter className="mt-auto" />
    </div>
  )
}

export default VoteSuccess
