import React, { useState } from 'react'
import { ChevronDown, ChevronUp, CloudRain, Cloud, Sun } from 'lucide-react'
import { CROP_PROFILES, getSeasonStatus, getPlantingStatus } from '../lib/farmguide'

function SeasonBanner({ season }) {
  const phaseColor = season.phase === 'prime'
    ? 'var(--ochre)'
    : season.phase === 'late'
    ? 'var(--amber)'
    : 'var(--text-3)'

  const phaseBg = season.phase === 'prime'
    ? 'var(--ochre-dim)'
    : season.phase === 'late'
    ? 'var(--amber-dim)'
    : 'rgba(90,77,60,0.15)'

  const phaseBorder = season.phase === 'prime'
    ? 'var(--border-acc)'
    : season.phase === 'late'
    ? 'rgba(251,191,36,0.2)'
    : 'rgba(90,77,60,0.3)'

  return (
    <div className="card fade-up" style={{
      padding: '20px 24px',
      marginBottom: 24,
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ color: phaseColor, flexShrink: 0 }}>
        {season.season === 'long_rains'  ? <CloudRain size={26} /> :
         season.season === 'short_rains' ? <Cloud size={26} /> :
         <Sun size={26} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700 }}>
            {season.label}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
            color: phaseColor, background: phaseBg, border: `1px solid ${phaseBorder}`,
          }}>
            {season.phase === 'prime' ? 'Peak Window' : season.phase === 'late' ? 'Late Season' : 'Off Season'}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{season.note}</p>
      </div>
    </div>
  )
}

function CropCard({ cropKey, profile, farmersWithCrop }) {
  const [open, setOpen] = useState(false)
  const status = getPlantingStatus(cropKey)

  const statusTagClass =
    status.status === 'prime'     ? 'tag tag-ochre' :
    status.status === 'late'      ? 'tag tag-amber' :
    status.status === 'perennial' ? 'tag tag-green' :
    'tag'

  const offTagStyle = status.status === 'off'
    ? { background: 'rgba(90,77,60,0.15)', color: 'var(--text-3)', border: '1px solid rgba(90,77,60,0.3)' }
    : {}

  return (
    <div className="card fade-up" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: farmersWithCrop > 0 ? 3 : 0 }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{profile.name}</span>
            <span className={statusTagClass} style={offTagStyle}>{status.label}</span>
          </div>
          {farmersWithCrop > 0 && (
            <div style={{ fontSize: 11, color: 'var(--leaf-lt)' }}>
              {farmersWithCrop} farmer{farmersWithCrop > 1 ? 's' : ''} enrolled
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
        {status.note
          ? <span style={{ color: status.color, fontWeight: 500 }}>{status.note}</span>
          : null
        }
        {status.note && ' · '}
        {profile.daysToMaturity.min}–{profile.daysToMaturity.max} days to maturity
      </div>

      <div className="divider" style={{ marginBottom: 10 }} />

      <button
        className="btn btn-ghost"
        style={{ width: '100%', fontSize: 12, padding: '6px 10px', gap: 6, justifyContent: 'space-between' }}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>Care Guide</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-3)' }}>Spacing:</span>{' '}
            <span style={{ color: 'var(--text)' }}>{profile.spacing}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-3)' }}>Fertilizer:</span>{' '}
            <span style={{ color: 'var(--text)' }}>{profile.fertilizer}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
            <span style={{ color: 'var(--text-3)' }}>Watch for:</span>{' '}
            <span style={{ color: 'var(--text)' }}>{profile.pests.join(', ')}</span>
          </div>
          <div className="divider" style={{ marginBottom: 10 }} />
          <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.steps.map((step, i) => (
              <li key={i} style={{
                fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5,
                padding: '6px 10px', background: 'var(--surface-2)',
                borderRadius: 'var(--r-sm)', borderLeft: '2px solid var(--border-acc)',
              }}>
                {step}
              </li>
            ))}
          </ol>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
            Elevation: {profile.elevationRange} · Yield: {profile.expectedYield}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlantingCalendar({ farmers }) {
  const season = getSeasonStatus()

  const farmerCropCounts = {}
  for (const f of farmers) {
    const key = f.cropType?.toLowerCase()
    if (key) farmerCropCounts[key] = (farmerCropCounts[key] || 0) + 1
  }

  return (
    <div>
      <SeasonBanner season={season} />
      <div className="grid-3" style={{ gap: 14 }}>
        {Object.entries(CROP_PROFILES).map(([key, profile]) => (
          <CropCard
            key={key}
            cropKey={key}
            profile={profile}
            farmersWithCrop={farmerCropCounts[key] || 0}
          />
        ))}
      </div>
    </div>
  )
}
