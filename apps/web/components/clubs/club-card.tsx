import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const sportLabels: Record<string, string> = {
  football: 'Fútbol',
  tennis: 'Tenis',
  paddle: 'Pádel',
  basketball: 'Básquet',
  volleyball: 'Vóley',
  squash: 'Squash',
  other: 'Otro',
}

interface ClubCardProps {
  club: {
    id: string
    name: string
    slug: string
    city: string
    province: string
    cover_url: string | null
    courts: { sport: string }[]
  }
}

export function ClubCard({ club }: ClubCardProps) {
  const sports = [...new Set(club.courts.map((c) => c.sport))]

  return (
    <Link href={`/clubs/${club.slug}`} className="group block">
      <div className="bg-card overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
        <div className="bg-muted aspect-[16/7] w-full overflow-hidden">
          {club.cover_url ? (
            <img
              src={club.cover_url}
              alt={club.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground text-4xl font-bold opacity-20">
                {club.name[0]}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <h3 className="leading-tight font-semibold">{club.name}</h3>

          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {club.city}, {club.province}
            </span>
          </div>

          {sports.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sports.map((sport) => (
                <Badge key={sport} variant="secondary" className="text-xs">
                  {sportLabels[sport] ?? sport}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
