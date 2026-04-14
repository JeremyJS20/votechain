import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from the process root (monorepo root)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Also try to load from the backend directory specifically just in case
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });
// Fallback: search specifically for the monorepo root .env from this file's position
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { identityRouter } from './Routes/identityRoutes.js';
import { verificationRouter } from './Routes/verificationRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/v1/identity', identityRouter);
app.use('/api/v1/verification', verificationRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'active', node: 'Digital Node 04' });
});

app.listen(PORT, () => {
  console.log(`[VoteChain API] Running on http://localhost:${PORT}`);
});
