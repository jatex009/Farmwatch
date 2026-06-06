import React, { useState, useEffect, useCallback, useRef } from 'react'
import { LayoutDashboard, Users, TreePine, Search, Leaf, Menu, X, Sprout } from 'lucide-react'
import WeatherCard from './components/WeatherCard'
import RegisterFarmerForm from './components/RegisterFarmerForm'
import FarmerList from './components/FarmerList'
import TreeAnalyzer from './components/TreeAnalyzer'
import UsageBar from './components/UsageBar'
import CropAdvisory from './components/CropAdvisory'
import FarmGuide from './components/FarmGuide'
import IrrigationCard from './components/IrrigationCard'
import SoilCard from './components/SoilCard'
import ToastContainer from './components/Toast'
import { useToast } from './lib/useToast'
import { getWeatherGeo, getWeather, COUNTY_COORDS } from './lib/api'
import { logError } from './lib/errors'

const TABS = [
  { id: 'dashboard', label: 'Dashboard',     Icon: LayoutDashboard },
  { id: 'farmers',   label: 'Farmers',       Icon: Users },
  { id: 'trees',     label: 'Tree Analysis', Icon: TreePine },
  { id: 'farmguide', label: 'Farm Guide',    Icon: Sprout },
]

const NAIROBI = { lat: -1.2921, lon: 36.8219 }

export default function App() {
  const { toasts, toast } = useToast()
  const [tab, setTab]     = useState('dashboard')
  const [farmers, setFarmers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fw_farmers') || '[]') } catch { return [] }
  })

  const [weatherData, setWeatherData]       = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [locationName, setLocationName]     = useState('')
  const [coords, setCoords]                 = useState(null)
  const [lang, setLang]                     = useState('en')
  const [searchQuery, setSearchQuery]       = useState('')
  const [searching, setSearching]           = useState(false)
  const [mobileNavOpen, setMobileNavOpen]   = useState(false)

  const coordsRef = useRef(null)
  useEffect(() => { coordsRef.current = coords }, [coords])

  useEffect(() => {
    localStorage.setItem('fw_farmers', JSON.stringify(farmers))
  }, [farmers])

  useEffect(() => {
    setWeatherLoading(true)
    getWeatherGeo(7, lang)
      .then(data => {
        setWeatherData(data)
        const lat = data.geo?.lat ?? NAIROBI.lat
        const lon = data.geo?.lon ?? NAIROBI.lon
        setCoords({ lat, lon })
        const city    = data.geo?.city    || data.location?.city    || 'Your Location'
        const country = data.geo?.country || data.location?.country || ''
        setLocationName(`${city}${country ? ', ' + country : ''}`)
      })
      .catch(geoErr => {
        logError('getWeatherGeo', geoErr)
        getWeather(NAIROBI.lat, NAIROBI.lon, 7, lang)
          .then(data => { setWeatherData(data); setCoords(NAIROBI); setLocationName('Nairobi, KE') })
          .catch(err => { logError('getWeather:fallback', err); toast('Could not load weather data', 'error') })
      })
      .finally(() => setWeatherLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLang = () => {
    const next = lang === 'en' ? 'sw' : 'en'
    setLang(next)
    const c = coordsRef.current
    if (!c) return
    setWeatherLoading(true)
    getWeather(c.lat, c.lon, 7, next)
      .then(setWeatherData)
      .catch(err => { logError('toggleLang', err); toast('Could not reload weather', 'error') })
      .finally(() => setWeatherLoading(false))
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const q = searchQuery.trim()
    const match = Object.entries(COUNTY_COORDS).find(([k]) => k.toLowerCase().includes(q.toLowerCase()))
    if (match) {
      const [name, c] = match
      try {
        const data = await getWeather(c.lat, c.lon, 7, lang)
        setWeatherData(data); setCoords({ lat: c.lat, lon: c.lon }); setLocationName(name + ', KE')
        toast(`Showing weather for ${name}`, 'success')
      } catch (err) { logError('searchLocation:county', err); toast('Could not load weather', 'error') }
    } else {
      try {
        const res    = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`)
        const places = await res.json()
        if (places.length > 0) {
          const { lat, lon, display_name } = places[0]
          const pLat = parseFloat(lat), pLon = parseFloat(lon)
          const data = await getWeather(pLat, pLon, 7, lang)
          setWeatherData(data); setCoords({ lat: pLat, lon: pLon })
          setLocationName(display_name.split(',').slice(0, 2).join(','))
          toast(`Showing weather for ${places[0].name || q}`, 'success')
        } else {
          toast('Location not found — try a Kenyan county name', 'error')
        }
      } catch (err) { logError('searchLocation:nominatim', err); toast('Search failed', 'error') }
    }
    setSearching(false)
    setMobileNavOpen(false)
  }

  const addFarmer    = useCallback((farmer) => setFarmers(prev => [farmer, ...prev]), [])
  const removeFarmer = useCallback((id) => {
    setFarmers(prev => prev.filter(f => f.id !== id))
    toast('Farmer removed', 'info')
  }, [])

  const forecast = weatherData?.daily || weatherData?.forecast || []

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(11,8,4,0.92)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 20px',
          height: 54, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, marginRight: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--leaf) 0%, var(--ochre) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf size={15} color="#fff" />
            </div>
            <div className="logo-text">
              <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>FarmWatch</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.3 }}>Powered by Weather-AI</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ gap: 2, flex: 1 }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'DM Sans', border: 'none', transition: 'all 0.15s',
                  background: tab === id ? 'var(--surface-2)' : 'transparent',
                  color: tab === id ? 'var(--text)' : 'var(--text-2)',
                  fontWeight: tab === id ? 500 : 400,
                }}
              >
                <Icon size={13} />
                {label}
                {id === 'farmers' && farmers.length > 0 && (
                  <span style={{
                    background: 'var(--ochre)', color: '#0b0804',
                    borderRadius: 99, fontSize: 10, padding: '0 5px', fontWeight: 700, lineHeight: '16px',
                  }}>
                    {farmers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            title={lang === 'en' ? 'Switch AI summaries to Swahili' : 'Switch to English'}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-2)', borderRadius: 6, padding: '4px 9px',
              fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans', flexShrink: 0,
            }}
          >
            {lang === 'en' ? '🇰🇪 SW' : '🇬🇧 EN'}
          </button>

          <div className="usage-bar-wrapper">
            <UsageBar />
          </div>

          {/* Mobile hamburger — display controlled by CSS .mobile-menu-btn media query */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileNavOpen(o => !o)}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-2)', borderRadius: 6, padding: '5px 7px',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileNavOpen && (
          <div className="mobile-nav-drawer">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => { setTab(id); setMobileNavOpen(false) }} style={{
                background: tab === id ? 'var(--surface-2)' : 'transparent',
                border: 'none', color: tab === id ? 'var(--text)' : 'var(--text-2)',
                padding: '13px 20px', fontSize: 14, cursor: 'pointer',
                fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: '1px solid var(--border)', width: '100%', textAlign: 'left',
              }}>
                <Icon size={15} /> {label}
                {id === 'farmers' && farmers.length > 0 && (
                  <span style={{ background: 'var(--ochre)', color: '#0b0804', borderRadius: 99, fontSize: 10, padding: '0 5px', fontWeight: 700, lineHeight: '16px', marginLeft: 'auto' }}>
                    {farmers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '32px 20px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 className="page-title" style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
                Weather Intelligence{' '}
                <span style={{ color: 'var(--ochre)' }}>Dashboard</span>
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.55 }}>
                Real-time weather data with Gemini AI insights for Kenyan smallholder farmers.
              </p>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 460 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Search county or city…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchLocation()}
                />
              </div>
              <button className="btn btn-primary" onClick={searchLocation} disabled={searching} style={{ gap: 6 }}>
                {searching ? <span className="spinner" /> : null}
                Search
              </button>
            </div>

            {/* Weather card */}
            <WeatherCard
              data={weatherData}
              loading={weatherLoading}
              locationName={locationName}
              lat={coords?.lat}
              lon={coords?.lon}
            />

            {coords && (
              <div className="grid-2" style={{ gap: 16, marginTop: 16 }}>
                <IrrigationCard coords={coords} farmers={farmers} mode="dashboard" />
                <SoilCard coords={coords} mode="dashboard" />
              </div>
            )}

            {/* Crop intelligence */}
            {forecast.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <CropAdvisory forecast={forecast} farmers={farmers} />
              </div>
            )}

            {/* Overview grid */}
            <div className="grid-2" style={{ gap: 16, marginTop: 16 }}>
              <div className="card fade-up fade-up-2" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 18, letterSpacing: 0.2 }}>
                  System Overview
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <OverviewRow label="Registered Farmers" value={farmers.length} />
                  <OverviewRow label="Counties Covered"   value={[...new Set(farmers.map(f => f.location))].length} />
                  <OverviewRow label="Crops Monitored"    value={[...new Set(farmers.map(f => f.cropType))].length} />
                  <OverviewRow label="API Plan"           value="Free"                                   badge="tag-ochre" />
                  <OverviewRow label="Language"        value={lang === 'en' ? 'English' : 'Swahili'} badge="tag-sky" last />
                </div>
              </div>

              <div className="card fade-up fade-up-3" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 18, letterSpacing: 0.2 }}>
                  Alert Types
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '🌧️', label: 'Heavy Rain',    note: 'Flood risk, waterlogging',  color: 'var(--blue)' },
                    { icon: '🌨️', label: 'Frost Warning', note: 'Overnight crop damage',      color: '#a5c8ff' },
                    { icon: '💨', label: 'Extreme Wind',  note: 'Infrastructure risk',        color: 'var(--amber)' },
                    { icon: '☀️', label: 'Drought Alert', note: 'Irrigation advisory',        color: 'var(--red)' },
                  ].map(a => (
                    <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: a.color }}>{a.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{a.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Farmers */}
        {tab === 'farmers' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
                Farmer <span style={{ color: 'var(--ochre)' }}>Alert Portal</span>
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
                Register farmers into the Agricultural Alert System and dispatch SMS weather alerts.
              </p>
            </div>
            <div className="grid-sidebar" style={{ gap: 20 }}>
              <RegisterFarmerForm onSuccess={addFarmer} toast={toast} />
              <FarmerList farmers={farmers} onRemove={removeFarmer} toast={toast} />
            </div>
          </div>
        )}

        {/* Trees */}
        {tab === 'trees' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
                Tree & Canopy <span style={{ color: 'var(--leaf-lt)' }}>Analysis</span>
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
                Upload drone or aerial farm imagery. Computer vision counts tree crowns and Gemini AI generates agronomic recommendations.
              </p>
            </div>
            <div style={{ maxWidth: 640 }}>
              <TreeAnalyzer toast={toast} />
            </div>
          </div>
        )}

        {/* Farm Guide */}
        {tab === 'farmguide' && (
          <FarmGuide coords={coords} farmers={farmers} toast={toast} />
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

function OverviewRow({ label, value, badge, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
      {badge
        ? <span className={`tag ${badge}`}>{value}</span>
        : <span style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
      }
    </div>
  )
}
