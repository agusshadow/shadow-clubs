'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendReservationNotification } from '@/lib/notifications'

export async function cancelReservation(reservationId: string): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reservation } = await supabase
    .from('reservations')
    .select('id, status, date, start_time, profile_id')
    .eq('id', reservationId)
    .eq('profile_id', user.id)
    .single()

  if (!reservation) redirect('/reservations')

  if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
    redirect(`/reservations/${reservationId}`)
  }

  // Must be in the future
  const slotStart = new Date(`${reservation.date}T${reservation.start_time}`)
  if (slotStart <= new Date()) redirect(`/reservations/${reservationId}`)

  await supabase
    .from('reservations')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', reservationId)

  sendReservationNotification(reservationId, 'reservation_cancelled').catch((err) =>
    console.error('Notification error:', err)
  )

  revalidatePath('/reservations')
  redirect('/reservations?tab=cancelled')
}
