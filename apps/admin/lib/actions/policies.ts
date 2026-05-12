'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cancellationPolicySchema } from '@/lib/validators/policies'

export async function upsertCancellationPolicy(clubId: string, formData: FormData) {
  const raw = {
    hours_before_start: formData.get('hours_before_start'),
    refund_type: formData.get('refund_type'),
    refund_percentage: formData.get('refund_percentage'),
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = cancellationPolicySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()

  // Check if a policy already exists for this club
  const { data: existing } = await supabase
    .from('club_cancellation_policies')
    .select('id')
    .eq('club_id', clubId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('club_cancellation_policies')
      .update({ ...parsed.data })
      .eq('id', existing.id)
    if (error) return { error: 'Error al guardar la política' }
  } else {
    const { error } = await supabase
      .from('club_cancellation_policies')
      .insert({ club_id: clubId, ...parsed.data })
    if (error) return { error: 'Error al crear la política' }
  }

  revalidatePath(`/clubs/${clubId}/settings`)
  return { success: true }
}
