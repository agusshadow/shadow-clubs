'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validators/auth'

export async function login(_: unknown, formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email o contraseña incorrectos' }
  }

  redirect('/clubs')
}

export async function verifyEmail(_: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  if (!email || !token || token.length < 6) return { error: 'Código inválido' }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  if (error) return { error: 'Código inválido o expirado. Revisá tu email o pedí uno nuevo.' }

  redirect('/pending')
}

export async function resendCode(_: unknown, formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email inválido' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { error: 'No se pudo reenviar el código. Intentá de nuevo.' }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
