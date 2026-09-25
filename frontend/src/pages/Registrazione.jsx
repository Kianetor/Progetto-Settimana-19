import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SchedaAccesso from '../components/SchedaAccesso'
import { Campo, Errore, bottone, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Registrazione() {
  const { registra } = useAuth()
  const navigate = useNavigate()
  const [dati, setDati] = useState({ nome: '', email: '', password: '' })
  const [errore, setErrore] = useState('')
  const [erroriCampi, setErroriCampi] = useState({})
  const [inCorso, setInCorso] = useState(false)

  const aggiorna = (campo) => (e) => setDati((d) => ({ ...d, [campo]: e.target.value }))

  async function invia(e) {
    e.preventDefault()
    setInCorso(true)
    setErrore('')
    setErroriCampi({})
    try {
      // Si mandano solo nome, email e password: il ruolo lo decide il server
      await registra(dati)
      navigate('/', { replace: true })
    } catch (err) {
      setErrore(err.message)
      setErroriCampi(err.errors ?? {})
    } finally {
      setInCorso(false)
    }
  }

  return (
    <SchedaAccesso
      titolo="Crea il tuo account"
      sottotitolo="Salva le auto e ricevi gli avvisi di prezzo"
      piede={
        <>
          Hai già un account?{' '}
          <Link to="/login" className="font-semibold text-accent-400 hover:underline">
            Accedi
          </Link>
        </>
      }
    >
      <form onSubmit={invia} className="space-y-4">
        <Campo etichetta="Nome" errore={erroriCampi.nome}>
          <input className={inputClass} required maxLength={60} value={dati.nome} onChange={aggiorna('nome')} />
        </Campo>
        <Campo etichetta="Email" errore={erroriCampi.email}>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={dati.email}
            onChange={aggiorna('email')}
          />
        </Campo>
        <Campo etichetta="Password · almeno 8 caratteri" errore={erroriCampi.password}>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={dati.password}
            onChange={aggiorna('password')}
          />
        </Campo>
        <Errore>{errore}</Errore>
        <button type="submit" disabled={inCorso} className={`${bottone.primario} w-full`}>
          Registrati
        </button>
      </form>
    </SchedaAccesso>
  )
}
