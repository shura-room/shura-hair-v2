'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import CalendarView from '@/components/CalendarView'
import ApptModal from '@/components/ApptModal'
import { ApptDetailModal, CheckoutModal, ClientsView, RevenueView, ServicesView, SettingsView } from '@/components/Views'
import { genId } from '@/lib/utils'

const NAV = [
  { id: 'calendar', label: 'Calendar', icon: '◫' },
  { id: 'clients',  label: 'Clients',  icon: '◈' },
  { id: 'revenue',  label: 'Revenue',  icon: '◉' },
  { id: 'services', label: 'Services', icon: '✦' },
  { id: 'settings', label: 'Settings', icon: '◎' },
]

export default function Home() {
  const [nav, setNav] = useState('calendar')
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [appts, setAppts] = useState([])
  const [daysOff, setDaysOff] = useState([])
  const [loading, setLoading] = useState(true)
  const [apptModal, setApptModal] = useState(null)
  const [checkoutAppt, setCheckoutAppt] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [c, sv, st, a, d] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('services').select('*'),
      supabase.from('staff').select('*'),
      supabase.from('appointments').select('*').order('start_time'),
      supabase.from('days_off').select('*'),
    ])
    if (c.data)  setClients(c.data.map(r => ({ id:r.id, name:r.name, phone:r.phone, email:r.email, tag:r.tag, notes:r.notes, lastVisit:r.last_visit, totalSpend:r.total_spend })))
    if (sv.data) setServices(sv.data)
    if (st.data) setStaff(st.data)
    if (a.data)  setAppts(a.data.map(r => ({ id:r.id, clientId:r.client_id, stylistId:r.stylist_id, serviceIds:r.service_ids||[], start:r.start_time, end:r.end_time, status:r.status, paid:r.paid, tip:r.tip, notes:r.notes })))
    if (d.data)  setDaysOff(d.data.map(r => ({ id:r.id, stylistId:r.stylist_id, type:r.type, date:r.date, weekday:r.weekday, note:r.note })))
    setLoading(false)
  }

  async function saveAppt(data) {
    const row = { id:data.id, client_id:data.clientId, stylist_id:data.stylistId, service_ids:data.serviceIds, start_time:data.start, end_time:data.end, status:data.status, paid:data.paid, tip:data.tip, notes:data.notes }
    await supabase.from('appointments').upsert(row)
    setAppts(prev => prev.find(a => a.id === data.id) ? prev.map(a => a.id === data.id ? data : a) : [...prev, data])
    setApptModal(null)
  }

  async function updateAppt(data) {
    const row = { id:data.id, client_id:data.clientId, stylist_id:data.stylistId, service_ids:data.serviceIds, start_time:data.start, end_time:data.end, status:data.status, paid:data.paid, tip:data.tip, notes:data.notes }
    await supabase.from('appointments').upsert(row)
    setAppts(prev => prev.map(a => a.id === data.id ? data : a))
  }

  async function deleteAppt(id) {
    await supabase.from('appointments').delete().eq('id', id)
    setAppts(prev => prev.filter(a => a.id !== id))
    setApptModal(null)
  }

  async function saveClient(data) {
    const row = { id:data.id, name:data.name, phone:data.phone, email:data.email, tag:data.tag, notes:data.notes, last_visit:data.lastVisit||'', total_spend:data.totalSpend||0 }
    await supabase.from('clients').upsert(row)
    setClients(prev => prev.find(c => c.id === data.id) ? prev.map(c => c.id === data.id ? data : c) : [...prev, data].sort((a,b) => a.name.localeCompare(b.name)))
  }

  async function saveService(data) {
    await supabase.from('services').upsert(data)
    setServices(prev => prev.find(s => s.id === data.id) ? prev.map(s => s.id === data.id ? data : s) : [...prev, data])
  }

  async function deleteService(id) {
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  async function saveStaff(data) {
    await supabase.from('staff').upsert(data)
    setStaff(prev => prev.map(s => s.id === data.id ? data : s))
  }

  async function saveDaysOff(newList) {
    const { data: existing } = await supabase.from('days_off').select('id')
    const existingIds = (existing||[]).map(r => r.id)
    const newIds = newList.map(d => d.id)
    const toDelete = existingIds.filter(id => !newIds.includes(id))
    const toUpsert = newList.map(d => ({ id:d.id, stylist_id:d.stylistId, type:d.type, date:d.date||null, weekday:d.weekday??null, note:d.note }))
    if (toDelete.length) await supabase.from('days_off').delete().in('id', toDelete)
    if (toUpsert.length) await supabase.from('days_off').upsert(toUpsert)
    setDaysOff(newList)
  }

  const today = new Date()
  const todayAppts = appts.filter(a => new Date(a.start).toDateString() === today.toDateString())
  const todayRev = todayAppts.reduce((sum,a) => sum + (a.serviceIds||[]).reduce((s,id) => s+(services.find(sv=>sv.id===id)?.price||0),0), 0)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', flexDirection:'column', gap:16, background:'var(--bg)' }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:32, letterSpacing:6, color:'var(--text)' }}>SHURA</div>
      <div style={{ fontSize:11, color:'var(--muted)', letterSpacing:3, textTransform:'uppercase' }}>Hair Studio</div>
      <div style={{ marginTop:8, fontSize:11, color:'var(--muted)' }}>Loading…</div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div className="page-title serif">
              {nav === 'calendar' ? 'Today' : nav.charAt(0).toUpperCase() + nav.slice(1)}
            </div>
            <div className="page-sub">
              {today.toLocaleDateString('en-AU', { weekday:'long', month:'long', day:'numeric' })}
              <span style={{ marginLeft:8, color:'var(--muted)', fontSize:10 }}>
                {todayAppts.length} appt{todayAppts.length !== 1 ? 's' : ''} · ${todayRev}
              </span>
            </div>
          </div>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:22, fontWeight:500, letterSpacing:3, color:'var(--red)' }}>S</div>
        </div>
      </div>

      <div className="page-content slide-up" key={nav}>
        {nav === 'calendar' && (
          <CalendarView appts={appts} clients={clients} services={services} staff={staff} daysOff={daysOff}
            onAddAppt={p => setApptModal({ mode:'new', prefill:p })}
            onApptClick={a => setApptModal({ mode:'detail', appt:a })}
            onUpdateAppt={updateAppt} />
        )}
        {nav === 'clients' && (
          <ClientsView clients={clients} appts={appts} services={services} onSaveClient={saveClient} />
        )}
        {nav === 'revenue' && (
          <RevenueView appts={appts} clients={clients} services={services} staff={staff}
            onCheckout={a => setCheckoutAppt(a)} onSaveAppt={updateAppt} />
        )}
        {nav === 'services' && (
          <ServicesView services={services} onSave={saveService} onDelete={deleteService} genId={genId} />
        )}
        {nav === 'settings' && (
          <SettingsView staff={staff} daysOff={daysOff} onSaveStaff={saveStaff} onSaveDaysOff={saveDaysOff} genId={genId} />
        )}
      </div>

      <nav className="bottom-nav">
        {NAV.map(n => (
          <div key={n.id} className={`nav-tab ${nav === n.id ? 'active' : ''}`} onClick={() => setNav(n.id)}>
            <div className="nav-tab-icon">{n.icon}</div>
            <div className="nav-tab-label">{n.label}</div>
          </div>
        ))}
      </nav>

      {apptModal?.mode === 'new' && (
        <ApptModal appt={null} clients={clients} services={services} staff={staff}
          prefill={apptModal.prefill} onSave={saveAppt} onClose={() => setApptModal(null)}
          onDelete={deleteAppt} onAddClient={saveClient} genId={genId} />
      )}
      {apptModal?.mode === 'edit' && (
        <ApptModal appt={apptModal.appt} clients={clients} services={services} staff={staff}
          onSave={saveAppt} onClose={() => setApptModal(null)}
          onDelete={deleteAppt} onAddClient={saveClient} genId={genId} />
      )}
      {apptModal?.mode === 'detail' && (
        <ApptDetailModal appt={apptModal.appt} clients={clients} services={services} staff={staff}
          onEdit={() => setApptModal({ mode:'edit', appt:apptModal.appt })}
          onCheckout={() => { setCheckoutAppt(apptModal.appt); setApptModal(null) }}
          onClose={() => setApptModal(null)} />
      )}
      {checkoutAppt && (
        <CheckoutModal appt={checkoutAppt} clients={clients} services={services}
          onSave={async updated => { await updateAppt(updated); setCheckoutAppt(null) }}
          onClose={() => setCheckoutAppt(null)} />
      )}
    </div>
  )
}
