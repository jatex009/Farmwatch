import React, { useEffect, useState } from 'react'
import { getUsage } from '../lib/api'
import { logError } from '../lib/errors'

export default function UsageBar() {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    getUsage()
      .then(data => {
        // Handle both flat and nested response shapes
        const used  = data.used  ?? data.requests?.used  ?? data.total_requests ?? 0
        const limit = data.limit ?? data.requests?.limit ?? data.monthly_limit  ?? 0
        setUsage({ used, limit, plan: data.plan ?? 'Free' })
      })
      .catch(err => logError('getUsage', err))
  }, [])

  if (!usage) return null

  const pct    = usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0
  const barColor = pct > 80 ? 'var(--red)' : pct > 55 ? 'var(--amber)' : 'var(--leaf-lt)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 12px', borderRadius: 'var(--r-sm)',
      background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>API</span>
      <div style={{
        width: 72, height: 3, background: 'var(--surface-3)',
        borderRadius: 99, overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
        {pct}%
      </span>
    </div>
  )
}
