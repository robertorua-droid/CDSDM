# 112. Coerenza backup/import segnalazioni operative 0.12.16

La versione **0.12.16** corregge una regressione della 0.12.15: la collezione Firestore `operationalReports` era già dichiarata nel dominio, usata dai moduli operativi e considerata dal reset tramite `DATA_COLLECTIONS`, ma non era inclusa nel backup/import JSON della pagina Migrazione.

## Correzione

`js/features/migration/migration-module.js` ora include `operationalReports` in:

- stima uso dati;
- normalizzazione del backup JSON;
- import/ripristino batch;
- export JSON dal cloud;
- campo `appVersion: 0.12.16` del backup.

## Impatto dati

La correzione non introduce nuove collezioni: `operationalReports` era già la collezione ufficiale delle segnalazioni operative.

Percorsi supportati:

```text
users/{uid}/operationalReports/{reportId}
businessGroups/{groupId}/operationalReports/{reportId}
```

## Regole Firestore

Nessuna modifica richiesta a `firestore.rules` in questa release: la collezione era già mappata allo scope `operationalReports`.

## Compatibilità

- Nessun backend custom.
- Nessuna Cloud Function obbligatoria.
- Compatibilità legacy `users/{uid}` mantenuta.
- Compatibilità gruppi `businessGroups/{groupId}` mantenuta.
- Nessuna migrazione distruttiva.

## Test

Aggiunto `tests/backup-operational-reports-01216.test.html` per verificare che export, import e stima uso dati includano la collezione.
