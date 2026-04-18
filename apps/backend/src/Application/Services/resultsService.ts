import { PrismaClient } from '@prisma/client';
import { getChain } from '@/Application/Services/blockchainService.js';

const prisma = new PrismaClient();

interface CandidateTally {
  candidateId: string;
  name: string;
  party: string;
  position: string;
  province?: string | null;
  municipality?: string | null;
  voteCount: number;
}

interface BlockPayload {
  electionId?: string;
  electionType?: string;
  period?: number;
  vote?: Record<string, unknown>;
  // legacy shape (pre-refactor)
  candidate?: string;
}

export class ResultsService {
  async getResults(electionId?: string): Promise<CandidateTally[]> {
    const chain = await getChain();
    const voteBlocks = chain.filter(b => b.index > 0 && b.data !== 'GENESIS');

    // Tally candidate votes from blockchain data
    const tally: Record<string, number> = {};

    for (const block of voteBlocks) {
      try {
        const parsed = JSON.parse(block.data) as BlockPayload;

        // Filter by electionId if provided
        if (electionId && parsed.electionId !== electionId) continue;

        const vote = parsed.vote;
        if (!vote) continue;

        const electionType = parsed.electionType;

        if (electionType === 'PRESIDENTIAL') {
          const candidateId = vote.candidateId as string | undefined;
          if (candidateId) tally[candidateId] = (tally[candidateId] || 0) + 1;

        } else if (electionType === 'CONGRESSIONAL') {
          const senadorId = vote.senadorId as string | undefined;
          const diputadoId = vote.diputadoId as string | undefined;
          if (senadorId) tally[senadorId] = (tally[senadorId] || 0) + 1;
          if (diputadoId) tally[diputadoId] = (tally[diputadoId] || 0) + 1;

        } else if (electionType === 'MUNICIPAL') {
          const alcalde = vote.alcalde as string | undefined;
          const regidores = vote.regidores as string[] | undefined;
          if (alcalde) tally[alcalde] = (tally[alcalde] || 0) + 1;
          if (Array.isArray(regidores)) {
            for (const r of regidores) tally[r] = (tally[r] || 0) + 1;
          }
        }
      } catch {
        console.warn(`[ResultsService] Skipping block ${block.index} — invalid JSON`);
      }
    }

    const candidateIds = Object.keys(tally);
    if (candidateIds.length === 0) return [];

    // Build filter
    const whereClause = electionId
      ? { id: { in: candidateIds }, electionId }
      : { id: { in: candidateIds } };

    const candidates = await prisma.candidate.findMany({ where: whereClause });

    const results: CandidateTally[] = candidates.map(c => ({
      candidateId: c.id,
      name: c.name,
      party: c.party,
      position: c.position,
      province: c.province,
      municipality: c.municipality,
      voteCount: tally[c.id] || 0,
    }));

    results.sort((a, b) => {
      if (a.position !== b.position) return a.position.localeCompare(b.position);
      return b.voteCount - a.voteCount;
    });

    return results;
  }

  async getTotalVotesCast(electionId?: string): Promise<number> {
    return prisma.voteRecord.count(
      electionId ? { where: { electionId } } : undefined
    );
  }
}

export const resultsService = new ResultsService();
