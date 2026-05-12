'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { clubSchema } from '@/lib/validators/clubs'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uniqueSlug(base: string, excludeId?: string) {
  const supabase = await createClient()
  let slug = slugify(base)
  let i = 0
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`
    let query = supabase.from('clubs').select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
    i++
  }
}

export async function createClub(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = clubSchema.safeParse({
    ...raw,
    is_active: raw['is_active'] === 'true',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const slug = await uniqueSlug(parsed.data.name)

  const { data, error } = await supabase
    .from('clubs')
    .insert({ ...parsed.data, slug })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clubs')
  redirect(`/clubs/${data.id}`)
}

export async function updateClub(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = clubSchema.safeParse({
    ...raw,
    is_active: raw['is_active'] === 'true',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('clubs').update(parsed.data).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${id}`)
  revalidatePath('/clubs')
  return { success: true }
}
