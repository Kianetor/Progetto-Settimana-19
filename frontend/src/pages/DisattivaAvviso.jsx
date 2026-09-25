import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SchedaAccesso from '../components/SchedaAccesso'
import { Errore, Successo, bottone } from '../components/ui'
import { api } from '../lib/api'

// Il token arriva dopo "#" nel link della mail: il frammento non viene spedito al server,
// quindi non finisce nei log. Lo leggiamo una volta e poi lo togliamo dalla barra degli indirizzi
const leggiTokenDaIndirizzo = () => new URLSearchParams(window.location.hash.slice(1)).get('token')

export default function DisattivaAvviso() {
  const [token] = useState(leggiTokenDaIndirizzo)
  const [stato, setStato] = useState(token ? 'conferma' : 'senza-token')
  const [inCorso, setInCorso] = useState(false)

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  // Serve un clic: le anteprime automatiche dei link nelle caselle di posta non disattivano nulla
  async function disattiva() {
    setInCorso(true)
    try {
      await api.disattivaAvviso(token)
      setStato('fatto')
    } catch (e) {
      setStato(e.status === 404 ? 'non-valido' : 'errore')
    } finally {
      setInCorso(false)
    }
  }

  return (
    <SchedaAccesso
      titolo="Disattiva avviso"
      sottotitolo="Avviso di prezzo ricevuto via mail"
      piede={
        <Link to="/" className="font-semibold text-accent-400 hover:underline">
          Vai al catalogo
        </Link>
      }
    >
      <div className="space-y-4 text-center">
        {stato === 'conferma' && (
          <>
            <p className="text-fog-200">Non riceverai più mail per questo avviso.</p>
            <button type="button" disabled={inCorso} className={`${bottone.primario} w-full`} onClick={disattiva}>
              Disattiva avviso
            </button>
          </>
        )}
        {stato === 'fatto' && <Successo>Avviso disattivato.</Successo>}
        {stato === 'non-valido' && <Errore>Il link non è valido oppure è già stato usato.</Errore>}
        {stato === 'senza-token' && <Errore>Link incompleto: aprilo di nuovo dalla mail.</Errore>}
        {stato === 'errore' && <Errore>Qualcosa è andato storto, riprova più tardi.</Errore>}
      </div>
    </SchedaAccesso>
  )
}
