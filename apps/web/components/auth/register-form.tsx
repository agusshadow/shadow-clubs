'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { register, verifyEmail, resendCode } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function OtpStep({ email }: { email: string }) {
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyEmail, null)
  const [resendState, resendAction, resendPending] = useActionState(resendCode, null)

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-sm">
          Enviamos un código de 6 dígitos a <span className="font-medium">{email}</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">Revisá tu bandeja de entrada o spam.</p>
      </div>

      <form action={verifyAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="token">Código de verificación</Label>
          <Input
            id="token"
            name="token"
            type="text"
            inputMode="numeric"
            maxLength={8}
            pattern="[0-9]*"
            placeholder="00000000"
            className="text-center font-mono text-2xl tracking-[0.6em]"
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </div>

        {verifyState?.error && <p className="text-destructive text-sm">{verifyState.error}</p>}

        <Button type="submit" disabled={verifyPending} className="w-full">
          {verifyPending ? 'Verificando...' : 'Verificar email'}
        </Button>
      </form>

      <form action={resendAction}>
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={resendPending || !!resendState?.success}
          className="text-muted-foreground hover:text-foreground w-full text-center text-sm transition-colors disabled:opacity-50"
        >
          {resendPending
            ? 'Reenviando...'
            : resendState?.success
              ? '¡Código reenviado! Revisá tu email.'
              : '¿No recibiste el código? Reenviar'}
        </button>
      </form>
    </div>
  )
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null)

  if (state?.step === 'verify') {
    return <OtpStep email={state.email} />
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" placeholder="Juan" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" placeholder="García" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="vos@ejemplo.com" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Ingresá
        </Link>
      </p>
    </form>
  )
}
