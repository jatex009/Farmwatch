import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { registerFarmer, normalizePhone, isValidPhone, CROPS, KENYAN_COUNTIES } from '../lib/api'
import { logError, userMessage } from '../lib/errors'

export default function RegisterFarmerForm({ onSuccess, toast }) {
  const [form, setForm]         = useState({ name: '', phone: '', location: 'Bomet', cropType: 'maize' })
  const [loading, setLoading]   = useState(false)
  const [phoneErr, setPhoneErr] = useState('')

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (k === 'phone') setPhoneErr('')
  }

  const submit = async () => {
    if (!form.name.trim()) { toast('Full name is required', 'error'); return }
    if (!form.phone.trim()) { toast('Phone number is required', 'error'); return }

    const phone = normalizePhone(form.phone)
    if (!isValidPhone(phone)) {
      setPhoneErr('Valid format: 0712 345 678 or +254712345678')
      toast('Invalid phone number', 'error')
      return
    }

    setLoading(true)
    try {
      await registerFarmer(phone, form.name.trim(), form.location, form.cropType)
      toast(`${form.name} registered for daily weather alerts`, 'success')
      onSuccess({ ...form, name: form.name.trim(), phone, id: Date.now(), registeredAt: new Date().toISOString() })
      setForm({ name: '', phone: '', location: 'Bomet', cropType: 'maize' })
    } catch (err) {
      if (err.status === 403) {
        toast('SMS not enabled on free plan — registration simulated', 'info')
        onSuccess({ ...form, name: form.name.trim(), phone, id: Date.now(), registeredAt: new Date().toISOString(), simulated: true })
        setForm({ name: '', phone: '', location: 'Bomet', cropType: 'maize' })
      } else if (err.status === 429) {
        toast('API quota reached — try again later', 'error')
      } else {
        logError('registerFarmer', err)
        toast(userMessage(err, 'Registration failed'), 'error')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="card fade-up fade-up-2" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 3 }}>
          Register Farmer
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Enrol in the Agricultural Alert System for daily weather SMS.
        </div>
      </div>

      <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
        <div className="grid-2" style={{ gap: 12 }}>
          <div>
            <label style={{ fontSize: 11.5, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Full Name *
            </label>
            <input
              className="input"
              placeholder="John Kipchoge"
              value={form.name}
              onChange={set('name')}
              maxLength={80}
            />
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Phone *
            </label>
            <input
              className={`input${phoneErr ? ' input-error' : ''}`}
              placeholder="0712 345 678"
              value={form.phone}
              onChange={set('phone')}
              inputMode="tel"
              autoComplete="tel"
            />
            {phoneErr && (
              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{phoneErr}</div>
            )}
          </div>
        </div>

        <div className="grid-2" style={{ gap: 12 }}>
          <div>
            <label style={{ fontSize: 11.5, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              County
            </label>
            <select className="input" value={form.location} onChange={set('location')}>
              {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Primary Crop
            </label>
            <select className="input" value={form.cropType} onChange={set('cropType')}>
              {CROPS.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 2 }}
        >
          {loading ? <><span className="spinner" /> Registering…</> : <><UserPlus size={14} /> Register Farmer</>}
        </button>
      </div>
    </div>
  )
}
