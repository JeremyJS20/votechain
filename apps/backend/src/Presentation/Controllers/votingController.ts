import { Request, Response } from 'express';
import { votingService } from '@/Application/Services/votingService.js';
import { ballotService } from '@/Application/Services/ballotService.js';
import { resultsService } from '@/Application/Services/resultsService.js';
import { VoteSubmissionSchema, BallotQuerySchema } from '@votechain/common';

// ─── SUBMIT VOTE ──────────────────────────────────────────────────────────────

export const submitVote = async (req: Request, res: Response) => {
  try {
    const result = VoteSubmissionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.errors[0].message,
      });
    }

    const receipt = await votingService.submitVote(
      result.data.userId,
      result.data.electionId,
      result.data.vote,
      result.data.signature
    );
    return res.status(201).json(receipt);
  } catch (error: any) {
    const statusCode = error.code || 500;
    console.error(`[VotingController] Vote error (${statusCode}):`, error.message);
    return res.status(statusCode).json({ success: false, error: error.message || 'errors.common.unexpected' });
  }
};

// ─── GET BALLOT ───────────────────────────────────────────────────────────────

export const getBallot = async (req: Request, res: Response) => {
  try {
    const result = BallotQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors[0].message });
    }

    const ballot = await ballotService.getBallot(result.data.userId, result.data.electionId);
    return res.status(200).json(ballot);
  } catch (error: any) {
    const statusCode = error.code || 500;
    return res.status(statusCode).json({ error: error.message || 'errors.common.unexpected' });
  }
};

// ─── GET RESULTS ──────────────────────────────────────────────────────────────

export const getResults = async (req: Request, res: Response) => {
  try {
    const { electionId } = req.query;
    const eid = electionId as string | undefined;

    const [results, totalVotes] = await Promise.all([
      resultsService.getResults(eid),
      resultsService.getTotalVotesCast(eid),
    ]);

    return res.status(200).json({ totalVotesCast: totalVotes, results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'errors.common.unexpected' });
  }
};
