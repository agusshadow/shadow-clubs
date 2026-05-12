'use client'

import dynamic from 'next/dynamic'
import type { MapClub } from './clubs-map'

const ClubsMap = dynamic(() => import('./clubs-map').then((m) => m.ClubsMap), {
  ssr: false,
  loading: () => <div className="bg-muted h-full w-full animate-pulse" />,
})

export function MapWrapper({ clubs }: { clubs: MapClub[] }) {
  return <ClubsMap clubs={clubs} />
}
