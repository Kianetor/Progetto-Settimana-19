// Contenitore comune di login e registrazione
export default function SchedaAccesso({ titolo, sottotitolo, children, piede }) {
  return (
    <section className="relative mx-auto max-w-md">
      <div className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent-500/25 blur-3xl" />
      <div className="relative space-y-6 rounded-3xl border border-ink-600/70 bg-ink-800/80 p-8 shadow-2xl backdrop-blur">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">{titolo}</h1>
          <p className="text-sm text-fog-400">{sottotitolo}</p>
        </div>
        {children}
      </div>
      <p className="relative mt-6 text-center text-sm text-fog-400">{piede}</p>
    </section>
  )
}
