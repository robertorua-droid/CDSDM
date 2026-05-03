## Aggiornamento 0.10.6 — Mini B.I. tab hotfix

- `js/features/bi/mini-bi-module.js`: binding difensivo, selezione unica della tab attiva e rendering area robusto.
- `js/app/invoice-xml-migration.js`: aggiunto bind del modulo `AppModules.miniBI` nella procedura generale.
- `tests/mini-bi-0106.test.html`: test browser-based del cambio tab.

## Aggiornamento 0.8.12 — Consolidamento dati e store

- `js/core/domain-constants.js`: fonte ufficiale delle collezioni dati e funzione `getCDSDMDataCollections()`.
- `js/core/app-store.js`: inizializzazione `globalData` dinamica in base a `CDSDM_DATA_COLLECTIONS`.
- `js/core/utils.js`: cache legacy allineata alla lista condivisa, senza mantenere una seconda lista autonoma.
- `js/services/firebase-cloud.js`: caricamento cloud basato sulla lista condivisa.
- `js/features/migration/migration-module.js`: reset e backup basati sulla lista condivisa; `appVersion` 0.8.12.
- `tests/consolidamento-0812.test.html`: regressione browser-based del consolidamento.

---

## Aggiornamento 0.7.0 — Consolidamento tecnico

### Moduli rimossi o consolidati

- Rimosso `js/features/warehouse/customer-quotes-module.js`: modulo legacy non caricato, duplicato rispetto a `js/features/warehouse/quotes-module.js` e basato sulla collezione non ufficiale `customerQuotes`.

### Moduli aggiornati

- `js/core/utils.js`: cache iniziale allineata a tutte le collezioni dati consolidate.
- `js/core/app-store.js`: inizializzazione store coerente con `CDSDM_DATA_COLLECTIONS`.
- `js/features/migration/migration-module.js`: backup/import/reset e stima uso dati includono `permissionProfiles`, `permissionMatrices`, `securityAccessReports` e `migrationReports`.
- `js/core/permissions-policy.js`: versione UI consolidata a 0.7.0 senza modificare il modello permessi.
- `tests/index.html`: indice suite aggiornato a 0.7.0.
- `tests/consolidamento-070.test.html`: nuova verifica browser-based di coerenza tecnica.

### Collezioni dati ufficiali confermate

```text
products, customers, suppliers, purchases, invoices, notes,
commesse, projects, worklogs, vatRates, paymentMethods, companyBanks,
warehouseMovements, quotes, customerOrders, supplierOrders, supplierDDTs,
customerDDTs, warehousePhysicalCounts, warehouseLots, paymentEvents,
cashbookMovements, reminderEvents, bankReconciliationEvents, businessBudgets,
workflowEvents, auditEvents, teachingScenarios, simulationEvents,
migrationReports, permissionProfiles, permissionMatrices, securityAccessReports
```

---

## Aggiornamento 0.6.6 — Audit sicurezza e QA accessi

Nuovi moduli:

```text
js/features/business-groups/security-audit-service.js
js/features/business-groups/security-audit-module.js
```

Nuova sezione UI:

```text
Impostazioni → Audit sicurezza
```

Nuova collezione gruppo:

```text
businessGroups/{groupId}/securityAccessReports
```

---

# Aggiornamento 0.6.5 — Regole Firestore rafforzate

La 0.6.5 collega le collection dati ai relativi scope permesso nelle regole Firestore. Le sezioni UI restano governate da `PermissionsPolicy`, mentre Firestore usa `effectiveProfilePermissions` per bloccare lettura/scrittura/eliminazione quando disponibili.

# Aggiornamento 0.6.3 — Matrice permessi moduli

Nuovi moduli:

- `js/features/business-groups/permission-matrix-service.js`: catalogo moduli, livelli `none/read/write/admin`, modello azioni e persistenza `permissionMatrices/moduleMatrix`.
- `js/features/business-groups/permission-matrix-module.js`: UI **Impostazioni → Matrice permessi**, salvataggio, reset e copia JSON.

Moduli aggiornati:

- `js/core/permissions-policy.js`: legge livelli profilo/matrice, espone catalogo moduli e classifica azioni UI.
- `js/features/business-groups/permission-profiles-service.js`: usa il catalogo modulo 0.6.3 quando disponibile.
- `index.html` e `navigation-module.js`: aggiungono menu e sezione SPA.
- `firestore.rules`: protegge `permissionMatrices`.

---

# Aggiornamento 0.6.2 — Profili permesso configurabili

Nuovi moduli:

- `js/features/business-groups/permission-profiles-service.js`: CRUD profili permesso, profili predefiniti e assegnazione ai membri.
- `js/features/business-groups/permission-profiles-module.js`: UI per matrice moduli e assegnazione profili.

Moduli aggiornati:

- `js/core/permissions-policy.js`: legge `profilePermissions` del gruppo attivo quando presenti.
- `js/features/business-groups/business-groups-service.js`: inviti e membership supportano `permissionProfileId`.
- `js/features/business-groups/business-groups-module.js`: inviti con profilo iniziale opzionale.
- `firestore.rules`: match esplicito per `permissionProfiles`.

---

## Moduli 0.6.1 - Inviti avanzati e onboarding collaboratori

### Moduli aggiornati

- `js/features/business-groups/business-groups-service.js`
  - versione 0.6.1;
  - stati invito, scadenza, revoca, rigenerazione codice;
  - filtri e consolidamento inviti scaduti.

- `js/features/business-groups/business-groups-module.js`
  - pannello inviti avanzato;
  - filtri email/stato;
  - copia istruzioni onboarding;
  - azioni revoca, rigenera, marca scaduti.

- `js/features/auth/auth-module.js`
  - messaggi più chiari per registrazione con invito;
  - tentativo di pulizia account appena creato se l’invito non viene accettato.

- `firestore.rules`
  - verifica scadenza invito quando `expiresAt` è timestamp.

- `DOCUMENTAZIONE/41_INVITI_AVANZATI_ONBOARDING.md`
  - documentazione della release.

---

## Moduli 0.6.0 - Superadmin e registrazione con invito

### Nuovi moduli

- `js/features/business-groups/superadmin-service.js`
  - legge `appSettings/system`;
  - inizializza il primo superadmin;
  - scrive un profilo applicativo leggero in `userProfiles/{uid}`;
  - espone snapshot diagnostico utente/membership.

- `js/features/business-groups/superadmin-module.js`
  - renderizza **Impostazioni → Superadmin**;
  - consente bootstrap del primo superadmin;
  - mostra stato configurazione, utente corrente e membership;
  - copia snapshot diagnostico.

### Moduli aggiornati

- `js/features/auth/auth-module.js`
  - aggiunge **Registrati con invito**;
  - crea account Firebase Auth con `createUserWithEmailAndPassword`;
  - accetta l’invito e seleziona il gruppo.

- `js/features/business-groups/business-groups-service.js`
  - aggiorna versione a 0.6.0;
  - evita che l’invitato aggiorni il documento root del gruppo durante l’accettazione.

- `js/core/permissions-policy.js`
  - aggiunge il target `superadmin`.

- `js/features/navigation/navigation-module.js`
  - collega la nuova sezione alla SPA.

- `firestore.rules`
  - protegge `appSettings/system` e `userProfiles/{uid}`;
  - introduce superadmin globale.

- `index.html`
  - aggiorna login, menu, sezione e script.


---

## Moduli 0.6.3 - Matrice permessi moduli

### Nuovi moduli

- `js/features/business-groups/permission-matrix-service.js`
  - definisce catalogo moduli, livelli `none/read/write/admin` e modello azioni;
  - legge/scrive `businessGroups/{groupId}/permissionMatrices/moduleMatrix`;
  - espone funzioni diagnostiche per scope e target menu.

- `js/features/business-groups/permission-matrix-module.js`
  - renderizza **Impostazioni → Matrice permessi**;
  - consente modifica del modello azioni per livello;
  - permette reset standard e copia JSON diagnostica.

### Moduli aggiornati

- `js/core/permissions-policy.js`
  - versione 0.6.3;
  - espone `getModuleCatalog`, `getPermissionLevel`, `canAdmin`;
  - include il target `matrice-permessi`.

- `js/features/business-groups/permission-profiles-service.js`
  - usa il catalogo 0.6.3 se `PermissionMatrixService` è disponibile.

- `firestore.rules`
  - protegge `permissionMatrices` per membri/admin.

- `index.html` e `navigation-module.js`
  - aggiungono menu e render della nuova sezione.


## Mini B.I. 0.10.x

- `js/features/bi/mini-bi-service.js`: KPI, aree B.I., permessi granulari e audit opzionale.
- `js/features/bi/mini-bi-module.js`: pagina Mini B.I., tab adattive e panoramica anti-leakage.
- `tests/mini-bi-0100.test.html` ... `tests/mini-bi-0105.test.html`: QA browser-based permessi B.I.

## Mini B.I. 0.11.6 — Stabilizzazione QA ruoli

- `js/features/bi/mini-bi-service.js`: aggiunta valutazione regressiva ruoli con policy simulata.
- `js/features/bi/mini-bi-module.js`: aggiunto pannello QA ruoli nella pagina Mini B.I.
- `tests/mini-bi-0107.test.html`: test browser-based di regressione ruoli e tab.



## Segnalazioni operative 0.12.9
### Hotfix operativo 0.12.9

Il modulo distingue bozze e segnalazioni effettive: il form espone **Salva bozza** e **Invia segnalazione**. La scheda dettaglio espone **Invia comunicazione** e azioni workflow guidate per presa in carico, lavorazione, risoluzione e chiusura.


- `js/features/operations/operational-reports-service.js` — servizio per collezione `operationalReports`, workflow, comunicazioni interne, CSV, stampa e creazione da alert B.I.
- `js/features/operations/operational-reports-module.js` — UI `Workflow → Segnalazioni operative`.
- `tests/operational-reports-0128.test.html` — test browser-based.


## 0.12.10 - Segnalazioni operative

Aggiunti collegamenti guidati a ordini/DDT lavorabili e creazione contestuale bozza da DDT fornitore con quarantena.

## 0.12.11 - Workflow approvativo operativo

- `js/features/accounting/workflow-service.js`: l'azione Approva aggiorna anche lo stato operativo dei documenti lavorabili. Per gli ordini cliente/fornitore in bozza imposta `status: confirmed`, mantenendo `workflowStatus: approved` e storico in `workflowEvents`.
- `js/features/accounting/workflow-module.js`: messaggio UI aggiornato per chiarire che il workflow approvativo rende operativi i documenti, mentre le segnalazioni operative gestiscono anomalie/comunicazioni interne.
- `js/features/warehouse/customer-ddts-module.js` e `js/features/warehouse/supplier-ddts-module.js`: selezione ordini limitata a documenti lavorabili, cioè confermati o parzialmente evasi/ricevuti, con bozze escluse.
- `js/features/warehouse/customer-orders-module.js` e `js/features/warehouse/supplier-orders-module.js`: riepiloghi aggiornati per distinguere bozze da ordini confermati.

## 0.12.12 - Hotfix filtri Segnalazioni operative

- `js/features/operations/operational-reports-module.js`: preserva i valori dei filtri Stato/Area/Gravità durante render, refresh, apertura dettaglio e cambio stato.
- `tests/operational-reports-01212.test.html`: verifica che la lista parta da Aperte/Tutte/Tutte e resti coerente col riepilogo.

## 0.12.13 - UX segnalazioni, preventivi approvati e quantità

- `js/features/warehouse/quotes-module.js`: conversione preventivo → ordine cliente solo dopo approvazione/accettazione.
- `index.html`: Segnalazioni operative in tab elenco/dettaglio e nuova segnalazione; quantità documentali con incremento unitario.
- `js/features/operations/operational-reports-module.js`: render e ritorno automatico all’elenco dopo salvataggio/invio.
- `js/features/warehouse/customer-ddts-module.js`, `supplier-ddts-module.js`, `js/features/invoices/invoices-form-module.js`: quantità con step unitario e decimali manuali accettati.


## 0.12.14 - Manuale in-app evoluto

- `js/ui/onboarding-help-service.js`: aiuti rapidi contestuali con passi, esempi e note.
- `DOCUMENTAZIONE/02_MANUALE_UTENTE.md`: flussi operativi aggiornati.
- `DOCUMENTAZIONE/108_MANUALE_IN_APP_EVOLUTO_01214.md`: note di release documentali.


## Aggiornamento 0.12.15

- `js/ui/onboarding-help-service.js`: aiuto rapido non invasivo con icona `?` accanto ai titoli pagina.
- `Info → Manuale Utente`: guida visuale generale caricata da `109_MANUALE_VISUALE_01215.md`.
- `css/style.css`: stili per pannelli contestuali, card manuale e step operativi.
