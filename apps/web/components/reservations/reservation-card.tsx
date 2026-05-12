import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'pending' | 'confirmed' | 'cancelled'

interface ReservationCardProps {
  id: string
  courtName: string
  clubName: string
  clubSlug: string
  date: string
  startTime: string
  endTime: string
  totalAmount: number
  status: Status
}

const statusLabel: Record<Status, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const statusClass: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function ReservationCard({
  id,
  courtName,
  clubName,
  date,
  startTime,
  endTime,
  totalAmount,
  status,
}: ReservationCardProps) {
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <Link
      href={`/reservations/${id}`}
      className="active:bg-muted/50 block space-y-3 rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-semibold">{courtName}</p>
          <p className="text-muted-foreground truncate text-xs">{clubName}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
            statusClass[status]
          )}
        >
          {statusLabel[status]}
        </span>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{dateLabel}</span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            {startTime.slice(0, 5)} – {endTime.slice(0, 5)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-2.5">
        <span className="text-muted-foreground text-xs">Total pagado</span>
        <span className="text-sm font-semibold">
          ${Number(totalAmount).toLocaleString('es-AR')}
        </span>
      </div>
    </Link>
  )
}
