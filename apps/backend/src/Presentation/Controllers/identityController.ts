import { Request, Response } from 'express';
import { IdentityService } from '../../Application/Services/identityService.js';
import { IdentitySchema } from '@votechain/common';

const identityService = new IdentityService();

export const verifyIdentity = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input using Shared Zod Schema
    const result = IdentitySchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors[0].message });
    }

    // 2. Call Service Logic
    const civicProfile = await identityService.verifyCedula(result.data);

    // 3. Return Success
    return res.status(200).json({
      success: true,
      data: civicProfile
    });

  } catch (error: any) {
    return res.status(error.code || 401).json({
      success: false,
      error: error.message || 'errors.common.unexpected'
    });
  }
};
