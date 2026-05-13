'use client'

import { useState, useTransition } from 'react'
import { rejectApplication } from '@/lib/actions/applications'
import { Button } from '@/components/ui/button'

interface Props {
  applicationId: string
}

export function RejectForm({ applicationId }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleReject() {
    startTransition(async () => {
      await rejectApplication(applicationId, reason)
    })
  }

  if (!open) {
    return (
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Rechazar solicitud
      </Button>
    )
  }

  return (
    <div className="border-destructive/30 space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Motivo del rechazo</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Explicá brevemente por qué no se aprueba esta solicitud (opcional)..."
        className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />
      <div className="flex gap-2">
        <Button variant="destructive" disabled={isPending} onClick={handleReject}>
          {isPending ? 'Rechazando...' : 'Confirmar rechazo'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
