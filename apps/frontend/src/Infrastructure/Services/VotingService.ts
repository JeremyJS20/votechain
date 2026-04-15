import HttpClient from '../HttpClient';
import type { Candidate, VoteReceipt, Election } from '@votechain/common';

// ── Response types ────────────────────────────────────────────────────────────

export interface BallotResponse {
  electionId: string;
  electionType: string;
  period: { id: string; year: number };
  voterLocation: { province: string; municipality: string };
  hasVoted: boolean;
  candidates: Candidate[];
}

export interface ElectionStatusItem {
  id: string;
  type: string;
  periodId: string;
  year: number;
  startDate: string;
  endDate: string;
  hasVoted: boolean;
}

export interface ResultsTally {
  candidateId: string;
  name: string;
  party: string;
  position: string;
  province?: string | null;
  municipality?: string | null;
  voteCount: number;
}

export interface ResultsResponse {
  totalVotesCast: number;
  results: ResultsTally[];
}

export interface BlockchainValidationResponse {
  valid: boolean;
  reason?: string;
}

export const VotingService = {
  // Register voter's public key before voting
  async registerPublicKey(userId: string, publicKeyJwk: string): Promise<void> {
    await HttpClient.post('/keys/register', { userId, publicKey: publicKeyJwk });
  },

  // Fetch all currently active elections (date-window enforced on server)
  async fetchActiveElections(): Promise<Election[]> {
    const response = await HttpClient.get<Election[]>('/elections/active');
    return response.data;
  },

  // Fetch which elections the user has/hasn't voted in
  async fetchElectionStatus(userId: string): Promise<ElectionStatusItem[]> {
    const response = await HttpClient.get<ElectionStatusItem[]>('/elections/status', {
      params: { userId },
    });
    return response.data;
  },

  // Fetch ballot candidates for a specific election (location resolved server-side)
  async fetchBallot(userId: string, electionId: string): Promise<BallotResponse> {
    const response = await HttpClient.get<BallotResponse>('/voting/ballot', {
      params: { userId, electionId },
    });
    return response.data;
  },

  // Submit a signed, structured vote
  async submitVote(
    userId: string,
    electionId: string,
    vote: Record<string, unknown>,
    signature: string
  ): Promise<VoteReceipt> {
    const response = await HttpClient.post<VoteReceipt>('/voting/vote', {
      userId,
      electionId,
      vote,
      signature,
    });
    return response.data;
  },

  // Fetch results, optionally filtered by election
  async fetchResults(electionId?: string): Promise<ResultsResponse> {
    const response = await HttpClient.get<ResultsResponse>('/voting/results', {
      params: electionId ? { electionId } : undefined,
    });
    return response.data;
  },

  // Validate blockchain integrity
  async validateBlockchain(): Promise<BlockchainValidationResponse> {
    const response = await HttpClient.get<BlockchainValidationResponse>('/blockchain/validate');
    return response.data;
  },
};
