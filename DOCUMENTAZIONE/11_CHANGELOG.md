# Versione 0.4.8 — Correzione select dinamiche soggetti

La versione 0.4.8 corregge un problema di inizializzazione delle select dinamiche: alcune combo contenevano già un placeholder statico e quindi i moduli non avviavano il popolamento con clienti, fornitori o documenti disponibili.

## Correzioni

- Corretto **Contabilità → Incassi e pagamenti**: la combo **Soggetto** mostra clienti per gli incassi e fornitori per i pagamenti.
- Corretto refresh automatico della combo soggetto al cambio tipo movimento.
- Consolidati filtri soggetto in **Partitario** ed **Estratto conto**.
- Consolidato il popolamento soggetti/documenti nel **Centro Stampe / PDF**.
- Aggiunto controllo UX consultivo per select dinamiche ferme al solo placeholder.
- Aggiunto test browser-based `tests/dynamic-selects-048.test.html`.

## Impatto tecnico

- Nessuna nuova collezione Firestore.
- Nessuna migrazione dati.
- Nessuna modifica ai dati applicativi.
- Nessun backend custom.

---

# Versione 0.4.7 — Dark Mode form e combo

La versione 0.4.7 migliora il contrasto dei controlli form in Dark Mode, con particolare attenzione a combo/select, opzioni native, campi data e stati focus.

## Novità

- Stili Dark Mode più robusti per `select` e `.form-select`.
- Stili dedicati per `option`, `option:checked`, `option:disabled` e `optgroup`.
- Migliore leggibilità per campi data/ora in tema scuro.
- Focus ring più evidente e coerente su combo e campi form.
- Controllo consultivo nella vista **Analisi → UX / accessibilità** per verificare la presenza delle regole Dark Mode sulle combo.
- Nuova documentazione `DOCUMENTAZIONE/31_DARK_MODE_FORM_CONTROLS.md`.
- Nuovo test browser-based `tests/dark-mode-047-form-controls.test.html`.

## Compatibilità

- Nessuna nuova collezione Firestore.
- Nessun backend custom.
- Nessuna modifica ai dati applicativi.
- Le differenze residue nel menu aperto delle select possono dipendere dal browser/sistema operativo.

---

# Versione 0.4.6 — Correzione accessibilità form e pulsanti

La versione 0.4.6 consolida la sezione **Analisi → UX / accessibilità** riducendo le segnalazioni su campi senza label/aria e pulsanti senza nome accessibile.

## Novità

- Auto-etichettatura runtime per campi form legacy/dinamici privi di label esplicita.
- Auto-nome accessibile per pulsanti solo icona o privi di testo.
- Marcatura degli elementi corretti con `data-a11y-auto-label="true"`.
- Report UX aggiornato con conteggio delle correzioni runtime applicate.
- Nuova documentazione `DOCUMENTAZIONE/30_ACCESSIBILITA_FORM_PULSANTI.md`.
- Nuovo test browser-based `tests/ux-accessibility-046.test.html`.

## Compatibilità

- Nessuna nuova collezione Firestore.
- Nessun backend custom.
- Nessuna modifica ai dati applicativi.
- Le correzioni sono applicate lato client sul DOM corrente.

---

# Versione 0.4.5 — Bilancino gestionale

La versione 0.4.5 introduce in **Contabilità → Bilancino** un prospetto gestionale semplificato con ricavi, costi, margine operativo, incassi/pagamenti, crediti/debiti aperti e valore magazzino stimato.

## Novità

- nuova sezione Contabilità → Bilancino;
- nuovo `MiniBalanceService`;
- nuovo `mini-balance-module`;
- conto economico semplificato;
- situazione finanziaria del periodo;
- crediti clienti e debiti fornitori aperti;
- valorizzazione magazzino stimata e separata;
- confronto sintetico con budget, se presente;
- export CSV;
- nessuna nuova collezione Firestore;
- nessun backend custom.

## Nota importante

Il bilancino non è un bilancio civilistico/fiscale: non gestisce ammortamenti, imposte, ratei/risconti o scritture di assestamento.

---

# Versione 0.4.4 — Consolidamento UX e accessibilità

- Aggiunta sezione **Analisi → UX / accessibilità**.
- Aggiunti `js/ui/accessibility-ux-service.js` e `js/ui/accessibility-ux-module.js`.
- Inseriti skip link, landmark ARIA, focus visibile e supporto tastiera per le intestazioni della sidebar.
- Aggiunti controlli consultivi su label form, pulsanti, target menu/sezioni e ID duplicati.
- Aggiornati ruoli/permessi per includere la nuova vista consultiva.
- Aggiunto test browser-based `tests/ux-accessibility-044.test.html`.
- Nessuna nuova collezione Firestore, nessun backend custom, nessuna modifica automatica ai dati.

## CDSDM Versione 0.4.3 — Registro attività / audit trail

La versione 0.4.3 introduce **Analisi → Registro attività**: una vista applicativa client-side per consultare eventi manuali e attività derivate dai moduli già presenti.

### Obiettivi
- centralizzare workflow, incassi/pagamenti, prima nota, solleciti, riconciliazioni e budget in un unico registro consultabile;
- permettere la registrazione manuale di note di audit nella collezione opzionale `auditEvents`;
- fornire filtri per categoria, fonte, priorità, periodo e ricerca testuale;
- esportare il registro in CSV.

### Limiti dichiarati
Il registro è un audit didattico lato front-end. Non è un audit forense immutabile: per sicurezza reale servono regole Firestore adeguate, logging server-side o servizi esterni di audit.

### Persistenza
La nuova collezione opzionale è:

```text
users/{uid}/auditEvents
```

Il registro mostra anche eventi derivati da collezioni già esistenti, senza duplicarli.

## Versione 0.4.2 - Workflow approvativi leggeri

- Aggiunta sezione Analisi → Workflow approvativi.
- Aggiunti `WorkflowService` e `workflow-module`.
- Aggiunta collezione opzionale `workflowEvents`.
- Introdotte azioni manuali: approva, respingi, blocca, rimetti in revisione.
- Aggiornati backup/import/reset, permessi, documentazione e test.

## CDSDM Versione 0.4.1 — Centro notifiche operativo

- Aggiunta la sezione **Analisi → Centro notifiche**.
- Introdotti `NotificationCenterService` e `notification-center-module`.
- Aggregati alert derivati da scadenzario, magazzino, lotti, DDT cliente da fatturare, ordini aperti, riconciliazioni e QA contabile.
- Aggiunti filtri per categoria, priorità, ricerca testuale, orizzonte scadenze e orizzonte lotti.
- Aggiunto export CSV delle notifiche.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna modifica automatica dei dati.
- Aggiornati documentazione, mappa moduli e test browser-based.

## CDSDM Versione 0.4.0 — Stampe e PDF HTML avanzati

- Aggiunta la sezione **Analisi → Stampe / PDF**.
- Introdotti `PrintTemplateService` e `print-center-module`.
- Template HTML per estratto conto, partitario, fattura/nota credito, prima nota e solleciti.
- Anteprima integrata in iframe, stampa browser e download HTML.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna libreria PDF obbligatoria.
- Aggiornati documentazione, test browser-based e mappa moduli.

## CDSDM Versione 0.3.7 — Consolidamento QA, UX e coerenza contabile
- Release di consolidamento dopo le evoluzioni 0.2.x e 0.3.x.
- Aggiunto `AccountingConsistencyService` per controlli diagnostici non distruttivi.
- Verifiche su paymentEvents, allocazioni, documenti sovraincassati/sovrapagati, prima nota automatica e riconciliazioni collegate.
- Riallineati versione, documentazione, indice test e documentazione in-app.
- Aggiunto test browser-based `tests/accounting-consistency-037.test.html`.
- Nessuna nuova collezione Firestore e nessun backend custom.

## CDSDM Versione 0.3.6 — Budget, costi e marginalità avanzata
- aggiunta la sezione **Analisi → Budget e marginalità**.
- introdotti `BusinessBudgetService` e `business-budget-module`.
- aggiunta la collezione opzionale `businessBudgets` per i target annuali mensilizzati.
- calcolo consuntivi da fatture, acquisti e prima nota manuale.
- confronto ricavi/costi/margine, top clienti/prodotti/fornitori ed export CSV.
- aggiornati backup/import/reset, permessi, documentazione in-app e test.

### Versione 0.3.5 - Riconciliazione pagamenti
La versione 0.3.5 introduce Contabilità → Riconciliazione banca: import CSV dei movimenti bancari, analisi client-side, proposte di abbinamento a fatture/acquisti aperti, conferma manuale, creazione di eventi in `paymentEvents` e storico opzionale in `bankReconciliationEvents`. Non sono presenti automatismi irreversibili, backend custom o invii esterni.

### Versione 0.3.3 - Estratto conto cliente/fornitore
La versione 0.3.3 introduce Contabilità → Estratto conto: saldo iniziale, movimenti di periodo, saldo progressivo, saldo finale, export CSV e stampa HTML. Non introduce nuove collezioni Firestore.

### Versione 0.3.2 - Prima nota / movimenti finanziari
La versione 0.3.2 introduce Contabilità → Prima nota: registro finanziario semplificato con movimenti automatici derivati da incassi/pagamenti, movimenti manuali di cassa/banca, saldi per conto ed export CSV. La nuova collezione opzionale `cashbookMovements` contiene solo i movimenti manuali.

### Versione 0.3.1 - Incassi e pagamenti evoluti
La versione 0.3.1 introduce la sezione Contabilità → Incassi e pagamenti, con registrazione movimenti cliente/fornitore, allocazione su più documenti, metodo, riferimento, data valuta e collezione opzionale paymentEvents. I dati legacy negli array payments restano compatibili e vengono letti da scadenzario e partitario.

# Versione 0.3.0 - Partitario clienti e fornitori

- Aggiunta la sezione **Contabilità → Partitario**.
- Introdotto `LedgerService` per costruire movimenti dare/avere derivati da documenti esistenti.
- Supportati partitario clienti e partitario fornitori con filtro soggetto, periodo e ricerca testuale.
- Aggiunti saldi progressivi, saldi per soggetto ed export CSV.
- Nessuna nuova collezione Firestore e nessun backend custom.
- Compatibilità con pagamenti parziali già registrati nello scadenzario 0.2.2 tramite array `payments`.

## Versione 0.2.6 - Ruoli e permessi

- Aggiunta sezione **Impostazioni → Ruoli e permessi**.
- Aggiunto `PermissionsPolicy` con profili Admin, Commerciale, Magazzino, Contabilità e Sola lettura.
- Aggiunto modulo `roles-permissions-module.js` per configurare e salvare `companyInfo.accessControl`.
- Aggiunto controllo di accesso alle sezioni e applicazione di restrizioni UI in sola lettura.
- Nessun backend custom, nessuna nuova collezione Firestore obbligatoria.
- Documentati i limiti: i permessi front-end non sostituiscono regole Firestore per sicurezza reale multiutente.

## CDSDM Versione 0.2.5 — Import massivi CSV

- Aggiunta la nuova sezione **Impostazioni → Import massivi CSV**.
- Introdotto il modulo `js/features/import/import-csv-module.js`.
- Supportati import di clienti, fornitori, servizi/prodotti/costi, lotti/matricole/scadenze e movimenti magazzino.
- Aggiunti template CSV scaricabili per ogni tipologia.
- Implementati parser CSV client-side, anteprima, conteggio righe valide/non valide e blocco del salvataggio in presenza di errori.
- Gli ID presenti nel CSV aggiornano documenti esistenti; gli ID assenti vengono generati progressivamente.
- Nessuna nuova collezione Firestore obbligatoria e nessun backend custom.
- I file Excel devono essere salvati come CSV UTF-8 prima dell’import, evitando dipendenze esterne.
- Aggiunta documentazione `14_IMPORT_MASSIVI_CSV.md` e test browser-based `import-025-csv.test.html`.

## CDSDM Versione 0.2.4 — Lotti / matricole / scadenze

- aggiunta configurazione tracciabilità opzionale sui prodotti fisici: nessuna, lotto, matricola, lotto con scadenza.
- aggiunta la collezione opzionale Firestore `warehouseLots`.
- aggiunto il normalizzatore `normalizeWarehouseLot` e campi prodotto `trackingMode`, `requiresExpiry`, `shelfLifeDays`.
- aggiunta la sezione **Magazzino → Lotti / matricole / scadenze** con filtri, KPI, registrazione manuale ed export CSV.
- mantenuta compatibilità con prodotti e movimenti legacy: i prodotti esistenti restano non tracciati e non richiedono migrazioni obbligatorie.

### Versione 0.2.3 - Valorizzazione magazzino
La versione 0.2.3 evolve l'inventario valorizzato in una vista di valorizzazione magazzino con metodo selezionabile: prezzo anagrafico, ultimo costo da DDT fornitore e costo medio ponderato semplificato. I calcoli restano derivati dai dati esistenti (prodotti e DDT fornitore), senza nuove collezioni Firestore, senza backend custom e con fallback compatibile ai prezzi anagrafici.

- Aggiunto `js/features/warehouse/inventory-valuation-service.js`.
- La valorizzazione ora supporta prezzo anagrafico, ultimo costo da DDT fornitore e costo medio ponderato semplificato.
- Aggiornata la UI di Magazzino → Inventario con selezione metodo, origine costo e filtro costi fallback.
- Esteso export CSV della valorizzazione.
- Aggiunto test browser-based `tests/warehouse-023-inventory-valuation.test.html`.

### Versione 0.2.2 - Scadenzario evoluto clienti/fornitori
La versione 0.2.2 evolve lo scadenzario in una vista operativa clienti/fornitori: filtri per tipo, stato e soggetto, riepiloghi da incassare/da pagare, gestione importi parziali e residui, registrazione incassi/pagamenti su array `payments` interni ai documenti esistenti. Non introduce nuove collezioni Firestore né backend custom.

### Versione 0.2.1 - Dashboard Direzionale
- Prima release evolutiva del ramo 0.2.x dopo il consolidamento tecnico 0.2.0.
- Introdotto `js/features/dashboard/executive-dashboard-service.js` per calcolare KPI direzionali da dati già presenti: fatture, note di credito, acquisti, prodotti, DDT cliente, ordini cliente/fornitore e timesheet.
- Aggiornata la pagina Dashboard con indicatori su fatturato netto, acquisti, margine lordo stimato, scadenze aperte, valore magazzino, DDT da fatturare, ordini aperti e ore non fatturate.
- Aggiunti andamento per periodo, top clienti e alert operativi.
- Aggiunto test browser-based `dashboard-021-executive.test.html`.
- Nessuna nuova collezione Firestore; nessun backend custom; compatibilità dati mantenuta tramite lettura tollerante dei campi legacy.

### Versione 0.2.0 - Release tecnica di coerenza

- corretto il wiring di avvio caricando `js/app/invoice-xml-migration.js` prima di `js/app/app-bootstrap.js`;
- caricati nella SPA i moduli già presenti ma non inclusi in `index.html`: `document-cancellation-service.js`, `customer-returns-service.js`, `warehouse-reports-module.js`;
- mantenuta compatibilità totale con Firestore esistente: nessuna nuova collezione, nessuna migrazione dati obbligatoria;
- riallineati `tests/index.html`, test reportistica, README, manuale, workflow tecnico, changelog e documentazione in-app;
- preparata la base tecnica per aprire il ramo evolutivo 0.2.x senza introdurre logiche esterne o backend custom.

### Versione 0.1.6 - Consolidamento tecnico e UX

- corretti duplicati HTML che potevano creare ID ripetuti nelle sezioni Manuale/Versione e nella configurazione azienda;
- spostata la sezione `Report gestionali` fuori dalla sidebar, mantenendo invariata la voce di menu `Analisi → Report gestionali`;
- esteso `WarehouseQAService` con controlli su navigazione DOM, target menu mancanti e residui ordine cliente/fornitore;
- rafforzata la leggibilità Dark Mode su card, modali, tabelle, dropdown, input, placeholder e testi secondari;
- aggiornato il test browser-based Step 22 per coprire inventario, residui ordine e integrità navigazione;
- nessuna modifica alle collezioni Firestore, ai calcoli fiscali o ai flussi documentali.

### Versione 0.1.5 - Reportistica gestionale

- aggiunta voce Analisi → Report gestionali;
- aggiunta vista con giacenze valorizzate, merce in quarantena, DDT cliente da fatturare, ordini inevasi e scadenze aperte;
- aggiornati documentazione, changelog, mappa moduli e test browser-based Step 25.

### Versione 0.1.4 - Resi cliente e note di credito collegate

- introdotto CustomerReturnsService per preparare resi da fattura, ricaricare la merce rientrata e generare una bozza di nota di credito collegata;
- aggiunta collezione logica customerReturns senza alterare il motore fiscale esistente;
- aggiunto test browser-based Step 24 e documentazione.

### Versione 0.1.3 - Annullamenti e rettifiche documentali

- introdotto DocumentCancellationService per annullare DDT cliente non fatturati e DDT fornitore con rettifica controllata delle giacenze;
- aggiunti movimenti di rettifica collegati al documento annullato;
- aggiunto test browser-based Step 23 e documentazione operativa.

### Versione 0.1.2 - Stabilizzazione e QA

- aggiunto WarehouseQAService per audit coerenza giacenze, quarantena e collegamenti documentali;
- aggiunto test browser-based Step 22;
- aggiornati README, changelog, manuale, workflow tecnico e mappa moduli.

### Versione 0.1.1 - Fattura riepilogativa avanzata / XML DatiDDT
- estesa la pagina **Vendite → Fatturazione DDT cliente** con opzioni di generazione righe: separate per DDT oppure raggruppate per prodotto/prezzo/IVA.
- aggiunto ordinamento anteprima per DDT, data DDT o prodotto.
- aggiunta nota riepilogativa automatica della fattura relativa ai DDT selezionati.
- esteso `InvoiceXMLMapper` per compilare i blocchi `DatiDDT` nell'XML della fattura elettronica quando la fattura nasce da DDT cliente.
- preservate le informazioni `summaryOptions` e `summaryNote` nel riferimento `sourceCustomerDDT` della fattura.
- aggiornati documentazione, README, suite test browser-based e versione a 0.1.1.

### Versione 0.0.37 - Documenti collegati
- introdotto `DocumentLinksService` per ricostruire le relazioni tra preventivi cliente, ordini cliente, DDT cliente, fatture, ordini fornitore, DDT fornitore, movimenti di magazzino e timesheet.
- aggiunta nei dettagli documento la scheda **Documenti collegati**, utile per leggere il ciclo operativo completo senza cambiare pagina.
- i dettagli di DDT cliente e DDT fornitore mostrano ora anche movimenti magazzino generati e documenti sorgente/destinazione.
- il dettaglio fattura mostra DDT inclusi, ordini origine indiretti e timesheet collegati quando presenti.
- aggiornati documentazione, README, suite test browser-based e versione a 0.0.37.

### Versione 0.0.36 - Stati, blocchi e rollback documentali
- introdotto `DocumentLifecycleService` come layer unico per stati documentali e regole operative prudenziali.
- standardizzate le mappe stato per preventivi, ordini cliente, ordini fornitore, DDT cliente e fatture.
- bloccata l'eliminazione di ordini cliente collegati a DDT cliente o già evasi/parzialmente evasi.
- bloccata l'eliminazione di ordini fornitore collegati a DDT fornitore ricevuti o già ricevuti/parzialmente ricevuti.
- rafforzato il blocco sui DDT cliente già fatturati: non possono generare una seconda fattura e non sono considerati modificabili/eliminabili.
- resa più chiara l'eliminazione fattura con rollback: un solo avviso riepiloga lo sblocco di record Timesheet e DDT cliente collegati.
- aggiornati documentazione, README, suite test browser-based e versione a 0.0.36.

### Versione 0.0.35 - DDT fornitore da ordini multipli
- estesa la modale **Acquisti → DDT fornitore** con l'origine **Da più ordini fornitore**.
- aggiunto pannello di selezione degli ordini fornitore aperti/parzialmente ricevuti, filtrato per fornitore e con blocco prudenziale su fornitori diversi.
- le righe residue degli ordini selezionati vengono proposte nel DDT con ripartizione modificabile tra quantità ricevuta, accettata, quarantena e respinta.
- il DDT salva riferimenti multipli `sourceOrderIds`, `sourceOrderNumbers` e `sourceDocuments`, oltre al dettaglio riga `sourceOrderId` / `sourceOrderLineIndex`.
- al salvataggio vengono generati carichi disponibili e quarantena aggregati per prodotto, aggiornando tutti gli ordini sorgente a `partially_received` o `received`.
- aggiornati normalizzatore DDT fornitore, stampa/PDF, documentazione in-app e test browser-based.

### Versione 0.0.34 - DDT cliente da ordini multipli
- estesa la modale **Vendite → DDT cliente** con l'origine **Da più ordini cliente**.
- aggiunto pannello di selezione degli ordini cliente aperti/parzialmente evasi, filtrato per cliente e con blocco prudenziale su clienti diversi.
- le righe residue degli ordini selezionati vengono proposte nel DDT, con quantità consegnabile modificabile fino al residuo di origine.
- il DDT salva riferimenti multipli `sourceOrderIds`, `sourceOrderNumbers` e `sourceDocuments`, oltre al dettaglio riga `sourceOrderId` / `sourceOrderLineIndex`.
- al salvataggio viene generato un solo scarico magazzino per prodotto, vengono aggiornati tutti gli ordini sorgente e gli stati passano a `partially_fulfilled` o `fulfilled`.
- aggiornata la normalizzazione dei DDT cliente per conservare origine multi-ordine, documentazione in-app e test browser-based.

### Versione 0.0.33 - Fatturazione DDT cliente multipli
- aggiunta la voce **Vendite → Fatturazione DDT cliente** per creare fatture riepilogative da uno o più DDT cliente non ancora fatturati.
- introdotta una pagina dedicata con filtro cliente, selezione checkbox dei DDT disponibili, riepilogo selezione e anteprima righe fattura.
- la selezione blocca DDT di clienti diversi e DDT già fatturati, riusando `DDTToInvoiceService.validateDDTsForSummaryInvoice()`.
- la fattura generata conserva `sourceCustomerDDT`, `sourceDocuments`, `sourceCustomerDDTIds` e `sourceCustomerDDTNumbers`; il salvataggio definitivo marca tutti i DDT selezionati come fatturati tramite `InvoicePersistenceService`.
- aggiunto il modulo `customer-ddt-invoicing-module.js`, più rollback dei DDT collegati quando una fattura riepilogativa viene eliminata in modo consentito.
- aggiornati menu, documentazione e test browser-based.

### Versione 0.0.32 - Pulizia UX preventivi e ordini
- separata la logica di consultazione dalla creazione documenti nei menu Vendite e Acquisti.
- rinominata la voce **Vendite → Preventivi** in **Vendite → Elenco Preventivi cliente**.
- aggiunte le voci **Vendite → Nuovo Preventivo cliente**, **Vendite → Nuovo Ordine cliente** e **Acquisti → Nuovo Ordine fornitore**.
- rimosso il pulsante primario di creazione dalle intestazioni degli elenchi preventivi/ordini, rendendo gli elenchi viste consultive dedicate a stato, dettaglio e azioni sui documenti esistenti.
- le nuove voci aprono direttamente le modali esistenti senza cambiare collezioni Firestore, normalizzatori o logica di salvataggio.
- aggiornati README, manuale utente, workflow tecnico, documentazione in-app, test browser-based e versione a 0.0.32.

### Versione 0.0.31 - Inventario fisico e giacenza prodotto
- aggiunta la voce `Magazzino → Giacenza prodotto` per consultare la giacenza di un singolo prodotto fisico, con disponibile, riservato, netto, quarantena, UM, ubicazione e scorta minima;
- aggiunta la voce `Magazzino → Inventario fisico` per inserire conteggi reali, calcolare differenze rispetto al gestionale e rettificare le giacenze disponibili;
- i conteggi fisici sono salvati per utente nella collezione Firestore `warehousePhysicalCounts`;
- l'allineamento richiede conferma esplicita e genera movimenti `RETTIFICA` con causale `Rettifica da inventario fisico`;
- la rettifica modifica solo la giacenza disponibile, senza alterare la quarantena;
- aggiornati README, manuale utente, workflow tecnico, documentazione in-app e test browser-based.

### Versione 0.0.27 - Step 13 DDT fornitore e quarantena avanzata
- separati i DDT fornitore in **Ricevuti dal fornitore** e **Resi al fornitore**.
- estesa la gestione quarantena con sblocco a disponibile, scarto/macero e reso a fornitore.
- aggiunta la sezione autonoma **Magazzino → Prodotti macerati** basata sui movimenti `SCARTO`.
- la scelta **Reso a fornitore** genera un DDT di reso fornitore nella collezione `supplierDDTs`, marcato con `ddtDirection: return_supplier`.
- aggiunta stampa/PDF anche per i DDT di reso fornitore tramite `DDTPrintService`.
- aggiornati normalizzatori, test browser-based, documentazione e versione a 0.0.27.

### Versione 0.0.26 - Area Contabilità
- introdotta la nuova area menu **Contabilità** per raccogliere le viste contabili trasversali.
- spostate le voci **Scadenziario** e **Registri IVA** da **Analisi** a **Contabilità**.
- mantenute invariate le pagine, i target di navigazione, i calcoli, i dati Firestore e le logiche esistenti.
- aggiornata la documentazione utente per lasciare spazio a future funzioni contabili come registrazione incassi/pagamenti, partitari o prima nota.

### Versione 0.0.25 - Elenchi ordini e filtri stato
- Rinominata la voce Vendite in **Elenco Ordini cliente** e la voce Acquisti in **Elenco Ordini fornitore**.
- Aggiornati i titoli delle sezioni ordini per chiarire che sono viste di controllo degli stati.
- Aggiunti riepiloghi sintetici e filtro per stato negli ordini cliente e fornitore.
- Uniformata l'etichetta operativa degli ordini confermati come **Aperto**, senza modificare i valori interni o la persistenza.
- Nessuna modifica a Firestore, DDT, fatture, movimenti o magazzino.

### Versione 0.0.24 - Preventivi operativi
- Resa operativa la sezione `Vendite → Preventivi`.
- Aggiunta collezione `quotes` con normalizzatore `normalizeQuote`, backup/import/reset e caricamento Firestore.
- Aggiunta creazione preventivo con cliente, validità, stato, righe prodotto/servizio e totale.
- Aggiunta conversione `Preventivo → Ordine cliente` senza movimentare il magazzino.
- Il preventivo convertito viene marcato come `converted` e collegato all'ordine creato.

### Versione 0.0.23 - Step 12C Menu per aree operative
- Riorganizzato il menu principale distinguendo `Vendite`, `Acquisti`, `Magazzino`, `Anagrafiche` e `Impostazioni`.
- Spostati `Ordini cliente` e `DDT cliente` da Magazzino a Vendite; spostati `Ordini fornitore` e `DDT fornitore` da Magazzino ad Acquisti.
- Aggiunta in Vendite la voce predisposta `Preventivi`, per ora come area informativa senza persistenza o logica documentale.
- Lasciate le anagrafiche Clienti, Fornitori e Servizi / Prodotti dentro Anagrafiche; Magazzino resta dedicato a giacenze, inventario, movimenti e quarantena.

### Versione 0.0.22 - Step 12B Pulizia UX Magazzino/DDT
- Riordinato il menu Magazzino in gruppi logici: giacenze/controlli, ciclo cliente e ciclo fornitore.
- Uniformati testi operativi delle sezioni Magazzino, Ordini e DDT rimuovendo riferimenti a step ormai superati.
- Resi più coerenti badge stato, gruppi pulsanti azione ed empty state nelle tabelle principali.
- Aggiornata documentazione utente e tecnica dei flussi Magazzino/DDT senza aggiungere nuove macro-funzioni.

### Versione 0.0.21 - Step 12 Consolidamento Magazzino/DDT
- Aggiunto servizio tecnico di controllo coerenza su prodotti fisici, giacenze, quarantena, movimenti, ordini e DDT.
- Aggiunta suite browser-based dedicata al consolidamento dei flussi Magazzino/DDT.
- Nessuna nuova macro-funzione operativa.

### Versione 0.0.20 - Step 11 Magazzino: DDT cliente → fattura
- Aggiunto comando **Crea fattura** sui DDT cliente, disponibile da elenco e dettaglio.
- La fattura viene precompilata con cliente, righe, quantità, prezzi e metadati del DDT sorgente, usando il motore fiscale fatture già esistente.
- Il salvataggio di una fattura non bozza marca il DDT come collegato alla fattura; nessun nuovo movimento di magazzino viene generato dalla fattura.

### Versione 0.0.19 - Step 10 Magazzino: aggiornamento prezzi da DDT
- Aggiunto servizio `WarehousePriceUpdateService`.
- Da `Magazzino → DDT fornitore` è possibile proporre l'aggiornamento del prezzo di acquisto dei prodotti collegati.
- Da `Magazzino → DDT cliente` è possibile proporre l'aggiornamento del prezzo di vendita dei prodotti collegati.
- La conferma mostra vecchio prezzo, nuovo prezzo e fonte; nessun aggiornamento silenzioso.
- Salvati metadati `lastPurchasePrice*`, `lastSalePrice*` e `lastPriceUpdate*` sui prodotti.
- Aggiunto test browser-based `warehouse-step10-price-update`.



### Versione 0.0.18 - Step 9 Magazzino: stampa/PDF DDT
- Aggiunto layout stampabile per DDT cliente e DDT fornitore.
- Aggiunti pulsanti Stampa / PDF negli elenchi e nei dettagli DDT.
- Il PDF viene prodotto tramite dialogo di stampa del browser, senza backend e senza librerie esterne.
- Nessun impatto su giacenze, movimenti, ordini, fatture o XML.

## CDSDM Versione 0.0.17 — DDT cliente e scarico magazzino
- aggiunta la sezione **Magazzino → DDT cliente** con collezione Firestore `customerDDTs`.
- il DDT cliente può essere creato **diretto senza ordine** oppure **da ordine cliente**.
- le quantità consegnate generano movimenti automatici `SCARICO` in `warehouseMovements` e diminuiscono la giacenza disponibile del prodotto.
- se il DDT deriva da ordine cliente, vengono aggiornate quantità evasa/residua e stato dell'ordine.
- introdotto il normalizzatore `normalizeCustomerDDT` e il modulo `js/features/warehouse/customer-ddts-module.js`.
- nessuna modifica a fatturazione, XML fattura, PDF DDT o collegamento DDT → fattura: restano step successivi.

## CDSDM Versione 0.0.16 — Gestione quarantena
- aggiunta la sezione **Magazzino → Quarantena** per gestire le quantità ricevute con riserva.
- introdotte le azioni **Sblocca a disponibile**, **Scarta / elimina** e **Reso a fornitore**.
- ogni azione aggiorna giacenza disponibile/quarantena del prodotto e crea un movimento tracciato in `warehouseMovements`.
- aggiunti i tipi movimento `SCARTO` e `RESO_FORNITORE` al normalizzatore dei movimenti.
- aggiunto test browser-based dedicato allo Step 7.

## CDSDM Versione 0.0.15 — DDT fornitore e ricevimento merci
- aggiunta la sezione **Magazzino → DDT fornitore** con collezione Firestore `supplierDDTs`.
- il DDT fornitore può essere creato diretto oppure da ordine fornitore.
- implementato il ricevimento merci con quantità **accettata**, **in quarantena/riserva** e **respinta**.
- le quantità accettate generano carico disponibile; le quantità in quarantena incrementano la quarantena; le quantità respinte restano registrate nel DDT senza caricare il magazzino.
- se il DDT deriva da ordine fornitore, aggiorna quantità ricevute e stato dell'ordine.
- aggiornati backup/import/reset, stima uso dati, normalizzatori, documentazione e test.

## CDSDM Versione 0.0.14 — Ordini fornitore base
- aggiunta la sezione **Magazzino → Ordini fornitore** con collezione Firestore `supplierOrders`.
- introdotto il normalizzatore `normalizeSupplierOrder` e il modulo `js/features/warehouse/supplier-orders-module.js`.
- gli ordini fornitore salvano fornitore, numero, data, consegna prevista, righe prodotto, quantità ordinate/ricevute/residue, prezzo acquisto e totale.
- nessun movimento di magazzino viene generato in questa fase: il carico avverrà con i futuri DDT fornitore/ricevimento merci, anche nei casi di accettato/quarantena/respinto.

## CDSDM Versione 0.0.13 — Ordini cliente base
- aggiunta la sezione **Magazzino → Ordini cliente** come base per i futuri DDT cliente da ordine.
- introdotta la collezione Firestore `customerOrders` e il normalizzatore `normalizeCustomerOrder`.
- aggiunta creazione ordine cliente con cliente, numero, data, consegna prevista, stato, righe prodotto, quantità ordinata, prezzo vendita e totale.
- aggiunta vista elenco e modale dettaglio con quantità ordinata/evasa/residua.
- gli ordini non movimentano ancora il magazzino: lo scarico avverrà negli step DDT cliente.

## CDSDM Versione 0.0.12 — Inventario valorizzato operativo
- consolidata la sezione **Magazzino → Inventario** come vista operativa dell'inventario valorizzato.
- aggiunti riepiloghi per valore disponibile, valore in quarantena, valore totale e numero prodotti sotto scorta.
- aggiunti filtri inventario: tutti i prodotti fisici, solo con giacenza/quarantena, solo sotto scorta, solo senza prezzo acquisto.
- aggiunto export CSV dell'inventario valorizzato filtrato.
- esposto il calcolo `calculateInventorySummary` in `WarehouseMovementService` e aggiunto test browser-based dedicato.
- nessuna modifica a DDT, ordini, scadenziario o fatturazione: l'aggiornamento dei prezzi da documenti resta uno step futuro.

## CDSDM Versione 0.0.11 — Motore movimenti magazzino
- introdotta la collezione Firestore `warehouseMovements` per tracciare i movimenti manuali di magazzino.
- resa operativa la sezione **Magazzino → Movimenti** con registrazione di carichi, scarichi, rettifiche e passaggi da/per quarantena.
- ogni movimento aggiorna il prodotto collegato e salva giacenza/quarantena prima e dopo l'operazione.
- aggiunti controlli prudenziali per impedire scarichi superiori alla giacenza disponibile o sblocchi superiori alla quantità in quarantena.
- aggiornati backup/import/reset totale, AppStore, Firebase, normalizzatori, test e documentazione.
- DDT, ordini e gestione quarantena avanzata restano negli step successivi.

## CDSDM Versione 0.0.10 — Prezzi prodotto per inventario valorizzato
- aggiunti in **Servizi / Prodotti** i campi **Prezzo acquisto** e **Prezzo vendita** per le voci di tipo `Prodotto`.
- introdotto `purchasePrice` come campo canonico e mantenuto `salePrice` come prezzo di vendita già usato da fatture, progetti e timesheet.
- aggiornato il normalizzatore prodotto per accettare alias legacy (`prezzoAcquisto`, `costoUnitario`, `unitCost`, `prezzoVendita`, `prezzoUnitario`, `unitPrice`).
- aggiornata la tabella voci con colonne separate per prezzo acquisto e prezzo vendita.
- la modifica prepara inventario valorizzato, magazzino e DDT, ma non introduce ancora giacenze, movimenti, listini, storico prezzi o aggiornamenti automatici da DDT/fatture.

## CDSDM Versione 0.0.8 — Banche aziendali e razionalizzazione pagamenti
- aggiunta la sezione **Impostazioni → Banche aziendali** con gestione di conti/IBAN aziendali salvati nella nuova collezione Firestore `companyBanks`.
- mantenuti i campi legacy **Banca 1/2** in **Impostazioni → Azienda** come fallback compatibile, ma le nuove fatture usano l'elenco dedicato se presente.
- collegata la tabella **Codici pagamento FE** al default del cliente e alla modalità pagamento effettiva della fattura.
- in fattura vengono ora salvati anche `paymentMethodId`, `paymentMethodCode`, `companyBankId`, `bancaSelezionata` e `ibanSelezionato`, mantenendo `modalitaPagamento` e `bankChoice` per compatibilità.
- aggiornati backup/import/reset totale, stima uso dati, XML mapper e documentazione.
- non sono stati introdotti scadenziari bancari, incassi, rate multiple o riconciliazione.

## CDSDM Versione 0.0.7 — Codici pagamento FE in Impostazioni
- aggiunta la tabella **Codici pagamento FE** in **Impostazioni**, con codici di sistema `MP01`...`MP23` e gestione di codici personalizzati.
- introdotto il catalogo `PaymentMethodCatalog` e la nuova collezione Firestore `paymentMethods` per i codici personalizzati.
- aggiornati backup/import/reset totale e stima uso dati per includere `paymentMethods`.
- la tabella è preparatoria: non modifica ancora il pagamento salvato su clienti e fatture, né il mapping XML esistente.
- confermato che il selettore IVA delle voci è già nel form **Servizi / Prodotti** come campo **Regola IVA / Natura FE**.

## CDSDM Versione 0.0.6 — Tabella IVA in Impostazioni
- spostata la tabella **IVA / Natura FE** da **Anagrafiche → Servizi / Prodotti** a **Impostazioni → Tabella IVA**, perché è una configurazione fiscale trasversale e non una voce di anagrafica prodotto.
- mantenuti invariati catalogo `VatRateCatalog`, collezione Firestore `vatRates`, modale di creazione/modifica e logiche di selezione IVA nelle voci prodotto/servizio/costo.
- aggiornato il render per popolare la tabella IVA indipendentemente dalla pagina Servizi / Prodotti.
- aggiornata documentazione utente, changelog e versione.

## CDSDM Versione 0.0.5 — Navigazione Servizi / Prodotti
- rinominata la voce di menu **Servizi** in **Servizi / Prodotti** per ridurre ambiguità dopo l'introduzione del tipo voce `Prodotto`.
- aggiornato il titolo pagina in **Gestione Servizi, Prodotti e Costi**.
- aggiunte schede di filtro **Tutti / Servizi / Prodotti / Costi** sulla tabella voci, senza separare la collezione `products` né modificare fatture, timesheet o persistenza.
- confermata come scelta futura l'introduzione di una sezione **Magazzino** dedicata per giacenze, movimenti e DDT cliente/fornitore.

## CDSDM Versione 0.0.4 — Fase 0 anagrafica voci e catalogo IVA/Natura FE
- aggiunto il campo **Tipo voce** in anagrafica: `Servizio`, `Costo`, `Prodotto`.
- introdotto `itemType` come campo canonico e mantenuti i campi legacy `isLavoro`/`isCosto` per compatibilità con fatture, commesse e import timesheet.
- introdotto `vatRateId` e il catalogo centralizzato IVA/Natura FE (`VatRateCatalog`) con aliquote IVA di sistema e codici Natura FE di sistema.
- aggiunta in Anagrafiche una tabella **IVA / Natura FE** con consultazione dei codici di sistema e gestione di codici personalizzati salvati in `vatRates`.
- aggiornati normalizzatori, rendering anagrafiche, backup/import/reset, selezione prodotti in fattura e test browser-based.
- la modifica prepara i futuri DDT/magazzino senza introdurre ancora movimenti di giacenza.

## CDSDM Versione 0.0.3 — Dark Mode allegato XML da Timesheet
- migliorata la leggibilità in Dark Mode del blocco **Allegato XML da Timesheet** nel form fattura.
- aggiunti override CSS mirati per pannello, testo secondario, icona e checkbox senza cambiare architettura o UX.
- confermata la feature esistente: l'allegato PDF descrittivo viene generato solo in export XML quando l'opzione è attiva e non modifica i totali fiscali del documento.
- aggiornate versione, README, changelog e documentazione in-app.

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

## CDSDM Versione 0.3.3 — Estratto conto cliente/fornitore
- Aggiunta la sezione **Contabilità → Estratto conto**.
- Introdotti `AccountStatementService` e `account-statement-module`.
- Calcolo saldo iniziale prima del periodo, movimenti di periodo, saldo progressivo e saldo finale.
- Export CSV e stampa HTML da browser.
- Nessuna nuova collezione Firestore e nessun backend custom.