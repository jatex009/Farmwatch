import React, { useState } from 'react'
import { Users, CloudSun, Trash2, Send, Check, MapPin, Leaf, ChevronDown, ChevronUp, Sprout } from 'lucide-react'
import { sendSmsAlert, getCurrentWeather, ALERT_TYPES, COUNTY_COORDS, weatherIcon } from '../lib/api'
import { getSoilData } from '../lib/soilgrids'
import { getET0Forecast } from '../lib/openmeteo'
import { getPlantingStatus, CROP_PROFILES } from '../lib/farmguide'
import { logError } from '../lib/errors'

function getCoords(location) {
  return COUNTY_COORDS[location] || COUNTY_COORDS['Nairobi']
}

export default function FarmerList({ farmers, onRemove, toast }) {
  const [alertStates, setAlertStates]       = useState({})
  const [weatherCache, setWeatherCache]     = useState({})
  const [loadingWeather, setLoadingWeather] = useState({})
  const [selectedAlert, setSelectedAlert]   = useState({})
  const [insightsOpen, setInsightsOpen]     = useState({})
  const [insightsData, setInsightsData]     = useState({})

  if (farmers.length === 0) return (
    <div className="card fade-up fade-up-3" style={{ padding: 40, textAlign: 'center' }}>
      <Users size={32} color="var(--text-3)" style={{ marginBottom: 12 }} />
      <div style={{ fontFamily: 'Syne', fontSize: 15, marginBottom: 6 }}>No farmers registered yet</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Register your first farmer using the form.</div>
    </div>
  )

  const fetchWeatherForFarmer = async (farmer) => {
    const key = farmer.location
    if (weatherCache[key]) return
    setLoadingWeather(p => ({ ...p, [key]: true }))
    try {
      const c    = getCoords(farmer.location)
      const data = await getCurrentWeather(c.lat, c.lon)
      setWeatherCache(p => ({ ...p, [key]: data }))
    } catch (err) {
      logError('fetchWeatherForFarmer', err)
      setWeatherCache(p => ({ ...p, [key]: null }))
    } finally {
      setLoadingWeather(p => ({ ...p, [key]: false }))
    }
  }

  const dispatchAlert = async (farmer) => {
    const alertType = selectedAlert[farmer.id] || 'rain'
    setAlertStates(p => ({ ...p, [farmer.id]: 'sending' }))
    try {
      await sendSmsAlert(farmer.phone, alertType, { day: 'today' })
      setAlertStates(p => ({ ...p, [farmer.id]: 'sent' }))
      toast(`Alert sent to ${farmer.name}`, 'success')
      setTimeout(() => setAlertStates(p => ({ ...p, [farmer.id]: null })), 3000)
    } catch (err) {
      if (err.status === 403) {
        setAlertStates(p => ({ ...p, [farmer.id]: 'simulated' }))
        const label = ALERT_TYPES.find(a => a.value === alertType)?.label ?? alertType
        toast(`Simulated: ${label} alert for ${farmer.name}`, 'info')
        setTimeout(() => setAlertStates(p => ({ ...p, [farmer.id]: null })), 3000)
      } else {
        logError('dispatchAlert', err)
        setAlertStates(p => ({ ...p, [farmer.id]: 'error' }))
        toast('Alert failed — check your API key and quota', 'error')
      }
    }
  }

  const fetchInsights = async (farmer) => {
    const id = farmer.id
    const existing = insightsData[id]
    if (existing && (existing.loading || !existing.error)) return

    setInsightsData(p => ({ ...p, [id]: { loading: true } }))
    const c = getCoords(farmer.location)
    try {
      const [et0Data, soilData] = await Promise.all([
        getET0Forecast(c.lat, c.lon),
        getSoilData(c.lat, c.lon),
      ])

      const cropKey = farmer.cropType?.toLowerCase()
      const kc      = CROP_PROFILES[cropKey]?.kc ?? 1.10
      const et0Today  = et0Data.et0[0]  ?? 0
      const rainToday = et0Data.rain[0] ?? 0
      const ETc       = et0Today * kc
      const netNeed   = Math.max(0, ETc - rainToday)

      const socVal = soilData.soc
      const socLabel = socVal === null ? 'Unknown' : socVal < 8 ? 'Low' : socVal <= 20 ? 'Medium' : 'Rich'

      setInsightsData(p => ({ ...p, [id]: {
        et0Today, rainToday, netNeed,
        ph: soilData.ph, socLabel, clay: soilData.clay,
        loading: false,
      }}))
    } catch (err) {
      logError('fetchInsights', err)
      setInsightsData(p => ({ ...p, [id]: { error: true, loading: false } }))
    }
  }

  const toggleInsights = async (farmer) => {
    await fetchInsights(farmer)
    setInsightsOpen(p => ({ ...p, [farmer.id]: !p[farmer.id] }))
  }

  return (
    <div className="fade-up fade-up-3">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>Registered Farmers</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{farmers.length} enrolled</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {farmers.map(farmer => {
          const state     = alertStates[farmer.id]
          const weather   = weatherCache[farmer.location]
          const wLoading  = loadingWeather[farmer.location]
          const alertType = selectedAlert[farmer.id] || 'rain'
          const temp      = weather?.current?.temp ?? weather?.current_weather?.temperature ?? null

          return (
            <div key={farmer.id} className="card farmer-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px' }}>
              <div className="farmer-card-inner">
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--surface-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'var(--text-2)',
                    }}>
                      {farmer.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {farmer.name}
                        {farmer.simulated && (
                          <span className="tag tag-amber" style={{ marginLeft: 8, fontSize: 10 }}>simulated</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{farmer.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="tag tag-green" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={9} /> {farmer.location}
                    </span>
                    <span className="tag tag-sky" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Leaf size={9} /> {farmer.cropType}
                    </span>
                    {temp !== null && (
                      <span className="tag tag-ochre">
                        {weatherIcon(weather?.current?.weather?.[0]?.id)} {Math.round(temp)}°C
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="farmer-actions">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: '6px 10px', flex: 1, gap: 5 }}
                      onClick={() => fetchWeatherForFarmer(farmer)}
                      disabled={wLoading}
                    >
                      {wLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <CloudSun size={13} />}
                      Weather
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: '6px 10px', gap: 5 }}
                      onClick={() => toggleInsights(farmer)}
                      title="Farm Insights"
                    >
                      <Sprout size={13} />
                      Insights
                      {insightsOpen[farmer.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: '6px 10px', color: 'var(--red)', borderColor: 'rgba(248,113,113,0.2)' }}
                      onClick={() => onRemove(farmer.id)}
                      aria-label={`Remove ${farmer.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      className="input"
                      style={{ fontSize: 12, padding: '6px 10px' }}
                      value={alertType}
                      onChange={e => setSelectedAlert(p => ({ ...p, [farmer.id]: e.target.value }))}
                    >
                      {ALERT_TYPES.map(a => (
                        <option key={a.value} value={a.value}>{a.weatherIcon} {a.label}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0, gap: 5 }}
                      onClick={() => dispatchAlert(farmer)}
                      disabled={state === 'sending'}
                      title="Dispatch SMS alert"
                    >
                      {state === 'sending'   ? <span className="spinner" style={{ width: 12, height: 12 }} /> :
                       state === 'sent'      ? <><Check size={12} /> Sent</> :
                       state === 'simulated' ? 'Sim' :
                       <><Send size={12} /> Send</>}
                    </button>
                  </div>
                </div>
              </div>
              </div>

              {insightsOpen[farmer.id] && (() => {
                const ins = insightsData[farmer.id]
                const plantStatus = getPlantingStatus(farmer.cropType?.toLowerCase())

                if (!ins || ins.loading) {
                  return (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', background: 'var(--surface-2)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="skeleton" style={{ height: 20, width: '60%', borderRadius: 'var(--r-sm)' }} />
                        <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 'var(--r-sm)' }} />
                      </div>
                    </div>
                  )
                }

                if (ins.error) {
                  return (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-3)' }}>
                      Insights unavailable
                    </div>
                  )
                }

                const urgencyColor = ins.netNeed === 0 ? 'var(--text-3)' : ins.netNeed < 3 ? 'var(--green)' : ins.netNeed < 6 ? 'var(--amber)' : 'var(--red)'
                const phLabel = ins.ph === null ? 'Unknown' : ins.ph < 5.5 ? 'Acidic' : ins.ph <= 6.5 ? 'Slightly acidic' : ins.ph <= 7.5 ? 'Optimal' : 'Alkaline'
                const phColor = ins.ph === null ? 'var(--text-3)' : ins.ph < 5.5 ? 'var(--red)' : ins.ph <= 6.5 ? 'var(--amber)' : ins.ph <= 7.5 ? 'var(--green)' : 'var(--blue)'

                return (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', background: 'var(--surface-2)' }}>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>Irrigation today</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: urgencyColor }}>
                          {ins.netNeed.toFixed(1)} L/m²
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 5 }}>
                          {ins.netNeed > 0 ? '— irrigate' : '— skip'}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>Soil pH</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: phColor }}>
                          {ins.ph !== null ? ins.ph.toFixed(1) : '—'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 5 }}>{phLabel}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>Crop status</div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px',
                          borderRadius: 99, color: plantStatus.color,
                          background: `color-mix(in srgb, ${plantStatus.color} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${plantStatus.color} 25%, transparent)`,
                        }}>
                          {plantStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
