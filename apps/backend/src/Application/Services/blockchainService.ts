import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const SYSTEM_SALT = process.env.BLOCKCHAIN_SALT;
if (!SYSTEM_SALT) {
  throw new Error('[VoteChain Security] BLOCKCHAIN_SALT is missing from environment variables!');
}
const POW_PREFIX = '000';

// ─── HASHING ──────────────────────────────────────────────────────────────────

export function computeHash(
  index: number,
  previousHash: string,
  timestamp: string,
  data: string,
  nonce: number
): string {
  return crypto
    .createHash('sha256')
    .update(`${index}${previousHash}${timestamp}${data}${nonce}${SYSTEM_SALT}`)
    .digest('hex');
}

// ─── PROOF OF WORK ────────────────────────────────────────────────────────────

function mineBlock(
  index: number,
  previousHash: string,
  timestamp: string,
  data: string
): { hash: string; nonce: number } {
  let nonce = 0;
  let hash = '';

  while (true) {
    hash = computeHash(index, previousHash, timestamp, data, nonce);
    if (hash.startsWith(POW_PREFIX)) break;
    nonce++;
  }

  return { hash, nonce };
}

// ─── GET LAST BLOCK ───────────────────────────────────────────────────────────

export async function getLastBlock() {
  return prisma.block.findFirst({ orderBy: { index: 'desc' } });
}

// ─── ENSURE GENESIS EXISTS ────────────────────────────────────────────────────

export async function ensureGenesis(): Promise<void> {
  const existing = await prisma.block.findUnique({ where: { index: 0 } });
  if (existing) return;

  const timestamp = new Date();
  const data = 'GENESIS';
  const previousHash = '0'.repeat(64);
  const { hash, nonce } = mineBlock(0, previousHash, timestamp.toISOString(), data);

  await prisma.block.create({
    data: { index: 0, timestamp, data, previousHash, hash, nonce },
  });
}

// ─── ADD BLOCK ────────────────────────────────────────────────────────────────

export async function addBlock(data: string) {
  await ensureGenesis();

  const last = await getLastBlock();
  if (!last) throw new Error('Blockchain is not initialized');

  const index = last.index + 1;
  const previousHash = last.hash;
  const timestamp = new Date();
  const { hash, nonce } = mineBlock(index, previousHash, timestamp.toISOString(), data);

  const block = await prisma.block.create({
    data: { index, timestamp, data, previousHash, hash, nonce },
  });

  return block;
}

// ─── GET FULL CHAIN ───────────────────────────────────────────────────────────

export async function getChain() {
  return prisma.block.findMany({ orderBy: { index: 'asc' } });
}

// ─── VALIDATE CHAIN ───────────────────────────────────────────────────────────

export async function validateChain(): Promise<{ valid: boolean; reason?: string }> {
  const chain = await getChain();

  if (chain.length === 0) {
    return { valid: false, reason: 'Chain is empty' };
  }

  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const previous = chain[i - 1];

    // Verify hash integrity
    const expectedHash = computeHash(
      current.index,
      current.previousHash,
      current.timestamp.toISOString(),
      current.data,
      current.nonce
    );

    if (current.hash !== expectedHash) {
      return {
        valid: false,
        reason: `Block ${current.index} has an invalid hash. Possible tampering detected.`,
      };
    }

    // Verify previousHash linkage
    if (current.previousHash !== previous.hash) {
      return {
        valid: false,
        reason: `Block ${current.index} previousHash does not match block ${previous.index}. Chain is broken.`,
      };
    }
  }

  return { valid: true };
}

// ─── GET LATEST HASH ──────────────────────────────────────────────────────────

export async function getLatestBlockHash(): Promise<string | null> {
  const last = await getLastBlock();
  return last?.hash ?? null;
}
