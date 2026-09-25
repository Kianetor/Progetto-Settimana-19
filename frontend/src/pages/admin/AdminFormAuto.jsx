import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ImmagineAuto from '../../components/ImmagineAuto'
import { Campo, Caricamento, Errore, Pannello, Titolo, bottone, inputClass } from '../../components/ui'
import { api } from '../../lib/api'
import { ALIMENTAZIONI, euro } from '../../lib/format'

const VUOTA = {
  marca: '',
  modello: '',
  anno: String(new Date().getFullYear()),
  chilometri: '',
  alimentazione: 'BENZINA',
  descrizione: '',
  immagineUrl: '',
  prezzo: '',
  prezzoAcquisto: '',
  pubblicata: false,
}

// Dall'auto ricevuta ai valori del modulo (i campi nulli diventano stringhe vuote)
const daAuto = (a) => ({
  marca: a.marca,
  modello: a.modello,
  anno: String(a.anno),
  chilometri: String(a.chilometri),
  alimentazione: a.alimentazione,
  descrizione: a.descrizione ?? '',
  immagineUrl: a.immagineUrl ?? '',
  prezzo: String(a.prezzo),
  prezzoAcquisto: String(a.prezzoAcquisto),
  pubblicata: a.pubblicata,
})

export default function AdminFormAuto() {
  const { id } = useParams()
  const nuova = !id
  const navigate = useNavigate()
  const [dati, setDati] = useState(nuova ? VUOTA : null)
  const [prezzoIniziale, setPrezzoIniziale] = useState(null)
  const [errore, setErrore] = useState('')
  const [erroriCampi, setErroriCampi] = useState({})
  const [inCorso, setInCorso] = useState(false)

  useEffect(() => {
    if (nuova) return
    let annullata = false
    api
      .adminDettaglio(id)
      .then((a) => {
        if (annullata) return
        setDati(daAuto(a))
        setPrezzoIniziale(Number(a.prezzo))
      })
      .catch((e) => !annullata && setErrore(e.message))
    return () => {
      annullata = true
    }
  }, [id, nuova])

  const aggiorna = (campo) => (e) => {
    const valore = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setDati((d) => ({ ...d, [campo]: valore }))
  }

  async function salva(e) {
    e.preventDefault()
    setInCorso(true)
    setErrore('')
    setErroriCampi({})
    // Solo i campi previsti dal DTO, con i tipi giusti
    const corpo = {
      marca: dati.marca,
      modello: dati.modello,
      anno: Number(dati.anno),
      chilometri: Number(dati.chilometri),
      alimentazione: dati.alimentazione,
      descrizione: dati.descrizione.trim() || null,
      immagineUrl: dati.immagineUrl.trim() || null,
      prezzo: Number(dati.prezzo),
      prezzoAcquisto: Number(dati.prezzoAcquisto),
      pubblicata: dati.pubblicata,
    }
    try {
      if (nuova) await api.adminCrea(corpo)
      else await api.adminModifica(id, corpo)
      navigate('/admin')
    } catch (err) {
      setErrore(err.message)
      setErroriCampi(err.errors ?? {})
    } finally {
      setInCorso(false)
    }
  }

  if (!dati) return errore ? <Errore>{errore}</Errore> : <Caricamento />

  const anteprima = { ...dati, marca: dati.marca || 'Anteprima' }
  const ribasso = !nuova && dati.prezzo !== '' && Number(dati.prezzo) < prezzoIniziale

  return (
    <div className="space-y-8">
      <Link to="/admin" className="text-sm text-fog-400 transition hover:text-accent-300">
        ← Gestione auto
      </Link>
      <Titolo sopra="Area amministratore">{nuova ? 'Nuova auto' : `${dati.marca} ${dati.modello}`}</Titolo>

      <form onSubmit={salva} className="grid gap-6 lg:grid-cols-3">
        <Pannello className="grid gap-4 p-6 sm:grid-cols-2 lg:col-span-2">
          <Campo etichetta="Marca" errore={erroriCampi.marca}>
            <input className={inputClass} required maxLength={60} value={dati.marca} onChange={aggiorna('marca')} />
          </Campo>
          <Campo etichetta="Modello" errore={erroriCampi.modello}>
            <input className={inputClass} required maxLength={80} value={dati.modello} onChange={aggiorna('modello')} />
          </Campo>
          <Campo etichetta="Anno" errore={erroriCampi.anno}>
            <input
              className={inputClass}
              type="number"
              required
              min="1900"
              max="2100"
              value={dati.anno}
              onChange={aggiorna('anno')}
            />
          </Campo>
          <Campo etichetta="Chilometri" errore={erroriCampi.chilometri}>
            <input
              className={inputClass}
              type="number"
              required
              min="0"
              value={dati.chilometri}
              onChange={aggiorna('chilometri')}
            />
          </Campo>
          <Campo etichetta="Alimentazione" errore={erroriCampi.alimentazione}>
            <select className={inputClass} value={dati.alimentazione} onChange={aggiorna('alimentazione')}>
              {Object.entries(ALIMENTAZIONI).map(([valore, nome]) => (
                <option key={valore} value={valore}>
                  {nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etichetta="Immagine (URL https)" errore={erroriCampi.immagineUrl}>
            <input
              className={inputClass}
              type="url"
              pattern="https://.*"
              maxLength={500}
              placeholder="https://…"
              value={dati.immagineUrl}
              onChange={aggiorna('immagineUrl')}
            />
          </Campo>
          <Campo etichetta="Prezzo di vendita €" errore={erroriCampi.prezzo}>
            <input
              className={inputClass}
              type="number"
              required
              min="0.01"
              step="0.01"
              value={dati.prezzo}
              onChange={aggiorna('prezzo')}
            />
          </Campo>
          <Campo etichetta="Prezzo d'acquisto € (riservato)" errore={erroriCampi.prezzoAcquisto}>
            <input
              className={inputClass}
              type="number"
              required
              min="0.01"
              step="0.01"
              value={dati.prezzoAcquisto}
              onChange={aggiorna('prezzoAcquisto')}
            />
          </Campo>
          <div className="sm:col-span-2">
            <Campo etichetta="Descrizione" errore={erroriCampi.descrizione}>
              <textarea
                className={`${inputClass} min-h-32`}
                maxLength={5000}
                value={dati.descrizione}
                onChange={aggiorna('descrizione')}
              />
            </Campo>
          </div>
        </Pannello>

        <div className="space-y-4">
          <Pannello className="overflow-hidden">
            <ImmagineAuto key={dati.immagineUrl} auto={anteprima} className="h-44 w-full" />
            <div className="space-y-1 p-4">
              <p className="font-display text-lg font-bold">
                {dati.marca || 'Marca'} {dati.modello || 'Modello'}
              </p>
              <p className="font-display text-2xl font-bold text-accent-400">
                {dati.prezzo ? euro(dati.prezzo) : '—'}
              </p>
            </div>
          </Pannello>

          <Pannello className="space-y-4 p-5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block font-semibold">Pubblicata</span>
                <span className="text-xs text-fog-500">Se spenta, l'auto resta una bozza visibile solo a te.</span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-accent-500"
                checked={dati.pubblicata}
                onChange={aggiorna('pubblicata')}
              />
            </label>
            {ribasso && dati.pubblicata && (
              <p className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-3 py-2 text-xs text-accent-300">
                Stai abbassando il prezzo: dopo il salvataggio partono le mail degli avvisi con soglia raggiunta.
              </p>
            )}
            <Errore>{errore}</Errore>
            <button type="submit" disabled={inCorso} className={`${bottone.primario} w-full`}>
              {nuova ? 'Crea auto' : 'Salva modifiche'}
            </button>
          </Pannello>
        </div>
      </form>
    </div>
  )
}
