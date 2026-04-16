import crypto from 'crypto';

// Configuration from environment variables
if (!process.env.CRYPTO_HASH || !process.env.CRYPTO_ALGORITHM) {
  throw new Error('[CryptoService] Mandatory environment variables CRYPTO_HASH or CRYPTO_ALGORITHM are missing.');
}
const CRYPTO_HASH = process.env.CRYPTO_HASH.toLowerCase().replace('-', '');
const CRYPTO_ALGORITHM = process.env.CRYPTO_ALGORITHM;

/**
 * Verifies an RSA-PSS cryptographic signature from the browser's Web Crypto API.
 *
 * The frontend signs voteData using:
 *   - Algorithm: RSASSA-PKCS1-v1_5 with SHA-256 (configurable via env)
 *   - Private key stored only in browser memory
 *
 * The backend verifies using the stored JWK public key.
 */
export function verifySignature(
  signatureBase64: string,
  data: string,
  publicKeyJwk: string
): boolean {
  try {
    const jwk = JSON.parse(publicKeyJwk);

    // Create public key from JWK
    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });

    // Decode the base64 signature
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');

    // Determine padding based on algorithm (default to PKCS1 v1.5)
    // Note: If adding support for RSA-PSS, this logic should be extended.
    const padding = CRYPTO_ALGORITHM.includes('PSS') 
      ? crypto.constants.RSA_PKCS1_PSS_PADDING 
      : crypto.constants.RSA_PKCS1_PADDING;

    // Verify using configured algorithm and hash
    const isValid = crypto.verify(
      CRYPTO_HASH,
      Buffer.from(data),
      {
        key: publicKey,
        padding: padding,
      },
      signatureBuffer
    );

    return isValid;
  } catch (error) {
    console.error('[CryptoService] Signature verification failed:', error);
    return false;
  }
}

/**
 * Computes a hash of a string using configured algorithm.
 */
export function sha256(input: string): string {
  return crypto.createHash(CRYPTO_HASH).update(input).digest('hex');
}
