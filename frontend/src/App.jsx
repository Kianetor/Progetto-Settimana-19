import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RichiedeAccesso from './components/RichiedeAccesso'
import { bottone } from './components/ui'
import AreaPersonale from './pages/AreaPersonale'
import Catalogo from './pages/Catalogo'
import DettaglioAuto from './pages/DettaglioAuto'
import DisattivaAvviso from './pages/DisattivaAvviso'
import Login from './pages/Login'
import Registrazione from './pages/Registrazione'

export default function App() {
  return (
    <div className="sfondo-pagina flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/auto/:id" element={<DettaglioAuto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrazione" element={<Registrazione />} />
          <Route
            path="/area-personale"
            element={
              <RichiedeAccesso>
                <AreaPersonale />
              </RichiedeAccesso>
            }
          />
          <Route path="/disattiva-avviso" element={<DisattivaAvviso />} />
          <Route path="*" element={<NonTrovata />} />
        </Routes>
      </main>
      <footer className="border-t border-ink-700/80 py-6 text-center text-xs text-fog-500">
        SaloneAuto · auto usate selezionate, avvisi di prezzo via mail
      </footer>
    </div>
  )
}

function NonTrovata() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-7xl font-bold text-accent-500">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Strada senza uscita</h1>
      <p className="mt-2 text-fog-400">La pagina che cerchi non esiste.</p>
      <Link to="/" className={`${bottone.primario} mt-6`}>
        Torna al catalogo
      </Link>
    </div>
  )
}
