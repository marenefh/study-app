import { useMemo } from 'react'

const W = 540
const H = 180
const PAD = { top: 20, right: 24, bottom: 32, left: 46 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

const Y_TICKS = [0, 25, 50, 75, 100]

export default function ScoreChart({ sessions }) {
  const points = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map((s, i) => {
      const pct = Math.min(100, (s.score / s.maxScore) * 100)
      const x =
        sorted.length === 1
          ? PAD.left + plotW / 2
          : PAD.left + (i / (sorted.length - 1)) * plotW
      const y = PAD.top + plotH - (pct / 100) * plotH
      return { x, y, pct, date: s.date, score: s.score, maxScore: s.maxScore }
    })
  }, [sessions])

  const targetPct = useMemo(() => {
    const withTarget = sessions.filter(s => s.targetScore && s.maxScore)
    if (!withTarget.length) return null
    const last = withTarget[withTarget.length - 1]
    return Math.min(100, (last.targetScore / last.maxScore) * 100)
  }, [sessions])

  if (!sessions.length) return null

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPoints = [
    `${points[0].x},${PAD.top + plotH}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${PAD.top + plotH}`,
  ].join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="Score trend chart"
    >
      {/* Grid lines + Y labels */}
      {Y_TICKS.map(pct => {
        const y = PAD.top + plotH - (pct / 100) * plotH
        return (
          <g key={pct}>
            <line
              x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y}
              stroke="#e8ecf0" strokeWidth="1"
            />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {pct}%
            </text>
          </g>
        )
      })}

      {/* Target score dashed line */}
      {targetPct !== null && (() => {
        const ty = PAD.top + plotH - (targetPct / 100) * plotH
        return (
          <>
            <line
              x1={PAD.left} y1={ty} x2={PAD.left + plotW} y2={ty}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,4"
            />
            <text x={PAD.left + plotW + 4} y={ty + 4} fontSize="9" fill="#f59e0b">
              target
            </text>
          </>
        )
      })()}

      {/* Area fill */}
      {points.length > 1 && (
        <polygon points={areaPoints} fill="rgba(212,197,249,0.3)" />
      )}

      {/* Trend line */}
      {points.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="#C9B8F5"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Data point dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#a78be8" strokeWidth="2.2" />
          <title>{formatDate(p.date)}: {p.score}/{p.maxScore} ({Math.round(p.pct)}%)</title>
        </g>
      ))}

      {/* X axis date labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#94a3b8"
        >
          {formatShortDate(p.date)}
        </text>
      ))}
    </svg>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatShortDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  })
}
