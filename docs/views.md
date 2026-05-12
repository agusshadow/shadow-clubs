# Vistas — Shadow Clubs

Documento de referencia de todas las pantallas de ambas apps, con su ruta en Next.js (App Router) y el detalle de qué se muestra en cada una.

> **Admin** → `apps/admin` → puerto 3000 → desktop-first  
> **Web (PWA)** → `apps/web` → puerto 3001 → mobile-first

---

## Estructura de layouts

### Admin
Usa **route groups** de Next.js para separar autenticación del app principal:

```
(auth)/         → sin sidebar (solo para login)
(app)/          → con sidebar + topbar (requiere auth)
```

### Web (PWA)
```
(auth)/         → sin navegación (login, registro)
(main)/         → con bottom navigation bar (home, explorar, reservas, perfil)
book/           → flujo de reserva full-screen sin bottom nav
```

---

## Admin — Resumen de rutas

| Vista | Ruta | Roles |
|-------|------|-------|
| Login | `/login` | — |
| Dashboard plataforma | `/dashboard` | admin |
| Lista de clubes | `/clubs` | admin, club_owner |
| Crear club | `/clubs/new` | admin |
| Overview del club | `/clubs/[id]` | admin, club_owner, club_administrator |
| Canchas del club | `/clubs/[id]/courts` | admin, club_owner, club_administrator |
| Crear cancha | `/clubs/[id]/courts/new` | admin, club_owner |
| Detalle de cancha | `/clubs/[id]/courts/[courtId]` | admin, club_owner |
| Reservas del club | `/clubs/[id]/reservations` | admin, club_owner, club_administrator |
| Detalle de reserva | `/clubs/[id]/reservations/[reservationId]` | admin, club_owner, club_administrator |
| Staff del club | `/clubs/[id]/staff` | admin, club_owner |
| Configuración del club | `/clubs/[id]/settings` | admin, club_owner |
| Política de cancelación | `/clubs/[id]/policy` | admin, club_owner |
| Facturación / MP | `/clubs/[id]/billing` | admin, club_owner |
| Lista de usuarios | `/users` | admin |
| Detalle de usuario | `/users/[id]` | admin |
| Reportes | `/reports` | admin |

---

## Web (PWA) — Resumen de rutas

| Vista | Ruta | Auth |
|-------|------|------|
| Login | `/login` | — |
| Registro | `/register` | — |
| Home | `/` | no requerida |
| Explorar clubes | `/explore` | no requerida |
| Detalle de club | `/clubs/[slug]` | no requerida |
| Detalle de cancha | `/clubs/[slug]/courts/[courtId]` | no requerida |
| Seleccionar turno | `/book/[courtId]` | requerida |
| Checkout | `/book/[courtId]/checkout` | requerida |
| Confirmación | `/book/confirmation/[reservationId]` | requerida |
| Mis reservas | `/reservations` | requerida |
| Detalle de reserva | `/reservations/[id]` | requerida |
| Mi perfil | `/profile` | requerida |
| Editar perfil | `/profile/edit` | requerida |

---

---

# ADMIN APP

---

## `/login`

**Rol:** todos  
**Layout:** sin sidebar

Pantalla de acceso a la plataforma de administración.

- Formulario: email + contraseña
- Botón "Ingresar"
- Mensaje de error si las credenciales son incorrectas
- Sin opción de registro (los accesos los crea el admin de la plataforma)

---

## `/dashboard`

**Rol:** admin  
**Layout:** con sidebar

Vista de control general de la plataforma. Solo accesible para el superadmin.

- **KPIs superiores** (cards):
  - Total de clubes activos
  - Total de reservas del mes
  - Ingresos totales del mes (en ARS)
  - Comisiones generadas del mes
- **Gráfico de reservas** por día (últimos 30 días)
- **Gráfico de ingresos** por mes (últimos 6 meses)
- **Tabla de últimas reservas** (las 10 más recientes, con link a detalle)
- **Lista de clubes con más actividad** (top 5 por reservas del mes)

> Cuando un `club_owner` inicia sesión, es redirigido directamente a `/clubs` (no tiene acceso a este dashboard).

---

## `/clubs`

**Rol:** admin (ve todos), club_owner (ve solo los suyos)  
**Layout:** con sidebar

Listado de clubes.

- **Buscador** por nombre
- **Filtros**: ciudad, provincia, estado (activo/inactivo)
- **Tabla** con columnas: nombre, ciudad, canchas, reservas del mes, estado, acciones
- **Botón "Nuevo club"** (solo admin)
- Al hacer click en un club → navega a `/clubs/[id]`

---

## `/clubs/new`

**Rol:** admin  
**Layout:** con sidebar

Formulario de creación de nuevo club.

- Nombre del club
- Descripción
- Dirección completa (calle, número, ciudad, provincia)
- Coordenadas (lat/lng): campo de texto o picker en mapa
- Teléfono y email de contacto
- Website (opcional)
- Upload de logo y foto de portada (Supabase Storage)
- Selección del `club_owner`: dropdown de usuarios existentes con rol admin/user
- Botón "Crear club"

---

## `/clubs/[id]`

**Rol:** admin, club_owner, club_administrator  
**Layout:** con sidebar

Dashboard del club. Punto de entrada principal para el staff.

- **Header**: logo, nombre, dirección, estado (activo/inactivo)
- **KPIs del club** (cards):
  - Reservas de hoy
  - Reservas de la semana
  - Ingresos del mes
  - Ocupación promedio (%)
- **Calendario semanal**: vista de todos los turnos de la semana con estado (libre / reservado / bloqueado) por cancha
- **Últimas reservas** (tabla con las 5 más recientes)
- **Accesos rápidos**: botones a Canchas, Reservas, Staff, Configuración

---

## `/clubs/[id]/courts`

**Rol:** admin, club_owner, club_administrator  
**Layout:** con sidebar

Lista de canchas del club.

- **Cards** por cancha: foto, nombre, deporte, superficie, estado (activa/inactiva)
- Indicador de ocupación del día para cada cancha
- **Botón "Nueva cancha"** (admin y club_owner)
- Click en una cancha → navega a `/clubs/[id]/courts/[courtId]`

---

## `/clubs/[id]/courts/new`

**Rol:** admin, club_owner  
**Layout:** con sidebar

Formulario de creación de cancha.

- Nombre de la cancha (ej: "Cancha 1", "Cancha Fútbol 5 A")
- Deporte (select del enum `sport_type`)
- Tipo de superficie (select del enum `surface_type`)
- Cubierta / descubierta (toggle)
- Capacidad de jugadores (número)
- Descripción (opcional)
- Upload de fotos (múltiple, hasta 5)
- Botón "Crear cancha"

---

## `/clubs/[id]/courts/[courtId]`

**Rol:** admin, club_owner  
**Layout:** con sidebar

Detalle y configuración de una cancha específica. Vista con tabs.

**Tab: Información**
- Todos los datos editables de la cancha
- Galería de fotos con opción de agregar/reordenar/eliminar
- Botón "Guardar cambios"
- Toggle activar/desactivar cancha

**Tab: Turnos (Slots)**
- Vista semanal de los turnos configurados (lunes a domingo)
- Por cada día: lista de turnos con hora de inicio, hora de fin y precio
- Botón "Agregar turno" por día
- Click en un turno existente: editar precio, horario o eliminar
- Posibilidad de copiar la configuración de un día a otros días

**Tab: Bloqueos**
- Calendario mensual donde se ven los días bloqueados (en rojo)
- Botón "Bloquear fecha": seleccionar fecha, rango horario (o todo el día), motivo
- Lista de bloqueos futuros con opción de eliminar

---

## `/clubs/[id]/reservations`

**Rol:** admin, club_owner, club_administrator  
**Layout:** con sidebar

Gestión de reservas del club.

- **Filtros**: fecha (date picker), cancha (select), estado (select: confirmada, pendiente, cancelada, completada)
- **Vista dual**:
  - **Tabla**: fecha, hora, cancha, usuario, monto, estado, acciones
  - **Calendario**: vista mensual/semanal con turnos coloreados por estado
- Posibilidad de cambiar entre vista tabla y calendario
- **Acciones inline** en tabla: ver detalle, cancelar (si la política lo permite)
- Paginación

---

## `/clubs/[id]/reservations/[reservationId]`

**Rol:** admin, club_owner, club_administrator  
**Layout:** con sidebar

Detalle completo de una reserva.

- **Datos de la reserva**: cancha, fecha, hora, duración
- **Datos del usuario**: nombre, apellido, email, teléfono
- **Datos del pago**: total pagado, comisión de plataforma, monto al club, método de pago, ID de MP, estado
- **Estado actual** con badge de color
- **Línea de tiempo** (timeline): cuándo se creó, cuándo se pagó, si fue cancelada
- **Botón "Cancelar reserva"**: solo si el estado lo permite; pide confirmación y muestra si aplica reembolso según la política del club
- Si fue cancelada: motivo, quién canceló y cuándo, monto reembolsado

---

## `/clubs/[id]/staff`

**Rol:** admin, club_owner  
**Layout:** con sidebar

Gestión del equipo del club.

- **Lista de miembros activos**: avatar, nombre, apellido, email, rol, fecha de incorporación
- **Botón "Invitar miembro"**: modal con campo de email + selección de rol (`club_administrator`)
  - Si el email ya tiene cuenta en la plataforma → se agrega directamente
  - Si no tiene cuenta → se envía email de invitación
- Opción de cambiar rol o desactivar un miembro
- El `club_owner` aparece listado pero no puede ser eliminado desde aquí (solo desde el admin de plataforma)

---

## `/clubs/[id]/settings`

**Rol:** admin, club_owner  
**Layout:** con sidebar

Configuración general del club.

- Formulario editable con todos los datos del club: nombre, descripción, dirección, lat/lng, teléfono, email, website
- Upload/cambio de logo y foto de portada
- Toggle "Club activo / inactivo"
- Botón "Guardar cambios"

---

## `/clubs/[id]/policy`

**Rol:** admin, club_owner  
**Layout:** con sidebar

Configuración de la política de cancelación del club.

- **Política actual** resumida en texto legible (ej: "Los usuarios pueden cancelar hasta 24 horas antes. Reembolso del 100%.")
- **Formulario de edición**:
  - Anticipación mínima para cancelar (horas): número
  - Tipo de reembolso: radio entre "Reembolso completo", "Reembolso parcial", "Sin reembolso"
  - Si parcial: slider o input de porcentaje (0–100%)
- Botón "Guardar política"
- Nota aclaratoria: la nueva política aplica solo a reservas futuras, no afecta reservas existentes

---

## `/clubs/[id]/billing`

**Rol:** admin, club_owner  
**Layout:** con sidebar

Conexión de Mercado Pago y estado de facturación.

- **Estado de conexión MP**:
  - Si no está conectado: banner de advertencia + botón "Conectar cuenta de Mercado Pago" (inicia OAuth)
  - Si está conectado: nombre de la cuenta MP, estado activo, fecha de conexión, botón "Desconectar"
- **Nota**: sin cuenta MP conectada, la cancha no puede recibir reservas con pago online
- **Historial de liquidaciones** (futuro): tabla de transferencias recibidas desde la plataforma

---

## `/users`

**Rol:** admin  
**Layout:** con sidebar

Listado de todos los usuarios de la plataforma (usuarios finales + staff de clubs).

- **Buscador** por nombre, apellido o email
- **Filtro** por rol de plataforma
- **Tabla**: avatar, nombre, apellido, email, rol, fecha de registro, cantidad de reservas, acciones
- Click en un usuario → `/users/[id]`

---

## `/users/[id]`

**Rol:** admin  
**Layout:** con sidebar

Detalle de un usuario específico.

- Datos del perfil: nombre, apellido, email, teléfono, avatar, fecha de registro
- Rol de plataforma con opción de cambiar
- Si es staff de algún club: lista de clubes y su rol en cada uno
- **Historial de reservas** del usuario (tabla con las últimas 20)
- Botón "Desactivar cuenta" (soft delete)

---

## `/reports`

**Rol:** admin  
**Layout:** con sidebar

Reportes y analíticas globales de la plataforma.

- **Selector de período**: últimos 7 días / 30 días / 3 meses / 6 meses / año / rango custom
- **KPIs del período**: reservas totales, ingresos totales, comisiones totales, usuarios nuevos
- **Gráfico de ingresos** vs comisiones por mes
- **Gráfico de reservas por deporte** (torta o barras)
- **Tabla de clubes**: ranking por ingresos generados en el período
- **Tabla de canchas más reservadas**
- **Botón "Exportar CSV"**: exporta los datos de la tabla activa

---

---

# WEB APP (PWA)

---

## `/login`

**Auth:** no requerida  
**Layout:** sin bottom nav

Pantalla de acceso para usuarios finales.

- Botón "Continuar con Google" (OAuth via Supabase)
- Separador "o"
- Formulario: email + contraseña
- Link "¿No tenés cuenta? Registrate"
- Link "Olvidé mi contraseña"

---

## `/register`

**Auth:** no requerida  
**Layout:** sin bottom nav

Registro de nuevo usuario.

- Formulario: nombre, apellido, email, contraseña, teléfono (opcional)
- Checkbox de aceptación de términos
- Botón "Crear cuenta"
- Link "¿Ya tenés cuenta? Ingresá"

---

## `/`

**Auth:** no requerida  
**Layout:** con bottom nav (Home activo)

Home de la app. Primera pantalla que ve el usuario.

- **Barra de búsqueda** destacada arriba: "¿Qué deporte querés jugar?"
- **Accesos rápidos por deporte**: íconos horizontales scrolleables (Fútbol 5, Tenis, Pádel, etc.)
- **Sección "Cerca tuyo"**: cards horizontales scrolleables con clubes cercanos (requiere permiso de ubicación; si no hay permiso, muestra "Activá tu ubicación")
- **Sección "Reservas próximas"**: si el usuario está logueado y tiene reservas futuras, muestra las próximas 2 como cards
- **Sección "Explorar por ciudad"**: lista de ciudades populares como acceso directo

---

## `/explore`

**Auth:** no requerida  
**Layout:** con bottom nav (Explorar activo)

Búsqueda y filtrado de clubes y canchas.

- **Barra de búsqueda** siempre visible arriba
- **Chips de filtro**: deporte, superficie, cubierta/descubierta, distancia
- **Toggle vista**: lista o mapa (el mapa es una mejora futura)
- **Lista de clubs**: cards con foto de portada, nombre, ciudad, deportes disponibles, rango de precios (desde $X)
- Paginación con scroll infinito
- Si no hay resultados: ilustración + sugerencia de ampliar búsqueda

---

## `/clubs/[slug]`

**Auth:** no requerida  
**Layout:** con bottom nav

Detalle de un club.

- **Hero**: foto de portada + logo superpuesto, nombre del club
- **Info rápida**: ciudad, dirección, teléfono (click para llamar), horario general
- **Deportes disponibles**: chips con los deportes del club
- **Sección "Canchas"**: lista de canchas con foto, nombre, deporte, superficie, precio desde $X, botón "Ver disponibilidad"
- **Cómo llegar**: dirección con link a Google Maps (href con lat/lng)

---

## `/clubs/[slug]/courts/[courtId]`

**Auth:** no requerida (para ver), requerida (para reservar)  
**Layout:** con bottom nav

Detalle de una cancha específica.

- **Galería de fotos**: carrusel horizontal con fotos de la cancha
- **Info**: nombre, deporte, superficie, cubierta/descubierta, capacidad
- **Descripción**
- **Selector de fecha**: calendar picker (solo habilita días con turnos configurados)
- **Turnos disponibles**: al seleccionar una fecha, muestra los slots del día con precio y estado (disponible / ocupado)
- Slots disponibles son clickeables → navegan a `/book/[courtId]?date=...&slot=...`
- Slots ocupados aparecen en gris y no son clickeables
- **Política de cancelación del club**: texto resumido al pie (ej: "Cancelación hasta 24hs antes. Reembolso completo.")

---

## `/book/[courtId]`

**Auth:** requerida  
**Layout:** full screen sin bottom nav (flujo de reserva)

Paso 1 del flujo de reserva: confirmación del turno seleccionado.

- **Header**: flecha de volver + título "Confirmá tu reserva"
- **Resumen del turno**:
  - Nombre de la cancha + club
  - Deporte e ícono
  - Fecha (ej: "Sábado 14 de junio")
  - Horario (ej: "20:00 - 21:00")
- **Desglose de precios**:
  - Precio del turno: $X
  - Comisión de plataforma: $Y
  - **Total a pagar: $Z**
- **Botón "Ir al pago"** → navega a `/book/[courtId]/checkout`

---

## `/book/[courtId]/checkout`

**Auth:** requerida  
**Layout:** full screen sin bottom nav

Paso 2: pago mediante Mercado Pago.

- **Resumen compacto** del turno (nombre, fecha, hora, total)
- **Botón "Pagar con Mercado Pago"**: abre el checkout de MP (puede ser redirect o modal/brick de MP)
- Nota de seguridad: "El pago es procesado de forma segura por Mercado Pago"
- Una vez completado el pago, MP redirige a `/book/confirmation/[reservationId]`

> En implementación: usar **MP Bricks** (Payment Brick) para mantener al usuario dentro de la app en lugar de redirigir a MP.

---

## `/book/confirmation/[reservationId]`

**Auth:** requerida  
**Layout:** full screen sin bottom nav

Pantalla de éxito post-pago.

- **Ícono de check** animado (éxito) o ícono de error (si el pago fue rechazado)
- **Si exitoso**:
  - "¡Reserva confirmada!"
  - Resumen: cancha, club, fecha, hora
  - Número de reserva
  - Botón "Ver mis reservas" → `/reservations`
  - Botón "Volver al inicio" → `/`
- **Si fallido**:
  - "El pago no pudo procesarse"
  - Botón "Intentar nuevamente" → vuelve al checkout
  - Botón "Cancelar" → `/`

---

## `/reservations`

**Auth:** requerida  
**Layout:** con bottom nav (Reservas activo)

Historial de reservas del usuario.

- **Tabs**: "Próximas" / "Pasadas" / "Canceladas"
- **Cards por reserva**:
  - Nombre del club + cancha
  - Fecha y horario
  - Deporte con ícono
  - Estado (badge): Confirmada / Pendiente / Cancelada / Completada
  - Monto pagado
- Click en una card → `/reservations/[id]`
- Si no hay reservas en el tab activo: ilustración + CTA para explorar canchas

---

## `/reservations/[id]`

**Auth:** requerida  
**Layout:** con bottom nav

Detalle de una reserva del usuario.

- **Datos del turno**: club, cancha, deporte, fecha, horario, duración
- **Estado** con badge de color
- **Desglose del pago**: precio del turno, comisión, total
- **Método de pago**: ícono + texto (ej: "Visa terminada en 4242")
- **Número de reserva** y número de transacción de MP
- **Cómo llegar**: dirección del club con link a Google Maps
- **Botón "Cancelar reserva"**: visible solo si:
  - El estado es `confirmed`
  - Se cumple el mínimo de anticipación según la política del club
  - Al presionar: modal de confirmación con detalle del reembolso que recibirá
- **Si fue cancelada**: fecha de cancelación + información del reembolso (monto y plazo estimado)

---

## `/profile`

**Auth:** requerida  
**Layout:** con bottom nav (Perfil activo)

Perfil del usuario.

- **Avatar** (iniciales si no tiene foto) + nombre completo + email
- **Accesos rápidos**:
  - Editar perfil → `/profile/edit`
  - Mis reservas → `/reservations`
  - Ayuda / Soporte (link externo o mailto)
  - Términos y condiciones
  - Política de privacidad
- **Botón "Cerrar sesión"** al pie, en rojo

---

## `/profile/edit`

**Auth:** requerida  
**Layout:** con bottom nav

Edición del perfil del usuario.

- Foto de perfil (upload o seleccionar de galería)
- Nombre (first_name)
- Apellido (last_name)
- Teléfono
- Email (solo lectura si registró con Google)
- Botón "Guardar cambios"
- Botón "Cambiar contraseña" (solo si no es OAuth): envía email de reset via Supabase
