'use client'
import { useState } from 'react'
import Modal from './Modal'
import { fmtTime, fmtDate, WEEKDAYS } from '@/lib/utils'

// ── Appointment Detail ───────────────────────────────────────────────────────
export function ApptDetailModal({ appt, clients, services, staff, onEdit, onCheckout, onClose }) {
  const cl = clients.find(c => c.id === appt.clientId)
  const st = staff.find(s => s.id === appt.stylistId)
  const svcs = (appt.serviceIds || []).map(id => services.find(s => s.id === id)).filter(Boolean)
  const sub = svcs.reduce((s, sv) => s + sv.price, 0)
  return (
    <Modal title="Appointment" onClose={onClose}
      footer={<>
        <button className="btn btn-outline btn-sm" onClick={onEdit}>Edit</button>
        <div style={{ flex:1 }} />
        {!appt.paid && <button className="btn btn-red btn-sm" onClick={onCheckout}>Checkout</button>}
        {appt.paid && <span className="badge badge-paid">Paid · ${sub + (appt.tip || 0)}</span>}
      </>}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:21, marginBottom:3 }}>{cl?.name}</div>
      <div style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>
        <span style={{ color: st?.color, fontWeight:600 }}>{st?.name}</span>
        {' · '}{fmtDate(appt.start)} · {fmtTime(appt.start)} – {fmtTime(appt.end)}
      </div>
      {svcs.map(s => (
        <div key={s.id} className="detail-row">
          <div>
            <div style={{ fontWeight:500 }}>{s.name}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{s.duration} min</div>
          </div>
          <span style={{ color:'var(--red)', fontWeight:600 }}>${s.price}</span>
        </div>
      ))}
      <div className="divider" />
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Playfair Display,serif', fontSize:19 }}>
        <span>Subtotal</span><span style={{ color:'var(--red)' }}>${sub}</span>
      </div>
      {appt.notes && (
        <div style={{ marginTop:12, padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:2, fontSize:13, lineHeight:1.7 }}>
          {appt.notes}
        </div>
      )}
      {cl?.notes && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)', marginBottom:5, fontWeight:600 }}>Client Notes</div>
          <div style={{ fontSize:12, lineHeight:1.7, color:'var(--muted)' }}>{cl.notes}</div>
        </div>
      )}
    </Modal>
  )
}

// ── Checkout ─────────────────────────────────────────────────────────────────
export function CheckoutModal({ appt, clients, services, onSave, onClose }) {
  const cl = clients.find(c => c.id === appt.clientId)
  const svcs = (appt.serviceIds || []).map(id => services.find(s => s.id === id)).filter(Boolean)
  const sub = svcs.reduce((s, sv) => s + sv.price, 0)
  const [tip, setTip] = useState(appt.tip || 0)
  const [method, setMethod] = useState('card')
  const total = sub + Number(tip)
  return (
    <Modal title="Checkout" onClose={onClose}
      footer={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-red btn-sm" onClick={() => onSave({ ...appt, paid:true, tip:Number(tip), payMethod:method })}>
          Mark Paid · ${total}
        </button>
      </>}>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:19 }}>{cl?.name}</div>
        <div style={{ fontSize:11, color:'var(--muted)' }}>{fmtDate(appt.start)} · {fmtTime(appt.start)}</div>
      </div>
      {svcs.map(s => <div key={s.id} className="detail-row"><span>{s.name}</span><span style={{ color:'var(--red)' }}>${s.price}</span></div>)}
      <div className="divider" />
      <div className="form-group">
        <label className="form-label">Tip</label>
        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
          {[0, Math.round(sub * 0.15), Math.round(sub * 0.18), Math.round(sub * 0.20)].map(t => (
            <div key={t} onClick={() => setTip(t)}
              style={{ flex:1, textAlign:'center', padding:'8px 4px', borderRadius:2, fontSize:11, cursor:'pointer', fontWeight:600,
                background: tip === t ? 'var(--red-dim)' : 'var(--bg)',
                border: `1.5px solid ${tip === t ? 'var(--red)' : 'var(--border)'}`,
                color: tip === t ? 'var(--red)' : 'var(--muted)' }}>
              {t === 0 ? 'None' : `$${t}`}
            </div>
          ))}
        </div>
        <input className="form-input" type="number" value={tip} onChange={e => setTip(e.target.value)} placeholder="Custom tip" />
      </div>
      <div className="form-group">
        <label className="form-label">Payment</label>
        <div style={{ display:'flex', gap:6 }}>
          {['card','cash','square'].map(m => (
            <div key={m} onClick={() => setMethod(m)}
              style={{ flex:1, textAlign:'center', padding:'8px', borderRadius:2, fontSize:11, cursor:'pointer',
                letterSpacing:1, textTransform:'uppercase', fontWeight:600,
                background: method === m ? 'var(--red-dim)' : 'var(--bg)',
                border: `1.5px solid ${method === m ? 'var(--red)' : 'var(--border)'}`,
                color: method === m ? 'var(--red)' : 'var(--muted)' }}>
              {m === 'square' ? 'Square' : m}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:'var(--card-alt)', border:'1px solid var(--border)', borderRadius:3, padding:'12px 14px' }}>
        <div className="detail-row"><span style={{ color:'var(--muted)' }}>Subtotal</span><span>${sub}</span></div>
        <div className="detail-row"><span style={{ color:'var(--muted)' }}>Tip</span><span>${tip}</span></div>
        <div className="divider" />
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Playfair Display,serif', fontSize:19 }}>
          <span>Total</span><span style={{ color:'var(--red)' }}>${total}</span>
        </div>
      </div>
    </Modal>
  )
}

// ── Clients View ─────────────────────────────────────────────────────────────
export function ClientsView({ clients, appts, services, onSaveClient }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const genId = () => Math.random().toString(36).slice(2, 9)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  )
  const client = selected ? clients.find(c => c.id === selected) : null
  const clientAppts = client ? appts.filter(a => a.clientId === client.id).sort((a,b) => new Date(b.start) - new Date(a.start)) : []

  const ClientForm = ({ init, onSave, onCancel }) => {
    const [form, setForm] = useState(init || { name:'', phone:'', email:'', tag:'new', notes:'' })
    return (
      <Modal title={init ? 'Edit Client' : 'New Client'} onClose={onCancel}
        footer={<>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-red btn-sm" onClick={() => onSave(form)}>Save</button>
        </>}>
        <div className="form-group"><label className="form-label">Name</label>
          <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} /></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group"><label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} placeholder="04xx xxx xxx" onChange={e => setForm({ ...form, phone:e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label>
            <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Tag</label>
          <select className="form-input form-select" value={form.tag} onChange={e => setForm({ ...form, tag:e.target.value })}>
            <option value="new">New</option><option value="regular">Regular</option>
          </select></div>
        <div className="form-group"><label className="form-label">Hair Notes</label>
          <textarea className="form-input form-textarea" style={{ minHeight:100 }} value={form.notes}
            onChange={e => setForm({ ...form, notes:e.target.value })} placeholder="Colour formula, texture, preferences, allergies…" /></div>
      </Modal>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <input className="form-input" style={{ flex:1 }} placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-red btn-sm" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(c => (
          <div key={c.id} className={`client-card ${selected === c.id ? 'selected' : ''}`}
            onClick={() => setSelected(selected === c.id ? null : c.id)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div className="client-name">{c.name}</div>
              <span className={`tag tag-${c.tag}`}>{c.tag}</span>
            </div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{c.phone}</div>
            {c.lastVisit && <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Last: {fmtDate(c.lastVisit)}</div>}
          </div>
        ))}
      </div>

      {client && (
        <div style={{ position:'fixed', inset:0, background:'rgba(28,24,20,0.5)', zIndex:150, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background:'var(--surface)', borderRadius:'12px 12px 0 0', maxHeight:'85dvh', overflowY:'auto', padding:'18px 18px 40px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:22 }}>{client.name}</div>
                <div style={{ color:'var(--muted)', fontSize:12, marginTop:2 }}>{client.phone}{client.email && ` · ${client.email}`}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(client)}>Edit</button>
                <button style={{ background:'none', border:'none', fontSize:22, color:'var(--muted)', cursor:'pointer' }} onClick={() => setSelected(null)}>×</button>
              </div>
            </div>
            <div style={{ display:'flex', gap:20, marginBottom:14 }}>
              <div><div style={{ color:'var(--red)', fontFamily:'Playfair Display,serif', fontSize:22 }}>${client.totalSpend || 0}</div><div className="stat-label">Total Spend</div></div>
              <div><div style={{ color:'var(--red)', fontFamily:'Playfair Display,serif', fontSize:22 }}>{clientAppts.length}</div><div className="stat-label">Visits</div></div>
              <div><span className={`tag tag-${client.tag}`}>{client.tag}</span></div>
            </div>
            <div className="divider" />
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:6, fontWeight:600 }}>Hair Notes</div>
              <div style={{ fontSize:13, lineHeight:1.75, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:2, padding:'10px 12px', whiteSpace:'pre-wrap' }}>
                {client.notes || <span style={{ color:'var(--muted)', fontStyle:'italic' }}>No notes yet.</span>}
              </div>
            </div>
            {clientAppts.length > 0 && <>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:8, fontWeight:600 }}>History</div>
              {clientAppts.slice(0, 6).map(a => {
                const svcs = (a.serviceIds || []).map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')
                return (
                  <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'9px 0', borderBottom:'1px solid var(--border-light)', fontSize:13 }}>
                    <div><div>{svcs}</div><div style={{ color:'var(--muted)', fontSize:11, marginTop:1 }}>{fmtDate(a.start)}</div></div>
                    <span className={`badge badge-${a.paid ? 'paid' : 'pending'}`}>{a.paid ? 'Paid' : 'Pending'}</span>
                  </div>
                )
              })}
            </>}
          </div>
        </div>
      )}

      {(showAdd || editing) && (
        <ClientForm init={editing}
          onSave={async data => {
            await onSaveClient({ ...data, id: data.id || genId(), totalSpend: data.totalSpend || 0 })
            setEditing(null); setShowAdd(false)
          }}
          onCancel={() => { setEditing(null); setShowAdd(false) }}
        />
      )}
    </div>
  )
}

// ── Revenue View ─────────────────────────────────────────────────────────────
export function RevenueView({ appts, clients, services, staff, onCheckout, onSaveAppt }) {
  const [tab, setTab] = useState('today')
  const shown = appts.filter(a => {
    const d = new Date(a.start), now = new Date()
    if (tab === 'today') return d.toDateString() === now.toDateString()
    if (tab === 'week') {
      const s = new Date(now); s.setDate(now.getDate() - now.getDay())
      const e = new Date(s); e.setDate(s.getDate() + 7)
      return d >= s && d <= e
    }
    if (tab === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return false
  }).sort((a, b) => new Date(b.start) - new Date(a.start))

  const revenue = shown.reduce((sum, a) =>
    sum + (a.serviceIds||[]).reduce((s, id) => s + (services.find(sv => sv.id === id)?.price || 0), 0) + (a.tip || 0), 0)

  return (
    <div>
      <div className="tab-bar">
        {['today','week','month'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:18 }}>
        <div className="stat-card"><div className="stat-val">${revenue}</div><div className="stat-label">Revenue</div></div>
        <div className="stat-card"><div className="stat-val">{shown.length}</div><div className="stat-label">Appts</div></div>
        <div className="stat-card"><div className="stat-val">${shown.length ? Math.round(revenue / shown.length) : 0}</div><div className="stat-label">Avg</div></div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {shown.map(a => {
          const cl = clients.find(c => c.id === a.clientId)
          const st = staff.find(s => s.id === a.stylistId)
          const svcs = (a.serviceIds||[]).map(id => services.find(s => s.id === id)).filter(Boolean)
          const sub = svcs.reduce((s, sv) => s + (sv?.price || 0), 0)
          return (
            <div key={a.id} className="card" style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:16 }}>{cl?.name}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>
                    {fmtDate(a.start)} · {fmtTime(a.start)} · <span style={{ color: st?.color, fontWeight:600 }}>{st?.name?.split(' ')[0]}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{svcs.map(s => s?.name).join(', ')}</div>
                </div>
                <div style={{ textAlign:'right', marginLeft:10 }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'var(--red)' }}>${sub + (a.tip||0)}</div>
                  {a.tip > 0 && <div style={{ fontSize:9, color:'var(--muted)' }}>incl. ${a.tip} tip</div>}
                  <span className={`badge badge-${a.paid ? 'paid' : 'pending'}`} style={{ marginTop:4, display:'block' }}>
                    {a.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
              {!a.paid && (
                <button className="btn btn-outline btn-xs" style={{ marginTop:10 }} onClick={() => onCheckout(a)}>Checkout</button>
              )}
            </div>
          )
        })}
        {shown.length === 0 && (
          <div style={{ color:'var(--muted)', fontSize:13, padding:24, textAlign:'center', fontStyle:'italic' }}>
            No appointments in this period.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Services View ─────────────────────────────────────────────────────────────
export function ServicesView({ services, onSave, onDelete, genId }) {
  const [editing, setEditing] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const COLORS = ['#B8281A','#3D7A5C','#8B5E3C','#5C4A8B','#2E7D9E','#8B3A3A','#5C7A4A','#7A5C2E','#3A6E6E','#9E4D7A','#D4B896','#6E6E3A']

  const ServiceForm = ({ init, onClose }) => {
    const [form, setForm] = useState(init || { name:'', duration:60, price:0, color:COLORS[0] })
    return (
      <Modal title={init ? 'Edit Service' : 'New Service'} onClose={onClose}
        footer={<>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-red btn-sm" onClick={() => { onSave({ ...form, id: form.id || genId() }); onClose() }}>Save</button>
        </>}>
        <div className="form-group"><label className="form-label">Service Name</label>
          <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} /></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group"><label className="form-label">Duration (min)</label>
            <input className="form-input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration:Number(e.target.value) })} /></div>
          <div className="form-group"><label className="form-label">Price ($)</label>
            <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price:Number(e.target.value) })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Colour</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setForm({ ...form, color:c })}
                style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                  border: form.color === c ? `3px solid var(--text)` : '3px solid transparent' }} />
            ))}
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button className="btn btn-red" onClick={() => setShowAdd(true)}>+ Add Service</button>
      </div>
      {services.map(s => (
        <div key={s.id} className="svc-pill" style={{ borderLeft:`3px solid ${s.color}` }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>{s.name}</div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{s.duration} min</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:19, color:'var(--red)' }}>${s.price}</div>
            <button className="btn btn-ghost btn-xs" onClick={() => setEditing(s)}>Edit</button>
          </div>
        </div>
      ))}
      {showAdd && <ServiceForm onClose={() => setShowAdd(false)} />}
      {editing && <ServiceForm init={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

// ── Settings View ─────────────────────────────────────────────────────────────
export function SettingsView({ staff, daysOff, onSaveStaff, onSaveDaysOff, genId }) {
  const [editStaff, setEditStaff] = useState(null)
  const [daysOffFor, setDaysOffFor] = useState(null)
  const [form, setForm] = useState({})

  const DaysOffModal = ({ stylistId, onClose }) => {
    const stylist = staff.find(s => s.id === stylistId)
    const mine = daysOff.filter(d => d.stylistId === stylistId)
    const [type, setType] = useState('single')
    const [date, setDate] = useState(new Date().toISOString().slice(0,10))
    const [weekday, setWeekday] = useState(0)
    const [note, setNote] = useState('')

    const add = () => {
      const entry = { id: genId(), stylistId, type, note, ...(type === 'single' ? { date } : { weekday: Number(weekday) }) }
      onSaveDaysOff([...daysOff, entry])
      setNote(''); setDate(new Date().toISOString().slice(0,10))
    }
    const remove = id => onSaveDaysOff(daysOff.filter(d => d.id !== id))

    return (
      <Modal title={`Days Off — ${stylist?.name}`} onClose={onClose}
        footer={<button className="btn btn-ghost btn-sm" onClick={onClose}>Done</button>}>
        <div style={{ background:'var(--bg)', border:'1.5px solid var(--red)', borderRadius:3, padding:14, marginBottom:16 }}>
          <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--red)', fontWeight:600, marginBottom:10 }}>Add Day Off</div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <div style={{ display:'flex', gap:8 }}>
              {['single','recurring'].map(t => (
                <div key={t} onClick={() => setType(t)}
                  style={{ flex:1, textAlign:'center', padding:'8px', borderRadius:2, fontSize:11, cursor:'pointer', fontWeight:600,
                    letterSpacing:1, textTransform:'uppercase',
                    background: type === t ? 'var(--red-dim)' : 'var(--surface)',
                    border: `1.5px solid ${type === t ? 'var(--red)' : 'var(--border)'}`,
                    color: type === t ? 'var(--red)' : 'var(--muted)' }}>
                  {t === 'single' ? 'Single Date' : 'Every Week'}
                </div>
              ))}
            </div>
          </div>
          {type === 'single' ? (
            <div className="form-group"><label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          ) : (
            <div className="form-group"><label className="form-label">Day of Week</label>
              <select className="form-input form-select" value={weekday} onChange={e => setWeekday(e.target.value)}>
                {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select></div>
          )}
          <div className="form-group"><label className="form-label">Note (optional)</label>
            <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Vacation, personal day…" /></div>
          <button className="btn btn-red btn-sm" onClick={add}>+ Add</button>
        </div>
        <div>
          <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:8, fontWeight:600 }}>
            Scheduled ({mine.length})
          </div>
          {mine.length === 0 && <div style={{ fontSize:12, color:'var(--muted)', fontStyle:'italic' }}>None scheduled.</div>}
          {mine.map(d => (
            <div key={d.id} className="dayoff-item">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: d.type === 'recurring' ? 'var(--beige)' : 'var(--red)', flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>
                    {d.type === 'single' ? fmtDate(d.date) : `Every ${WEEKDAYS[d.weekday]}`}
                  </div>
                  {d.note && <div style={{ fontSize:11, color:'var(--muted)' }}>{d.note}</div>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="badge" style={{ background: d.type === 'recurring' ? 'var(--beige-light)' : 'var(--red-dim)', color: d.type === 'recurring' ? 'var(--muted)' : 'var(--red)' }}>
                  {d.type === 'single' ? 'One-time' : 'Weekly'}
                </span>
                <button style={{ background:'none', border:'none', color:'var(--muted-light)', cursor:'pointer', fontSize:20, lineHeight:1 }}
                  onClick={() => remove(d.id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <div className="card" style={{ padding:'18px', marginBottom:16 }}>
        <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:14, fontWeight:600 }}>Staff</div>
        {staff.map((s, i) => (
          <div key={s.id}>
            {editStaff === s.id ? (
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div><label className="form-label">Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} /></div>
                  <div><label className="form-label">Role</label>
                    <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role:e.target.value })} /></div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-red btn-sm" onClick={() => { onSaveStaff(form); setEditStaff(null) }}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditStaff(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0',
                borderBottom: i < staff.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:s.color }} />
                  <div>
                    <div style={{ fontFamily:'Playfair Display,serif', fontSize:15 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{s.role}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => { setDaysOffFor(s.id) }}>
                    Days Off {daysOff.filter(d => d.stylistId === s.id).length > 0 && (
                      <span style={{ marginLeft:4, background:'var(--red)', color:'#fff', borderRadius:10, padding:'1px 5px', fontSize:9, fontWeight:700 }}>
                        {daysOff.filter(d => d.stylistId === s.id).length}
                      </span>
                    )}
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => { setEditStaff(s.id); setForm({ ...s }) }}>Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:'18px' }}>
        <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:8, fontWeight:600 }}>Square Integration</div>
        <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
          Add your Square API key in Vercel environment variables as <code style={{ background:'var(--bg)', padding:'1px 5px', borderRadius:2, fontSize:11 }}>SQUARE_API_KEY</code> to enable direct payment sync.
        </div>
      </div>

      {daysOffFor && <DaysOffModal stylistId={daysOffFor} onClose={() => setDaysOffFor(null)} />}
    </div>
  )
}
