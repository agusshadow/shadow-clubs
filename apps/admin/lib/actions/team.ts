'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const inviteSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(50),
  last_name: z.string().min(1, 'El apellido es requerido').max(50),
  email: z.string().email('Email inválido'),
})

async function canManageTeam(clubId: string): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('platform_role')
    .eq('id', user.id)
    .single()

  if (profile?.platform_role === 'platform_admin') return true

  const { count } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('profile_id', user.id)
    .eq('role', 'club_owner')

  return (count ?? 0) > 0
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

export async function inviteMember(_: unknown, formData: FormData) {
  const clubId = formData.get('club_id') as string
  if (!clubId) return { error: 'Club no especificado' }

  const allowed = await canManageTeam(clubId)
  if (!allowed) return { error: 'No tenés permisos para gestionar el equipo' }

  const parsed = inviteSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { first_name, last_name, email } = parsed.data
  const supabase = createServiceClient()

  const { data: clubData } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  const clubName = clubData?.name ?? 'el club'

  // Find or create the user
  let userId: string
  let isNewUser = false

  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: randomBytes(16).toString('hex'),
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })

  if (createError) {
    if (
      createError.message.includes('already registered') ||
      createError.message.includes('already been registered')
    ) {
      const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const existing = users?.users.find((u) => u.email === email)
      if (!existing) return { error: 'No se pudo encontrar la cuenta existente' }
      userId = existing.id
    } else {
      return { error: 'Error al crear la cuenta. Intentá de nuevo.' }
    }
  } else {
    userId = authData.user.id
    isNewUser = true
    await supabase.from('profiles').update({ first_name, last_name }).eq('id', userId)
  }

  // Check if already a member
  const { count: alreadyMember } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('profile_id', userId)

  if ((alreadyMember ?? 0) > 0) {
    return { error: 'Esta persona ya es miembro del equipo' }
  }

  const { error: memberError } = await supabase.from('club_members').insert({
    club_id: clubId,
    profile_id: userId,
    role: 'club_administrator',
  })

  if (memberError) return { error: 'Error al agregar al equipo. Intentá de nuevo.' }

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.shadowclubs.com.ar'

  if (isNewUser) {
    await sendEmail(
      email,
      `Te invitaron al equipo de ${clubName} — Shadow Clubs`,
      `<p>Hola ${first_name},</p>
       <p>Fuiste agregado como administrador de <strong>${clubName}</strong> en Shadow Clubs.</p>
       <p>Tu cuenta fue creada con este email. Ingresá al panel y actualizá tu contraseña desde tu perfil.</p>
       <p><a href="${adminUrl}/login">Ingresar al panel</a></p>
       <p>Saludos,<br/>El equipo de Shadow Clubs</p>`
    )
  } else {
    await sendEmail(
      email,
      `Te agregaron al equipo de ${clubName} — Shadow Clubs`,
      `<p>Hola ${first_name},</p>
       <p>Tu cuenta fue agregada como administrador de <strong>${clubName}</strong> en Shadow Clubs.</p>
       <p>Ya podés gestionar reservas y canchas desde el panel.</p>
       <p><a href="${adminUrl}/login">Ingresar al panel</a></p>
       <p>Saludos,<br/>El equipo de Shadow Clubs</p>`
    )
  }

  revalidatePath(`/clubs/${clubId}/team`)
  return { success: true }
}

export async function removeMember(memberId: string, clubId: string): Promise<void> {
  const allowed = await canManageTeam(clubId)
  if (!allowed) redirect(`/clubs/${clubId}/team`)

  const supabase = createServiceClient()

  const { data: member } = await supabase
    .from('club_members')
    .select('role')
    .eq('id', memberId)
    .single()

  if (!member) redirect(`/clubs/${clubId}/team`)

  // Never remove a club_owner via this action (use approveApplication / manual DB for that)
  if (member.role === 'club_owner') redirect(`/clubs/${clubId}/team`)

  await supabase.from('club_members').delete().eq('id', memberId)

  revalidatePath(`/clubs/${clubId}/team`)
  redirect(`/clubs/${clubId}/team`)
}
