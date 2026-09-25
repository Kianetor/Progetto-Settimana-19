import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ImmagineAuto from '../components/ImmagineAuto'
import { Caricamento, Errore, Successo, bottone, inputClass } from '../components/ui'
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
          Torna al catalogo
        </Link>
      </div>
    )
  }
  if (!auto) return <Caricamento />

  return (
    <article className="grid gap-8 lg:grid-cols-5">
      <ImmagineAuto auto={auto} className="h-72 w-full rounded-xl lg:col-span-3 lg:h-96" />
      <div className="space-y-4 lg:col-span-2">
        <Link to="/" className="text-sm text-blue-700 hover:underline">
          ← Catalogo
        </Link>
        <h1 className="text-3xl font-bold">
          {auto.marca} {auto.modello}
        </h1>
        <p className="text-3xl font-bold text-blue-800">{euro(auto.prezzo)}</p>
        <dl className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <div>
            <dt className="text-slate-500">Anno</dt>
            <dd className="font-medium">{auto.anno}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Chilometri</dt>
            <dd className="font-medium">{km(auto.chilometri)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Alimentazione</dt>
            <dd className="font-medium">{ALIMENTAZIONI[auto.alimentazione] ?? auto.alimentazione}</dd>
          </div>
        </dl>
        {/* Descrizione stampata come testo: eventuali tag compaiono così come sono, senza essere eseguiti */}
        {auto.descrizione && <p className="whitespace-pre-line text-slate-700">{auto.descrizione}</p>}

        {utente ? (
          <AzioniUtente auto={auto} />
        ) : (
          <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            <Link to="/login" className="font-medium underline">
              Accedi
            </Link>{' '}
            per salvare l'auto tra i preferiti e ricevere una mail quando il prezzo scende.
          </p>
        )}
      </div>
    </article>
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
    } catch (e) {
      setErrore(e.message)
    } finally {
      setInCorso(false)
    }
  }

  function creaAvviso(e) {
    e.preventDefault()
    esegui(
      () => api.creaAvviso(auto.id, Number(soglia)),
      `Avviso creato: ti scriveremo quando il prezzo scende a ${euro(soglia)} o meno.`,
    ).then(() => setSoglia(''))
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        disabled={inCorso}
        className={bottone.secondario}
        onClick={() => esegui(() => api.aggiungiPreferito(auto.id), 'Auto salvata tra i preferiti.')}
      >
        ♥ Salva tra i preferiti
      </button>
      <form onSubmit={creaAvviso} className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Avvisami se il prezzo scende sotto</p>
        <div className="flex gap-2">
          <input
            className={inputClass}
            type="number"
            required
            min="1"
            max={Number(auto.prezzo) - 0.01}
            step="0.01"
            placeholder="Soglia in €"
            value={soglia}
            onChange={(e) => setSoglia(e.target.value)}
          />
          <button type="submit" disabled={inCorso} className={bottone.primario}>
            Crea avviso
          </button>
        </div>
      </form>
      <Successo>{messaggio}</Successo>
      <Errore>{errore}</Errore>
    </div>
  )
}
