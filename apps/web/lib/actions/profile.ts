'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(50),
  last_name: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
})

export async function updateProfile(_: unknown, formData: FormData) {
  const parsed = profileSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name') || undefined,
    phone: formData.get('phone') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id)

  if (error) return { error: 'Error al guardar los cambios' }

  revalidatePath('/profile')
  return { success: true }
}
