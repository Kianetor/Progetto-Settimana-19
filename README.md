# SaloneAuto

Mini salone di automobili usate con **avvisi di prezzo via mail**.

- Chi non ha fatto l'accesso sfoglia le auto pubblicate, con ricerca, filtri e ordinamento.
- L'utente registrato salva le auto tra i preferiti e su ognuna può fissare una **soglia di prezzo**: quando il prezzo scende alla soglia riceve **una mail**.
- L'amministratore vede anche le **bozze** e il **prezzo d'acquisto**, crea e modifica le auto e ne cambia il prezzo.

| Parte | Tecnologie |
|---|---|
| Backend | Java 25, Spring Boot 4.1, Spring Security (JWT HS256, resource server), Spring Data JPA, Java Mail |
| Frontend | React 19 (JavaScript/JSX), Vite, React Router, Tailwind CSS 4 |
| Database | PostgreSQL |

---

## Avvio in locale

### Requisiti
- Java 25
- Node.js 20 o superiore
- PostgreSQL in ascolto sulla porta 5432

### 1. Database
Creare un database vuoto chiamato `salone` (da pgAdmin oppure con `createdb -U postgres salone`).
Le tabelle vengono create automaticamente all'avvio del backend.

### 2. Configurazione del backend
```bash
cd backend
cp .env.example .env
```
Compilare `backend/.env` (il file è escluso da git):

| Variabile | Significato |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | connessione a PostgreSQL |
| `JWT_SECRET` | chiave di firma dei token, almeno 32 caratteri casuali (es. `openssl rand -base64 48`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | amministratore creato al primo avvio (password di almeno 8 caratteri) |
| `FRONTEND_URL` | indirizzo del frontend, usato per il link nella mail |
| `MAIL_ENABLED` | `false` = mail simulate (il link finisce nel log), `true` = invio reale con Gmail |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | account Gmail mittente e relativa **password per le app** (non la password dell'account) |

Senza `ADMIN_PASSWORD` l'amministratore non viene creato: non esistono credenziali di default.

### 3. Backend (porta 8080)
```bash
cd backend
./mvnw spring-boot:run
```
Al primo avvio vengono create anche 7 auto di esempio (una in bozza).

### 4. Frontend (porta 5173)
```bash
cd frontend
npm install
npm run dev
```
Aprire http://localhost:5173. In sviluppo Vite inoltra le chiamate `/api` al backend.

### Test
```bash
cd backend
./mvnw test
```

---

## Struttura

```
backend/src/main/java/kian/backend/
  config/         creazione amministratore e auto di esempio
  security/       configurazione JWT, CORS e CSP, revoca dei token, hashing
  entities/       Utente, Auto, Preferito, Avviso, TokenJwt
  repositories/   accesso ai dati (query con parametri legati)
  dto/            oggetti in ingresso e in uscita (mai le entità)
  services/       logica: utenti, catalogo, preferiti, avvisi, mail
  events/         evento di ribasso e listener che manda le mail
  controllers/    endpoint REST
  exceptions/     formato unico delle risposte di errore
frontend/src/
  lib/api.js      tutte le chiamate al backend
  context/        stato di autenticazione
  components/     componenti riusabili
  pages/          catalogo, dettaglio, accesso, area personale, disattivazione avviso, area admin
```

---

## Endpoint

| Metodo | Percorso | Accesso | Descrizione |
|---|---|---|---|
| POST | `/api/auth/register` | pubblico | registrazione (ruolo sempre `USER`) |
| POST | `/api/auth/login` | pubblico | restituisce il JWT |
| POST | `/api/auth/logout` | utente | revoca il token usato |
| GET / PATCH | `/api/utenti/me` | utente | profilo (si modifica solo il nome) |
| GET | `/api/auto` | pubblico | catalogo: `q`, `marca`, `alimentazione`, `prezzoMin`, `prezzoMax`, `annoMin`, `kmMax`, `sort`, `page`, `size` |
| GET | `/api/auto/{id}` | pubblico | dettaglio di un'auto pubblicata |
| GET / POST | `/api/preferiti` | utente | elenco / aggiunta (`{ autoId }`) |
| DELETE | `/api/preferiti/{id}` | utente | rimozione |
| GET / POST | `/api/avvisi` | utente | elenco / creazione (`{ autoId, soglia }`) |
| GET / PATCH / DELETE | `/api/avvisi/{id}` | utente | dettaglio / nuova soglia / eliminazione |
| POST | `/api/avvisi/disattiva` | pubblico | disattivazione dal link della mail (`{ token }`) |
| GET / POST | `/api/admin/auto` | admin | elenco completo (anche bozze, `?pubblicata=`) / creazione |
| GET / PUT | `/api/admin/auto/{id}` | admin | dettaglio / modifica |
| PATCH | `/api/admin/auto/{id}/prezzo` | admin | cambio del prezzo |

Valori ammessi per `sort`: `prezzo`, `anno`, `chilometri`, `marca`, `modello`, `recenti`; l'amministratore anche `prezzoAcquisto`, `pubblicata`, `aggiornate`. Esempio: `sort=prezzo,asc`.

---

## Scelte progettuali

### Quando parte una mail

Un avviso lega un utente a un'auto con una soglia e con il segno `inviato`.

**L'avviso scatta solo quando il prezzo attraversa la soglia**: prima era sopra, adesso è uguale o sotto.
In pratica, al ribasso da `vecchio` a `nuovo`, vengono selezionati gli avvisi con `soglia < vecchio AND soglia >= nuovo`, attivi, non ancora inviati e su auto pubblicate.

- Se l'amministratore salva di nuovo lo stesso prezzo non parte niente (nessun evento).
- Se abbassa ancora un prezzo già sotto la soglia non parte niente (`soglia < vecchio` è falso).
- Un rialzo non genera eventi.
- La soglia deve essere inferiore al prezzo attuale quando viene impostata, altrimenti l'avviso non potrebbe mai "attraversarla" scendendo (400).

**Ogni avviso manda una sola mail.** Una volta inviato resta inviato, anche se il prezzo risale e poi riscende.
Se l'utente imposta una soglia nuova, quello è un avviso nuovo: torna "in attesa" e il vecchio link smette di valere.

### Come parte la mail

1. Il servizio che cambia il prezzo pubblica un evento `PrezzoRibassato` dentro la transazione.
2. Il listener è annotato con `@TransactionalEventListener(phase = AFTER_COMMIT)` e `@Async`:
   - riceve l'evento **solo dopo il commit**: se il salvataggio fallisce (per esempio conflitto di versione) non parte nessuna mail;
   - gira su un altro thread: la risposta all'amministratore non aspetta Gmail.
3. Per ogni avviso il segno si prende **in un colpo solo**, prima di spedire:
   `UPDATE avvisi SET inviato = true, ... WHERE id = ? AND inviato = false AND attivo = true`
   La mail parte solo se la riga aggiornata è **una**. Con due modifiche ravvicinate che attraversano entrambe la soglia, solo una delle due vince l'aggiornamento e l'altra trova 0 righe: nessun doppione. Scenario verificato con due richieste contemporanee.

### Se Gmail non risponde

**Scelta: l'avviso resta inviato e la mail è persa.**

Il segno `inviato` viene preso prima dell'invio; se l'invio fallisce non viene rimesso a `false`.
Motivazione: la regola del salone è "una sola mail per avviso". Rimettere l'avviso da inviare potrebbe produrre un doppione (per esempio se Gmail ha consegnato la mail ma la risposta si è persa per un timeout), e un doppione confonde l'utente più di una mail mancata. Nel log resta `Invio mail fallito avviso=<id>`, senza indirizzo email, così il caso si può ricontrollare a mano.
I timeout SMTP sono impostati a 5 secondi per non tenere occupato a lungo il thread.

### Link di disattivazione

- Il link contiene un **token casuale** di 256 bit, generato al momento dell'invio, non l'id dell'avviso.
- Nel database si salva solo lo **SHA-256** del token; il valore in chiaro esiste solo nella mail.
- È **monouso**: la disattivazione cancella l'hash nella stessa `UPDATE`, quindi un secondo uso risponde 404.
- Il token sta dopo `#` (`/disattiva-avviso#token=...`): il frammento non viene spedito al server e non finisce nei log di accesso. La pagina lo toglie subito dalla barra degli indirizzi.
- La disattivazione richiede un clic (POST), non basta aprire il link: le anteprime automatiche dei link nelle caselle di posta non disattivano nulla.

### Dati in ingresso

- **Iniezione SQL.** Nessuna query è costruita concatenando stringhe: ricerca e filtri usano la Criteria API di JPA (Specification), quindi ogni valore arriva al database come parametro legato. Il testo cercato viene reso "letterale" facendo l'escape di `%` e `_`.
  Il campo di ordinamento non si può legare come parametro: viene confrontato con un **elenco chiuso** di valori ammessi e tradotto nella proprietà JPA; qualsiasi altro valore (per esempio `prezzoAcquisto` dal catalogo pubblico, o `prezzo;DROP TABLE auto`) riceve 400.
- **XSS.** Descrizione dell'auto e nome dell'utente sono trattati sempre come testo:
  - nel frontend React li stampa come testo, **nessun `dangerouslySetInnerHTML`**;
  - nel template HTML della mail ogni valore passa da `HtmlUtils.htmlEscape` (coperto da un test automatico con `<script>` e `<img onerror>`); dall'oggetto della mail vengono tolti gli a capo;
  - l'URL dell'immagine è accettato solo se inizia con `https://` (niente `javascript:` dentro un attributo);
  - Content Security Policy: il backend risponde con `default-src 'none'`; la build del frontend (`npm run preview`) con script solo dalla stessa origine.
- **Assegnazione di massa.** Registrazione, profilo, preferiti, avvisi e auto ricevono **DTO**, mai le entità. Campi come `ruolo`, `inviato`, `attivo` o `utenteId` aggiunti al corpo della richiesta vengono ignorati: non esistono nel DTO. L'utente è sempre quello del JWT.

### Chi può fare che cosa

- Ogni endpoint dichiara la propria regola con `@PreAuthorize`. Le operazioni dell'amministratore (bozze, prezzo d'acquisto, modifica, **cambio del prezzo**) richiedono il ruolo `ADMIN`: senza token 401, con il token di un utente normale **403**.
- Il **ruolo lo decide il server**: alla registrazione è sempre `USER`; l'unico amministratore è quello creato all'avvio dalla configurazione.
- Nel JWT ci sono solo i dati necessari: id utente (`sub`), ruolo e date. Niente email o nome. Il decoder accetta solo HS256 (un token con `alg: none` o firma alterata riceve 401). I token emessi sono registrati come hash e il logout li revoca.
- **IDOR.** Preferiti e avvisi si cercano **per identificativo e proprietario insieme** (`findByIdAndUtenteId`). Chi prova l'id di un altro utente riceve **404**, non 403: non deve nemmeno sapere che quell'oggetto esiste. Lo stesso vale per le bozze richieste dal catalogo pubblico.
- **Log.** Nei log finiscono solo identificativi ed esiti (`Login riuscito utente=<id>`, `Avviso notificato avviso=<id>`). Mai password, token o indirizzi email; i record che contengono password o token ridefiniscono `toString()` per nasconderli.
- **Segreti.** Password del database, chiave JWT, credenziali dell'amministratore e password di Gmail stanno in `backend/.env`, escluso dalla repository.

### Altre scelte

- **CSRF.** Il JWT viaggia nell'intestazione `Authorization` e non in un cookie: il browser non lo allega da solo alle richieste partite da altri siti, quindi un attacco CSRF non ha credenziali da sfruttare e la protezione CSRF di Spring è disattivata. Il token è tenuto in `sessionStorage`; il rischio di furto via XSS è mitigato dalle difese descritte sopra.
- **Concorrenza sulle auto.** L'entità `Auto` ha un campo `@Version`: due modifiche contemporanee della stessa auto non si sovrascrivono in silenzio, la seconda riceve 409.
- **Bozze.** Un'auto rimessa in bozza sparisce dal catalogo, dai preferiti e dagli avvisi dell'utente finché non viene ripubblicata, e non genera mail.

---

## Verifiche svolte

Oltre ai test automatici (`./mvnw test`), sono stati provati a mano:

| Caso | Risultato atteso |
|---|---|
| Registrazione con `"ruolo": "ADMIN"` nel corpo | creato come `USER` |
| Token manomesso, `alg: none`, token dopo il logout | 401 |
| Utente che cambia il prezzo di un'auto | 403 |
| `sort` fuori elenco, `q=' OR '1'='1` | 400 / nessun risultato |
| Preferito o avviso di un altro utente (GET, PATCH, DELETE) | 404 |
| Bozza richiesta dal catalogo pubblico | 404 |
| Prezzo 13.500 → 13.000 con soglia 12.500 | nessuna mail |
| Prezzo → 12.500 (soglia raggiunta) | una mail |
| Stesso prezzo di nuovo / ulteriore ribasso / rialzo e nuovo ribasso | nessuna mail |
| Due ribassi contemporanei sotto la stessa soglia | una sola mail |
| Link di disattivazione usato due volte / token inventato | 204, poi 404 / 404 |
| Invio reale tramite Gmail | mail ricevuta, link funzionante |
