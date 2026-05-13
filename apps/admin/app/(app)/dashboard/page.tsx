import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Building2,
  CalendarCheck,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('platform_role, first_name')
    .eq('id', user.id)
    .single()

  const isPlatformAdmin = profile?.platform_role === 'platform_admin'

  if (isPlatformAdmin) {
    const [
      { count: clubCount },
      { count: reservationCount },
      { data: revenueData },
      { count: userCount },
      { count: pendingCount },
    ] = await Promise.all([
      supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed'),
      supabase.from('reservations').select('total_amount').eq('status', 'confirmed'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('club_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

    const totalRevenue = (revenueData ?? []).reduce((sum, r) => sum + Number(r.total_amount), 0)

    const stats = [
      {
        title: 'Clubes activos',
        value: clubCount ?? 0,
        icon: Building2,
        format: (v: number) => v.toString(),
      },
      {
        title: 'Reservas confirmadas',
        value: reservationCount ?? 0,
        icon: CalendarCheck,
        format: (v: number) => v.toString(),
      },
      {
        title: 'Ingresos totales',
        value: totalRevenue,
        icon: TrendingUp,
        format: (v: number) => `$${v.toLocaleString('es-AR')}`,
      },
      {
        title: 'Usuarios registrados',
        value: userCount ?? 0,
        icon: Users,
        format: (v: number) => v.toString(),
      },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Resumen general de la plataforma</p>
        </div>

        {(pendingCount ?? 0) > 0 && (
          <div className="bg-primary/10 flex items-center justify-between rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="text-primary h-4 w-4" />
              <span>
                Hay <strong>{pendingCount}</strong> solicitud{pendingCount === 1 ? '' : 'es'}{' '}
                pendiente{pendingCount === 1 ? '' : 's'} de revisión.
              </span>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/applications">Revisar</Link>
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ title, value, icon: Icon, format }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{format(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Club owner view
  const { data: memberships } = await supabase
    .from('club_members')
    .select('role, clubs(id, name, mp_connected, courts(id))')
    .eq('profile_id', user.id)

  const myClubs = (memberships ?? [])
    .map((m) => ({
      role: m.role,
      club: m.clubs as {
        id: string
        name: string
        mp_connected: boolean
        courts: { id: string }[]
      } | null,
    }))
    .filter((m) => m.club !== null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido{profile?.first_name ? `, ${profile.first_name}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Panel de administración de tus clubes</p>
      </div>

      <div className="space-y-4">
        {myClubs.map(({ club, role }) => {
          if (!club) return null
          const hasCourts = club.courts.length > 0
          const hasMp = club.mp_connected

          const checklist = [
            { label: 'Club aprobado', done: true },
            { label: 'Conectar Mercado Pago', done: hasMp, href: `/clubs/${club.id}/settings` },
            { label: 'Agregar canchas', done: hasCourts, href: `/clubs/${club.id}/courts` },
          ]

          return (
            <Card key={club.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">{club.name}</CardTitle>
                  <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                    {role === 'club_owner' ? 'Dueño' : 'Administrador'}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/clubs/${club.id}`}>Gestionar</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                  Configuración pendiente
                </p>
                <ul className="space-y-2">
                  {checklist.map(({ label, done, href }) => (
                    <li key={label} className="flex items-center gap-2 text-sm">
                      {done ? (
                        <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                      ) : (
                        <Circle className="text-muted-foreground h-4 w-4 shrink-0" />
                      )}
                      {!done && href ? (
                        <Link href={href} className="text-primary underline underline-offset-2">
                          {label}
                        </Link>
                      ) : (
                        <span className={done ? 'text-muted-foreground line-through' : ''}>
                          {label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
