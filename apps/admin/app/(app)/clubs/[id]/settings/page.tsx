import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClubForm } from '@/components/clubs/club-form'
import { updateClub } from '@/lib/actions/clubs'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClubSettingsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase.from('clubs').select('*').eq('id', id).single()

  if (!club) notFound()

  const action = updateClub.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Configuración general</h2>
        <p className="text-muted-foreground text-sm">Editá los datos del club</p>
      </div>
      <ClubForm club={club} action={action} submitLabel="Guardar cambios" />
    </div>
  )
}
