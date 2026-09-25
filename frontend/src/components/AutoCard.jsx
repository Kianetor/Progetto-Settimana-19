import { Link } from 'react-router-dom'
import { ALIMENTAZIONI, euro, km } from '../lib/format'
import ImmagineAuto from './ImmagineAuto'

export function Chip({ children }) {
  return (
    <span className="rounded-full border border-ink-600 bg-ink-900/60 px-2.5 py-0.5 text-xs text-fog-200">
      {children}
    </span>
  )
}

export default function AutoCard({ auto, children }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-800 transition duration-300 hover:-translate-y-1 hover:border-accent-500/50 hover:shadow-2xl hover:shadow-accent-500/10">
      <Link to={`/auto/${auto.id}`} className="relative block overflow-hidden">
        <ImmagineAuto auto={auto} className="h-48 w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-800 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-lg bg-accent-500 px-3 py-1 font-display text-lg font-bold text-ink-950 shadow-lg">
          {euro(auto.prezzo)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link to={`/auto/${auto.id}`}>
          <p className="text-xs font-semibold tracking-[0.18em] text-accent-400 uppercase">{auto.marca}</p>
          <h3 className="font-display text-xl font-bold tracking-tight group-hover:text-accent-300">{auto.modello}</h3>
        </Link>
        <div className="flex flex-wrap gap-1.5">
          <Chip>{auto.anno}</Chip>
          <Chip>{km(auto.chilometri)}</Chip>
          <Chip>{ALIMENTAZIONI[auto.alimentazione] ?? auto.alimentazione}</Chip>
        </div>
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </article>
  )
}
