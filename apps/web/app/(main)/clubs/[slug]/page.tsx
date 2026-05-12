import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Globe, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const sportLabels: Record<string, string> = {
  football: 'Fútbol',
  tennis: 'Tenis',
  paddle: 'Pádel',
  basketball: 'Básquet',
  volleyball: 'Vóley',
  squash: 'Squash',
  other: 'Otro',
}

const surfaceLabels: Record<string, string> = {
  grass: 'Césped',
  synthetic_grass: 'Césped sint.',
  clay: 'Polvo de ladrillo',
  hard: 'Hormigón',
  wood: 'Madera',
  concrete: 'Cemento',
  other: 'Otro',
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select(
      `*, courts(
        id, name, sport, surface, is_indoor, capacity, image_url, description,
        court_slot_templates(price_ars)
      )`
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('courts.is_active', true)
    .single()

  if (!club) notFound()

  const sports = [...new Set(club.courts.map((c) => c.sport))]

  const mapsUrl =
    club.lat && club.lng
      ? `https://www.google.com/maps?q=${club.lat},${club.lng}`
      : `https://www.google.com/maps/search/${encodeURIComponent(`${club.address}, ${club.city}`)}`

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="bg-muted relative aspect-[16/7] w-full overflow-hidden">
        {club.cover_url ? (
          <img src={club.cover_url} alt={club.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-6xl font-bold opacity-10">
              {club.name[0]}
            </span>
          </div>
        )}
        {club.logo_url && (
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <img
              src={club.logo_url}
              alt={`Logo ${club.name}`}
              className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow"
            />
          </div>
        )}
      </div>

      <div className="space-y-5 px-4 pt-6">
        {/* Name + sports */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{club.name}</h1>
          {sports.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sports.map((sport) => (
                <Badge key={sport} variant="secondary">
                  {sportLabels[sport] ?? sport}
                </Badge>
              ))}
            </div>
          )}
          {club.description && <p className="text-muted-foreground text-sm">{club.description}</p>}
        </div>

        {/* Info rápida */}
        <div className="space-y-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm"
          >
            <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <span className="hover:underline">
              {club.address}, {club.city}, {club.province}
            </span>
          </a>
          {club.phone && (
            <a
              href={`tel:${club.phone}`}
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span>{club.phone}</span>
            </a>
          )}
          {club.website && (
            <a
              href={club.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span className="truncate">{club.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>

        {/* Canchas */}
        <div className="space-y-3">
          <h2 className="font-semibold">Canchas disponibles</h2>

          {club.courts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Este club no tiene canchas activas por el momento.
            </p>
          )}

          {club.courts.map((court) => {
            const prices = court.court_slot_templates.map((s) => Number(s.price_ars))
            const minPrice = prices.length > 0 ? Math.min(...prices) : null

            return (
              <Link
                key={court.id}
                href={`/clubs/${slug}/courts/${court.id}`}
                className="group hover:bg-accent flex items-center justify-between rounded-xl border p-4 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{court.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {sportLabels[court.sport]} · {surfaceLabels[court.surface]}
                    {court.is_indoor ? ' · Cubierta' : ' · Descubierta'}
                  </p>
                  {minPrice !== null && (
                    <p className="text-sm font-medium">Desde ${minPrice.toLocaleString('es-AR')}</p>
                  )}
                </div>
                <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>

        {/* Cómo llegar */}
        <Button asChild variant="outline" className="w-full">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <MapPin className="mr-2 h-4 w-4" />
            Cómo llegar
          </a>
        </Button>
      </div>
    </div>
  )
}
