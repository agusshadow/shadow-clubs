'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'

const BUENOS_AIRES: [number, number] = [-34.6037, -58.3816]

const markerIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36"
      style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.4));cursor:grab;display:block">
    <path d="M12 0C7.16 0 3.27 3.89 3.27 8.73 3.27 15.27 12 28 12 28S20.73 15.27 20.73 8.73C20.73 3.89 16.84 0 12 0z" fill="#2563eb"/>
    <circle cx="12" cy="8.5" r="4" fill="white"/>
  </svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export function LocationPickerMap({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center: [number, number] = lat && lng ? [lat, lng] : BUENOS_AIRES
    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      center,
      lat && lng ? 15 : 12
    )
    mapRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    if (lat && lng) {
      const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map)
      markerRef.current = marker
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange(pos.lat, pos.lng)
      })
    }

    map.on('click', (e) => {
      const { lat: newLat, lng: newLng } = e.latlng
      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng])
      } else {
        const marker = L.marker([newLat, newLng], { icon: markerIcon, draggable: true }).addTo(map)
        markerRef.current = marker
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onChange(pos.lat, pos.lng)
        })
      }
      onChange(newLat, newLng)
    })

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // Sync external lat/lng changes (e.g. from geocoding)
  useEffect(() => {
    const map = mapRef.current
    if (!map || lat == null || lng == null) return

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map)
      markerRef.current = marker
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange(pos.lat, pos.lng)
      })
    }
    map.setView([lat, lng], 15, { animate: true })
  }, [lat, lng])

  return <div ref={containerRef} className="h-full w-full" />
}
