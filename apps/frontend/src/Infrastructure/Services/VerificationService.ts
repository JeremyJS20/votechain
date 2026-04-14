import axios from 'axios'
import HttpClient from '../HttpClient'

export class VerificationService {
  private static readonly API_URL = '/verification'

  /**
   * Triggers the backend to create a new Didit verification session.
   */
  static async createSession(language?: string, userId?: string, cedula?: string): Promise<{ session_id: string, session_token: string, verification_url: string }> {
    try {
      const response = await HttpClient.post(`${this.API_URL}/create-session`, { language, userId, cedula })
      return response.data
    } catch (error: any) {
      console.error('[VerificationService Frontend] Failed to ping backend for session creation:', error)
      throw new Error(error.response?.data?.error || 'Failed to create session')
    }
  }

  /**
   * Polls the backend for verification status.
   */
  static async getVerificationStatus(userId: string): Promise<{ verified: boolean, status: string }> {
    try {
      const response = await HttpClient.get(`${this.API_URL}/status`, {
        params: { userId }
      })
      return response.data
    } catch (error: any) {
      console.error('[VerificationService Frontend] Failed to get verification status:', error)
      throw new Error(error.response?.data?.error || 'Failed to fetch status')
    }
  }
}
