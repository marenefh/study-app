import { useMemo, useState } from 'react'
import SubjectCard from '../components/SubjectCard'
import PencilIcon from '../components/PencilIcon'

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

export default function Home({ subjects, sessions, onNavigate, onAddSubject, onDeleteSubject, onRenameSubject }) {
  const [editMode, setEditMode] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [addError, setAddError] = useState('')
  // Local working copies of names while in edit mode
  const [editNames, setEditNames] = useState({})

  const overallStats = useMemo(() => {
    const allSessions = Object.values(sessions).flat()
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.minutes, 0)
    return { totalHours: totalMinutes / 60, totalSessions: allSessions.length }
  }, [sessions])

  function enterEditMode() {
    const initial = {}
    subjects.forEach(s => { initial[s.id] = s.name })
    setEditNames(initial)
    setEditMode(true)
  }

  function exitEditMode() {
    setEditMode(false)
    setShowAddForm(false)
    setNewName('')
    setNewDate('')
    setNewTime('')
    setAddError('')
    setEditNames({})
  }

  function handleNameBlur(subject) {
    const newName = (editNames[subject.id] ?? subject.name).trim()
    if (!newName) {
      setEditNames(prev => ({ ...prev, [subject.id]: subject.name }))
      return
    }
    if (newName !== subject.name) {
      onRenameSubject(subject.id, newName)
    }
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return setAddError('Enter an exam name.')
    if (!newDate) return setAddError('Pick an exam date.')
    const id = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (subjects.some(s => s.id === id)) return setAddError('An exam with a similar name already exists.')
    onAddSubject({
      id,
      name: newName.trim(),
      examDate: newDate,
      examTime: newTime.trim() || null,
      emoji: null,
      hue: String(Math.floor(Math.random() * 320) + 20),
      aids: null,
    })
    setNewName('')
    setNewDate('')
    setNewTime('')
    setAddError('')
    setShowAddForm(false)
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '30px 24px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
            SUMMER EXAMS
          </h1>
          {!editMode && overallStats.totalSessions > 0 && (
            <div style={{
              display: 'inline-flex',
              gap: '24px',
              marginTop: '12px',
              padding: '10px 16px',
              background: 'var(--white)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <MiniStat label="Total hours" value={`${overallStats.totalHours.toFixed(1)}h`} />
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <MiniStat label="Sessions" value={overallStats.totalSessions} />
            </div>
          )}
        </div>

        {/* Edit / Done button */}
        <button
          onClick={() => editMode ? exitEditMode() : enterEditMode()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 16px',
            background: editMode ? 'var(--text)' : 'var(--white)',
            border: `1.5px solid ${editMode ? 'var(--text)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '13.5px',
            fontWeight: '600',
            color: editMode ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {editMode ? 'Done' : (
            <>
              <PencilIcon size={14} />
              Edit Exams
            </>
          )}
        </button>
      </div>

      {/* Normal mode: card grid */}
      {!editMode && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '14px',
        }}>
          {[...subjects]
            .sort((a, b) => {
              const today = new Date(); today.setHours(0, 0, 0, 0)
              const aDate = new Date(a.examDate + 'T00:00:00')
              const bDate = new Date(b.examDate + 'T00:00:00')
              const aPast = aDate < today
              const bPast = bDate < today
              if (aPast !== bPast) return aPast ? 1 : -1
              return aDate - bDate
            })
            .map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                sessions={sessions[subject.id] || []}
                onClick={() => onNavigate(subject.id)}
              />
            ))}
        </div>
      )}

      {/* Edit mode: simple editable list */}
      {editMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {subjects.map(subject => (
            <div
              key={subject.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px 10px 18px',
                background: 'var(--white)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)',
                gap: '12px',
              }}
            >
              {/* Editable name */}
              <input
                type="text"
                value={editNames[subject.id] ?? subject.name}
                onChange={e => setEditNames(prev => ({ ...prev, [subject.id]: e.target.value }))}
                onBlur={() => handleNameBlur(subject)}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                style={{
                  flex: 1,
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1.5px solid transparent',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  outline: 'none',
                  minWidth: 0,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderBottomColor = 'var(--accent)'
                  e.currentTarget.style.background = 'var(--accent-light)'
                }}
              />

              <button
                onClick={() => onDeleteSubject(subject.id)}
                style={{
                  background: 'none',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  border: '1.5px solid #fecaca',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseOut={e => (e.currentTarget.style.background = 'none')}
              >
                Delete
              </button>
            </div>
          ))}

          {/* Add Exam in edit mode */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                marginTop: '8px',
                padding: '12px 20px',
                background: '#CDE9DC',
                color: '#1a4d35',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s',
                alignSelf: 'flex-start',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#b0dbc8')}
              onMouseOut={e => (e.currentTarget.style.background = '#CDE9DC')}
            >
              + Add Exam
            </button>
          ) : (
            <div style={{
              marginTop: '8px',
              background: 'var(--white)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: '18px',
              }}>
                Add exam
              </h3>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Exam name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setAddError('') }}
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Exam date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => { setNewDate(e.target.value); setAddError('') }}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Time <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                {addError && (
                  <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{addError}</p>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 20px',
                      background: '#CDE9DC',
                      color: '#1a4d35',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#b0dbc8')}
                    onMouseOut={e => (e.currentTarget.style.background = '#CDE9DC')}
                  >
                    Add exam
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setAddError(''); setNewName(''); setNewDate(''); setNewTime('') }}
                    style={{
                      padding: '9px 16px',
                      background: 'none',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.3 }}>
        {value}
      </div>
    </div>
  )
}
