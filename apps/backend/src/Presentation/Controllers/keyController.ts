import { Request, Response } from 'express';
import { votingService } from '@/Application/Services/votingService.js';

// ─── REGISTER PUBLIC KEY ──────────────────────────────────────────────────────

export const registerPublicKey = async (req: Request, res: Response) => {
  try {
    const { userId, publicKey } = req.body;

    if (!userId || !publicKey) {
      return res.status(400).json({
        error: 'errors.keys.public_key_required',
      });
    }

    // Validate publicKey is valid JSON (JWK format)
    try {
      JSON.parse(publicKey);
    } catch {
      return res.status(400).json({
        error: 'errors.keys.public_key_required',
      });
    }

    await votingService.registerPublicKey(userId, publicKey);

    return res.status(200).json({
      success: true,
      message: 'Public key registered successfully',
    });
  } catch (error: any) {
    const statusCode = error.code || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'errors.common.unexpected',
    });
  }
};
