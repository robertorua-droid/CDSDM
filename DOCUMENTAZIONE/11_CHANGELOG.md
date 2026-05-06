## 0.13.7 — Coerenza menu documenti commerciali

- Uniformato il modello di navigazione per Preventivi, Ordini cliente/fornitore e DDT cliente/fornitore.
- Il menu laterale usa ora il modello `Elenco ...`, mentre le azioni `Nuovo ...` restano come pulsanti dentro la pagina del documento.
- Rinominati i DDT nel menu in `Elenco DDT cliente` e `Elenco DDT fornitore`.
- Aggiunti pulsanti pagina per `Nuovo Preventivo cliente`, `Nuovo Ordine cliente` e `Nuovo Ordine fornitore`, mantenendo gli handler esistenti.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.7`.
- Aggiunto documento `122_COERENZA_MENU_DOCUMENTI_0136.md` e test `menu-documenti-commerciali-0136.test.html`.
- Nessuna modifica a Firestore rules, collezioni, permessi, backend o flussi dati.

## 0.13.5 — Form complessi e documenti gestionali mobile-aware

- Aggiunto `js/ui/mobile-documents-service.js` per migliorare la fruizione mobile di form complessi e documenti gestionali senza cambiare le logiche dati.
- Migliorate spaziature touch, gruppi azione, card, modali e tabelle nelle aree fatture, preventivi, ordini, DDT, acquisti e magazzino.
- Aggiunto suggerimento mobile che chiarisce l'uso consigliato: consultazione e modifiche brevi da smartphone, compilazione estesa da desktop/tablet.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.5`.
- Aggiunto documento `121_FORM_DOCUMENTI_MOBILE_0135.md` e test `mobile-form-documenti-0135.test.html`.
- Nessuna modifica a Firestore rules, collezioni, permessi, menu o backend.

## 0.13.4 — Mini B.I. sintetica mobile

- Aggiunto `js/ui/mobile-bi-service.js` per migliorare la consultazione mobile della Mini B.I. senza introdurre nuove logiche dati.
- Ottimizzate tab aree operative, card KPI, azioni CSV/report, alert B.I. e drill-down su smartphone.
- Aggiornata documentazione con `120_MINI_BI_MOBILE_0134.md` e test browser-based dedicato.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.4`.
- Nessuna modifica a Firestore rules, collezioni, permessi, menu o backend.

## 0.13.3 — Workflow e Segnalazioni operative mobile

- Aggiunto `js/ui/mobile-workflow-service.js` per miglioramenti mobile non invasivi su Workflow approvativi e Segnalazioni operative.
- Migliorata la disposizione dei pulsanti di azione e dei dettagli operativi sotto 576 px.
- Aggiunti suggerimenti contestuali mobile nelle sezioni Workflow e Segnalazioni operative.
- Aggiornato `css/style.css` con regole dedicate a workflow, segnalazioni, tab e azioni touch.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.3`.
- Aggiunto documento `119_WORKFLOW_SEGNALAZIONI_MOBILE_0133.md` e test `mobile-workflow-segnalazioni-0133.test.html`.
- Nessuna nuova collezione Firestore, nessuna nuova regola, nessun nuovo flusso applicativo.

## 0.13.2 — Tabelle e liste responsive progressive

- Aggiunto `js/ui/responsive-tables-service.js` per rendere più leggibili le tabelle su smartphone tramite etichette `data-label` e resa a schede sotto 576 px.
- Aggiornato `css/style.css` con regole conservative per `.cdsdm-mobile-card-table`, righe-card, pulsanti touch e tabelle generate dinamicamente.
- Aggiornato `index.html` per caricare il nuovo servizio UI.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.2`.
- Aggiunto documento `118_TABELLE_RESPONSIVE_0132.md` e test `mobile-tabelle-responsive-0132.test.html`.
- Nessuna nuova collezione Firestore, nessuna nuova regola, nessun nuovo flusso applicativo.

## 0.13.1 — Mobile usability base per Manuale, Aiuti rapidi e Consultazione

- Migliorata la leggibilità mobile del Manuale Utente, delle checklist e delle esercitazioni didattiche.
- Aggiunte regole CSS responsive non invasive per smartphone: spaziature, pulsanti touch, modali, pannelli di aiuto e contenuti markdown.
- Gli aiuti rapidi **?** mantengono i collegamenti ai capitoli del manuale ma risultano più comodi su schermi piccoli.
- Aggiunto il documento `117_MOBILE_USABILITY_BASE_0131.md`.
- Aggiunto il test browser-based `mobile-usability-base-0131.test.html`.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.1`.
- Nessuna nuova collezione Firestore, nessuna nuova voce di menu, nessun backend custom e nessuna Cloud Function obbligatoria.

## 0.13.0 — Mobile readiness audit

- Avviato il ramo 0.13.x con un audit prudente della compatibilità smartphone/tablet.
- Documentato ciò che è già consultabile da mobile e ciò che richiede adattamento UX prima di modifiche operative.
- Classificate le aree in compatibilità alta, media e bassa per uso da smartphone.
- Aggiunto `DOCUMENTAZIONE/116_MOBILE_READINESS_AUDIT_0130.md`.
- Aggiunto test browser-based `tests/mobile-readiness-0130.test.html`.
- Aggiornato il riferimento versione del backup JSON a `appVersion: 0.13.0`.
- Nessuna nuova collezione Firestore, nessuna nuova voce di menu, nessun backend custom, nessuna Cloud Function obbligatoria e nessun redesign del layout.

## 0.12.19 — Correzione UX Console docente e fix Audit sicurezza superadmin

- Corretto Audit sicurezza per superadmin quando Firestore è inizializzato come variabile globale legacy `db` ma non come `window.db`.
- Sostituito l’errore generico `Cannot read properties of undefined (reading 'collection')` con un messaggio esplicito se Firestore non è inizializzato.
- Migliorata la Console docente: il JSON tecnico del report dataset non è più visibile in primo piano, ma resta disponibile tramite “Copia report JSON” e dettagli tecnici.
- Aggiunti test browser-based 0.12.19 per Audit sicurezza superadmin e UX Console docente.
- Nessuna nuova collezione Firestore, nessuna nuova voce di menu, nessun backend custom e nessuna Cloud Function obbligatoria.

## 0.12.18 — QA didattico Manuale Utente e percorsi guidati

- Consolidato il Manuale Utente come riferimento didattico autonomo.
- Aggiunti percorsi separati per Studente, Docente e Professionista.
- Aggiunte checklist operative per i capitoli principali.
- Aggiunte esercitazioni guidate su vendite, acquisti, magazzino/quarantena, workflow, segnalazioni operative, Mini B.I. e backup/import/reset.
- Chiarita la collocazione reale di Segnalazioni operative in `Analisi → Segnalazioni operative` e il suo ruolo nel workflow operativo.
- Documentata la continuità di `operationalReports`, `users/{uid}` e `businessGroups/{groupId}`.
- Aggiunto il test browser-based `manuale-qa-didattico-01218.test.html`.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.

## 0.12.17 — Aiuto contestuale collegato al manuale

- Collegati gli aiuti rapidi contestuali ai capitoli del Manuale Utente tramite anchor stabili.
- Aggiunti `manualAnchor`, `manualAnchorFor()` e link “Apri capitolo collegato del Manuale utente” nel pannello `?`.
- Aggiornata la navigazione documentale per scorrere al capitolo richiesto dopo il caricamento del manuale.
- Aggiornato il manuale a capitoli con riferimenti 0.12.17 e anchor stabili.
- Aggiunto `DOCUMENTAZIONE/113_AIUTO_MANUALE_CONTESTUALE_01217.md`.
- Aggiunto `tests/aiuto-manuale-contestuale-01217.test.html`.
- Nessuna nuova collezione Firestore, nessun backend custom, nessuna Cloud Function obbligatoria.

## 0.12.16 — Manuale a capitoli e backup segnalazioni operative

- Trasformato il Manuale Utente in-app in un manuale strutturato per capitoli, caricato da `111_MANUALE_CAPITOLI_01216.md`.
- Aggiornato `02_MANUALE_UTENTE.md` con capitoli progressivi: primi passi, anagrafiche, vendite, acquisti, magazzino, contabilità, workflow, segnalazioni operative, Mini B.I., backup/import/reset, gruppi/permessi e uso didattico.
- Corretto `migration-module.js`: `operationalReports` è ora incluso in stima uso dati, normalizzazione backup, import/ripristino e export JSON.
- Aggiunto test browser-based `tests/backup-operational-reports-01216.test.html`.
- Aggiunto test browser-based `tests/manuale-capitoli-01216.test.html`.
- Aggiornati README, indice documentazione, mappa moduli e documentazione in-app.
- Nessuna nuova collezione Firestore: resta `operationalReports`, già documentata e già presente nelle regole.
- Nessun backend custom e nessuna Cloud Function obbligatoria.

## 0.12.15 — Aiuto contestuale non invasivo e Manuale utente visuale

- Gli aiuti rapidi non sono più box fissi sempre visibili nelle pagine operative.
- Aggiunta icona `?` accanto al titolo pagina per aprire un pannello contestuale richiudibile.
- Il Manuale utente generale resta una voce di menu in **Info → Manuale Utente**.
- La voce Manuale Utente ora carica una guida visuale operativa con card, step numerati, esempi e box di attenzione.
- Aggiornati CSS, documentazione in-app e test browser-based `manuale-aiuto-01215.test.html`.


## 0.12.14 - Manuale in-app evoluto, aiuto contestuale e guide operative

- Aggiornato `OnboardingHelpService` alla versione 0.12.14.
- Sostituiti gli aiuti rapidi generici/obsoleti con testi contestuali per vendite, acquisti, workflow, DDT, segnalazioni operative, Mini B.I., quarantena e gestione dati.
- Aggiunti passi consigliati, esempi pratici e note didattiche nei riquadri di aiuto.
- Aggiornato il manuale utente con flussi operativi completi: preventivo → ordine → DDT → fattura; ordine fornitore → DDT fornitore → quarantena → segnalazione.
- Migliorata la grafica dei riquadri di aiuto con card, icona, passi, esempi e note.
- Aggiunto test browser-based `manuale-aiuto-01214.test.html`.

## 0.12.13 — UX segnalazioni, conversione preventivi approvati e quantità intere

- Preventivi cliente: il pulsante Crea ordine cliente è abilitato solo per preventivi approvati/accettati; se il preventivo è ancora in bozza va approvato da Analisi → Workflow approvativi.
- Quantità documentali: gli input quantità di preventivi, ordini, DDT e righe fattura incrementano di 1 con i controlli browser, ma i calcoli continuano ad accettare quantità decimali inserite manualmente.
- Segnalazioni operative: elenco/dettaglio e form Nuova segnalazione sono separati in due tab, così la tabella usa tutta la larghezza disponibile.
- Aggiornati test browser-based e documentazione in-app.

## 0.12.12 — Hotfix filtri Segnalazioni operative e coerenza elenco

- Corretto il rendering dei filtri in **Workflow → Segnalazioni operative**: Stato, Area e Gravità non vengono più reimpostati ai valori predefiniti a ogni refresh/render.
- Il filtro iniziale ora è coerente con il riepilogo: `Aperte / da gestire`, `Tutte le aree`, `Tutte le gravità`.
- Risolto il caso in cui il riepilogo mostrava segnalazioni aperte, ma l'elenco risultava vuoto perché i filtri venivano forzati su `Segnalata / Magazzino / Media`.
- Aggiunto test browser-based dedicato alla persistenza dei filtri e alla coerenza elenco/riepilogo.

## 0.12.11 — Workflow approvativo operativo e coerenza bozze/documenti

- Allineato il comportamento del workflow approvativo al ciclo aziendale: l’approvazione non registra solo un evento, ma rende operativo il documento quando opportuno.
- Ordini cliente e fornitore in `draft` passano a `confirmed` dopo **Approva** nel Workflow approvativo.
- DDT cliente/fornitore selezionano solo ordini confermati/parzialmente lavorati, escludendo bozze, annullati, chiusi o ricevuti/evasI completamente.
- Aggiunta documentazione sul confine corretto tra Workflow approvativi e Segnalazioni operative.

## 0.12.10 — Collegamenti guidati segnalazioni e quarantena

- Rafforzato **Workflow → Segnalazioni operative** con una sezione di collegamento guidato a documenti operativi.
- Per gli ordini fornitore vengono mostrati solo documenti in stato lavorabile/approvato: `approved`, `confirmed`, `partially_received`, `open`, `in_progress`.
- Sono esclusi bozze, eliminati, annullati, non approvati, ricevuti, chiusi e archiviati.
- Aggiunto pulsante contestuale **Segnala quarantena** nel dettaglio DDT fornitore quando sono presenti quantità in quarantena.
- La segnalazione generata da DDT fornitore resta in **Bozza** finché l'utente non preme **Invia segnalazione**, così il passaggio a documento effettivo resta esplicito e didattico.
- Nessuna nuova collezione: resta `operationalReports`.

## 0.12.9 — Hotfix operativo segnalazioni: invio, comunicazioni interne e transizioni stato

- Aggiunti pulsanti **Salva bozza** e **Invia segnalazione** per distinguere preparazione e invio operativo.
- L'invio crea una prima comunicazione interna al reparto destinatario, utile per casi come merce ricevuta e messa in quarantena.
- Rinominato il pulsante del dettaglio in **Invia comunicazione** e aggiunto selettore reparto destinatario.
- Aggiunti pulsanti workflow guidati: prendi in carico, avvia lavorazione, richiedi info, risolvi, chiudi e annulla.
- Corretto il conflitto tra il contenitore dei messaggi pagina e il campo stato del form.
- Aggiornati test browser-based e documentazione.

---

## 0.12.8 — Segnalazioni operative: QA, permessi e pacchetto stabile

- Completato il ramo 0.12.x **Workflow → Segnalazioni operative**.
- Introdotta la collezione `operationalReports` per anomalie operative, richieste di verifica e comunicazioni interne simulate.
- Aggiornati `CDSDM_DATA_COLLECTIONS`, AppStore/globalData, permessi UI, matrice permessi, profili, regole Firestore, test e documentazione.
- Aggiunta scheda stampabile HTML/print e creazione da alert Mini B.I.
- Nessun backend custom e nessuna Cloud Function obbligatoria.

## 0.11.6 — Stabilizzazione Mini B.I. e QA regressione ruoli

## 0.11.6 — QA performance, dataset grande e pacchetto stabile B.I. operativa

- Stabilizzato il ramo 0.11.x della Mini B.I. operativa.
- Aggiunti drill-down KPI, filtri dettaglio, export CSV, report stampabile HTML/print, alert operativi e cruscotto operativo per area.
- Mantenuta logica client-side senza nuove collezioni Firestore, backend custom o Cloud Functions.
- Rafforzati test browser-based e smoke test su export, permessi, dataset vuoto/demo/grande e anti-leakage UI.

## 0.11.5 — Cruscotto operativo per area

- Le viste Vendite, Acquisti, Contabilità, Magazzino, Direzione e Didattica aggregano KPI, dettagli e alert coerenti con le aree autorizzate.

## 0.11.4 — Alert operativi B.I.

- Aggiunti alert non persistenti per DDT da fatturare, ordini aperti, crediti/debiti aperti, sotto-scorta e lotti in scadenza.

## 0.11.3 — Report B.I. stampabile HTML/print

- Aggiunta vista report generata nel browser e stampabile/salvabile come PDF dal browser.

## 0.11.2 — Export CSV Mini B.I.

- Aggiunto export CSV dei dettagli KPI e nomenclatura file didattica.

## 0.11.1 — Tabelle dettaglio e filtri avanzati

- Aggiunti filtro testo, filtro stato/severità, ordinamento e limite righe sul drill-down KPI.

## 0.11.0 — Drill-down KPI Mini B.I.

- Le card KPI aprono un pannello dettaglio con i documenti/righe che alimentano l'indicatore.


- Aggiunta suite regressiva per i profili Mini B.I.: admin, docente, vendite, acquisti, contabilità, magazzino e profilo limitato.
- Aggiunto pannello QA didattico nella pagina Mini B.I. per evidenziare la coerenza delle aree visibili per ruolo.
- Rafforzato `MiniBIService` con valutazione permessi testabile tramite policy simulata, senza alterare Firestore o dati reali.
- Aggiunto test browser-based `tests/mini-bi-0107.test.html`.

## 0.10.6 — Hotfix tab Mini B.I. e rendering aree

- Corretto il binding del modulo Mini B.I. nell'inizializzazione generale.
- Reso `render()` autosufficiente: la pagina registra i click delle tab anche se il bind centrale non è ancora passato.
- Garantita una sola tab attiva alla volta e rendering sempre coerente dell'area selezionata.
- Aggiunto test browser-based `mini-bi-0106.test.html`.

## 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Mini B.I. integrata con permessi granulari per area, riusando i moduli esistenti.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Test browser-based dedicato: `tests/mini-bi-0105.test.html`.

## 0.10.4 — Audit consultazione B.I. sensibile opzionale

- Mini B.I. integrata con permessi granulari per area, riusando i moduli esistenti.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Test browser-based dedicato: `tests/mini-bi-0104.test.html`.

## 0.10.3 — Permessi avanzati docente/simulazione

- Mini B.I. integrata con permessi granulari per area, riusando i moduli esistenti.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Test browser-based dedicato: `tests/mini-bi-0103.test.html`.

## 0.10.2 — Panoramica B.I. adattiva e anti-leakage

- Mini B.I. integrata con permessi granulari per area, riusando i moduli esistenti.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Test browser-based dedicato: `tests/mini-bi-0102.test.html`.

## 0.10.1 — Visibilità sezioni B.I. per ruolo

- Mini B.I. integrata con permessi granulari per area, riusando i moduli esistenti.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Test browser-based dedicato: `tests/mini-bi-0101.test.html`.

## 0.10.0 — Matrice permessi B.I. basata sui moduli esistenti

- Mini B.I. integrata con permessi granulari per area, riusando i moduli esistenti.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Test browser-based dedicato: `tests/mini-bi-0100.test.html`.

## 0.9.8 — QA, performance browser e pacchetto stabile mini B.I.

- QA, performance browser e pacchetto stabile mini B.I..
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.7 — Vista Didattica / Docente e scenari B.I.

- Vista Didattica / Docente e scenari B.I..
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.6 — Vista Direzione / Amministrazione

- Vista Direzione / Amministrazione.
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.5 — Vista B.I. Magazzino

- Vista B.I. Magazzino.
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.4 — Vista B.I. Contabilità operativa

- Vista B.I. Contabilità operativa.
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.3 — Vista B.I. Acquisti

- Vista B.I. Acquisti.
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.2 — Vista B.I. Vendite

- Vista B.I. Vendite.
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.1 — Filtri periodo e servizio aggregazioni B.I.

- Filtri periodo e servizio aggregazioni B.I..
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.9.0 — Fondazione mini B.I.: architettura, catalogo KPI e pagina introduttiva

- Fondazione mini B.I.: architettura, catalogo KPI e pagina introduttiva.
- Mini B.I. didattica basata su dati già presenti in Firestore/AppStore/globalData.
- Nessuna nuova collezione Firestore obbligatoria, nessun backend custom, nessuna Cloud Function richiesta.

## 0.8.12 — Consolidamento dati, test e report prima della mini B.I.

- Corretto l'indice test browser-based: titolo e badge ora indicano 0.8.12.
- Aggiunta funzione `getCDSDMDataCollections()` come accesso prudente alla fonte ufficiale `DomainConstants.DATA_COLLECTIONS`.
- Allineata l'inizializzazione di `AppStore/globalData` alla lista ufficiale delle collezioni dati.
- Sostituiti fallback lunghi duplicati in `firebase-cloud.js` e `migration-module.js` con accesso alla fonte condivisa.
- Aggiornata la versione dei backup a `0.8.12`.
- Documentato il ruolo trasversale, ma storico, di `Report gestionali` in vista della futura mini B.I.
- Aggiunti `DOCUMENTAZIONE/69_CONSOLIDAMENTO_DATI_0812.md` e `tests/consolidamento-0812.test.html`.

## 0.8.11 — Test finale riorganizzazione menu

- Test finale riorganizzazione menu.
- Aggiornati README, indice documentazione, documentazione in-app e test dove previsto.

## 0.8.10 — Documentazione della nuova struttura menu

- Documentazione della nuova struttura menu.
- Aggiornati README, indice documentazione, documentazione in-app e test dove previsto.

## 0.8.9 — Aiuto contestuale riallineato alla nuova struttura menu

- Aiuto contestuale riallineato alla nuova struttura menu.
- Aggiornati README, indice documentazione, documentazione in-app e test dove previsto.

## 0.8.8 — Guida menu aggiornata alla nuova organizzazione

- Guida menu aggiornata alla nuova organizzazione.
- Aggiornati README, indice documentazione, documentazione in-app e test dove previsto.

## 0.8.7 — Riorganizzazione menu: impostazioni, organizzazione, didattica e amministrazione

- Riorganizzazione menu: impostazioni, organizzazione, didattica e amministrazione.
- Aggiornati README, indice documentazione, documentazione in-app e test dove previsto.

## 0.8.6 — Micro rifinitura brand e Dark Mode più pulita

- Rimossa la piastra chiara troppo evidente attorno al logo nei contesti Dark Mode.
- Mantenuto il logo standard con rifinitura CSS più discreta per login, sidebar, home e pagina versione.
- Aggiornati `README`, documentazione e test di regressione UI.

## 0.8.5 — Toggle Dark Mode su una riga e logo più leggibile al buio

- Allineato il controllo `Dark mode` della sidebar su una sola riga.
- Migliorata la resa del logo in Dark Mode senza modificarne la sostanza grafica.
- Aggiornati `README`, documentazione e test di regressione UI.

## 0.8.4 — Sidebar più chiara, compatta e coerente col tema

- Sidebar resa visivamente coerente con Light Mode e Dark Mode.
- Separatore interno delle sezioni ridisegnato come etichetta non cliccabile.
- Menu laterale compattato in modo prudente per ridurre lo scroll verticale.
- Aggiornati `README`, documentazione e test di regressione UI.

## 0.8.3 — Ripristino icona classica e visibilità Dark Mode

- Ripristinata l’icona classica del progetto come base del branding applicativo.
- Rigenerati gli asset favicon/logo a partire dall’icona preferita.
- Aggiunta variante `brand-mark-darkmode.png` per migliorare la leggibilità su sfondi scuri.
- Aggiornate le aree login, sidebar, home e versione senza toccare la logica gestionale.

## 0.8.2 — Pulizia estetica login, home e sidebar

- Migliorata la schermata di login con card più pulita, badge informativi e valorizzazione del logo CDSDM.
- Migliorata la home con hero card didattica, pillole di orientamento e presentazione più elegante del nome esteso.
- Rifinita la sidebar con brand più ordinato e separatore grafico.
- Aggiunta documentazione `59_PULIZIA_ESTETICA_082.md` e test `branding-082.test.html`.

## 0.8.1 — Rifinitura branding, naming uniforme e favicon ottimizzata

- Sostituiti i riferimenti residui al nome storico **Gestionale Cloud - Professionisti** con **CDSDM** o **Cloud Data Suite for Digital Management** nei punti applicativi principali.
- Aggiornati fallback `appName` e stampa per coerenza di naming.
- Sostituito e rifinito il set `assets/branding/` con una favicon/logo più puliti e leggibili.
- Aggiornati `README`, documentazione, test e versione esportata.

## 0.8.0 — Branding applicativo, nome esteso e favicon

- Integrata l’identità del progetto **CDSDM — Cloud Data Suite for Digital Management** nell’interfaccia.
- Aggiunti favicon e asset grafici in `assets/branding/`.
- Aggiornati `index.html`, pagina versione, login, home, sidebar e top navbar con il nome esteso del progetto.
- Aggiunta documentazione `57_IDENTITA_VISIVA_080.md` e test `branding-080.test.html`.

## 0.7.9 — Correzione apertura guida contestuale ?

- Corretto il click del pulsante contestuale **?** nella top bar.
- Il pulsante ora apre la sezione **Manuale Utente / Guida menu** e scorre al capitolo collegato alla pagina attiva.
- La causa era il binding diretto dell'evento su un bottone creato dinamicamente: sostituito con binding delegato.
- Aggiunto test `tests/menu-help-click-079.test.html`.

## 0.7.8 — Guida completa alle voci di menu e aiuto contestuale

- Aggiunto `DOCUMENTAZIONE/55_GUIDA_MENU_COMPLETA_078.md` con descrizione ordinata delle principali voci di menu.
- Aggiunto pulsante contestuale **?** nella barra superiore dell'app.
- Il pulsante apre il manuale in-app e posiziona l'utente sul capitolo corrispondente alla pagina attiva.
- Aggiornata documentazione fallback `docs-content.js` per consultazione anche senza fetch.
- Aggiunto test browser-based `tests/menu-help-078.test.html`.

# Changelog

## 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Bootstrap Superadmin più tollerante: se la lettura di `appSettings/system` è negata, il sistema tenta comunque la creazione iniziale del documento.
- Messaggio di errore esplicito quando Firestore nega anche la scrittura: pubblicare `firestore.rules` del pacchetto oppure creare manualmente `appSettings/system`.
- Documentata la distinzione tra Superadmin globale e amministratore/docente del gruppo.
- Confermato il percorso corretto per gli inviti agli studenti: **Gruppi aziendali → Crea invito collaboratore**.

## 0.7.6 — Chiarimento Superadmin, docente e inviti studenti

- Chiarita la distinzione tra Superadmin globale e amministratore/docente del Gruppo aziendale.
- Migliorata la diagnostica del pannello Superadmin in caso di permessi Firestore insufficienti.
- Aggiunto collegamento rapido dal pannello Superadmin a Gruppi aziendali per creare inviti.
- Documentato il percorso corretto per invitare gli studenti.


## Versione 0.7.5 — Pacchetto stabile per uso in classe, collaudo finale e checklist docente

- Aggiunta checklist docente per uso in classe.
- Pacchetto finale progressivo 0.7.5.

---

## Versione 0.7.4 — Dataset demo, scenari didattici e casi d’uso guidati

- Aggiunto dataset demo e scenari didattici.

---

## Versione 0.7.3 — Miglioramento UX, testi di aiuto, onboarding e messaggi di errore

- Migliorata UX didattica con aiuti rapidi.

---

## Versione 0.7.2 — Manuale d’uso completo e guida didattica docente/studente

- Estesi manuale e guida passo-passo.
- Aggiunto capitolo 49.

---

## Versione 0.7.1 — QA funzionale end-to-end e correzione regressioni operative

- Aggiunto catalogo QA dei flussi principali.
- Nessuna modifica distruttiva ai dati.

---

## Versione 0.7.0 — Consolidamento tecnico generale e pulizia regressioni

- Analizzato il pacchetto reale 0.6.6 e prodotto `REPORT_INCOERENZE_0.7.0.md`.
- Rimosso `js/features/warehouse/customer-quotes-module.js`, modulo legacy non caricato e non allineato a `CDSDM_DATA_COLLECTIONS`.
- Allineate cache iniziali `globalData` e `AppStore` con `migrationReports`, `permissionProfiles`, `permissionMatrices` e `securityAccessReports`.
- Aggiornato backup/import/reset: export `appVersion: 0.7.0`, import normalizzato e stima uso dati includono le collezioni 0.6.x.
- Aggiornate versione UI, README, workflow tecnico, manuale, mappa moduli, indice documentazione e documentazione in-app.
- Aggiornato `tests/index.html` e aggiunta suite browser-based `tests/consolidamento-070.test.html`.
- Confermata la compatibilità con `users/{uid}` legacy e `businessGroups/{groupId}` senza backend custom e senza Cloud Functions obbligatorie.

---

# Versione 0.6.6 — Audit sicurezza, report utenti e QA accessi

La versione 0.6.6 consolida il ramo gestione utenti 0.6.x aggiungendo una pagina di audit per admin, teacher e superadmin.

## Aggiunto

- `SecurityAuditService`;
- `security-audit-module.js`;
- sezione **Impostazioni → Audit sicurezza**;
- report membri, ruoli, profili, override e permessi effettivi;
- findings automatici su configurazioni rischiose;
- checklist QA accessi;
- salvataggio report in `securityAccessReports`;
- documentazione `46_AUDIT_SICUREZZA_QA_ACCESSI.md`;
- test `security-audit-066.test.html`.

## Aggiornato

- `PermissionsPolicy` alla versione 0.6.6;
- `PermissionMatrixService` e `PermissionProfilesService` con scope `securityAudit`;
- `firestore.rules` con match dedicato a `securityAccessReports`;
- `CDSDM_DATA_COLLECTIONS` per backup/import/reset.

---

# Versione 0.6.5 — Regole Firestore rafforzate

La versione 0.6.5 rafforza la sicurezza dati dei Gruppi aziendali usando i permessi effettivi denormalizzati sui membri.

## Novità

- `firestore.rules` legge `effectiveProfilePermissions` quando disponibile;
- mappatura collection → scope applicativo;
- `read/write/admin` applicati anche lato Firestore per i dati di gruppo;
- eliminazioni più prudenziali: solo admin/teacher/superadmin o livello `admin` sullo scope;
- fallback ruoli per compatibilità con gruppi legacy;
- `PermissionsPolicy` aggiornata alla 0.6.5;
- test `firestore-rules-065.test.html`;
- documentazione `45_REGOLE_FIRESTORE_RAFFORZATE.md`.

---

# Versione 0.6.4 — Override permessi per singolo utente

La versione 0.6.4 introduce eccezioni individuali sui permessi dei membri dei Gruppi aziendali.

## Aggiunto

- sezione **Impostazioni → Override permessi**;
- `js/features/business-groups/permission-overrides-service.js`;
- `js/features/business-groups/permission-overrides-module.js`;
- livelli override `inherit`, `none`, `read`, `write`, `admin`;
- vista comparativa: permesso ereditato dal profilo, override e permesso effettivo;
- salvataggio override su `members/{uid}` e `users/{uid}/memberships/{groupId}`;
- audit applicativo `permission_overrides_saved`;
- test `tests/permission-overrides-064.test.html`.

## Aggiornato

- `PermissionsPolicy` passa a 0.6.4 e fonde profilo + override;
- `PermissionProfilesService` mantiene gli override esistenti quando cambia il profilo assegnato a un membro;
- menu, documentazione, manuale in-app e mappa moduli aggiornati.

## Nota tecnica

Gli override sono controlli applicativi/UX. La 0.6.5 rafforzerà le regole Firestore su ruoli operativi e operazioni sensibili.

---

# Versione 0.6.3 — Matrice permessi moduli

La versione 0.6.3 formalizza il catalogo moduli e il significato operativo dei livelli `none`, `read`, `write`, `admin`.

## Aggiunto

- sezione **Impostazioni → Matrice permessi**;
- `js/features/business-groups/permission-matrix-service.js`;
- `js/features/business-groups/permission-matrix-module.js`;
- collezione `businessGroups/{groupId}/permissionMatrices`;
- catalogo moduli con scope, categoria e voci menu collegate;
- modello azioni per livello: menu, lettura, crea, modifica, elimina, export, import, configura;
- salvataggio, reset e copia JSON della matrice;
- test `tests/permission-matrix-063.test.html`.

## Aggiornato

- `PermissionsPolicy` passa a 0.6.3 e espone funzioni per livello permesso e catalogo moduli;
- `PermissionProfilesService` usa il catalogo modulo 0.6.3 quando disponibile;
- `firestore.rules` protegge `permissionMatrices`;
- backup/import/reset includono `permissionMatrices`;
- documentazione, mappa moduli e manuale in-app aggiornati.

## Nota tecnica

La matrice 0.6.3 resta una configurazione UI/applicativa. Il blocco Firestore granulare su profili e operazioni sensibili è previsto nella 0.6.5.

---

# Versione 0.6.2 — Profili permesso configurabili per gruppo

La versione 0.6.2 introduce una matrice permessi configurabile per Gruppo aziendale.

## Novità

- Nuova sezione **Impostazioni → Profili permesso**.
- Nuovo servizio `PermissionProfilesService`.
- Nuovo modulo UI `permission-profiles-module.js`.
- Nuova collezione Firestore `businessGroups/{groupId}/permissionProfiles`.
- Profili predefiniti per admin, teacher, accounting, sales, purchases, warehouse e readonly.
- Matrice moduli con livelli `none`, `read`, `write`, `admin`.
- Assegnazione profili ai membri del gruppo.
- Salvataggio profilo su member e membership utente.
- Inviti con profilo iniziale opzionale.
- `PermissionsPolicy` aggiornata alla 0.6.2 per leggere `profilePermissions` quando presenti.
- Test `tests/permission-profiles-062.test.html`.

## Nota tecnica

I profili permesso sono una granularità applicativa/front-end. Le regole Firestore restano ancorate a membership e ruolo, con match esplicito per `permissionProfiles`. Il rafforzamento lato rules è previsto nella 0.6.5.

---

# Versione 0.6.1 — Inviti avanzati e onboarding collaboratori

La versione 0.6.1 completa il flusso di registrazione con invito introdotto nella 0.6.0.

## Aggiunto

- stati invito `pending`, `accepted`, `revoked`, `expired`;
- validità configurabile dell’invito;
- note onboarding;
- filtri inviti per email e stato;
- rigenerazione codice invito;
- consolidamento inviti scaduti;
- istruzioni copiabili per il collaboratore;
- test `tests/invites-onboarding-061.test.html`.

## Aggiornato

- `BusinessGroupsService` passa a versione 0.6.1;
- `business-groups-module.js` mostra pannello inviti avanzato;
- `auth-module.js` gestisce meglio il fallimento della registrazione con invito e prova a rimuovere l’account appena creato;
- `firestore.rules` verifica la scadenza degli inviti salvati come timestamp;
- README, manuale, workflow tecnico e documentazione in-app aggiornati.

## Non modificato

- nessun backend custom;
- nessuna Cloud Function obbligatoria;
- nessuna creazione amministrativa server-side di account Auth.

---

# Versione 0.6.0 — Bootstrap superadmin e registrazione con invito

La versione 0.6.0 apre il ramo gestione utenti applicativa sopra la base multiutente 0.5.x.

## Aggiunto

- pulsante **Registrati con invito** nella schermata di login;
- registrazione Firebase Auth con `createUserWithEmailAndPassword`;
- accettazione invito automatica dopo creazione account;
- pannello **Impostazioni → Superadmin**;
- `js/features/business-groups/superadmin-service.js`;
- `js/features/business-groups/superadmin-module.js`;
- documento globale `appSettings/system`;
- profili applicativi leggeri `userProfiles/{uid}`;
- test `tests/superadmin-registration-060.test.html`;
- documentazione `40_SUPERADMIN_REGISTRAZIONE_INVITO.md`.

## Aggiornato

- `auth-module.js` gestisce login, reset password e registrazione con invito;
- `BusinessGroupsService` passa a versione 0.6.0;
- accettazione invito più compatibile con le regole Firestore: l’invitato crea member/membership ma non aggiorna il root del gruppo;
- `firestore.rules` introduce funzioni `isGlobalSuperadmin` e `validSystemBootstrap`;
- `PermissionsPolicy` include il target `superadmin` per admin/teacher;
- `index.html`, README, mappa moduli, workflow tecnico e documentazione in-app aggiornati.

## Non modificato

- nessun backend custom;
- nessuna Cloud Function obbligatoria;
- nessuna creazione amministrativa server-side di account Auth;
- i dati legacy personali non vengono cancellati.
## 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Reso il bootstrap Superadmin più tollerante quando la lettura preventiva di `appSettings/system` è negata da regole Firestore non ancora allineate.
- Migliorato il messaggio di errore: se Firestore nega anche la scrittura, occorre pubblicare `firestore.rules` del pacchetto o creare manualmente `appSettings/system` in Firebase Console.
- Chiarito che gli inviti studenti si creano da **Gruppi aziendali**, non dal pannello Superadmin.
