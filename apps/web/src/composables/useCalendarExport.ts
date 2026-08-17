export interface CalendarEvent {
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  location?: string
}

function formatICSDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function generateICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ModApp//Science Platform//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events) {
    const end = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@modapp`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(event.startDate)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${escapeICS(event.title)}`,
    )
    if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`)
    if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadICS(events: CalendarEvent[], filename = 'modapp-calendar.ics') {
  const ics = generateICS(events)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function generateGoogleCalendarURL(event: CalendarEvent): string {
  const fmt = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  }
  const end = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(event.startDate)}/${fmt(end)}`,
    detail: event.description || '',
    location: event.location || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
