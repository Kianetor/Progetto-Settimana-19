import { Link } from 'react-router-dom'
import { ALIMENTAZIONI, euro, km } from '../lib/format'
import ImmagineAuto from './ImmagineAuto'

export default function AutoCard({ auto, children }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Link to={`/auto/${auto.id}`}>
        <ImmagineAuto auto={auto} className="h-44 w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/auto/${auto.id}`} className="hover:underline">
          <h3 className="font-semibold">
            {auto.marca} {auto.modello}
          </h3>
        </Link>
        <p className="text-sm text-slate-600">
          {auto.anno} · {km(auto.chilometri)} · {ALIMENTAZIONI[auto.alimentazione] ?? auto.alimentazione}
        </p>
        <p className="mt-auto text-lg font-bold text-blue-800">{euro(auto.prezzo)}</p>
        {children}
      </div>
    </article>
  )
}
