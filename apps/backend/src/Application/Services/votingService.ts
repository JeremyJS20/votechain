import { PrismaClient } from '@prisma/client';
import { verifySignature, sha256 } from './cryptoService.js';
import { addBlock } from './blockchainService.js';
import { electionService } from './electionService.js';
import { ballotService } from './ballotService.js';
import { verificationService } from './verificationService.js';

const prisma = new PrismaClient();

export interface VoteReceipt {
  success: boolean;
  voteId: string;
  electionId: string;
  electionType: string;
  blockIndex: number;
  blockHash: string;
  timestamp: string;
}

export class VotingService {
  async submitVote(
    userId: string,
    electionId: string,
    vote: Record<string, unknown>,
    signature: string
  ): Promise<VoteReceipt> {

    // ── STEP 1: Validate user ────────────────────────────────────────────────
    const user = await prisma.citizen.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('errors.voting.user_not_found'), { code: 404 });
    if (user.registrationStatus !== 'VERIFIED') {
      throw Object.assign(new Error('errors.voting.user_not_verified'), { code: 403 });
    }

    // ── STEP 2: Biometric check ───────────────────────────────────────────────
    const bypassForDev = process.env.BYPASS_BIOMETRIC_IN_DEV === 'true';
    if (!bypassForDev) {
      const verificationStatus = await verificationService.getVerificationStatus(userId);
      if (!verificationStatus.verified) {
        throw Object.assign(
          new Error('errors.voting.biometric_failed'),
          { code: 403 }
        );
      }
    } else {
      console.warn(`[VotingService] ⚠️  BYPASS_BIOMETRIC_IN_DEV — biometric check skipped for ${userId}`);
    }

    // ── STEP 3: Validate election exists and is active (backend-enforced) ────
    const election = await electionService.assertElectionActive(electionId);

    // ── STEP 4: Enforce ONE vote per user per election type per period ────────
    const existingVote = await prisma.voteRecord.findUnique({
      where: {
        userId_electionType_periodId: {
          userId,
          electionType: election.type,
          periodId: election.periodId,
        },
      },
    });
    if (existingVote) {
      throw Object.assign(
        new Error('errors.voting.already_voted'),
        { code: 409 }
      );
    }

    // ── STEP 5: Verify cryptographic signature ───────────────────────────────
    if (!user.publicKey) {
      throw Object.assign(new Error('errors.voting.no_public_key'), { code: 400 });
    }
    const signData = JSON.stringify({ electionId, vote });
    const isValid = verifySignature(signature, signData, user.publicKey);
    if (!isValid) {
      throw Object.assign(new Error('errors.voting.signature_failed'), { code: 401 });
    }

    // ── STEP 6: Validate vote payload (candidates, allocation) — backend only ─
    await ballotService.validateVotePayload(
      election.type,
      vote,
      electionId,
      user.province,
      user.municipality
    );

    // ── STEP 7: Build blockchain payload — NO userId, no identity ────────────
    const timestamp = new Date();
    const blockPayload = {
      electionId,
      electionType: election.type,
      period: election.period.year,
      vote, // contains candidate selections only
    };

    // ── STEP 8: Compute vote hash (vote + electionId + timestamp) ────────────
    const voteHash = sha256(
      JSON.stringify(vote) + electionId + timestamp.toISOString()
    );

    // ── STEP 9: Append to blockchain ─────────────────────────────────────────
    const block = await addBlock(JSON.stringify(blockPayload));

    // ── STEP 10: Create VoteRecord (unique constraint prevents double-vote) ───
    await prisma.voteRecord.create({
      data: {
        userId,
        electionType: election.type,
        electionId,
        periodId: election.periodId,
        voteHash,
        blockIndex: block.index,
        signature,
      },
    });

    // ── STEP 11: Return verifiable receipt ───────────────────────────────────
    return {
      success: true,
      voteId: voteHash,
      electionId,
      electionType: election.type,
      blockIndex: block.index,
      blockHash: block.hash,
      // Round to minute to prevent timing correlation attacks
      timestamp: new Date(Math.floor(timestamp.getTime() / 60000) * 60000).toISOString(),
    };
  }

  async registerPublicKey(userId: string, publicKey: string): Promise<void> {
    const user = await prisma.citizen.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('errors.voting.user_not_found'), { code: 404 });
    await prisma.citizen.update({ where: { id: userId }, data: { publicKey } });
  }

  async hasVotedInElection(userId: string, electionType: string, periodId: string): Promise<boolean> {
    const record = await prisma.voteRecord.findUnique({
      where: { userId_electionType_periodId: { userId, electionType, periodId } },
    });
    return !!record;
  }
}

export const votingService = new VotingService();
