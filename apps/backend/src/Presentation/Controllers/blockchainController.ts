import { Request, Response } from 'express';
import {
  getChain,
  validateChain,
  getLatestBlockHash,
} from '../../Application/Services/blockchainService.js';

// ─── VALIDATE CHAIN ───────────────────────────────────────────────────────────

export const validateBlockchain = async (_req: Request, res: Response) => {
  try {
    const result = await validateChain();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ valid: false, reason: 'errors.common.unexpected' });
  }
};

// ─── GET FULL CHAIN (AUDIT) ───────────────────────────────────────────────────

export const getFullChain = async (_req: Request, res: Response) => {
  try {
    const chain = await getChain();

    // Sanitize: round timestamps to minute to prevent timing correlation
    const sanitized = chain.map((block) => ({
      index: block.index,
      hash: block.hash,
      previousHash: block.previousHash,
      // Round to minute for anti-correlation
      timestamp: new Date(
        Math.floor(block.timestamp.getTime() / 60000) * 60000
      ).toISOString(),
      dataLength: block.data.length,
      nonce: block.nonce,
      // Do NOT expose raw data (contains candidateId)
    }));

    return res.status(200).json({
      length: chain.length,
      chain: sanitized,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'errors.common.unexpected' });
  }
};

// ─── GET LATEST HASH (DISTRIBUTED VALIDATION) ────────────────────────────────

export const getBlockchainHash = async (_req: Request, res: Response) => {
  try {
    const hash = await getLatestBlockHash();
    return res.status(200).json({ hash, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return res.status(500).json({ error: 'errors.common.unexpected' });
  }
};
