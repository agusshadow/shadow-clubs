'use server'

import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { applicationSchema } from '@/lib/validators/applications'

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

  const supabase = createServiceClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })

  if (authError) {
    if (
      authError.message.includes('already registered') ||
      authError.message.includes('already been registered')
    ) {
      return { error: 'Ya existe una cuenta con ese email' }
    }
    return { error: 'Error al crear la cuenta. Intentá de nuevo.' }
  }

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

  redirect('/login?registered=1')
}
