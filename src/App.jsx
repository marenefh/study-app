import { useState, useCallback } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { SUBJECTS } from './data/subjects'
import Home from './pages/Home'
import SubjectDetail from './pages/SubjectDetail'

export default function App() {
  const [customSubjects, setCustomSubjects] = useLocalStorage('studyCustomSubjects', [])
  const [deletedSubjectIds, setDeletedSubjectIds] = useLocalStorage('deletedSubjectIds', [])
  const [nameOverrides, setNameOverrides] = useLocalStorage('studyNameOverrides', {})
  const subjects = [...SUBJECTS, ...customSubjects]
    .filter(s => !deletedSubjectIds.includes(s.id))
    .map(s => nameOverrides[s.id] ? { ...s, name: nameOverrides[s.id] } : s)

  const [sessions, setSessions] = useLocalStorage('studySessionsV2', {})
  const [currentSubject, setCurrentSubject] = useState(null)

  const navigateTo = useCallback((subjectId) => {
    setCurrentSubject(subjectId)
    window.scrollTo(0, 0)
  }, [])

  const goHome = useCallback(() => {
    setCurrentSubject(null)
    window.scrollTo(0, 0)
  }, [])

  const addSubject = useCallback((subject) => {
    setCustomSubjects(prev => [...prev, subject])
  }, [setCustomSubjects])

  const renameSubject = useCallback((subjectId, newName) => {
    setNameOverrides(prev => ({ ...prev, [subjectId]: newName }))
  }, [setNameOverrides])

  const deleteSubject = useCallback((subjectId) => {
    setDeletedSubjectIds(prev => [...prev, subjectId])
    setSessions(prev => {
      const next = { ...prev }
      delete next[subjectId]
      return next
    })
  }, [setDeletedSubjectIds, setSessions])

  const addSession = useCallback((subjectId, session) => {
    setSessions(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), session],
    }))
  }, [setSessions])

  const editSession = useCallback((subjectId, sessionId, updatedData) => {
    setSessions(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(s =>
        s.id === sessionId ? { ...updatedData, id: sessionId } : s
      ),
    }))
  }, [setSessions])

  const deleteSession = useCallback((subjectId, sessionId) => {
    setSessions(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(s => s.id !== sessionId),
    }))
  }, [setSessions])

  const currentSubjectData = subjects.find(s => s.id === currentSubject)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 24px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={goHome}
            style={{
              background: 'none',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)',
              letterSpacing: '-0.01em',
              cursor: currentSubject ? 'pointer' : 'default',
            }}
          >
            Study Tracker
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
            Summer 2026
          </span>
        </div>
      </header>

      <main>
        {currentSubject && currentSubjectData ? (
          <SubjectDetail
            key={currentSubject}
            subject={currentSubjectData}
            sessions={sessions[currentSubject] || []}
            onAdd={(session) => addSession(currentSubject, session)}
            onEdit={(sessionId, data) => editSession(currentSubject, sessionId, data)}
            onDelete={(sessionId) => deleteSession(currentSubject, sessionId)}
            onBack={goHome}
          />
        ) : (
          <Home
            subjects={subjects}
            sessions={sessions}
            onNavigate={navigateTo}
            onAddSubject={addSubject}
            onDeleteSubject={deleteSubject}
            onRenameSubject={renameSubject}
          />
        )}
      </main>
    </div>
  )
}
