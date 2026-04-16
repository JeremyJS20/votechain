import { Router } from 'express';
import { registerPublicKey } from '../Controllers/keyController.js';

export const keyRouter = Router();

// POST /api/v1/keys/register — Register voter's public key before voting
keyRouter.post('/register', registerPublicKey);
