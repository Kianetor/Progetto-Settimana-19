import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AutoCard from '../components/AutoCard'
import { Caricamento, Errore, bottone, inputClass } from '../components/ui'
import { api } from '../lib/api'
import { ALIMENTAZIONI } from '../lib/format'

// Le chiavi coincidono con i valori ammessi dal backend per il parametro sort
const ORDINAMENTI = {
  'recenti,desc': 'Più recenti',
  'prezzo,asc': 'Prezzo crescente',
  'prezzo,desc': 'Prezzo decrescente',
  'anno,desc': 'Anno più recente',
  'chilometri,asc': 'Meno chilometri',
}

const FILTRI = ['q', 'alimentazione', 'prezzoMax', 'kmMax', 'sort']

export default function Catalogo() {
  // I filtri stanno nell'indirizzo: la ricerca si può ricaricare o condividere
  const [params, setParams] = useSearchParams()
  const [modulo, setModulo] = useState(() => Object.fromEntries(FILTRI.map((f) => [f, params.get(f) ?? ''])))
  const [risultato, setRisultato] = useState(null)
  const [errore, setErrore] = useState('')

  const pagina = Number(params.get('page') ?? 0)
  const chiave = params.toString()

  useEffect(() => {
    let annullata = false
    const filtri = Object.fromEntries(new URLSearchParams(chiave))
    api
      .catalogo({ ...filtri, size: 12 })
      .then((r) => !annullata && (setRisultato(r), setErrore('')))
      .catch((e) => !annullata && setErrore(e.message))
    return () => {
      annullata = true
    }
  }, [chiave])

  function cerca(e) {
    e.preventDefault()
    const nuovi = {}
    FILTRI.forEach((f) => modulo[f] && (nuovi[f] = modulo[f]))
    setParams(nuovi)
  }

  function vaiAPagina(n) {
    const nuovi = new URLSearchParams(params)
    nuovi.set('page', n)
    setParams(nuovi)
  }

  const aggiorna = (campo) => (e) => setModulo((m) => ({ ...m, [campo]: e.target.value }))

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Le nostre auto</h1>
        <p className="text-sm text-slate-600">Cerca, confronta e salva le auto che ti interessano.</p>
      </div>

      <form onSubmit={cerca} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          className={`${inputClass} lg:col-span-2`}
          placeholder="Marca, modello o parola chiave"
          value={modulo.q}
          onChange={aggiorna('q')}
          maxLength={100}
        />
        <select className={inputClass} value={modulo.alimentazione} onChange={aggiorna('alimentazione')}>
          <option value="">Alimentazione</option>
          {Object.entries(ALIMENTAZIONI).map(([valore, nome]) => (
            <option key={valore} value={valore}>
              {nome}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          type="number"
          min="0"
          step="any"
          placeholder="Prezzo max €"
          value={modulo.prezzoMax}
          onChange={aggiorna('prezzoMax')}
        />
        <input
          className={inputClass}
          type="number"
          min="0"
          step="any"
          placeholder="Km max"
          value={modulo.kmMax}
          onChange={aggiorna('kmMax')}
        />
        <select className={inputClass} value={modulo.sort} onChange={aggiorna('sort')}>
          <option value="">Ordina per…</option>
          {Object.entries(ORDINAMENTI).map(([valore, nome]) => (
            <option key={valore} value={valore}>
              {nome}
            </option>
          ))}
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button type="submit" className={bottone.primario}>
            Cerca
          </button>
          <button
            type="button"
            className={bottone.secondario}
            onClick={() => {
              setModulo(Object.fromEntries(FILTRI.map((f) => [f, ''])))
              setParams({})
            }}
          >
            Azzera filtri
          </button>
        </div>
      </form>

      <Errore>{errore}</Errore>

      {!risultato && !errore && <Caricamento />}
      {risultato && (
        <>
          <p className="text-sm text-slate-600">
            {risultato.totalElements === 1 ? '1 auto trovata' : `${risultato.totalElements} auto trovate`}
          </p>
          {risultato.content.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Nessuna auto corrisponde alla ricerca.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {risultato.content.map((auto) => (
                <AutoCard key={auto.id} auto={auto} />
              ))}
            </div>
          )}
          {risultato.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button className={bottone.secondario} disabled={pagina === 0} onClick={() => vaiAPagina(pagina - 1)}>
                ← Precedente
              </button>
              <span className="text-sm text-slate-600">
                Pagina {pagina + 1} di {risultato.totalPages}
              </span>
              <button
                className={bottone.secondario}
                disabled={pagina + 1 >= risultato.totalPages}
                onClick={() => vaiAPagina(pagina + 1)}
              >
                Successiva →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
