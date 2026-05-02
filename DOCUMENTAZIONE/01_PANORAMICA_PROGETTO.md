# 1. Panoramica del progetto

## Obiettivo didattico
L'applicazione simula la gestione di un professionista con due **regimi gestionali**:

- **Ordinario**: gestione IVA, acquisti/fornitori, registri IVA, simulazione ordinario.
- **Forfettario**: semplificazione (IVA assente/forzata a 0), simulazione quadro LM.

L'app è pensata per esercitazioni: anagrafiche, documenti, scadenze, commesse/progetti, timesheet, backup e ripristini.

## Stack tecnico
- Front-end: **HTML + Bootstrap + jQuery** (single page app).
- Backend: **Firebase**
  - **Authentication** (login)
  - **Cloud Firestore** (dati utente)

> Non usa un backend custom: tutti i dati sono salvati su Firestore sotto l’utente autenticato.

## Dati e struttura Firestore
Dati per utente:

- Path base: `users/{uid}/...`
- Impostazioni: `users/{uid}/settings/*` (es. `settings/companyInfo`)
- Collezioni principali:
  - `products` (voci: servizi, costi, prodotti)
  - `vatRates` (codici IVA/Natura FE personalizzati; i codici di sistema sono nel catalogo applicativo)
  - `paymentMethods` (codici pagamento FE personalizzati; i codici di sistema sono nel catalogo applicativo)
  - `customers` (clienti)
  - `suppliers` (fornitori)
  - `invoices` (fatture + note di credito)
  - `purchases` (acquisti)
  - `notes` (block-notes)
  - `commesse` (collegate a un cliente "Fatturo a")
  - `projects` (collegate a una commessa; contengono **codice progetto** e **cliente finale**)
  - `worklogs` (timesheet giornaliero; collegabili a una fattura tramite `invoiceId`)

## Pagine principali (menu)
- **Home**: dashboard, block-notes e calendario. Il calendario locale può essere sostituito da un Google Calendar incorporato in vista 7 giorni configurando l’URL embed/ID in **Dati Azienda**.
- **Statistiche**: riepiloghi annuali
- **Contabilità**: Scadenziario e Registri IVA *(solo Ordinario per i registri)*
- **Simulazioni fiscali**: Ordinario / LM
- **Anagrafiche**: Clienti, Fornitori *(solo Ordinario)*, Servizi / Prodotti, con filtri per servizi, prodotti e costi e prezzi acquisto/vendita sui prodotti fisici
- **Documenti**: Nuova Fattura, Nuova Nota Credito, Elenco Documenti
- **Vendite**: Elenco Preventivi cliente, Nuovo Preventivo cliente, Elenco Ordini cliente, Nuovo Ordine cliente, DDT cliente, Fatture e Note di credito
- **Acquisti** *(solo Ordinario)*: Elenco Ordini fornitore, Nuovo Ordine fornitore, DDT fornitore, Nuovo Acquisto, Elenco Acquisti
- **Magazzino**: Giacenze, Inventario valorizzato, Movimenti, Quarantena, Prodotti macerati
- **Commesse / Progetti / Timesheet**
- **Export Timesheet**
- **Impostazioni**: Azienda, Tabella IVA, Codici pagamento, Banche aziendali, Uso dati (stima), Gestione Dati

## Regime gestionale: effetto sulle funzionalità
Il regime viene scelto in **Impostazioni → Azienda**.

### Ordinario
- Abilita: Fornitori, Acquisti, Registri IVA, simulazione ordinario.
- L’IVA è gestita in righe documenti, riepiloghi e registri.

### Forfettario
- Nasconde/Disabilita: Fornitori e Acquisti, Registri IVA.
- L’IVA viene forzata a 0 nei flussi per evitare errori.
- Abilita: simulazione quadro LM.

## Concetti chiave per l’uso didattico
- **Timesheet**: è salvato come `worklogs` (giorno/commessa/progetto/minuti) e viene esportato in CSV.
- **Import ore in fattura**: dal timesheet puoi generare righe fattura. Il sistema gestisce un **binding sicuro**: i worklog vengono marcati come "fatturati" solo al salvataggio definitivo della fattura, garantendo coerenza in caso di annullamento o modifiche del form.
- **Gestione Dati**: backup, import, cancellazioni per anno, reset totale per “passaggio classe”.
- **Uso dati (stima)**: utile per parlare di quote/limiti (stima su 1 GiB Spark).


### Versione 0.0.36 - Stati, blocchi e rollback documentali
La versione introduce un controllo centralizzato degli stati documentali. Gli elenchi continuano a mostrare lo stato operativo dei documenti, ma alcune azioni distruttive vengono bloccate quando esistono documenti collegati: un ordine cliente con DDT non può essere eliminato, un ordine fornitore con DDT ricevuto non può essere eliminato e un DDT cliente già fatturato non può generare una seconda fattura.

L'eliminazione di una fattura non pagata e non inviata resta possibile solo con conferma. Quando la fattura è collegata a record Timesheet o DDT cliente, il sistema avvisa l'utente e sblocca i riferimenti collegati per consentire una nuova fatturazione controllata.

### Versione 0.0.37 - Documenti collegati
La versione aggiunge una vista trasversale **Documenti collegati** nei dettagli dei principali documenti operativi. La scheda mostra la catena didattica tra preventivo, ordine, DDT, fattura, timesheet e movimenti di magazzino, senza modificare collezioni Firestore o logiche fiscali.


### Versione 0.1.1 - Fattura riepilogativa avanzata
La fatturazione da DDT cliente multipli ora supporta una modalità riepilogativa più completa: righe separate o raggruppate per prodotto, ordinamento anteprima, causale riepilogativa e compilazione dei riferimenti `DatiDDT` nell'XML della fattura elettronica.

### Versione 0.1.2 - Stabilizzazione e QA

- Introdotti controlli di coerenza non distruttivi su magazzino e collegamenti documentali.

### Versione 0.1.3 - Annullamenti e rettifiche documentali

- Introdotto servizio per annullamento controllato e rettifiche operative di magazzino.

### Versione 0.1.4 - Resi cliente e note di credito collegate

- Introdotto servizio applicativo per resi cliente, rientro merce e bozza nota di credito collegata.

### Versione 0.1.5 - Reportistica gestionale

- Aggiunta pagina Analisi → Report gestionali con indicatori sintetici e tabelle operative.

### Versione 0.1.6 - Consolidamento tecnico e UX
La versione non introduce nuove collezioni o nuove macro-funzioni: consolida la stabilità della SPA dopo le integrazioni 0.1.x. Sono stati corretti duplicati HTML/DOM, riallineata la sezione **Report gestionali** con la struttura contenuti, esteso il servizio QA e rafforzata la leggibilità in Dark Mode su moduli e tabelle.

## Aggiornamento 0.4.4

La versione 0.4.4 consolida UX e accessibilità con skip link, landmark ARIA, focus visibile, supporto tastiera per la sidebar e una vista consultiva di controllo in **Analisi → UX / accessibilità**.

## Aggiornamento 0.4.5

La versione 0.4.5 introduce **Contabilità → Bilancino**, un prospetto gestionale semplificato che combina ricavi, costi, margine operativo, incassi/pagamenti, crediti/debiti aperti e valore magazzino stimato. Non introduce nuove collezioni Firestore e non rappresenta un bilancio civilistico o fiscale.


## Aggiornamento 0.4.6

La versione 0.4.6 consolida la qualità UX/accessibilità introducendo correzioni runtime non distruttive per campi form senza label/aria e pulsanti senza nome accessibile.


## Aggiornamento 0.4.7

La versione 0.4.7 consolida la Dark Mode dei controlli form: combo/select, opzioni native, campi data e stati focus ricevono regole dedicate per migliorare contrasto e leggibilità nelle sezioni contabili, di analisi e magazzino.

## Aggiornamento 0.4.8

La versione 0.4.8 corregge il popolamento delle select dinamiche soggetto nelle sezioni contabili. In particolare, **Incassi e pagamenti** ora mostra correttamente clienti o fornitori in base al tipo movimento, anche quando la select contiene già un placeholder statico.
