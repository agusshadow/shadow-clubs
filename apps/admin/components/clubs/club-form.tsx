'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Tables } from '@shadow-clubs/supabase'

type Club = Tables<'clubs'>

interface ClubFormProps {
  club?: Club
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | undefined>
  submitLabel?: string
}

export function ClubForm({ club, action, submitLabel = 'Guardar' }: ClubFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(club?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
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
          <Label htmlFor="name">Nombre del club *</Label>
          <Input id="name" name="name" defaultValue={club?.name} required />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={club?.description ?? ''}
            rows={3}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Dirección *</Label>
          <Input id="address" name="address" defaultValue={club?.address} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad *</Label>
          <Input id="city" name="city" defaultValue={club?.city} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provincia *</Label>
          <Input
            id="province"
            name="province"
            defaultValue={club?.province ?? 'Buenos Aires'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lat">Latitud</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="0.000001"
            defaultValue={club?.lat?.toString() ?? ''}
            placeholder="-34.603722"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lng">Longitud</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="0.000001"
            defaultValue={club?.lng?.toString() ?? ''}
            placeholder="-58.381592"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={club?.phone ?? ''}
            placeholder="+54 11 1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email de contacto</Label>
          <Input id="email" name="email" type="email" defaultValue={club?.email ?? ''} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Sitio web</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={club?.website ?? ''}
            placeholder="https://"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="is_active">Club activo</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
