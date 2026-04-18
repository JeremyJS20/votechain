import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  generateKeyPair,
  exportPublicKeyAsJwk,
  signVote,
  VoterKeyPair,
} from '@/Infrastructure/Services/CryptoService';
import { VotingService } from '@/Infrastructure/Services/VotingService';
import { useVerificationContext } from '@/Presentation/Contexts/VerificationContext';
import { useBallot } from '@/Presentation/Contexts/BallotContext';
import type { VoteReceipt } from '@votechain/common';

// ── Types ─────────────────────────────────────────────────────────────────────

type CryptoStatus = 'idle' | 'generating' | 'ready' | 'registering' | 'error';
type VoteStatus   = 'idle' | 'signing' | 'submitting' | 'success' | 'error';

interface VotingContextState {
  cryptoStatus: CryptoStatus;
  voteStatus:   VoteStatus;
  voteReceipt:  VoteReceipt | null;
  cryptoError:  string | null;
  voteError:    string | null;
  isReadyToVote: boolean;
  signAndSubmitVote: () => Promise<void>;
  resetVoteError: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const VotingContext = createContext<VotingContextState | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export const VotingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId }                                  = useVerificationContext();
  const { activeElectionId, buildVotePayload }      = useBallot();

  const [keyPair, setKeyPair]           = useState<VoterKeyPair | null>(null);
  const [cryptoStatus, setCryptoStatus] = useState<CryptoStatus>('idle');
  const [cryptoError, setCryptoError]   = useState<string | null>(null);

  const [voteStatus, setVoteStatus]   = useState<VoteStatus>('idle');
  const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);
  const [voteError, setVoteError]     = useState<string | null>(null);

  // ── Key generation & registration ─────────────────────────────────────────
  const initializeCrypto = useCallback(async () => {
    if (!userId || cryptoStatus !== 'idle') return;

    try {
      setCryptoStatus('generating');
      setCryptoError(null);

      const newKeyPair    = await generateKeyPair();
      setCryptoStatus('registering');

      const publicKeyJwk = await exportPublicKeyAsJwk(newKeyPair.publicKey);
      await VotingService.registerPublicKey(userId, publicKeyJwk);

      setKeyPair(newKeyPair);
      setCryptoStatus('ready');
      console.log('[VotingContext] Cryptographic key pair initialized');
    } catch (error: any) {
      console.error('[VotingContext] Crypto init failed:', error);
      setCryptoError(error?.response?.data?.error || 'errors.common.unexpected');
      setCryptoStatus('error');
    }
  }, [userId, cryptoStatus]);

  useEffect(() => {
    if (userId && cryptoStatus === 'idle') initializeCrypto();
  }, [userId, cryptoStatus, initializeCrypto]);

  // ── Sign and submit ────────────────────────────────────────────────────────
  const signAndSubmitVote = useCallback(async () => {
    if (!userId) {
      setVoteError('errors.common.no_auth_voter');
      return;
    }
    if (!keyPair) {
      setVoteError('errors.common.keys_not_ready');
      return;
    }
    if (!activeElectionId) {
      setVoteError('errors.common.no_election_selected');
      return;
    }

    try {
      setVoteStatus('signing');
      setVoteError(null);

      // Build structured vote payload
      const vote = buildVotePayload();

      // Sign: data = { electionId, vote } — matches backend verification
      const signData  = JSON.stringify({ electionId: activeElectionId, vote });
      const signature = await signVote(signData, keyPair.privateKey);

      setVoteStatus('submitting');

      const receipt = await VotingService.submitVote(userId, activeElectionId, vote, signature);

      setVoteReceipt(receipt);
      setVoteStatus('success');
      console.log('[VotingContext] Vote cast. Block:', receipt.blockIndex, '| Election:', receipt.electionType);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'errors.common.unexpected';
      console.error('[VotingContext] Vote submission failed:', message);
      setVoteError(message);
      setVoteStatus('error');
    }
  }, [userId, keyPair, activeElectionId, buildVotePayload]);

  const resetVoteError = useCallback(() => {
    setVoteError(null);
    setVoteStatus('idle');
  }, []);

  const isReadyToVote = cryptoStatus === 'ready' && voteStatus === 'idle';

  return (
    <VotingContext.Provider value={{
      cryptoStatus,
      voteStatus,
      voteReceipt,
      cryptoError,
      voteError,
      isReadyToVote,
      signAndSubmitVote,
      resetVoteError,
    }}>
      {children}
    </VotingContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useVoting = (): VotingContextState => {
  const ctx = useContext(VotingContext);
  if (!ctx) throw new Error('useVoting must be used within a VotingProvider');
  return ctx;
};
