'use client'

import { useTransition } from 'react'
import { removeMember } from '@/lib/actions/team'
import { Button } from '@/components/ui/button'

interface Props {
  memberId: string
  clubId: string
}

export function RemoveMemberButton({ memberId, clubId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!confirm('¿Estás seguro de que querés eliminar a esta persona del equipo?')) return
    startTransition(async () => {
      await removeMember(memberId, clubId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleRemove}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </Button>
  )
}
