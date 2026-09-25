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

  function azzera() {
    setModulo(Object.fromEntries(FILTRI.map((f) => [f, ''])))
    setParams({})
  }

  const aggiorna = (campo) => (e) => setModulo((m) => ({ ...m, [campo]: e.target.value }))
  const filtriAttivi = FILTRI.some((f) => params.get(f))

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-ink-600/70 bg-ink-800/60 px-6 py-12 sm:px-10 sm:py-16">
        <div className="griglia absolute inset-0" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-400 uppercase">Auto usate selezionate</p>
          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
            La tua prossima auto,
            <br />
            <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              al prezzo giusto.
            </span>
          </h1>
          <p className="text-lg text-fog-400">
            Salva le auto che ti piacciono e fissa una soglia: ti scriviamo noi quando il prezzo scende.
          </p>
        </div>

        <form
          onSubmit={cerca}
          className="relative mt-10 grid gap-3 rounded-2xl border border-ink-600 bg-ink-900/80 p-3 backdrop-blur sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_auto]"
        >
          <input
            className={inputClass}
            placeholder="Marca, modello o parola chiave"
            value={modulo.q}
            onChange={aggiorna('q')}
            maxLength={100}
            aria-label="Cerca"
          />
          <select
            className={inputClass}
            value={modulo.alimentazione}
            onChange={aggiorna('alimentazione')}
            aria-label="Alimentazione"
          >
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
            aria-label="Prezzo massimo"
          />
          <input
            className={inputClass}
            type="number"
            min="0"
            step="any"
            placeholder="Km max"
            value={modulo.kmMax}
            onChange={aggiorna('kmMax')}
            aria-label="Chilometri massimi"
          />
          <select className={inputClass} value={modulo.sort} onChange={aggiorna('sort')} aria-label="Ordinamento">
            <option value="">Ordina per…</option>
            {Object.entries(ORDINAMENTI).map(([valore, nome]) => (
              <option key={valore} value={valore}>
                {nome}
              </option>
            ))}
          </select>
          <button type="submit" className={bottone.primario}>
            Cerca
          </button>
        </form>
      </section>

      <Errore>{errore}</Errore>

      {!risultato && !errore && <Caricamento />}
      {risultato && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">
              {risultato.totalElements === 1 ? '1 auto disponibile' : `${risultato.totalElements} auto disponibili`}
            </h2>
            {filtriAttivi && (
              <button type="button" className={bottone.fantasma} onClick={azzera}>
                ✕ Azzera filtri
              </button>
            )}
          </div>

          {risultato.content.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-600 p-12 text-center">
              <p className="font-display text-xl font-bold">Nessuna auto trovata</p>
              <p className="mt-1 text-fog-400">Prova ad allargare la ricerca.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {risultato.content.map((auto) => (
                <AutoCard key={auto.id} auto={auto} />
              ))}
            </div>
          )}

          {risultato.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button className={bottone.secondario} disabled={pagina === 0} onClick={() => vaiAPagina(pagina - 1)}>
                ← Precedente
              </button>
              <span className="text-sm text-fog-400">
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
        </section>
      )}
    </div>
  )
}
