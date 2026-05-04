# 115 - Hotfix Console docente e Audit sicurezza 0.12.19

## Scopo

La versione **0.12.19** è una release correttiva mirata. Non introduce nuovi flussi applicativi, nuove voci di menu, nuove collezioni Firestore o requisiti backend.

Interviene su due problemi osservati in uso reale:

1. **Console docente**: il report JSON tecnico del dataset gruppo era mostrato in primo piano sotto gli indicatori, risultando simile a codice per l’utente docente.
2. **Audit sicurezza e QA accessi**: entrando come superadmin poteva comparire l’errore `Cannot read properties of undefined (reading 'collection')` quando Firestore era disponibile come variabile globale legacy `db` ma non come `window.db`.

## Console docente

La sezione **Indicatori dataset gruppo** resta invariata nei conteggi principali, ma il JSON tecnico non viene più mostrato direttamente come contenuto principale.

Ora l’interfaccia presenta:

- riepilogo leggibile dei contatori principali;
- pulsante **Copia report JSON**;
- sezione chiusa **Mostra dettagli tecnici JSON** per ispezione avanzata.

Il report JSON rimane disponibile per diagnostica, esportazione o supporto, ma non disturba il flusso didattico.

## Audit sicurezza superadmin

Il servizio Audit sicurezza ora recupera Firestore in modo compatibile:

- prima prova `window.db`;
- poi prova `globalThis.db`;
- infine prova la variabile globale legacy `db` quando disponibile nello scope browser.

Se Firestore non è inizializzato, il messaggio è esplicito:

```text
Firestore non inizializzato: ricarica l’app e verifica la configurazione Firebase.
```

Questo evita l’errore generico `Cannot read properties of undefined (reading 'collection')` e mantiene l’accesso per admin, teacher e superadmin.

## Persistenza e regole

La 0.12.19 non modifica lo schema dati.

Restano invariati:

```text
users/{uid}
businessGroups/{groupId}
businessGroups/{groupId}/securityAccessReports/{reportId}
businessGroups/{groupId}/teachingScenarios/{scenarioId}
businessGroups/{groupId}/simulationEvents/{eventId}
```

Non sono richieste nuove regole Firestore.

## Test aggiunti

- `tests/security-audit-superadmin-01219.test.html`
- `tests/teacher-console-ux-01219.test.html`

I test verificano:

- generazione report Audit sicurezza come superadmin anche senza `window.db`;
- presenza del riferimento hotfix 0.12.19;
- JSON tecnico della Console docente nascosto in una sezione dettagli;
- permanenza del riepilogo leggibile per il docente.
