import { useState } from 'react'
import { immagineSicura } from '../lib/format'

export default function ImmagineAuto({ auto, className = '' }) {
  const [rotta, setRotta] = useState(false)
  const src = immagineSicura(auto.immagineUrl)

  if (!src || rotta) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950 ${className}`}
      >
        <div className="griglia absolute inset-0" />
        <svg
          viewBox="0 0 64 24"
          className="relative w-24 text-ink-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 17h4m10 0h22m10 0h6v-4l-6-2-8-6H22l-8 6-8 2v4" />
          <circle cx="13" cy="17" r="4" />
          <circle cx="45" cy="17" r="4" />
        </svg>
        <span className="relative font-display text-lg font-bold tracking-widest text-fog-500 uppercase">
          {auto.marca}
        </span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={`${auto.marca} ${auto.modello}`}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setRotta(true)}
      className={`object-cover ${className}`}
    />
  )
}
