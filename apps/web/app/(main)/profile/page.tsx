import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarCheck, ChevronRight, LogOut, TrendingUp, Dumbbell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/profile')

  const [{ data: profile }, { data: reservations }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, phone').eq('id', user.id).single(),
    supabase
      .from('reservations')
      .select('status, total_amount, courts(sport)')
      .eq('profile_id', user.id)
      .neq('status', 'cancelled'),
  ])

  const all = reservations ?? []
  const confirmed = all.filter((r) => r.status === 'confirmed')
  const totalSpent = confirmed.reduce((sum, r) => sum + Number(r.total_amount), 0)
  const sports = [
    ...new Set(all.map((r) => (r.courts as { sport: string } | null)?.sport).filter(Boolean)),
  ] as string[]

  const sportLabel: Record<string, string> = {
    paddle: 'Pádel',
    tennis: 'Tenis',
    football: 'Fútbol',
    basketball: 'Básquet',
    volleyball: 'Vóley',
    squash: 'Squash',
    other: 'Otro',
  }

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?'
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return (
    <div className="flex min-h-full flex-col pb-6">
      {/* Header */}
      <div className="bg-card flex flex-col items-center gap-3 border-b px-4 pt-8 pb-6 text-center">
        <div className="bg-primary text-primary-foreground flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold">{fullName || 'Sin nombre'}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1 rounded-xl border p-3 text-center">
            <CalendarCheck className="text-muted-foreground mx-auto h-5 w-5" />
            <p className="text-xl font-bold">{confirmed.length}</p>
            <p className="text-muted-foreground text-xs">Reservas</p>
          </div>
          <div className="space-y-1 rounded-xl border p-3 text-center">
            <TrendingUp className="text-muted-foreground mx-auto h-5 w-5" />
            <p className="text-xl font-bold">${(totalSpent / 1000).toFixed(0)}k</p>
            <p className="text-muted-foreground text-xs">Gastado</p>
          </div>
          <div className="space-y-1 rounded-xl border p-3 text-center">
            <Dumbbell className="text-muted-foreground mx-auto h-5 w-5" />
            <p className="text-xl font-bold">{sports.length}</p>
            <p className="text-muted-foreground text-xs">Deportes</p>
          </div>
        </div>

        {/* Sports played */}
        {sports.length > 0 && (
          <div className="space-y-2 rounded-xl border p-4">
            <p className="text-sm font-medium">Deportes jugados</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((s) => (
                <span key={s} className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
                  {sportLabel[s] ?? s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick link to reservations */}
        <Link
          href="/reservations"
          className="flex items-center justify-between rounded-xl border p-4"
        >
          <div className="flex items-center gap-3">
            <CalendarCheck className="text-muted-foreground h-5 w-5" />
            <span className="text-sm font-medium">Mis reservas</span>
          </div>
          <ChevronRight className="text-muted-foreground h-4 w-4" />
        </Link>

        {/* Edit profile */}
        <div className="space-y-4 rounded-xl border p-4">
          <p className="text-sm font-medium">Editar perfil</p>
          <ProfileForm
            firstName={firstName}
            lastName={profile?.last_name ?? null}
            phone={profile?.phone ?? null}
          />
        </div>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="text-destructive border-destructive/30 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
