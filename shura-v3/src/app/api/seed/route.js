import { supabase } from '@/lib/supabase'
import { SEED_STAFF, SEED_SERVICES, SEED_CLIENTS, SEED_DAYS_OFF } from '@/lib/seedData'

export async function POST() {
  try {
    const { error: e1 } = await supabase.from('staff').upsert(SEED_STAFF)
    if (e1) throw e1
    const { error: e2 } = await supabase.from('services').upsert(SEED_SERVICES)
    if (e2) throw e2
    const { error: e3 } = await supabase.from('clients').upsert(SEED_CLIENTS)
    if (e3) throw e3
    const { error: e4 } = await supabase.from('days_off').upsert(SEED_DAYS_OFF)
    if (e4) throw e4
    return Response.json({ success: true, message: 'Seeded!' })
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
