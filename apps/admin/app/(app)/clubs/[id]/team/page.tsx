import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { InviteMemberForm } from '@/components/clubs/invite-member-form'
import { RemoveMemberButton } from '@/components/clubs/remove-member-button'

interface Props {
  params: Promise<{ id: string }>
}

const ROLE_LABEL: Record<string, string> = {
  club_owner: 'Dueño',
  club_administrator: 'Administrador',
}

export default async function ClubTeamPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: club }, { data: profile }] = await Promise.all([
    supabase.from('clubs').select('id, name').eq('id', id).single(),
    supabase.from('profiles').select('platform_role').eq('id', user.id).single(),
  ])

  if (!club) notFound()

  const isPlatformAdmin = profile?.platform_role === 'platform_admin'

  const { data: myMembership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', id)
    .eq('profile_id', user.id)
    .maybeSingle()

  const canManage = isPlatformAdmin || myMembership?.role === 'club_owner'

  const { data: members } = await supabase
    .from('club_members')
    .select('id, role, profiles(first_name, last_name, phone)')
    .eq('club_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Current members */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Equipo</h2>
          <p className="text-muted-foreground text-sm">
            Personas con acceso al panel de este club.
          </p>
        </div>

        <div className="rounded-md border">
          {!members?.length && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No hay miembros en el equipo todavía.
            </p>
          )}
          {members?.map((member, i) => {
            const p = member.profiles as {
              first_name: string
              last_name: string
              phone: string | null
            } | null
            const isOwner = member.role === 'club_owner'
            const isMe = false

            return (
              <div key={member.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
                      {p ? `${p.first_name[0] ?? ''}${p.last_name[0] ?? ''}`.toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {p ? `${p.first_name} ${p.last_name}` : '—'}
                      </p>
                      {p?.phone && <p className="text-muted-foreground text-xs">{p.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={isOwner ? 'default' : 'secondary'}>
                      {ROLE_LABEL[member.role] ?? member.role}
                    </Badge>
                    {canManage && !isOwner && !isMe && (
                      <RemoveMemberButton memberId={member.id} clubId={id} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite form — only for club_owner and platform_admin */}
      {canManage && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Invitar administrador</h2>
              <p className="text-muted-foreground text-sm">
                Agregá personas que puedan gestionar reservas y canchas.
              </p>
            </div>
            <InviteMemberForm clubId={id} />
          </div>
        </>
      )}
    </div>
  )
}
