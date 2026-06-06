import { logError } from './errors'

export async function getET0Forecast(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('daily', 'et0_fao_evapotranspiration,precipitation_sum')
  url.searchParams.set('timezone', 'Africa/Nairobi')
  url.searchParams.set('forecast_days', '7')

  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`)
    const data = await res.json()
    return {
      dates: data.daily.time,
      et0:   data.daily.et0_fao_evapotranspiration,
      rain:  data.daily.precipitation_sum,
    }
  } catch (err) {
    logError('getET0Forecast', err)
    throw err
  }
}
