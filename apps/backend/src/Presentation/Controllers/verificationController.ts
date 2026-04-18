import { Request, Response } from 'express'
import { verificationService } from '@/Application/Services/verificationService.js'

export const createSession = async (req: Request, res: Response) => {
  try {
    const { language, userId, cedula } = req.body

    if (!cedula) {
      return res.status(400).json({ error: 'errors.common.field_required' })
    }

    const sessionData = await verificationService.createSession(language, userId, cedula)
    res.json(sessionData)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'errors.common.unexpected' })
  }
}

export const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'errors.common.field_required' })
    const status = await verificationService.getVerificationStatus(userId as string)
    res.json(status)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'errors.common.unexpected' })
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // 1. Verify cryptographic signature from Didit
    const isValid = verificationService.verifyWebhookSignature(req.headers, req.body)
    
    if (!isValid) {
      console.warn('[VerificationController] Unauthorized Webhook Attempt')
      return res.status(401).send('Unauthorized')
    }

    // 2. Process authentic webhook
    await verificationService.handleWebhook(req.body)
    res.status(200).send('OK')
  } catch (error: any) {
    console.error('[VerificationController] Webhook Error:', error)
    res.status(500).send('Error')
  }
}
