// Origins that may appear in API-sourced asset URLs (e.g. overlay images from the tree analyzer)
const TRUSTED_IMG_ORIGINS = new Set([
  'https://api.weather-ai.co',
])

/**
 * Validates a client-side redirect target.
 *
 * Accepts:  relative same-origin paths  (/dashboard, /farmers)
 * Rejects:  protocol-relative           (//evil.com/...)
 *           absolute external URLs      (https://phishing.com)
 *           javascript:/data: URIs
 *
 * Returns the path when safe, `fallback` otherwise.
 */
export function safeRedirect(raw, fallback = '/') {
  if (!raw || typeof raw !== 'string') return fallback
  // Must start with / but NOT // (protocol-relative)
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  try {
    const url = new URL(raw, window.location.origin)
    if (url.origin !== window.location.origin) return fallback
    return raw
  } catch {
    return fallback
  }
}

/**
 * Validates an image URL sourced from an API response.
 *
 * Accepts:  same-origin relative paths
 *           https:// URLs from TRUSTED_IMG_ORIGINS only
 * Rejects:  everything else (http://, data:, blob:, external https://, //...)
 *
 * Returns the URL when safe, null otherwise — callers must not render
 * the <img> element when null is returned.
 */
export function safeImageUrl(raw) {
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return null
    if (TRUSTED_IMG_ORIGINS.has(url.origin)) return raw
    return null
  } catch {
    return null
  }
}
