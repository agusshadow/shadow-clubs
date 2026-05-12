'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { courtSchema, slotTemplateSchema } from '@/lib/validators/courts'

export async function createCourt(clubId: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = courtSchema.safeParse({
    ...raw,
    is_indoor: raw['is_indoor'] === 'true',
    is_active: raw['is_active'] !== 'false',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courts')
    .insert({ ...parsed.data, club_id: clubId })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}/courts`)
  redirect(`/clubs/${clubId}/courts/${data.id}`)
}

export async function updateCourt(id: string, clubId: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = courtSchema.safeParse({
    ...raw,
    is_indoor: raw['is_indoor'] === 'true',
    is_active: raw['is_active'] !== 'false',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('courts').update(parsed.data).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}/courts/${id}`)
  return { success: true }
}

export async function createSlotTemplate(courtId: string, clubId: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = slotTemplateSchema.safeParse({
    ...raw,
    is_active: raw['is_active'] !== 'false',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('court_slot_templates')
    .insert({ ...parsed.data, court_id: courtId })

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}/courts/${courtId}`)
  return { success: true }
}

export async function updateSlotTemplate(
  id: string,
  courtId: string,
  clubId: string,
  formData: FormData
) {
  const raw = Object.fromEntries(formData)
  const parsed = slotTemplateSchema.safeParse({
    ...raw,
    is_active: raw['is_active'] !== 'false',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('court_slot_templates').update(parsed.data).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}/courts/${courtId}`)
  return { success: true }
}

export async function deleteSlotTemplate(id: string, courtId: string, clubId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('court_slot_templates').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}/courts/${courtId}`)
  return { success: true }
}
