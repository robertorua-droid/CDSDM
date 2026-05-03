# Manuale utente CDSDM — guida visuale operativa

<div class="cdsdm-manual-hero">
  <h2>CDSDM — Cloud Data Suite for Digital Management</h2>
  <p>Questa guida è il manuale generale consultabile da <strong>Info → Manuale Utente</strong>. Gli aiuti rapidi nelle singole pagine restano disponibili dall’icona <strong>?</strong> accanto al titolo e non occupano più spazio fisso nella schermata.</p>
  <p><span class="cdsdm-manual-badge">Vendite</span><span class="cdsdm-manual-badge">Acquisti</span><span class="cdsdm-manual-badge">Magazzino</span><span class="cdsdm-manual-badge">Contabilità</span><span class="cdsdm-manual-badge">Workflow</span><span class="cdsdm-manual-badge">Mini B.I.</span><span class="cdsdm-manual-badge">Segnalazioni operative</span></p>
</div>

## Come usare il manuale

<div class="cdsdm-manual-grid">
  <div class="cdsdm-manual-card"><h3>Aiuto rapido</h3><p>Apri il <strong>?</strong> accanto al titolo pagina per un promemoria breve sul flusso corrente.</p></div>
  <div class="cdsdm-manual-card"><h3>Manuale completo</h3><p>Usa questa voce di menu quando vuoi capire il processo aziendale completo.</p></div>
  <div class="cdsdm-manual-card"><h3>Simulazione</h3><p>Segui i flussi in ordine: bozza, workflow, documento operativo, anomalia o B.I.</p></div>
</div>

<div class="cdsdm-manual-warning"><strong>Da ricordare:</strong> un documento in <strong>Bozza</strong> non è automaticamente lavorabile. Quando previsto, passa dal <strong>Workflow approvativo</strong>.</div>

## Flusso Vendite: preventivo → ordine → DDT → fattura

<ol class="cdsdm-flow-steps">
  <li>Crea un <strong>Preventivo cliente</strong> con cliente, righe e condizioni.</li>
  <li>Se il preventivo resta in bozza, approvalo da <strong>Analisi → Workflow approvativi</strong>.</li>
  <li>Riapri il preventivo approvato e usa <strong>Crea ordine cliente</strong>.</li>
  <li>L’ordine cliente confermato può alimentare uno o più <strong>DDT cliente</strong>.</li>
  <li>Il DDT cliente può essere fatturato singolarmente o tramite fatturazione riepilogativa.</li>
</ol>

<div class="cdsdm-manual-example"><strong>Esempio:</strong> preventivo approvato per 10 pezzi → ordine cliente → DDT per 6 pezzi → DDT successivo per 4 pezzi → fattura riepilogativa.</div>

## Flusso Acquisti: ordine fornitore → ricezione merce

<ol class="cdsdm-flow-steps">
  <li>Crea un <strong>Ordine fornitore</strong>.</li>
  <li>Se è in bozza, approvalo dal <strong>Workflow approvativo</strong>.</li>
  <li>Quando arriva la merce, apri <strong>Acquisti → DDT fornitore</strong>.</li>
  <li>Seleziona fornitore e ordine confermato/lavorabile.</li>
  <li>Registra quantità ricevute, accettate, mancanti o in quarantena.</li>
  <li>Se emerge un’anomalia, crea una <strong>Segnalazione operativa</strong>.</li>
</ol>

<div class="cdsdm-manual-tip"><strong>Suggerimento:</strong> nei DDT fornitore non dovrebbero comparire ordini in bozza, annullati o non approvati.</div>

## Magazzino, quarantena e anomalie

<div class="cdsdm-manual-grid">
  <div class="cdsdm-manual-card"><h3>Giacenze</h3><p>Mostrano la disponibilità operativa e aiutano a verificare evasione ordini e ricezioni.</p></div>
  <div class="cdsdm-manual-card"><h3>Quarantena</h3><p>Isola merce non conforme, danneggiata o da verificare prima dell’uso.</p></div>
  <div class="cdsdm-manual-card"><h3>Segnalazioni</h3><p>Documentano problemi, comunicazioni interne e decisioni tra reparti.</p></div>
</div>

## Segnalazioni operative

<ol class="cdsdm-flow-steps">
  <li>Apri <strong>Workflow → Segnalazioni operative</strong>.</li>
  <li>Compila o crea una bozza precompilata da un flusso operativo.</li>
  <li>Premi <strong>Invia segnalazione</strong> per renderla effettiva.</li>
  <li>Invia comunicazioni interne al reparto destinatario.</li>
  <li>Gestisci lo stato: presa in carico, lavorazione, risolta, chiusa.</li>
</ol>

<div class="cdsdm-manual-example"><strong>Esempio:</strong> merce ricevuta in quarantena → segnalazione da Magazzino ad Acquisti → verifica fornitore → risoluzione e chiusura.</div>

## Workflow approvativo

Il Workflow approvativo rende operativi i documenti in bozza quando il processo richiede controllo interno.

<ol class="cdsdm-flow-steps">
  <li>Apri <strong>Analisi → Workflow approvativi</strong>.</li>
  <li>Filtra il tipo documento.</li>
  <li>Controlla il documento e approva, respingi o richiedi revisione.</li>
  <li>Dopo l’approvazione il documento diventa lavorabile nei flussi collegati.</li>
</ol>

## Mini B.I. operativa

La Mini B.I. legge dati già presenti e mostra KPI didattici, drill-down, alert ed export.

<div class="cdsdm-manual-warning"><strong>Limite:</strong> la Mini B.I. è gestionale e didattica. Non sostituisce contabilità, bilancio, controllo fiscale o consulenza professionale.</div>

## Backup, import e reset

<ol class="cdsdm-flow-steps">
  <li>Controlla il contesto dati attivo: legacy personale o gruppo aziendale.</li>
  <li>Esegui sempre un backup JSON prima di import o reset.</li>
  <li>Dopo l’import verifica anagrafiche, documenti, magazzino, segnalazioni e B.I.</li>
</ol>

## Aiuto rapido 0.12.15

Gli aiuti rapidi non sono più box fissi in pagina. Ogni sezione può mostrare un piccolo pulsante <strong>?</strong> accanto al titolo. Il pannello si apre solo quando serve e rimanda a questo manuale completo.
