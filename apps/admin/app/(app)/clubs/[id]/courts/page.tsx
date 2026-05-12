import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
  params: Promise<{ id: string }>
}

export default async function CourtsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase.from('clubs').select('id').eq('id', id).single()
  if (!club) notFound()

  const { data: courts } = await supabase.from('courts').select('*').eq('club_id', id).order('name')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {courts?.length ?? 0} {courts?.length === 1 ? 'cancha' : 'canchas'}
        </p>
        <Button asChild size="sm">
          <Link href={`/clubs/${id}/courts/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cancha
          </Link>
        </Button>
      </div>

      {courts?.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No hay canchas registradas. Creá la primera.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courts?.map((court) => (
          <Link key={court.id} href={`/clubs/${id}/courts/${court.id}`}>
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{court.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {sportLabels[court.sport]} · {surfaceLabels[court.surface]}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {court.is_indoor ? 'Cubierta' : 'Descubierta'} · {court.capacity} jugadores
                    </p>
                  </div>
                  <Badge variant={court.is_active ? 'default' : 'secondary'} className="text-xs">
                    {court.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
