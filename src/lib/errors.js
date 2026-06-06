const STATUS_MESSAGES = {
  400: 'Invalid request — please check your input',
  401: 'Authentication failed — verify your API key',
  403: 'Access denied',
  404: 'Resource not found',
  429: 'Rate limit reached — please try again later',
  500: 'Server error — please try again',
  502: 'Service unavailable — please try again',
  503: 'Service unavailable — please try again',
}

export function logError(context, err) {
  console.error(`[FarmWatch] ${context}`, err)
}

export function userMessage(err, fallback = 'Something went wrong — please try again') {
  const status = err?.status
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  if (status >= 500) return 'Server error — please try again'
  return fallback
}
