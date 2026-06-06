import React, { useState, useRef, useEffect } from 'react'
import { Upload, TreePine, AlertTriangle, Scan } from 'lucide-react'
import { analyzeTreeImage, getTreesQuota, KENYAN_COUNTIES } from '../lib/api'
import { logError, userMessage } from '../lib/errors'
import { safeImageUrl } from '../lib/redirect'

export default function TreeAnalyzer({ toast }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [meta, setMeta]         = useState({ county: 'Bomet', landAcres: '', notes: '' })
  const [quota, setQuota]       = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    getTreesQuota().then(setQuota).catch(() => {})
  }, [])

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast('Please upload a JPEG, PNG, or WEBP image', 'error'); return
    }
    if (f.size > 20 * 1024 * 1024) {
      toast('Image must be under 20 MB', 'error'); return
    }
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const analyze = async () => {
    if (!file) return
    if (quota && !quota.unlimited && quota.remaining <= 0) {
      toast('Monthly analysis quota reached. Resets next billing period.', 'error')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('county', meta.county)
      if (meta.landAcres) fd.append('landAcres', meta.landAcres)
      if (meta.notes)     fd.append('notes', meta.notes)
      const data = await analyzeTreeImage(fd)
      setResult(data)
      toast('Analysis complete', 'success')
      getTreesQuota().then(setQuota).catch(() => {})
    } catch (err) {
      logError('analyzeTreeImage', err)
      toast(userMessage(err, 'Analysis failed'), 'error')
    } finally { setLoading(false) }
  }

  const set = k => e => setMeta(m => ({ ...m, [k]: e.target.value }))

  const quotaColor = !quota            ? 'var(--text-dim)'
    : quota.unlimited                  ? 'var(--leaf-lt)'
    : quota.remaining <= 1             ? '#e74c3c'
    : quota.remaining <= 2             ? 'var(--sun)'
    : 'var(--leaf-lt)'

  return (
    <div className="card fade-up fade-up-4" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TreePine size={18} color="var(--leaf-lt)" />
            Tree & Canopy Analyzer
          </div>
          {quota && (
            <div style={{ fontSize: 12, color: quotaColor, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: quotaColor, display: 'inline-block' }} />
              {quota.unlimited
                ? 'Unlimited analyses'
                : `${quota.remaining} of ${quota.limit} analyses remaining`}
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          Upload a drone or aerial farm image. AI counts trees, assesses canopy health, and gives agronomic recommendations.
        </div>
      </div>

      {quota && !quota.unlimited && quota.remaining <= 1 && (
        <div style={{
          background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 14,
          fontSize: 12, color: '#e74c3c', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={14} />
          {quota.remaining === 0
            ? `Monthly quota exhausted. Resets ${quota.resetDate ? new Date(quota.resetDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'next billing period'}.`
            : 'Last analysis remaining this month.'}
        </div>
      )}

      <div
        style={{
          border: `2px dashed ${dragging ? 'var(--ochre)' : 'var(--card-border)'}`,
          borderRadius: 10, padding: 24, textAlign: 'center', marginBottom: 16,
          background: dragging ? 'rgba(196,122,43,0.08)' : 'transparent',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        {preview ? (
          <img src={preview} alt="Farm image preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <>
            <Upload size={32} color="var(--text-dim)" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>Drop a farm image here or click to browse</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>JPEG · PNG · WEBP · max 20 MB</div>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div className="grid-2" style={{ gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>County</label>
          <select className="input" value={meta.county} onChange={set('county')}>
            {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>Land (acres)</label>
          <input className="input" type="number" min="0" step="0.1" placeholder="e.g. 2.5" value={meta.landAcres} onChange={set('landAcres')} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>Notes for AI (optional)</label>
        <input className="input" placeholder="e.g. Tea plantation, recently pruned" value={meta.notes} onChange={set('notes')} />
      </div>

      <button
        className="btn btn-primary"
        onClick={analyze}
        disabled={!file || loading || (quota && !quota.unlimited && quota.remaining <= 0)}
        style={{ width: '100%', justifyContent: 'center', gap: 8 }}
      >
        {loading
          ? <><span className="spinner" /> Analyzing…</>
          : <><Scan size={15} /> Analyze Image</>}
      </button>

      {result && (
        <div style={{ marginTop: 20, animation: 'fadeUp 0.4s ease both' }}>
          <div className="divider" />
          <div style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            Analysis Results
          </div>

          <div className="grid-3" style={{ gap: 10, marginBottom: 16 }}>
            <ResultStat label="Total Trees"  value={result.total_tree_count} />
            <ResultStat label="Healthy"      value={result.tree_health?.healthy} highlight="green" />
            <ResultStat label="Needs Care"   value={result.tree_health?.needs_care} highlight="yellow" />
            {result.tree_density_per_acre != null && <ResultStat label="Density / acre" value={result.tree_density_per_acre} />}
            {result.canopy_coverage_pct   != null && <ResultStat label="Canopy Cover"   value={`${result.canopy_coverage_pct}%`} />}
            {result.confidence_score      != null && <ResultStat label="Confidence"     value={`${Math.round(result.confidence_score * 100)}%`} />}
          </div>

          {result.tree_species_guess && (
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
              <span style={{ color: 'var(--ochre)' }}>Species guess:</span> {result.tree_species_guess}
            </div>
          )}

          {result.observations?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--ochre)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                Observations
              </div>
              {result.observations.map((o, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>• {o}</div>
              ))}
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--leaf-lt)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                Recommendations
              </div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>→ {r}</div>
              ))}
            </div>
          )}

          {safeImageUrl(result.overlay_image_url) && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Annotated Overlay</div>
              <img
                src={safeImageUrl(result.overlay_image_url)}
                alt="Tree detection overlay"
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 220 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResultStat({ label, value, highlight }) {
  const color = highlight === 'green' ? 'var(--leaf-lt)' : highlight === 'yellow' ? 'var(--sun)' : 'var(--cream)'
  return (
    <div style={{ background: 'rgba(196,122,43,0.08)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
