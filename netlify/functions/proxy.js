// Serverless proxy — keeps WEATHER_API_KEY server-side, never in the browser bundle.
// Receives /api/* from the frontend and forwards to https://api.weather-ai.co/v1/*.
// Requires Node 18+ (built-in fetch). Set WEATHER_API_KEY in Netlify env vars.

const UPSTREAM = 'https://api.weather-ai.co/v1'

exports.handler = async (event) => {
  const key = process.env.WEATHER_API_KEY
  if (!key) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server misconfiguration' }),
    }
  }

  // /api/weather → /weather, /api/sms/bomet/register → /sms/bomet/register
  const apiPath = event.path.replace(/^\/api/, '')
  const url = new URL(UPSTREAM + apiPath)

  const params = event.queryStringParameters || {}
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const forwardHeaders = { Authorization: `Bearer ${key}` }
  const contentType = event.headers['content-type']
  if (contentType) forwardHeaders['Content-Type'] = contentType

  const options = { method: event.httpMethod, headers: forwardHeaders }

  if (event.body) {
    // Netlify base64-encodes binary bodies (e.g. multipart image uploads)
    options.body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body
  }

  try {
    const res = await fetch(url.toString(), options)
    const body = await res.text()
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
      body,
    }
  } catch (err) {
    console.error('[proxy] upstream fetch failed', err)
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Upstream service unavailable' }),
    }
  }
}
