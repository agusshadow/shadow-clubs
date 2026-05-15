'use client'

import dynamic from 'next/dynamic'
import { MapPin, LocateFixed, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LocationPickerMap = dynamic(
  () => import('./location-picker-map').then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="bg-muted h-full w-full animate-pulse" /> }
)

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
  onGeocode?: () => void
  geocoding?: boolean
}

export function LocationPicker({ lat, lng, onChange, onGeocode, geocoding }: Props) {
  function handleGeolocate() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => onChange(pos.coords.latitude, pos.coords.longitude),
      () => {}
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Ubicación en el mapa</p>
        <div className="flex gap-2">
          {onGeocode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGeocode}
              disabled={geocoding}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              {geocoding ? 'Buscando...' : 'Buscar dirección'}
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleGeolocate}>
            <LocateFixed className="mr-1.5 h-3.5 w-3.5" />
            Mi ubicación
          </Button>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden rounded-xl border">
        <LocationPickerMap lat={lat} lng={lng} onChange={onChange} />
        {!lat && !lng && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 flex items-center gap-2 rounded-lg px-3 py-2 text-sm shadow backdrop-blur-sm">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">
                Hacé clic en el mapa para marcar la ubicación
              </span>
            </div>
          </div>
        )}
      </div>

      {lat != null && lng != null && (
        <p className="text-muted-foreground font-mono text-xs">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}

      <input type="hidden" name="lat" value={lat ?? ''} />
      <input type="hidden" name="lng" value={lng ?? ''} />
    </div>
  )
}
