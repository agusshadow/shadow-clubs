import { redirect } from 'next/navigation'
import { ClipboardList, Clock, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

export default async function PendingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: application } = await supabase
    .from('club_applications')
    .select('club_name, status, rejection_reason, created_at')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const isRejected = application?.status === 'rejected'

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        {isRejected ? (
          <>
            <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="text-destructive h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Solicitud no aprobada</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Tu solicitud para <strong>{application?.club_name}</strong> no fue aprobada.
              </p>
              {application?.rejection_reason && (
                <p className="bg-muted mt-3 rounded-lg p-3 text-left text-sm">
                  <span className="font-medium">Motivo: </span>
                  {application.rejection_reason}
                </p>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Si querés presentar una nueva solicitud con información actualizada, contactanos a{' '}
              <a href="mailto:hola@shadowclubs.com.ar" className="text-primary underline">
                hola@shadowclubs.com.ar
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              {application ? (
                <Clock className="text-primary h-8 w-8" />
              ) : (
                <ClipboardList className="text-primary h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {application ? 'Solicitud en revisión' : 'Sin solicitud activa'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {application ? (
                  <>
                    Tu solicitud para <strong>{application.club_name}</strong> está siendo revisada
                    por nuestro equipo. Te avisaremos por email en las próximas 24-48hs.
                  </>
                ) : (
                  'No tenés ninguna solicitud activa. Registrá tu club para empezar.'
                )}
              </p>
            </div>
            {!application && (
              <Button asChild>
                <a href="/register">Registrar mi club</a>
              </Button>
            )}
          </>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="text-muted-foreground text-sm underline underline-offset-4"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
