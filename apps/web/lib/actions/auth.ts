'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validators/auth'

export async function login(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'Datos inválidos' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: 'Email o contraseña incorrectos' }

  const redirectTo = formData.get('redirectTo')?.toString() ?? '/'
  redirect(redirectTo)
}

export async function register(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { error: first ?? 'Datos inválidos' }
  }

  const { firstName, lastName, email, password } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  })

  if (error) return { error: error.message }

  return { step: 'verify' as const, email }
}

export async function verifyEmail(_: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  if (!email || !token || token.length < 6) return { error: 'Código inválido' }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  if (error) return { error: 'Código inválido o expirado. Revisá tu email o pedí uno nuevo.' }

  redirect('/')
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
