# Manuale utente CDSDM — riferimento didattico autonomo 0.13.11

La versione **0.13.11** mantiene il Manuale Utente come riferimento didattico autonomo per studenti, docenti e professionisti. Non introduce nuovi flussi applicativi, nuove voci di menu, nuove collezioni Firestore o nuove regole obbligatorie: organizza e chiarisce l'uso dei flussi già esistenti.

Il manuale è pensato per tre usi:

- **studio individuale**, quando un utente vuole capire l'app senza assistenza;
- **lezione guidata**, quando il docente imposta una simulazione aziendale;
- **consultazione operativa**, quando l'utente è già dentro un modulo e usa l'icona **?** per arrivare al capitolo collegato.

## Indice capitoli

1. [Primi passi](#manuale-capitolo-primi-passi)
2. [Percorso Studente](#manuale-capitolo-percorso-studente)
3. [Percorso Docente](#manuale-capitolo-percorso-docente)
4. [Percorso Professionista](#manuale-capitolo-percorso-professionista)
5. [Anagrafiche e dati base](#manuale-capitolo-anagrafiche)
6. [Vendite](#manuale-capitolo-vendite)
7. [Acquisti](#manuale-capitolo-acquisti)
8. [Magazzino](#manuale-capitolo-magazzino)
9. [Contabilità operativa](#manuale-capitolo-contabilita)
10. [Workflow approvativo](#manuale-capitolo-workflow)
11. [Segnalazioni operative](#manuale-capitolo-segnalazioni)
12. [Mini B.I. didattica](#manuale-capitolo-mini-bi)
13. [Backup, import e reset](#manuale-capitolo-backup)
14. [Gruppi, ruoli e permessi](#manuale-capitolo-permessi)
15. [Esercitazioni guidate](#manuale-capitolo-esercitazioni)
16. [FAQ e controlli finali](#manuale-capitolo-faq)

---

<span id="manuale-capitolo-primi-passi" class="cdsdm-manual-anchor"></span>

## Capitolo 1 — Primi passi

CDSDM — Cloud Data Suite for Digital Management è una single-page app didattica per simulare flussi aziendali con Firebase Auth e Firestore. La persistenza principale resta Firestore e i dati possono trovarsi nel percorso legacy personale o nel gruppo business condiviso.

Percorso iniziale consigliato:

1. accedi con il tuo utente;
2. verifica se stai lavorando in dati personali legacy o in un Gruppo aziendale;
3. controlla Dashboard e menu laterale;
4. crea o importa anagrafiche minime;
5. usa un flusso alla volta: documento, approvazione, evasione, controllo, analisi;
6. prima di prove distruttive esegui un backup JSON.

Concetti chiave:

```text
users/{uid}                    dati personali legacy
businessGroups/{groupId}       dati condivisi di gruppo
AppStore/globalData            cache front-end delle collezioni caricate
Firestore                      archivio principale
```

Checklist Primi passi:

- [ ] So distinguere dati personali e gruppo business.
- [ ] So dove si trova il Manuale Utente.
- [ ] So usare l'icona **?** accanto al titolo pagina.
- [ ] Ho verificato almeno clienti, fornitori e prodotti/servizi.
- [ ] Ho capito che CDSDM è didattico e non sostituisce software fiscale certificato.

---

<span id="manuale-capitolo-percorso-studente" class="cdsdm-manual-anchor"></span>

## Capitolo 2 — Percorso Studente

Lo studente usa CDSDM per comprendere come i dati aziendali si collegano tra loro. Il percorso consigliato parte dalle anagrafiche, attraversa vendite/acquisti/magazzino e arriva all'analisi con Mini B.I.

Sequenza consigliata:

1. accedi e controlla il gruppo assegnato dal docente;
2. leggi lo scenario didattico o il compito assegnato;
3. crea cliente, fornitore, prodotto e servizio;
4. crea un preventivo cliente;
5. approva o fai approvare il documento nel workflow;
6. genera ordine cliente e DDT cliente;
7. registra un acquisto e un DDT fornitore;
8. osserva giacenze, quarantena e segnalazioni;
9. consulta Mini B.I. e dashboard;
10. consegna esportazioni, screenshot o backup richiesti.

Cosa imparare:

- differenza tra bozza e documento operativo;
- relazione tra ordine, DDT, fattura e scadenze;
- effetto delle quantità ricevute/evase sul magazzino;
- significato degli alert e delle segnalazioni operative.

Checklist Studente:

- [ ] Ho completato almeno un flusso vendita.
- [ ] Ho completato almeno un flusso acquisto.
- [ ] Ho consultato il workflow approvativo.
- [ ] Ho creato o seguito una segnalazione operativa.
- [ ] Ho letto un indicatore Mini B.I. e ne so spiegare il dato origine.

---

<span id="manuale-capitolo-percorso-docente" class="cdsdm-manual-anchor"></span>

## Capitolo 3 — Percorso Docente

Il docente usa CDSDM come ambiente di simulazione aziendale. L'obiettivo non è solo far compilare maschere, ma far osservare agli studenti il ciclo informativo: dati base, documenti, workflow, anomalie, analisi.

Preparazione consigliata:

1. crea o seleziona un Gruppo aziendale;
2. prepara dati minimi o importa un backup didattico;
3. assegna ruoli o profili coerenti con l'esercitazione;
4. definisci obiettivi e vincoli;
5. chiedi agli studenti di documentare passaggi e decisioni;
6. usa Mini B.I., audit e segnalazioni per la discussione finale;
7. salva backup iniziale e finale per confronto.

Esempi di ruoli didattici:

- commerciale: preventivi, ordini cliente, DDT cliente;
- acquisti: ordini fornitore, ricezione, anomalie;
- magazzino: giacenze, lotti, quarantena;
- amministrazione: scadenze, incassi, pagamenti;
- direzione/docente: dashboard, Mini B.I., workflow e controllo.

Checklist Docente:

- [ ] Ho preparato scenario e dati iniziali.
- [ ] Ho chiarito cosa ogni studente deve produrre.
- [ ] Ho verificato permessi e visibilità menu.
- [ ] Ho previsto almeno un punto di controllo con workflow.
- [ ] Ho previsto una discussione su Mini B.I. o segnalazioni.

---

<span id="manuale-capitolo-percorso-professionista" class="cdsdm-manual-anchor"></span>

## Capitolo 4 — Percorso Professionista

Il professionista usa CDSDM come prototipo didattico per osservare flussi aziendali semplificati. Deve considerare l'app come ambiente dimostrativo, non come gestionale fiscale certificato.

Percorso consigliato:

1. verifica impostazioni aziendali e gruppo business;
2. crea anagrafiche coerenti;
3. prova un ciclo vendita completo;
4. prova un ciclo acquisto con ricezione merce;
5. controlla giacenze e scadenze;
6. osserva workflow e segnalazioni;
7. esporta dati o backup per analisi.

Limiti da ricordare:

- CDSDM non introduce backend custom;
- Cloud Functions non sono richieste;
- Firestore è l'archivio principale;
- regole Firestore e permessi UI devono restare allineati, ma la UI non sostituisce la sicurezza server-side delle rules.

Checklist Professionista:

- [ ] Ho capito quali dati sono didattici.
- [ ] Ho verificato backup/import/reset.
- [ ] Ho identificato i flussi già coperti e quelli non coperti.
- [ ] Ho controllato la coerenza tra documento e stato operativo.

---

<span id="manuale-capitolo-anagrafiche" class="cdsdm-manual-anchor"></span>

## Capitolo 5 — Anagrafiche e dati base

Le anagrafiche sono il punto di partenza di ogni simulazione. Senza dati base coerenti, i flussi successivi risultano poco leggibili.

Aree principali:

- **Clienti**: usati in preventivi, ordini cliente, DDT cliente e fatture.
- **Fornitori**: usati in ordini fornitore, DDT fornitore e documenti di acquisto.
- **Servizi / Prodotti**: usati nelle righe documentali e nel magazzino.
- **Codici IVA, pagamenti e banche**: usati per documenti, scadenze e contabilità operativa.

Buona pratica didattica: crea pochi dati ma significativi. Un cliente, un fornitore, un prodotto fisico e un servizio bastano per molte esercitazioni.

Checklist Anagrafiche:

- [ ] Esiste almeno un cliente.
- [ ] Esiste almeno un fornitore.
- [ ] Esiste almeno un prodotto fisico.
- [ ] Esiste almeno un servizio.
- [ ] I dati sono coerenti con lo scenario assegnato.

---

<span id="manuale-capitolo-vendite" class="cdsdm-manual-anchor"></span>

## Capitolo 6 — Vendite

Il flusso vendite mostra come una richiesta commerciale diventa documento operativo e poi informazione di controllo.

Flusso didattico completo:

1. **Anagrafiche → Clienti**: crea o verifica il cliente.
2. **Anagrafiche → Servizi / Prodotti**: verifica le righe vendibili.
3. **Vendite → Preventivi cliente**: crea il preventivo.
4. **Analisi → Workflow approvativi**: approva il preventivo se nasce in bozza.
5. **Preventivi cliente → Crea ordine cliente**: genera l'ordine da preventivo approvato o accettato.
6. **Vendite → Elenco DDT cliente**: collega ordini cliente confermati e usa il pulsante **Nuovo DDT cliente** quando serve.
7. **Vendite → Fatturazione DDT cliente** o **Nuova fattura**: genera il documento simulato.
8. **Contabilità → Incassi e pagamenti**: registra l'incasso.
9. **Analisi → Mini B.I. didattica**: osserva vendite, margini o indicatori disponibili.

Punti di attenzione:

- un preventivo in bozza non va considerato operativo;
- un ordine cliente non confermato non dovrebbe alimentare flussi successivi;
- le quantità devono essere numeri interi quando il contesto prodotto lo richiede.

Checklist Vendite:

- [ ] Ho creato o verificato il cliente.
- [ ] Ho creato un preventivo.
- [ ] Ho capito quando il preventivo diventa approvato/accettato.
- [ ] Ho generato o collegato un ordine cliente.
- [ ] Ho creato o verificato un DDT cliente.
- [ ] Ho osservato l'effetto in contabilità o Mini B.I.

---

<span id="manuale-capitolo-acquisti" class="cdsdm-manual-anchor"></span>

## Capitolo 7 — Acquisti

Il flusso acquisti mostra il ciclo opposto al ciclo vendita: fabbisogno, ordine a fornitore, ricezione, controllo, eventuale anomalia.

Flusso didattico completo:

1. **Anagrafiche → Fornitori**: crea o verifica il fornitore.
2. **Acquisti → Elenco Ordini fornitore**: consulta gli ordini e usa il pulsante **Nuovo Ordine fornitore** nella pagina per preparare la richiesta di acquisto.
3. **Analisi → Workflow approvativi**: approva l'ordine se è in bozza.
4. **Acquisti → Elenco DDT fornitore**: registra la ricezione merce da ordine confermato usando il pulsante **Nuovo DDT fornitore** nella pagina.
5. Indica quantità ricevute, accettate, mancanti o in quarantena.
6. Se emerge un problema, genera una **Segnalazione operativa**.
7. Consulta magazzino e Mini B.I. per osservare l'impatto.

Punti di attenzione:

- ordini annullati, respinti o ancora in bozza non dovrebbero alimentare DDT operativi;
- la merce in quarantena non è pienamente disponibile;
- le anomalie rilevanti vanno trasformate in segnalazioni, non lasciate come note isolate.

Checklist Acquisti:

- [ ] Ho creato o verificato il fornitore.
- [ ] Ho creato un ordine fornitore.
- [ ] Ho verificato lo stato approvativo.
- [ ] Ho creato un DDT fornitore collegato.
- [ ] Ho gestito eventuali quantità mancanti o in quarantena.
- [ ] Ho creato una segnalazione se serve.

---

<span id="manuale-capitolo-magazzino" class="cdsdm-manual-anchor"></span>

## Capitolo 8 — Magazzino

Il magazzino collega prodotti, ricezioni, uscite, valorizzazione e anomalie. È il luogo in cui i documenti diventano disponibilità fisica o criticità.

Aree principali:

- inventario e giacenze;
- movimenti di magazzino;
- lotti, matricole e scadenze;
- valorizzazione didattica;
- quarantena merce da DDT fornitore.

Interpretazione didattica:

- giacenza disponibile: quantità utilizzabile;
- quarantena: quantità ricevuta ma non pienamente accettata;
- movimento: traccia di ingresso/uscita;
- lotto/matricola/scadenza: dettaglio utile per tracciabilità.

Checklist Magazzino:

- [ ] Ho capito quali documenti generano movimenti.
- [ ] Ho distinto disponibile, mancante e quarantena.
- [ ] Ho verificato almeno una giacenza.
- [ ] Ho collegato un'anomalia a una segnalazione operativa.

---

<span id="manuale-capitolo-contabilita" class="cdsdm-manual-anchor"></span>

## Capitolo 9 — Contabilità operativa

La contabilità in CDSDM è gestionale e didattica. Serve a collegare documenti, scadenze, incassi/pagamenti e controlli, non a produrre adempimenti fiscali certificati.

Aree principali:

- incassi e pagamenti;
- scadenzario;
- prima nota;
- estratti conto;
- riconciliazioni;
- budget e marginalità;
- registri IVA simulati.

Come usarla in aula:

1. genera documenti di vendita o acquisto;
2. osserva le scadenze;
3. registra un pagamento o incasso;
4. controlla prima nota o estratto conto;
5. discuti differenza tra flusso economico, finanziario e documentale.

Checklist Contabilità:

- [ ] Ho collegato un documento a una scadenza.
- [ ] Ho registrato almeno un incasso o pagamento.
- [ ] Ho capito che il modulo è didattico/gestionale.
- [ ] Ho osservato un indicatore economico o finanziario.

---

<span id="manuale-capitolo-workflow" class="cdsdm-manual-anchor"></span>

## Capitolo 10 — Workflow approvativo

Il workflow approvativo trasforma documenti in bozza in documenti operativi quando il processo richiede controllo interno.

Percorso reale:

```text
Analisi → Workflow approvativi
```

Azioni tipiche:

1. apri il workflow;
2. filtra tipo documento o stato;
3. controlla dati e motivazione;
4. approva, respingi, blocca o richiedi revisione;
5. verifica il nuovo stato del documento originale.

Esempi di effetto operativo:

- ordine cliente approvato → `confirmed`;
- ordine fornitore approvato → `confirmed`;
- DDT fornitore approvato → `received`;
- DDT cliente approvato → `delivered`;
- preventivo approvato → `approved` e successivamente trasformabile in ordine cliente se previsto dal flusso.

Checklist Workflow:

- [ ] Ho individuato i documenti in bozza.
- [ ] Ho approvato o respinto un elemento.
- [ ] Ho verificato lo stato aggiornato sul documento.
- [ ] Ho capito che la bozza non equivale a documento operativo.

---

<span id="manuale-capitolo-segnalazioni" class="cdsdm-manual-anchor"></span>

## Capitolo 11 — Segnalazioni operative

Le segnalazioni operative registrano anomalie, richieste di verifica e comunicazioni interne simulate. Sono salvate nella collezione Firestore `operationalReports`.

Percorso reale dell'app:

```text
Analisi → Segnalazioni operative
```

Perché sono in Analisi: la voce è collocata nell'area di monitoraggio, ma dal punto di vista didattico appartiene anche al flusso operativo perché collega documenti, prodotti, soggetti, DDT, quarantena, alert e comunicazioni.

Flusso tipico:

1. crea una segnalazione o ricevi una bozza precompilata da DDT, quarantena o alert B.I.;
2. completa area origine, reparto destinatario, severità, priorità e descrizione;
3. collega eventuali documenti, prodotti o soggetti;
4. invia la segnalazione;
5. usa comunicazioni interne e cambi stato;
6. chiudi la segnalazione quando il caso è risolto.

Stati principali: bozza, segnalata, assegnata, in lavorazione, in attesa informazioni, risolta, chiusa, annullata.

Checklist Segnalazioni:

- [ ] Ho creato una nuova segnalazione.
- [ ] Ho indicato area, severità e priorità.
- [ ] Ho collegato un documento o un prodotto se necessario.
- [ ] Ho inviato o assegnato la segnalazione.
- [ ] Ho usato almeno un cambio stato.
- [ ] Ho verificato se l'anomalia è visibile nel cruscotto o nella Mini B.I.

---

<span id="manuale-capitolo-mini-bi" class="cdsdm-manual-anchor"></span>

## Capitolo 12 — Mini B.I. didattica

La Mini B.I. legge dati già presenti in `AppStore/globalData` e produce indicatori didattici. Non crea una nuova fonte certificata: interpreta le collezioni esistenti.

Aree principali:

- vendite;
- acquisti;
- contabilità;
- magazzino;
- direzione/amministrazione;
- didattica/docente;
- cruscotti operativi e alert.

Uso consigliato:

1. genera alcuni documenti;
2. ricarica o aggiorna i dati se necessario;
3. apri Mini B.I.;
4. usa filtri e drill-down;
5. esporta CSV se richiesto;
6. collega alert rilevanti a segnalazioni operative.

Uso da smartphone nella 0.13.5 e 0.13.11:

- parti dalle card KPI principali;
- cambia area solo quando serve;
- usa il drill-down per approfondimenti brevi;
- considera CSV/report e catalogo KPI come funzioni più comode da tablet o desktop;
- ricorda che la vista mobile è sintetica e non cambia formule, permessi o dati salvati.

Checklist Mini B.I.:

- [ ] Ho capito da quali dati nasce un indicatore.
- [ ] Ho usato almeno un filtro.
- [ ] Ho aperto un drill-down.
- [ ] Ho esportato o discusso un risultato.
- [ ] Ho distinto dato didattico e dato certificato.

---

<span id="manuale-capitolo-backup" class="cdsdm-manual-anchor"></span>

## Capitolo 13 — Backup, import e reset

Prima di importare, ripristinare o resettare dati, esegui sempre un backup JSON. Il backup è lo strumento principale per salvare, trasferire o confrontare scenari didattici.

Da 0.12.16 il backup/import/ripristino include anche `operationalReports`, allineando segnalazioni operative, reset e collezioni reali.

Regole operative:

- **Backup JSON**: esporta il contesto dati attivo.
- **Import Backup JSON**: aggiorna/aggiunge record presenti nel file, senza cancellare automaticamente record assenti.
- **Ripristino totale**: reset del root dati attivo e successivo import del backup.
- **Reset totale dati**: elimina le collezioni principali del root dati attivo.

Percorsi dati supportati:

```text
users/{uid}/...
businessGroups/{groupId}/...
```

Checklist Backup:

- [ ] Ho capito qual è il root dati attivo.
- [ ] Ho eseguito un backup prima di un reset.
- [ ] So che `operationalReports` è incluso.
- [ ] So distinguere import incrementale e ripristino totale.
- [ ] Ho conservato il file JSON in modo riconoscibile.

---

<span id="manuale-capitolo-permessi" class="cdsdm-manual-anchor"></span>

## Capitolo 14 — Gruppi, ruoli e permessi

CDSDM mantiene compatibilità con il percorso legacy personale e con i gruppi business condivisi.

```text
users/{uid}
businessGroups/{groupId}
```

I permessi UI determinano cosa l'utente vede e può usare nell'interfaccia; le regole Firestore proteggono l'accesso ai dati. Devono restare il più possibile allineati.

In una simulazione:

- il docente o amministratore prepara gruppo e ruoli;
- gli studenti operano con visibilità differenziata;
- i moduli non autorizzati non dovrebbero essere usati;
- Mini B.I. e dati sensibili rispettano la visibilità prevista.

Checklist Permessi:

- [ ] Ho selezionato il gruppo corretto.
- [ ] Ho capito il mio ruolo.
- [ ] Ho verificato che il menu sia coerente con il ruolo.
- [ ] Ho capito che UI e Firestore rules sono livelli diversi.

---

<span id="manuale-capitolo-esercitazioni" class="cdsdm-manual-anchor"></span>

## Capitolo 15 — Esercitazioni guidate

Queste esercitazioni usano solo flussi già presenti in CDSDM. Sono pensate per aula, autoapprendimento o verifica.

### Esercitazione 1 — Ciclo vendita base

Obiettivo: trasformare una richiesta cliente in flusso documentale.

Passaggi:

1. crea un cliente;
2. crea un prodotto o servizio;
3. crea un preventivo;
4. approva o accetta il preventivo;
5. genera ordine cliente;
6. crea DDT cliente;
7. registra incasso o verifica scadenza;
8. osserva Mini B.I.

Risultato atteso: lo studente sa spiegare differenza tra preventivo, ordine, DDT e incasso.

### Esercitazione 2 — Ciclo acquisto base

Obiettivo: comprendere ordine fornitore, ricezione e controllo.

Passaggi:

1. crea un fornitore;
2. crea un ordine fornitore;
3. approva l'ordine se richiesto;
4. registra DDT fornitore;
5. verifica quantità ricevute e accettate;
6. osserva magazzino.

Risultato atteso: lo studente sa distinguere ordinato, ricevuto, accettato e mancante.

### Esercitazione 3 — Magazzino e quarantena

Obiettivo: collegare ricezione non conforme e gestione anomalia.

Passaggi:

1. parti da un DDT fornitore;
2. inserisci quantità con parte in quarantena;
3. controlla la disponibilità;
4. genera o compila una segnalazione operativa;
5. cambia stato fino a risolta o chiusa.

Risultato atteso: lo studente comprende il legame tra controllo merce e workflow operativo.

### Esercitazione 4 — Workflow approvativo

Obiettivo: capire perché una bozza non è un documento operativo.

Passaggi:

1. crea un documento in bozza;
2. apri Analisi → Workflow approvativi;
3. approva o respingi;
4. torna al documento originale;
5. verifica cambio stato e disponibilità nel flusso successivo.

Risultato atteso: lo studente sa spiegare l'effetto dell'approvazione.

### Esercitazione 5 — Segnalazione operativa da DDT fornitore

Obiettivo: trasformare una criticità di ricezione in caso operativo tracciato.

Passaggi:

1. apri o crea un DDT fornitore;
2. registra una quantità non conforme o in quarantena;
3. crea la segnalazione collegata;
4. assegna reparto destinatario e severità;
5. aggiungi una comunicazione interna;
6. porta la segnalazione a risolta.

Risultato atteso: lo studente collega documento, prodotto, anomalia, comunicazione e stato.

### Esercitazione 6 — Mini B.I. e cruscotti

Obiettivo: leggere indicatori e collegarli ai dati origine.

Passaggi:

1. genera almeno un flusso vendita e uno acquisto;
2. apri Mini B.I.;
3. usa filtri e drill-down;
4. esporta CSV se richiesto;
5. discuti eventuali alert;
6. crea segnalazione da alert se il flusso lo prevede.

Risultato atteso: lo studente sa motivare un KPI con esempi dai dati.

### Esercitazione 7 — Backup, reset e import

Obiettivo: proteggere e ripristinare uno scenario didattico.

Passaggi:

1. crea alcuni dati e almeno una segnalazione operativa;
2. esporta backup JSON;
3. esegui reset nel contesto corretto solo se richiesto;
4. importa il backup;
5. verifica che anagrafiche, documenti e `operationalReports` siano presenti.

Risultato atteso: lo studente distingue backup, import incrementale, ripristino totale e reset.

---

<span id="manuale-capitolo-faq" class="cdsdm-manual-anchor"></span>

## Capitolo 16 — FAQ e controlli finali

### Perché non vedo un ordine nel DDT?
Probabilmente l'ordine è ancora in bozza, respinto, annullato o non confermato. Verifica il workflow approvativo.

### Le segnalazioni operative sono documenti fiscali?
No. Sono record operativi/didattici per anomalie, comunicazioni e responsabilità interne.

### Il pulsante ? sostituisce questo manuale?
No. Il pulsante **?** mostra un aiuto breve sulla pagina corrente e rimanda al capitolo più vicino; il manuale spiega il processo completo.

### Dove sono salvate le segnalazioni operative?
Nella collezione Firestore `operationalReports`, sotto `users/{uid}` o `businessGroups/{groupId}` in base al contesto attivo.

### La 0.12.18 cambia i dati?
No. La 0.12.18 è documentale/didattica: migliora manuale, checklist, esercitazioni e test di coerenza.

### Posso usare Cloud Functions?
Non sono richieste. Il progetto resta front-end con Firebase Auth e Firestore.

Controllo finale di apprendimento:

- [ ] So seguire un percorso Studente, Docente o Professionista.
- [ ] So completare almeno una esercitazione guidata.
- [ ] So usare manuale e icona **?** insieme.
- [ ] So quando fare backup.
- [ ] So spiegare il legame tra workflow, segnalazioni e Mini B.I.


---

## Nota 0.12.19 — Console docente e Audit sicurezza

La Console docente mostra in primo piano solo gli indicatori leggibili del dataset gruppo. Il report JSON tecnico resta disponibile tramite copia o sezione dettagli, ma non è più presentato come contenuto principale.

In Audit sicurezza, l’accesso superadmin è stato corretto per le inizializzazioni Firestore legacy: se Firestore non è disponibile, l’app mostra un messaggio esplicito invece dell’errore generico sulla proprietà `collection`.


## Uso da smartphone e tablet — audit 0.13.0

La versione 0.13.0 non cambia il funzionamento dell’app, ma chiarisce come usarla da dispositivi mobili.

Uso consigliato da smartphone:

- consultare dashboard, notifiche e manuale;
- leggere dati e documenti;
- aprire o seguire segnalazioni operative;
- controllare workflow approvativi semplici;
- usare aiuti rapidi e checklist didattiche.

Uso ancora consigliato da desktop/tablet:

- compilare documenti con molte righe;
- importare, esportare, fare backup/reset/import;
- configurare ruoli, permessi e audit sicurezza;
- usare cruscotti Mini B.I. con drill-down complessi.

Per i dettagli tecnici consultare `116_MOBILE_READINESS_AUDIT_0130.md`.


## Mobile usability 0.13.1

La versione 0.13.1 migliora la lettura del manuale, degli aiuti rapidi e delle pagine informative su smartphone. Non introduce nuovi flussi: l'uso completo dei documenti complessi resta consigliato da desktop/tablet, mentre da telefono sono privilegiati consultazione, manuale, checklist, aiuti rapidi e controllo sintetico.


---

## Nota mobile 0.13.2 — Tabelle e liste responsive

La versione **0.13.2** migliora la consultazione delle tabelle da smartphone. Le tabelle operative restano in formato classico su desktop e tablet; sotto i 576 px le righe possono essere presentate come schede con etichette di colonna visibili sopra i valori.

Questa evoluzione è pensata per leggere e controllare dati, non per rendere mobile-first la compilazione completa di documenti complessi. Per fatture, DDT, ordini con molte righe, backup/import e configurazioni avanzate resta consigliato l'uso da desktop o tablet.


## Nota mobile 0.13.3 — Workflow e Segnalazioni operative

La versione **0.13.3** migliora l'uso da smartphone di **Analisi → Workflow approvativi** e **Analisi → Segnalazioni operative**.

Su telefono le attività e le segnalazioni restano basate sugli stessi dati e sugli stessi permessi, ma risultano più leggibili grazie a schede responsive, pulsanti più comodi e suggerimenti contestuali.

Uso consigliato da smartphone:

1. filtrare attività o segnalazioni aperte;
2. consultare stato, priorità, documento e referente;
3. aprire il dettaglio;
4. registrare una presa in carico o un cambio stato semplice;
5. rimandare a desktop/tablet la compilazione di documenti complessi.

La 0.13.3 non introduce nuovi flussi, nuove collezioni Firestore o nuove voci di menu.


## Nota 0.13.11 — Coerenza menu documenti

La navigazione dei documenti commerciali usa il modello unico **Elenco nel menu + Nuovo nella pagina**.

Percorsi principali:

- **Vendite → Elenco Preventivi cliente**: elenco e pulsante **Nuovo Preventivo cliente**.
- **Vendite → Elenco Ordini cliente**: elenco e pulsante **Nuovo Ordine cliente**.
- **Vendite → Elenco DDT cliente**: elenco e pulsante **Nuovo DDT cliente**.
- **Acquisti → Elenco Ordini fornitore**: elenco e pulsante **Nuovo Ordine fornitore**.
- **Acquisti → Elenco DDT fornitore**: elenco e pulsante **Nuovo DDT fornitore**.

La modifica è solo di chiarezza UX: non cambia collezioni, regole Firestore, permessi, workflow o backup/import/reset.


## Nota 0.13.11 — Logo trasparente e branding

La versione **0.13.11** rifinisce l’identità visiva del progetto rigenerando il logo principale con **trasparenza reale** e senza contorno bianco marcato. L’obiettivo è migliorare la resa soprattutto nella pagina di login, ma anche in sidebar, home, pagina versione e icone applicative.


## Nota 0.13.11 — Logo con cilindro ocra

La versione **0.13.11** mantiene il logo a sfondo trasparente introdotto nella 0.13.7, ma migliora la leggibilità del cilindro/database usando una tonalità **ocra/oro**. L’obiettivo è ottenere una resa più equilibrata sia sulla login chiara sia sulle aree a sfondo scuro.


## Nota 0.13.11 — Logo approvato in build

La versione **0.13.11** integra nella build il logo approvato in preview. Il branding mantiene lo **sfondo trasparente** e adotta un cilindro/database con **sezioni differenziate**, per ridurre l’effetto di elementi identici impilati e migliorare la resa visiva nella login e nelle altre aree dell’app.


## Nota 0.13.11 — Inviti collaboratore responsive

La versione **0.13.11** chiarisce che gli inviti collaboratore **non vengono inviati via email automaticamente**. Il docente/amministratore deve copiare il codice invito e l'ID gruppo e comunicarli manualmente allo studente o collaboratore.

La lista degli inviti è stata riorganizzata in card responsive per evitare lo scroll orizzontale, soprattutto in Dark Mode e su schermi stretti.


## Nota 0.13.11 — Registrazione con invito

La versione **0.13.11** corregge un blocco che poteva comparire durante la registrazione con invito: l’utente invitato non deve leggere il documento root del Gruppo aziendale prima di essere diventato membro. Il flusso usa quindi i dati già presenti nell’invito e crea prima membro e membership, mantenendo le regole Firestore restrittive.
