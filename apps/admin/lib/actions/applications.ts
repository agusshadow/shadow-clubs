'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { applicationSchema } from '@/lib/validators/applications'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uniqueSlug(base: string) {
  const supabase = createServiceClient()
  let slug = slugify(base)
  let i = 0
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`
    const { data } = await supabase.from('clubs').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    i++
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'Shadow Clubs <noreply@shadowclubs.com.ar>',
      to: [to],
      subject,
      html,
    }),
  }).catch(() => null)
}

export async function createApplication(_: unknown, formData: FormData) {
  const parsed = applicationSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    club_name: formData.get('club_name'),
    address: formData.get('address'),
    city: formData.get('city'),
    province: formData.get('province'),
    sport_types: formData.getAll('sport_types'),
    additional_info: formData.get('additional_info') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    club_name,
    address,
    city,
    province,
    sport_types,
    additional_info,
  } = parsed.data

  const authSupabase = await createClient()
  const { data: authData, error: authError } = await authSupabase.auth.signUp({
    email,
    password,
    options: { data: { first_name, last_name } },
  })

  if (authError) return { error: 'Error al crear la cuenta. Intentá de nuevo.' }

  // signUp returns an empty identities array when the email is already registered
  if (!authData.user || authData.user.identities?.length === 0) {
    return { error: 'Ya existe una cuenta con ese email' }
  }

  const supabase = createServiceClient()

  const userId = authData.user.id

  await supabase.from('profiles').update({ first_name, last_name, phone }).eq('id', userId)

  const { error: appError } = await supabase.from('club_applications').insert({
    applicant_id: userId,
    club_name,
    address,
    city,
    province,
    sport_types,
    phone,
    additional_info: additional_info ?? null,
  })

  if (appError) {
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Error al enviar la solicitud. Intentá de nuevo.' }
  }

  await sendEmail(
    email,
    'Solicitud recibida — Shadow Clubs',
    `<p>Hola ${first_name},</p>
     <p>Recibimos tu solicitud para registrar <strong>${club_name}</strong> en Shadow Clubs.</p>
     <p>La revisaremos en las próximas 24-48hs y te avisaremos por este mismo email.</p>
     <p>Saludos,<br/>El equipo de Shadow Clubs</p>`
  )

  return { step: 'verify' as const, email }
}

export async function approveApplication(id: string): Promise<void> {
  const authSupabase = await createClient()
  const {
    data: { user },
  } = await authSupabase.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServiceClient()

  const { data: app } = await supabase.from('club_applications').select('*').eq('id', id).single()

  if (!app || app.status !== 'pending') redirect('/applications')

  const slug = await uniqueSlug(app.club_name)

  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .insert({
      name: app.club_name,
      slug,
      address: app.address,
      city: app.city,
      province: app.province,
      phone: app.phone,
      is_active: true,
    })
    .select('id')
    .single()

  if (clubError || !club) redirect('/applications')

  await supabase.from('club_members').insert({
    club_id: club.id,
    profile_id: app.applicant_id,
    role: 'club_owner',
  })

  await supabase
    .from('club_applications')
    .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  const { data: applicantAuth } = await supabase.auth.admin.getUserById(app.applicant_id)
  const email = applicantAuth.user?.email
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', app.applicant_id)
    .single()

  if (email) {
    await sendEmail(
      email,
      '¡Tu club fue aprobado! — Shadow Clubs',
      `<p>Hola ${profile?.first_name ?? ''},</p>
       <p>¡Buenas noticias! Tu solicitud para <strong>${app.club_name}</strong> fue aprobada.</p>
       <p>Ya podés ingresar al panel de administración y configurar tu club: agregar canchas, horarios y conectar tu cuenta de Mercado Pago para empezar a recibir reservas.</p>
       <p><a href="${process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.shadowclubs.com.ar'}/login">Ingresar al panel</a></p>
       <p>Saludos,<br/>El equipo de Shadow Clubs</p>`
    )
  }

  revalidatePath('/applications')
  revalidatePath('/clubs')
  redirect('/applications')
}

export async function rejectApplication(id: string, reason: string): Promise<void> {
  const authSupabase = await createClient()
  const {
    data: { user },
  } = await authSupabase.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServiceClient()

  const { data: app } = await supabase
    .from('club_applications')
    .select('*, profiles!applicant_id(first_name)')
    .eq('id', id)
    .single()

  if (!app || app.status !== 'pending') redirect('/applications')

  await supabase
    .from('club_applications')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  const { data: applicantAuth } = await supabase.auth.admin.getUserById(app.applicant_id)
  const email = applicantAuth.user?.email
  const firstName = (app.profiles as { first_name: string } | null)?.first_name ?? ''

  if (email) {
    await sendEmail(
      email,
      'Solicitud no aprobada — Shadow Clubs',
      `<p>Hola ${firstName},</p>
       <p>Lamentablemente tu solicitud para registrar <strong>${app.club_name}</strong> no fue aprobada.</p>
       ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
       <p>Si tenés dudas o querés volver a intentarlo con información actualizada, respondé este email.</p>
       <p>Saludos,<br/>El equipo de Shadow Clubs</p>`
    )
  }

  revalidatePath('/applications')
  redirect('/applications')
}
