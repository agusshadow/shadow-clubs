'use client'

import { useState, useTransition } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSlotTemplate, deleteSlotTemplate } from '@/lib/actions/courts'
import type { Tables } from '@shadow-clubs/supabase'

type SlotTemplate = Tables<'court_slot_templates'>

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface Props {
  courtId: string
  clubId: string
  slots: SlotTemplate[]
}

export function SlotTemplatesEditor({ courtId, clubId, slots }: Props) {
  const [activeDay, setActiveDay] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const slotsForDay = slots.filter((s) => s.day_of_week === activeDay)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('day_of_week', String(activeDay))
    startTransition(async () => {
      const result = await createSlotTemplate(courtId, clubId, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setShowAdd(false)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSlotTemplate(id, courtId, clubId)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveDay(i)
              setShowAdd(false)
              setError(null)
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeDay === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {slotsForDay.length === 0 && !showAdd && (
          <p className="text-muted-foreground text-sm">No hay turnos configurados para este día.</p>
        )}

        {slotsForDay.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">
                {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              </span>
              <span className="text-muted-foreground text-sm">
                ${Number(slot.price_ars).toLocaleString('es-AR')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(slot.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {showAdd && (
          <form onSubmit={handleAdd} className="space-y-4 rounded-md border p-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="start_time">Inicio</Label>
                <Input id="start_time" name="start_time" type="time" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end_time">Fin</Label>
                <Input id="end_time" name="end_time" type="time" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price_ars">Precio (ARS)</Label>
                <Input id="price_ars" name="price_ars" type="number" min={0} step={0.01} required />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Agregar turno'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAdd(false)
                  setError(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>

      {!showAdd && (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar turno
        </Button>
      )}
    </div>
  )
}
