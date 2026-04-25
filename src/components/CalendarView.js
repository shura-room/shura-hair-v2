'use client'
import { useState, useRef } from 'react'
import { fmtTime, HOURS, WEEKDAYS, SLOT_H } from '@/lib/utils'

const TODAY = new Date()

export default function CalendarView({ appts, clients, services, staff, daysOff, onAddAppt, onApptClick, onUpdateAppt }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const [dragging, setDragging] = useState(null)
  const [ghostTop, setGhostTop] = useState(null)
  const [ghostTime, setGhostTime] = useState(null)
  const [dragCol, setDragCol] = useState(null)
  const colRefs = useRef({})

  const snapTo15 = mins => Math.round(mins / 15) * 15

  const getWeekStart = offset => {
    const d = new Date(TODAY)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff + offset * 7)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const weekStart = getWeekStart(weekOffset)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })

  const weekLabel = () => {
    const s = weekStart.toLocaleDateString('en-AU', { month:'short', day:'numeric' })
    const e = weekDays[6].toLocaleDateString('en-AU', { month:'short', day:'numeric', year:'numeric' })
    return `${s} – ${e}`
  }

  const selDateStr = selectedDay.toISOString().slice(0, 10)
  const selWD = selectedDay.getDay()
  const isOff = sid => daysOff.some(d => d.stylistId === sid && (
    (d.type === 'single' && d.date === selDateStr) ||
    (d.type === 'recurring' && d.weekday === selWD)
  ))

  const dayAppts = appts.filter(a => new Date(a.start).toDateString() === selectedDay.toDateString())

  const getStyle = appt => {
    const s = new Date(appt.start), e = new Date(appt.end)
    const sh = s.getHours() + s.getMinutes() / 60
    const eh = e.getHours() + e.getMinutes() / 60
    const st = staff.find(x => x.id === appt.stylistId)
    return {
      top: (sh - 8) * SLOT_H, height: Math.max((eh - sh) * SLOT_H, 28),
      background: (st?.color || '#B8281A') + '25',
      borderLeft: `3px solid ${st?.color || '#B8281A'}`,
      color: st?.color || '#B8281A',
    }
  }

  const handleWeekChange = dir => {
    const no = weekOffset + dir
    setWeekOffset(no)
    if (no === 0) setSelectedDay(new Date(TODAY))
    else setSelectedDay(new Date(getWeekStart(no)))
  }

  // Drag
  const onDragStart = (e, appt, stylistId) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setDragging({ appt, offsetY: e.clientY - rect.top, stylistId })
    setGhostTop(getStyle(appt).top)
    setGhostTime(fmtTime(appt.start))
    setDragCol(stylistId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(new Image(), 0, 0)
  }

  const onColDragOver = (e, sid) => {
    e.preventDefault()
    if (!dragging || !colRefs.current[sid]) return
    const rect = colRefs.current[sid].getBoundingClientRect()
    const rawY = e.clientY - rect.top - dragging.offsetY
    const snapped = snapTo15(Math.max(0, rawY) / SLOT_H * 60)
    const newTop = snapped / 60 * SLOT_H
    setGhostTop(newTop)
    setDragCol(sid)
    const totalMins = snapped + 8 * 60
    const hh = Math.floor(totalMins / 60), mm = totalMins % 60
    const ap = hh >= 12 ? 'PM' : 'AM', h12 = hh % 12 || 12
    setGhostTime(`${h12}:${String(mm).padStart(2,'0')} ${ap}`)
  }

  const onColDrop = (e, sid) => {
    e.preventDefault()
    if (!dragging) return
    const { appt } = dragging
    const dur = new Date(appt.end) - new Date(appt.start)
    const snapped = snapTo15(ghostTop / SLOT_H * 60)
    const totalMins = snapped + 8 * 60
    const newStart = new Date(selectedDay)
    newStart.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0)
    const newEnd = new Date(newStart.getTime() + dur)
    onUpdateAppt({ ...appt, stylistId: sid, start: newStart.toISOString(), end: newEnd.toISOString() })
    setDragging(null); setGhostTop(null); setGhostTime(null); setDragCol(null)
  }

  const DAYNAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']
  const isToday = d => d.toDateString() === TODAY.toDateString()
  const isSelected = d => d.toDateString() === selectedDay.toDateString()
  const countAppts = d => appts.filter(a => new Date(a.start).toDateString() === d.toDateString()).length

  return (
    <div>
      {/* Week nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button className="btn btn-ghost btn-xs" onClick={() => handleWeekChange(-1)}>‹</button>
          <div>
            <div style={{ fontSize:12, fontWeight:600 }}>{weekLabel()}</div>
            {weekOffset === 0 && <div style={{ fontSize:9, color:'var(--red)', letterSpacing:1, fontWeight:600 }}>THIS WEEK</div>}
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => handleWeekChange(1)}>›</button>
          {weekOffset !== 0 && (
            <button className="btn btn-ghost btn-xs" onClick={() => { setWeekOffset(0); setSelectedDay(new Date(TODAY)) }}>Today</button>
          )}
        </div>
        <button className="btn btn-red btn-sm" onClick={() => onAddAppt({ date: selDateStr })}>+ New</button>
      </div>

      {/* Day pills */}
      <div style={{ display:'flex', gap:4, marginBottom:12 }}>
        {weekDays.map((d, i) => {
          const cnt = countAppts(d), sel = isSelected(d), tod = isToday(d)
          return (
            <div key={i} className={`day-pill ${tod ? 'today' : ''} ${sel ? 'selected' : ''}`}
              onClick={() => setSelectedDay(new Date(d))}>
              <div style={{ fontSize:8, letterSpacing:1, textTransform:'uppercase', fontWeight:600,
                color: sel ? 'rgba(250,247,242,0.6)' : 'var(--muted)', marginBottom:2 }}>{DAYNAMES[d.getDay()]}</div>
              <div style={{ fontSize:15, fontFamily:'Playfair Display,serif',
                color: sel ? '#FAF7F2' : tod ? 'var(--red)' : 'var(--text)' }}>{d.getDate()}</div>
              {cnt > 0 ? (
                <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:3 }}>
                  {Array.from({ length: Math.min(cnt, 4) }, (_, j) => (
                    <div key={j} style={{ width:3, height:3, borderRadius:'50%',
                      background: sel ? 'rgba(250,247,242,0.5)' : 'var(--red)' }} />
                  ))}
                </div>
              ) : <div style={{ height:6 }} />}
            </div>
          )
        })}
      </div>

      {/* Selected day label */}
      <div style={{ fontSize:11, color:'var(--muted)', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
        {selectedDay.toLocaleDateString('en-AU', { weekday:'long', month:'long', day:'numeric' })}
        {isToday(selectedDay) && <span style={{ color:'var(--red)', fontWeight:600, fontSize:9, letterSpacing:1.5 }}>TODAY</span>}
      </div>

      {/* Day off banners */}
      {staff.filter(s => isOff(s.id)).map(s => (
        <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8,
          padding:'8px 12px', background:'var(--beige-light)', border:'1px solid var(--border)',
          borderRadius:2, fontSize:11, color:'var(--muted)' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--beige)' }} />
          <span style={{ color:'var(--text)', fontWeight:600 }}>{s.name}</span> — Day Off
        </div>
      ))}

      {/* Calendar grid */}
      <div className="cal-wrap">
        <div className="cal-grid" style={{ borderBottom:'1px solid var(--border)' }}>
          <div className="cal-header" />
          {staff.map(s => (
            <div key={s.id} className="cal-header stylist" style={{ color: s.color }}>{s.name}</div>
          ))}
        </div>
        <div className="cal-grid">
          <div className="time-col">
            {HOURS.map(h => <div key={h} className="time-slot">{h <= 12 ? `${h}a` : `${h-12}p`}</div>)}
          </div>
          {staff.map(s => {
            const off = isOff(s.id)
            const cols = dayAppts.filter(a => a.stylistId === s.id)
            const isTarget = dragCol === s.id
            return (
              <div key={s.id} className="stylist-col"
                ref={el => { colRefs.current[s.id] = el }}
                onDragOver={e => !off && onColDragOver(e, s.id)}
                onDrop={e => !off && onColDrop(e, s.id)}>
                {isTarget && dragging && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(184,40,26,0.04)',
                    border:'2px dashed rgba(184,40,26,0.3)', borderRadius:2, zIndex:1, pointerEvents:'none' }} />
                )}
                {HOURS.map(h => (
                  <div key={h} className={`appt-slot${off ? ' dayoff' : ''}`}
                    onClick={() => !off && !dragging && onAddAppt({ stylistId: s.id, hour: h, date: selDateStr })} />
                ))}
                {off && <div className="dayoff-banner">Day Off</div>}
                {isTarget && dragging && ghostTop !== null && (() => {
                  const orig = getStyle(dragging.appt)
                  return (
                    <div style={{ position:'absolute', left:3, right:3, top:ghostTop, height:orig.height,
                      borderRadius:2, background:'rgba(184,40,26,0.12)', border:'2px dashed var(--red)',
                      zIndex:20, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:10, fontWeight:700, color:'var(--red)' }}>{ghostTime}</span>
                    </div>
                  )
                })()}
                {!off && cols.map(appt => {
                  const cl = clients.find(c => c.id === appt.clientId)
                  const svcs = (appt.serviceIds || []).map(id => services.find(sv => sv.id === id)?.name).filter(Boolean).join(', ')
                  const st = getStyle(appt)
                  const isDraggingThis = dragging?.appt.id === appt.id
                  return (
                    <div key={appt.id} className="appt-block" draggable
                      onDragStart={e => onDragStart(e, appt, s.id)}
                      onDragEnd={() => { setDragging(null); setGhostTop(null); setGhostTime(null); setDragCol(null) }}
                      style={{ ...st, cursor:'grab', opacity: isDraggingThis ? 0.3 : 1 }}
                      onClick={e => { if (!dragging) { e.stopPropagation(); onApptClick(appt) } }}>
                      <div className="appt-name">{cl?.name || '?'}</div>
                      <div className="appt-svc">{svcs}</div>
                      <div style={{ fontSize:9, opacity:0.65, marginTop:1 }}>{fmtTime(appt.start)} – {fmtTime(appt.end)}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day summary */}
      <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
        {staff.map(s => {
          const sa = dayAppts.filter(a => a.stylistId === s.id)
          const rev = sa.reduce((sum, a) => sum + (a.serviceIds||[]).reduce((s2, sid) => s2 + (services.find(sv => sv.id === sid)?.price || 0), 0), 0)
          return (
            <div key={s.id} className="stat-card">
              <div style={{ fontSize:9, color: s.color, letterSpacing:2, textTransform:'uppercase', marginBottom:6, fontWeight:600 }}>{s.name.split(' ')[0]}</div>
              <div className="stat-val" style={{ fontSize:22 }}>{sa.length}</div>
              <div className="stat-label">${rev}</div>
            </div>
          )
        })}
        <div className="stat-card">
          <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, textTransform:'uppercase', marginBottom:6, fontWeight:600 }}>Total</div>
          <div className="stat-val" style={{ fontSize:22 }}>
            ${dayAppts.reduce((sum, a) => sum + (a.serviceIds||[]).reduce((s2, sid) => s2 + (services.find(sv => sv.id === sid)?.price || 0), 0), 0)}
          </div>
          <div className="stat-label">Revenue</div>
        </div>
      </div>
    </div>
  )
}
