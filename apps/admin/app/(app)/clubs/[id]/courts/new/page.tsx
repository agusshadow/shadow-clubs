import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourtForm } from '@/components/courts/court-form'
import { createCourt } from '@/lib/actions/courts'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NewCourtPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase.from('clubs').select('id').eq('id', id).single()
  if (!club) notFound()

  const action = createCourt.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Nueva cancha</h2>
        <p className="text-muted-foreground text-sm">
          Completá los datos para agregar una cancha al club
        </p>
      </div>
      <CourtForm action={action} submitLabel="Crear cancha" />
    </div>
  )
}
