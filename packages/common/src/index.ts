import { z } from 'zod';

// ── Identity ──────────────────────────────────────────────────────────────────

export const IdentitySchema = z.object({
  cedula: z
    .string()
    .length(11, 'errors.identity.cedula_len')
    .regex(/^\d+$/, 'errors.identity.numeric_only'),
});

export type IdentityInput = z.infer<typeof IdentitySchema>;

// ── Election Types ────────────────────────────────────────────────────────────

export const ElectionTypeEnum = z.enum(['PRESIDENTIAL', 'CONGRESSIONAL', 'MUNICIPAL']);
export type ElectionType = z.infer<typeof ElectionTypeEnum>;

export const ElectionSchema = z.object({
  id: z.string(),
  type: ElectionTypeEnum,
  periodId: z.string(),
  year: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  hasVoted: z.boolean().optional(),
});

export type Election = z.infer<typeof ElectionSchema>;

// ── Vote Payload Variants ──────────────────────────────────────────────────────

export const PresidentialVoteSchema = z.object({
  candidateId: z.string().min(1, 'errors.common.field_required'),
});

export const CongressionalVoteSchema = z.object({
  senadorId:  z.string().min(1).optional(),
  diputadoId: z.string().min(1).optional(),
}).refine(v => v.senadorId || v.diputadoId, {
  message: 'errors.vote.congressional_required',
});

export const MunicipalVoteSchema = z.object({
  alcalde:   z.string().min(1, 'errors.common.field_required'),
  regidores: z.array(z.string().min(1)).min(1, 'errors.vote.regidor_required'),
});

export type PresidentialVote  = z.infer<typeof PresidentialVoteSchema>;
export type CongressionalVote = z.infer<typeof CongressionalVoteSchema>;
export type MunicipalVote     = z.infer<typeof MunicipalVoteSchema>;

// ── Vote Submission ───────────────────────────────────────────────────────────

export const VoteSubmissionSchema = z.object({
  userId:     z.string().min(1, 'errors.common.field_required'),
  electionId: z.string().min(1, 'errors.common.field_required'),
  vote:       z.record(z.unknown()),           // structured; backend validates shape per type
  signature:  z.string().min(1, 'errors.vote.signature_required'),
});

export type VoteSubmission = z.infer<typeof VoteSubmissionSchema>;

// ── Ballot Query ──────────────────────────────────────────────────────────────

export const BallotQuerySchema = z.object({
  userId:     z.string().min(1, 'errors.common.field_required'),
  electionId: z.string().min(1, 'errors.common.field_required'),
});

export type BallotQuery = z.infer<typeof BallotQuerySchema>;

// ── Public Key Registration ───────────────────────────────────────────────────

export const PublicKeyRegistrationSchema = z.object({
  userId:    z.string().min(1, 'errors.common.field_required'),
  publicKey: z.string().min(1, 'errors.keys.public_key_required'),
});

export type PublicKeyRegistration = z.infer<typeof PublicKeyRegistrationSchema>;

// ── Candidate ─────────────────────────────────────────────────────────────────

export const CandidateSchema = z.object({
  id:           z.string(),
  name:         z.string(),
  party:        z.string(),
  position:     z.enum(['president', 'mayor', 'regidor', 'senador', 'diputado']),
  province:     z.string().nullable().optional(),
  municipality: z.string().nullable().optional(),
  electionId:   z.string(),
});

export type Candidate = z.infer<typeof CandidateSchema>;

// ── Vote Receipt ──────────────────────────────────────────────────────────────

export const VoteReceiptSchema = z.object({
  success:      z.boolean(),
  voteId:       z.string(),
  electionId:   z.string(),
  electionType: z.string(),
  blockIndex:   z.number(),
  blockHash:    z.string(),
  timestamp:    z.string(),
});

export type VoteReceipt = z.infer<typeof VoteReceiptSchema>;
