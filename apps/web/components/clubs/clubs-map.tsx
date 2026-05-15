'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, X } from 'lucide-react'

export type MapClub = {
  id: string
  name: string
  slug: string
  city: string
  cover_url: string | null
  lat: number | null
  lng: number | null
}

const BUENOS_AIRES: [number, number] = [-34.6037, -58.3816]

function pinIcon(active = false) {
  const bg = active ? '#2563eb' : '#18181b'
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36"
        style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.4));cursor:pointer;display:block">
      <path d="M12 0C7.16 0 3.27 3.89 3.27 8.73 3.27 15.27 12 28 12 28S20.73 15.27 20.73 8.73C20.73 3.89 16.84 0 12 0z" fill="${bg}"/>
      <circle cx="12" cy="8.5" r="4" fill="white"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  })
}

const userDotIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:2.5px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export function ClubsMap({ clubs }: { clubs: MapClub[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [selected, setSelected] = useState<MapClub | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: false }).setView(BUENOS_AIRES, 12)
    mapRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    clubs
      .filter((c) => c.lat != null && c.lng != null)
      .forEach((club) => {
        const marker = L.marker([club.lat!, club.lng!], { icon: pinIcon() }).addTo(map)
        markersRef.current.set(club.id, marker)
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          setSelected(club)
        })
      })

    map.on('click', () => setSelected(null))

    navigator.geolocation?.getCurrentPosition((pos) => {
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
      L.marker(coords, { icon: userDotIcon }).addTo(map)
      map.flyTo(coords, 13, { duration: 1.2 })
    })

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [clubs])

  // Swap pin color when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(pinIcon(selected?.id === id))
    })
  }, [selected])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {selected && (
        <div className="animate-in slide-in-from-bottom-2 absolute right-4 bottom-4 left-4 z-[1000] duration-150">
          <div className="bg-card overflow-hidden rounded-2xl border shadow-xl">
            {/* Cover image */}
            <div className="bg-muted relative aspect-[16/7] w-full overflow-hidden">
              {selected.cover_url ? (
                <img
                  src={selected.cover_url}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground text-4xl font-bold opacity-20">
                    {selected.name[0]}
                  </span>
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Info + CTA */}
            <div className="p-4">
              <p className="truncate font-semibold">{selected.name}</p>
              <p className="text-muted-foreground text-sm">{selected.city}</p>
              <button
                onClick={() => router.push(`/clubs/${selected.slug}`)}
                className="bg-primary text-primary-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
              >
                Ver detalle
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
