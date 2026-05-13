import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-lg py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Shadow Clubs</h1>
        <p className="text-muted-foreground mt-1 text-sm">Registrá tu club en la plataforma</p>
      </div>
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Solicitud de alta</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Completá el formulario y revisaremos tu solicitud en las próximas 24-48hs.
          </p>
        </div>
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-primary underline underline-offset-4">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
