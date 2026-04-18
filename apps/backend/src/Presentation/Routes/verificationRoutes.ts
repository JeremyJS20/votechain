import { Router } from 'express'
import { createSession, getVerificationStatus, handleWebhook } from '@/Presentation/Controllers/verificationController.js'

export const verificationRouter = Router()

verificationRouter.post('/create-session', createSession)
verificationRouter.get('/status', getVerificationStatus)
verificationRouter.post('/webhook', handleWebhook)
