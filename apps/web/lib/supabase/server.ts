import { cookies } from 'next/headers'
import { createServerClient } from '@shadow-clubs/supabase'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(cookieStore)
}
