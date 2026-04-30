## CDSDM Versione 0.0.2 — Recupero password da login
- aggiunto nella schermata iniziale il comando **Password dimenticata? Invia link di reset**.
- il reset usa Firebase Authentication compat con `sendPasswordResetEmail(email)` e mantiene invariata la logica di login esistente.
- aggiunti messaggi utente dedicati per email mancante, richiesta inviata e errore di invio.
- aggiornate versione, README e documentazione in-app.

## CDSDM Versione 0.0.1 — Baseline nuovo repository e nuovo Firebase
- avvio della nuova numerazione CDSDM dopo la migrazione su nuovo repository/progetto.
- configurazione Firebase aggiornata per puntare al progetto `cdsdm-b6e8b`.
- mantenuto l'uso degli SDK Firebase compat già caricati da `index.html`.
- nessuna modifica alla struttura dati applicativa: Firestore continua a usare il ramo per utente `users/{uid}`.
