import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Caricamento } from './ui'

// Nasconde le pagine riservate a chi non ha i permessi.
// È solo comodità per l'interfaccia: il controllo vero lo fa il backend su ogni richiesta
export default function RichiedeAccesso({ soloAdmin = false, children }) {
  const { utente, caricamento, isAdmin } = useAuth()
  const location = useLocation()

  if (caricamento) return <Caricamento />
  if (!utente) return <Navigate to="/login" replace state={{ da: location.pathname }} />
  if (soloAdmin && !isAdmin) return <Navigate to="/" replace />
  return children
}
