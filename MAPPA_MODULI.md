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
