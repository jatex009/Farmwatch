const BASE = '/api'

async function get(path, params = {}) {
  const url = new URL(BASE + path, location.origin)
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

// Weather
export const getWeather = (lat, lon, days = 7, lang = 'en') =>
  get('/weather', { lat, lon, days, ai: true, units: 'metric', lang })

export const getCurrentWeather = (lat, lon) =>
  get('/current', { lat, lon, ai: false, units: 'metric' })

export const getWeatherGeo = (days = 7, lang = 'en') =>
  get('/weather-geo', { ip: 'auto', days, ai: true, units: 'metric', lang })

export const getHourlyForecast = (lat, lon) =>
  get('/hourly', { lat, lon, days: 2, units: 'metric' })

// Farmers / SMS
export const registerFarmer = (phone, name, location, cropType) =>
  post('/sms/bomet/register', { phone, name, location, cropType })

export const sendSmsAlert = (to, alertType, data = {}) =>
  post('/sms/alert', { to, alertType, data })

export const getSmsHealth = () => get('/sms/health')

// Trees
export const analyzeTreeImage = (formData) => {
  return fetch(BASE + '/trees/analyze', {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw { status: res.status, ...data }
    return data
  })
}

export const getTreeHistory = (limit = 10) => get('/trees/history', { limit })
export const getTreesQuota  = ()            => get('/trees/quota')

// Usage
export const getUsage = () => get('/usage')

// Constants
export const CROPS = [
  'maize', 'tea', 'coffee', 'wheat', 'rice',
  'beans', 'sorghum', 'millet', 'sugarcane', 'horticulture',
]

export const KENYAN_COUNTIES = [
  'Bomet', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Kitale', 'Kakamega', 'Nyeri', 'Meru', 'Kericho', 'Nandi', 'Trans Nzoia',
  'Bungoma', 'Kisii', 'Migori', 'Siaya', 'Vihiga', 'Homabay',
]

export const COUNTY_COORDS = {
  'Nairobi':     { lat: -1.2921, lon: 36.8219 },
  'Bomet':       { lat: -0.7820, lon: 35.3421 },
  'Mombasa':     { lat: -4.0435, lon: 39.6682 },
  'Kisumu':      { lat: -0.0917, lon: 34.7680 },
  'Nakuru':      { lat: -0.3031, lon: 36.0800 },
  'Kericho':     { lat: -0.3700, lon: 35.2835 },
  'Eldoret':     { lat:  0.5199, lon: 35.2699 },
  'Kitale':      { lat:  0.9767, lon: 35.0062 },
  'Trans Nzoia': { lat:  1.0166, lon: 35.0050 },
  'Bungoma':     { lat:  0.5635, lon: 34.5606 },
  'Kakamega':    { lat:  0.2827, lon: 34.7519 },
  'Nyeri':       { lat: -0.4167, lon: 36.9500 },
  'Meru':        { lat:  0.0500, lon: 37.6500 },
  'Nandi':       { lat:  0.1833, lon: 35.1167 },
  'Kisii':       { lat: -0.6817, lon: 34.7667 },
  'Migori':      { lat: -1.0634, lon: 34.4731 },
  'Siaya':       { lat:  0.0610, lon: 34.2880 },
  'Homabay':     { lat: -0.5167, lon: 34.4500 },
  'Thika':       { lat: -1.0332, lon: 37.0693 },
}

export const ALERT_TYPES = [
  { value: 'rain',         label: 'Heavy Rain',    weatherIcon: '🌧️' },
  { value: 'frost',        label: 'Frost Warning', weatherIcon: '🌨️' },
  { value: 'extreme_wind', label: 'Extreme Wind',  weatherIcon: '💨' },
  { value: 'drought',      label: 'Drought Alert', weatherIcon: '☀️' },
]

// Maps OpenWeatherMap condition codes to emoji — intentional use of weather symbols
export function weatherIcon(code) {
  if (!code) return '🌤️'
  const c = String(code)
  if (c.startsWith('2')) return '⛈️'
  if (c.startsWith('3')) return '🌦️'
  if (c.startsWith('5')) return '🌧️'
  if (c.startsWith('6')) return '❄️'
  if (c.startsWith('7')) return '🌫️'
  if (c === '800')       return '☀️'
  if (c.startsWith('8')) return '⛅'
  return '🌤️'
}

export function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '')
  if (raw.trim().startsWith('+')) return '+' + digits
  if (digits.startsWith('254'))   return '+' + digits
  if (digits.startsWith('0') && digits.length === 10) return '+254' + digits.slice(1)
  if (digits.length === 9)        return '+254' + digits
  return '+' + digits
}

export function isValidPhone(e164) {
  return /^\+\d{10,14}$/.test(e164)
}
