import { useMemo, useState } from 'react'
import SessionForm from '../components/SessionForm'
import SessionTable from '../components/SessionTable'
import ScoreChart from '../components/ScoreChart'

const NUDGE_MESSAGES = [
  "It's been a little while — even a 30-minute session today can make a real difference.",
  "Ready to pick it up again? Consistent practice beats last-minute cramming every time.",
  "A short session today keeps the rust away. You've got this.",
  "No pressure, but your future self will thank you for a review session today.",
]

export default function SubjectDetail({ subject, sessions, onAdd, onEdit, onDelete, onBack }) {
  const [aidsOpen, setAidsOpen] = useState(false)

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)
    const avgPct = sessions.length
      ? sessions.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / sessions.length
      : null
    const lastSession = sessions.length
      ? sessions.reduce((a, b) => (a.date > b.date ? a : b))
      : null
    const daysSinceLast = lastSession
      ? Math.floor((new Date() - new Date(lastSession.date + 'T00:00:00')) / (1000 * 60 * 60 * 24))
      : null
    return { totalHours: totalMinutes / 60, avgPct, daysSinceLast }
  }, [sessions])

  const countdown = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(subject.examDate + 'T00:00:00')
    return Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
  }, [subject.examDate])

  const showNudge = stats.daysSinceLast === null || stats.daysSinceLast >= 5
  const nudge = NUDGE_MESSAGES[subject.id.length % NUDGE_MESSAGES.length]

  const urgencyColor =
    countdown < 0   ? '#94a3b8' :
    countdown <= 7  ? '#f97316' :
    countdown <= 14 ? '#eab308' :
    '#22c55e'

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '24px',
          padding: '4px 0',
          transition: 'color 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        ← All subjects
      </button>

      {/* Subject header */}
      <div style={{ marginBottom: '24px' }}>
        {/* Row 1: name + Exam Info button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.01em', margin: 0, minWidth: 0 }}>
            {subject.name}
          </h1>

          {/* Exam Info toggle */}
          {subject.aids && (
            <button
              onClick={() => setAidsOpen(o => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 13px',
                background: aidsOpen ? 'var(--accent-light)' : 'var(--white)',
                border: `1.5px solid ${aidsOpen ? 'rgba(91,115,245,0.25)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: '600',
                color: aidsOpen ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Exam Info
              <span style={{ fontSize: '10px' }}>{aidsOpen ? '▲' : '▼'}</span>
            </button>
          )}
        </div>

        {/* Row 2: date/time + countdown, full width */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {formatExamDate(subject.examDate)}
            {subject.examTime && <span> · {subject.examTime}</span>}
          </p>
          <span style={{ fontSize: '14px', fontWeight: '700', color: urgencyColor, whiteSpace: 'nowrap', paddingRight: '10px' }}>
            {countdown > 0 ? `${countdown} days left` : countdown === 0 ? 'Today!' : 'Done'}
          </span>
        </div>

        {/* Exam Info content */}
        {aidsOpen && subject.aids && (
          <div style={{
            marginTop: '12px',
            padding: '14px 16px',
            background: 'var(--accent-light)',
            border: '1.5px solid rgba(91,115,245,0.18)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: '1.65',
          }}>
            {subject.aids}
          </div>
        )}

      </div>

      {/* Motivational nudge */}
      {showNudge && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #bbf7d0',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <span style={{ fontSize: '15px', flexShrink: 0 }}>
            {sessions.length === 0 ? '🌱' : '💡'}
          </span>
          <p style={{ fontSize: '13.5px', color: '#166534', lineHeight: 1.55, margin: 0 }}>
            {sessions.length === 0
              ? "No sessions logged yet — when you're ready, even 30 minutes makes a difference."
              : nudge}
          </p>
        </div>
      )}

      {/* Stats row */}
      {sessions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
          <StatCard label="Total hours" value={`${stats.totalHours.toFixed(1)}h`} />
          <StatCard label="Avg score" value={stats.avgPct !== null ? `${Math.round(stats.avgPct)}%` : '—'} />
          <StatCard label="Sessions" value={sessions.length} />
        </div>
      )}

      {/* Score trend */}
      {sessions.length > 0 && (
        <Section title="Score trend">
          <ScoreChart sessions={sessions} />
        </Section>
      )}

      {/* Log session form */}
      <Section title="Log a session">
        <SessionForm onAdd={onAdd} />
      </Section>

      {/* Sessions table */}
      {sessions.length > 0 && (
        <Section title={`All sessions (${sessions.length})`}>
          <SessionTable sessions={sessions} onEdit={onEdit} onDelete={onDelete} />
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '22px 24px',
      marginBottom: '14px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--text-muted)',
        marginBottom: '16px',
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.01em' }}>
        {value}
      </div>
    </div>
  )
}

function formatExamDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}
