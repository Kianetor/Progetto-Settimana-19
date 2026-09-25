import { useState } from 'react'
import { immagineSicura } from '../lib/format'

export default function ImmagineAuto({ auto, className = '' }) {
  const [rotta, setRotta] = useState(false)
  const src = immagineSicura(auto.immagineUrl)

  if (!src || rotta) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 ${className}`}>
        <span className="text-2xl font-semibold tracking-wide text-slate-500">{auto.marca}</span>
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
