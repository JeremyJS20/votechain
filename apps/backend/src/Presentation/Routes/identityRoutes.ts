import { Router } from 'express';
import { verifyIdentity } from '../Controllers/identityController.js';

const router = Router();

router.post('/verify', verifyIdentity);

export { router as identityRouter };
