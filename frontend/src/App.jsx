import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalogo from './pages/Catalogo'
import DettaglioAuto from './pages/DettaglioAuto'
import Login from './pages/Login'
import Registrazione from './pages/Registrazione'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/auto/:id" element={<DettaglioAuto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrazione" element={<Registrazione />} />
          <Route path="*" element={<NonTrovata />} />
        </Routes>
      </main>
    </div>
  )
}

function NonTrovata() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Pagina non trovata</h1>
      <Link to="/" className="mt-4 inline-block text-blue-700 hover:underline">
        Torna al catalogo
      </Link>
    </div>
  )
}
