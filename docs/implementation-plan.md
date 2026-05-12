# Plan de Implementación — Shadow Clubs

Documento técnico de referencia: orden de desarrollo, decisiones de tooling y patrones a seguir en ambas apps.

---

## Stack técnico completo

| Categoría | Herramienta | Scope |
|-----------|------------|-------|
| Monorepo | Turborepo + pnpm workspaces | root |
| Framework | Next.js 15 (App Router) | ambas apps |
| Lenguaje | TypeScript strict | todo |
| Estilos | Tailwind CSS v4 | ambas apps |
| Componentes | shadcn/ui | ambas apps |
| Estado server | TanStack Query v5 | ambas apps |
| Estado cliente | Zustand | ambas apps |
| Formularios | React Hook Form + Zod | ambas apps |
| Auth | Supabase Auth | ambas apps |
| DB | Supabase (PostgreSQL + RLS) | backend |
| Storage | Supabase Storage | backend |
| Pagos | Mercado Pago Marketplace | backend |
| Email | Resend + React Email | backend |
| Push | Web Push API | web |
| Tests unitarios | Vitest + React Testing Library | ambas apps |
| Tests E2E | Playwright | ambas apps |
| Linting | ESLint (config compartida) | todo |
| Formatting | Prettier + prettier-plugin-tailwindcss | todo |
| Git hooks | Husky + lint-staged | root |
| CI/CD | GitHub Actions + Vercel | — |
| PWA | Serwist | web |

---

## Estructura de carpetas

### Root del monorepo

```
shadow-clubs/
├── apps/
│   ├── admin/
│   └── web/
├── packages/
│   ├── supabase/       → cliente Supabase + tipos generados
│   ├── types/          → tipos de dominio compartidos
│   ├── utils/          → helpers compartidos (fechas, precios, etc.)
│   ├── ui/             → componentes base compartidos (futuro)
│   └── eslint-config/  → config de ESLint compartida   ← NUEVO
├── docs/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── preview.yml
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .env.local
└── .env.example
```

### Dentro de `apps/admin` y `apps/web`

```
app/
├── (auth)/                  → layout sin sidebar/bottom-nav
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/            → solo en web
│       └── page.tsx
│
├── (app)/                   → layout con sidebar (solo admin)
│   ├── layout.tsx           → sidebar + topbar
│   ├── dashboard/
│   │   └── page.tsx
│   └── clubs/
│       ├── page.tsx
│       ├── new/
│       │   └── page.tsx
│       └── [id]/
│           ├── page.tsx
│           ├── courts/
│           ├── reservations/
│           ├── staff/
│           ├── settings/
│           ├── policy/
│           └── billing/
│
├── (main)/                  → layout con bottom nav (solo web)
│   ├── layout.tsx
│   ├── page.tsx             → home
│   ├── explore/
│   ├── reservations/
│   └── profile/
│
├── book/                    → full-screen sin nav (solo web)
│   └── [courtId]/
│       ├── page.tsx
│       └── checkout/
│           └── page.tsx
│
├── clubs/                   → detalle público (solo web)
│   └── [slug]/
│       └── courts/
│           └── [courtId]/
│               └── page.tsx
│
├── book/
│   └── confirmation/
│       └── [reservationId]/
│           └── page.tsx
│
├── layout.tsx               → root layout (fonts, providers)
├── error.tsx                → error boundary global
├── not-found.tsx
└── loading.tsx

components/
├── ui/                      → shadcn/ui local (generados por CLI)
├── layout/
│   ├── sidebar.tsx          → admin
│   ├── topbar.tsx           → admin
│   ├── bottom-nav.tsx       → web
│   └── page-header.tsx      → compartido
└── [feature]/               → componentes por dominio
    ├── clubs/
    ├── courts/
    ├── reservations/
    └── ...

hooks/
├── use-auth.ts
├── use-club.ts
└── ...

lib/
├── supabase/
│   ├── client.ts            → cliente browser
│   ├── server.ts            → cliente server (SSR/RSC)
│   └── middleware.ts        → helper para middleware.ts
├── actions/                 → Server Actions por dominio
│   ├── clubs.ts
│   ├── courts.ts
│   ├── reservations.ts
│   └── ...
├── validators/              → schemas Zod
│   ├── club.ts
│   ├── court.ts
│   ├── reservation.ts
│   └── ...
└── utils/
    └── ...                  → helpers específicos de la app

middleware.ts                → protección de rutas + Supabase auth
```

---

## Layouts

### Admin — estructura de layouts

```
app/layout.tsx                     → Providers globales (QueryClient, Toaster)
  └── app/(auth)/layout.tsx        → Centrado, sin sidebar, fondo neutro
  └── app/(app)/layout.tsx         → flex row: Sidebar + main content
        ├── components/layout/sidebar.tsx
        │     → Logo, nav links (según rol), footer con avatar del usuario
        └── components/layout/topbar.tsx
              → Breadcrumb, notificaciones, avatar con dropdown
```

**Sidebar**: colapsa a iconos en pantallas menores a 1280px. No responsive a mobile (es desktop-only).

### Web — estructura de layouts

```
app/layout.tsx                     → Providers globales + PWA meta tags
  └── app/(auth)/layout.tsx        → Full screen centrado, sin nav
  └── app/(main)/layout.tsx        → flex col: content + BottomNav
        └── components/layout/bottom-nav.tsx
              → 4 items: Home, Explorar, Reservas, Perfil
  └── app/book/layout.tsx          → Full screen sin nav (flujo de pago)
  └── app/clubs/layout.tsx         → Sin bottom nav (detalle de club)
```

**Bottom nav**: siempre visible en mobile dentro del grupo `(main)`. En desktop se reemplaza por una topbar horizontal.

---

## Testing

### Filosofía
- **Testear comportamiento, no implementación**
- Tests colocados junto al archivo que testean (`*.test.ts` / `*.test.tsx`)
- Prioridad: utils y validators (críticos) > server actions > componentes > E2E flujos críticos

### Herramientas

#### Vitest — tests unitarios e integración

```ts
// vitest.config.ts en cada app
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
```

**Qué testear con Vitest:**
- `packages/utils`: formatters de precio, fecha, helpers de disponibilidad
- `packages/types`: validadores Zod compartidos
- `lib/validators/`: schemas Zod de formularios
- `lib/actions/`: server actions (mockeando el cliente de Supabase)
- Componentes con lógica compleja (ej: selector de slots, carrito de reserva)

**Qué NO testear:**
- Componentes puramente presentacionales
- Páginas (cubierto por E2E)
- El cliente de Supabase en sí

#### Playwright — tests E2E

Instalado a nivel de cada app. Flujos críticos a cubrir:

**Admin:**
```
auth.spec.ts          → login exitoso, login fallido, redirect según rol
clubs.spec.ts         → crear club, agregar cancha, configurar slots
reservations.spec.ts  → ver lista, cancelar una reserva
```

**Web:**
```
auth.spec.ts          → registro, login, logout
explore.spec.ts       → búsqueda y filtrado de canchas
booking.spec.ts       → flujo completo de reserva (con MP en modo sandbox)
reservations.spec.ts  → ver mis reservas, cancelar
```

```
apps/
  admin/
    e2e/
      auth.spec.ts
      clubs.spec.ts
      reservations.spec.ts
    playwright.config.ts
  web/
    e2e/
      auth.spec.ts
      booking.spec.ts
      reservations.spec.ts
    playwright.config.ts
```

### Scripts de test

```json
// package.json de cada app
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

```json
// root package.json
{
  "scripts": {
    "test": "turbo test",
    "test:e2e": "turbo test:e2e"
  }
}
```

---

## Linting

### Estructura

Se crea `packages/eslint-config` con configuraciones exportables:

```
packages/eslint-config/
├── package.json
├── base.js          → reglas base TypeScript
├── next.js          → extiende base, agrega reglas Next.js
└── react.js         → reglas React para packages sin Next.js
```

Cada app extiende la config compartida:

```js
// apps/admin/eslint.config.mjs
import { nextConfig } from '@shadow-clubs/eslint-config/next'
export default [...nextConfig]
```

### Reglas clave

```js
// packages/eslint-config/base.js
export const baseConfig = [
  // TypeScript strict
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',   // siempre import type
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

  // Imports
  'import/order': ['error', {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
    'newlines-between': 'always',
  }],
  'no-restricted-imports': ['error', {
    patterns: ['../../']   // forzar imports absolutos desde @/
  }],

  // Next.js específico
  '@next/next/no-html-link-for-pages': 'error',
]
```

### Git hooks con Husky + lint-staged

```bash
# .husky/pre-commit
pnpm lint-staged
```

```json
// root package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yaml}": ["prettier --write"]
  }
}
```

```bash
# .husky/commit-msg  → valida formato de commit (Conventional Commits)
npx commitlint --edit $1
```

**Formato de commits:**
```
feat(web): add court availability calendar
fix(admin): correct reservation cancellation flow
docs: update database schema
chore(deps): update next.js to 16.3
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml — corre en cada PR
name: CI
on: [pull_request]
jobs:
  check:
    steps:
      - type-check    → turbo type-check
      - lint          → turbo lint
      - test          → turbo test
      - build         → turbo build (verifica que buildea sin errores)
```

```yaml
# .github/workflows/e2e.yml — corre en PR a main
name: E2E
on:
  pull_request:
    branches: [main]
jobs:
  e2e:
    steps:
      - turbo test:e2e (con variables de entorno de staging)
```

### Vercel

- **Admin**: proyecto separado apuntando a `apps/admin`, dominio `admin.shadow-clubs.com`
- **Web**: proyecto separado apuntando a `apps/web`, dominio `shadow-clubs.com`
- Preview deployments automáticos en cada PR
- Variables de entorno configuradas por proyecto en Vercel

---

## Env vars validation

Usar `@t3-oss/env-nextjs` en cada app para validar las env vars al inicio:

```ts
// apps/admin/lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    MP_ACCESS_TOKEN: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    PLATFORM_COMMISSION_RATE: z.coerce.number().min(0).max(1),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // ...
  },
})
```

Esto hace que la app **falle al iniciar** si falta una env var obligatoria, en lugar de fallar en runtime.

---

## Patrones de código

### Server Actions

```ts
// lib/actions/clubs.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { clubSchema } from '@/lib/validators/club'
import type { ActionResult } from '@shadow-clubs/types'

export async function createClub(
  formData: unknown
): Promise<ActionResult<Club>> {
  const parsed = clubSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('clubs')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}
```

`ActionResult<T>` es un tipo genérico en `@shadow-clubs/types`:

```ts
// packages/types/src/index.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string | Record<string, string[]> }
```

### TanStack Query + Server Actions

```ts
// hooks/use-clubs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClubs, createClub } from '@/lib/actions/clubs'

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
  })
}

export function useCreateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createClub,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs'] }),
  })
}
```

### Zod validators

```ts
// lib/validators/club.ts
import { z } from 'zod'

export const clubSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  address: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(2),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export type ClubInput = z.infer<typeof clubSchema>
```

### Middleware de autenticación

```ts
// middleware.ts (en cada app)
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const isPublic = PUBLIC_ROUTES.includes(request.nextUrl.pathname)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
```

---

## Fases de implementación

### Fase 0 — Completada ✅
- Monorepo Turborepo + pnpm
- Dos apps Next.js (admin + web)
- Packages skeleton (types, utils, ui, supabase)
- Documentación inicial (DB, vistas, plan)

---

### Fase 1 — Infraestructura y configuración

**Objetivo**: tener todo el tooling listo antes de tocar features.

- [ ] `packages/eslint-config`: crear config compartida y aplicar a ambas apps
- [ ] Husky + lint-staged en root
- [ ] commitlint con Conventional Commits
- [ ] Vitest en `apps/admin` y `apps/web`
- [ ] Playwright en `apps/admin` y `apps/web`
- [ ] `@t3-oss/env-nextjs` en ambas apps
- [ ] shadcn/ui init en ambas apps (con theme base)
- [ ] `packages/supabase`: cliente browser + servidor con `@supabase/ssr`
- [ ] GitHub Actions: workflow de CI (type-check + lint + test + build)
- [ ] Turbo: agregar `test` y `type-check` al pipeline

---

### Fase 2 — Auth y Layouts

**Objetivo**: un esqueleto navegable con auth funcional.

- [ ] Middleware de auth en ambas apps
- [ ] `(auth)` layout: login en admin, login + registro en web
- [ ] Páginas de login y registro con React Hook Form + Zod
- [ ] Supabase Auth: email/password + Google OAuth
- [ ] Trigger `handle_new_user` en Supabase (crea perfil automáticamente)
- [ ] `(app)` layout en admin: Sidebar + Topbar con datos del usuario
- [ ] `(main)` layout en web: Bottom Nav responsivo
- [ ] Redirección post-login según rol (`admin` → `/dashboard`, `club_owner` → `/clubs`, `club_administrator` → `/clubs/[id]/reservations`, usuario → `/`)
- [ ] Páginas `error.tsx` y `not-found.tsx` en ambas apps

---

### Fase 3 — Base de datos

**Objetivo**: schema completo corriendo en Supabase con tipos generados.

- [ ] Migraciones SQL en Supabase: enums → tablas → índices → triggers → RLS
- [ ] Testear políticas RLS con diferentes roles
- [ ] `supabase gen types` → output a `packages/supabase/src/database.types.ts`
- [ ] Exportar tipos de DB desde `packages/supabase`
- [ ] Extender tipos en `packages/types` con tipos de dominio derivados

---

### Fase 4 — Admin: Clubes y Canchas

**Objetivo**: el club_owner puede crear y configurar su club.

- [ ] `/clubs` — lista de clubes
- [ ] `/clubs/new` — crear club (con upload de logo/portada a Supabase Storage)
- [ ] `/clubs/[id]` — overview del club (KPIs básicos hardcodeados por ahora)
- [ ] `/clubs/[id]/settings` — editar datos del club
- [ ] `/clubs/[id]/courts` — lista de canchas
- [ ] `/clubs/[id]/courts/new` — crear cancha (con upload de fotos)
- [ ] `/clubs/[id]/courts/[courtId]` → Tab "Información": editar cancha
- [ ] `/clubs/[id]/courts/[courtId]` → Tab "Turnos": CRUD de slot templates por día
- [ ] `/clubs/[id]/courts/[courtId]` → Tab "Bloqueos": CRUD de court_blocked_dates
- [ ] `/clubs/[id]/policy` — configurar política de cancelación

---

### Fase 5 — Web: Discovery

**Objetivo**: el usuario puede explorar clubes y ver disponibilidad.

- [ ] `/` — Home con búsqueda y secciones estáticas (sin geo por ahora)
- [ ] `/explore` — listado de clubs con filtros por deporte y ciudad
- [ ] `/clubs/[slug]` — detalle del club con lista de canchas
- [ ] `/clubs/[slug]/courts/[courtId]` — detalle de cancha con selector de fecha y slots disponibles
- [ ] Lógica de disponibilidad: cruzar `court_slot_templates` vs `reservations` activas vs `court_blocked_dates`

---

### Fase 6 — Pagos (Mercado Pago)

**Objetivo**: el usuario puede reservar y pagar. Es la fase más crítica.

- [ ] `/clubs/[id]/billing` en admin: OAuth flow para conectar cuenta de MP del club
- [ ] Supabase Edge Function: `create-mp-preference`
  - Recibe `reservationId`
  - Lee `club_mp_credentials` con `service_role`
  - Crea preference en MP con `marketplace_fee`
  - Retorna `preference_id` + checkout URL
- [ ] `/book/[courtId]` — resumen del turno con desglose de precios
- [ ] `/book/[courtId]/checkout` — integración de MP Bricks (Payment Brick)
- [ ] Supabase Edge Function: `mp-webhook`
  - Valida firma del webhook (`MP_WEBHOOK_SECRET`)
  - Idempotencia por `mp_payment_id`
  - Actualiza `payments` y `reservations`
  - Dispara notificación de confirmación
- [ ] `/book/confirmation/[reservationId]` — pantalla de éxito/error post-pago
- [ ] Cron job (Supabase pg_cron): liberar reservas en `pending_payment` después de 15 minutos

---

### Fase 7 — Gestión de Reservas

**Objetivo**: admins y club staff pueden gestionar reservas; usuarios pueden ver las suyas.

- [ ] Admin `/clubs/[id]/reservations` — tabla + filtros + vista calendario
- [ ] Admin `/clubs/[id]/reservations/[id]` — detalle + botón cancelar con lógica de reembolso
- [ ] Web `/reservations` — tabs: próximas / pasadas / canceladas
- [ ] Web `/reservations/[id]` — detalle + botón cancelar
- [ ] Lógica de cancelación:
  - Verificar política del club (horas mínimas)
  - Si aplica reembolso: llamar a API de MP para refund
  - Actualizar estado de `reservation` y `payment`

---

### Fase 8 — Notificaciones

**Objetivo**: el usuario recibe confirmaciones y recordatorios.

- [ ] **Email (Resend + React Email)**:
  - Template: `reservation-confirmed.tsx`
  - Template: `reservation-cancelled.tsx`
  - Template: `payment-rejected.tsx`
  - Disparados desde la Edge Function del webhook de MP
- [ ] **Push notifications (Web Push API)**:
  - Service worker configurado con Serwist
  - Endpoint para suscribir al usuario (`/api/push/subscribe`)
  - Enviar push desde Edge Function al confirmar/cancelar reserva
- [ ] **Cron de recordatorio**: Supabase pg_cron envia notificación push + email 2hs antes del turno

---

### Fase 9 — Admin avanzado y PWA

**Objetivo**: pulir la experiencia de admins y hacer la web instalable.

- [ ] Admin `/dashboard` — KPIs reales + gráficos (recharts o tremor)
- [ ] Admin `/clubs/[id]` — calendario semanal de ocupación
- [ ] Admin `/users` + `/users/[id]`
- [ ] Admin `/reports` — gráficos + export CSV
- [ ] Admin `/clubs/[id]/staff` — invitar y gestionar miembros
- [ ] Web: PWA setup con Serwist
  - `manifest.json` (nombre, iconos, colores)
  - Service worker con estrategia cache-first para assets estáticos
  - Prompt de instalación ("Agregá a pantalla de inicio")
- [ ] Web: geolocalización en Home ("Cerca tuyo") usando browser API
- [ ] Optimización de imágenes (next/image para todas las fotos de clubes/canchas)

---

## Orden de prioridad para MVP urgente

Si el tiempo apremia, el orden mínimo para tener algo funcional es:

```
Fase 1 (parcial)  → solo ESLint + Husky + shadcn/ui + Supabase client
Fase 2            → Auth + layouts
Fase 3            → DB completa
Fase 4            → Admin clubs y canchas
Fase 5            → Web discovery
Fase 6            → Pagos ← desbloquea el valor del producto
Fase 7 (parcial)  → Mis reservas en web + gestión básica en admin
```

Las notificaciones, reportes, PWA y el dashboard de KPIs son mejoras iterativas post-lanzamiento.

---

## Consideraciones de seguridad

- `SUPABASE_SERVICE_ROLE_KEY` y `MP_ACCESS_TOKEN` **nunca** en código cliente
- Todo acceso a `club_mp_credentials` solo desde Edge Functions con `service_role`
- Validar firma del webhook de MP antes de procesar (`X-Signature` header)
- Rate limiting en endpoints públicos (usar middleware de Vercel o Edge Function)
- `mp_access_token` en DB debe cifrarse con `pgcrypto` antes de persistir (post-MVP)
- RLS activo en todas las tablas desde el día 1, sin excepciones
