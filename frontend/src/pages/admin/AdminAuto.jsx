import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ImmagineAuto from '../../components/ImmagineAuto'
import { Caricamento, Errore, Successo, Titolo, bottone, inputClass } from '../../components/ui'
import { api } from '../../lib/api'
import { data, euro } from '../../lib/format'

const SCHEDE = [
  { valore: '', nome: 'Tutte' },
  { valore: 'true', nome: 'Pubblicate' },
  { valore: 'false', nome: 'Bozze' },
]

// Le chiavi coincidono con i valori ammessi dal backend per l'ordinamento dell'amministratore
const ORDINAMENTI = {
  'recenti,desc': 'Più recenti',
  'aggiornate,desc': 'Modificate di recente',
  'prezzo,asc': 'Prezzo crescente',
  'prezzo,desc': 'Prezzo decrescente',
  'prezzoAcquisto,desc': 'Prezzo acquisto',
  'marca,asc': 'Marca A-Z',
}

export default function AdminAuto() {
  const [params, setParams] = useSearchParams()
  const [cerca, setCerca] = useState(params.get('q') ?? '')
  const [risultato, setRisultato] = useState(null)
  const [conteggi, setConteggi] = useState(null)
  const [errore, setErrore] = useState('')
  const [messaggio, setMessaggio] = useState('')

  const chiave = params.toString()
  const pagina = Number(params.get('page') ?? 0)

  const ricarica = useCallback(() => {
    const filtri = Object.fromEntries(new URLSearchParams(chiave))
    return Promise.all([
      api.adminAuto({ size: 20, ...filtri }),
      api.adminAuto({ pubblicata: true, size: 1 }),
      api.adminAuto({ pubblicata: false, size: 1 }),
    ])
      .then(([elenco, pubblicate, bozze]) => {
        setRisultato(elenco)
        setConteggi({ pubblicate: pubblicate.totalElements, bozze: bozze.totalElements })
        setErrore('')
      })
      .catch((e) => setErrore(e.message))
  }, [chiave])

  useEffect(() => {
    ricarica()
  }, [ricarica])

  function imposta(chiaveParametro, valore) {
    const nuovi = new URLSearchParams(params)
    if (valore === '' || valore === undefined) nuovi.delete(chiaveParametro)
    else nuovi.set(chiaveParametro, valore)
    if (chiaveParametro !== 'page') nuovi.delete('page')
    setParams(nuovi)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Titolo sopra="Area amministratore" sotto="Bozze, prezzi d'acquisto e modifiche del catalogo.">
          Gestione auto
        </Titolo>
        <Link to="/admin/auto/nuova" className={bottone.primario}>
          + Nuova auto
        </Link>
      </div>

      {conteggi && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Statistica etichetta="Totale" valore={conteggi.pubblicate + conteggi.bozze} />
          <Statistica etichetta="Pubblicate" valore={conteggi.pubblicate} accento />
          <Statistica etichetta="Bozze" valore={conteggi.bozze} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-ink-600 bg-ink-800 p-1">
          {SCHEDE.map((s) => {
            const attiva = (params.get('pubblicata') ?? '') === s.valore
            return (
              <button
                key={s.nome}
                type="button"
                onClick={() => imposta('pubblicata', s.valore)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  attiva ? 'bg-accent-500 text-ink-950' : 'text-fog-400 hover:text-fog-50'
                }`}
              >
                {s.nome}
              </button>
            )
          })}
        </div>
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            imposta('q', cerca.trim())
          }}
        >
          <input
            className={`${inputClass} min-w-48`}
            placeholder="Cerca marca o modello"
            value={cerca}
            maxLength={100}
            onChange={(e) => setCerca(e.target.value)}
          />
          <button type="submit" className={bottone.secondario}>
            Cerca
          </button>
        </form>
        <select
          className={`${inputClass} w-auto`}
          value={params.get('sort') ?? ''}
          onChange={(e) => imposta('sort', e.target.value)}
          aria-label="Ordinamento"
        >
          <option value="">Ordina per…</option>
          {Object.entries(ORDINAMENTI).map(([valore, nome]) => (
            <option key={valore} value={valore}>
              {nome}
            </option>
          ))}
        </select>
      </div>

      <Successo>{messaggio}</Successo>
      <Errore>{errore}</Errore>

      {!risultato && !errore && <Caricamento />}
      {risultato &&
        (risultato.content.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink-600 p-10 text-center text-fog-400">
            Nessuna auto trovata.
          </p>
        ) : (
          <div className="space-y-3">
            {risultato.content.map((auto) => (
              <RigaAuto key={auto.id} auto={auto} onPrezzoCambiato={setMessaggio} ricarica={ricarica} />
            ))}
          </div>
        ))}

      {risultato && risultato.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button className={bottone.secondario} disabled={pagina === 0} onClick={() => imposta('page', pagina - 1)}>
            ← Precedente
          </button>
          <span className="text-sm text-fog-400">
            Pagina {pagina + 1} di {risultato.totalPages}
          </span>
          <button
            className={bottone.secondario}
            disabled={pagina + 1 >= risultato.totalPages}
            onClick={() => imposta('page', pagina + 1)}
          >
            Successiva →
          </button>
        </div>
      )}
    </div>
  )
}

function Statistica({ etichetta, valore, accento = false }) {
  return (
    <div className="rounded-2xl border border-ink-600/70 bg-ink-800/80 px-5 py-4">
      <p className={`font-display text-3xl font-bold ${accento ? 'text-accent-400' : ''}`}>{valore}</p>
      <p className="text-xs tracking-wide text-fog-500 uppercase">{etichetta}</p>
    </div>
  )
}

function RigaAuto({ auto, onPrezzoCambiato, ricarica }) {
  const [prezzo, setPrezzo] = useState(String(auto.prezzo))
  const [errore, setErrore] = useState('')
  const [inCorso, setInCorso] = useState(false)

  const margine = Number(auto.prezzo) - Number(auto.prezzoAcquisto)
  const prezzoCambiato = Number(prezzo) !== Number(auto.prezzo)

  async function salvaPrezzo(e) {
    e.preventDefault()
    setInCorso(true)
    setErrore('')
    try {
      const aggiornata = await api.adminPrezzo(auto.id, Number(prezzo))
      const ribasso = Number(aggiornata.prezzo) < Number(auto.prezzo)
      onPrezzoCambiato(
        `${auto.marca} ${auto.modello}: prezzo aggiornato a ${euro(aggiornata.prezzo)}.` +
          (ribasso && auto.pubblicata ? ' Gli avvisi con soglia raggiunta partono in background.' : ''),
      )
      await ricarica()
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-600/70 bg-ink-800/80 p-4">
      <ImmagineAuto auto={auto} className="h-16 w-24 shrink-0 rounded-xl" />

      <div className="min-w-44 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-lg font-bold">
            {auto.marca} {auto.modello}
          </p>
          {auto.pubblicata ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
              Pubblicata
            </span>
          ) : (
            <span className="rounded-full border border-ink-500 bg-ink-700 px-2 py-0.5 text-xs text-fog-400">Bozza</span>
          )}
        </div>
        <p className="text-xs text-fog-500">
          {auto.anno} · aggiornata {data(auto.updatedAt)}
        </p>
      </div>

      <dl className="flex gap-6 text-sm">
        <div>
          <dt className="text-xs text-fog-500 uppercase">Acquisto</dt>
          <dd className="font-medium text-fog-200">{euro(auto.prezzoAcquisto)}</dd>
        </div>
        <div>
          <dt className="text-xs text-fog-500 uppercase">Margine</dt>
          <dd className={`font-medium ${margine >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{euro(margine)}</dd>
        </div>
      </dl>

      <form onSubmit={salvaPrezzo} className="flex items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fog-500">€</span>
          <input
            className={`${inputClass} w-32 pl-7`}
            type="number"
            required
            min="0.01"
            step="0.01"
            value={prezzo}
            onChange={(e) => setPrezzo(e.target.value)}
            aria-label={`Prezzo di ${auto.marca} ${auto.modello}`}
          />
        </div>
        <button type="submit" disabled={!prezzoCambiato || inCorso} className={bottone.primario}>
          Aggiorna
        </button>
      </form>

      <Link to={`/admin/auto/${auto.id}`} className={bottone.secondario}>
        Modifica
      </Link>

      {errore && (
        <div className="w-full">
          <Errore>{errore}</Errore>
        </div>
      )}
    </div>
  )
}
