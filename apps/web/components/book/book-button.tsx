'use client'

import { useFormStatus } from 'react-dom'

export function BookButton({ total }: { total: number }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground w-full rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-70"
    >
      {pending ? 'Procesando...' : `Pagar $${total.toLocaleString('es-AR')} con Mercado Pago`}
    </button>
  )
}
