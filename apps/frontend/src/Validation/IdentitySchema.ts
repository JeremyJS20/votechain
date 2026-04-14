import { z } from 'zod';

/**
 * Schema for verifying the 'Cédula de Identidad y Electoral' (Dominican ID)
 * Format: 11 direct digits (e.g., 40212345678)
 */
export const IdentitySchema = z.object({
  cedula: z
    .string()
    .min(11, { message: 'cedula_min_error' }) // Translation key
    .max(11, { message: 'cedula_max_error' })
    .regex(/^\d+$/, { message: 'cedula_numeric_error' }),
});

export type IdentityFormValues = z.infer<typeof IdentitySchema>;
