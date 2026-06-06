import { logError } from './errors'

export async function getSoilData(lat, lon) {
  const url = new URL('https://rest.isric.org/soilgrids/v2.0/properties/query')
  url.searchParams.set('lon', lon)
  url.searchParams.set('lat', lat)
  url.searchParams.set('property', 'phh2o')
  url.searchParams.append('property', 'soc')
  url.searchParams.append('property', 'clay')
  url.searchParams.set('depth', '0-5cm')
  url.searchParams.set('value', 'mean')

  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`SoilGrids responded ${res.status}`)
    const data = await res.json()

    const result = {}
    for (const layer of data.properties.layers) {
      const mean    = layer.depths[0]?.values?.mean
      const dFactor = layer.unit_measure?.d_factor ?? 1
      if (mean == null) continue
      result[layer.name] = mean / dFactor
    }

    return {
      ph:   result['phh2o'] ?? null,
      soc:  result['soc']   ?? null,
      clay: result['clay']  ?? null,
    }
  } catch (err) {
    logError('getSoilData', err)
    throw err
  }
}
