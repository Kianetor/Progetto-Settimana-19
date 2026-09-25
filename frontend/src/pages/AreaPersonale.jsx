import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AutoCard from '../components/AutoCard'
import ImmagineAuto from '../components/ImmagineAuto'
import { Caricamento, Errore, Pannello, Successo, Titolo, bottone, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { data, euro } from '../lib/format'

export default function AreaPersonale() {
  const { utente } = useAuth()
  const [preferiti, setPreferiti] = useState(null)
  const [avvisi, setAvvisi] = useState(null)
  const [errore, setErrore] = useState('')

  const ricarica = useCallback(() => {
    return Promise.all([api.preferiti(), api.avvisi()])
      .then(([p, a]) => {
        setPreferiti(p)
        setAvvisi(a)
        setErrore('')
      })
      .catch((e) => setErrore(e.message))
  }, [])

  useEffect(() => {
    ricarica()
  }, [ricarica])

  if (errore && !preferiti) return <Errore>{errore}</Errore>
  if (!preferiti || !avvisi) return <Caricamento />

  // Per ogni auto l'eventuale avviso dell'utente (al massimo uno per auto)
  const avvisoPerAuto = Object.fromEntries(avvisi.map((a) => [a.auto.id, a]))
  const inAttesa = avvisi.filter((a) => a.attivo && !a.inviato).length

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Titolo sopra="La mia area" sotto="Le auto che segui e gli avvisi di prezzo attivi.">
          Ciao, {utente.nome}
        </Titolo>
        <div className="flex gap-3">
          <Contatore valore={preferiti.length} etichetta="Preferiti" />
          <Contatore valore={inAttesa} etichetta="Avvisi in attesa" accento />
        </div>
      </div>

      <section className="space-y-4">
        <IntestazioneSezione titolo="Avvisi di prezzo">
          Ricevi una sola mail quando il prezzo scende alla soglia o sotto. Cambiando la soglia l'avviso riparte.
        </IntestazioneSezione>
        <Errore>{errore}</Errore>
        {avvisi.length === 0 ? (
          <Vuoto>Non hai ancora avvisi. Aprine uno dalla pagina di un'auto.</Vuoto>
        ) : (
          <div className="space-y-3">
            {avvisi.map((avviso) => (
              <RigaAvviso key={avviso.id} avviso={avviso} onCambio={ricarica} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <IntestazioneSezione titolo="Preferiti" />
        {preferiti.length === 0 ? (
          <Vuoto>
            Nessun preferito.{' '}
            <Link to="/" className="font-semibold text-accent-400 hover:underline">
              Sfoglia il catalogo
            </Link>
          </Vuoto>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {preferiti.map((p) => (
              <AutoCard key={p.id} auto={p.auto}>
                <CardPreferito preferito={p} avviso={avvisoPerAuto[p.auto.id]} onCambio={ricarica} />
              </AutoCard>
            ))}
          </div>
        )}
      </section>

      <Profilo />
    </div>
  )
}

function Contatore({ valore, etichetta, accento = false }) {
  return (
    <div className="min-w-28 rounded-2xl border border-ink-600/70 bg-ink-800/80 px-5 py-3">
      <p className={`font-display text-3xl font-bold ${accento ? 'text-accent-400' : ''}`}>{valore}</p>
      <p className="text-xs tracking-wide text-fog-500 uppercase">{etichetta}</p>
    </div>
  )
}

function IntestazioneSezione({ titolo, children }) {
  return (
    <div className="space-y-1 border-b border-ink-700 pb-3">
      <h2 className="font-display text-2xl font-bold">{titolo}</h2>
      {children && <p className="text-sm text-fog-400">{children}</p>}
    </div>
  )
}

function Vuoto({ children }) {
  return <p className="rounded-2xl border border-dashed border-ink-600 p-10 text-center text-fog-400">{children}</p>
}

function StatoAvviso({ avviso }) {
  if (!avviso.attivo) return <Badge colore="border-ink-500 bg-ink-700 text-fog-400">Disattivato</Badge>
  if (avviso.inviato) {
    return <Badge colore="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">✓ Mail inviata il {data(avviso.inviatoAt)}</Badge>
  }
  return (
    <Badge colore="border-accent-500/40 bg-accent-500/10 text-accent-300">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" /> In attesa
    </Badge>
  )
}

function Badge({ colore, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colore}`}>
      {children}
    </span>
  )
}

function RigaAvviso({ avviso, onCambio }) {
  const [modifica, setModifica] = useState(false)
  const [soglia, setSoglia] = useState(String(avviso.soglia))
  const [errore, setErrore] = useState('')
  const [inCorso, setInCorso] = useState(false)

  async function esegui(azione) {
    setInCorso(true)
    setErrore('')
    try {
      await azione()
      setModifica(false)
      await onCambio()
    } catch (e) {
      setErrore(e.message)
    } finally {
      setInCorso(false)
    }
  }

  // Quanto manca alla soglia, per la barra di avanzamento
  const prezzo = Number(avviso.auto.prezzo)
  const distanza = Math.max(0, prezzo - Number(avviso.soglia))
  const raggiunta = distanza === 0

  return (
    <Pannello className="flex flex-wrap items-center gap-4 p-4">
      <Link to={`/auto/${avviso.auto.id}`} className="shrink-0 overflow-hidden rounded-xl">
        <ImmagineAuto auto={avviso.auto} className="h-16 w-24" />
      </Link>
      <div className="min-w-48 flex-1 space-y-1">
        <Link to={`/auto/${avviso.auto.id}`} className="font-display text-lg font-bold hover:text-accent-300">
          {avviso.auto.marca} {avviso.auto.modello}
        </Link>
        <p className="text-sm text-fog-400">
          Ora <span className="font-semibold text-fog-50">{euro(prezzo)}</span> · soglia{' '}
          <span className="font-semibold text-accent-300">{euro(avviso.soglia)}</span>
          {!raggiunta && avviso.attivo && !avviso.inviato && <> · mancano {euro(distanza)}</>}
        </p>
        <StatoAvviso avviso={avviso} />
      </div>

      {modifica ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            esegui(() => api.modificaSoglia(avviso.id, Number(soglia)))
          }}
        >
          <input
            className={`${inputClass} w-32`}
            type="number"
            required
            min="1"
            step="0.01"
            value={soglia}
            onChange={(e) => setSoglia(e.target.value)}
            aria-label="Nuova soglia"
          />
          <button type="submit" disabled={inCorso} className={bottone.primario}>
            Salva
          </button>
          <button type="button" className={bottone.fantasma} onClick={() => setModifica(false)}>
            Annulla
          </button>
        </form>
      ) : (
        <div className="flex gap-2">
          <button type="button" className={bottone.secondario} onClick={() => setModifica(true)}>
            Cambia soglia
          </button>
          <button
            type="button"
            disabled={inCorso}
            className={bottone.pericolo}
            onClick={() => esegui(() => api.eliminaAvviso(avviso.id))}
          >
            Elimina
          </button>
        </div>
      )}
      {errore && (
        <div className="w-full">
          <Errore>{errore}</Errore>
        </div>
      )}
    </Pannello>
  )
}

function CardPreferito({ preferito, avviso, onCambio }) {
  const [errore, setErrore] = useState('')

  async function rimuovi() {
    try {
      await api.rimuoviPreferito(preferito.id)
      await onCambio()
    } catch (e) {
      setErrore(e.message)
    }
  }

  return (
    <div className="space-y-3 border-t border-ink-700 pt-3">
      {avviso ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-fog-400">
          Avviso a <span className="font-semibold text-accent-300">{euro(avviso.soglia)}</span>
          <StatoAvviso avviso={avviso} />
        </div>
      ) : (
        <Link to={`/auto/${preferito.auto.id}`} className="text-sm font-medium text-accent-400 hover:underline">
          🔔 Imposta un avviso di prezzo
        </Link>
      )}
      <button type="button" className={`${bottone.pericolo} w-full`} onClick={rimuovi}>
        Rimuovi dai preferiti
      </button>
      <Errore>{errore}</Errore>
    </div>
  )
}

function Profilo() {
  const { utente, setUtente } = useAuth()
  const [nome, setNome] = useState(utente.nome)
  const [messaggio, setMessaggio] = useState('')
  const [errore, setErrore] = useState('')

  async function salva(e) {
    e.preventDefault()
    setMessaggio('')
    setErrore('')
    try {
      // Si manda solo il nome: email e ruolo non si cambiano da qui
      setUtente(await api.aggiornaProfilo({ nome }))
      setMessaggio('Profilo aggiornato.')
    } catch (err) {
      setErrore(err.message)
    }
  }

  return (
    <section className="space-y-4">
      <IntestazioneSezione titolo="Profilo" />
      <Pannello className="p-5">
        <form onSubmit={salva} className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-fog-400 uppercase">Nome</span>
            <input
              className={`${inputClass} w-64`}
              required
              maxLength={60}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
          <div className="text-sm">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-fog-400 uppercase">Email</span>
            <p className="py-2.5 text-fog-200">{utente.email}</p>
          </div>
          <button type="submit" className={`${bottone.secondario} ml-auto`}>
            Salva
          </button>
          <div className="w-full space-y-2 empty:hidden">
            <Successo>{messaggio}</Successo>
            <Errore>{errore}</Errore>
          </div>
        </form>
      </Pannello>
    </section>
  )
}
