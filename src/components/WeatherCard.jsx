import React, { useState } from 'react'
import { MapPin, Droplets, Wind, Sun, Thermometer } from 'lucide-react'
import { weatherIcon } from '../lib/api'
import HourlyStrip from './HourlyStrip'

// Derive a readable condition string from an OWM weather code
function codeToDesc(code) {
  if (!code) return ''
  const c = String(code)
  if (c.startsWith('2')) return 'Thunderstorm'
  if (c.startsWith('3')) return 'Drizzle'
  if (c.startsWith('5')) return 'Rain'
  if (c.startsWith('6')) return 'Snow'
  if (c.startsWith('7')) return 'Mist'
  if (c === '800')       return 'Clear sky'
  if (c.startsWith('8')) return 'Partly cloudy'
  return ''
}

export default function WeatherCard({ data, loading, locationName, lat, lon }) {
  const [view, setView] = useState('daily')

  if (loading) return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ height: 14, width: 160 }} />
      </div>
      <div style={{ padding: '28px 24px' }}>
        <div className="skeleton" style={{ height: 72, width: 140, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: 200 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--border)' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ padding: '14px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div className="skeleton" style={{ height: 11, width: 60, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 20, width: 50 }} />
          </div>
        ))}
      </div>
    </div>
  )

  if (!data) return null

  const current   = data.current || data.current_weather || {}
  const forecast  = data.daily   || data.forecast        || []
  const aiSummary = data.ai_summary || data.summary      || ''
  const temp      = current.temp      ?? current.temperature ?? '--'
  const feels     = current.feels_like ?? ''
  const humidity  = current.humidity   ?? ''
  const wind      = current.wind_speed ?? current.windspeed ?? ''
  const code      = current.weather?.[0]?.id || ''
  const desc      = current.weather?.[0]?.description
                 || current.description
                 || current.weather_description
                 || current.summary
                 || codeToDesc(code)

  const stats = [
    humidity !== '' && { icon: <Droplets size={12} />, label: 'Humidity',  value: `${humidity}%` },
    wind     !== '' && { icon: <Wind size={12} />,     label: 'Wind',      value: `${wind} m/s` },
    current.uvi      != null && { icon: <Sun size={12} />,         label: 'UV Index',  value: current.uvi },
    current.pressure != null && { icon: <Thermometer size={12} />, label: 'Pressure',  value: `${current.pressure} hPa` },
  ].filter(Boolean)

  return (
    <div className="card fade-up" style={{ overflow: 'hidden' }}>

      {/* Top bar — location + view toggle */}
      <div className="wc-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-2)' }}>
          <MapPin size={13} color="var(--text-3)" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
            {locationName || 'Detecting location…'}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
            background: 'var(--ochre-dim)', color: 'var(--ochre)',
            border: '1px solid var(--border-acc)', borderRadius: 4, padding: '2px 6px',
            flexShrink: 0,
          }}>Live</span>
        </div>

        {(forecast.length > 0 || lat != null) && (
          <div className="wc-tabs">
            {[
              { id: 'daily',  label: '7-Day' },
              { id: 'hourly', label: '24-Hour', disabled: lat == null },
            ].map(t => (
              <button
                key={t.id}
                className={`forecast-tab${view === t.id ? ' active' : ''}`}
                disabled={t.disabled}
                onClick={() => setView(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hero — temperature + icon */}
      <div className="wc-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, lineHeight: 1, marginBottom: 8 }}>
            <span className="temp-value" style={{
              fontFamily: 'Syne', fontSize: 76, fontWeight: 800,
              letterSpacing: '-4px', color: 'var(--text)',
            }}>
              {typeof temp === 'number' ? Math.round(temp) : temp}
            </span>
            <span style={{ fontSize: 26, color: 'var(--text-3)', fontWeight: 300, paddingBottom: 8 }}>°C</span>
          </div>
          {desc && (
            <div style={{ fontSize: 15, color: 'var(--text-2)', textTransform: 'capitalize', marginBottom: 4 }}>
              {desc}
            </div>
          )}
          {feels !== '' && (
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Feels like {Math.round(feels)}°C
            </div>
          )}
        </div>
        <div style={{ fontSize: 68, lineHeight: 1, userSelect: 'none', flexShrink: 0 }}>
          {weatherIcon(code)}
        </div>
      </div>

      {/* Stats bar — horizontal, divided */}
      {stats.length > 0 && (
        <div
          className="stat-bar"
          style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
        >
          {stats.map((s, i) => (
            <div key={i} className="stat-cell">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, color: 'var(--text-3)', marginBottom: 5,
              }}>
                {s.icon} {s.label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'Syne', color: 'var(--text)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <div style={{
          margin: '0 24px', padding: '14px 18px',
          background: 'var(--ochre-dim)', border: '1px solid var(--border-acc)',
          borderRadius: 8, marginTop: 20,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
            color: 'var(--ochre)', marginBottom: 7,
          }}>
            AI Summary
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{aiSummary}</div>
        </div>
      )}

      {/* Forecast section */}
      {(forecast.length > 0 || lat != null) && (
        <div style={{ padding: '20px 24px 24px' }}>

          {/* 7-Day grid */}
          {view === 'daily' && forecast.length > 0 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {forecast.slice(0, 7).map((day, i) => {
                const date  = new Date(day.dt ? day.dt * 1000 : day.date)
                const label = i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' })
                const hi    = day.temp?.max ?? day.temp_max ?? day.high ?? '—'
                const lo    = day.temp?.min ?? day.temp_min ?? day.low  ?? '—'
                const dcode = day.weather?.[0]?.id || ''
                const pop   = day.pop != null ? Math.round(day.pop * 100) : null

                return (
                  <div key={i} style={{
                    flex: '0 0 auto', minWidth: 70, textAlign: 'center',
                    padding: '10px 6px', borderRadius: 8,
                    background: i === 0 ? 'var(--ochre-dim)' : 'var(--surface-2)',
                    border: `1px solid ${i === 0 ? 'var(--border-acc)' : 'var(--border)'}`,
                  }}>
                    <div style={{
                      fontSize: 11, marginBottom: 6, fontWeight: i === 0 ? 600 : 400,
                      color: i === 0 ? 'var(--ochre)' : 'var(--text-2)',
                    }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 22, marginBottom: 6, lineHeight: 1 }}>{weatherIcon(dcode)}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {typeof hi === 'number' ? Math.round(hi) : hi}°
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                      {typeof lo === 'number' ? Math.round(lo) : lo}°
                    </div>
                    {pop !== null && pop > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--blue)', marginTop: 4 }}>{pop}%</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {view === 'hourly' && lat != null && <HourlyStrip lat={lat} lon={lon} />}
        </div>
      )}
    </div>
  )
}
