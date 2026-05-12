import { Building2, CalendarCheck, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: clubCount },
    { count: reservationCount },
    { data: revenueData },
    { count: userCount },
  ] = await Promise.all([
    supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
    supabase.from('reservations').select('total_amount').eq('status', 'confirmed'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
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
