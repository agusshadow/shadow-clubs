import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'

const STATUS_TABS = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
] as const

type Status = (typeof STATUS_TABS)[number]['value']

const SPORT_LABEL: Record<string, string> = {
  paddle: 'Pádel',
  tennis: 'Tenis',
  football: 'Fútbol',
  basketball: 'Básquet',
  volleyball: 'Vóley',
  squash: 'Squash',
  other: 'Otro',
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function ApplicationsPage({ searchParams }: Props) {
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

  if (profile?.platform_role !== 'platform_admin') redirect('/clubs')

  const { status: statusParam } = await searchParams
  const status: Status = STATUS_TABS.find((t) => t.value === statusParam)?.value ?? 'pending'

  const [{ data: applications }, { count: pendingCount }] = await Promise.all([
    supabase
      .from('club_applications')
      .select(
        'id, club_name, city, province, sport_types, status, created_at, profiles!applicant_id(first_name, last_name)'
      )
      .eq('status', status)
      .order('created_at', { ascending: false }),
    supabase
      .from('club_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Solicitudes</h1>
        <p className="text-muted-foreground mt-1 text-sm">Revisión de altas de nuevos clubes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/applications?status=${tab.value}`}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              status === tab.value
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {tab.label}
            {tab.value === 'pending' && (pendingCount ?? 0) > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs leading-none">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Club</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Deportes</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!applications?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                  No hay solicitudes{' '}
                  {status === 'pending'
                    ? 'pendientes'
                    : status === 'approved'
                      ? 'aprobadas'
                      : 'rechazadas'}
                  .
                </TableCell>
              </TableRow>
            )}
            {applications?.map((app) => {
              const applicant = app.profiles as { first_name: string; last_name: string } | null
              return (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.club_name}</TableCell>
                  <TableCell>
                    {applicant ? `${applicant.first_name} ${applicant.last_name}` : '—'}
                  </TableCell>
                  <TableCell>
                    {app.city}, {app.province}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(app.sport_types as string[]).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {SPORT_LABEL[s] ?? s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(app.created_at).toLocaleDateString('es-AR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/applications/${app.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
