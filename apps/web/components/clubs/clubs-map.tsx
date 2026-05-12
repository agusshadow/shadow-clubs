'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export type MapClub = {
  id: string
  name: string
  slug: string
  lat: number | null
  lng: number | null
}

const BUENOS_AIRES: [number, number] = [-34.6037, -58.3816]

function clubIcon(name: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#18181b;color:white;border-radius:9999px;padding:3px 10px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:1.5px solid white;cursor:pointer">${name}</div>`,
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:2.5px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export function ClubsMap({ clubs }: { clubs: MapClub[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: false }).setView(BUENOS_AIRES, 12)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://osm.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    clubs
      .filter((c) => c.lat != null && c.lng != null)
      .forEach((club) => {
        L.marker([club.lat!, club.lng!], { icon: clubIcon(club.name) })
          .addTo(map)
          .on('click', () => router.push(`/clubs/${club.slug}`))
      })

    navigator.geolocation?.getCurrentPosition((pos) => {
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
      L.marker(coords, { icon: userIcon }).addTo(map)
      map.flyTo(coords, 13, { duration: 1.2 })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [clubs, router])

  return <div ref={containerRef} className="h-full w-full" />
}
