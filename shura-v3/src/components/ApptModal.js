'use client'
import { useState } from 'react'
import Modal from './Modal'
import { fmtTime } from '@/lib/utils'

const TODAY = new Date()

export default function ApptModal({ appt, clients, services, staff, onSave, onClose, onDelete, prefill, onAddClient, genId }) {
  const isNew = !appt
  const [clientId, setClientId] = useState(appt?.clientId || '')
  const [stylistId, setStylistId] = useState(appt?.stylistId || prefill?.stylistId || staff[0]?.id || '')
  const [serviceIds, setServiceIds] = useState(appt?.serviceIds || [])
  const [date, setDate] = useState(() => appt ? new Date(appt.start).toISOString().slice(0,10) : prefill?.date || TODAY.toISOString().slice(0,10))
  const [startTime, setStartTime] = useState(() => {
    if (appt) return new Date(appt.start).toTimeString().slice(0,5)
    const h = prefill?.hour || 10
    return `${String(h).padStart(2,'0')}:00`
  })
  const [notes, setNotes] = useState(appt?.notes || '')
  const [addingClient, setAddingClient] = useState(false)
  const [newClient, setNewClient] = useState({ name:'', phone:'', email:'', tag:'new', notes:'' })
  const [clientSearch, setClientSearch] = useState('')

  const toggleSvc = id => setServiceIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const totalMin = serviceIds.reduce((s, id) => s + (services.find(sv => sv.id === id)?.duration || 0), 0)
  const totalPrice = serviceIds.reduce((s, id) => s + (services.find(sv => sv.id === id)?.price || 0), 0)
  const calcEnd = () => {
    if (!startTime || !serviceIds.length) return startTime
    const [hh, mm] = startTime.split(':').map(Number)
    const e = new Date(2000, 0, 1, hh, mm + totalMin)
    return `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}`
  }
  const endTime = calcEnd()

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.phone || '').includes(clientSearch)
  )
  const selectedClient = clients.find(c => c.id === clientId)

  const handleSaveNewClient = async () => {
    if (!newClient.name.trim()) return
    const created = { ...newClient, id: genId(), totalSpend: 0, lastVisit: '' }
    await onAddClient(created)
    setClientId(created.id)
    setAddingClient(false)
    setNewClient({ name:'', phone:'', email:'', tag:'new', notes:'' })
  }

  const handleSave = () => {
    if (!clientId || !stylistId || !serviceIds.length) return
    const start = new Date(`${date}T${startTime}`).toISOString()
    const end = new Date(`${date}T${endTime}`).toISOString()
    onSave({ id: appt?.id || genId(), clientId, stylistId, serviceIds, start, end, notes,
      status: appt?.status || 'confirmed', paid: appt?.paid || false, tip: appt?.tip || 0 })
  }

  return (
    <Modal title={isNew ? 'New Appointment' : 'Edit Appointment'} onClose={onClose}
      footer={<>
        {!isNew && <button className="btn btn-danger btn-sm" onClick={() => onDelete(appt.id)}>Delete</button>}
        <div style={{ flex:1 }} />
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-red btn-sm" onClick={handleSave}>Save</button>
      </>}>

      {/* Client picker */}
      <div className="form-group">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <label className="form-label" style={{ margin:0 }}>Client</label>
          {!addingClient && (
            <button onClick={() => { setAddingClient(true); setClientId('') }}
              style={{ background:'none', border:'none', color:'var(--red)', fontSize:11,
                fontWeight:600, letterSpacing:1, textTransform:'uppercase', cursor:'pointer',
                padding:0, textDecoration:'underline', textUnderlineOffset:2 }}>
              + New Client
            </button>
          )}
        </div>

        {addingClient ? (
          <div style={{ background:'var(--bg)', border:'1.5px solid var(--red)', borderRadius:3, padding:14 }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--red)', fontWeight:600, marginBottom:10 }}>New Client</div>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={newClient.name} autoFocus
                onChange={e => setNewClient({ ...newClient, name:e.target.value })} placeholder="Full name" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={newClient.phone} placeholder="04xx xxx xxx"
                  onChange={e => setNewClient({ ...newClient, phone:e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={newClient.email} placeholder="optional"
                  onChange={e => setNewClient({ ...newClient, email:e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tag</label>
              <div style={{ display:'flex', gap:8 }}>
                {['new','regular'].map(t => (
                  <div key={t} onClick={() => setNewClient({ ...newClient, tag:t })}
                    style={{ flex:1, textAlign:'center', padding:'8px', borderRadius:2, fontSize:11,
                      cursor:'pointer', fontWeight:600, letterSpacing:1, textTransform:'uppercase',
                      background: newClient.tag === t ? 'var(--red-dim)' : 'var(--surface)',
                      border: `1.5px solid ${newClient.tag === t ? 'var(--red)' : 'var(--border)'}`,
                      color: newClient.tag === t ? 'var(--red)' : 'var(--muted)' }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hair Notes</label>
              <textarea className="form-input form-textarea" style={{ minHeight:60 }}
                value={newClient.notes} placeholder="Colour formula, allergies, preferences…"
                onChange={e => setNewClient({ ...newClient, notes:e.target.value })} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-red btn-sm" onClick={handleSaveNewClient}>Add & Select</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setAddingClient(false); setNewClient({ name:'', phone:'', email:'', tag:'new', notes:'' }) }}>Cancel</button>
            </div>
          </div>
        ) : selectedClient ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 14px', background:'var(--red-dim)', border:'1.5px solid var(--red)', borderRadius:3 }}>
            <div>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:15 }}>{selectedClient.name}</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{selectedClient.phone}</div>
              {selectedClient.notes && (
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:2, fontStyle:'italic',
                  maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {selectedClient.notes.slice(0, 55)}{selectedClient.notes.length > 55 ? '…' : ''}
                </div>
              )}
            </div>
            <button onClick={() => { setClientId(''); setClientSearch('') }}
              style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer', lineHeight:1, marginLeft:10 }}>×</button>
          </div>
        ) : (
          <div>
            <input className="form-input" value={clientSearch} placeholder="Search by name or phone…"
              onChange={e => setClientSearch(e.target.value)} style={{ marginBottom:6 }} />
            <div style={{ maxHeight:160, overflowY:'auto', border:'1px solid var(--border)', borderRadius:3, background:'var(--surface)' }}>
              {filtered.length === 0 ? (
                <div style={{ padding:'12px 14px', fontSize:12, color:'var(--muted)', fontStyle:'italic', textAlign:'center' }}>
                  No match — tap <span style={{ color:'var(--red)', fontWeight:600 }}>+ New Client</span>
                </div>
              ) : filtered.map(c => (
                <div key={c.id} onClick={() => { setClientId(c.id); setClientSearch('') }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'10px 14px', borderBottom:'1px solid var(--border-light)', cursor:'pointer' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{c.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{c.phone}</div>
                  </div>
                  <span className={`tag tag-${c.tag}`}>{c.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">Stylist</label>
          <select className="form-input form-select" value={stylistId} onChange={e => setStylistId(e.target.value)}>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input className="form-input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">End (auto)</label>
          <input className="form-input" type="time" value={endTime} readOnly style={{ opacity:0.5 }} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Services</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {services.map(s => (
            <div key={s.id} onClick={() => toggleSvc(s.id)}
              style={{ padding:'7px 12px', borderRadius:2, fontSize:11, cursor:'pointer', fontWeight:600,
                background: serviceIds.includes(s.id) ? s.color + '20' : 'var(--bg)',
                border: `1.5px solid ${serviceIds.includes(s.id) ? s.color : 'var(--border)'}`,
                color: serviceIds.includes(s.id) ? s.color : 'var(--muted)', letterSpacing:1 }}>
              {s.name} · ${s.price}
            </div>
          ))}
        </div>
        {serviceIds.length > 0 && (
          <div style={{ marginTop:8, fontSize:12, color:'var(--red)', fontWeight:600 }}>
            Total: ${totalPrice} · {totalMin} min
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-input form-textarea" value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Formula, requests, reminders…" />
      </div>
    </Modal>
  )
}
