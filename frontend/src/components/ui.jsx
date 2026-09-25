// Piccoli componenti di interfaccia riusati nelle pagine.
// Tutti i testi arrivano a React come valori {…}: React li stampa come testo, mai come HTML

export function Errore({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  )
}

export function Successo({ children }) {
  if (!children) return null
  return (
    <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
      {children}
    </p>
  )
}

export function Caricamento() {
  return <p className="py-10 text-center text-sm text-slate-500">Caricamento…</p>
}

export function Campo({ etichetta, errore, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{etichetta}</span>
      {children}
      {errore && <span className="mt-1 block text-xs text-red-600">{errore}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20'

export const bottone = {
  primario:
    'inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50',
  secondario:
    'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50',
  pericolo:
    'inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50',
}
