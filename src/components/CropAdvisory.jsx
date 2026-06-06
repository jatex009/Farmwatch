import React, { useMemo } from 'react'
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react'
import { weatherIcon } from '../lib/api'

const CROP_ADVICE = {
  maize: {
    rain:    'Hold off re-planting. Check drainage to prevent waterlogging and root rot.',
    frost:   'Cover young seedlings overnight. Frost cloth is critical below 12 °C.',
    wind:    'Stake tall maize to prevent lodging, especially at silking stage.',
    drought: 'Irrigate at root-zone every 3 days. Apply organic mulch to retain moisture.',
    clear:   'Good window for top-dressing CAN fertilizer and weed control.',
  },
  tea: {
    rain:    'Harvest mature flush before heavy rain to prevent quality loss and fungal damage.',
    frost:   'Critical — frost severely scorches tea bushes. Run sprinklers overnight if available.',
    wind:    'Delay all spray operations. Secure young transplants.',
    drought: 'Deep-water twice weekly. Watch for spider mite and thrip outbreaks.',
    clear:   'Ideal spray and picking conditions. Good drying weather for processed leaf.',
  },
  coffee: {
    rain:    'Monitor for Coffee Berry Disease (CBD). Ensure good bed drainage.',
    frost:   'Use shade trees as windbreaks. Young coffee is vulnerable below 10 °C.',
    wind:    'Delay agro-chemical spraying. Check support stakes for young trees.',
    drought: 'Irrigate weekly. Apply 30 cm mulch ring around tree base.',
    clear:   'Good conditions for drying harvested cherries on raised beds.',
  },
  wheat: {
    rain:    'Monitor for rust and Septoria leaf blotch. Avoid field operations on wet soil.',
    frost:   'Frost at tillering causes significant tiller death and yield reduction.',
    wind:    'Risk of lodging at heading stage. Avoid late nitrogen top-dressing.',
    drought: 'Irrigate at tillering, heading and grain fill — critical growth windows.',
    clear:   'Good harvesting conditions if grain moisture is below 14%.',
  },
  rice: {
    rain:    'Maintain paddy water levels. Monitor for blast disease in high humidity.',
    frost:   'Rice is cold-sensitive at all stages. Drain and re-flood to manage temperature.',
    wind:    'Moderate wind aids pollination at flowering stage.',
    drought: 'Maintain 5–10 cm standing water depth. Do not let paddies dry out.',
    clear:   'Good conditions for transplanting seedlings and field levelling.',
  },
  beans: {
    rain:    'Watch for angular leaf spot and root rot. Avoid spraying in wet conditions.',
    frost:   'Highly frost-sensitive. Harvest mature pods before frost onset.',
    wind:    'Provide trellis support for climbing varieties.',
    drought: 'Drought-sensitive at flowering. Irrigate consistently at reproductive stage.',
    clear:   'Ideal conditions for planting and harvesting dry beans.',
  },
  sorghum: {
    rain:    'Tolerates moderate rain. Monitor for head smut in high humidity.',
    frost:   'Frost at panicle emergence causes grain sterility.',
    wind:    'Wind-tolerant. Tall varieties may lodge at grain fill.',
    drought: 'Highly drought-tolerant. Resume irrigation only if wilting is observed.',
    clear:   'Excellent conditions for all field operations.',
  },
  millet: {
    rain:    'Millet prefers dry conditions. Watch for downy mildew in prolonged humid spells.',
    frost:   'Frost-sensitive at emergence. Delay sowing if risk persists.',
    wind:    'Naturally wind-tolerant crop.',
    drought: 'Pearl millet thrives in dry conditions. Minimal intervention needed.',
    clear:   'Excellent growing, threshing and storage conditions.',
  },
  sugarcane: {
    rain:    'Good for grand-growth-phase cane. Ensure drainage at ratoon stage.',
    frost:   'Frost reduces sucrose content significantly. Harvest before prolonged frost.',
    wind:    'Risk of cane toppling in tall varieties. Tighten support stakes.',
    drought: 'Irrigate every 7–10 days. Apply inter-row mulch.',
    clear:   'Good conditions for manual cutting and mill transportation.',
  },
  horticulture: {
    rain:    'Protect vegetables with row covers. Scout for Pythium damping-off.',
    frost:   'Critical for most vegetables. Cover all beds overnight.',
    wind:    'Install windbreaks or low tunnels. Secure drip irrigation lines.',
    drought: 'Drip-irrigate daily for leafy vegetables. Mulch beds heavily.',
    clear:   'Ideal planting, transplanting and harvesting conditions.',
  },
}

const RISK_META = {
  rain:    { label: 'Rain Alert',    icon: '🌧️', color: 'var(--blue)',  dimColor: 'var(--blue-dim)',  borderColor: 'rgba(96,165,250,0.2)' },
  frost:   { label: 'Frost Warning', icon: '🌨️', color: '#a5c8ff',     dimColor: 'var(--blue-dim)',  borderColor: 'rgba(165,200,255,0.2)' },
  wind:    { label: 'Extreme Wind',  icon: '💨', color: 'var(--amber)', dimColor: 'var(--amber-dim)', borderColor: 'rgba(251,191,36,0.2)' },
  drought: { label: 'Drought Risk',  icon: '☀️', color: 'var(--red)',   dimColor: 'var(--red-dim)',   borderColor: 'rgba(248,113,113,0.2)' },
}

function analyzeRisks(forecast) {
  const days = forecast.map((day, i) => {
    const date    = new Date(day.dt ? day.dt * 1000 : day.date)
    const pop     = day.pop ?? 0
    const rain    = day.rain ?? 0
    const minTemp = day.temp?.min ?? day.temp_min ?? null
    const maxTemp = day.temp?.max ?? day.temp_max ?? null
    const wind    = day.wind_speed ?? 0
    const code    = day.weather?.[0]?.id ?? 0
    const flags   = new Set()

    if (pop > 0.45 || rain > 5 || (code >= 500 && code < 700)) flags.add('rain')
    if (minTemp !== null && minTemp < 12)                        flags.add('frost')
    if (wind > 10)                                               flags.add('wind')

    return { date, i, pop, rain, minTemp, maxTemp, wind, flags }
  })

  let streak = 0
  days.forEach(d => {
    if (d.pop < 0.15 && (d.maxTemp ?? 0) > 26) { streak++; if (streak >= 4) d.flags.add('drought') }
    else streak = 0
  })

  return days
}

export default function CropAdvisory({ forecast, farmers }) {
  const riskDays = useMemo(() => {
    if (!forecast || forecast.length === 0) return []
    return analyzeRisks(forecast)
  }, [forecast])

  const enrolledCrops = useMemo(
    () => [...new Set(farmers.map(f => f.cropType).filter(Boolean))],
    [farmers]
  )

  if (riskDays.length === 0) return null

  const activeRisks = [...new Set(riskDays.flatMap(d => [...d.flags]))]
  const allClear    = activeRisks.length === 0

  return (
    <div className="card fade-up fade-up-4" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '16px 22px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
          <Activity size={14} color="var(--ochre)" />
          Crop Intelligence
        </div>
        {enrolledCrops.length > 0
          ? enrolledCrops.map(c => (
              <span key={c} className="tag tag-green" style={{ fontSize: 11 }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </span>
            ))
          : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Register farmers to receive crop-specific advisories
            </span>
        }
      </div>

      <div style={{ padding: '20px 22px' }}>
        {/* 7-day risk timeline */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {riskDays.map((d, i) => {
            const label    = i === 0 ? 'Today' : d.date.toLocaleDateString('en', { weekday: 'short' })
            const code     = forecast[i]?.weather?.[0]?.id || ''
            const severity = d.flags.has('frost') || d.flags.has('drought') ? 'high'
                           : d.flags.has('rain')  || d.flags.has('wind')   ? 'med' : 'ok'
            const dotColor = severity === 'high' ? 'var(--red)'
                           : severity === 'med'  ? 'var(--amber)' : 'var(--green)'

            return (
              <div key={i} style={{
                flex: '0 0 auto', minWidth: 58, textAlign: 'center',
                padding: '9px 6px', borderRadius: 8,
                background: i === 0 ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${i === 0 ? 'var(--border-md)' : 'transparent'}`,
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 4, fontWeight: i === 0 ? 600 : 400 }}>
                  {label}
                </div>
                <div style={{ fontSize: 20, marginBottom: 5, lineHeight: 1 }}>{weatherIcon(code)}</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, margin: '0 auto' }} />
              </div>
            )
          })}
        </div>

        {/* Advisories */}
        {allClear ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.18)',
            borderRadius: 8,
          }}>
            <CheckCircle size={17} color="var(--green)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 2 }}>All Clear</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Favourable conditions across the 7-day forecast. Good window for all field operations.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeRisks.map(risk => {
              const meta      = RISK_META[risk]
              const days      = riskDays.filter(d => d.flags.has(risk))
              const dayLabels = days.map((d, j) =>
                j === 0 && d.i === 0 ? 'Today' : d.date.toLocaleDateString('en', { weekday: 'short' })
              )
              const crops = enrolledCrops.length > 0 ? enrolledCrops : ['maize', 'tea']

              return (
                <div key={risk} style={{
                  borderRadius: 8, border: `1px solid ${meta.borderColor}`, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 14px', background: meta.dimColor,
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: `1px solid ${meta.borderColor}`,
                  }}>
                    <span style={{ fontSize: 14 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>— {dayLabels.join(', ')}</span>
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {crops.filter(c => CROP_ADVICE[c]).map(crop => (
                      <div key={crop} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span className="tag tag-green" style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                          {crop.charAt(0).toUpperCase() + crop.slice(1)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
                          {CROP_ADVICE[crop][risk]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
