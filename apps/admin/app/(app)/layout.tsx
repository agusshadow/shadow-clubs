import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { count: pendingApplications }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name, platform_role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('club_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const isPlatformAdmin = profile?.platform_role === 'platform_admin'
  const firstName = profile?.first_name ?? user.user_metadata?.first_name ?? ''
  const lastName = profile?.last_name ?? user.user_metadata?.last_name ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.email || 'Usuario'

  return (
    <div className="flex h-full">
      <Sidebar
        isPlatformAdmin={isPlatformAdmin}
        pendingApplications={isPlatformAdmin ? (pendingApplications ?? 0) : 0}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          email={user.email!}
          fullName={fullName}
          avatarUrl={user.user_metadata?.avatar_url}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
