import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ElectionService {
  // ── Active elections (date-window checked server-side) ──────────────────────
  async getActiveElections() {
    const now = new Date();
    return prisma.election.findMany({
      where: {
        startDate: { lte: now },
        endDate:   { gte: now },
        period:    { isActive: true },
      },
      include: { period: { select: { id: true, year: true } } },
      orderBy: { type: 'asc' },
    });
  }

  // ── Single election lookup ──────────────────────────────────────────────────
  async getElection(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { period: true },
    });
    if (!election) throw Object.assign(new Error('errors.voting.election_not_found'), { code: 404 });
    return election;
  }

  // ── Validate election is within its active time window ─────────────────────
  async assertElectionActive(electionId: string) {
    const election = await this.getElection(electionId);
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      throw Object.assign(
        new Error('errors.voting.election_inactive'),
        { code: 403 }
      );
    }
    if (!election.period.isActive) {
      throw Object.assign(new Error('errors.voting.period_closed'), { code: 403 });
    }
    return election;
  }

  // ── Per-user status: which elections they've already voted in ──────────────
  async getUserElectionStatus(userId: string) {
    const activeElections = await this.getActiveElections();
    const voteRecords = await prisma.voteRecord.findMany({
      where: { userId },
      select: { electionType: true, periodId: true, electionId: true, votedAt: true },
    });

    const votedSet = new Set(voteRecords.map(r => `${r.electionType}:${r.periodId}`));

    return activeElections.map(election => ({
      id: election.id,
      type: election.type,
      periodId: election.periodId,
      year: election.period.year,
      startDate: election.startDate,
      endDate: election.endDate,
      hasVoted: votedSet.has(`${election.type}:${election.periodId}`),
    }));
  }
}

export const electionService = new ElectionService();
