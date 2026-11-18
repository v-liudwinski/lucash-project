export default function Compass() {
  return (
    <svg className="compass" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.8">
        <circle cx="50" cy="50" r="44" />
        <circle cx="50" cy="50" r="38" strokeDasharray="1 2.5" />
      </g>
      <g fill="currentColor">
        <path d="M50 8 L55 50 L50 46 L45 50 Z" />
        <path d="M50 92 L45 50 L50 54 L55 50 Z" opacity="0.45" />
        <path d="M92 50 L50 55 L54 50 L50 45 Z" opacity="0.45" />
        <path d="M8 50 L50 45 L46 50 L50 55 Z" opacity="0.45" />
        <path d="M70 30 L52 50 L50 48 Z M30 70 L48 50 L50 52 Z M70 70 L50 52 L52 50 Z M30 30 L50 48 L48 50 Z" opacity="0.3" />
      </g>
      <text x="50" y="6" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="Cormorant Garamond, serif" fontWeight="700">
        Пн
      </text>
    </svg>
  )
}
