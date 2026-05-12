import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmed: 'default',
  pending: 'outline',
  cancelled: 'destructive',
}

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
}

export default async function ClubReservationsPage({ params, searchParams }: Props) {
  const { id } = await params
  const { status } = await searchParams

  const supabase = await createClient()

  // Verify club exists (layout already checks this, but guard anyway)
  const { data: club } = await supabase.from('clubs').select('id').eq('id', id).single()
  if (!club) notFound()

  let query = supabase
    .from('reservations')
    .select(
      `id, date, start_time, end_time, status, total_amount,
       courts!inner(name, club_id),
       profiles(first_name, last_name)`
    )
    .eq('courts.club_id', id)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(200)

  const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'] as const
  type ReservationStatus = (typeof validStatuses)[number]
  if (status && (validStatuses as readonly string[]).includes(status)) {
    query = query.eq('status', status as ReservationStatus)
  }

  const { data: reservations } = await query

  const all = reservations ?? []

  const counts = {
    all: all.length,
    confirmed: all.filter((r) => r.status === 'confirmed').length,
    pending: all.filter((r) => r.status === 'pending').length,
    cancelled: all.filter((r) => r.status === 'cancelled').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reservas</h2>
          <p className="text-muted-foreground text-sm">
            {all.length} reserva{all.length !== 1 ? 's' : ''} encontrada
            {all.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 text-sm">
          {([undefined, 'confirmed', 'pending', 'cancelled'] as const).map((s) => {
            const label = s ? statusLabel[s] : `Todas (${counts.all})`
            const href = s ? `?status=${s}` : '?'
            const active = (status ?? undefined) === s
            return (
              <a
                key={s ?? 'all'}
                href={href}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>
      </div>

      {all.length === 0 ? (
        <div className="rounded-xl border py-16 text-center">
          <p className="text-muted-foreground text-sm">No hay reservas para mostrar</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.map((r) => {
                const court = r.courts as { name: string } | null
                const profile = r.profiles as {
                  first_name: string | null
                  last_name: string | null
                } | null
                const userName = profile?.first_name
                  ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
                  : '—'
                const dateLabel = new Date(r.date + 'T12:00:00').toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{userName}</TableCell>
                    <TableCell>{court?.name ?? '—'}</TableCell>
                    <TableCell className="capitalize">{dateLabel}</TableCell>
                    <TableCell>
                      {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[r.status] ?? 'outline'}>
                        {statusLabel[r.status] ?? r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(r.total_amount).toLocaleString('es-AR')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
