'use client'

import { useActionState, useState } from 'react'
import { createApplication } from '@/lib/actions/applications'
import { verifyEmail, resendCode } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SPORTS = [
  { value: 'paddle', label: 'Pádel' },
  { value: 'tennis', label: 'Tenis' },
  { value: 'football', label: 'Fútbol' },
  { value: 'basketball', label: 'Básquet' },
  { value: 'volleyball', label: 'Vóley' },
  { value: 'squash', label: 'Squash' },
  { value: 'other', label: 'Otro' },
]

const PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

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
  const [state, action, pending] = useActionState(createApplication, null)
  const [selectedSports, setSelectedSports] = useState<string[]>([])

  function toggleSport(value: string) {
    setSelectedSports((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  if (state?.step === 'verify') {
    return <OtpStep email={state.email} />
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Personal data */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Datos personales
        </p>
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" placeholder="Juan" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" name="last_name" placeholder="Pérez" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@miclub.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+54 11 1234-5678" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
          </div>
        </div>
      </div>

      {/* Club data */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Datos del club
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club_name">Nombre del club</Label>
            <Input id="club_name" name="club_name" placeholder="Club Deportivo Ejemplo" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" placeholder="Av. Corrientes 1234" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" placeholder="Buenos Aires" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="province">Provincia</Label>
              <select
                id="province"
                name="province"
                defaultValue="Buenos Aires"
                className="border-input bg-background focus:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sports */}
          <div className="flex flex-col gap-2">
            <Label>Deportes</Label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => {
                const checked = selectedSports.includes(sport.value)
                return (
                  <label
                    key={sport.value}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                      checked
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="sport_types"
                      value={sport.value}
                      checked={checked}
                      onChange={() => toggleSport(sport.value)}
                      className="sr-only"
                    />
                    {sport.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="additional_info">Información adicional (opcional)</Label>
            <textarea
              id="additional_info"
              name="additional_info"
              rows={3}
              placeholder="Contanos más sobre tu club: cantidad de canchas, horarios, etc."
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>
      </div>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Enviando solicitud...' : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
