import { useMemo } from 'react'

export default function SubjectCard({ subject, sessions, onClick }) {
  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)
    const lastSession = sessions.length
      ? sessions.reduce((a, b) => (a.date > b.date ? a : b))
      : null
    return { totalHours: totalMinutes / 60, lastSession }
  }, [sessions])

  const countdown = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(subject.examDate + 'T00:00:00')
    return Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
  }, [subject.examDate])

  const isPast = countdown < 0

  const urgencyColor =
    isPast       ? '#94a3b8' :
    countdown <= 7  ? '#f97316' :
    countdown <= 14 ? '#eab308' :
    '#22c55e'

  return (
    <button
      onClick={onClick}
      style={{
        background: isPast ? '#f8f9fb' : 'var(--white)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 22px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s, transform 0.18s, border-color 0.18s',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        opacity: isPast ? 0.55 : 1,
      }}
      onMouseOver={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = '#c7d0e8'
      }}
      onMouseOut={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Name + countdown */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.35, margin: 0 }}>
          {subject.name}
        </h2>
        <span style={{
          fontSize: '11.5px',
          fontWeight: '600',
          color: urgencyColor,
          background: urgencyColor + '18',
          padding: '2px 9px',
          borderRadius: '20px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          marginTop: '1px',
        }}>
          {countdown > 0 ? `${countdown} days` : countdown === 0 ? 'Today!' : 'Done'}
        </span>
      </div>

      {/* Date + time */}
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
        {formatShortDate(subject.examDate)}
        {subject.examTime && <span> · {subject.examTime}</span>}
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '18px' }}>
        <Stat
          label="Hours"
          value={stats.totalHours >= 0.1 ? `${stats.totalHours.toFixed(1)}h` : stats.totalHours > 0 ? '<0.1h' : '—'}
        />
        <Stat
          label="Last session"
          value={stats.lastSession ? relativeDate(stats.lastSession.date) : '—'}
          valueColor={stats.lastSession && daysSince(stats.lastSession.date) >= 7 ? '#ef4444' : undefined}
        />
      </div>
    </button>
  )
}

function Stat({ label, value, valueColor }) {
  return (
    <div>
      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: valueColor || 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}

function formatShortDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function daysSince(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today - new Date(dateStr + 'T00:00:00')) / (1000 * 60 * 60 * 24))
}

function relativeDate(dateStr) {
  const diff = daysSince(dateStr)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}
