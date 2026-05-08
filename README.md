## CDSDM Versione 0.13.12 — Hotfix registrazione invito e rules retry-safe
La versione **0.13.12** corregge il flusso di registrazione con invito in presenza di errori Firestore successivi all’accettazione e aggiorna le regole Firestore per rendere il retry dell’invitato più sicuro. Dopo l’aggiornamento è necessario pubblicare `firestore.rules` nel progetto Firebase.

## CDSDM Versione 0.13.3 — Workflow e Segnalazioni operative mobile
La versione **0.13.3** migliora l'uso da smartphone dei flussi già esistenti di Workflow approvativi e Segnalazioni operative. Le modifiche sono UI/UX conservative: pulsanti più comodi, suggerimenti mobile, dettagli in colonna e nessuna variazione a Firestore, permessi, menu o dati.

## CDSDM Versione 0.13.2 — Tabelle e liste responsive
La versione **0.13.2** introduce un adattamento progressivo delle tabelle e delle liste su smartphone: le tabelle restano classiche su desktop/tablet e diventano schede leggibili sotto i 576 px, senza modificare flussi applicativi, dati, Firestore, menu o permessi.

## CDSDM Versione 0.13.0 — Mobile readiness audit
La versione **0.13.0** avvia il ramo mobile con una verifica prudente della compatibilità reale smartphone/tablet. Non introduce nuove schermate operative, nuove voci di menu, nuove collezioni Firestore o redesign: documenta cosa è già consultabile da mobile, cosa è solo parzialmente utilizzabile e cosa richiede adattamento UX nelle prossime micro-release.

## CDSDM Versione 0.12.19 — Hotfix Console docente e Audit sicurezza superadmin
La versione **0.12.19** è una release correttiva mirata: migliora la UX della Console docente nascondendo il JSON tecnico in una sezione dettagli e corregge l’Audit sicurezza per accesso superadmin quando Firestore è disponibile come variabile globale legacy `db`. Non introduce nuovi flussi, nuove voci di menu o nuove collezioni Firestore.

Release conservativa di stabilizzazione documentale e dati:

- Gli aiuti rapidi aperti con **?** accanto ai titoli pagina ora rimandano al capitolo pertinente del Manuale Utente.
- Il manuale a capitoli resta il riferimento principale e viene arricchito con anchor stabili per Vendite, Acquisti, Magazzino, Contabilità, Workflow, Segnalazioni operative, Mini B.I., Backup e Permessi.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.

### Continuità 0.12.16

- `Info → Manuale Utente` carica ora un manuale a capitoli (`111_MANUALE_CAPITOLI_01216.md`), non solo una guida visuale per feature.
- Backup/import/ripristino JSON includono ora `operationalReports`, mantenendo coerenti segnalazioni operative, reset e collezioni reali.
- Nessuna nuova collezione Firestore, nessun backend custom e nessuna Cloud Function obbligatoria.
- Compatibilità mantenuta con `users/{uid}` legacy e `businessGroups/{groupId}`.


Questa release introduce e stabilizza il ramo 0.12.x dedicato alle **Segnalazioni operative**: anomalie, richieste di verifica, comunicazioni interne simulate, scheda stampabile e integrazione prudente con gli alert Mini B.I.

- Nuova collezione Firestore: `operationalReports`.
- Voce menu reale: `Analisi → Segnalazioni operative`.
- Persistenza principale su Firestore, compatibile con `users/{uid}` e `businessGroups/{groupId}`.
- Nessun backend custom e nessuna Cloud Function obbligatoria.
- Aggiornati permessi UI, matrice permessi, Firestore rules, documentazione e test browser-based.

## CDSDM Versione 0.11.6 — Mini B.I. operativa: drill-down, export e QA performance

Questa release conclude il ramo 0.11.x dedicato all'analisi operativa della Mini B.I. didattica.

Funzioni principali:

- drill-down sulle card KPI;
- dettaglio filtrabile, ordinabile e limitato per performance browser;
- export CSV generato nel browser;
- report HTML stampabile/salvabile come PDF dal browser;
- alert operativi non persistenti;
- cruscotto operativo per area;
- QA browser-based su dataset vuoto/demo/grande, export e permessi.

Restano invariati Firestore rules, collezioni, backend e Cloud Functions. Gli indicatori sono didattici e non certificativi.

## CDSDM Versione 0.10.6 — Hotfix tab Mini B.I.

Questa patch corregge il rendering delle tab operative nella pagina **Analisi → Mini B.I. didattica**. Il click su Direzione, Vendite, Acquisti, Contabilità, Magazzino e Didattica aggiorna ora sempre il contenuto dell'area selezionata, con una sola tab attiva alla volta.

Nessuna modifica a Firestore, regole, backend, Cloud Functions o collezioni dati.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.10.x

- Mini B.I. mappata sui permessi dei moduli esistenti.
- Viste B.I. visibili per ruolo/area: Direzione, Vendite, Acquisti, Contabilità, Magazzino, Didattica.
- Panoramica adattiva anti-leakage: gli aggregati trasversali non vengono mostrati a profili non autorizzati.
- Audit consultazione predisposto ma disattivato di default.
- Nessuna nuova collezione Firestore e nessuna Cloud Function.

### Novità 0.9.8

- QA, performance browser e pacchetto stabile mini B.I..
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.7

- Vista Didattica / Docente e scenari B.I..
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.6

- Vista Direzione / Amministrazione.
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.5

- Vista B.I. Magazzino.
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.4

- Vista B.I. Contabilità operativa.
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.3

- Vista B.I. Acquisti.
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.2

- Vista B.I. Vendite.
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.1

- Filtri periodo e servizio aggregazioni B.I..
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

Release del ramo mini B.I. didattica. Mantiene Firebase Auth + Firestore, non introduce backend custom e non rende obbligatorie Cloud Functions.

### Novità 0.9.0

- Fondazione mini B.I.: architettura, catalogo KPI e pagina introduttiva.
- Test browser-based aggiornati nella cartella `tests`.
- Documentazione aggiornata in `DOCUMENTAZIONE`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.12** consolida la base tecnica prima del ramo mini B.I. 0.9.x. Non introduce nuove collezioni Firestore, non modifica le regole e non richiede backend custom.

### Novità 0.8.12

- corretta l'incoerenza dell'indice test browser-based, ora allineato a 0.8.12;
- centralizzata la lettura delle collezioni dati tramite `DomainConstants.DATA_COLLECTIONS`, `CDSDM_DATA_COLLECTIONS` e `getCDSDMDataCollections()`;
- allineata l'inizializzazione `AppStore/globalData` alla fonte ufficiale delle collezioni;
- rimossi fallback lunghi duplicati nei moduli principali di caricamento/reset dati;
- aggiornato `appVersion` dei backup a 0.8.12;
- chiarito il ruolo di `Report gestionali` come vista trasversale operativa, distinta dalla futura mini B.I.;
- aggiunti documentazione e test browser-based di consolidamento.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.11** aggiunge il test browser-based finale della riorganizzazione menu.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.10** aggiorna la documentazione generale per spiegare la nuova struttura del menu introdotta nel ramo 0.8.7–0.8.9.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.9** riallinea il pulsante `?` alla nuova struttura del menu.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.8** aggiorna la guida completa alle voci di menu per riflettere la nuova organizzazione introdotta nella 0.8.7.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.7** avvia la riorganizzazione del menu laterale separando le funzioni operative da quelle di utenti, didattica e amministrazione tecnica.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.6** effettua una micro-rifinitura estetica del blocco brand, soprattutto nella schermata di login e nella sidebar. L’obiettivo è eliminare l’effetto di bordino chiaro/pixellato percepito in Dark Mode, mantenendo invariata l’identità del logo.

### Novità 0.8.6

- rimosso l’uso del logo con piastra chiara nei contesti dark;
- resa Dark Mode più pulita con solo interventi CSS su contrasto, glow e sfondo del contenitore;
- lieve rifinitura del blocco brand in login/sidebar;
- aggiornati changelog, documentazione e test.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.5** rifinisce ulteriormente la sidebar: il controllo **Dark mode** rimane su una sola riga e il logo mantiene la stessa identità grafica, ma viene reso più leggibile in **Dark Mode** con un trattamento visivo più adatto agli sfondi scuri.

### Novità 0.8.5

- toggle **Dark mode** e testo allineati su una sola riga nella sidebar;
- migliorata la resa del logo in Dark Mode con contrasto, glow e cornice leggera;
- nessuna modifica al disegno sostanziale del logo;
- aggiornati documentazione, changelog e test.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.4** migliora la leggibilità del menu laterale. I separatori interni risultano ora chiaramente distinti dalle vere voci di menu, la sidebar segue in modo più evidente il tema chiaro/scuro e la densità verticale è stata leggermente ridotta per limitare lo scroll.

### Novità 0.8.4

- sidebar chiara in Light Mode e più coerente col resto dell’interfaccia;
- sidebar più profonda e leggibile in Dark Mode;
- separatori (`Documenti commerciali`, `Fatturazione`, ecc.) ridisegnati come etichette e non come pseudo-pulsanti;
- voci di menu più visibili rispetto ai separatori;
- compattazione prudente di padding/spaziature della sidebar;
- aggiornati documentazione e test.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.3** ripristina come icona principale la variante grafica precedente, preferita per riconoscibilità, e migliora la leggibilità nei contesti a sfondo scuro con un trattamento grafico più adatto alla **Dark Mode**.

### Novità 0.8.3

- ripristinata l’icona classica come base del brand;
- rigenerati `brand-mark.png`, favicons e asset collegati a partire dall’icona classica;
- aggiunta variante `brand-mark-darkmode.png` con supporto visivo migliore su sfondi scuri;
- aggiornati login, sidebar, home e pagina versione per usare l’icona ripristinata;
- aggiornata documentazione e test.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.2** migliora la presentazione visiva dell’app nei punti più esposti all’utente: login, sidebar e home. È una rifinitura grafica: non modifica dati, Firestore, backup/import/reset, permessi o flussi gestionali.

### Novità 0.8.2

- login più ordinato con logo CDSDM, badge informativi e card più leggibile;
- home con hero card più chiara e orientata al contesto didattico;
- sidebar con brand più pulito e separatore grafico;
- CSS dedicato a tema chiaro/scuro e mobile;
- documentazione e test aggiornati.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.1** completa il lavoro iniziato nella 0.8.0: sostituisce i riferimenti residui al nome storico **Gestionale Cloud - Professionisti** nei punti applicativi più rilevanti e integra un set grafico più pulito per **logo/favicons**.

### Novità 0.8.1

- sostituiti i riferimenti residui al vecchio naming con **CDSDM** o **Cloud Data Suite for Digital Management** dove più opportuno;
- aggiornato il fallback `appName` del bootstrap superadmin;
- aggiornato il fallback del servizio stampe;
- rifinito il set grafico in `assets/branding/` con nuova icona sorgente e favicon più leggibili;
- aggiornati versione, changelog, documentazione e test.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.8.0** integra l’identità del progetto **CDSDM — Cloud Data Suite for Digital Management** nell’interfaccia. Il rilascio aggiunge favicon, asset di branding e rende visibile il nome esteso nei punti più utili per gli utenti: login, sidebar, top bar, home e pagina versione.

### Novità 0.8.0

- aggiunta favicon (`favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`);
- nuovo asset `assets/branding/brand-mark.png`;
- titolo pagina aggiornato a **CDSDM — Cloud Data Suite for Digital Management**;
- nome esteso visibile in login, sidebar, top navbar, home e schermata versione;
- documentazione aggiornata con nota di branding e identità visiva;
- nuovo test browser-based di presenza branding e favicon.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.7.9** corregge il pulsante contestuale **?** introdotto nella 0.7.8: il tooltip era visibile, ma in alcuni caricamenti il click non apriva la guida perché il bottone veniva creato dinamicamente dopo il binding diretto dell'evento. Ora il click è gestito con binding delegato e apre la sezione **Manuale Utente** sulla guida menu corrispondente alla pagina attiva.

### Correzioni 0.7.9

- Click del pulsante **?** reso operativo con binding delegato `click.cdsdmContextHelp`.
- Apertura esplicita della sezione **Manuale Utente / Guida menu**.
- Scroll automatico al capitolo collegato alla pagina visualizzata.
- Aggiunta documentazione `DOCUMENTAZIONE/56_CORREZIONE_AIUTO_CONTESTUALE_079.md`.
- Aggiunto test browser-based `tests/menu-help-click-079.test.html`.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.7.8** aggiunge una guida ordinata per ogni voce di menu e un pulsante contestuale **?** nella barra superiore. Il pulsante apre il manuale sul capitolo collegato alla pagina visualizzata, migliorando uso didattico e onboarding senza introdurre nuove funzioni gestionali.

### Novità 0.7.8
- nuovo documento `DOCUMENTAZIONE/55_GUIDA_MENU_COMPLETA_078.md`;
- pulsante contestuale **?** nella barra superiore;
- collegamento automatico tra pagina attiva e paragrafo della guida;
- aggiornamento documentazione in-app e indice;
- test browser-based dedicato alla guida menu.

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Corretto il flusso di bootstrap Superadmin quando la lettura preventiva di `appSettings/system` è bloccata da regole Firestore non allineate.
- Aggiunto messaggio operativo per pubblicare `firestore.rules` o creare manualmente `appSettings/system`.
- Ribadito che gli inviti studenti si creano da **Gruppi aziendali**, non dal pannello Superadmin.

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Chiuso ramo 0.7.x come pacchetto stabile.
- Aggiunta checklist docente e test finale.

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Aggiunto dataset demo statico.
- Aggiunto validatore dataset non distruttivo.

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Aggiunto OnboardingHelpService.
- Aggiunti testi di aiuto e CSS dedicato.

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Consolidato manuale d’uso.
- Aggiunta guida didattica docente/studente.

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

- Aggiunto servizio E2EQaService.
- Aggiunto test browser-based QA end-to-end.

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.7.0** apre il ramo 0.7.x dedicato alla stabilizzazione didattica. Non introduce nuove funzioni gestionali importanti: consolida struttura, versioni, backup/import/reset, documentazione, test e coerenza tra moduli, Firestore e permessi.

### Novità 0.7.0

- analisi reale dello ZIP 0.6.6 e report sintetico `REPORT_INCOERENZE_0.7.0.md`;
- rimozione del modulo legacy non caricato `customer-quotes-module.js`, duplicato rispetto a `quotes-module.js`;
- allineamento `globalData`, `AppStore` e `CDSDM_DATA_COLLECTIONS` sulle collezioni 0.6.x;
- backup/import/reset consolidati per `permissionProfiles`, `permissionMatrices`, `securityAccessReports` e `migrationReports`;
- export JSON aggiornato con `appVersion: 0.7.0`;
- indice test aggiornato e nuova suite `tests/consolidamento-070.test.html`;
- documentazione, manuale, workflow tecnico, mappa moduli e documentazione in-app aggiornati.

### Roadmap 0.7.x

```text
0.7.0 Consolidamento tecnico generale e pulizia regressioni
0.7.1 QA funzionale end-to-end sui flussi principali
0.7.2 Manuale d'uso completo e guida didattica
0.7.3 Miglioramento UX, testi di aiuto e onboarding in-app
0.7.4 Dataset demo aggiornato e scenari didattici completi
0.7.5 Pacchetto stabile per uso in classe
```

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.6.6** chiude il ramo 0.6.x della gestione utenti introducendo una sezione di audit per verificare membri, inviti, profili, override, permessi effettivi e checklist QA accessi del Gruppo aziendale attivo.

### Novità 0.6.6

- nuova sezione **Impostazioni → Audit sicurezza**;
- nuovo `SecurityAuditService`;
- nuovo modulo UI `security-audit-module.js`;
- report utenti con ruoli, profili, override e `effectiveProfilePermissions`;
- findings automatici su criticità comuni: readonly con scrittura, membri senza permessi effettivi, inviti scaduti, assenza admin/teacher;
- checklist QA accessi per simulazioni multiutente;
- salvataggio report in `businessGroups/{groupId}/securityAccessReports`;
- backup/import/reset aggiornati con `securityAccessReports`;
- `firestore.rules` aggiornate;
- test browser-based `tests/security-audit-066.test.html`.

### Roadmap 0.6.x completata

```text
0.6.0 Bootstrap superadmin e registrazione con invito
0.6.1 Inviti avanzati e onboarding collaboratori
0.6.2 Profili permesso configurabili per gruppo
0.6.3 Matrice permessi moduli
0.6.4 Override permessi per singolo utente
0.6.5 Regole Firestore rafforzate su ruoli/profili
0.6.6 Audit sicurezza, report utenti e QA accessi
```

---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.6.5** rafforza la sicurezza dei Gruppi aziendali portando nelle regole Firestore la matrice effettiva dei permessi introdotta in 0.6.2-0.6.4.

### Novità 0.6.5

- `firestore.rules` aggiornato con mappatura collection → scope applicativo;
- lettura/scrittura dati gruppo basata su `businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions` quando presente;
- fallback prudente ai ruoli operativi per gruppi legacy senza permessi effettivi;
- eliminazioni riservate ad admin/teacher/superadmin o a membri con livello `admin` sullo scope;
- mantenimento delle collezioni sensibili riservate ad admin/teacher;
- `PermissionsPolicy` allineata alla versione 0.6.5;
- nuova documentazione `DOCUMENTAZIONE/45_REGOLE_FIRESTORE_RAFFORZATE.md`;
- nuovo test `tests/firestore-rules-065.test.html`.

### Modello sicurezza aggiornato

```text
0.6.2 Profilo permesso = matrice standard assegnabile al membro
0.6.3 Matrice moduli = definizione dei livelli none/read/write/admin
0.6.4 Override utente = eccezioni puntuali sul singolo membro
0.6.5 Rules rafforzate = Firestore legge effectiveProfilePermissions quando disponibile
```

### Nota operativa

Le regole Firestore diventano effettive solo dopo la pubblicazione su Firebase Console o con:

```bash
firebase deploy --only firestore:rules
```


---

## CDSDM Versione 0.10.5 — QA sicurezza B.I. e pacchetto stabile permessi

La versione **0.6.4** completa il livello applicativo dei permessi introducendo override individuali sui membri dei Gruppi aziendali. Un admin/teacher può personalizzare l'accesso di un singolo collaboratore senza modificare il profilo permesso assegnato al ruolo o agli altri utenti.

### Novità 0.6.4

- nuova sezione **Impostazioni → Override permessi**;
- nuovo servizio `PermissionOverridesService`;
- nuovo modulo UI `permission-overrides-module.js`;
- ordine effettivo dei permessi: **ruolo → profilo permesso → override utente**;
- override per modulo con livelli `inherit`, `none`, `read`, `write`, `admin`;
- riepilogo membro, profilo ereditato, override e livello effettivo;
- salvataggio denormalizzato su:
  - `businessGroups/{groupId}/members/{uid}`;
  - `users/{uid}/memberships/{groupId}`;
- `PermissionsPolicy` aggiornata alla 0.6.4 per applicare `effectiveProfilePermissions` e `permissionOverrides`;
- aggiornamento profili: quando si cambia profilo a un membro, gli override esistenti vengono mantenuti e ricalcolati;
- audit applicativo degli override in `auditEvents`;
- test browser-based `tests/permission-overrides-064.test.html`.

### Relazione con 0.6.2 e 0.6.3

```text
0.6.2 Profili permesso = livelli standard assegnati ai membri
0.6.3 Matrice permessi = azioni associate a ogni livello
0.6.4 Override utente = eccezioni puntuali sul singolo membro
```

### Persistenza

Gli override non richiedono una nuova collezione obbligatoria. Sono salvati come campi denormalizzati sui documenti membro/membership:

```text
businessGroups/{groupId}/members/{uid}.permissionOverrides
businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions
users/{uid}/memberships/{groupId}.permissionOverrides
users/{uid}/memberships/{groupId}.effectiveProfilePermissions
```

### Nota sicurezza

Gli override 0.6.4 restano una granularità applicativa/front-end didattica. Le regole Firestore continuano a proteggere membership, ruoli e collezioni principali. Il rafforzamento delle rules su profili/operazioni sensibili resta previsto nella **0.6.5**.

## 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Reso il bootstrap Superadmin più tollerante quando la lettura preventiva di `appSettings/system` è negata da regole Firestore non ancora allineate.
- Migliorato il messaggio di errore: se Firestore nega anche la scrittura, occorre pubblicare `firestore.rules` del pacchetto o creare manualmente `appSettings/system` in Firebase Console.
- Chiarito che gli inviti studenti si creano da **Gruppi aziendali**, non dal pannello Superadmin.



### 0.13.0 — Mobile readiness audit
- Audit prudente su compatibilità smartphone/tablet.
- Classificazione aree ad alta, media e bassa compatibilità mobile.
- Aggiunta documentazione `116_MOBILE_READINESS_AUDIT_0130.md` e test `mobile-readiness-0130.test.html`.
- Nessuna nuova collezione Firestore, nessuna nuova voce di menu, nessun backend custom e nessuna Cloud Function obbligatoria.

### 0.12.19 — Hotfix Console docente e Audit sicurezza superadmin
- Console docente: il report JSON tecnico non è più mostrato in primo piano sotto gli indicatori dataset.
- Console docente: aggiunta sezione dettagli tecnici chiusa e pulsante “Copia report JSON”.
- Audit sicurezza: corretto accesso superadmin con Firestore inizializzato come `db` legacy ma non come `window.db`.
- Aggiunti test browser-based `security-audit-superadmin-01219.test.html` e `teacher-console-ux-01219.test.html`.
- Nessuna nuova collezione Firestore e nessuna modifica a `firestore.rules`.

### 0.12.18 — QA didattico Manuale Utente e percorsi guidati

- Manuale Utente trasformato in riferimento didattico autonomo.
- Percorsi Studente, Docente e Professionista.
- Checklist operative per capitolo.
- Esercitazioni guidate sui flussi esistenti.
- Test browser-based di QA didattico.
- Nessuna nuova collezione Firestore e nessun backend custom.

### 0.12.17 — Aiuto contestuale collegato al manuale

- Collegati gli aiuti rapidi contestuali ai capitoli del Manuale Utente tramite anchor stabili.
- Aggiunto `manualAnchorFor()` in `OnboardingHelpService` e gestione di `window.CDSDM_MANUAL_TARGET_ANCHOR` nella navigazione.
- Aggiunto test `tests/aiuto-manuale-contestuale-01217.test.html`.
- Aggiornata documentazione 0.12.17 senza nuove collezioni Firestore.

### 0.12.16 — Manuale a capitoli e backup segnalazioni operative

- Manuale Utente in-app riorganizzato per capitoli tramite `111_MANUALE_CAPITOLI_01216.md`.
- `operationalReports` incluso in backup/import/ripristino JSON e nella stima uso dati.
- Aggiunti test browser-based `manuale-capitoli-01216.test.html` e `backup-operational-reports-01216.test.html`.
- Firestore rules invariate: la collezione era già mappata.

### 0.12.15 — Aiuto contestuale non invasivo e Manuale utente visuale

- Gli aiuti rapidi non occupano più spazio fisso nelle pagine operative.
- Ogni sezione principale può mostrare una piccola icona `?` accanto al titolo pagina.
- Il pannello di aiuto rapido è apribile/chiudibile e contiene passi consigliati, esempio e nota operativa.
- La voce **Info → Manuale Utente** apre una guida visuale generale con card, step, esempi e avvertenze.

### 0.12.14 — Manuale in-app evoluto, aiuto contestuale e guide operative

- Aiuto rapido aggiornato alla versione 0.12.14.
- Guide contestuali arricchite con passi, esempi e note didattiche.
- Manuale utente aggiornato sui flussi Vendite, Acquisti, Workflow, Segnalazioni operative e Mini B.I.
- Nessuna nuova collezione Firestore, nessun backend custom, nessuna Cloud Function obbligatoria.

### 0.12.13 — UX segnalazioni, conversione preventivi approvati e quantità intere

- Corretto il reset involontario dei filtri Stato/Area/Gravità nella pagina **Workflow → Segnalazioni operative**.
- Il filtro iniziale mostra ora tutte le segnalazioni aperte/da gestire e non solo `Segnalata / Magazzino / Media`.
- Aggiunto test browser-based `operational-reports-01212.test.html`.

### 0.12.11 — Workflow approvativo operativo e coerenza bozze/documenti

- Chiarito che gli ordini cliente/fornitore in Bozza diventano operativi tramite **Analisi → Workflow approvativi → Approva**.
- L’approvazione workflow aggiorna anche lo stato operativo del documento: ordini cliente/fornitore da `draft` a `confirmed`; DDT/fatture/acquisti bozze assumono uno stato operativo coerente quando approvati.
- I DDT cliente/fornitore continuano a proporre solo ordini lavorabili, quindi confermati o parzialmente evasi/ricevuti.
- Le segnalazioni operative restano dedicate ad anomalie e comunicazioni interne, non sostituiscono il ciclo Ordine → DDT/Ricevimento.

### 0.12.10 — Collegamenti guidati segnalazioni e quarantena

- Aggiunto collegamento guidato a documenti operativi nelle Segnalazioni operative.
- Gli ordini fornitore selezionabili sono filtrati su stati lavorabili/approvati, escludendo bozze, eliminati, annullati, non approvati, ricevuti o chiusi.
- Aggiunto pulsante contestuale `Segnala quarantena` nel dettaglio DDT fornitore con quantità in quarantena.
- Chiarito il flusso Bozza → Invia segnalazione → Segnalata.

### 0.12.9 — Hotfix operativo segnalazioni

- Distinti **Salva bozza** e **Invia segnalazione** nella creazione delle segnalazioni operative.
- Aggiunta comunicazione interna iniziale verso il reparto destinatario quando la segnalazione diventa effettiva.
- Rinominato il pulsante del dettaglio in **Invia comunicazione**.
- Aggiunti pulsanti workflow guidati: invia, prendi in carico, avvia lavorazione, richiedi info, risolvi, chiudi/annulla.
- Corretto il conflitto DOM tra messaggio di stato pagina e campo stato del form.



### 0.12.13 — UX segnalazioni, conversione preventivi approvati e quantità intere
- Preventivi cliente: conversione in ordine cliente consentita solo dopo approvazione/accettazione tramite Workflow approvativo.
- Quantità documentali: incremento browser a 1, mantenendo accettazione di valori decimali nei calcoli.
- Segnalazioni operative: elenco/dettaglio e nuova segnalazione separati in tab per usare l’intera larghezza della pagina.


### 0.13.12 — Coerenza menu documenti commerciali

- Uniformato il menu di Preventivi, Ordini cliente/fornitore e DDT cliente/fornitore.
- Le voci `Nuovo Preventivo cliente`, `Nuovo Ordine cliente` e `Nuovo Ordine fornitore` sono state trasformate in pulsanti nelle rispettive pagine elenco.
- Rinominati `DDT cliente` e `DDT fornitore` in `Elenco DDT cliente` e `Elenco DDT fornitore`.
- Backup JSON aggiornato a `appVersion: 0.13.12`.
- Nessuna modifica a Firestore rules, collezioni, permessi o backend.

### 0.13.5 — Form complessi e documenti gestionali mobile-aware
- Aggiunto `js/ui/mobile-documents-service.js` per miglioramenti mobile non invasivi su form, card, modali e pulsanti delle sezioni documentali.
- Ottimizzate consultazione e modifiche brevi da smartphone per fatture, preventivi, ordini, DDT, acquisti e magazzino.
- Aggiornato documento 121 e test browser-based 0.13.5.
- Backup JSON aggiornato a `appVersion: 0.13.5`.
- Nessuna modifica a Firestore rules, collezioni, permessi, menu o backend.

### 0.13.4 — Mini B.I. sintetica mobile

- Nuovo servizio `js/ui/mobile-bi-service.js`.
- Migliorie mobile per tab aree operative, card KPI, drill-down, azioni CSV/report e alert B.I.
- Nuovo documento 120 e test browser-based 0.13.4.
- Backup JSON aggiornato a `appVersion: 0.13.4`.

### 0.13.3 — Workflow e Segnalazioni operative mobile

- Nuovo servizio `js/ui/mobile-workflow-service.js`.
- Migliorie touch e layout mobile per Workflow approvativi e Segnalazioni operative.
- Nuovo documento 119 e test browser-based 0.13.3.
- Backup JSON aggiornato a `appVersion: 0.13.3`.

### 0.13.2 — Tabelle e liste responsive
- Nuovo servizio `js/ui/responsive-tables-service.js` per assegnare etichette `data-label` alle celle e trasformare le tabelle in schede su smartphone.
- CSS mobile dedicato per `.cdsdm-mobile-card-table`, righe a scheda e pulsanti touch.
- Nuovo documento 118 e test browser-based 0.13.2.
- Backup JSON aggiornato a `appVersion: 0.13.2`.

### 0.13.1 — Mobile usability base
- Regole CSS responsive non invasive per manuale, aiuti rapidi, modali, card e pulsanti touch.
- Nuovo documento 117 e test browser-based 0.13.1.
- Backup JSON aggiornato a `appVersion: 0.13.1`.


### 0.13.12 — Rifinitura branding logo trasparente

- Rigenerato il logo principale `assets/branding/brand-mark.png` con trasparenza reale e senza contorno bianco marcato.
- Rigenerati favicon e icone applicative (`favicon.ico`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `apple-touch-icon.png`, `android-chrome-*`).
- Aggiunta micro-rifinitura CSS per mantenere trasparente la presentazione del logo nelle principali aree UI.
- Aggiornati documentazione, test branding e backup JSON a `appVersion: 0.13.12`.


### 0.13.12 — Rifinitura branding logo con cilindro ocra

- Mantenuto il logo trasparente introdotto nella 0.13.7.
- Migliorata la leggibilità del cilindro/database adottando una tonalità **ocra/oro** più visibile su sfondo chiaro e scuro.
- Rigenerati `brand-mark.png`, favicon e icone applicative del set `assets/branding/`.
- Aggiornati documentazione, test branding e backup JSON a `appVersion: 0.13.12`.


### 0.13.12 — Integrazione build del logo approvato

- Integrato nella build il logo approvato in preview, convertito in PNG trasparente e adattato al set branding applicativo.
- Il cilindro/database adotta sezioni differenziate, riducendo l’effetto di elementi identici impilati.
- Rigenerati `brand-mark.png`, `brand-mark-darkmode.png`, favicon e icone applicative del set `assets/branding/`.
- Aggiornati documentazione, test branding e backup JSON a `appVersion: 0.13.12`.


### 0.13.12 — Inviti collaboratore responsive

- Chiarito nel pannello Gruppi aziendali che l'invito non viene inviato via email automaticamente.
- Sostituita la tabella larga degli inviti con card responsive più leggibili.
- Ridistribuiti i pannelli: compilazione invito più stretta e lista inviti più ampia.
- Azioni Copia/Rigenera/Revoca rese compatte e adattive.
- Aggiornati documentazione, test e backup JSON a `appVersion: 0.13.12`.


### 0.13.12 — Hotfix registrazione con invito

- Corretto il flusso `BusinessGroupsService.acceptInvite()` / `addMemberToGroupAsInvitee()`.
- L’invitato usa `groupName` e `groupId` già presenti nell’invito per creare membership e membro, senza leggere il root `businessGroups/{groupId}` prima di essere membro.
- Mantenute le regole Firestore esistenti: nessuna apertura aggiuntiva della lettura del gruppo a utenti non membri.
- Backup JSON aggiornato a `appVersion: 0.13.12`.
