// Matches the pencil icon used in Claude Code's UI
export default function PencilIcon({ size = 14, strokeWidth = 1.6 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L4.88 13.37 2 14l.63-2.88L11.5 2.5z" />
      <path d="M9.5 4.5l2 2" />
    </svg>
  )
}
