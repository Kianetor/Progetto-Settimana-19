// Tutte le chiamate al backend passano da qui.
// Il JWT sta in sessionStorage (sparisce chiudendo la scheda) e viaggia solo nell'intestazione Authorization:
// il browser non lo allega da solo alle richieste di altri siti, per questo il backend non usa token CSRF
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const CHIAVE_TOKEN = 'salone.token'

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors ?? null
  }
}

export function leggiToken() {
  try {
    return sessionStorage.getItem(CHIAVE_TOKEN)
  } catch {
    return null
  }
}

export function salvaToken(token) {
  try {
    if (token) sessionStorage.setItem(CHIAVE_TOKEN, token)
    else sessionStorage.removeItem(CHIAVE_TOKEN)
  } catch {
    // storage non disponibile (es. navigazione privata): si resta non collegati
  }
}

// Avvisa l'app quando il server rifiuta il token (scaduto o revocato)
let alTokenRifiutato = () => {}
export function quandoTokenRifiutato(callback) {
  alTokenRifiutato = callback
}

async function chiama(percorso, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? leggiToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  const risposta = await fetch(`${BASE}${percorso}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (risposta.status === 204) return undefined
  const dati = await risposta.json().catch(() => null)

  if (!risposta.ok) {
    if (risposta.status === 401 && token) alTokenRifiutato()
    const messaggio = dati?.message ?? (dati?.errors ? 'Controlla i campi evidenziati' : `Errore ${risposta.status}`)
    throw new ApiError(risposta.status, messaggio, dati?.errors)
  }
  return dati
}

// Parametri di ricerca: i valori vuoti non vengono mandati
function query(parametri) {
  const qs = new URLSearchParams()
  Object.entries(parametri).forEach(([chiave, valore]) => {
    if (valore !== undefined && valore !== null && valore !== '') qs.append(chiave, valore)
  })
  const testo = qs.toString()
  return testo ? `?${testo}` : ''
}

export const api = {
  // Autenticazione e profilo
  registra: (dati) => chiama('/api/auth/register', { method: 'POST', body: dati, auth: false }),
  login: (dati) => chiama('/api/auth/login', { method: 'POST', body: dati, auth: false }),
  logout: () => chiama('/api/auth/logout', { method: 'POST' }),
  me: () => chiama('/api/utenti/me'),
  aggiornaProfilo: (dati) => chiama('/api/utenti/me', { method: 'PATCH', body: dati }),

  // Catalogo pubblico
  catalogo: (filtri) => chiama(`/api/auto${query(filtri)}`, { auth: false }),
  auto: (id) => chiama(`/api/auto/${encodeURIComponent(id)}`, { auth: false }),

  // Preferiti
  preferiti: () => chiama('/api/preferiti'),
  aggiungiPreferito: (autoId) => chiama('/api/preferiti', { method: 'POST', body: { autoId } }),
  rimuoviPreferito: (id) => chiama(`/api/preferiti/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Avvisi di prezzo
  avvisi: () => chiama('/api/avvisi'),
  creaAvviso: (autoId, soglia) => chiama('/api/avvisi', { method: 'POST', body: { autoId, soglia } }),
  modificaSoglia: (id, soglia) => chiama(`/api/avvisi/${encodeURIComponent(id)}`, { method: 'PATCH', body: { soglia } }),
  eliminaAvviso: (id) => chiama(`/api/avvisi/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  disattivaAvviso: (token) => chiama('/api/avvisi/disattiva', { method: 'POST', body: { token }, auth: false }),

  // Amministratore
  adminAuto: (filtri) => chiama(`/api/admin/auto${query(filtri)}`),
  adminDettaglio: (id) => chiama(`/api/admin/auto/${encodeURIComponent(id)}`),
  adminCrea: (dati) => chiama('/api/admin/auto', { method: 'POST', body: dati }),
  adminModifica: (id, dati) => chiama(`/api/admin/auto/${encodeURIComponent(id)}`, { method: 'PUT', body: dati }),
  adminPrezzo: (id, prezzo) =>
    chiama(`/api/admin/auto/${encodeURIComponent(id)}/prezzo`, { method: 'PATCH', body: { prezzo } }),
}
