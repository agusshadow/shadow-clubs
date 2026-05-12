'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Slot {
  id: string
  start_time: string
  end_time: string
  price_ars: number
  available: boolean
}

interface Props {
  courtId: string
  slots: Slot[]
  selectedDate: string
}

export function DateSlotPicker({ courtId, slots, selectedDate }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', e.target.value)
    router.push(`?${params.toString()}`)
  }

  function handleBook(slotId: string) {
    router.push(`/book/${courtId}?date=${selectedDate}&slotId=${slotId}`)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="date" className="text-sm font-medium">
          Seleccioná una fecha
        </label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-1 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Turnos disponibles</p>

        {slots.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No hay turnos configurados para este día.
          </p>
        )}

        <div className="grid gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              disabled={!slot.available}
              onClick={() => slot.available && handleBook(slot.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                slot.available
                  ? 'hover:bg-accent cursor-pointer'
                  : 'text-muted-foreground cursor-not-allowed opacity-50'
              }`}
            >
              <div>
                <span className="font-mono text-sm font-medium">
                  {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                </span>
                <span className="text-muted-foreground ml-3 text-sm">
                  ${Number(slot.price_ars).toLocaleString('es-AR')}
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  slot.available ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                }`}
              >
                {slot.available ? 'Disponible' : 'Ocupado'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
