import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { VotingService, type BallotResponse } from '../../Infrastructure/Services/VotingService';
import { useVerificationContext } from './VerificationContext';
import type { Candidate } from '@votechain/common';

// ── Types ─────────────────────────────────────────────────────────────────────

type BallotLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Generic per-position selection map — covers all election types */
export interface SelectionMap {
  // PRESIDENTIAL
  candidateId?: string;
  // CONGRESSIONAL
  senadorId?: string;
  diputadoId?: string;
  // MUNICIPAL
  alcalde?: string;
  regidores?: string[];
}

interface BallotContextType {
  // Current election context
  activeElectionId: string | null;
  activeElectionType: string | null;
  periodId: string | null;
  periodYear: number | null;

  // Fetched candidates
  candidates: Candidate[];
  ballotLoadStatus: BallotLoadStatus;
  ballotError: string | null;
  hasVoted: boolean;

  // Selections
  selections: SelectionMap;

  // Actions
  loadBallot: (electionId: string) => Promise<void>;
  setSelection: (update: Partial<SelectionMap>) => void;
  toggleRegidor: (regidorId: string) => void;
  clearBallot: () => void;
  isSelectionComplete: () => boolean;
  buildVotePayload: () => Record<string, unknown>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const BallotContext = createContext<BallotContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export const BallotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId } = useVerificationContext();

  const [activeElectionId, setActiveElectionId]     = useState<string | null>(null);
  const [activeElectionType, setActiveElectionType] = useState<string | null>(null);
  const [periodId, setPeriodId]                     = useState<string | null>(null);
  const [periodYear, setPeriodYear]                 = useState<number | null>(null);

  const [candidates, setCandidates]           = useState<Candidate[]>([]);
  const [ballotLoadStatus, setBallotLoadStatus] = useState<BallotLoadStatus>('idle');
  const [ballotError, setBallotError]         = useState<string | null>(null);
  const [hasVoted, setHasVoted]               = useState(false);
  const [selections, setSelections]           = useState<SelectionMap>({});

  // ── Load ballot from server ────────────────────────────────────────────────
  const loadBallot = useCallback(async (electionId: string) => {
    if (!userId) return;

    setBallotLoadStatus('loading');
    setBallotError(null);

    try {
      const ballot: BallotResponse = await VotingService.fetchBallot(userId, electionId);

      setActiveElectionId(ballot.electionId);
      setActiveElectionType(ballot.electionType);
      setPeriodId(ballot.period.id);
      setPeriodYear(ballot.period.year);
      setCandidates(ballot.candidates);
      setHasVoted(ballot.hasVoted);
      setSelections({});
      setBallotLoadStatus('loaded');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'errors.common.unexpected';
      setBallotError(msg);
      setBallotLoadStatus('error');
    }
  }, [userId]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const setSelection = useCallback((update: Partial<SelectionMap>) => {
    setSelections(prev => ({ ...prev, ...update }));
  }, []);

  const toggleRegidor = useCallback((regidorId: string) => {
    setSelections(prev => {
      const current = prev.regidores ?? [];
      const exists  = current.includes(regidorId);
      return {
        ...prev,
        regidores: exists
          ? current.filter(id => id !== regidorId)
          : [...current, regidorId],
      };
    });
  }, []);

  const clearBallot = useCallback(() => {
    setActiveElectionId(null);
    setActiveElectionType(null);
    setPeriodId(null);
    setPeriodYear(null);
    setCandidates([]);
    setSelections({});
    setBallotLoadStatus('idle');
    setHasVoted(false);
  }, []);

  // ── Completeness check per election type ──────────────────────────────────
  const isSelectionComplete = useCallback((): boolean => {
    if (!activeElectionType) return false;
    if (activeElectionType === 'PRESIDENTIAL') {
      return !!selections.candidateId;
    }
    if (activeElectionType === 'CONGRESSIONAL') {
      return !!(selections.senadorId || selections.diputadoId);
    }
    if (activeElectionType === 'MUNICIPAL') {
      return !!(selections.alcalde && selections.regidores && selections.regidores.length > 0);
    }
    return false;
  }, [activeElectionType, selections]);

  // ── Build structured vote payload for submission ───────────────────────────
  const buildVotePayload = useCallback((): Record<string, unknown> => {
    if (activeElectionType === 'PRESIDENTIAL') {
      return { candidateId: selections.candidateId };
    }
    if (activeElectionType === 'CONGRESSIONAL') {
      const payload: Record<string, unknown> = {};
      if (selections.senadorId)  payload.senadorId  = selections.senadorId;
      if (selections.diputadoId) payload.diputadoId = selections.diputadoId;
      return payload;
    }
    if (activeElectionType === 'MUNICIPAL') {
      return {
        alcalde:   selections.alcalde,
        regidores: selections.regidores ?? [],
      };
    }
    return {};
  }, [activeElectionType, selections]);

  return (
    <BallotContext.Provider value={{
      activeElectionId,
      activeElectionType,
      periodId,
      periodYear,
      candidates,
      ballotLoadStatus,
      ballotError,
      hasVoted,
      selections,
      loadBallot,
      setSelection,
      toggleRegidor,
      clearBallot,
      isSelectionComplete,
      buildVotePayload,
    }}>
      {children}
    </BallotContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useBallot = () => {
  const ctx = useContext(BallotContext);
  if (!ctx) throw new Error('useBallot must be used within a BallotProvider');
  return ctx;
};
