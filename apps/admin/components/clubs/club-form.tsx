'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { LocationPicker } from './location-picker'
import { AddressAutocomplete, type AddressResult } from './address-autocomplete'
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
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: club?.lat ?? null,
    lng: club?.lng ?? null,
  })
  const [geocoding, setGeocoding] = useState(false)
  const [addressFields, setAddressFields] = useState({
    address: club?.address ?? '',
    city: club?.city ?? '',
    province: club?.province ?? 'Buenos Aires',
  })
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  function handleAddressSelect(result: AddressResult) {
    setAddressFields({
      address: result.address,
      city: result.city,
      province: result.province || 'Buenos Aires',
    })
    setCoords({ lat: result.lat, lng: result.lng })
  }

  async function geocodeFromAddress() {
    const form = formRef.current
    if (!form) return
    const address = (form.elements.namedItem('address') as HTMLInputElement)?.value
    const city = (form.elements.namedItem('city') as HTMLInputElement)?.value
    const province = (form.elements.namedItem('province') as HTMLInputElement)?.value
    const query = [address, city, province, 'Argentina'].filter(Boolean).join(', ')
    if (!query.trim()) return

    setGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (data[0]) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
      }
    } catch {
      // silently fail — user can place pin manually
    } finally {
      setGeocoding(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('is_active', String(isActive))
    // Ensure coords from state override any stale hidden inputs
    formData.set('lat', coords.lat != null ? String(coords.lat) : '')
    formData.set('lng', coords.lng != null ? String(coords.lng) : '')
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
          <AddressAutocomplete
            defaultValue={addressFields.address}
            required
            onSelect={handleAddressSelect}
          />
          <input type="hidden" name="address" value={addressFields.address} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            name="city"
            value={addressFields.city}
            onChange={(e) => setAddressFields((f) => ({ ...f, city: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provincia *</Label>
          <Input
            id="province"
            name="province"
            value={addressFields.province}
            onChange={(e) => setAddressFields((f) => ({ ...f, province: e.target.value }))}
            required
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

        <div className="sm:col-span-2">
          <LocationPicker
            lat={coords.lat}
            lng={coords.lng}
            onChange={(lat, lng) => setCoords({ lat, lng })}
            onGeocode={geocodeFromAddress}
            geocoding={geocoding}
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
