import { Router } from 'express';
import {
  validateBlockchain,
  getFullChain,
  getBlockchainHash,
} from '../Controllers/blockchainController.js';

export const blockchainRouter = Router();

// GET /api/v1/blockchain          — Full chain audit log
blockchainRouter.get('/', getFullChain);

// GET /api/v1/blockchain/validate — Cryptographic integrity check
blockchainRouter.get('/validate', validateBlockchain);

// GET /api/v1/blockchain/hash     — Latest block hash for distributed node comparison
blockchainRouter.get('/hash', getBlockchainHash);
