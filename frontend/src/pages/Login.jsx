import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Campo, Errore, bottone, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [inCorso, setInCorso] = useState(false)

  // Dopo il login si torna alla pagina richiesta, ma solo se è un percorso interno dell'app
  const da = location.state?.da
  const destinazione = typeof da === 'string' && da.startsWith('/') && !da.startsWith('//') ? da : '/'

  async function invia(e) {
    e.preventDefault()
    setInCorso(true)
    setErrore('')
    try {
      await login(email, password)
      navigate(destinazione, { replace: true })
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInCorso(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-bold">Accedi</h1>
      <form onSubmit={invia} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Campo etichetta="Email">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Campo>
        <Campo etichetta="Password">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Campo>
        <Errore>{errore}</Errore>
        <button type="submit" disabled={inCorso} className={`${bottone.primario} w-full`}>
          Accedi
        </button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Non hai un account?{' '}
        <Link to="/registrazione" className="font-medium text-blue-700 hover:underline">
          Registrati
        </Link>
      </p>
    </section>
  )
}
