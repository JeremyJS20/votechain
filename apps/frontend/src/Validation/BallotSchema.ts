import { z } from 'zod'

export const CandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  party: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

export const BallotSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(10),
  candidates: z.array(CandidateSchema).min(1),
  endTime: z.string().datetime(),
})

export type Candidate = z.infer<typeof CandidateSchema>
export type Ballot = z.infer<typeof BallotSchema>
