import React, { useState } from 'react'
import { Calendar, Droplets, Layers } from 'lucide-react'
import PlantingCalendar from './PlantingCalendar'
import IrrigationCard from './IrrigationCard'
import SoilCard from './SoilCard'

const SECTIONS = [
  { id: 'calendar',   label: 'Planting Calendar', Icon: Calendar },
  { id: 'irrigation', label: 'Irrigation',         Icon: Droplets },
  { id: 'soil',       label: 'Soil',               Icon: Layers   },
]

export default function FarmGuide({ coords, farmers, toast }) {
  const [section, setSection] = useState('calendar')

  const noCoords = !coords && (section === 'irrigation' || section === 'soil')

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
          Farm Guide{' '}
          <span style={{ color: 'var(--ochre)' }}>Intelligence</span>
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 560 }}>
          Planting calendars, daily irrigation guidance, and soil profiles to help farmers make better decisions at every stage of the season.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`forecast-tab${section === id ? ' active' : ''}`}
            onClick={() => setSection(id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {noCoords && (
        <div style={{
          padding: '14px 18px', borderRadius: 'var(--r-sm)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          fontSize: 13, color: 'var(--text-2)', marginBottom: 20,
        }}>
          Search a location on the dashboard to load irrigation and soil data.
        </div>
      )}

      {section === 'calendar' && (
        <PlantingCalendar farmers={farmers} />
      )}

      {section === 'irrigation' && (
        <IrrigationCard coords={coords} farmers={farmers} mode="guide" />
      )}

      {section === 'soil' && (
        <SoilCard coords={coords} mode="guide" />
      )}
    </div>
  )
}
