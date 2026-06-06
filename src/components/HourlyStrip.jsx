import React, { useEffect, useState } from 'react'
import { getHourlyForecast, weatherIcon } from '../lib/api'
import { logError } from '../lib/errors'

function parseHour(h) {
  // Handle multiple timestamp field names and ms vs seconds
  const raw = h.dt ?? h.time ?? h.timestamp ?? h.epoch ?? null
  if (!raw) return null
  // If > 1e10 it's already milliseconds; otherwise seconds
  return new Date(raw > 1e10 ? raw : raw * 1000)
}

function parseTemp(h) {
  if (typeof h.temp === 'number') return Math.round(h.temp)
  if (typeof h.temp?.day === 'number') return Math.round(h.temp.day)
  if (h.main?.temp != null) return Math.round(h.main.temp)
  return null
}

function parsePop(h) {
  const p = h.pop ?? h.precipitation_probability ?? h.rain_probability ?? null
  return p != null ? Math.round(p * 100) : null
}

function parseCode(h) {
  return h.weather?.[0]?.id ?? h.condition_code ?? h.icon ?? ''
}

export default function HourlyStrip({ lat, lon }) {
  const [hours, setHours]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    if (lat == null || lon == null) return
    let cancelled = false
    setLoading(true)
    setError(false)
    getHourlyForecast(lat, lon)
      .then(data => {
        if (cancelled) return
        const list = data.hourly || data.list || []
        if (list.length === 0) { setError(true); return }

        // Round current time down to the nearest hour as the synthetic base
        const base = new Date()
        base.setMinutes(0, 0, 0)

        const parsed = list
          .map((h, idx) => {
            const temp = parseTemp(h)
            if (temp == null) return null
            // Use API timestamp if present; otherwise synthesise from current hour + offset
            const date = parseHour(h) ?? new Date(base.getTime() + idx * 3600000)
            return { h, date, temp }
          })
          .filter(Boolean)
          .slice(0, 24)

        setHours(parsed)
      })
      .catch(err => { logError('getHourlyForecast', err); if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lat, lon])

  if (loading) return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'hidden' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ flex: '0 0 58px', height: 86, borderRadius: 8 }} />
      ))}
    </div>
  )

  if (error || hours.length === 0) return (
    <div style={{
      padding: '20px 0', textAlign: 'center',
      fontSize: 13, color: 'var(--text-3)',
    }}>
      Hourly data unavailable for this location
    </div>
  )

  const now = Date.now()

  return (
    <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4 }}>
      {hours.map(({ h, date, temp }, i) => {
        const isNow = Math.abs(date.getTime() - now) < 1800000
        const pop   = parsePop(h)
        const code  = parseCode(h)
        const label = isNow ? 'Now' : date.toLocaleTimeString('en', { hour: 'numeric', hour12: true })

        return (
          <div key={i} style={{
            flex: '0 0 auto', minWidth: 58, textAlign: 'center',
            padding: '10px 4px', borderRadius: 8,
            background: isNow ? 'var(--ochre-dim)' : 'var(--surface-2)',
            border: `1px solid ${isNow ? 'var(--border-acc)' : 'var(--border)'}`,
          }}>
            <div style={{
              fontSize: 10, marginBottom: 5, fontWeight: isNow ? 700 : 400,
              color: isNow ? 'var(--ochre)' : 'var(--text-3)',
            }}>
              {label}
            </div>
            <div style={{ fontSize: 20, marginBottom: 5, lineHeight: 1 }}>{weatherIcon(code)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{temp}°</div>
            {pop !== null && pop > 0 && (
              <div style={{ fontSize: 10, color: 'var(--blue)', marginTop: 3 }}>{pop}%</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
