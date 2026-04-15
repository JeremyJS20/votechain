import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Vote payload types (typed, never trusted from frontend for routing) ───────

export interface PresidentialVote {
  candidateId: string;
}

export interface CongressionalVote {
  senadorId?: string;
  diputadoId?: string;
}

export interface MunicipalVote {
  alcalde: string;
  regidores: string[];
}

export type VotePayload = PresidentialVote | CongressionalVote | MunicipalVote;

export class BallotService {
  async getBallot(userId: string, electionId: string) {
    // Resolve user location — NEVER from frontend
    const user = await prisma.citizen.findUnique({
      where: { id: userId },
      select: { province: true, municipality: true },
    });
    if (!user) throw Object.assign(new Error('errors.voting.user_not_found'), { code: 404 });

    // Resolve election type from DB — NEVER from frontend
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { period: { select: { id: true, year: true } } },
    });
    if (!election) throw Object.assign(new Error('errors.voting.election_not_found'), { code: 404 });

    // Active check
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      throw Object.assign(new Error('errors.voting.election_inactive'), { code: 403 });
    }

    // Check if user already voted in this election type this period
    const existingVote = await prisma.voteRecord.findUnique({
      where: {
        userId_electionType_periodId: {
          userId,
          electionType: election.type,
          periodId: election.periodId,
        },
      },
    });

    let candidates;

    if (election.type === 'PRESIDENTIAL') {
      candidates = await prisma.candidate.findMany({
        where: { electionId, position: 'president' },
        orderBy: { name: 'asc' },
      });
    } else if (election.type === 'CONGRESSIONAL') {
      candidates = await prisma.candidate.findMany({
        where: {
          electionId,
          position: { in: ['senador', 'diputado'] },
          province: user.province,
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      });
    } else if (election.type === 'MUNICIPAL') {
      candidates = await prisma.candidate.findMany({
        where: {
          electionId,
          position: { in: ['mayor', 'regidor'] },
          province: user.province,
          municipality: user.municipality,
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      });
    } else {
      throw Object.assign(new Error('errors.voting.unknown_election_type'), { code: 400 });
    }

    return {
      electionId: election.id,
      electionType: election.type,
      period: { id: election.period.id, year: election.period.year },
      voterLocation: { province: user.province, municipality: user.municipality },
      hasVoted: !!existingVote,
      candidates,
    };
  }

  // ── Validate vote payload candidates exist and match user's allocation ──────
  async validateVotePayload(
    electionType: string,
    vote: Record<string, unknown>,
    electionId: string,
    userProvince: string,
    userMunicipality: string
  ): Promise<void> {
    if (electionType === 'PRESIDENTIAL') {
      const { candidateId } = vote as PresidentialVote;
      if (!candidateId) throw Object.assign(new Error('errors.vote.presidential_required'), { code: 400 });
      const c = await prisma.candidate.findFirst({ where: { id: candidateId as string, electionId } });
      if (!c) throw Object.assign(new Error('errors.vote.candidate_not_found'), { code: 404 });

    } else if (electionType === 'CONGRESSIONAL') {
      const { senadorId, diputadoId } = vote as CongressionalVote;
      if (!senadorId && !diputadoId) {
        throw Object.assign(new Error('errors.vote.congressional_required'), { code: 400 });
      }
      if (senadorId) {
        const c = await prisma.candidate.findFirst({
          where: { id: senadorId as string, electionId, province: userProvince },
        });
        if (!c) throw Object.assign(new Error('errors.vote.senador_not_found'), { code: 403 });
      }
      if (diputadoId) {
        const c = await prisma.candidate.findFirst({
          where: { id: diputadoId as string, electionId, province: userProvince },
        });
        if (!c) throw Object.assign(new Error('errors.vote.diputado_not_found'), { code: 403 });
      }

    } else if (electionType === 'MUNICIPAL') {
      const { alcalde, regidores } = vote as MunicipalVote;
      if (!alcalde) throw Object.assign(new Error('errors.vote.alcalde_required'), { code: 400 });
      if (!regidores || !Array.isArray(regidores) || regidores.length === 0) {
        throw Object.assign(new Error('errors.vote.regidor_required'), { code: 400 });
      }

      // Validate alcalde
      const alcaldeCandidate = await prisma.candidate.findFirst({
        where: {
          id: alcalde as string,
          electionId,
          position: 'mayor',
          province: userProvince,
          municipality: userMunicipality,
        },
      });
      if (!alcaldeCandidate) {
        throw Object.assign(
          new Error('errors.vote.alcalde_not_found'),
          { code: 403 }
        );
      }

      // Validate each regidor
      for (const regidorId of regidores as string[]) {
        const regidor = await prisma.candidate.findFirst({
          where: {
            id: regidorId,
            electionId,
            position: 'regidor',
            province: userProvince,
            municipality: userMunicipality,
          },
        });
        if (!regidor) {
          throw Object.assign(
            new Error('errors.vote.regidor_not_found'),
            { code: 403 }
          );
        }
      }
    }
  }
}

export const ballotService = new BallotService();
