import { Resend } from 'resend'

// Singleton — safe to call at module level (only initialised when used)
export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@shadow-clubs.com'
