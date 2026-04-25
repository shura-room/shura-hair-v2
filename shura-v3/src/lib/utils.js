export const fmtTime = iso => {
  const d = new Date(iso)
  let h = d.getHours(), m = d.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2,'0')} ${ap}`
}

export const fmtDate = iso => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { month:'short', day:'numeric', year:'numeric' })
}

export const genId = () => Math.random().toString(36).slice(2, 9)
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)
export const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
export const SLOT_H = 56
