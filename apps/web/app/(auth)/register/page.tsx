import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Shadow Clubs</h1>
        <p className="text-muted-foreground mt-1 text-sm">Creá tu cuenta gratis</p>
      </div>
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Crear cuenta</h2>
        <RegisterForm />
      </div>
    </div>
  )
}
