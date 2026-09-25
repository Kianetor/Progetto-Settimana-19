import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, leggiToken, quandoTokenRifiutato, salvaToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [utente, setUtente] = useState(null)
  const [caricamento, setCaricamento] = useState(() => Boolean(leggiToken()))

  const esci = useCallback(() => {
    salvaToken(null)
    setUtente(null)
  }, [])

  // All'avvio, se c'è un token salvato, chiediamo al server chi siamo (il token da solo non ha nome né email)
  useEffect(() => {
    quandoTokenRifiutato(esci)
    if (!leggiToken()) return
    api
      .me()
      .then(setUtente)
      .catch(esci)
      .finally(() => setCaricamento(false))
  }, [esci])

  const login = useCallback(async (email, password) => {
    const { token } = await api.login({ email, password })
    salvaToken(token)
    setUtente(await api.me())
  }, [])

  const registra = useCallback(
    async (dati) => {
      await api.registra(dati)
      await login(dati.email, dati.password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      esci()
    }
  }, [esci])

  const valore = useMemo(
    () => ({
      utente,
      caricamento,
      isAdmin: utente?.ruolo === 'ADMIN',
      login,
      registra,
      logout,
      setUtente,
    }),
    [utente, caricamento, login, registra, logout],
  )

  return <AuthContext.Provider value={valore}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
