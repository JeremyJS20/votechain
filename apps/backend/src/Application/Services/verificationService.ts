import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export class VerificationService {
  /**
   * Creates a new Didit session for the user.
   */
  async createSession(language?: string, userId?: string, cedula?: string): Promise<{ session_id: string, session_token: string, verification_url: string }> {
    const apiKey = process.env.DIDIT_API_KEY
    const workflowId = process.env.DIDIT_WORKFLOW_ID

    if (!apiKey || !workflowId) {
      console.warn('[VerificationService] Missing DIDIT_API_KEY or DIDIT_WORKFLOW_ID. Using MOCK mode.')
      return {
        session_id: 'mock-session-' + Date.now(),
        session_token: 'mock-session-token-' + Date.now(),
        verification_url: process.env.MOCK_VERIFICATION_URL!,
      }
    }

    // 1. Generate internal hash for the ID (PII protection)
    let cedulaHash: string | null = null
    if (cedula) {
      cedulaHash = crypto.createHash('sha256').update(cedula).digest('hex')
    }

    try {
      const payload: any = {
        workflow_id: workflowId,
        language: language || 'en',
        vendor_data: userId, // Pass userId so it returns in webhook
        callback: process.env.DIDIT_CALLBACK_URL!,
        callback_method: 'both'
      }

      // 2. Pass expected details to Didit for matching (Advanced Matching)
      if (cedula) {
        payload.expected_details = {
          identification_number: cedula
        }
      }

      const apiUrl = process.env.DIDIT_API_URL!
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[VerificationService] Failed to create Didit session:', errorText)
        throw new Error(`Didit API error: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('[VerificationService] Didit Session Created:', data)

      // 3. Pre-persist the session and hash (Status: In Review)
      // This links the biometric session to the validated census data PII-blindly
      if (userId && data.id) {
        await prisma.verification.upsert({
          where: { userId },
          update: {
            sessionId: data.id,
            status: 'In Review',
            cedulaHash,
            provider: 'didit'
          },
          create: {
            userId,
            sessionId: data.id,
            status: 'In Review',
            cedulaHash,
            provider: 'didit'
          }
        })
      }

      return {
        session_id: data.id,
        session_token: data.session_token,
        verification_url: data.verification_url || data.url, // Handle both field name variants
      }
    } catch (error) {
      console.error('[VerificationService] Error creating session:', error)
      throw error
    }
  }

  /**
   * Checks if a user is officially verified in the backend registry.
   * Returns true ONLY if status is "Approved".
   */
  async isUserVerified(userId: string): Promise<boolean> {
    const verification = await prisma.verification.findUnique({
      where: { userId }
    })
    return verification?.status === 'Approved'
  }

  /**
   * Returns verbose verification status for polling.
   */
  async getVerificationStatus(userId: string) {
    if (!userId) throw new Error('userId is required')

    let verification = await prisma.verification.findUnique({
      where: { userId }
    })

    // MOCK MODE FALLBACK: If no record exists and we are in mock mode, auto-approve
    if (!verification && !process.env.DIDIT_API_KEY) {
      console.log(`[VerificationService] Mock Mode: Auto-approving user ${userId}`)
      verification = await prisma.verification.upsert({
        where: { userId },
        update: { status: 'Approved', sessionId: 'mock-session' },
        create: { userId, status: 'Approved', sessionId: 'mock-session' }
      })
    }

    return {
      verified: verification?.status === 'Approved',
      status: verification?.status || 'Not Started',
      decisionAt: verification?.decisionAt,
      provider: verification?.provider || 'didit'
    }
  }

  /**
   * Verifies the cryptographic signature of the incoming webhook.
   */
  verifyWebhookSignature(headers: Record<string, any>, body: any): boolean {
    const secret = process.env.DIDIT_WEBHOOK_SECRET
    if (!secret) return true // Allow if secret is not configured (dev mode)

    const signature = headers['x-signature-simple']
    if (!signature) {
      console.warn('[VerificationService] Missing X-Signature-Simple header')
      return false
    }

    // Didit v3 X-Signature-Simple is HMAC-SHA256 of session_id|status|created_at
    const sessionId = body.id || body.session_id
    const status = body.status
    const createdAt = body.created_at

    const data = `${sessionId}|${status}|${createdAt}`
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex')

    return signature === expected
  }

  /**
   * Handles the secure webhook from Didit.
   * STORES ONLY ESSENTIAL DATA for security and compliance.
   */
  async handleWebhook(body: any): Promise<void> {
    // 1. EXTRACT ONLY REQUIRED FIELDS
    const sessionId = body.session_id || body.id
    const status = body.status // "Approved" | "Declined" | "In Review"
    const userId = body.vendor_data // citizen unique ID
    const decisionAtStr = body.decision?.created_at || body.created_at

    // 2. VALIDATE INPUT
    if (!userId) {
      console.warn('[VerificationService] Webhook ignored: Missing userId (vendor_data)')
      return
    }

    if (!status || !sessionId) {
      console.warn('[VerificationService] Webhook ignored: Incomplete data')
      return
    }

    // 3. IDENTITY MATCHING LOGIC (Expected Details Match)
    // We strictly enforce that the identity verified by Didit matches our records.
    let finalStatus = status
    const dbValidation = body.decision?.database_validations?.[0]

    if (dbValidation) {
      const isMatch = dbValidation.match_type === 'full_match'
      const isDbApproved = dbValidation.status === 'Approved'

      if (!isMatch || !isDbApproved) {
        console.warn(`[VerificationService] IDENTITY MISMATCH for User ${userId}. Match Type: ${dbValidation.match_type}, DB Status: ${dbValidation.status}`)
        finalStatus = 'Declined' // Hard override if the person behind the camera isn't who they say they are
      }
    }

    // 4. GENERATE PAYLOAD HASH (INTEGRITY TRACE)
    // We store a hash of the full body for audit purposes without storing PII
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(body))
      .digest('hex')

    const decisionAt = decisionAtStr ? new Date(decisionAtStr) : new Date()

    // 5. UPSERT INTO DATABASE
    await prisma.verification.upsert({
      where: { userId },
      update: {
        status: finalStatus,
        sessionId,
        decisionAt,
        payloadHash
      },
      create: {
        userId,
        status: finalStatus,
        sessionId,
        decisionAt,
        provider: "didit",
        payloadHash
      }
    })

    console.log('[VerificationService] Verification updated (Match Enforced):', {
      userId,
      status: finalStatus,
      sessionId
    })
  }
}

export const verificationService = new VerificationService()
