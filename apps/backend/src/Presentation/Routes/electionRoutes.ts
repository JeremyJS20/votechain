import { Router } from 'express';
import { getActiveElections, getUserElectionStatus } from '@/Presentation/Controllers/electionController.js';

export const electionRouter = Router();

// GET /api/v1/elections/active — all elections with open time window
electionRouter.get('/active', getActiveElections);

// GET /api/v1/elections/status?userId=... — per-user voted/unvoted status
electionRouter.get('/status', getUserElectionStatus);
