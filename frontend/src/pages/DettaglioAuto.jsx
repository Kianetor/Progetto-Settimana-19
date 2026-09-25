import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ImmagineAuto from '../components/ImmagineAuto'
import { Caricamento, Errore, Pannello, Successo, bottone, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { ALIMENTAZIONI, euro, km } from '../lib/format'

export default function DettaglioAuto() {
  const { id } = useParams()
  const { utente } = useAuth()
  const [auto, setAuto] = useState(null)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    let annullata = false
    api
      .auto(id)
      .then((a) => !annullata && setAuto(a))
      .catch((e) => !annullata && setErrore(e.status === 404 || e.status === 400 ? 'Auto non trovata.' : e.message))
    return () => {
      annullata = true
    }
  }, [id])

  if (errore) {
    return (
      <div className="space-y-4">
        <Errore>{errore}</Errore>
        <Link to="/" className={bottone.secondario}>
          ← Torna al catalogo
        </Link>
      </div>
    )
  }
  if (!auto) return <Caricamento />

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-fog-400 transition hover:text-accent-300">
        ← Catalogo
      </Link>
      <article className="grid gap-8 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl border border-ink-600/70 lg:col-span-3">
          <ImmagineAuto auto={auto} className="h-72 w-full sm:h-96 lg:h-[30rem]" />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent-400 uppercase">{auto.marca}</p>
            <h1 className="font-display text-4xl font-bold tracking-tight">{auto.modello}</h1>
          </div>

          <p className="font-display text-5xl font-bold text-accent-400">{euro(auto.prezzo)}</p>

          <dl className="grid grid-cols-3 overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-800/80 text-center">
            <Dato nome="Anno" valore={auto.anno} />
            <Dato nome="Chilometri" valore={km(auto.chilometri)} bordo />
            <Dato nome="Motore" valore={ALIMENTAZIONI[auto.alimentazione] ?? auto.alimentazione} bordo />
          </dl>

          {/* Descrizione stampata come testo: eventuali tag compaiono così come sono, senza essere eseguiti */}
          {auto.descrizione && <p className="leading-relaxed whitespace-pre-line text-fog-200">{auto.descrizione}</p>}

          {utente ? (
            <AzioniUtente auto={auto} />
          ) : (
            <Pannello className="p-5">
              <p className="text-fog-200">
                <Link to="/login" className="font-semibold text-accent-400 hover:underline">
                  Accedi
                </Link>{' '}
                per salvare l'auto tra i preferiti e ricevere una mail quando il prezzo scende.
              </p>
            </Pannello>
          )}
        </div>
      </article>
    </div>
  )
}

function Dato({ nome, valore, bordo = false }) {
  return (
    <div className={`px-3 py-4 ${bordo ? 'border-l border-ink-600/70' : ''}`}>
      <dt className="text-xs tracking-wide text-fog-500 uppercase">{nome}</dt>
      <dd className="mt-1 font-display text-lg font-bold">{valore}</dd>
    </div>
  )
}

function AzioniUtente({ auto }) {
  const [soglia, setSoglia] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [errore, setErrore] = useState('')
  const [inCorso, setInCorso] = useState(false)

  async function esegui(azione, testoOk) {
    setInCorso(true)
    setErrore('')
    setMessaggio('')
    try {
      await azione()
      setMessaggio(testoOk)
      return true
    } catch (e) {
      setErrore(e.message)
      return false
    } finally {
      setInCorso(false)
    }
  }

  async function creaAvviso(e) {
    e.preventDefault()
    const ok = await esegui(
      () => api.creaAvviso(auto.id, Number(soglia)),
      `Avviso creato: ti scriviamo quando il prezzo scende a ${euro(soglia)} o meno.`,
    )
    if (ok) setSoglia('')
  }

  return (
    <Pannello className="space-y-5 p-5">
      <button
        type="button"
        disabled={inCorso}
        className={`${bottone.secondario} w-full`}
        onClick={() => esegui(() => api.aggiungiPreferito(auto.id), 'Auto salvata tra i preferiti.')}
      >
        <span className="text-accent-400">♥</span> Salva tra i preferiti
      </button>
      <form onSubmit={creaAvviso} className="space-y-2.5">
        <p className="text-sm font-semibold">🔔 Avvisami quando il prezzo scende sotto</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fog-500">€</span>
            <input
              className={`${inputClass} pl-8`}
              type="number"
              required
              min="1"
              max={Number(auto.prezzo) - 0.01}
              step="0.01"
              placeholder="Soglia"
              value={soglia}
              onChange={(e) => setSoglia(e.target.value)}
            />
          </div>
          <button type="submit" disabled={inCorso} className={bottone.primario}>
            Crea avviso
          </button>
        </div>
        <p className="text-xs text-fog-500">Riceverai una sola mail, appena il prezzo raggiunge la soglia.</p>
      </form>
      <Successo>{messaggio}</Successo>
      <Errore>{errore}</Errore>
    </Pannello>
  )
}
