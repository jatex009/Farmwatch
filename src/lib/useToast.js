import { useState, useCallback } from 'react'

let id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const key = ++id
    setToasts(prev => [...prev, { key, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.key !== key)), duration)
  }, [])

  return { toasts, toast }
}
