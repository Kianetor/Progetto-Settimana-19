import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const voce = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-ink-700 text-fog-50' : 'text-fog-400 hover:text-fog-50'
  }`

export default function Navbar() {
  const { utente, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function esci() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink-700/80 bg-ink-900/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
        <Link to="/" className="mr-5 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-500 text-ink-950 shadow-lg shadow-accent-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M4 16h16v-4l-2.5-5h-11L4 12z" strokeLinejoin="round" />
              <circle cx="8" cy="16.5" r="1.8" fill="currentColor" />
              <circle cx="16" cy="16.5" r="1.8" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Salone<span className="text-accent-500">Auto</span>
          </span>
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
              <span className="hidden items-center gap-2 text-sm text-fog-400 sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-700 text-xs font-bold text-accent-300 uppercase">
                  {utente.nome.slice(0, 1)}
                </span>
                {utente.nome}
                {isAdmin && (
                  <span className="rounded-md bg-accent-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-accent-300">
                    ADMIN
                  </span>
                )}
              </span>
              <button type="button" onClick={esci} className={voce({ isActive: false })}>
                Esci
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={voce}>
                Accedi
              </NavLink>
              <Link
                to="/registrazione"
                className="rounded-lg bg-accent-500 px-3.5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-accent-400"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
