'use client'

import { useTransition } from 'react'
import { cancelReservation } from '@/lib/actions/reservations'

export function CancelButton({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    if (!confirm('¿Estás seguro de que querés cancelar esta reserva?')) return
    startTransition(() => {
      cancelReservation(reservationId)
    })
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="border-destructive text-destructive w-full rounded-xl border py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
    >
      {isPending ? 'Cancelando...' : 'Cancelar reserva'}
    </button>
  )
}
