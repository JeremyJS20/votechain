import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (monorepo root first, then backend-specific)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { identityRouter } from './Routes/identityRoutes.js';
import { verificationRouter } from './Routes/verificationRoutes.js';
import { votingRouter } from './Routes/votingRoutes.js';
import { blockchainRouter } from './Routes/blockchainRoutes.js';
import { keyRouter } from './Routes/keyRoutes.js';
import { electionRouter } from './Routes/electionRoutes.js';
import { authMiddleware } from './Middleware/authMiddleware.js';


export const app = express();
app.set('trust proxy', 1); // Trust Vercel proxy
const PORT = process.env.PORT || 3001;

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

// Handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// ── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// ── Authentication Middleware ───────────────────────────────────────────────
app.use(authMiddleware);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/identity', identityRouter);
app.use('/api/v1/verification', verificationRouter);
app.use('/api/v1/voting', votingRouter);
app.use('/api/v1/blockchain', blockchainRouter);
app.use('/api/v1/keys', keyRouter);
app.use('/api/v1/elections', electionRouter);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'active',
    node: 'Digital Node 04',
    modules: ['identity', 'verification', 'voting', 'blockchain'],
    timestamp: new Date().toISOString(),
  });
});

// Only start the server if we are running in development mode.
// In production (Vercel), we export the app and let Vercel handle the cold start.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[VoteChain API] Status: Listening on http://localhost:${PORT}`);
    console.log(`[VoteChain API] Primary Origin: ${corsOptions.origin}`);
    console.log(`[VoteChain API] Modules Loaded: identity, verification, voting, blockchain`);
  });
}

export default app;
