import { Request, Response } from 'express';
import { electionService } from '../../Application/Services/electionService.js';

// ─── GET ACTIVE ELECTIONS ────────────────────────────────────────────────────

export const getActiveElections = async (_req: Request, res: Response) => {
  try {
    const elections = await electionService.getActiveElections();
    return res.status(200).json(elections.map(e => ({
      id: e.id,
      type: e.type,
      periodId: e.periodId,
      year: e.period.year,
      startDate: e.startDate,
      endDate: e.endDate,
    })));
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'errors.common.unexpected' });
  }
};

// ─── GET USER ELECTION STATUS ────────────────────────────────────────────────

export const getUserElectionStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'errors.common.field_required' });
    }
    const status = await electionService.getUserElectionStatus(userId);
    return res.status(200).json(status);
  } catch (error: any) {
    const code = error.code || 500;
    return res.status(code).json({ error: error.message || 'errors.common.unexpected' });
  }
};
