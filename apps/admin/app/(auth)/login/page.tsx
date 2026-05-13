import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

interface Props {
  searchParams: Promise<{ registered?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { registered } = await searchParams

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Shadow Clubs</h1>
        <p className="text-muted-foreground mt-1 text-sm">Panel de administración</p>
      </div>
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        {registered && (
          <div className="bg-primary/10 text-primary mb-5 rounded-lg px-4 py-3 text-sm">
            Solicitud enviada. Revisaremos tu club en las próximas 24-48hs. Ya podés ingresar con
            tus credenciales.
          </div>
        )}
        <h2 className="mb-6 text-lg font-semibold">Iniciar sesión</h2>
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-sm">
        ¿Querés sumar tu club?{' '}
        <Link href="/register" className="text-primary underline underline-offset-4">
          Registrate acá
        </Link>
      </p>
    </div>
  )
}
