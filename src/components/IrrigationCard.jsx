import React, { useState, useEffect } from 'react'
import { Droplets } from 'lucide-react'
import { getET0Forecast } from '../lib/openmeteo'
import { CROP_PROFILES } from '../lib/farmguide'
import { logError } from '../lib/errors'

function urgencyFor(netNeed) {
  if (netNeed === 0)    return { label: 'None',   color: 'var(--text-3)',  tagClass: 'tag' }
  if (netNeed < 3)      return { label: 'Low',    color: 'var(--green)',   tagClass: 'tag tag-green' }
  if (netNeed < 6)      return { label: 'Medium', color: 'var(--amber)',   tagClass: 'tag tag-amber' }
  return                       { label: 'High',   color: 'var(--red)',     tagClass: 'tag tag-red' }
}

function actionFor(netNeed, rain) {
  if (rain >= 5)    return { label: 'Rain day', tagClass: 'tag tag-sky' }
  if (netNeed <= 0) return { label: 'Skip',     tagClass: 'tag tag-green' }
  return                   { label: 'Irrigate', tagClass: 'tag tag-amber' }
}

function getMaxKc(farmers) {
  if (!farmers || farmers.length === 0) return 1.10
  let max = 0
  for (const f of farmers) {
    const key = f.cropType?.toLowerCase()
    const kc  = CROP_PROFILES[key]?.kc ?? 1.10
    if (kc > max) max = kc
  }
  return max || 1.10
}

function getUniqueCrops(farmers) {
  const seen = new Set()
  return (farmers || []).filter(f => {
    const k = f.cropType?.toLowerCase()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })
}

function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' })
}

export default function IrrigationCard({ coords, farmers, mode = 'guide' }) {
  const [forecast, setForecast]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(false)

  useEffect(() => {
    if (!coords) return
    setLoading(true)
    setError(false)
    getET0Forecast(coords.lat, coords.lon)
      .then(data => { setForecast(data); setLoading(false) })
      .catch(err  => { logError('IrrigationCard', err); setError(true); setLoading(false) })
  }, [coords?.lat, coords?.lon])

  const kc = getMaxKc(farmers)

  const days = forecast
    ? forecast.dates.map((date, i) => {
        const et0      = forecast.et0[i]   ?? 0
        const rain     = forecast.rain[i]  ?? 0
        const ETc      = et0 * kc
        const netNeed  = Math.max(0, ETc - rain)
        return { date, et0, rain, ETc, netNeed }
      })
    : []

  const today = days[0] || null

  if (mode === 'dashboard') {
    return (
      <div className="card fade-up fade-up-2" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Droplets size={16} color="var(--blue)" />
          <span style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700 }}>Irrigation Need</span>
          {coords && (
            <span className="tag tag-sky" style={{ marginLeft: 'auto', fontSize: 10 }}>
              {coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°
            </span>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 48, borderRadius: 'var(--r-sm)' }} />
            <div className="skeleton" style={{ height: 32, borderRadius: 'var(--r-sm)' }} />
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
            ET₀ data unavailable
          </div>
        )}

        {!loading && !error && today && (() => {
          const u = urgencyFor(today.netNeed)
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color: u.color, lineHeight: 1 }}>
                  {today.netNeed.toFixed(1)}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>L/m² today</span>
              </div>
              <div style={{ fontSize: 13, color: u.color, fontWeight: 500, marginBottom: 14 }}>
                {today.netNeed > 0 ? 'Irrigate today' : 'No irrigation needed'}
              </div>

              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginBottom: 8 }}>
                {days.map(d => {
                  const ug    = urgencyFor(d.netNeed)
                  const pct   = Math.min(d.netNeed / 8, 1)
                  const barH  = Math.max(4, Math.round(pct * 36))
                  return (
                    <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ fontSize: 9, color: 'var(--text-3)' }}>
                        {d.netNeed.toFixed(1)}
                      </div>
                      <div style={{
                        width: '100%', height: barH,
                        background: ug.color, borderRadius: 3, opacity: 0.75,
                        minHeight: 4,
                      }} />
                      <div style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.2 }}>
                        {shortDate(d.date)}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                Based on FAO ET₀ × crop coefficient ({kc.toFixed(2)})
              </div>
            </>
          )
        })()}

        {!loading && !error && !today && !coords && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
            Search a location to load data
          </div>
        )}
      </div>
    )
  }

  const uniqueCrops = getUniqueCrops(farmers)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Droplets size={18} color="var(--blue)" />
        <span style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700 }}>Irrigation Planner</span>
        {coords && (
          <span className="tag tag-sky" style={{ fontSize: 11 }}>
            {coords.lat.toFixed(2)}°, {coords.lon.toFixed(2)}°
          </span>
        )}
      </div>

      {loading && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ height: 60, borderRadius: 'var(--r-sm)' }} />
            <div className="skeleton" style={{ height: 120, borderRadius: 'var(--r-sm)' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
          ET₀ forecast unavailable — check connection and try again.
        </div>
      )}

      {!loading && !error && today && (() => {
        const u = urgencyFor(today.netNeed)
        return (
          <>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>Today's Recommendation</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Syne', fontSize: 42, fontWeight: 800, color: u.color, lineHeight: 1 }}>
                  {today.netNeed.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>L/m² needed</span>
              </div>
              <div style={{ fontSize: 14, color: u.color, fontWeight: 500, marginBottom: 12 }}>
                {today.netNeed > 0 ? 'Irrigate today' : 'No irrigation needed — rainfall covers crop demand'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                ET₀: {today.et0.toFixed(1)} mm · Rainfall: {today.rain.toFixed(1)} mm · ETc: {today.ETc.toFixed(1)} mm (kc={kc.toFixed(2)})
              </div>
            </div>

            <div className="card" style={{ overflow: 'hidden', marginBottom: farmers.length > 0 ? 16 : 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Date', 'ET₀ (mm)', 'Rain (mm)', 'Net Need', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d, i) => {
                      const ug  = urgencyFor(d.netNeed)
                      const act = actionFor(d.netNeed, d.rain)
                      return (
                        <tr key={d.date} style={{ borderBottom: i < days.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{formatDate(d.date)}</td>
                          <td style={{ padding: '10px 14px' }}>{d.et0.toFixed(1)}</td>
                          <td style={{ padding: '10px 14px', color: d.rain > 0 ? 'var(--blue)' : 'var(--text-3)' }}>{d.rain.toFixed(1)}</td>
                          <td style={{ padding: '10px 14px', color: ug.color, fontWeight: 600 }}>{d.netNeed.toFixed(1)}</td>
                          <td style={{ padding: '10px 14px' }}><span className={act.tagClass}>{act.label}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {uniqueCrops.length > 0 && (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.2 }}>
                  Per-Crop ETc — Today
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {uniqueCrops.map(f => {
                    const key     = f.cropType?.toLowerCase()
                    const profile = CROP_PROFILES[key]
                    if (!profile) return null
                    const ETc     = (today.et0 * profile.kc).toFixed(1)
                    const netNeed = Math.max(0, today.et0 * profile.kc - today.rain).toFixed(1)
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
                        <span style={{ fontSize: 13 }}>{profile.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>kc={profile.kc} · ETc={ETc}mm · Net {netNeed} L/m²</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )
      })()}

      {!loading && !error && !today && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
          No forecast data available.
        </div>
      )}
    </div>
  )
}
