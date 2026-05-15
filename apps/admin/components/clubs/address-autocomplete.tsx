'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface AddressResult {
  displayName: string
  address: string
  city: string
  province: string
  lat: number
  lng: number
}

interface Props {
  defaultValue?: string
  placeholder?: string
  required?: boolean
  onSelect: (result: AddressResult) => void
}

function normalizeProvince(state: string): string {
  const s = state.toLowerCase()
  if (s.includes('ciudad autónoma') || s.includes('caba')) return 'CABA'
  if (s.includes('buenos aires')) return 'Buenos Aires'
  if (s.includes('córdoba') || s.includes('cordoba')) return 'Córdoba'
  if (s.includes('santa fe')) return 'Santa Fe'
  if (s.includes('mendoza')) return 'Mendoza'
  if (s.includes('tucumán') || s.includes('tucuman')) return 'Tucumán'
  if (s.includes('entre ríos') || s.includes('entre rios')) return 'Entre Ríos'
  if (s.includes('salta')) return 'Salta'
  if (s.includes('misiones')) return 'Misiones'
  if (s.includes('chaco')) return 'Chaco'
  if (s.includes('corrientes')) return 'Corrientes'
  if (s.includes('santiago del estero')) return 'Santiago del Estero'
  if (s.includes('san juan')) return 'San Juan'
  if (s.includes('jujuy')) return 'Jujuy'
  if (s.includes('río negro') || s.includes('rio negro')) return 'Río Negro'
  if (s.includes('neuquén') || s.includes('neuquen')) return 'Neuquén'
  if (s.includes('formosa')) return 'Formosa'
  if (s.includes('chubut')) return 'Chubut'
  if (s.includes('san luis')) return 'San Luis'
  if (s.includes('la rioja')) return 'La Rioja'
  if (s.includes('catamarca')) return 'Catamarca'
  if (s.includes('la pampa')) return 'La Pampa'
  if (s.includes('santa cruz')) return 'Santa Cruz'
  if (s.includes('tierra del fuego')) return 'Tierra del Fuego'
  return state
}

export function AddressAutocomplete({ defaultValue = '', placeholder, required, onSelect }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<AddressResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 4) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value + ', Argentina')}&format=json&limit=5&countrycodes=ar&addressdetails=1`
        const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
        const data: any[] = await res.json()
        const parsed: AddressResult[] = data.map((item) => {
          const a = item.address ?? {}
          const street = [a.road, a.house_number].filter(Boolean).join(' ')
          const city = a.city ?? a.town ?? a.village ?? a.suburb ?? a.municipality ?? ''
          return {
            displayName: item.display_name,
            address: street || item.display_name.split(',')[0],
            city,
            province: normalizeProvince(a.state ?? a.province ?? ''),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }
        })
        setResults(parsed)
        setOpen(parsed.length > 0)
      } catch {
        // silent fail — user can still type manually
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function handleSelect(result: AddressResult) {
    setQuery(result.address)
    setOpen(false)
    setResults([])
    onSelect(result)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? 'Av. Corrientes 1234'}
        required={required}
        autoComplete="off"
      />
      {loading && (
        <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
          Buscando...
        </span>
      )}
      {open && (
        <ul className="bg-background absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg">
          {results.map((r, i) => (
            <li key={i} className="border-b last:border-0">
              <button
                type="button"
                className="hover:bg-accent flex w-full items-start gap-2.5 px-3 py-2.5 text-left"
                onClick={() => handleSelect(r)}
              >
                <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <span className="line-clamp-2 text-sm">{r.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
