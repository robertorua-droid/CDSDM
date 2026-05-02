# Report sintetico incoerenze — analisi reale ZIP 0.6.6

## Stato ricostruito

Lo ZIP 0.6.6 contiene una SPA front-end HTML/CSS/JavaScript con jQuery, Bootstrap, Firebase Auth e Firestore. La persistenza è doppia e compatibile:

- legacy personale: `users/{uid}`;
- gruppi condivisi: `businessGroups/{groupId}`.

La struttura principale è composta da:

- `index.html` con sezioni SPA, menu e caricamento script;
- `js/core` per store, costanti dominio, normalizzatori, permessi e concorrenza;
- `js/services/firebase-cloud.js` per accesso diretto a Firestore/Auth;
- `js/features/*` per moduli gestionali, accounting, warehouse, business groups, migrazione e documentazione;
- `firestore.rules` per compatibilità legacy, gruppi, ruoli, permessi effettivi e collezioni sensibili;
- `tests/` con suite browser-based;
- `DOCUMENTAZIONE/` e documentazione in-app generata in `docs-content.js`.

## Incoerenze trovate e corrette

1. **Modulo preventivi duplicato/obsoleto**
   - File: `js/features/warehouse/customer-quotes-module.js`.
   - Problema: non era caricato in `index.html`, duplicava `quotes-module.js` e usava `customerQuotes`, collezione non documentata in `CDSDM_DATA_COLLECTIONS` né nelle rules.
   - Correzione: file rimosso dal pacchetto 0.7.0. Il flusso preventivi resta su `quotes`.

2. **Cache dati iniziale incompleta**
   - File: `js/core/utils.js`, `js/core/app-store.js`.
   - Problema: alcune collezioni 0.6.x non erano preinizializzate in tutte le cache locali.
   - Correzione: aggiunti `migrationReports`, `permissionProfiles`, `permissionMatrices`, `securityAccessReports` dove mancanti.

3. **Backup/import non allineati ai moduli 0.6.x**
   - File: `js/features/migration/migration-module.js`.
   - Problema: export con `appVersion: 0.5.6`; assenti `permissionProfiles`, `permissionMatrices`, `securityAccessReports` da export/import normalizzato.
   - Correzione: versione export aggiornata a 0.7.0; backup, import e stima uso dati includono le collezioni consolidate.

4. **Indice test non aggiornato**
   - File: `tests/index.html`.
   - Problema: etichetta 0.6.5 e link audit 0.6.6 fuori layout.
   - Correzione: indice aggiornato a 0.7.0 e nuova suite `consolidamento-070.test.html`.

5. **Versioni e documentazione non allineate al ramo 0.7.x**
   - File: `README.md`, `DOCUMENTAZIONE/*`, `MAPPA_MODULI.md`, `index.html`, `docs-content.js`.
   - Problema: documentazione ferma alla 0.6.6/0.6.5.
   - Correzione: aggiunti changelog e capitolo 47, aggiornati manuale/workflow/mappa, rigenerata documentazione in-app.

## Incoerenze non invasive lasciate invariate

- Le vecchie note storiche di versione nei moduli e nella documentazione sono mantenute perché descrivono rilasci precedenti.
- `firestore.rules` non è stato stravolto: il modello 0.6.5/0.6.6 è coerente con i vincoli richiesti e mantiene fallback legacy.
- Nessuna Cloud Function è stata introdotta o resa requisito.
