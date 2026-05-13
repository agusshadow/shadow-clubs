import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RejectForm } from '@/components/applications/reject-form'
import { approveApplication } from '@/lib/actions/applications'
import { createClient } from '@/lib/supabase/server'

const SPORT_LABEL: Record<string, string> = {
  paddle: 'Pádel',
  tennis: 'Tenis',
  football: 'Fútbol',
  basketball: 'Básquet',
  volleyball: 'Vóley',
  squash: 'Squash',
  other: 'Otro',
}

const STATUS_LABEL: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  approved: { label: 'Aprobada', variant: 'default' },
  rejected: { label: 'Rechazada', variant: 'destructive' },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params
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

  const { data: app } = await supabase
    .from('club_applications')
    .select('*, profiles!applicant_id(first_name, last_name, phone)')
    .eq('id', id)
    .single()

  if (!app) notFound()

  const applicant = app.profiles as {
    first_name: string
    last_name: string
    phone: string | null
  } | null
  const statusInfo = STATUS_LABEL[app.status] ?? STATUS_LABEL['pending']!
  const isPending = app.status === 'pending'

  const approveWithId = approveApplication.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/applications">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{app.club_name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Solicitud enviada el {new Date(app.created_at).toLocaleDateString('es-AR')}
          </p>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Applicant */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">
              {applicant ? `${applicant.first_name} ${applicant.last_name}` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teléfono</span>
            <span>{applicant?.phone ?? '—'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Club data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del club</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dirección</span>
            <span>{app.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ciudad</span>
            <span>{app.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provincia</span>
            <span>{app.province}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teléfono del club</span>
            <span>{app.phone ?? '—'}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Deportes</span>
            <div className="flex flex-wrap justify-end gap-1">
              {(app.sport_types as string[]).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {SPORT_LABEL[s] ?? s}
                </Badge>
              ))}
            </div>
          </div>
          {app.additional_info && (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Información adicional</span>
              <p className="bg-muted rounded-md p-3 text-sm">{app.additional_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection reason (if rejected) */}
      {app.status === 'rejected' && app.rejection_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive text-base">Motivo del rechazo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{app.rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex flex-col gap-3">
          <form action={approveWithId}>
            <Button type="submit" className="w-full">
              Aprobar solicitud
            </Button>
          </form>
          <RejectForm applicationId={id} />
        </div>
      )}
    </div>
  )
}
