import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Shadow Clubs</h1>
        <p className="text-muted-foreground mt-1 text-sm">Panel de administración</p>
      </div>
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Iniciar sesión</h2>
        <LoginForm />
      </div>
    </div>
  )
}
