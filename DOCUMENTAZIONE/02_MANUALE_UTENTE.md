# Manuale utente operativo — aggiornamento 0.12.15

Questa sezione riassume i flussi principali aggiornati della versione **0.12.15**. Il progetto resta una SPA didattica front-end: Firebase Auth e Firestore sono la base, senza backend custom e senza Cloud Functions obbligatorie.

## Come usare gli aiuti rapidi e il manuale

Il piccolo pulsante **?** accanto al titolo della pagina apre un aiuto rapido contestuale e richiudibile. Il manuale completo è disponibile da **Info → Manuale Utente** ed è impaginato come guida visuale con card, passi ed esempi.

## Flusso Vendite consigliato

1. **Anagrafiche → Clienti**: crea o verifica il cliente.
2. **Anagrafiche → Servizi / Prodotti**: verifica righe vendibili.
3. **Vendite → Preventivi cliente**: crea il preventivo.
4. **Analisi → Workflow approvativi**: approva il preventivo se nasce in bozza.
5. **Preventivi cliente → Crea ordine cliente**: trasforma il preventivo approvato/accettato in ordine.
6. **Vendite → DDT cliente**: collega ordini cliente confermati.
7. **Vendite → Fatturazione DDT cliente** oppure **Nuova fattura**: genera la fattura.
8. **Contabilità → Incassi e pagamenti**: registra l’incasso.

> Esempio: un preventivo approvato diventa ordine cliente; l’ordine confermato alimenta il DDT; il DDT può essere fatturato.

## Flusso Acquisti e ricezione merce

1. **Anagrafiche → Fornitori**: crea o verifica il fornitore.
2. **Acquisti → Nuovo Ordine fornitore**: crea l’ordine.
3. **Analisi → Workflow approvativi**: approva l’ordine se è in bozza.
4. **Acquisti → DDT fornitore**: seleziona fornitore e ordine confermato/lavorabile.
5. Registra quantità ricevute, accettate, mancanti o in quarantena.
6. Se c’è un’anomalia, crea una **Segnalazione operativa** verso il reparto corretto.

> Esempio: ordine fornitore approvato → merce ricevuta → 8 pezzi accettati e 2 in quarantena → segnalazione da Magazzino ad Acquisti.

## Workflow approvativo: da bozza a documento operativo

Un documento in **Bozza** non è ancora operativo. Il passaggio corretto avviene tramite **Analisi → Workflow approvativi**:

- ordine fornitore approvato → `confirmed` e selezionabile nei DDT fornitore;
- ordine cliente approvato → `confirmed` e selezionabile nei DDT cliente;
- preventivo approvato/accettato → trasformabile in ordine cliente.

## Segnalazioni operative

Le **Segnalazioni operative** servono per anomalie, richieste di verifica e comunicazioni interne. Non sostituiscono documenti gestionali.

Stati tipici:

1. **Bozza**: segnalazione preparata ma non inviata.
2. **Segnalata**: inviata al reparto destinatario.
3. **Presa in carico / In lavorazione**: il referente la gestisce.
4. **Risolta / Chiusa**: il caso è concluso.

Esempi d’uso:

- merce ricevuta e messa in quarantena;
- prodotto non trovato in ubicazione;
- DDT fornitore non coerente;
- ordine cliente non evadibile;
- documento con dati mancanti.

## Mini B.I.

La **Mini B.I. didattica** legge dati già presenti, rispetta i permessi e mostra KPI, drill-down, alert ed export CSV. È utile per controllo gestionale e discussione in aula, ma non sostituisce contabilità professionale o consulenza fiscale.

## Backup/import/reset

Prima di import, reset o cambio scenario didattico, esegui sempre un backup JSON del contesto dati attivo. La versione 0.12.x include anche la collezione `operationalReports`.

---

## Versione 0.7.0 - Consolidamento tecnico

La versione 0.7.0 non aggiunge nuovi flussi operativi: rende più coerenti backup/import/reset, test e documentazione. Per l'utente, il comportamento atteso resta quello della 0.6.6, con maggiore affidabilità nel passaggio tra dati legacy personali e Gruppi aziendali.

### Cosa cambia nell'uso quotidiano

- Il backup JSON esporta anche profili permesso, matrici permessi e report audit sicurezza del gruppo attivo.
- L'import da backup 0.7.0 ripristina anche queste collezioni quando presenti.
- La pagina test include una nuova verifica di consolidamento 0.7.0.
- La documentazione in-app contiene il capitolo **47. Consolidamento tecnico generale 0.7.0**.

---

## Versione 0.6.6 - Audit sicurezza

La sezione **Impostazioni → Audit sicurezza** consente ad admin, teacher e superadmin di generare un report sul Gruppo aziendale attivo. Il report evidenzia membri, ruoli, inviti, profili permesso, override e possibili criticità prima di una simulazione multiutente.

## Aggiornamento 0.6.5 — Regole Firestore rafforzate

La versione 0.6.5 non cambia il flusso operativo quotidiano, ma rende più coerente la sicurezza: i permessi effettivi del membro vengono considerati anche dalle regole Firestore quando il progetto viene pubblicato con il nuovo `firestore.rules`. Il livello `write` consente creazione/modifica, mentre le eliminazioni richiedono `admin` sul modulo o un ruolo admin/teacher.

## Aggiornamento 0.6.4 — Override permessi

In **Impostazioni → Override permessi**, un admin/teacher può selezionare un membro e definire eccezioni puntuali rispetto al profilo permesso assegnato. Il valore **Eredita dal profilo** mantiene il comportamento standard; `none`, `read`, `write` e `admin` sostituiscono il livello del profilo solo per quel modulo.

## Aggiornamento 0.6.3 - Matrice permessi

Gli amministratori del gruppo possono usare **Impostazioni → Matrice permessi** per verificare il catalogo moduli e configurare il modello azioni associato ai livelli `none/read/write/admin`.

## Aggiornamento 0.6.2 - Profili permesso

In **Impostazioni → Profili permesso** gli amministratori del gruppo possono creare profili, configurare i livelli per modulo e assegnarli ai membri.

## Aggiornamento 0.5.6 - Migrazione guidata e QA multiutente

La release 0.5.6 consolida i Gruppi aziendali con una sezione dedicata a confronto dati legacy/gruppo, copia prudente, report diagnostici e piano QA multiutente. La nuova collezione `migrationReports` salva report didattici sotto `businessGroups/{groupId}`.



## Aggiornamento 0.5.5 - Console docente

La release 0.5.5 introduce **Impostazioni → Console docente** per scenari didattici e simulazioni di gruppo sui Gruppi aziendali. Le nuove collezioni `teachingScenarios` e `simulationEvents` sono salvate sotto `businessGroups/{groupId}` e sono protette dalle regole Firestore dedicate.

### Versione 0.4.3 - Registro attività / audit trail
La versione 0.4.3 introduce Analisi → Registro attività: una vista applicativa che centralizza eventi manuali e attività derivate da workflow, pagamenti, prima nota, solleciti, riconciliazioni e budget. È possibile filtrare, esportare CSV e registrare note manuali nella collezione opzionale `auditEvents`. Il registro è didattico/front-end e non sostituisce logging server-side o audit forense.

## Workflow approvativi leggeri (0.4.2)

La sezione **Analisi → Workflow approvativi** mostra documenti e movimenti da verificare. È possibile approvare, respingere, bloccare o riportare in revisione un elemento, aggiungendo una nota opzionale.

### Versione 0.3.4 - Solleciti e promemoria scadenze
La versione 0.3.4 introduce Contabilità → Solleciti: scadenze aperte/scadute derivate dallo scadenzario, livelli di sollecito, testo copiabile, storico manuale su collezione opzionale `reminderEvents` ed export CSV. Nessun invio automatico e nessun backend custom.

### Versione 0.3.4 - Estratto conto cliente/fornitore
La versione 0.3.3 introduce Contabilità → Estratto conto: saldo iniziale, movimenti di periodo, saldo progressivo, saldo finale, export CSV e stampa HTML. Non introduce nuove collezioni Firestore.

### Versione 0.3.2 - Prima nota / movimenti finanziari
La versione 0.3.2 introduce Contabilità → Prima nota: registro finanziario semplificato con movimenti automatici derivati da incassi/pagamenti, movimenti manuali di cassa/banca, saldi per conto ed export CSV. La nuova collezione opzionale `cashbookMovements` contiene solo i movimenti manuali.

### Versione 0.3.1 - Incassi e pagamenti evoluti
La versione 0.3.1 introduce la sezione Contabilità → Incassi e pagamenti, con registrazione movimenti cliente/fornitore, allocazione su più documenti, metodo, riferimento, data valuta e collezione opzionale paymentEvents. I dati legacy negli array payments restano compatibili e vengono letti da scadenzario e partitario.

### Versione 0.3.0 - Partitario clienti e fornitori
La versione 0.3.0 apre il ramo contabile/economico 0.3.x introducendo il partitario clienti e fornitori come vista derivata. La nuova funzione legge fatture, note di credito, acquisti e pagamenti già presenti nei documenti, calcolando dare/avere, saldo progressivo e saldo per soggetto senza nuove collezioni Firestore e senza backend custom.

### Versione 0.2.6 - Ruoli e permessi
Introdotti controlli applicativi front-end per ruoli e permessi: Admin, Commerciale, Magazzino, Contabilità e Sola lettura. La persistenza resta in `settings/companyInfo.accessControl`, senza backend custom e senza nuove collezioni Firestore obbligatorie. Nota: i controlli sono didattici/UX e non sostituiscono regole Firestore di sicurezza.

## Novità 0.2.5 - Import massivi CSV

In **Impostazioni → Import massivi CSV** puoi caricare dati da CSV per clienti, fornitori, prodotti/servizi/costi, lotti e movimenti magazzino. Scarica prima il template, compila il file, genera l’anteprima e conferma l’import solo quando tutte le righe risultano valide.

### Versione 0.2.4 - Lotti / matricole / scadenze
In **Servizi / Prodotti** puoi impostare la tracciabilità di un prodotto fisico. In **Magazzino → Lotti / matricole / scadenze** puoi consultare, registrare ed esportare lotti, matricole e scadenze.

### Versione 0.2.3 - Valorizzazione magazzino
La versione 0.2.3 evolve l'inventario valorizzato in una vista di valorizzazione magazzino con metodo selezionabile: prezzo anagrafico, ultimo costo da DDT fornitore e costo medio ponderato semplificato. I calcoli restano derivati dai dati esistenti (prodotti e DDT fornitore), senza nuove collezioni Firestore, senza backend custom e con fallback compatibile ai prezzi anagrafici.

### Versione 0.2.2 - Scadenzario evoluto clienti/fornitori
La versione 0.2.2 evolve lo scadenzario in una vista operativa clienti/fornitori: filtri per tipo, stato e soggetto, riepiloghi da incassare/da pagare, gestione importi parziali e residui, registrazione incassi/pagamenti su array `payments` interni ai documenti esistenti. Non introduce nuove collezioni Firestore né backend custom.

### Versione 0.2.1 - Dashboard Direzionale
La sezione **Analisi → Dashboard** diventa una vista direzionale: mostra fatturato netto, acquisti, margine lordo stimato, scadenze clienti/fornitori aperte, valore magazzino, DDT cliente da fatturare, ordini aperti e timesheet non ancora fatturato. I dati sono calcolati dagli archivi già esistenti e non richiedono configurazioni Firestore aggiuntive.


### Versione 0.2.0 - Release tecnica di coerenza
Per l'utente finale la versione 0.2.0 non cambia i flussi operativi principali: rende disponibili in modo coerente le funzioni già documentate nelle release 0.1.x, in particolare reportistica gestionale, annullamenti/rettifiche documentali e resi cliente/note di credito collegate. La persistenza resta su Firebase/Firestore per utente.

# 2. Manuale utente

> **CDSDM** significa **Cloud Data Suite for Digital Management**. Questo nome può comparire in login, barra superiore, schermata Home e pagina Informazioni Versione.

## Organizzazione del menu laterale

Dalla versione **0.8.7** il menu separa meglio le aree operative:

- **Impostazioni**: configurazioni aziendali, IVA, pagamenti, banche, uso dati, import CSV e backup/import/reset;
- **Organizzazione**: gruppi aziendali, ruoli, profili, matrice e override permessi;
- **Didattica**: console docente, scenari e QA/migrazione multiutente;
- **Amministrazione**: funzioni sensibili come Superadmin e Audit sicurezza.

Questa divisione non cambia i dati né i permessi, ma rende più chiaro dove cercare le funzioni.


Questo manuale descrive l’uso quotidiano del gestionale, con particolare attenzione a:
- configurazione iniziale dell’**anagrafica azienda**
- differenze operative tra **Ordinario** e **Forfettario**
- ciclo completo **commesse → progetti → timesheet → fattura**
- uso corretto di documenti, acquisti, scadenziario e gestione dati

---

## 2.1 Accesso e primo avvio
1) Apri l’app da hosting statico o da server locale.
2) Effettua il login. Se hai dimenticato la password, inserisci la tua email e usa **Password dimenticata? Invia link di reset**: Firebase invierà un link di reimpostazione se l’indirizzo è associato a un account.
3) Al primo accesso entra in **Impostazioni → Azienda**.
4) Compila l’anagrafica in modo completo.
5) Imposta il **Regime fiscale (gestionale)**.
6) Salva.

> Finché l’anagrafica azienda non è stata impostata in modo coerente, alcune sezioni possono restare limitate o comportarsi in modo incompleto.

---

## 2.2 Impostazioni → Azienda
Questa è la pagina più importante del progetto. Da qui dipendono:
- comportamento del gestionale
- visibilità di alcune sezioni
- calcoli IVA e fiscali
- generazione XML
- dati mostrati in stampa e dettaglio documento

### 2.2.1 Cosa conviene compilare sempre
Compila con attenzione almeno questi gruppi di dati:

#### A. Dati identificativi dello studio/azienda
- denominazione / ragione sociale
- nome e cognome, se lavori come persona fisica
- partita IVA
- codice fiscale
- indirizzo
- CAP
- comune
- provincia
- nazione

Questi dati vengono usati in più punti:
- intestazioni documento
- stampa PDF
- export XML
- validazione formale

#### B. Regime fiscale gestionale
Campo chiave del progetto.

Puoi scegliere tra:
- **Ordinario**
- **Forfettario**

Il regime gestionale determina il comportamento dell’app:

**Ordinario**
- abilita gestione IVA
- abilita fornitori e acquisti
- abilita registri IVA
- abilita scadenze IVA nello scadenziario
- abilita simulazione ordinaria

**Forfettario**
- semplifica la UI
- disattiva acquisti/fornitori/registri IVA
- forza IVA = 0 nelle fatture
- abilita simulazione quadro LM
- mantiene il focus su incassi, compensi e simulazione forfettaria

> Se il dato `taxRegime` non è valorizzato, il sistema prova a risolvere il comportamento anche da `codiceRegimeFiscale`, ma è sempre meglio compilare esplicitamente il regime gestionale.

#### C. Dati bancari
I campi storici **Banca 1/IBAN 1** e **Banca 2/IBAN 2** restano disponibili per compatibilità con documenti e dataset esistenti.

Per le nuove configurazioni usa preferibilmente **Impostazioni → Banche aziendali**, dove puoi creare uno o più conti aziendali con:
- etichetta conto
- nome banca
- IBAN
- BIC/SWIFT opzionale
- intestatario
- flag predefinita

La banca predefinita viene proposta nelle nuove fatture quando la modalità di pagamento richiede banca/IBAN, per esempio il bonifico


### 2.2.4 Impostazioni → Codici pagamento e Banche aziendali
La gestione pagamento è divisa in tre livelli:

- **Cliente → modalità pagamento predefinita**: indica come paga normalmente quel cliente.
- **Azienda → banche aziendali**: contiene i conti/IBAN dell'emittente.
- **Fattura → modalità pagamento effettiva + banca effettiva**: fotografa il metodo e il conto usati nel singolo documento.

In **Impostazioni → Codici pagamento** trovi i codici FE `MPxx` usati dalla fattura elettronica.
In **Impostazioni → Banche aziendali** puoi inserire i conti dell'azienda.

Questa razionalizzazione non introduce ancora gestione incassi, rate multiple o riconciliazione bancaria.

#### D. Parametri IVA e fiscali
In **Ordinario** compila in modo coerente:
- aliquota IVA predefinita
- periodicità IVA (mensile/trimestrale)
- eventuali parametri contributivi e previdenziali richiesti dal tuo scenario didattico

In **Forfettario** verifica invece:
- codice regime fiscale corretto
- eventuali aliquote contributive / parametri usati dalla simulazione

### 2.2.2 Buone pratiche per la compilazione
- salva l’anagrafica azienda **prima** di creare documenti
- compila sempre indirizzo, CAP, comune e provincia
- compila sempre almeno un IBAN valido se usi pagamenti bancari
- ricontrolla il regime prima di iniziare un’esercitazione

### 2.2.3 Preferenze App
Nella pagina Azienda trovi anche le **Preferenze App**, tra cui il tema.

In più, nella sidebar è presente un toggle rapido **Dark mode** per passare velocemente tra chiaro e scuro.

### 2.2.4 Google Calendar in Home
Il campo opzionale **Google Calendar Home** permette di sostituire il calendario locale della Home con un calendario Google incorporato in vista **7 giorni**.

Puoi inserire:
- l'URL embed copiato da Google Calendar
- oppure direttamente l'ID del calendario

Il calendario deve essere pubblico oppure condiviso con l'utente che apre l'app. Se il campo resta vuoto o l'URL non è valido, la Home continua a mostrare il calendario locale precedente.

---

## 2.3 Anagrafiche
Le anagrafiche sono la base dei documenti e dei flussi timesheet/fatturazione.

### 2.3.1 Clienti
Menu: **Anagrafiche → Clienti**

Per ogni cliente puoi inserire:
- ragione sociale oppure nome/cognome
- partita IVA e/o codice fiscale
- indirizzo completo
- codice destinatario / PEC
- condizioni di pagamento
- opzioni fiscali e contributive legate al cliente

#### Opzioni importanti in anagrafica cliente
- **Rivalsa INPS**
- **Scorporo Rivalsa**
- **Sostituto d’imposta**
- **Bollo a carico studio**

Questi flag incidono direttamente su:
- calcolo fattura
- totale documento
- XML
- riepiloghi in dettaglio

#### Solo Forfettario: prefisso import timesheet
Puoi impostare un testo da usare come prefisso nelle righe importate dal timesheet in fattura.

Esempio:
- “Attività di docenza”
- “Prestazione professionale”
- “Supporto progettuale”

Se lasci il campo vuoto, l’import non aggiunge alcun prefisso fisso.

### 2.3.2 Servizi / Prodotti: servizi, prodotti e costi
Menu: **Anagrafiche → Servizi / Prodotti**

Qui definisci il catalogo base delle voci usabili nei documenti:
- codice
- descrizione
- prezzo di vendita
- prezzo di acquisto, utile soprattutto per i Prodotti fisici
- **tipo voce**: Servizio, Costo o Prodotto
- **regola IVA / Natura FE** selezionata dalla tabella centralizzata

Il tipo **Servizio** è pensato per prestazioni professionali. Il tipo **Costo** continua a escludere la voce dalla base della rivalsa INPS. Il tipo **Prodotto** prepara beni fisici movimentabili nella futura gestione magazzino/DDT, senza introdurre ancora giacenze. Per i prodotti fisici puoi valorizzare prezzo di acquisto e prezzo di vendita: il prezzo di acquisto servirà in seguito per inventario valorizzato e aggiornamenti controllati da DDT/fatture fornitore.

La pagina usa schede di filtro **Tutti / Servizi / Prodotti / Costi**: i dati restano in un'unica anagrafica, ma la consultazione è più chiara. La separazione completa del magazzino arriverà in una sezione dedicata quando verranno introdotti giacenze, movimenti e DDT cliente/fornitore.

La tabella **IVA / Natura FE** non è più sotto questa anagrafica: si trova in **Impostazioni → Tabella IVA**, perché è una configurazione fiscale trasversale usata da prodotti, servizi e documenti.

In **Forfettario**, l’IVA proposta dalla voce non prevale sul comportamento del regime: nel documento l’IVA viene comunque gestita come zero con Natura FE coerente.

### 2.3.3 Fornitori
Menu: **Anagrafiche → Fornitori**

Disponibile solo in **Ordinario**.

Serve per:
- acquisti manuali
- import XML acquisti
- scadenziario pagamenti
- analisi e registri IVA

---

## 2.4 Fatture di vendita
Menu: **Vendite**

### 2.4.1 Nuova fattura
Crea una nuova fattura selezionando:
- cliente
- data documento
- numero
- metodo di pagamento
- eventuale banca/conto

Poi aggiungi le righe documento.

Ogni riga può includere:
- descrizione
- quantità
- prezzo
- aliquota IVA / natura
- subtotal calcolato

### 2.4.2 Nuova nota di credito
La nota di credito funziona come un documento collegato a un’operazione precedente.

Compila con attenzione:
- tipo documento
- causale
- riferimento alla fattura collegata
- data e numero del documento collegato, se richiesti dal tuo flusso

Il sistema usa questi dati anche nella costruzione dell’XML.

### 2.4.3 Ricalcolo totali
Il gestionale ricalcola i totali in base a:
- righe documento
- regime fiscale
- impostazioni cliente
- bollo
- rivalsa
- ritenuta
- scorporo

In **Forfettario**:
- IVA = 0
- viene usata la natura prevista
- il bollo può essere inserito automaticamente sopra soglia

### 2.4.4 Elenco documenti
Menu: **Vendite → Elenco Documenti**

Da qui puoi:
- filtrare per anno
- aprire il dettaglio
- modificare
- eliminare
- marcare come pagata
- marcare come inviata
- esportare XML

### 2.4.5 Dettaglio documento
Nel dettaglio fattura trovi:
- riepilogo cliente
- riepilogo documento
- righe
- totali
- pulsante stampa
- menu **XML**

Il menu **XML** contiene:
- **Genera XML**
- **Copia XML**
- **Apri FatturaCheck**
- **Apri FEX**
- **Apri Agenzia Entrate**

> I siti di validazione esterni si aprono in una nuova tab e non ricevono automaticamente il file. Il caricamento o l’incolla dell’XML resta sempre sotto il controllo dell’utente.

---

## 2.5 Fatture di acquisto
Menu: **Acquisti**

Disponibile solo in **Ordinario**.

### 2.5.1 Nuovo acquisto
Compila:
- fornitore
- numero documento
- data documento
- data riferimento pagamento
- giorni termine
- eventuale data scadenza
- righe acquisto

Il sistema usa questi dati per:
- totale acquisto
- scadenziario pagamenti
- analisi
- registri IVA

### 2.5.2 Import XML acquisti
Nel form **Nuovo Acquisto** puoi importare un XML ricevuto dal fornitore.

Il sistema prova a precompilare:
- testata documento
- fornitore
- righe
- dati di scadenza, se presenti

Se il fornitore non esiste, viene proposta la creazione in anagrafica.

---

## 2.6 Scadenziario
Menu: **Contabilità → Scadenziario**

Lo scadenziario raccoglie eventi di natura diversa:
- incassi fatture
- pagamenti acquisti
- scadenze IVA

### In Ordinario
Puoi vedere:
- incassi
- pagamenti acquisti
- scadenze IVA

### In Forfettario
Restano soprattutto:
- incassi delle fatture

Lo scadenziario è utile per simulare il comportamento operativo di un piccolo studio professionale.

---

## 2.7 Commesse, progetti e timesheet
Questa è una delle parti più importanti del progetto perché collega l’operatività quotidiana alla fatturazione.

## 2.7.1 Logica generale
Il flusso corretto è questo:

1. **Cliente**
2. **Commessa**
3. **Progetto**
4. **Worklog / Timesheet**
5. **Import ore in fattura**

### Cliente
È il soggetto a cui emetterai il documento.

### Commessa
La commessa rappresenta il contenitore principale del lavoro commissionato da un cliente.

In pratica la commessa risponde alla domanda:
**“Per quale incarico sto lavorando e a chi fatturo?”**

### Progetto
Il progetto è un sotto-livello della commessa.

Serve per suddividere il lavoro in attività più specifiche.

In pratica il progetto risponde alla domanda:
**“Su quale attività concreta sto lavorando dentro questa commessa?”**

### Worklog / Timesheet
Il worklog è la registrazione puntuale del lavoro svolto:
- data
- commessa
- progetto
- durata
- note
- fatturabilità

### Import in fattura
Le ore registrate nel timesheet possono diventare righe fattura, mantenendo il legame logico con il lavoro svolto.

---

## 2.7.2 Commesse
Menu: **Commesse → Commesse**

Per ogni commessa definisci almeno:
- nome/descrizione
- cliente “Fatturo a”
- stato

La commessa è il livello giusto per rappresentare un incarico, un contratto o una linea di lavoro verso un cliente.

### Esempio
Cliente: **Alfa Srl**
Commessa: **Supporto consulenziale 2025**

All’interno della stessa commessa puoi poi avere più progetti.

---

## 2.7.3 Progetti
Menu: **Commesse → Progetti**

Ogni progetto è collegato a una commessa.

Campi importanti:
- **Codice progetto**
- **Cliente finale**
- **Servizio predefinito**
- **Tariffa**
- tipo **Lavoro / Costo**

### Cliente finale: a cosa serve
È utile quando lavori per un cliente che ti commissiona attività verso un destinatario finale diverso.

Esempio:
- Fatturo a: **Società Beta**
- Cliente finale: **Comune di Gamma**

Così puoi distinguere:
- chi riceve la fattura
- per chi è stata effettivamente svolta l’attività

### Servizio e tariffa del progetto
Se associ un servizio al progetto, il sistema può proporre in automatico:
- descrizione coerente
- tariffa coerente
- tipo di attività

Questo aiuta molto nei flussi timesheet → fattura.

---

## 2.7.4 Timesheet
Menu: **Commesse → Timesheet**

Qui registri il lavoro svolto giorno per giorno.

Ogni worklog può contenere:
- data
- commessa
- progetto
- minuti / ore
- minuti / ore cliente finale, se previsti
- flag fatturabile
- note

### Buone pratiche
- usa sempre commessa e progetto coerenti
- descrivi le attività nelle note in modo chiaro
- marca come non fatturabili le attività interne o escluse dalla rendicontazione

### Modifica worklog
Puoi riaprire un worklog già salvato e modificarlo.

Se il worklog è già stato importato in fattura, conviene verificare con attenzione il suo stato prima di intervenire.

---

## 2.7.5 Import ore dal timesheet in fattura
Nel form fattura puoi usare l’import ore dal timesheet.

Il flusso corretto è:
1. selezioni cliente / documento
2. apri import timesheet
3. filtri il periodo
4. selezioni commessa/progetto, se necessario
5. il sistema costruisce righe fattura
6. salvi il documento

### Cosa fa il sistema
- genera righe documento dalle ore selezionate
- tiene traccia dei worklog collegati
- evita, per quanto possibile, doppie fatturazioni accidentali
- in fase di salvataggio collega i worklog alla fattura

### Cosa controllare sempre
- descrizione riga generata
- quantità/ore
- tariffa applicata
- cliente corretto
- eventuale prefisso forfettario

### Se elimini o modifichi
In base al flusso:
- rimuovere righe importate
- modificare la fattura
- eliminare la fattura

può influire sul legame con i worklog importati.

Per questo conviene fare attenzione soprattutto nelle esercitazioni dove si prova più volte lo stesso scenario.

---

## 2.8 Export Timesheet CSV
Menu: **Commesse → Export CSV**

Puoi esportare i worklog con diversi filtri e formati.

Utilissimo per:
- esercitazioni
- rendicontazioni
- confronti tra ore registrate e ore fatturate

Formati disponibili:
- dettaglio
- raggruppamento per progetto
- raggruppamento per commessa
- pivot per giorno/progetto

---

## 2.9 Dashboard direzionale e statistiche
Menu: **Analisi → Dashboard** / **Statistiche**

La Dashboard Direzionale 0.2.1 aggrega le informazioni operative più importanti: fatturato netto, acquisti, margine stimato, scadenze aperte, valore magazzino, documenti da fatturare, ordini aperti e ore timesheet non fatturate. È una vista derivata: non salva nuove entità e non cambia i dati esistenti.

Queste pagine aiutano a leggere i dati gestionali del periodo:
- ore lavorate
- ore fatturabili
- fatturato
- andamento per periodo
- top progetti / commesse

Usale per confrontare:
- attività svolta
- documenti emessi
- sostenibilità del carico di lavoro

---

## 2.10 Simulazioni fiscali
Menu: **Fiscalità**

### Ordinario
Disponibile in regime ordinario.

Serve per simulare il comportamento del professionista con IVA, costi e logica fiscale ordinaria.

### LM / Forfettario
Disponibile in regime forfettario.

Serve per stimare il comportamento del reddito forfettario e dei contributi/imposte.

> Le simulazioni sono strumenti didattici: vanno interpretate come supporto allo studio, non come consulenza fiscale ufficiale.

---

## 2.11 Impostazioni → Tabella IVA
Menu: **Impostazioni → Tabella IVA**

Questa pagina contiene il catalogo centralizzato per aliquote IVA e codici Natura FE. I codici di sistema sono consultabili ma non cancellabili; puoi aggiungere codici personalizzati, con regola didattica prudente: se l'aliquota è maggiore di 0 la Natura FE resta vuota, se l'aliquota è 0 va indicata la Natura FE.

Le voci in **Servizi / Prodotti** pescano da questa tabella tramite la regola IVA selezionata. I documenti già emessi non vengono modificati quando aggiorni o aggiungi codici personalizzati.

---

## 2.12 Gestione dati
Menu: **Impostazioni → Gestione Dati**

Da qui puoi:
- fare backup JSON
- importare un backup
- eliminare documenti per anno
- eliminare acquisti per anno
- fare reset totale
- ripristinare un dataset standard

Questa sezione è molto utile in laboratorio, quando vuoi:
- preparare una classe
- ripartire da uno stato pulito
- distribuire uno scenario già pronto

---

## 2.13 Suggerimento operativo per l’uso corretto
Per lavorare bene col progetto, l’ordine consigliato è:

1. **Compila Azienda**
2. **Configura il regime**
3. **Configura Tabella IVA, poi crea Clienti e Servizi / Prodotti**
4. **Crea Commesse**
5. **Crea Progetti**
6. **Inserisci Timesheet**
7. **Importa ore in fattura** oppure crea documenti manuali
8. **Esporta PDF/XML**
9. **Controlla Scadenziario e Simulazioni**
10. **Fai Backup**

Questo ordine riduce errori e rende più chiaro il legame tra i moduli.


## Allegato XML da Timesheet

Nel form fattura, sotto i pulsanti di importazione ore dal Timesheet, puoi attivare l'opzione **Allega il dettaglio non aggregato del timesheet all'XML della fattura (PDF)**.

Quando è attiva, il gestionale genera durante l'export XML un allegato PDF con il dettaglio dei worklog collegati alla fattura. Puoi anche scegliere se **includere le note operative** del timesheet. L'allegato è solo descrittivo e non modifica i totali fiscali della fattura.

In Dark Mode il riquadro usa contrasti dedicati per mantenere leggibili titolo, opzioni, testo descrittivo e checkbox.

## 2.12 Impostazioni → Codici pagamento FE
Menu: **Impostazioni → Codici pagamento**

La pagina contiene i codici di modalità pagamento previsti per la fattura elettronica, ad esempio `MP01` Contanti, `MP02` Assegno, `MP05` Bonifico bancario, `MP12` Ri.Ba. e gli altri codici di sistema.

I codici di sistema sono consultabili ma non cancellabili. Puoi aggiungere codici personalizzati con codice FE, descrizione, macro area e indicazione se richiedono banca/IBAN aziendale.

In questa versione la tabella è preparatoria: il pagamento resta ancora gestito nel flusso cliente/fattura esistente. Il collegamento con default cliente, fattura e banche aziendali sarà valutato in uno step successivo.


## Magazzino base e inventario valorizzato

La sezione **Magazzino** gestisce le prime funzioni operative sui prodotti fisici:

- **Giacenze**: mostra prodotti di tipo Prodotto, unità di misura, ubicazione, giacenza disponibile, riservata, netta, quarantena e scorta minima.
- **Movimenti**: registra carichi, scarichi, rettifiche e passaggi da/per quarantena in `warehouseMovements`, aggiornando il prodotto collegato.
- **Inventario**: calcola il valore disponibile, il valore in quarantena e il valore totale usando il prezzo di acquisto indicato nella scheda prodotto.

Nella pagina **Inventario** sono disponibili anche:

- riepilogo del valore disponibile, quarantena e totale;
- conteggio dei prodotti sotto scorta;
- filtri per prodotti con giacenza/quarantena, sotto scorta o senza prezzo acquisto;
- export CSV dell'inventario valorizzato filtrato.

Per usare queste viste, crea o modifica una voce in **Anagrafiche → Servizi / Prodotti**, imposta **Tipo voce = Prodotto** e compila i dati magazzino preparatori. I prezzi sono ancora anagrafici: l'aggiornamento da DDT o fatture verrà introdotto in uno step successivo.


## Step 4 - Ordini cliente

La sezione **Vendite → Elenco Ordini cliente** permette di registrare ordini con cliente, numero, data, data consegna prevista, stato e righe prodotto. Le righe salvano quantità ordinata, quantità evasa/residua e prezzo vendita. In questa fase gli ordini sono preparatori: non scaricano ancora il magazzino e saranno usati dai futuri DDT cliente da ordine.


### Magazzino - Ordini fornitore
La sezione **Acquisti → Elenco Ordini fornitore** registra ordini preparatori per i futuri DDT fornitore. In questa fase salva righe prodotto, quantità ordinate, quantità ricevute/residue e prezzo di acquisto, ma non carica ancora il magazzino.


## DDT fornitore e ricevimento merci

La sezione **Acquisti → DDT fornitore** consente di registrare un ricevimento diretto o collegato a un ordine fornitore. Per ogni riga prodotto occorre indicare quantità ricevuta, accettata, in quarantena/riserva e respinta. Il sistema applica la regola: accettata + quarantena + respinta = ricevuta.

Le quantità accettate aumentano la giacenza disponibile; le quantità in quarantena aumentano la giacenza in quarantena; le quantità respinte restano tracciate nel DDT ma non caricano il magazzino.


## Magazzino → Quarantena

La sezione **Magazzino → Quarantena** mostra i prodotti fisici con quantità ricevute con riserva o non ancora rese disponibili. Per ogni prodotto è possibile:

- **Sbloccare a disponibile**: la quantità esce dalla quarantena e aumenta la giacenza disponibile.
- **Scartare / eliminare**: la quantità esce dalla quarantena senza diventare disponibile.
- **Registrare reso a fornitore**: la quantità esce dalla quarantena come reso documentale preparatorio; il DDT di reso stampabile sarà uno step futuro.

Ogni operazione genera un movimento in **Magazzino → Movimenti** e conserva giacenza/quarantena prima e dopo l'azione.


## Vendite → DDT cliente

La sezione **Vendite → DDT cliente** consente di registrare una consegna merce diretta, collegata a un singolo ordine cliente oppure collegata a più ordini cliente dello stesso cliente. Le righe salvano prodotto, quantità consegnata, prezzo vendita e, quando presenti, riferimenti agli ordini sorgente. Al salvataggio il sistema controlla la giacenza disponibile, crea un movimento `SCARICO` in `warehouseMovements` e riduce `stockQty` del prodotto.

Se il DDT deriva da un ordine cliente, l'ordine viene aggiornato con quantità evasa/residua e stato `parzialmente evaso` o `evaso`.


### Versione 0.0.18 - Step 9 Magazzino: stampa/PDF DDT
- Aggiunto layout stampabile per DDT cliente e DDT fornitore.
- Aggiunti pulsanti Stampa / PDF negli elenchi e nei dettagli DDT.
- Il PDF viene prodotto tramite dialogo di stampa del browser, senza backend e senza librerie esterne.
- Nessun impatto su giacenze, movimenti, ordini, fatture o XML.


## Aggiornamento prezzi prodotto da DDT

Nei dettagli e negli elenchi dei DDT sono disponibili comandi dedicati:

- **DDT fornitore → Aggiorna prezzi acquisto**: propone di aggiornare il prezzo di acquisto anagrafico dei prodotti in base al prezzo indicato nel DDT.
- **DDT cliente → Aggiorna prezzi vendita**: propone di aggiornare il prezzo di vendita anagrafico dei prodotti in base al prezzo indicato nel DDT.

Il sistema mostra sempre una modale di conferma con prezzo attuale, nuovo prezzo e documento sorgente. La conferma aggiorna solo l'anagrafica prodotto; non ricalcola documenti, fatture, ordini o movimenti già registrati.


### Magazzino - Step 11: Crea fattura da DDT cliente

In **Vendite → DDT cliente** è disponibile il comando **Crea fattura**. Il comando apre una nuova fattura precompilata con cliente e righe del DDT. Prima del salvataggio è possibile controllare dati fiscali, pagamento e banca aziendale. La fattura usa il motore fiscale esistente; il DDT resta il documento che ha già generato lo scarico di magazzino.


## Flussi operativi Magazzino/DDT

La sezione **Magazzino** è organizzata in tre gruppi logici:

1. **Giacenze e controlli**: Giacenze, Inventario valorizzato, Movimenti e Quarantena.
2. **Ciclo cliente**: Ordini cliente e DDT cliente.
3. **Ciclo fornitore**: Ordini fornitore e DDT fornitore/ricevimento merci.

Flusso cliente consigliato: crea uno o più ordini cliente, genera uno o più DDT cliente anche accorpando più ordini dello stesso cliente, poi crea la fattura dal DDT quando la merce è stata consegnata. I DDT cliente scaricano il magazzino; la fattura non genera un secondo scarico.

Flusso fornitore consigliato: crea un ordine fornitore, registra il DDT fornitore al ricevimento, separa quantità accettate, in quarantena e respinte. Le quantità accettate aumentano la giacenza disponibile; quelle in quarantena vanno gestite dalla sezione **Quarantena**.

Le tabelle mostrano messaggi vuoti con il passo operativo successivo quando non ci sono dati da visualizzare.

## Menu per aree operative

Dalla versione 0.0.25 il menu è organizzato per area funzionale:
### Area Contabilità

Dalla versione 0.0.27 le viste contabili trasversali sono raccolte in **Contabilità**:

- **Scadenziario**: incassi, pagamenti e scadenze IVA.
- **Registri IVA**: riepilogo IVA vendite/acquisti, disponibile per il regime Ordinario.

Lo spostamento è solo organizzativo: non cambia dati, calcoli, documenti o Firestore.


- **Anagrafiche**: Clienti, Fornitori, Servizi / Prodotti.
- **Vendite**: Elenco Preventivi cliente, Nuovo Preventivo cliente, Elenco Ordini cliente, Nuovo Ordine cliente, DDT cliente, Nuova Fattura, Nuova Nota Credito, Elenco Documenti.
- **Acquisti**: Elenco Ordini fornitore, Nuovo Ordine fornitore, DDT fornitore, Nuovo Acquisto, Elenco Acquisti.
- **Magazzino**: Giacenze, Inventario valorizzato, Movimenti, Quarantena, Prodotti macerati.
- **Impostazioni**: Azienda, Tabella IVA, Codici pagamento, Banche aziendali e gestione dati.

La versione 0.0.32 separa le voci di consultazione dalle voci di creazione: gli elenchi servono a leggere stato, dettaglio e azioni sui documenti esistenti; le voci **Nuovo...** aprono direttamente il form di inserimento.

## Preventivi nel ciclo vendite
La sezione **Vendite → Elenco Preventivi cliente** mostra i preventivi esistenti. La voce **Vendite → Nuovo Preventivo cliente** apre il form per creare un preventivo preliminare con cliente, righe prodotto/servizio, validità e stato. Quando il preventivo viene accettato puoi usare **Converti in ordine cliente**: il sistema crea un ordine cliente copiando righe, quantità e prezzi. La conversione non modifica le giacenze; lo scarico resta collegato al DDT cliente. Il flusso completo previsto è: **Preventivo → Ordine cliente → DDT cliente → Fattura**.


### Elenchi ordini e stati operativi
Le sezioni **Vendite → Elenco Ordini cliente** e **Acquisti → Elenco Ordini fornitore** sono viste di controllo: mostrano riepiloghi per stato, filtro stato e quantità ordinate/evase o ordinate/ricevute. Gli ordini confermati sono presentati come **Aperti** per rendere più chiaro quali documenti devono ancora proseguire verso DDT cliente o DDT fornitore. Per creare nuovi ordini usa le voci separate **Vendite → Nuovo Ordine cliente** e **Acquisti → Nuovo Ordine fornitore**.



### Versione 0.0.32 - Menu documentale più chiaro
- **Elenco Preventivi cliente**, **Elenco Ordini cliente** ed **Elenco Ordini fornitore** sono ora pagine consultive: mostrano stato, filtri, riepiloghi, dettaglio e azioni sui documenti già registrati.
- **Nuovo Preventivo cliente**, **Nuovo Ordine cliente** e **Nuovo Ordine fornitore** sono voci separate del menu e aprono direttamente il form di inserimento.
- La modifica è solo UX: non cambia le collezioni `quotes`, `customerOrders` e `supplierOrders`, né la logica di conversione preventivo → ordine o i DDT.

## DDT fornitore ricevuti e resi / Quarantena avanzata

Nella versione 0.0.27 la sezione **Acquisti → DDT fornitore** distingue due tab:

- **Ricevuti dal fornitore**, per i documenti di ricevimento merci con quantità accettata, in quarantena o respinta.
- **Resi al fornitore**, per i documenti generati quando una quantità in quarantena viene restituita al fornitore.

In **Magazzino → Quarantena** puoi scegliere:

- **Sblocca a disponibile**, che riduce la quarantena e aumenta la giacenza disponibile.
- **Scarta / elimina**, che riduce la quarantena e registra il prodotto nella sezione separata **Magazzino → Prodotti macerati**.
- **Reso a fornitore**, che riduce la quarantena, richiede il fornitore e genera un DDT di reso fornitore stampabile/PDF.

Il DDT di reso è un resoconto logistico-didattico: documenta l'uscita merce verso il fornitore e non modifica fatture, XML fiscale o documenti fiscali principali.


## Versione 0.0.31 - Magazzino: giacenza prodotto e inventario fisico

### Magazzino → Giacenza prodotto
La sezione consente una consultazione rapida di un singolo prodotto fisico. Dopo la selezione vengono mostrati giacenza disponibile, quantità riservata, giacenza netta, quarantena, unità di misura, ubicazione e scorta minima. La vista è solo consultiva e non crea movimenti.

### Magazzino → Inventario fisico
La sezione permette di inserire la giacenza fisica contata per ogni prodotto fisico. Il sistema confronta il conteggio con la giacenza disponibile a gestionale e mostra la differenza.

Il pulsante **Azzera conteggi fisici** elimina le bozze di conteggio salvate. Il pulsante **Allinea giacenze da inventario** rettifica solo i prodotti con differenza, dopo messaggio di riepilogo e conferma testuale `ALLINEA INVENTARIO`. L'operazione aggiorna la giacenza disponibile del prodotto e registra un movimento `RETTIFICA` con causale `Rettifica da inventario fisico`. Le quantità in quarantena non vengono modificate.


### Versione 0.0.33 - Fatturazione DDT cliente multipli

La voce **Vendite → Fatturazione DDT cliente** permette di creare una fattura riepilogativa partendo da più DDT cliente non ancora fatturati. Seleziona il cliente, spunta i DDT da includere, controlla l'anteprima righe e premi **Genera fattura da DDT selezionati**. Il sistema apre la normale maschera fattura già precompilata: prima del salvataggio vanno comunque verificati dati fiscali, pagamento, numero e data.

Regole operative: i DDT selezionati devono appartenere allo stesso cliente, non devono essere già fatturati e devono contenere righe consegnate. Dopo il salvataggio di una fattura definitiva, tutti i DDT inclusi vengono marcati come fatturati; il salvataggio in bozza non blocca i DDT.


### Versione 0.0.34 - DDT cliente da ordini multipli
In **Vendite → DDT cliente**, nella modale nuovo DDT, il campo **Origine** ora include anche **Da più ordini cliente**.

Uso operativo:
1. scegli **Da più ordini cliente**;
2. seleziona il cliente oppure spunta direttamente gli ordini aperti dello stesso cliente;
3. controlla le righe residue proposte;
4. riduci eventualmente le quantità consegnate riga per riga;
5. salva il DDT.

Il sistema blocca l'accorpamento di ordini appartenenti a clienti diversi, impedisce quantità superiori al residuo dell'ordine e aggiorna ogni ordine sorgente in base alle quantità effettivamente consegnate. La giacenza viene scaricata una sola volta dal DDT, non dagli ordini.


### Versione 0.0.35 - DDT fornitore da ordini multipli
In **Acquisti → DDT fornitore**, nella modale nuovo DDT, il campo **Origine** include anche **Da più ordini fornitore**.

Uso operativo:
1. scegli **Da più ordini fornitore**;
2. seleziona il fornitore oppure spunta direttamente gli ordini aperti dello stesso fornitore;
3. controlla le righe residue proposte;
4. ripartisci le quantità tra **accettata**, **quarantena** e **respinta**;
5. salva il DDT.

Il sistema blocca l'accorpamento di ordini appartenenti a fornitori diversi, impedisce quantità ricevute superiori al residuo dell'ordine e aggiorna ogni ordine sorgente in base alle quantità effettivamente ricevute. La merce accettata aumenta la giacenza disponibile; la merce in quarantena resta separata e va gestita dalla sezione **Magazzino → Quarantena**.


### Versione 0.0.36 - Stati, blocchi e rollback documentali
La versione introduce un controllo centralizzato degli stati documentali. Gli elenchi continuano a mostrare lo stato operativo dei documenti, ma alcune azioni distruttive vengono bloccate quando esistono documenti collegati: un ordine cliente con DDT non può essere eliminato, un ordine fornitore con DDT ricevuto non può essere eliminato e un DDT cliente già fatturato non può generare una seconda fattura.

L'eliminazione di una fattura non pagata e non inviata resta possibile solo con conferma. Quando la fattura è collegata a record Timesheet o DDT cliente, il sistema avvisa l'utente e sblocca i riferimenti collegati per consentire una nuova fatturazione controllata.

### Versione 0.0.37 - Documenti collegati
Nei dettagli di preventivi, ordini cliente, DDT cliente, fatture, ordini fornitore e DDT fornitore è disponibile la scheda **Documenti collegati**.

La scheda aiuta a leggere il ciclo operativo:

- da un preventivo puoi vedere l'ordine generato;
- da un ordine cliente puoi vedere i DDT emessi e le fatture collegate indirettamente;
- da un DDT cliente puoi vedere ordini sorgente, fattura collegata e movimenti di scarico;
- da una fattura puoi vedere i DDT inclusi, gli ordini origine indiretti e gli eventuali timesheet fatturati;
- da un ordine fornitore puoi vedere i DDT ricevuti;
- da un DDT fornitore puoi vedere ordini sorgente e movimenti di carico/quarantena.

La funzione è consultiva: non modifica documenti, stati, XML fiscale o movimenti.


### Versione 0.1.1 - Fattura riepilogativa avanzata
In **Vendite → Fatturazione DDT cliente** puoi scegliere come costruire la fattura riepilogativa:

- **Separate per DDT** mantiene le righe distinte e prefissa la descrizione con numero/data DDT.
- **Raggruppa prodotti uguali** accorpa righe con stesso prodotto, prezzo, IVA/natura e tipo prezzo.
- **Ordinamento righe** permette di leggere l'anteprima per DDT, per data DDT o per prodotto.
- **Nota riepilogativa** aggiunge in fattura una causale automatica con i DDT inclusi.
- **DatiDDT XML** compila nell'XML della fattura elettronica i riferimenti ai DDT origine.

La modifica non altera i DDT né i movimenti di magazzino: i DDT vengono marcati come fatturati solo al salvataggio definitivo della fattura.

### Versione 0.1.2 - Stabilizzazione e QA

- Introdotti controlli di coerenza non distruttivi su magazzino e collegamenti documentali.

### Versione 0.1.3 - Annullamenti e rettifiche documentali

- Introdotto servizio per annullamento controllato e rettifiche operative di magazzino.

### Versione 0.1.4 - Resi cliente e note di credito collegate

- Introdotto servizio applicativo per resi cliente, rientro merce e bozza nota di credito collegata.

### Versione 0.1.5 - Reportistica gestionale

- Aggiunta pagina Analisi → Report gestionali con indicatori sintetici e tabelle operative.

### Versione 0.1.6 - Consolidamento tecnico e UX
Questa release rende più stabile e leggibile l’applicazione dopo l’introduzione di report, rettifiche e documenti collegati. Per l’utente non cambia il modo di lavorare: le voci di menu restano le stesse, ma la navigazione è più coerente, le pagine non hanno sezioni duplicate e la modalità scura mantiene un contrasto più uniforme su schede, input, tabelle e modali.

Controlli principali:
- le voci di menu puntano a sezioni esistenti;
- i separatori della sidebar restano non cliccabili;
- Report gestionali è una sezione contenuto autonoma, non più annidata nella sidebar;
- il test QA può segnalare incoerenze tra movimenti, giacenze, documenti collegati e residui ordini.

## Scadenzario evoluto 0.2.2

La sezione **Scadenzario** mostra incassi clienti, pagamenti fornitori e scadenze IVA didattiche. La versione 0.2.2 aggiunge:

- filtri per intervallo date, tipo scadenza, stato e testo libero su soggetto/documento;
- riepiloghi di da incassare, da pagare, saldo operativo e numero scadenze scadute/parziali;
- colonne separate per importo documento, importo già pagato/incassato e residuo;
- registrazione di incassi o pagamenti parziali tramite il pulsante con icona euro;
- saldo rapido del documento tramite il pulsante di spunta;
- export CSV esteso con importi pagati/incassati e residui.

Gli eventi di pagamento vengono salvati nel documento sorgente esistente (`invoices` o `purchases`) nell'array `payments`, insieme a campi compatibili come `paidAmount`, `amountPaid`, `paymentStatus`, `status` e `isPaid`. Non viene creata una nuova collezione Firestore.


## Valorizzazione magazzino 0.2.3

La sezione **Magazzino → Inventario** diventa **Valorizzazione magazzino**. L'utente può selezionare il metodo di valorizzazione:

- **Prezzo anagrafico**: usa il prezzo di acquisto salvato nella scheda prodotto.
- **Ultimo costo DDT fornitore**: usa l'ultimo prezzo rilevato nelle righe dei DDT fornitore ricevuti.
- **Costo medio ponderato semplificato**: calcola una media ponderata dai DDT fornitore ricevuti, usando quantità accettate e in quarantena.

Se il metodo scelto non ha dati sufficienti, il gestionale usa il prezzo anagrafico come fallback e lo segnala nella colonna origine costo. L'export CSV include metodo, costo unitario, costo standard, ultimo costo, costo medio, origine costo e valori di magazzino.


## Incassi e pagamenti evoluti

La sezione **Contabilità → Incassi e pagamenti** permette di registrare movimenti finanziari cliente/fornitore, indicare metodo e riferimento, e allocare l'importo a uno o più documenti aperti. I movimenti sono salvati in `paymentEvents` e rispecchiati sui documenti per mantenere compatibilità con scadenzario e partitario.

## Estratto conto cliente/fornitore 0.3.3

Dal menu **Contabilità → Estratto conto** puoi filtrare clienti o fornitori, selezionare soggetto e periodo, consultare saldo iniziale, movimenti del periodo e saldo finale. La vista può essere esportata in CSV o stampata tramite browser.

## Note versione 0.3.7

La versione 0.3.7 è una release di consolidamento: non aggiunge una nuova voce operativa di menu, ma migliora la qualità tecnica del ramo contabile con controlli di coerenza tra scadenzario, incassi/pagamenti, partitario, estratto conto, prima nota, riconciliazione banca e budget/marginalità.


## Note versione 0.4.0

La sezione **Analisi → Stampe / PDF** consente di generare anteprime HTML stampabili per i principali documenti gestionali: estratto conto, partitario, fattura/nota credito, prima nota e solleciti.

Flusso operativo:

1. scegli il template;
2. imposta soggetto, periodo o documento;
3. rigenera l'anteprima;
4. usa **Stampa / PDF** per aprire la finestra di stampa del browser;
5. seleziona **Salva come PDF** se vuoi creare un file PDF.

La funzione non invia dati a servizi esterni e non richiede un backend applicativo.

## Note versione 0.4.1

La sezione **Analisi → Centro notifiche** raccoglie gli alert operativi più importanti in un’unica vista: scadenze clienti/fornitori, prodotti sotto scorta, lotti in scadenza, DDT cliente da fatturare, ordini aperti, anomalie di riconciliazione e controlli QA contabili.

Le notifiche sono solo consultive: non salvano dati, non correggono automaticamente anomalie e non introducono nuove collezioni Firestore. I pulsanti **Apri** portano alle sezioni operative collegate, dove l’utente può intervenire manualmente.


## UX / Accessibilità

La sezione **Analisi → UX / accessibilità** mostra controlli consultivi sulla qualità dell'interfaccia: navigazione, landmark, label, pulsanti e coerenza tra voci menu e sezioni. Il pulsante **Aggiorna** riesegue i controlli sul DOM corrente; **Esporta CSV** scarica l'elenco dei risultati.

La funzione è pensata per QA e didattica. Non modifica dati, non salva nuove collezioni e non sostituisce un audit accessibilità professionale.

## Bilancino gestionale 0.4.5

La sezione **Contabilità → Bilancino** mostra una sintesi gestionale del periodo selezionato: ricavi netti, costi netti, margine operativo, incassi, pagamenti, crediti/debiti aperti e valore magazzino stimato. La vista è pensata per controllo direzionale semplice e non produce un bilancio civilistico.


## UX / accessibilità 0.4.6

La sezione **Analisi → UX / accessibilità** applica ora correzioni runtime ai campi e ai pulsanti legacy/dinamici privi di etichetta accessibile. Il controllo resta consultivo: serve a migliorare navigazione da tastiera e screen reader, ma non sostituisce un audit WCAG completo.


## Dark Mode form e combo 0.4.7

La Dark Mode è stata rifinita per rendere più leggibili combo, select e campi data. In particolare, i menu a tendina delle sezioni Contabilità, Magazzino, Analisi e Stampe hanno ora sfondo, testo, opzioni selezionate e opzioni disabilitate più coerenti con il tema scuro.

La voce **Analisi → UX / accessibilità** include un controllo consultivo sulla presenza delle regole Dark Mode dedicate alle combo. Alcuni dettagli del menu aperto possono variare in base al browser perché le select native sono gestite anche dal sistema operativo.

## Select dinamiche soggetti 0.4.8

In **Contabilità → Incassi e pagamenti**, il campo **Soggetto** mostra ora l’elenco clienti quando il tipo è **Incasso cliente** e l’elenco fornitori quando il tipo è **Pagamento fornitore**.

La stessa logica di inizializzazione è stata consolidata anche nei filtri soggetto di **Partitario**, **Estratto conto** e **Stampe / PDF**.

## Aggiornamento 0.5.1 — Membri, inviti e ruoli per Gruppi aziendali

Percorso: **Impostazioni → Gruppi aziendali**.

Con un Gruppo aziendale attivo, un utente con ruolo **Amministratore** o **Docente/Revisore** può:

1. visualizzare i membri del gruppo;
2. aggiungere un membro tramite UID Firebase, email e ruolo;
3. cambiare il ruolo di un membro;
4. rimuovere un membro dal gruppo;
5. generare un invito semplice con codice.

Per invitare uno studente senza backend custom:

1. genera un invito indicando email e ruolo;
2. copia ID gruppo e codice invito;
3. comunica questi dati allo studente;
4. lo studente accede con Firebase, apre **Gruppi aziendali**, inserisce ID gruppo e codice, quindi accetta.

Gli inviti sono pensati per simulazioni didattiche. L’app non invia email automaticamente.


## Aggiornamento 0.5.2 — Menu e comandi in base al ruolo

Quando lavori in un Gruppo aziendale, la sidebar mostra le sezioni coerenti con il tuo ruolo. Alcuni pulsanti di salvataggio, import, reset, approvazione o cancellazione possono essere disabilitati se il ruolo non consente la scrittura nello scope operativo corrente.

La pagina **Impostazioni → Ruoli e permessi** mostra il ruolo effettivo; in modalità gruppo il cambio ruolo si effettua da **Gruppi aziendali** da parte di un amministratore o docente.


## Aggiornamento 0.5.3 — Sicurezza Firestore dei Gruppi aziendali

La collaborazione tra studenti richiede che il docente o l'amministratore del progetto Firebase pubblichi le regole incluse in `firestore.rules`. Dopo il deploy, solo i membri attivi del Gruppo aziendale possono leggere il dataset condiviso e le scritture sono limitate dal ruolo.

## Aggiornamento 0.5.4 — Uso multiutente più sicuro

Quando più studenti lavorano sullo stesso Gruppo aziendale, l'app registra metadata di modifica e una versione tecnica dei documenti (`docVersion`). In caso di conflitto rilevato, l'utente viene invitato a ricaricare i dati e ripetere l'operazione. I lock leggeri sono predisposti per operazioni critiche e scadono automaticamente.


## Aggiornamento 0.6.0 — Superadmin e registrazione con invito

La login include ora **Registrati con invito**. Il collaboratore crea il proprio account Firebase Auth usando email, password, ID gruppo e codice invito. Il pannello **Impostazioni → Superadmin** consente il bootstrap del primo amministratore applicativo senza backend custom.


## Aggiornamento 0.6.1 — Inviti avanzati e onboarding

Nel pannello **Gruppi aziendali** gli inviti ora includono validità, note, stato, filtri e azioni di revoca/rigenerazione. Per invitare uno studente, crea l’invito, copia il testo generato e comunica ID gruppo + codice. Lo studente usa **Registrati con invito** dalla schermata iniziale.


## Percorso didattico consolidato 0.7.2

Docente: prepara gruppo, profili, inviti e dataset. Studente: completa flussi guidati. Verifica: usa test 0.7.x, audit e backup finale.


## Mini B.I. didattica

La sezione **Analisi → Mini B.I. didattica** aiuta a leggere i dati già presenti con KPI semplici, spiegabili e non certificativi.
