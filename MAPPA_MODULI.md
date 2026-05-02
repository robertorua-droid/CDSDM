## Moduli 0.4.3 - Registro attività / audit trail

- `js/features/accounting/audit-trail-service.js`: normalizzazione, aggregazione e salvataggio eventi audit applicativi.
- `js/features/accounting/audit-trail-module.js`: UI Analisi → Registro attività.
- `auditEvents`: collezione opzionale per eventi manuali registrati dall'utente.
- `DomainNormalizers.normalizeAuditEvent`: normalizzatore di compatibilità.
- `js/services/firebase-cloud.js` e `js/features/migration/migration-module.js`: backup/import/reset aggiornati.

## Moduli 0.4.2 - Workflow approvativi

- `js/features/accounting/workflow-service.js`: costruzione attività e registrazione eventi.
- `js/features/accounting/workflow-module.js`: UI Analisi → Workflow approvativi.
- `workflowEvents`: collezione opzionale per storico approvazioni.

## Versione 0.4.1 - Centro notifiche operativo

- `js/features/accounting/notification-center-service.js`: aggrega notifiche operative da scadenze, magazzino, lotti, DDT, ordini, riconciliazioni e QA contabile.
- `js/features/accounting/notification-center-module.js`: gestisce la sezione **Analisi → Centro notifiche**, riepiloghi, filtri, tabella e export CSV.
- `index.html`: aggiunge la voce di menu e la sezione `centro-notifiche`.
- `permissions-policy.js`: abilita la nuova sezione nei profili applicativi coerenti.



## Versione 0.4.0 - Stampe e PDF HTML avanzati

Nuovi moduli:

- `js/features/accounting/print-template-service.js`: genera HTML stampabili per estratto conto, partitario, fattura/nota credito, prima nota e solleciti.
- `js/features/accounting/print-center-module.js`: gestisce la sezione **Analisi → Stampe / PDF**, anteprima iframe, stampa browser e download HTML.

La release non introduce nuove collezioni Firestore e non richiede backend custom.
### Versione 0.3.2 - Prima nota / movimenti finanziari
La versione 0.3.2 introduce Contabilità → Prima nota: registro finanziario semplificato con movimenti automatici derivati da incassi/pagamenti, movimenti manuali di cassa/banca, saldi per conto ed export CSV. La nuova collezione opzionale `cashbookMovements` contiene solo i movimenti manuali.

### Versione 0.3.1 - Incassi e pagamenti evoluti
La versione 0.3.1 introduce la sezione Contabilità → Incassi e pagamenti, con registrazione movimenti cliente/fornitore, allocazione su più documenti, metodo, riferimento, data valuta e collezione opzionale paymentEvents. I dati legacy negli array payments restano compatibili e vengono letti da scadenzario e partitario.

### Versione 0.3.0 - Partitario clienti e fornitori

Nuovi moduli contabili derivati:

- `js/features/accounting/ledger-service.js`: costruisce movimenti dare/avere da fatture, note di credito, acquisti e pagamenti esistenti.
- `js/features/accounting/ledger-module.js`: renderizza la sezione Contabilità → Partitario, filtri, saldi, saldo progressivo ed export CSV.

Nessuna nuova collezione Firestore e nessun backend custom.

### Versione 0.2.6 - Ruoli e permessi
Introdotti controlli applicativi front-end per ruoli e permessi: Admin, Commerciale, Magazzino, Contabilità e Sola lettura. La persistenza resta in `settings/companyInfo.accessControl`, senza backend custom e senza nuove collezioni Firestore obbligatorie. Nota: i controlli sono didattici/UX e non sostituiscono regole Firestore di sicurezza.

## Moduli aggiunti in CDSDM 0.2.5

- `js/features/import/import-csv-module.js`: import massivi CSV con template, parser, anteprima, validazione e salvataggio batch Firestore.
- Sezione UI: `Impostazioni → Import massivi CSV`.
- Test: `tests/import-025-csv.test.html`.

### Versione 0.2.3 - Valorizzazione magazzino
La versione 0.2.3 evolve l'inventario valorizzato in una vista di valorizzazione magazzino con metodo selezionabile: prezzo anagrafico, ultimo costo da DDT fornitore e costo medio ponderato semplificato. I calcoli restano derivati dai dati esistenti (prodotti e DDT fornitore), senza nuove collezioni Firestore, senza backend custom e con fallback compatibile ai prezzi anagrafici.

## Versione 0.2.2 - Scadenzario evoluto clienti/fornitori
- Nuovo servizio `js/features/scadenziario/scadenziario-service.js` per calcolo scadenze, residui, stati e patch pagamento.
- `js/ui/scadenziario-render.js` mostra riepiloghi, filtri avanzati e colonne Importo/Pagato/Residuo.
- `js/features/scadenziario/scadenziario-module.js` gestisce export CSV esteso e registrazione incassi/pagamenti parziali.

## Versione 0.2.1 - Dashboard Direzionale
- `js/features/dashboard/executive-dashboard-service.js`: calcolo KPI direzionali derivati da dati esistenti.
- `js/ui/dashboard-render.js`: rendering Dashboard Direzionale con card KPI, andamento periodo, top clienti, DDT da fatturare e alert operativi.
- `tests/dashboard-021-executive.test.html`: test browser-based dei KPI e del rendering.

## Versione 0.2.0 - Release tecnica di coerenza

- `index.html` carica `js/app/invoice-xml-migration.js` prima di `js/app/app-bootstrap.js`.
- `index.html` include ora anche `document-cancellation-service.js`, `customer-returns-service.js` e `warehouse-reports-module.js`.
- Nessuna nuova collezione Firestore e nessuna modifica incompatibile ai normalizzatori.

# Mappa moduli — chi chiama cosa (v12.25)

Questa mappa descrive flusso, dipendenze e responsabilità principali.

- **UI unica**: `js/ui/ui-render.js`
- **Orchestratore** (nome storico): `js/app/invoice-xml-migration.js`

---

## 1) Boot e ciclo di vita

### 1.1 Ordine script (no bundler)
Ordine consigliato:
1. Core: `utils.js`, `form-helpers.js`
2. Services: `firebase-cloud.js`
3. UI: `ui-render.js`
4. Feature modules: auth, docs-content, navigation, dashboard, statistics, registri-iva, simulazione-ordinario, simulazione-lm, customers, products, suppliers, invoices, purchases, scadenziario, commesse, projects, timesheet, export-timesheet, notes, migration, usage.
5. App: `invoice-xml-migration.js`, `app-bootstrap.js`

### 1.2 `app-bootstrap.js`
- `$(document).ready()`
  - `initFirebase()`
  - `bindEventListeners()`

### 1.3 Orchestratore: `invoice-xml-migration.js`
`bindEventListeners()` chiama i `bind()` dei moduli (idempotenti):
- `auth`, `navigation`
- `registriIva`
- `customers`, `products`, `suppliers`
- `invoicesForm`, `invoicesList`, `invoicesXML`
- `company`, `dashboard`
- `ordinarioSim`, `lmSim`
- `scadenziario`, `notes`, `migration`, `usage`
- `commesse`, `projects`, `timesheet`, `exportTimesheet`
- `initPurchasesModule()`

---

## 2) Flusso principale: Auth → Dati → Render

### 2.1 Auth (`features/auth/auth-module.js`)
`auth.onAuthStateChanged(user)`:
- se loggato: `currentUser=user` → `loadAllDataFromCloud()` → `renderAll()` → `startInactivityWatch()`
- se non loggato: reset UI + `stopInactivityWatch()`

### 2.2 Data layer (`services/firebase-cloud.js` + `core/utils.js`)
- `globalData` contiene: `companyInfo`, `customers`, `products`, `suppliers`, `invoices`, `purchases`, `notes`
- helper principali:
  - `getData(key)` / `setData(key, value)`
  - `saveDataToCloud(collection, data)` / `deleteDataFromCloud(collection, id)`

---

## 3) UI (unica): `ui-render.js`

### 3.1 `renderAll()`
`renderAll()` ricalcola le pagine e richiama i render specifici.

Chiamate tipiche (con logica *conditional* per regime):
- `renderCompanyInfoForm()` + `updateCompanyUI()`
  - aggiorna **nome studio in sidebar** (Ragione Sociale)
  - show/hide voci menu in base a `companyInfo.taxRegime`
- `renderProductsTable()` / `renderCustomersTable()`
- `renderSuppliersTable()` *(solo ordinario)*
- `renderPurchasesTable()` *(solo ordinario, via purchases-module)*
- `renderInvoicesTable()`
- `populateDropdowns()` (popola select per anagrafiche e filtri)
- `renderCommesseTable()`, `renderProjectsTable()`, `renderTimesheetPage()`
- `renderStatisticsPage()`, `renderDashboardPage()`
- `renderStatisticsPage()`
- `renderRegistriIVAPage()` *(solo ordinario, su richiesta pagina)*
- `renderScadenziarioPage()`
- `renderHomePage()`

### 3.2 Regime fiscale gestionale
- **Ordinario**: abilita IVA/acquisti/fornitori/registri IVA
- **Forfettario**: nasconde acquisti/fornitori/registri IVA; IVA forzata a 0 in servizi e fatture

---

## 4) Moduli principali (responsabilità)

### `features/navigation/*`
- `docs-content.js`: bundle statico dei contenuti MD (manuale, changelog).
- `navigation-module.js`: sidebar collapsible, sezioni expand/collapse, persistenza stato, caricamento contenuti da bundle.

### `features/invoices/*`
- `invoices-form-module.js`: gestione form, righe documento, pagamenti, calcolo totali.
- `invoices-list-module.js`: elenco documenti, azioni (pagata/inviata).
- `invoices-xml-module.js`: export XML FatturaPA.
- `invoices-timesheet-import-module.js`: logica di importazione ore dai worklog collegati (in Forfettario può usare `customer.timesheetPrefix` per personalizzare il prefisso descrizione).

### `features/commesse/*`
- `commesse-module.js`, `projects-module.js`: gestione anagrafiche legate al lavoro.
- `timesheet-module.js`: inserimento e gestione worklog (Minutes vs FinalMinutes).
- `export-timesheet-module.js`: generazione CSV con raggruppamenti e pivot.

### `features/dashboard/dashboard-module.js`
- Calcolo KPI in tempo reale e rendering grafici/tabelle riepilogative.

### `features/purchases/purchases-module.js` (solo ordinario)
- CRUD acquisti + tooltips azioni

### `features/scadenziario/scadenziario-module.js`
- filtri + azioni (spunte) con tooltips

### `features/tax/*`
- `forfettario-calc.js`: simulazione Quadro LM (didattica)
- `ordinario-calc.js` + `ordinario-sim-module.js`: simulazione redditi ordinario (RE/RN/RR; saldo/acconti)

---

## 5) Convenzioni

- `bind()` idempotente in ogni modulo
- dopo operazioni CRUD: `saveDataToCloud(...)` → `renderAll()`

## Versione 0.0.37 - Documenti collegati
- `js/features/warehouse/document-links-service.js`: servizio consultivo per ricostruire relazioni tra preventivi, ordini, DDT, fatture, timesheet e movimenti.
- Integrazioni dettaglio: `customer-quotes-module.js`, `quotes-module.js`, `customer-orders-module.js`, `customer-ddts-module.js`, `supplier-orders-module.js`, `supplier-ddts-module.js`, `invoices-list-module.js`.

## Versione 0.1.1 - Fattura riepilogativa avanzata
- `js/features/warehouse/ddt-to-invoice-service.js`: opzioni riepilogo, aggregazione prodotti uguali, nota automatica DDT.
- `js/features/warehouse/customer-ddt-invoicing-module.js`: lettura opzioni UI e anteprima coerente.
- `js/features/invoices/invoice-service.js`: persistenza `summaryOptions` e `summaryNote` in `sourceCustomerDDT`.
- `js/features/invoices/invoice-xml-mapper.js`: causale riepilogativa e blocchi `DatiDDT` XML.

### Versione 0.1.2 - Stabilizzazione e QA

- Introdotti controlli di coerenza non distruttivi su magazzino e collegamenti documentali.

### Versione 0.1.3 - Annullamenti e rettifiche documentali

- Introdotto servizio per annullamento controllato e rettifiche operative di magazzino.

### Versione 0.1.4 - Resi cliente e note di credito collegate

- Introdotto servizio applicativo per resi cliente, rientro merce e bozza nota di credito collegata.

### Versione 0.1.5 - Reportistica gestionale

- Aggiunta pagina Analisi → Report gestionali con indicatori sintetici e tabelle operative.

## Versione 0.1.6 - Consolidamento tecnico e UX

- `index.html`: pulizia duplicati DOM, rimozione sezioni duplicate Manuale/Versione, riallineamento Report gestionali fuori dalla sidebar.
- `css/style.css`: regole conservative aggiuntive per Dark Mode su card, modali, dropdown, tabelle, input e testi secondari.
- `js/features/warehouse/warehouse-qa-service.js`: audit esteso per inventario, collegamenti documentali, residui ordine e navigazione DOM.
- `tests/warehouse-step22-qa.test.html`: test esteso per scostamenti inventariali, residui ordini e target menu mancanti.


## Moduli 0.2.3

- `js/features/warehouse/inventory-valuation-service.js`: servizio di valorizzazione magazzino con prezzo anagrafico, ultimo costo DDT fornitore e costo medio ponderato semplificato.
- `js/features/warehouse/warehouse-module.js`: UI inventario aggiornata con metodo di valorizzazione, origine costo, filtri fallback ed export CSV esteso.


## 0.2.4 - Lotti / matricole / scadenze

- `js/features/warehouse/warehouse-lots-service.js`: normalizzazione vista, riepiloghi e validazione lotti/matricole/scadenze.
- `warehouseLots`: collezione Firestore opzionale per registro lotti manuale/didattico.
- `products.trackingMode`: campo opzionale per attivare tracciabilità su prodotto fisico.

## Contabilità 0.3.3 — Estratto conto

- `js/features/accounting/account-statement-service.js`: saldo iniziale, movimenti di periodo e saldo finale da `LedgerService`.
- `js/features/accounting/account-statement-module.js`: UI Contabilità → Estratto conto, export CSV e stampa HTML.

## 0.3.6 - Riconciliazione pagamenti
- `js/features/accounting/bank-reconciliation-service.js`: parser CSV banca, normalizzazione movimenti, scoring e proposte di matching.
- `js/features/accounting/bank-reconciliation-module.js`: UI Contabilità → Riconciliazione banca, conferma manuale ed export esito.
- Collezione opzionale: `bankReconciliationEvents`.

## 0.3.7 - Consolidamento QA e coerenza contabile

- `js/features/accounting/accounting-consistency-service.js`
  - controlli diagnostici su `paymentEvents`, pagamenti legacy, allocazioni, prima nota automatica e riconciliazioni.
  - nessuna persistenza e nessuna nuova collezione Firestore.
- `tests/accounting-consistency-037.test.html`
  - suite browser-based per dataset coerente e dataset incoerente.

## 0.4.4 - Consolidamento UX e accessibilità

- `js/ui/accessibility-ux-service.js`: applica migliorie runtime e produce controlli consultivi su DOM, label, menu e ID.
- `js/ui/accessibility-ux-module.js`: renderizza la vista **Analisi → UX / accessibilità** ed esporta CSV.
- `css/style.css`: skip link, focus visibile, preferenze reduced motion e forced colors.

## 0.4.5 - Bilancino gestionale

- `js/features/accounting/mini-balance-service.js`: calcolo bilancino gestionale semplificato.
- `js/features/accounting/mini-balance-module.js`: UI Contabilità → Bilancino, filtri, riepiloghi ed export CSV.
- `DOCUMENTAZIONE/29_BILANCINO_GESTIONALE.md`: documentazione dedicata.
- `tests/mini-balance-045.test.html`: test browser-based.


## 0.4.6 - Correzione accessibilità form e pulsanti

### File aggiornati

- `js/ui/accessibility-ux-service.js`
- `js/ui/accessibility-ux-module.js`
- `tests/ux-accessibility-046.test.html`

### Descrizione

La release aggiunge auto-label runtime per campi form e pulsanti legacy/dinamici, riducendo i warning della vista **Analisi → UX / accessibilità** senza introdurre nuove collezioni Firestore.

## 0.4.7 - Dark Mode form e combo

### File aggiornati

- `css/style.css`: regole Dark Mode dedicate per `select`, `.form-select`, `option`, `option:disabled`, `optgroup` e campi data/ora.
- `js/ui/accessibility-ux-service.js`: controllo consultivo `dark-mode-select-contrast` nella vista UX/accessibilità.
- `js/ui/accessibility-ux-module.js`: testo e export aggiornati alla release 0.4.7.
- `tests/dark-mode-047-form-controls.test.html`: test browser-based su regole CSS e controllo UX.

### Descrizione

La release migliora contrasto e leggibilità delle combo native in Dark Mode, riducendo i casi di menu aperto con sfondo chiaro e opzioni poco leggibili. Non introduce nuove collezioni Firestore né modifiche ai dati applicativi.

## 0.4.8 - Correzione select dinamiche soggetti

- `js/features/accounting/payment-events-module.js`: popolamento soggetti clienti/fornitori anche quando la select contiene solo il placeholder.
- `js/features/accounting/ledger-module.js`: consolidamento filtro soggetto.
- `js/features/accounting/account-statement-module.js`: consolidamento filtro soggetto.
- `js/features/accounting/print-center-module.js`: consolidamento soggetti e documenti nel centro stampe.
- `js/ui/accessibility-ux-service.js`: controllo consultivo sulle select dinamiche critiche.
- `tests/dynamic-selects-048.test.html`: test di regressione sul problema.
