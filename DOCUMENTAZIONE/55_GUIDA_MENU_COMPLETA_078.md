# 55. Guida completa alle voci di menu e aiuto contestuale 0.7.8

La versione **0.7.8** aggiunge una guida ordinata per menu e un pulsante contestuale **?** nella barra superiore dell'app. Il pulsante apre questa guida direttamente sul capitolo della pagina visualizzata.

> Nota didattica: alcune voci possono essere nascoste o limitate in base a regime fiscale, ruolo, profilo permesso, matrice permessi e override utente. La guida descrive la funzione della voce; l'accesso effettivo dipende dai permessi attivi e dalle regole Firestore pubblicate.

## Come usare il pulsante ?

1. Apri una voce di menu.
2. In alto, nella barra della pagina, premi il pulsante **?**.
3. L'app apre **Info → Manuale Utente** e posiziona la guida sul paragrafo collegato.
4. Usa **Torna all'Indice** per rientrare nell'indice documentazione.

---

## Home e navigazione generale

<a id="help-target-home" class="menu-help-anchor"></a>
### Home
**Percorso:** Home  
**Serve per:** entrare nel gestionale, vedere lo stato iniziale e orientarsi tra le aree principali.  
**Quando usarla:** all'avvio della lezione o dopo il login.  
**Passo successivo consigliato:** completare **Impostazioni → Azienda**, scegliere il regime fiscale e poi creare anagrafiche base.

<a id="help-target-manuale" class="menu-help-anchor"></a>
### Manuale Utente
**Percorso:** Info → Manuale Utente  
**Serve per:** consultare documentazione, manuali, guide passo-passo, changelog e capitoli tecnici.  
**Quando usarla:** durante esercitazioni, collaudo, primo avvio o risoluzione di dubbi.

<a id="help-target-versione" class="menu-help-anchor"></a>
### Versione
**Percorso:** Info → Versione  
**Serve per:** verificare la versione caricata, consultare il changelog e controllare lo stato generale del pacchetto.  
**Quando usarla:** prima di segnalare problemi o confrontare pacchetti diversi.

---

## Analisi

<a id="help-target-dashboard" class="menu-help-anchor"></a>
### Dashboard
**Percorso:** Analisi → Dashboard  
**Serve per:** vedere indicatori sintetici su documenti, incassi, scadenze, magazzino e andamento gestionale.  
**Quando usarla:** per una panoramica iniziale o per riepilogo a fine esercitazione.

<a id="help-target-centro-notifiche" class="menu-help-anchor"></a>
### Centro notifiche
**Percorso:** Analisi → Centro notifiche  
**Serve per:** consultare avvisi operativi, scadenze e promemoria generati dai dati presenti.  
**Quando usarla:** dopo aver creato fatture, pagamenti, solleciti o workflow.

<a id="help-target-workflow-approvativi" class="menu-help-anchor"></a>
### Workflow approvativi
**Percorso:** Analisi → Workflow approvativi  
**Serve per:** seguire stati, approvazioni leggere e passaggi di controllo sui documenti.  
**Quando usarla:** in esercitazioni con ruoli diversi o documenti da validare.

<a id="help-target-audit-trail" class="menu-help-anchor"></a>
### Registro attività
**Percorso:** Analisi → Registro attività  
**Serve per:** leggere eventi applicativi, controlli e azioni registrate a scopo didattico.  
**Quando usarla:** per spiegare tracciabilità, controllo interno e responsabilità operative.

<a id="help-target-ux-accessibilita" class="menu-help-anchor"></a>
### UX / accessibilità
**Percorso:** Analisi → UX / accessibilità  
**Serve per:** controllare elementi di usabilità, etichette, pulsanti e compatibilità con tema scuro.  
**Quando usarla:** durante rifinitura UI o collaudo in aula.

<a id="help-target-budget-marginalita" class="menu-help-anchor"></a>
### Budget e marginalità
**Percorso:** Analisi → Budget e marginalità  
**Serve per:** stimare budget, costi, ricavi e marginalità gestionale.  
**Quando usarla:** in lezioni su controllo di gestione e preventivazione.

<a id="help-target-centro-stampe" class="menu-help-anchor"></a>
### Stampe / PDF
**Percorso:** Analisi → Stampe / PDF  
**Serve per:** accedere a stampe riepilogative e output HTML/PDF disponibili.  
**Quando usarla:** per consegnare elaborati, controllare documenti o produrre materiale di verifica.

<a id="help-target-statistiche" class="menu-help-anchor"></a>
### Statistiche
**Percorso:** Analisi → Statistiche  
**Serve per:** analizzare dati aggregati per anno, documenti, clienti, fornitori e andamento economico.  
**Quando usarla:** dopo aver inserito un dataset completo.

<a id="help-target-report-gestionali" class="menu-help-anchor"></a>
### Report gestionali
**Percorso:** Analisi → Report gestionali  
**Serve per:** consultare report riepilogativi sui principali flussi del gestionale.  
**Quando usarla:** a fine scenario didattico o per verifica docente.

---

## Vendite

<a id="help-target-preventivi" class="menu-help-anchor"></a>
### Elenco Preventivi cliente
**Percorso:** Vendite → Elenco Preventivi cliente  
**Serve per:** visualizzare, creare, modificare e seguire preventivi verso clienti.  
**Flusso tipico:** cliente → preventivo → ordine cliente → DDT cliente → fattura.

<a id="help-target-menu-nuovo-preventivo-cliente" class="menu-help-anchor"></a>
### Nuovo Preventivo cliente
**Percorso:** Vendite → Nuovo Preventivo cliente  
**Serve per:** avviare rapidamente la creazione di un nuovo preventivo.  
**Dati richiesti:** cliente, righe prodotto/servizio, prezzi, condizioni e stato.

<a id="help-target-ordini-cliente" class="menu-help-anchor"></a>
### Elenco Ordini cliente
**Percorso:** Vendite → Elenco Ordini cliente  
**Serve per:** gestire ordini ricevuti dai clienti e prepararli per evasione o DDT.  
**Flusso tipico:** preventivo accettato o richiesta cliente → ordine → DDT/fattura.

<a id="help-target-menu-nuovo-ordine-cliente" class="menu-help-anchor"></a>
### Nuovo Ordine cliente
**Percorso:** Vendite → Nuovo Ordine cliente  
**Serve per:** inserire un ordine cliente senza passare da preventivo.  
**Dati richiesti:** cliente, righe, quantità, prezzi e stato operativo.

<a id="help-target-ddt-cliente" class="menu-help-anchor"></a>
### DDT cliente
**Percorso:** Vendite → DDT cliente  
**Serve per:** emettere documenti di trasporto verso clienti, anche da uno o più ordini.  
**Flusso tipico:** ordine cliente → DDT cliente → fattura riepilogativa con DatiDDT XML.

<a id="help-target-fatturazione-ddt-cliente" class="menu-help-anchor"></a>
### Fatturazione DDT cliente
**Percorso:** Vendite → Fatturazione DDT cliente  
**Serve per:** creare fatture riepilogative partendo da più DDT cliente.  
**Quando usarla:** quando una consegna è stata documentata con DDT e deve essere fatturata successivamente.

<a id="help-target-nuova-fattura-accompagnatoria" class="menu-help-anchor"></a>
### Nuova Fattura / Nuova Nota Credito
**Percorso:** Vendite → Nuova Fattura oppure Nuova Nota Credito  
**Serve per:** creare documenti fiscali di vendita o rettifiche/resi cliente.  
**Dati richiesti:** cliente, numero, data, pagamento, righe, IVA/natura e riferimenti collegati.

<a id="help-target-elenco-fatture" class="menu-help-anchor"></a>
### Elenco Documenti
**Percorso:** Vendite → Elenco Documenti  
**Serve per:** consultare fatture, note di credito e documenti di vendita già salvati.  
**Azioni tipiche:** aprire dettaglio, stampare, generare XML, collegare pagamenti, verificare stato.

---

## Acquisti

<a id="help-target-ordini-fornitore" class="menu-help-anchor"></a>
### Elenco Ordini fornitore
**Percorso:** Acquisti → Elenco Ordini fornitore  
**Serve per:** gestire ordini inviati ai fornitori.  
**Flusso tipico:** fabbisogno/magazzino → ordine fornitore → DDT fornitore ricevuto → acquisto.

<a id="help-target-menu-nuovo-ordine-fornitore" class="menu-help-anchor"></a>
### Nuovo Ordine fornitore
**Percorso:** Acquisti → Nuovo Ordine fornitore  
**Serve per:** inserire un nuovo ordine a fornitore.  
**Dati richiesti:** fornitore, prodotti/servizi, quantità, prezzi e stato.

<a id="help-target-ddt-fornitore" class="menu-help-anchor"></a>
### DDT fornitore
**Percorso:** Acquisti → DDT fornitore  
**Serve per:** registrare merci o servizi ricevuti da fornitore tramite DDT.  
**Effetti:** aggiorna i flussi collegati al magazzino quando sono presenti prodotti fisici.

<a id="help-target-nuovo-acquisto" class="menu-help-anchor"></a>
### Nuovo Acquisto
**Percorso:** Acquisti → Nuovo Acquisto  
**Serve per:** registrare una fattura o spesa fornitore.  
**Nota regime:** in regime forfettario la gestione acquisti può essere limitata o nascosta.

<a id="help-target-elenco-acquisti" class="menu-help-anchor"></a>
### Elenco Acquisti
**Percorso:** Acquisti → Elenco Acquisti  
**Serve per:** consultare e controllare fatture/spese fornitore registrate.  
**Quando usarla:** per scadenzario, report, prima nota e analisi costi.

---

## Contabilità

<a id="help-target-partitario" class="menu-help-anchor"></a>
### Partitario
**Percorso:** Contabilità → Partitario  
**Serve per:** visualizzare movimenti per cliente o fornitore.  
**Quando usarla:** per controllare crediti, debiti e documenti collegati a un soggetto.

<a id="help-target-incassi-pagamenti" class="menu-help-anchor"></a>
### Incassi e pagamenti
**Percorso:** Contabilità → Incassi e pagamenti  
**Serve per:** registrare incassi cliente e pagamenti fornitore.  
**Effetti:** aggiorna lo stato gestionale dei documenti e alimenta report finanziari.

<a id="help-target-prima-nota" class="menu-help-anchor"></a>
### Prima nota
**Percorso:** Contabilità → Prima nota  
**Serve per:** registrare movimenti finanziari semplificati.  
**Quando usarla:** per cassa, banca e movimenti non coperti direttamente da fatture.

<a id="help-target-estratto-conto" class="menu-help-anchor"></a>
### Estratto conto
**Percorso:** Contabilità → Estratto conto  
**Serve per:** riepilogare la posizione di clienti e fornitori.  
**Quando usarla:** per controllo saldi, crediti/debiti e comunicazioni didattiche.

<a id="help-target-solleciti" class="menu-help-anchor"></a>
### Solleciti
**Percorso:** Contabilità → Solleciti  
**Serve per:** gestire promemoria e solleciti su scadenze non saldate.  
**Quando usarla:** dopo aver registrato fatture con scadenze aperte.

<a id="help-target-riconciliazione-banca" class="menu-help-anchor"></a>
### Riconciliazione banca
**Percorso:** Contabilità → Riconciliazione banca  
**Serve per:** confrontare movimenti gestionali e movimenti bancari simulati.  
**Quando usarla:** in lezioni su controllo incassi/pagamenti.

<a id="help-target-bilancino" class="menu-help-anchor"></a>
### Bilancino
**Percorso:** Contabilità → Bilancino  
**Serve per:** vedere un riepilogo economico-finanziario semplificato.  
**Nota:** è un riepilogo didattico, non un bilancio civilistico.

<a id="help-target-scadenziario" class="menu-help-anchor"></a>
### Scadenziario
**Percorso:** Contabilità → Scadenziario  
**Serve per:** controllare scadenze di incasso, pagamento, IVA e adempimenti gestionali.  
**Quando usarla:** dopo aver inserito documenti con date pagamento/scadenza.

<a id="help-target-registri-iva" class="menu-help-anchor"></a>
### Registri IVA
**Percorso:** Contabilità → Registri IVA  
**Serve per:** consultare riepiloghi IVA vendite/acquisti.  
**Nota regime:** disponibile solo in regime ordinario.

---

## Commesse, progetti, timesheet e simulazioni

<a id="help-target-commesse" class="menu-help-anchor"></a>
### Commesse
**Percorso:** Commesse / Progetti → Commesse  
**Serve per:** raggruppare attività, clienti, progetti e fatturazione.  
**Quando usarla:** prima di creare progetti e timesheet collegati.

<a id="help-target-progetti" class="menu-help-anchor"></a>
### Progetti
**Percorso:** Commesse / Progetti → Progetti  
**Serve per:** gestire attività operative dentro una commessa.  
**Dati utili:** cliente finale, servizio predefinito, tariffa e stato.

<a id="help-target-timesheet" class="menu-help-anchor"></a>
### Timesheet
**Percorso:** Commesse / Progetti → Timesheet  
**Serve per:** registrare ore lavorate su progetti e commesse.  
**Flusso tipico:** progetto → worklog → import ore in fattura.

<a id="help-target-export-timesheet" class="menu-help-anchor"></a>
### Export CSV
**Percorso:** Commesse / Progetti → Export CSV  
**Serve per:** esportare ore e attività in formato CSV.  
**Quando usarla:** per controllo docente, rendicontazione o elaborazioni esterne.

<a id="help-target-simulazione-ordinario" class="menu-help-anchor"></a>
### Simulazione ordinario
**Percorso:** Simulazioni → Simulazione Ordinario  
**Serve per:** stimare risultati fiscali semplificati in regime ordinario.  
**Nota:** disponibile solo se il regime aziendale è ordinario.

<a id="help-target-simulazione-lm" class="menu-help-anchor"></a>
### Simulazione LM
**Percorso:** Simulazioni → Simulazione LM  
**Serve per:** stimare il quadro LM in regime forfettario.  
**Nota:** disponibile solo se il regime aziendale è forfettario.

---

## Anagrafiche

<a id="help-target-anagrafica-clienti" class="menu-help-anchor"></a>
### Clienti
**Percorso:** Anagrafiche → Clienti  
**Serve per:** creare e modificare anagrafiche clienti.  
**Usata da:** preventivi, ordini cliente, DDT, fatture, incassi, partitario e report.

<a id="help-target-anagrafica-fornitori" class="menu-help-anchor"></a>
### Fornitori
**Percorso:** Anagrafiche → Fornitori  
**Serve per:** creare e modificare anagrafiche fornitori.  
**Usata da:** ordini fornitore, DDT fornitore, acquisti, pagamenti e partitario.

<a id="help-target-anagrafica-prodotti" class="menu-help-anchor"></a>
### Servizi / Prodotti
**Percorso:** Anagrafiche → Servizi / Prodotti  
**Serve per:** gestire prodotti fisici, servizi e costi.  
**Usata da:** righe documento, magazzino, DDT, ordini, preventivi e fatture.

---

## Magazzino

<a id="help-target-magazzino-giacenza-prodotto" class="menu-help-anchor"></a>
### Giacenza prodotto
**Percorso:** Magazzino → Giacenza prodotto  
**Serve per:** consultare il dettaglio di giacenza di un singolo prodotto.  
**Quando usarla:** prima di evadere ordini o analizzare disponibilità.

<a id="help-target-magazzino-giacenze" class="menu-help-anchor"></a>
### Giacenze
**Percorso:** Magazzino → Giacenze  
**Serve per:** vedere disponibilità e quantità dei prodotti fisici.  
**Dati collegati:** movimenti, DDT, inventari e rettifiche.

<a id="help-target-magazzino-inventario-fisico" class="menu-help-anchor"></a>
### Inventario fisico
**Percorso:** Magazzino → Inventario fisico  
**Serve per:** registrare conteggi fisici e confrontarli con giacenze teoriche.  
**Quando usarla:** in esercitazioni di controllo magazzino.

<a id="help-target-magazzino-inventario" class="menu-help-anchor"></a>
### Inventario valorizzato
**Percorso:** Magazzino → Inventario valorizzato  
**Serve per:** stimare il valore di magazzino con criteri semplificati.  
**Nota:** è una valutazione didattica, non una valorizzazione contabile ufficiale.

<a id="help-target-magazzino-lotti" class="menu-help-anchor"></a>
### Lotti / matricole / scadenze
**Percorso:** Magazzino → Lotti / matricole / scadenze  
**Serve per:** gestire tracciabilità di prodotti con lotto, matricola o scadenza.  
**Quando usarla:** per scenari di magazzino avanzato.

<a id="help-target-magazzino-movimenti" class="menu-help-anchor"></a>
### Movimenti
**Percorso:** Magazzino → Movimenti  
**Serve per:** consultare carichi, scarichi e rettifiche.  
**Origine movimenti:** manuale, DDT fornitore, DDT cliente, inventario, quarantena/scarto.

<a id="help-target-magazzino-quarantena" class="menu-help-anchor"></a>
### Quarantena
**Percorso:** Magazzino → Quarantena  
**Serve per:** isolare merce non disponibile o da verificare.  
**Quando usarla:** per merci danneggiate, contestate o in attesa di decisione.

<a id="help-target-magazzino-macerati" class="menu-help-anchor"></a>
### Prodotti macerati
**Percorso:** Magazzino → Prodotti macerati  
**Serve per:** registrare prodotti scartati, macerati o definitivamente non utilizzabili.  
**Effetti:** documenta l'uscita logica/fisica dal ciclo operativo.

---

## Impostazioni e amministrazione

<a id="help-target-anagrafica-azienda" class="menu-help-anchor"></a>
### Azienda
**Percorso:** Impostazioni → Azienda  
**Serve per:** configurare dati aziendali, regime fiscale, riferimenti e impostazioni base.  
**Quando usarla:** sempre al primo avvio, prima di creare documenti.

<a id="help-target-tabella-iva" class="menu-help-anchor"></a>
### Tabella IVA
**Percorso:** Impostazioni → Tabella IVA  
**Serve per:** gestire aliquote, natura e configurazioni IVA usate nei documenti.  
**Quando usarla:** prima di creare fatture/righe con IVA o natura specifica.

<a id="help-target-tabella-pagamenti" class="menu-help-anchor"></a>
### Codici pagamento
**Percorso:** Impostazioni → Codici pagamento  
**Serve per:** configurare modalità e condizioni di pagamento.  
**Usata da:** fatture, acquisti, scadenziario, incassi e pagamenti.

<a id="help-target-banche-aziendali" class="menu-help-anchor"></a>
### Banche aziendali
**Percorso:** Impostazioni → Banche aziendali  
**Serve per:** gestire IBAN e banche dell'azienda.  
**Usata da:** documenti, stampe, XML e pagamenti.

<a id="help-target-uso-dati" class="menu-help-anchor"></a>
### Uso dati
**Percorso:** Impostazioni → Uso dati  
**Serve per:** stimare quantità di dati e collezioni gestite.  
**Quando usarla:** per controllo didattico, backup e pulizia archivi.

<a id="help-target-import-massivi" class="menu-help-anchor"></a>
### Import massivi CSV
**Percorso:** Impostazioni → Import massivi CSV  
**Serve per:** importare dati strutturati da file CSV.  
**Attenzione:** verificare formato e backup prima di importare.

<a id="help-target-ruoli-permessi" class="menu-help-anchor"></a>
### Ruoli e permessi
**Percorso:** Impostazioni → Ruoli e permessi  
**Serve per:** consultare ruolo corrente e regole UI applicate.  
**Quando usarla:** per capire perché una voce è visibile, nascosta o in sola lettura.

<a id="help-target-superadmin" class="menu-help-anchor"></a>
### Superadmin
**Percorso:** Impostazioni → Superadmin  
**Serve per:** bootstrap e diagnostica del superadmin globale applicativo.  
**Nota importante:** Superadmin globale e amministratore/docente di gruppo sono ruoli diversi. Gli inviti agli studenti si creano da **Gruppi aziendali**, non da qui.

<a id="help-target-profili-permesso" class="menu-help-anchor"></a>
### Profili permesso
**Percorso:** Impostazioni → Profili permesso  
**Serve per:** definire profili riutilizzabili con livelli di accesso per moduli.  
**Quando usarla:** prima di assegnare ruoli differenziati agli studenti.

<a id="help-target-matrice-permessi" class="menu-help-anchor"></a>
### Matrice permessi
**Percorso:** Impostazioni → Matrice permessi  
**Serve per:** descrivere cosa significano i livelli nessuno/lettura/scrittura/admin sui moduli.  
**Quando usarla:** per spiegare governance e controllo accessi.

<a id="help-target-override-permessi" class="menu-help-anchor"></a>
### Override permessi
**Percorso:** Impostazioni → Override permessi  
**Serve per:** personalizzare i permessi di un singolo utente rispetto al profilo.  
**Quando usarla:** in scenari didattici con eccezioni controllate.

<a id="help-target-audit-sicurezza" class="menu-help-anchor"></a>
### Audit sicurezza
**Percorso:** Impostazioni → Audit sicurezza  
**Serve per:** controllare accessi, ruoli, permessi e report utenti.  
**Quando usarla:** per verifiche docente o collaudo multiutente.

<a id="help-target-gruppi-aziendali" class="menu-help-anchor"></a>
### Gruppi aziendali
**Percorso:** Impostazioni → Gruppi aziendali  
**Serve per:** creare gruppi condivisi, gestire membri e creare inviti per studenti/collaboratori.  
**Inviti studenti:** crea l'invito, copia ID gruppo + codice e comunicali allo studente. L'app non invia email automaticamente.

<a id="help-target-console-docente" class="menu-help-anchor"></a>
### Console docente
**Percorso:** Impostazioni → Console docente  
**Serve per:** simulazioni e controllo didattico dei gruppi aziendali.  
**Quando usarla:** durante lezioni multiutente e scenari guidati.

<a id="help-target-migrazione-qa" class="menu-help-anchor"></a>
### Migrazione e QA
**Percorso:** Impostazioni → Migrazione e QA  
**Serve per:** confrontare dati legacy personali e dati di gruppo, verificare migrazioni e QA multiutente.  
**Quando usarla:** dopo aver introdotto gruppi aziendali condivisi.

<a id="help-target-avanzate" class="menu-help-anchor"></a>
### Gestione Dati
**Percorso:** Impostazioni → Gestione Dati  
**Serve per:** eseguire backup, import e reset controllato dei dati.  
**Attenzione:** prima di reset/import fare sempre un backup e verificare il contesto dati attivo: legacy personale o gruppo aziendale.

---

## Sequenze consigliate per le lezioni

### Lezione base vendita
1. **Azienda**
2. **Clienti**
3. **Servizi / Prodotti**
4. **Elenco Preventivi cliente**
5. **Elenco Ordini cliente**
6. **DDT cliente**
7. **Elenco Documenti**
8. **Incassi e pagamenti**

### Lezione acquisti e magazzino
1. **Fornitori**
2. **Servizi / Prodotti**
3. **Elenco Ordini fornitore**
4. **DDT fornitore**
5. **Movimenti**
6. **Giacenze**
7. **Inventario fisico**

### Lezione multiutente
1. **Superadmin** solo se serve bootstrap globale
2. **Gruppi aziendali** per creare gruppo e inviti
3. **Profili permesso**
4. **Matrice permessi**
5. **Override permessi**
6. **Audit sicurezza**
7. **Console docente**
