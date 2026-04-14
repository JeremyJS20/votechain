import { z } from 'zod';

export const IdentitySchema = z.object({
  cedula: z
    .string()
    .length(11, 'Cédula must be exactly 11 digits.')
    .regex(/^\d+$/, 'Only numerical values are permitted.'),
});

export type IdentityInput = z.infer<typeof IdentitySchema>;
