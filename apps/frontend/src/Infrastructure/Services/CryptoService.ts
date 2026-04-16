/**
 * CryptoService — Browser-native RSA key generation and vote signing.
 *
 * Uses the Web Crypto API (SubtleCrypto) exclusively:
 * - No external dependencies
 * - Private key NEVER leaves browser memory
 * - Secure algorithm configuration from environment variables
 */

export interface VoterKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

// Configuration from environment variables
const CRYPTO_ALGORITHM = import.meta.env.VITE_CRYPTO_ALGORITHM as string;
const CRYPTO_MODULUS_LENGTH_STR = import.meta.env.VITE_CRYPTO_MODULUS_LENGTH;
const CRYPTO_HASH = import.meta.env.VITE_CRYPTO_HASH as string;

if (!CRYPTO_ALGORITHM || !CRYPTO_MODULUS_LENGTH_STR || !CRYPTO_HASH) {
  throw new Error('[CryptoService] Mandatory environment variables VITE_CRYPTO_ALGORITHM, VITE_CRYPTO_MODULUS_LENGTH, or VITE_CRYPTO_HASH are missing.');
}

const CRYPTO_MODULUS_LENGTH = parseInt(CRYPTO_MODULUS_LENGTH_STR, 10);

const ALGORITHM: RsaHashedKeyGenParams = {
  name: CRYPTO_ALGORITHM,
  modulusLength: CRYPTO_MODULUS_LENGTH,
  publicExponent: new Uint8Array([1, 0, 1]), // 65537
  hash: CRYPTO_HASH,
};

/**
 * Generates a new RSA key pair for this voting session.
 * The private key is non-extractable and stays in memory only.
 */
export async function generateKeyPair(): Promise<VoterKeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    ALGORITHM,
    false, // Private key is NOT extractable — it never leaves the browser
    ['sign', 'verify']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Exports the public key as a JWK JSON string for backend registration.
 */
export async function exportPublicKeyAsJwk(publicKey: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', publicKey);
  return JSON.stringify(jwk);
}

/**
 * Signs vote data using the voter's private key.
 * Returns a base64-encoded signature.
 *
 * @param voteData - The stringified vote object { candidateId }
 * @param privateKey - The non-extractable private key from generateKeyPair()
 */
export async function signVote(voteData: string, privateKey: CryptoKey): Promise<string> {
  const encoded = new TextEncoder().encode(voteData);

  const signatureBuffer = await window.crypto.subtle.sign(
    { name: CRYPTO_ALGORITHM },
    privateKey,
    encoded
  );

  // Encode as base64 for transport
  const bytes = new Uint8Array(signatureBuffer);
  return btoa(String.fromCharCode(...bytes));
}
