import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClubForm } from '@/components/clubs/club-form'
import { CancellationPolicyForm } from '@/components/clubs/cancellation-policy-form'
import { updateClub } from '@/lib/actions/clubs'
import { upsertCancellationPolicy } from '@/lib/actions/policies'
import { Separator } from '@/components/ui/separator'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClubSettingsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: club }, { data: policy }] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', id).single(),
    supabase
      .from('club_cancellation_policies')
      .select('hours_before_start, refund_type, refund_percentage, is_active')
      .eq('club_id', id)
      .eq('is_active', true)
      .maybeSingle(),
  ])

  if (!club) notFound()

  const clubAction = updateClub.bind(null, id)
  const policyAction = upsertCancellationPolicy.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Información general</h2>
          <p className="text-muted-foreground text-sm">Editá los datos del club</p>
        </div>
        <ClubForm club={club} action={clubAction} submitLabel="Guardar cambios" />
      </section>

      <Separator />

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Política de cancelación</h2>
          <p className="text-muted-foreground text-sm">
            Definí hasta cuántas horas antes puede cancelar un usuario y qué reembolso recibe.
          </p>
        </div>
        <CancellationPolicyForm clubId={id} policy={policy ?? null} action={policyAction} />
      </section>
    </div>
  )
}
