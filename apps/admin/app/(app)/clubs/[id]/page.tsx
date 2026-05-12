import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, Globe, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClubOverviewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('*, courts(count)')
    .eq('id', id)
    .single()

  if (!club) notFound()

  const courtCount = (club.courts as unknown as { count: number }[])[0]?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Badge variant={club.is_active ? 'default' : 'secondary'}>
            {club.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
          {club.description && <p className="text-muted-foreground text-sm">{club.description}</p>}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/clubs/${id}/settings`}>Editar</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Canchas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{courtCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label={`${club.address}, ${club.city}, ${club.province}`}
            />
            {club.phone && <InfoRow icon={<Phone className="h-4 w-4" />} label={club.phone} />}
            {club.email && <InfoRow icon={<Mail className="h-4 w-4" />} label={club.email} />}
            {club.website && (
              <InfoRow
                icon={<Globe className="h-4 w-4" />}
                label={
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {club.website}
                  </a>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/clubs/${id}/courts`}>
                <Building2 className="mr-2 h-4 w-4" />
                Gestionar canchas
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/clubs/${id}/settings`}>Configuración del club</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      {icon}
      <span>{label}</span>
    </div>
  )
}
