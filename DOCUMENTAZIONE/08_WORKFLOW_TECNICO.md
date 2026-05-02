## Aggiornamento 0.7.5 - Pacchetto stabile per uso in classe, collaudo finale e checklist docente

Chiusura ramo 0.7.x e checklist finale.

## Aggiornamento 0.7.4 - Dataset demo, scenari didattici e casi d’uso guidati

Dataset statico in data/ senza import automatico.

## Aggiornamento 0.7.3 - Miglioramento UX, testi di aiuto, onboarding e messaggi di errore

Aiuti runtime non distruttivi sul DOM.

## Aggiornamento 0.7.2 - Manuale d’uso completo e guida didattica docente/studente

Release documentale senza nuove collezioni.

## Aggiornamento 0.7.1 - QA funzionale end-to-end e correzione regressioni operative

Aggiunto servizio QA non distruttivo.

## Aggiornamento 0.7.0 - Consolidamento tecnico generale

La release 0.7.0 consolida il ramo 0.6.x senza introdurre nuove funzioni gestionali. Gli interventi principali sono statici e conservativi:

- allineamento `globalData`, `AppStore`, `DomainConstants.DATA_COLLECTIONS`, backup/import/reset e documentazione sulle collezioni reali;
- rimozione del modulo legacy `customer-quotes-module.js`, non caricato in `index.html` e non coerente con la collezione ufficiale `quotes`;
- aggiornamento export JSON a `appVersion: 0.7.0`;
- nuova suite browser `tests/consolidamento-070.test.html`;
- nuovo report `REPORT_INCOERENZE_0.7.0.md`.

La persistenza resta invariata: `users/{uid}` per dati legacy e `businessGroups/{groupId}` per dati condivisi. Non sono richiesti backend custom o Cloud Functions.

---

## Aggiornamento 0.6.6 - Audit sicurezza e QA accessi

La release 0.6.6 aggiunge `SecurityAuditService` e `security-audit-module.js`. La sezione **Impostazioni → Audit sicurezza** produce report diagnostici su membri, inviti, profili, override e `effectiveProfilePermissions`, con salvataggio opzionale in `businessGroups/{groupId}/securityAccessReports`.

La checklist include un punto manuale sulla pubblicazione delle regole Firestore, perché una SPA front-end non può verificare autonomamente se `firestore.rules` sia stato distribuito nel progetto Firebase.

## Aggiornamento 0.6.5 - Rules rafforzate

Le regole Firestore mappano le collection operative su scope applicativi e leggono `businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions`. Se il campo non è presente, resta attivo il fallback a ruolo per compatibilità. Le eliminazioni sono più restrittive e richiedono livello `admin` sullo scope o ruolo admin/teacher.

## Aggiornamento 0.6.4 - Override permessi utente

La release 0.6.4 aggiunge `PermissionOverridesService` e `permission-overrides-module.js`. Gli override sono salvati sui documenti `members/{uid}` e `users/{uid}/memberships/{groupId}` come campi `permissionOverrides` ed `effectiveProfilePermissions`, così la `PermissionsPolicy` può applicarli senza query aggiuntive.

Ordine di valutazione: ruolo base → profilo permesso → override utente.

## Aggiornamento 0.6.3 - Matrice permessi moduli

La release 0.6.3 aggiunge `PermissionMatrixService`, `permission-matrix-module.js` e la collezione `businessGroups/{groupId}/permissionMatrices/moduleMatrix`. La matrice formalizza catalogo moduli, target menu e modello azioni per i livelli `none/read/write/admin`.

## Aggiornamento 0.6.2 - Profili permesso configurabili

La persistenza include `businessGroups/{groupId}/permissionProfiles/{profileId}`. L'assegnazione profilo viene denormalizzata su `members/{uid}` e `users/{uid}/memberships/{groupId}` per consentire alla `PermissionsPolicy` di lavorare in modo sincrono lato UI.

## Aggiornamento 0.6.1 - Inviti avanzati e onboarding

La release 0.6.1 estende `BusinessGroupsService` con inviti a stato esplicito, scadenza, revoca, rigenerazione codice e consolidamento degli scaduti. La creazione invito salva `expiresAt` come timestamp quando possibile e `expiresAtIso` per compatibilità UI/export.

La registrazione con invito resta client-side: l’account Firebase Auth viene creato dal collaboratore e l’accettazione invito crea `members/{uid}` e `users/{uid}/memberships/{groupId}`. Se l’accettazione fallisce subito dopo la creazione account, il client tenta `user.delete()` per pulire l’account appena creato.


## Aggiornamento 0.6.0 - Superadmin e registrazione con invito

La release 0.6.0 introduce un flusso di gestione utenti senza backend custom: il primo amministratore inizializza `appSettings/system`, mentre i collaboratori usano **Registrati con invito** per creare il proprio account Firebase Auth e accettare una membership di gruppo.

Nuove entità:

```text
appSettings/system
userProfiles/{uid}
```

Il superadmin globale è riconosciuto dalle regole Firestore e può supervisionare i gruppi. L'accettazione invito resta email-based e richiede corrispondenza tra email Firebase Auth e email salvata nell'invito.


## Aggiornamento 0.5.6 - Migrazione guidata e QA multiutente

La release 0.5.6 consolida i Gruppi aziendali con una sezione dedicata a confronto dati legacy/gruppo, copia prudente, report diagnostici e piano QA multiutente. La nuova collezione `migrationReports` salva report didattici sotto `businessGroups/{groupId}`.



## Aggiornamento 0.5.5 - Console docente

La release 0.5.5 introduce **Impostazioni → Console docente** per scenari didattici e simulazioni di gruppo sui Gruppi aziendali. Le nuove collezioni `teachingScenarios` e `simulationEvents` sono salvate sotto `businessGroups/{groupId}` e sono protette dalle regole Firestore dedicate.

## Versione 0.5.4 - Scritture sicure e concorrenza

La persistenza comune passa da scritture dirette a funzioni transazionali tramite `js/core/concurrency-service.js`. Il servizio aggiunge metadata di audit, `docVersion`, supporto a `_expectedDocVersion`, lock leggero e idempotenza opzionale. I moduli nuovi dovrebbero usare `saveDataToCloud`, `batchSaveDataToCloud` e `deleteDataFromCloud` invece di scrivere direttamente su Firestore.

---

## Release 0.4.2 - Workflow approvativi leggeri

La release introduce `js/features/accounting/workflow-service.js` e `js/features/accounting/workflow-module.js`. Il servizio costruisce attività approvative derivate dai dati esistenti e registra eventi manuali in `workflowEvents`. Le azioni aggiornano anche il documento sorgente con `workflowStatus`/`approvalStatus`, mantenendo compatibilità con documenti legacy.

### Versione 0.3.3 - Estratto conto cliente/fornitore
La versione 0.3.3 introduce Contabilità → Estratto conto: saldo iniziale, movimenti di periodo, saldo progressivo, saldo finale, export CSV e stampa HTML. Non introduce nuove collezioni Firestore.

### Versione 0.3.2 - Prima nota / movimenti finanziari
La versione 0.3.2 introduce Contabilità → Prima nota: registro finanziario semplificato con movimenti automatici derivati da incassi/pagamenti, movimenti manuali di cassa/banca, saldi per conto ed export CSV. La nuova collezione opzionale `cashbookMovements` contiene solo i movimenti manuali.

### Versione 0.3.1 - Incassi e pagamenti evoluti
La versione 0.3.1 introduce la sezione Contabilità → Incassi e pagamenti, con registrazione movimenti cliente/fornitore, allocazione su più documenti, metodo, riferimento, data valuta e collezione opzionale paymentEvents. I dati legacy negli array payments restano compatibili e vengono letti da scadenzario e partitario.

### Versione 0.3.0 - Partitario clienti e fornitori
La versione 0.3.0 apre il ramo contabile/economico 0.3.x introducendo il partitario clienti e fornitori come vista derivata. La nuova funzione legge fatture, note di credito, acquisti e pagamenti già presenti nei documenti, calcolando dare/avere, saldo progressivo e saldo per soggetto senza nuove collezioni Firestore e senza backend custom.

### Versione 0.2.6 - Ruoli e permessi
Introdotti controlli applicativi front-end per ruoli e permessi: Admin, Commerciale, Magazzino, Contabilità e Sola lettura. La persistenza resta in `settings/companyInfo.accessControl`, senza backend custom e senza nuove collezioni Firestore obbligatorie. Nota: i controlli sono didattici/UX e non sostituiscono regole Firestore di sicurezza.

## Note tecniche 0.2.5 - Import massivi CSV

La release aggiunge `js/features/import/import-csv-module.js` e collega il modulo all’orchestratore SPA. L’import usa `batchSaveDataToCloud`, normalizzatori di dominio dove disponibili e non introduce backend custom né dipendenze XLSX.

### Versione 0.2.4 - Note tecniche
La tracciabilità usa campi opzionali sui prodotti e la collezione opzionale `warehouseLots`. I normalizzatori garantiscono fallback legacy: prodotti senza tracciabilità esplicita vengono trattati come `trackingMode = none`.

### Versione 0.2.3 - Valorizzazione magazzino
La versione 0.2.3 evolve l'inventario valorizzato in una vista di valorizzazione magazzino con metodo selezionabile: prezzo anagrafico, ultimo costo da DDT fornitore e costo medio ponderato semplificato. I calcoli restano derivati dai dati esistenti (prodotti e DDT fornitore), senza nuove collezioni Firestore, senza backend custom e con fallback compatibile ai prezzi anagrafici.

### Versione 0.2.2 - Scadenzario evoluto clienti/fornitori
La versione 0.2.2 evolve lo scadenzario in una vista operativa clienti/fornitori: filtri per tipo, stato e soggetto, riepiloghi da incassare/da pagare, gestione importi parziali e residui, registrazione incassi/pagamenti su array `payments` interni ai documenti esistenti. Non introduce nuove collezioni Firestore né backend custom.

### Versione 0.2.1 - Dashboard Direzionale
Introdotta la Dashboard Direzionale con KPI derivati dagli archivi esistenti, senza nuove collezioni Firestore e senza backend custom.


### Versione 0.2.0 - Release tecnica di coerenza
Prima di nuove evoluzioni funzionali, la 0.2.0 riallinea il wiring tecnico della SPA: `invoice-xml-migration.js` deve essere caricato prima di `app-bootstrap.js`, perché espone `window.bindEventListeners`; i moduli applicativi già presenti in `js/features/warehouse` devono essere inclusi in `index.html` per rendere operative le funzioni dichiarate. Ogni futura release 0.2.x deve continuare ad aggiornare versione, README, changelog, manuale, workflow tecnico, documentazione in-app e test browser-based.

# 8. Workflow tecnico (sviluppo/manutenzione)

Questa guida è per chi modifica il progetto.

## 8.1 Avvio in locale
Essendo una single page app con Firebase, è consigliato servirla via HTTP.

Opzioni semplici:
- VS Code: estensione **Live Server**
- Python: `python -m http.server 8080`

Apri poi `http://localhost:8080`.

## 8.2 Struttura moduli
- `index.html`: layout e sezioni (`div.content-section`) con `id` uguale al `data-target` del menu.
- `js/services/firebase-cloud.js`: init Firebase + CRUD su Firestore.
- `js/ui/ui-render.js`: orchestratore UI di alto livello.
- `js/ui/*-render.js`: moduli di rendering per area (company, dashboard, scadenziario, tax, masterdata, analysis).
- `js/features/*`: moduli funzionali; ciascuno espone `bind()` idempotente.
- `js/app/invoice-xml-migration.js`: orchestratore che chiama i `bind()` dei moduli.

## 8.3 Convenzioni importanti
### `globalData` come store in memoria
I dati caricati dal cloud finiscono in `globalData` (vedi `utils.js` e `firebase-cloud.js`).

### `bind()` idempotente
Ogni modulo feature deve:
- controllare una flag `_bound`
- registrare eventi una sola volta

### Refresh UI
Pattern tipico dopo una modifica dati:
1) aggiornare cloud (`saveDataToCloud` / `batchSaveDataToCloud` / delete)
2) ricaricare dati (`loadAllDataFromCloud`) se necessario
3) ridisegnare (`renderAll` oppure render specifici)

## 8.4 Aggiungere una nuova funzione (approccio “sicuro”)
1) Creare un nuovo file modulo in `js/features/<area>/...`.
2) Esportare `window.AppModules.<nome>.bind = bind;`.
3) Includere il file nello script loader (di solito in `index.html` o nel bootstrap, a seconda della versione).
4) Chiamare il `bind()` dall’orchestratore (`invoice-xml-migration.js`).
5) Evitare di toccare `ui-render.js` se non necessario.

## 8.5 Firestore: collezioni e batch
- Batch Firestore: limite 500 operazioni; nel progetto si usa ~450 come margine.
- Collezioni per utente: `users/{uid}/<collection>`
- Settings: `users/{uid}/settings/*`

## 8.6 Backup/Import: note per manutenzione
- Il backup JSON include tutte le collezioni principali + `companyInfo`.
- L’import “merge” aggiorna per ID e non cancella record extra.
- Il “ripristino totale” esegue prima reset completo (incl. `settings/*`) e poi importa.

## 8.7 Firebase corrente e modifica progetto
La versione **CDSDM 0.2.0** punta al progetto Firebase `cdsdm-b6e8b`, usa Firebase Authentication anche per il reset password via email e include la Fase 0 anagrafica voci/IVA con navigazione **Servizi / Prodotti**, filtro per tipo voce e **Tabella IVA**, **Codici pagamento FE** e **Banche aziendali** in Impostazioni, più magazzino base, movimenti tracciati e inventario valorizzato operativo sui prodotti fisici e ordini cliente/fornitore preparatori ai DDT.

La configurazione si trova in `js/services/firebase-cloud.js`, dentro `firebaseConfig`. Il progetto usa gli SDK Firebase **compat** già caricati da `index.html`, quindi non va incollato il blocco modulare con `import { initializeApp } from "firebase/app"`.

Per spostare l'app su un altro progetto Firebase aggiorna solo i campi di `firebaseConfig` e poi verifica nella Firebase Console:
- Authentication provider **Email/Password** abilitato;
- domini autorizzati per l'hosting usato;
- Firestore Database creato;
- regole Firestore con accesso limitato a `users/{uid}`.



## Magazzino - step 1

Il modulo `js/features/warehouse/warehouse-module.js` renderizza viste derivate dai prodotti di tipo `product`. In questa fase non esiste ancora una collezione movimenti: le quantità sono campi anagrafici normalizzati dal dominio prodotto. Il motore `warehouseMovements` sarà introdotto nello step successivo.


## Step 4 - Ordini cliente

La sezione **Vendite → Elenco Ordini cliente** permette di registrare ordini con cliente, numero, data, data consegna prevista, stato e righe prodotto. Le righe salvano quantità ordinata, quantità evasa/residua e prezzo vendita. In questa fase gli ordini sono preparatori: non scaricano ancora il magazzino e saranno usati dai futuri DDT cliente da ordine.


## Magazzino - step 5

Lo step 5 introduce `supplierOrders` come collezione preparatoria per DDT fornitore e ricevimento merci. Gli ordini non generano movimenti; le quantità ricevute saranno aggiornate quando verranno implementati i DDT fornitore con accettato/quarantena/respinto.


## Magazzino - step 6

Lo step 6 introduce `supplierDDTs` e il modulo `js/features/warehouse/supplier-ddts-module.js`. Il DDT fornitore può partire da `supplierOrders` o essere diretto. Il salvataggio genera movimenti `CARICO` per accettato e `QUARANTENA_IN` per riserva/quarantena, aggiornando i prodotti e, se presente, l'ordine fornitore collegato.


## Magazzino - step 7 / Step 13 - Quarantena avanzata

Il modulo `warehouse-module.js` renderizza `Magazzino → Quarantena` e consente sblocco, scarto/macero o reso fornitore delle quantità in quarantena. Le azioni aggiornano i campi `stockQty` / `quarantineQty` del prodotto e generano movimenti `QUARANTENA_OUT`, `SCARTO` o `RESO_FORNITORE` nella collezione `warehouseMovements`.

Con lo Step 13, l'azione `return_supplier` richiede il fornitore e invoca `SupplierDDTService.createReturnDDTFromQuarantine()`: viene creato un documento in `supplierDDTs` con `ddtDirection: return_supplier`, righe con `returnQty` e collegamento al movimento di quarantena. `DDTPrintService` supporta il tipo `supplier_return` per stampa/PDF del reso. Gli scarti/maceri restano movimenti `SCARTO` e alimentano la sezione autonoma **Magazzino → Prodotti macerati**.


## Vendite → DDT cliente

La sezione **Vendite → DDT cliente** consente di registrare una consegna merce diretta, collegata a un singolo ordine cliente o collegata a più ordini cliente dello stesso cliente. Le righe salvano prodotto, quantità consegnata, prezzo vendita e riferimenti sorgente (`sourceOrderId`, `sourceOrderLineIndex`) quando derivano da ordine. Al salvataggio il sistema controlla la giacenza disponibile, crea movimenti `SCARICO` in `warehouseMovements` e riduce `stockQty` del prodotto.

Se il DDT deriva da uno o più ordini cliente, ogni ordine sorgente viene aggiornato con quantità evasa/residua e stato `partially_fulfilled` o `fulfilled`. Il DDT conserva `sourceOrderIds`, `sourceOrderNumbers` e `sourceDocuments`; il normalizzatore `normalizeCustomerDDT` conserva anche il tipo origine `customer_orders`.


### Versione 0.0.18 - Step 9 Magazzino: stampa/PDF DDT
- Aggiunto layout stampabile per DDT cliente e DDT fornitore.
- Aggiunti pulsanti Stampa / PDF negli elenchi e nei dettagli DDT.
- Il PDF viene prodotto tramite dialogo di stampa del browser, senza backend e senza librerie esterne.
- Nessun impatto su giacenze, movimenti, ordini, fatture o XML.


## Step 10 Magazzino: aggiornamento prezzi da documenti

Il servizio `WarehousePriceUpdateService` confronta i prezzi presenti nei DDT con i prezzi anagrafici del prodotto. Se il valore è diverso propone una lista di aggiornamenti, salvando su `products` il nuovo `purchasePrice` o `salePrice` e i metadati di origine. L'operazione è manuale e confermata dall'utente; non modifica retroattivamente i documenti.


## Magazzino - Step 11 - DDT cliente → fattura

Il modulo `js/features/warehouse/ddt-to-invoice-service.js` traduce un DDT cliente in righe fattura e valorizza `sourceCustomerDDT`. `InvoiceService` conserva i riferimenti sorgente nel payload; `InvoicePersistenceService` marca i DDT cliente come collegati alla fattura al salvataggio non in bozza. La fattura non genera movimenti di magazzino aggiuntivi.


## Magazzino - step 12B UX

Lo step 12B non aggiunge collezioni né nuove macro-funzioni. Interviene su `index.html`, `css/style.css` e sui moduli `js/features/warehouse/*` per uniformare navigazione, testi, badge stato, gruppi pulsanti ed empty state. Le logiche dati, movimenti, DDT e fatturazione restano invariate.

## Step 12C - Menu per aree operative

La navigazione è stata riorganizzata senza cambiare ID delle `content-section` e senza modificare collezioni Firestore o servizi dati. `Elenco Ordini cliente` e `DDT cliente` sono raggiungibili da **Vendite**; `Elenco Ordini fornitore` e `DDT fornitore` da **Acquisti**. **Magazzino** resta dedicato a giacenze, inventario, movimenti e quarantena. La voce **Preventivi** è un placeholder operativo senza persistenza, utile a preparare una futura funzione dedicata.

## Versione 0.0.32 - UX menu documentale
Gli elenchi `preventivi`, `ordini-cliente` e `ordini-fornitore` restano content-section dedicate alla consultazione. Le voci menu `menu-nuovo-preventivo-cliente`, `menu-nuovo-ordine-cliente` e `menu-nuovo-ordine-fornitore` non introducono nuove sezioni né nuove collezioni: intercettano il click e aprono le modali esistenti (`quoteModal`, `customerOrderModal`, `supplierOrderModal`) dopo il reset del form. Questo mantiene invariati normalizzatori, salvataggio Firestore e compatibilità con conversione preventivo → ordine e DDT.

## Preventivi e conversione in ordine
I preventivi sono salvati nella collezione `quotes`. Il normalizzatore `normalizeQuote` conserva righe, stato e metadati di conversione. La conversione genera un record in `customerOrders` con `sourceQuoteId` e `sourceQuoteNumber`, poi marca il preventivo come `converted`. Non vengono creati movimenti di magazzino in questa fase.


## Versione 0.0.26 - Area Contabilità
- introdotta la sezione menu `Contabilità` per ospitare `Scadenziario` e `Registri IVA`.
- lo spostamento è solo UX/menu: gli ID pagina `scadenziario` e `registri-iva`, i render e i calcoli restano invariati.
- nessuna modifica a Firestore, normalizzatori, fatture, acquisti, DDT o movimenti magazzino.

## Versione 0.0.25 - Elenchi ordini
La modifica è solo UI/UX: le sezioni ordini mantengono gli stessi ID (`ordini-cliente`, `ordini-fornitore`) e le stesse collezioni (`customerOrders`, `supplierOrders`). Sono stati aggiunti riepiloghi e filtri stato in pagina, senza cambiare normalizzatori, DDT o persistenza.


## Versione 0.0.31 - Inventario fisico e consultazione giacenza

La funzione è integrata in `js/features/warehouse/warehouse-module.js` senza backend applicativo custom.

- `Magazzino → Giacenza prodotto` è una vista derivata da `products` e non persiste dati.
- `Magazzino → Inventario fisico` legge i prodotti fisici normalizzati, conserva i conteggi nella collezione utente `warehousePhysicalCounts` con documento `current`, e calcola la differenza in tempo reale.
- L'allineamento usa `saveDataToCloud('products', ...)` per aggiornare `stockQty` / `giacenzaDisponibile` e crea un movimento `warehouseMovements` di tipo `RETTIFICA` per ogni prodotto rettificato.
- La quarantena (`quarantineQty` / `giacenzaQuarantena`) resta invariata: la funzione lavora solo sulla giacenza disponibile contata fisicamente.
- `js/services/firebase-cloud.js` carica anche la collezione `warehousePhysicalCounts`; `AppStore` espone lo stesso array per il rendering incrementale.


## Versione 0.0.33 - Fatturazione DDT cliente multipli

La pagina `fatturazione-ddt-cliente` è gestita da `js/features/warehouse/customer-ddt-invoicing-module.js`. Il modulo legge `customerDDTs`, `customers` e `products` dallo store in memoria, mostra solo DDT cliente non fatturati e delega la validazione e la costruzione righe a `DDTToInvoiceService`.

`DDTToInvoiceService.startInvoiceFromCustomerDDTs()` valorizza `App.invoices.sourceCustomerDDT` con tipo `customer_ddt_summary`, array di documenti sorgente, ID, numeri e date; `InvoiceService.buildInvoicePayload()` conserva questi metadati nel payload fattura. `InvoicePersistenceService.markCustomerDDTsAsInvoiced()` aggiorna tutti i DDT collegati quando la fattura è salvata come definitiva; `unmarkCustomerDDTsFromInvoice()` li sblocca se una fattura eliminabile viene cancellata.


## Versione 0.0.34 - DDT cliente da ordini multipli

Il modulo `js/features/warehouse/customer-ddts-module.js` supporta tre origini operative: `direct`, `customer_order` e `customer_orders`. La modalità multi-ordine mostra un pannello di selezione degli ordini aperti/parzialmente evasi dello stesso cliente, costruisce le righe DDT dai residui e permette di ridurre la quantità consegnata senza superare il residuo origine.

Al salvataggio:
- il DDT viene salvato in `customerDDTs` con riferimenti multipli;
- i prodotti vengono aggiornati una sola volta per prodotto aggregato;
- i movimenti `SCARICO` riportano `documentType: customer_ddt` e `sourceOrderIds`;
- ogni ordine sorgente viene aggiornato con `fulfilledQty`, `remainingQty` e stato coerente.


## Versione 0.1.1 - DDT fornitore da ordini multipli
La sezione **Acquisti → DDT fornitore** consente ora di registrare un DDT ricevuto anche accorpando più ordini fornitore dello stesso fornitore. Il DDT salva `sourceOrderIds`, `sourceOrderNumbers`, `sourceDocuments` e, sulle righe, `sourceOrderId` / `sourceOrderLineIndex`.

Al salvataggio il sistema valida che ogni quantità ricevuta non superi il residuo dell'ordine sorgente, richiede che ricevuta = accettata + quarantena + respinta, aggiorna disponibile/quarantena dei prodotti, crea movimenti `CARICO` e `QUARANTENA_IN` aggregati per prodotto e aggiorna ogni ordine fornitore a `partially_received` o `received`.


### Versione 0.0.36 - Stati, blocchi e rollback documentali
La versione introduce un controllo centralizzato degli stati documentali. Gli elenchi continuano a mostrare lo stato operativo dei documenti, ma alcune azioni distruttive vengono bloccate quando esistono documenti collegati: un ordine cliente con DDT non può essere eliminato, un ordine fornitore con DDT ricevuto non può essere eliminato e un DDT cliente già fatturato non può generare una seconda fattura.

L'eliminazione di una fattura non pagata e non inviata resta possibile solo con conferma. Quando la fattura è collegata a record Timesheet o DDT cliente, il sistema avvisa l'utente e sblocca i riferimenti collegati per consentire una nuova fatturazione controllata.

### Versione 0.1.1 - DocumentLinksService
Il servizio `DocumentLinksService` centralizza la ricostruzione consultiva dei collegamenti documentali. Non persiste nuovi dati: legge le collezioni già presenti e usa campi esistenti come `sourceQuoteId`, `sourceOrderIds`, `sourceDocuments`, `sourceCustomerDDTIds`, `invoiceId`, `documentType` e `documentId`.

Punti di integrazione UI:

- dettagli preventivi cliente;
- dettagli ordini cliente e fornitore;
- dettagli DDT cliente e DDT fornitore;
- dettaglio fattura.

La scheda è volutamente non operativa: serve a controllo, audit didattico e navigazione concettuale del ciclo documentale.


### Versione 0.1.1 - Fattura riepilogativa avanzata / XML DatiDDT
`DDTToInvoiceService` accetta ora opzioni di riepilogo (`summaryOptions`) per decidere se mantenere righe separate per DDT o aggregarle per prodotto/prezzo/IVA. Le opzioni e la nota generata vengono conservate in `sourceCustomerDDT`, così il payload fattura mantiene il legame documentale e l'XML può generare i blocchi `DatiDDT`.

`InvoiceXMLMapper` legge `sourceCustomerDDT.documents` e, salvo disattivazione esplicita, produce un blocco `DatiDDT` per ogni DDT con numero e data. La nota riepilogativa viene emessa come `Causale` del documento.

### Versione 0.1.2 - Stabilizzazione e QA

- Introdotti controlli di coerenza non distruttivi su magazzino e collegamenti documentali.

### Versione 0.1.3 - Annullamenti e rettifiche documentali

- Introdotto servizio per annullamento controllato e rettifiche operative di magazzino.

### Versione 0.1.4 - Resi cliente e note di credito collegate

- Introdotto servizio applicativo per resi cliente, rientro merce e bozza nota di credito collegata.

### Versione 0.1.5 - Reportistica gestionale

- Aggiunta pagina Analisi → Report gestionali con indicatori sintetici e tabelle operative.

### Versione 0.1.6 - Consolidamento tecnico e UX
Prima di aprire nuove evoluzioni 0.2.x è stata inserita una release di consolidamento. La verifica consigliata per sviluppi successivi è:

1. controllare duplicati `id` in `index.html`;
2. controllare che ogni `data-target` del menu abbia una sezione contenuto corrispondente;
3. verificare che nessuna `.content-section` sia annidata nella sidebar;
4. eseguire il test `tests/warehouse-step22-qa.test.html`;
5. controllare la leggibilità Dark Mode su modali, tabelle, form e report.

`WarehouseQAService.runFullAudit()` espone ora anche `navigation`, `residuals`, `issueCount` e `version`, oltre agli audit già presenti su inventario e collegamenti documentali.

## Note tecniche 0.2.2 - Scadenzario evoluto

Lo scadenzario 0.2.2 resta una vista derivata dai dati esistenti. La registrazione di acconti e saldi non usa una nuova collezione Firestore: aggiorna il documento sorgente (`invoices` o `purchases`) con un array `payments` e campi di compatibilità. I normalizzatori legacy continuano ad accettare documenti senza tali campi; in assenza di pagamenti espliciti il residuo coincide con il totale documento.

Ogni evoluzione futura dello scadenzario deve preservare la retrocompatibilità con documenti che hanno solo `status: Pagata`/`Da Pagare` e nessun array `payments`.


## Note tecniche 0.2.3 - Valorizzazione magazzino

La release introduce `InventoryValuationService`, caricato prima di `warehouse-module.js`. Il servizio costruisce un indice dei costi a partire da `supplierDDTs.lines` e calcola righe e riepiloghi di valorizzazione senza salvare nuove entità.

Metodi supportati:

- `standard`: prezzo acquisto anagrafico del prodotto.
- `last`: ultimo costo rilevato da DDT fornitore ricevuto, con fallback anagrafico.
- `average`: costo medio ponderato semplificato da quantità ricevute/accettate/in quarantena, con fallback anagrafico.

La compatibilità con i dati esistenti è mantenuta perché i prodotti senza DDT fornitore continuano a essere valorizzati con il prezzo anagrafico.

## Note tecniche 0.3.3 — Estratto conto

La release 0.3.3 aggiunge `js/features/accounting/account-statement-service.js` e `js/features/accounting/account-statement-module.js`. Il servizio riusa il `LedgerService`, calcola il saldo iniziale prima del filtro `from` e ricostruisce il saldo progressivo sul periodo. La funzione è derivata e non introduce nuove collezioni Firestore.

## Release 0.3.6 - Riconciliazione pagamenti
Ogni riconciliazione importata da CSV banca deve restare confermabile manualmente. La conferma crea un `paymentEvent`, aggiorna i documenti allocati e registra lo storico in `bankReconciliationEvents`. Non introdurre automatismi irreversibili o backend custom.

## Release 0.3.7 - Consolidamento QA e coerenza contabile

La 0.3.7 non aggiunge nuove aree operative. Introduce `js/features/accounting/accounting-consistency-service.js` come servizio diagnostico client-side per verificare la coerenza tra pagamenti, partitario, prima nota e riconciliazioni.

Regole tecniche:
- non corregge dati automaticamente;
- non persiste nuove entità;
- non introduce backend custom;
- deve restare utilizzabile nei test browser-based anche con dataset sintetici.


## Release 0.4.0 - Stampe e PDF HTML avanzati

La 0.4.0 introduce il centro stampe in **Analisi → Stampe / PDF**. La generazione resta completamente client-side: `PrintTemplateService` costruisce HTML standalone e `print-center-module` lo mostra in anteprima iframe, con apertura della finestra di stampa del browser.

Non vengono introdotte nuove collezioni Firestore. I template leggono dati già disponibili in AppStore/Firestore e riusano, quando presenti, `LedgerService`, `AccountStatementService`, `CashbookService`, `ReminderService` e `ScadenziarioService`.

Il PDF non viene generato da backend: l'utente usa la funzione nativa del browser **Stampa → Salva come PDF**.

## Release 0.4.1 - Centro notifiche operativo

La 0.4.1 introduce `js/features/accounting/notification-center-service.js` e `js/features/accounting/notification-center-module.js`. Il servizio legge dati già disponibili in memoria (`AppStore`/`globalData`) e produce notifiche derivate senza persistenza aggiuntiva.

Fonti principali:
- `ScadenziarioService` per scadenze aperte/scadute;
- prodotti e lotti per sotto-scorta e scadenze;
- DDT cliente e ordini per documenti operativi aperti;
- `bankReconciliationEvents` e `paymentEvents` per anomalie di riconciliazione;
- `AccountingConsistencyService` per alert QA contabile.

La UI espone filtri, riepiloghi, tabella operativa ed export CSV. Non sono introdotti backend custom né nuove collezioni Firestore.


## Release 0.4.3 - Registro attività / audit trail

La 0.4.3 introduce `js/features/accounting/audit-trail-service.js` e `js/features/accounting/audit-trail-module.js`.

Regole tecniche:
- gli eventi manuali sono salvati nella collezione opzionale `auditEvents`;
- il registro aggrega anche eventi derivati da `workflowEvents`, `paymentEvents`, `cashbookMovements`, `reminderEvents`, `bankReconciliationEvents` e `businessBudgets`;
- non deve essere presentato come audit forense immutabile;
- backup/import/reset devono includere `auditEvents`;
- i normalizzatori devono mantenere compatibilità tramite `normalizeAuditEvent`.

## Release 0.4.4 - Consolidamento UX e accessibilità

La 0.4.4 introduce `js/ui/accessibility-ux-service.js` e `js/ui/accessibility-ux-module.js`.

Regole tecniche:
- la vista **Analisi → UX / accessibilità** è consultiva e non modifica dati;
- le migliorie runtime aggiungono skip link, landmark e attributi ARIA senza cambiare il modello dati;
- i controlli su label, pulsanti, target menu e ID duplicati servono per QA UI di base;
- non sono introdotte collezioni Firestore o backend custom.

## Release 0.4.5 - Bilancino gestionale

La release introduce `js/features/accounting/mini-balance-service.js` e `js/features/accounting/mini-balance-module.js`.

Regole tecniche:
- la vista è derivata da dati esistenti;
- non introduce nuove collezioni Firestore;
- non deve essere presentata come bilancio civilistico o fiscale;
- la valorizzazione magazzino resta separata dal conto economico;
- i calcoli devono restare compatibili con `paymentEvents`, `cashbookMovements`, fatture, acquisti e budget.


## Release 0.4.6 - Correzione accessibilità form e pulsanti

La release aggiorna `AccessibilityUXService` con funzioni di inferenza label e nomi pulsante. Le correzioni sono applicate sul DOM corrente, marcate con `data-a11y-auto-label="true"` e non modificano Firestore.


## Release 0.4.7 - Dark Mode form e combo

La release 0.4.7 non introduce nuove collezioni Firestore e non modifica dati applicativi. Interviene su `css/style.css` con regole dedicate a `select`, `.form-select`, `option`, `option:disabled`, `optgroup` e input data/ora in Dark Mode.

La diagnostica UX (`AccessibilityUXService`) viene aggiornata alla versione 0.4.7 e aggiunge un controllo consultivo per rilevare la presenza delle regole CSS dedicate al contrasto delle combo in tema scuro.

## Release 0.4.8 - Select dinamiche soggetti

La release corregge un problema di inizializzazione delle combo dinamiche: alcuni moduli controllavano solo la presenza di opzioni, ma le select avevano già un placeholder statico nel markup. È stata introdotta una verifica `isPlaceholderOnly()` nei moduli contabili interessati.

File modificati:

```text
js/features/accounting/payment-events-module.js
js/features/accounting/ledger-module.js
js/features/accounting/account-statement-module.js
js/features/accounting/print-center-module.js
js/ui/accessibility-ux-service.js
js/ui/accessibility-ux-module.js
```

La release non modifica persistenza, collezioni Firestore o modello dati.

## Aggiornamento 0.5.0 — Gruppi aziendali

La persistenza passa da root fisso utente a root dinamico:

```text
users/{uid}                         # legacy personale
businessGroups/{groupId}            # dataset condiviso attivo
```

I moduli applicativi continuano a usare `saveDataToCloud`, `batchSaveDataToCloud`, `deleteDataFromCloud` e `loadAllDataFromCloud`. La scelta del root è centralizzata in `getDataRootRef()` e nel servizio Gruppi aziendali, per non duplicare logica nei singoli moduli.


## Aggiornamento 0.5.1 — Membri, inviti e ruoli

La release estende `BusinessGroupsService` con gestione membri e inviti:

```text
businessGroups/{groupId}/members/{uid}
businessGroups/{groupId}/invites/{inviteCode}
users/{uid}/memberships/{groupId}
```

Gli inviti sono semplici: non inviano email e non richiedono backend custom. L'amministratore/docente comunica ID gruppo e codice allo studente, che accetta l'invito dalla UI dopo login Firebase.

Per manutenzione futura:

- i controlli `admin`/`teacher` sono UI/client-side;
- le regole Firestore complete sono previste nella 0.5.3;
- i ruoli applicativi saranno usati dalla 0.5.2 per visibilità menu e blocchi operativi;
- non introdurre Cloud Functions come requisito per accettare inviti.


## Aggiornamento 0.5.2 — Policy UI centralizzata

`PermissionsPolicy` diventa il punto unico per ruoli, alias legacy, target di navigazione e scope di scrittura. Con un gruppo attivo legge `currentBusinessGroup.role`; senza gruppo mantiene `companyInfo.accessControl`.

La policy applica visibilità menu e disabilitazioni UI, ma non sostituisce le regole Firestore previste nella 0.5.3.


## Aggiornamento 0.5.3 — Regole Firestore deployabili

La release aggiunge `firestore.rules` e `firebase.json`. Le regole preservano il path legacy `users/{uid}` e proteggono `businessGroups/{groupId}` tramite membership attiva. Per attivarle usare Firebase Console oppure `firebase deploy --only firestore:rules`. La 0.5.4 dovrà occuparsi di concorrenza, versionamento e scritture critiche.
