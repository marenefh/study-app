import { useState, useEffect } from 'react'
import PencilIcon from './PencilIcon'

const today = () => new Date().toISOString().slice(0, 10)

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  color: 'var(--text)',
  background: 'var(--white)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

export default function SessionTable({ sessions, onEdit, onDelete }) {
  const [editingSession, setEditingSession] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    if (!editingSession) return
    const handler = (e) => { if (e.key === 'Escape') setEditingSession(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editingSession])

  function openEdit(s) {
    setEditingSession(s)
    setForm({
      date: s.date,
      score: String(s.score),
      maxScore: String(s.maxScore),
      minutes: String(s.minutes),
      label: s.label || '',
    })
  }

  function setField(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function handleSave(e) {
    e.preventDefault()
    const score = Number(form.score)
    const maxScore = Number(form.maxScore)
    const minutes = Number(form.minutes)
    if (!form.date || isNaN(score) || isNaN(maxScore) || isNaN(minutes)) return
    if (score > maxScore || maxScore <= 0 || minutes <= 0) return
    onEdit(editingSession.id, {
      date: form.date,
      score,
      maxScore,
      minutes,
      label: form.label.trim() || null,
    })
    setEditingSession(null)
  }

  function handleDelete() {
    onDelete(editingSession.id)
    setEditingSession(null)
  }

  if (!sessions.length) return null

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              {[
                { label: 'Done', align: 'left' },
                { label: 'Date', align: 'left' },
                { label: '%', align: 'left' },
                { label: 'Time', align: 'left' },
                { label: '', align: 'right' },
              ].map((col, i) => (
                <th key={i} style={{
                  textAlign: col.align,
                  padding: '8px 12px',
                  fontWeight: '600',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                  borderBottom: '1.5px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const pct = Math.round((s.score / s.maxScore) * 100)
              const pctColor = pct >= 70 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'
              return (
                <tr key={s.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                  <td style={{ ...cell, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: s.label ? 'var(--text)' : 'var(--text-muted)' }}>
                    {s.label || '—'}
                  </td>
                  <td style={{ ...cell, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatDate(s.date)}
                  </td>
                  <td style={cell}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: pctColor + '18',
                      color: pctColor,
                    }}>
                      {pct}%
                    </span>
                  </td>
                  <td style={{ ...cell, color: 'var(--text-secondary)' }}>
                    {formatMinutes(s.minutes)}
                  </td>
                  <td style={{ ...cell, textAlign: 'right' }}>
                    <button
                      onClick={() => openEdit(s)}
                      title="Edit session"
                      style={{
                        background: 'none',
                        color: 'var(--text-muted)',
                        lineHeight: 1,
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'color 0.1s, background 0.1s',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.color = 'var(--accent)'
                        e.currentTarget.style.background = 'var(--accent-light)'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                        e.currentTarget.style.background = 'none'
                      }}
                    >
                      <PencilIcon size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editingSession && (
        <div
          onClick={() => setEditingSession(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,20,40,0.38)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius)',
              padding: '28px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', margin: 0 }}>
                Edit session
              </h3>
              <button
                onClick={() => setEditingSession(null)}
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    max={today()}
                    onChange={e => setField('date', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Time spent (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.minutes}
                    onChange={e => setField('minutes', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Score</label>
                  <input
                    type="number"
                    min="0"
                    value={form.score}
                    onChange={e => setField('score', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max score</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxScore}
                    onChange={e => setField('maxScore', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Material</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setField('label', e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Footer: Delete (left) | Save (right) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '9px 18px',
                    background: '#FFADAD',
                    color: '#7f1d1d',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#ff9090')}
                  onMouseOut={e => (e.currentTarget.style.background = '#FFADAD')}
                >
                  Delete session
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    background: '#C4DFE5',
                    color: '#1e3a40',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#a8cfd8')}
                  onMouseOut={e => (e.currentTarget.style.background = '#C4DFE5')}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const cell = {
  padding: '10px 12px',
  verticalAlign: 'middle',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

function formatMinutes(min) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
