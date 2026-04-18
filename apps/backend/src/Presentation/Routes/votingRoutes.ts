import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitVote, getBallot, getResults } from '@/Presentation/Controllers/votingController.js';

const voteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many vote submission attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const votingRouter = Router();

votingRouter.post('/vote', voteRateLimiter, submitVote);
votingRouter.get('/ballot', getBallot);
votingRouter.get('/results', getResults);
