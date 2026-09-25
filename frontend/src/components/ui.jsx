// Piccoli componenti di interfaccia riusati nelle pagine.
// Tutti i testi arrivano a React come valori {…}: React li stampa come testo, mai come HTML

export function Errore({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
      {children}
    </p>
  )
}

export function Successo({ children }) {
  if (!children) return null
  return (
    <p
      role="status"
      className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300"
    >
      {children}
    </p>
  )
}

export function Caricamento() {
  return (
    <div className="flex justify-center py-16" aria-label="Caricamento">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-accent-500" />
    </div>
  )
}

export function Campo({ etichetta, errore, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-fog-400 uppercase">{etichetta}</span>
      {children}
      {errore && <span className="mt-1 block text-xs text-red-300">{errore}</span>}
    </label>
  )
}

export function Pannello({ className = '', children }) {
  return <div className={`rounded-2xl border border-ink-600/70 bg-ink-800/80 backdrop-blur ${className}`}>{children}</div>
}

export function Titolo({ sopra, children, sotto }) {
  return (
    <div className="space-y-2">
      {sopra && <p className="text-xs font-semibold tracking-[0.2em] text-accent-400 uppercase">{sopra}</p>}
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{children}</h1>
      {sotto && <p className="max-w-2xl text-fog-400">{sotto}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-ink-600 bg-ink-900/70 px-3.5 py-2.5 text-sm text-fog-50 placeholder:text-fog-500 transition focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/15'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'

export const bottone = {
  primario: `${base} bg-accent-500 px-5 py-2.5 text-ink-950 shadow-lg shadow-accent-500/20 hover:bg-accent-400`,
  secondario: `${base} border border-ink-500 bg-ink-700/60 px-5 py-2.5 text-fog-50 hover:border-fog-500 hover:bg-ink-700`,
  fantasma: `${base} px-3 py-2 text-fog-400 hover:bg-ink-700/60 hover:text-fog-50`,
  pericolo: `${base} border border-red-500/30 px-3.5 py-2 text-red-300 hover:bg-red-500/10`,
}
