import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

export const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  color: 'var(--text)',
  background: 'var(--white)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

export default function SessionForm({ onAdd }) {
  const [form, setForm] = useState({
    date: today(),
    score: '',
    maxScore: '',
    minutes: '',
    label: '',
  })
  const [error, setError] = useState('')

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const score = Number(form.score)
    const maxScore = Number(form.maxScore)
    const minutes = Number(form.minutes)

    if (!form.date) return setError('Please pick a date.')
    if (!form.score || isNaN(score) || score < 0) return setError('Enter a valid score.')
    if (!form.maxScore || isNaN(maxScore) || maxScore <= 0) return setError('Enter a valid max score.')
    if (score > maxScore) return setError('Score cannot exceed max score.')
    if (!form.minutes || isNaN(minutes) || minutes <= 0) return setError('Enter time spent in minutes.')
    if (!form.label.trim()) return setError('Enter what you studied.')

    onAdd({
      id: crypto.randomUUID(),
      date: form.date,
      score,
      maxScore,
      minutes,
      label: form.label.trim(),
    })

    setForm({ date: today(), score: '', maxScore: '', minutes: '', label: '' })
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={form.date}
            max={today()}
            onChange={e => set('date', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Time spent (min)</label>
          <input
            type="number"
            min="1"
            value={form.minutes}
            onChange={e => set('minutes', e.target.value)}
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
            onChange={e => set('score', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Max score</label>
          <input
            type="number"
            min="1"
            value={form.maxScore}
            onChange={e => set('maxScore', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Material</label>
        <input
          type="text"
          value={form.label}
          onChange={e => set('label', e.target.value)}
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        style={{
          alignSelf: 'flex-end',
          padding: '9px 20px',
          background: '#C4DFE5',
          color: '#1e3a40',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'background 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#a8cfd8')}
        onMouseOut={e => (e.currentTarget.style.background = '#C4DFE5')}
      >
        Log Session
      </button>
    </form>
  )
}
