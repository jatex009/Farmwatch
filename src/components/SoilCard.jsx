import React, { useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import { getSoilData } from '../lib/soilgrids'
import { logError } from '../lib/errors'

function phInterpretation(ph) {
  if (ph === null) return { label: 'Unknown', color: 'var(--text-3)', advice: '' }
  if (ph < 5.5)  return { label: 'Acidic',         color: 'var(--red)',    advice: 'Apply agricultural lime before planting' }
  if (ph <= 6.5) return { label: 'Slightly acidic', color: 'var(--amber)', advice: 'Good for most Kenya crops' }
  if (ph <= 7.5) return { label: 'Optimal',         color: 'var(--green)', advice: 'Ideal pH for most crops' }
  return               { label: 'Alkaline',         color: 'var(--blue)',  advice: 'Add sulfur or organic matter' }
}

function socInterpretation(soc) {
  if (soc === null) return { label: 'Unknown', color: 'var(--text-3)', advice: '' }
  if (soc < 8)  return { label: 'Low',    color: 'var(--red)',    advice: 'Add compost or manure to build organic matter' }
  if (soc <= 20) return { label: 'Medium', color: 'var(--amber)', advice: 'Acceptable — continue adding organic inputs' }
  return               { label: 'Rich',   color: 'var(--green)', advice: 'Excellent organic matter — maintain with crop residue' }
}

function clayInterpretation(clay) {
  if (clay === null) return { label: 'Unknown', color: 'var(--text-3)', advice: '' }
  if (clay < 20)  return { label: 'Sandy loam',   color: 'var(--amber)', advice: 'Drains fast — irrigate more frequently in smaller amounts' }
  if (clay <= 40) return { label: 'Loamy',        color: 'var(--green)', advice: 'Ideal balance of drainage and water retention' }
  return                 { label: 'Clay-heavy',   color: 'var(--blue)',  advice: 'Waterlogging risk — add organic matter and avoid over-irrigation' }
}

function suitableCrops(ph) {
  if (ph === null) return []
  if (ph < 5.5)  return ['sorghum', 'millet', 'tea']
  if (ph <= 6.5) return ['maize', 'beans', 'coffee', 'wheat', 'horticulture']
  if (ph <= 7.5) return ['sugarcane', 'rice', 'wheat', 'maize', 'beans']
  return ['sorghum', 'millet']
}

function amendments(ph, soc, clay) {
  const items = []
  if (ph !== null && ph < 5.5) items.push('Apply agricultural lime (1–2 t/ha) and incorporate 4–6 weeks before planting')
  if (ph !== null && ph > 7.5) items.push('Add elemental sulfur (50kg/ha) or acidifying fertilizers to lower pH')
  if (soc !== null && soc < 8)  items.push('Incorporate 5–10 t/ha of farmyard manure or compost annually')
  if (clay !== null && clay > 40) items.push('Deep-till and add river sand or organic matter to improve drainage')
  if (clay !== null && clay < 20) items.push('Apply mulch to reduce evaporation; use micro-irrigation for efficiency')
  if (items.length === 0) items.push('Soil is in good condition — maintain with balanced fertilization and cover crops')
  return items
}

function MetricBar({ label, value, max, color, interpretation, fullText, mode }) {
  const pct = value !== null ? Math.min(value / max, 1) * 100 : 0
  return (
    <div style={{ marginBottom: mode === 'guide' ? 18 : 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {value !== null && (
            <span style={{ fontFamily: 'Syne', fontSize: mode === 'guide' ? 16 : 14, fontWeight: 700, color }}>
              {value.toFixed(1)}
            </span>
          )}
          <span style={{
            display: 'inline-flex', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
            color, background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          }}>
            {interpretation.label}
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 99,
          transition: 'width 0.6s ease',
          opacity: 0.8,
        }} />
      </div>
      {mode === 'guide' && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {fullText}
        </p>
      )}
    </div>
  )
}

export default function SoilCard({ coords, mode = 'guide' }) {
  const [soil, setSoil]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(false)

  useEffect(() => {
    if (!coords) return
    setLoading(true)
    setError(false)
    getSoilData(coords.lat, coords.lon)
      .then(data => { setSoil(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [coords?.lat, coords?.lon])

  const ph   = soil?.ph   ?? null
  const soc  = soil?.soc  ?? null
  const clay = soil?.clay ?? null

  const phI   = phInterpretation(ph)
  const socI  = socInterpretation(soc)
  const clayI = clayInterpretation(clay)
  const crops = suitableCrops(ph)
  const amends = amendments(ph, soc, clay)

  if (mode === 'dashboard') {
    return (
      <div className="card fade-up fade-up-3" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Layers size={16} color="var(--text-2)" />
          <span style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700 }}>Soil Profile</span>
          {coords && (
            <span className="tag tag-ochre" style={{ marginLeft: 'auto', fontSize: 10 }}>
              0–5cm depth
            </span>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 32, borderRadius: 'var(--r-sm)' }} />
            <div className="skeleton" style={{ height: 32, borderRadius: 'var(--r-sm)' }} />
            <div className="skeleton" style={{ height: 32, borderRadius: 'var(--r-sm)' }} />
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
            Soil data unavailable
          </div>
        )}

        {!loading && !error && soil && (
          <>
            <MetricBar label="pH" value={ph} max={14} color={phI.color} interpretation={phI} fullText={phI.advice} mode="dashboard" />
            <MetricBar label="Organic Carbon (g/kg)" value={soc} max={40} color={socI.color} interpretation={socI} fullText={socI.advice} mode="dashboard" />
            <MetricBar label="Clay (%)" value={clay} max={100} color={clayI.color} interpretation={clayI} fullText={clayI.advice} mode="dashboard" />
            {crops.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
                <span style={{ color: 'var(--text-3)' }}>Best for: </span>
                {crops.map(c => (
                  <span key={c} style={{ marginRight: 4 }}>{c}</span>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && !soil && !coords && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
            Search a location to load data
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Layers size={18} color="var(--text-2)" />
        <span style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700 }}>Soil Profile</span>
        <span className="tag tag-ochre" style={{ fontSize: 11 }}>0–5cm depth</span>
      </div>

      {loading && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--r-sm)' }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
          Soil data unavailable for this location.
        </div>
      )}

      {!loading && !error && soil && (
        <>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.2 }}>
              Soil Metrics
            </div>
            <MetricBar label="pH" value={ph} max={14} color={phI.color} interpretation={phI} fullText={phI.advice} mode="guide" />
            <MetricBar label="Soil Organic Carbon (g/kg)" value={soc} max={40} color={socI.color} interpretation={socI} fullText={socI.advice} mode="guide" />
            <MetricBar label="Clay Content (%)" value={clay} max={100} color={clayI.color} interpretation={clayI} fullText={clayI.advice} mode="guide" />
          </div>

          {crops.length > 0 && (
            <div className="card" style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.2 }}>
                Crop Suitability
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {crops.map(c => (
                  <span key={c} className="tag tag-green" style={{ fontSize: 12 }}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.2 }}>
              Recommendations
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {amends.map((a, i) => (
                <li key={i} style={{
                  fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55,
                  padding: '8px 12px', background: 'var(--surface-2)',
                  borderRadius: 'var(--r-sm)', borderLeft: '2px solid var(--border-acc)',
                }}>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
            SoilGrids ISRIC — 0-5cm depth · Data may vary from field measurements
          </div>
        </>
      )}

      {!loading && !error && !soil && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
          No soil data available.
        </div>
      )}
    </div>
  )
}
