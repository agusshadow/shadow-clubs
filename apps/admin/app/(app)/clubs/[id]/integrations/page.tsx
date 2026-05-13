import { notFound } from 'next/navigation'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ connected?: string; error?: string }>
}

export default async function ClubIntegrationsPage({ params, searchParams }: Props) {
  const { id } = await params
  const { connected, error } = await searchParams

  const supabase = await createClient()

  const [{ data: club }, { data: credentials }] = await Promise.all([
    supabase.from('clubs').select('id, name, mp_connected').eq('id', id).single(),
    supabase
      .from('club_mp_credentials')
      .select('mp_user_id, connected_at, is_active')
      .eq('club_id', id)
      .maybeSingle(),
  ])

  if (!club) notFound()

  const isConnected = club.mp_connected && credentials?.is_active

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Integraciones</h2>
        <p className="text-muted-foreground text-sm">
          Conectá servicios externos para activar pagos.
        </p>
      </div>

      {connected === '1' && (
        <div className="bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Mercado Pago conectado correctamente. Ya podés recibir pagos.
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          {error === 'config'
            ? 'Faltan credenciales de Mercado Pago en el servidor. Contactá al administrador.'
            : error === 'token'
              ? 'Error al obtener el token de Mercado Pago. Intentá de nuevo.'
              : 'Ocurrió un error. Intentá de nuevo.'}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-[#009EE3]/10">
              <span className="text-sm font-bold text-[#009EE3]">MP</span>
            </div>
            <div>
              <CardTitle className="text-base">Mercado Pago</CardTitle>
              <p className="text-muted-foreground text-xs">Procesamiento de pagos</p>
            </div>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Conectado
            </div>
          ) : (
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <XCircle className="h-4 w-4" />
              Sin conectar
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuario MP</span>
                <span className="font-mono">{credentials?.mp_user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conectado el</span>
                <span>
                  {credentials?.connected_at
                    ? new Date(credentials.connected_at).toLocaleDateString('es-AR')
                    : '—'}
                </span>
              </div>
              <p className="text-muted-foreground pt-2 text-xs">
                Los pagos de reservas en este club se acreditarán directamente en tu cuenta de
                Mercado Pago, descontando la comisión de plataforma del 8%.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a href={`/api/mp/connect?club_id=${id}`} className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Reconectar cuenta
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Conectá tu cuenta de Mercado Pago para empezar a recibir pagos de reservas. El
                proceso es rápido y seguro — te redirigiremos a Mercado Pago para que autoricés el
                acceso.
              </p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Los pagos se acreditan directamente en tu cuenta</li>
                <li>• La plataforma retiene una comisión del 8% por reserva</li>
                <li>• Podés desconectar en cualquier momento</li>
              </ul>
              <Button asChild>
                <a href={`/api/mp/connect?club_id=${id}`}>Conectar Mercado Pago</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
