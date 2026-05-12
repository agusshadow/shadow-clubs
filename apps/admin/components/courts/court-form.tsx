'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Tables } from '@shadow-clubs/supabase'

type Court = Tables<'courts'>

const sports = [
  { value: 'football', label: 'Fútbol' },
  { value: 'tennis', label: 'Tenis' },
  { value: 'paddle', label: 'Pádel' },
  { value: 'basketball', label: 'Básquet' },
  { value: 'volleyball', label: 'Vóley' },
  { value: 'squash', label: 'Squash' },
  { value: 'other', label: 'Otro' },
]

const surfaces = [
  { value: 'grass', label: 'Césped natural' },
  { value: 'synthetic_grass', label: 'Césped sintético' },
  { value: 'clay', label: 'Polvo de ladrillo' },
  { value: 'hard', label: 'Hormigón' },
  { value: 'wood', label: 'Madera' },
  { value: 'concrete', label: 'Cemento' },
  { value: 'other', label: 'Otro' },
]

interface CourtFormProps {
  court?: Court
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | undefined>
  submitLabel?: string
}

export function CourtForm({ court, action, submitLabel = 'Guardar' }: CourtFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isIndoor, setIsIndoor] = useState(court?.is_indoor ?? false)
  const [isActive, setIsActive] = useState(court?.is_active ?? true)
  const [sport, setSport] = useState(court?.sport ?? '')
  const [surface, setSurface] = useState(court?.surface ?? '')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('sport', sport)
    formData.set('surface', surface)
    formData.set('is_indoor', String(isIndoor))
    formData.set('is_active', String(isActive))
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-destructive rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nombre de la cancha *</Label>
          <Input id="name" name="name" defaultValue={court?.name} placeholder="Cancha 1" required />
        </div>

        <div className="space-y-2">
          <Label>Deporte *</Label>
          <Select value={sport} onValueChange={setSport} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná un deporte" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Superficie *</Label>
          <Select value={surface} onValueChange={setSurface} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná una superficie" />
            </SelectTrigger>
            <SelectContent>
              {surfaces.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacidad (jugadores)</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            max={50}
            defaultValue={court?.capacity ?? 2}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={court?.description ?? ''}
            rows={2}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <div className="flex items-center gap-3">
          <Switch id="is_indoor" checked={isIndoor} onCheckedChange={setIsIndoor} />
          <Label htmlFor="is_indoor">Cubierta</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="is_active">Cancha activa</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || !sport || !surface}>
          {isPending ? 'Guardando...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
