import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CourtForm } from '@/components/courts/court-form'
import { SlotTemplatesEditor } from '@/components/courts/slot-templates-editor'
import { updateCourt } from '@/lib/actions/courts'

interface Props {
  params: Promise<{ id: string; courtId: string }>
}

export default async function CourtDetailPage({ params }: Props) {
  const { id: clubId, courtId } = await params
  const supabase = await createClient()

  const [{ data: court }, { data: slots }] = await Promise.all([
    supabase.from('courts').select('*').eq('id', courtId).eq('club_id', clubId).single(),
    supabase
      .from('court_slot_templates')
      .select('*')
      .eq('court_id', courtId)
      .order('day_of_week')
      .order('start_time'),
  ])

  if (!court) notFound()

  const action = updateCourt.bind(null, courtId, clubId)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{court.name}</h2>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="slots">Turnos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="pt-4">
          <div className="mx-auto max-w-2xl">
            <CourtForm court={court} action={action} submitLabel="Guardar cambios" />
          </div>
        </TabsContent>

        <TabsContent value="slots" className="pt-4">
          <div className="max-w-xl space-y-2">
            <p className="text-muted-foreground text-sm">
              Configurá los horarios disponibles por día de la semana.
            </p>
            <SlotTemplatesEditor courtId={courtId} clubId={clubId} slots={slots ?? []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
