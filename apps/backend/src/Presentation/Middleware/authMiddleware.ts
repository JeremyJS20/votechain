import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to protect API routes with a shared internal secret key.
 * This prevents unauthorized external clients from accessing VoteChain endpoints.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.INTERNAL_API_SECRET;

  // 1. Skip check for health endpoint
  if (req.path === '/health') {
    return next();
  }

  // 2. Skip check for Didit Webhooks (they handle their own cryptographic signing)
  if (req.path.includes('/verification/webhook')) {
    return next();
  }

  // 3. Verify Authorization Header
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[Security] Unauthorized access attempt: No Bearer token provided for ${req.path}`);
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized access. Authentication token required.' 
    });
  }

  const token = authHeader.split(' ')[1];

  if (token !== secret) {
    console.warn(`[Security] Unauthorized access attempt: Invalid token for ${req.path}`);
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized access. Invalid authentication token.' 
    });
  }

  next();
};
