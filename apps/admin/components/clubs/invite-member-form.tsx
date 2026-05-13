'use client'

import { useActionState } from 'react'
import { inviteMember } from '@/lib/actions/team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function InviteMemberForm({ clubId }: { clubId: string }) {
  const [state, action, pending] = useActionState(inviteMember, null)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="club_id" value={clubId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" placeholder="Juan" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">Apellido</Label>
          <Input id="last_name" name="last_name" placeholder="Pérez" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="juan@miclub.com" required />
      </div>

      <p className="text-muted-foreground text-xs">
        Se agregará con rol <strong>Administrador</strong>. Recibirá un email de invitación.
      </p>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Invitación enviada correctamente.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Enviando...' : 'Invitar al equipo'}
      </Button>
    </form>
  )
}
