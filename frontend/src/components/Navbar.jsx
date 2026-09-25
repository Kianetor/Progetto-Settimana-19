import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const voce = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:text-slate-900'}`

export default function Navbar() {
  const { utente, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function esci() {
    await logout()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-lg font-bold text-blue-800">
          Salone Auto
        </Link>
        <NavLink to="/" end className={voce}>
          Catalogo
        </NavLink>
        {utente && (
          <NavLink to="/area-personale" className={voce}>
            Preferiti e avvisi
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className={voce}>
            Gestione auto
          </NavLink>
        )}
        <div className="ml-auto flex items-center gap-2">
          {utente ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">Ciao, {utente.nome}</span>
              <button type="button" onClick={esci} className={voce({ isActive: false })}>
                Esci
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={voce}>
                Accedi
              </NavLink>
              <NavLink to="/registrazione" className={voce}>
                Registrati
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
