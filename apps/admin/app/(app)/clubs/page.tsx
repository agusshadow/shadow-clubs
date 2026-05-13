import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ClubsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('platform_role')
    .eq('id', user.id)
    .single()

  const isPlatformAdmin = profile?.platform_role === 'platform_admin'

  let clubs: {
    id: string
    name: string
    city: string
    province: string
    is_active: boolean
    mp_connected: boolean
  }[] = []

  if (isPlatformAdmin) {
    const { data } = await supabase
      .from('clubs')
      .select('id, name, city, province, is_active, mp_connected')
      .order('created_at', { ascending: false })
    clubs = data ?? []
  } else {
    const { data: memberships } = await supabase
      .from('club_members')
      .select('clubs(id, name, city, province, is_active, mp_connected)')
      .eq('profile_id', user.id)
    clubs = (memberships ?? [])
      .map((m) => m.clubs as (typeof clubs)[0] | null)
      .filter(Boolean) as typeof clubs
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clubes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestión de complejos deportivos</p>
        </div>
        {isPlatformAdmin && (
          <Button asChild>
            <Link href="/clubs/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo club
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Mercado Pago</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center text-sm">
                  No hay clubes registrados todavía.
                </TableCell>
              </TableRow>
            )}
            {clubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell className="font-medium">{club.name}</TableCell>
                <TableCell>{club.city}</TableCell>
                <TableCell>{club.province}</TableCell>
                <TableCell>
                  <Badge variant={club.is_active ? 'default' : 'secondary'}>
                    {club.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={club.mp_connected ? 'default' : 'secondary'}>
                    {club.mp_connected ? 'Conectado' : 'Sin conectar'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/clubs/${club.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
