import React from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={15} />,
  error:   <XCircle size={15} />,
  info:    <Info size={15} />,
}

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.key} className={`toast toast-${t.type}`}>
          {ICONS[t.type] ?? ICONS.info}
          {t.message}
        </div>
      ))}
    </div>
  )
}
