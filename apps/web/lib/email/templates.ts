interface ReservationData {
  userName: string
  courtName: string
  clubName: string
  clubAddress: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM:SS
  endTime: string // HH:MM:SS
  totalAmount: number
  reservationId: string
  webUrl: string
}

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#18181b;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">Shadow Clubs</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#71717a;font-size:12px;">
            Shadow Clubs · El pago fue procesado por Mercado Pago.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

export function reservationConfirmedEmail(data: ReservationData): {
  subject: string
  html: string
} {
  const subject = `¡Reserva confirmada! ${data.courtName} · ${formatDate(data.date)}`

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">¡Tu reserva está confirmada!</h1>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;">Hola ${data.userName}, tu turno quedó reservado exitosamente.</p>

    <table width="100%" style="background:#f9f9fb;border-radius:8px;padding:20px;margin-bottom:24px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:4px 0;">
        <p style="margin:0;font-size:13px;color:#71717a;">Cancha</p>
        <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:#18181b;">${data.courtName}</p>
      </td></tr>
      <tr><td style="padding:4px 0;">
        <p style="margin:0;font-size:13px;color:#71717a;">Club</p>
        <p style="margin:2px 0 0;font-size:15px;color:#18181b;">${data.clubName}</p>
      </td></tr>
      <tr><td style="padding:4px 0;">
        <p style="margin:0;font-size:13px;color:#71717a;">Dirección</p>
        <p style="margin:2px 0 0;font-size:15px;color:#18181b;">${data.clubAddress}</p>
      </td></tr>
      <tr><td style="padding:4px 0;">
        <p style="margin:0;font-size:13px;color:#71717a;">Fecha</p>
        <p style="margin:2px 0 0;font-size:15px;color:#18181b;text-transform:capitalize;">${formatDate(data.date)}</p>
      </td></tr>
      <tr><td style="padding:4px 0;">
        <p style="margin:0;font-size:13px;color:#71717a;">Horario</p>
        <p style="margin:2px 0 0;font-size:15px;color:#18181b;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}</p>
      </td></tr>
      <tr><td style="padding:12px 0 4px;border-top:1px solid #e4e4e7;">
        <p style="margin:0;font-size:13px;color:#71717a;">Total pagado</p>
        <p style="margin:2px 0 0;font-size:17px;font-weight:700;color:#18181b;">$${Number(data.totalAmount).toLocaleString('es-AR')}</p>
      </td></tr>
    </table>

    <a href="${data.webUrl}/reservations/${data.reservationId}"
       style="display:block;text-align:center;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;">
      Ver mi reserva
    </a>`

  return { subject, html: baseLayout(subject, content) }
}

export function reservationCancelledEmail(data: ReservationData): {
  subject: string
  html: string
} {
  const subject = `Reserva cancelada · ${data.courtName} ${formatDate(data.date)}`

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Reserva cancelada</h1>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;">
      Hola ${data.userName}, tu reserva del ${formatDate(data.date)} en
      <strong>${data.courtName}</strong> — ${data.clubName} fue cancelada.
    </p>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;">
      Si el club tiene política de reembolso vigente, lo recibirás en los próximos días hábiles.
    </p>
    <a href="${data.webUrl}/explore"
       style="display:block;text-align:center;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;">
      Buscar otro turno
    </a>`

  return { subject, html: baseLayout(subject, content) }
}

export function paymentRejectedEmail(
  data: Pick<ReservationData, 'userName' | 'courtName' | 'clubName' | 'date' | 'webUrl'>
): { subject: string; html: string } {
  const subject = `El pago no pudo procesarse · ${data.courtName}`

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">El pago no se procesó</h1>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;">
      Hola ${data.userName}, no pudimos procesar el pago para
      <strong>${data.courtName}</strong> — ${data.clubName} el ${formatDate(data.date)}.
      El turno quedó liberado.
    </p>
    <a href="${data.webUrl}/explore"
       style="display:block;text-align:center;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;">
      Intentar de nuevo
    </a>`

  return { subject, html: baseLayout(subject, content) }
}
