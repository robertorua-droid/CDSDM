// CDSDM 0.12.14 - Aiuti rapidi contestuali e onboarding operativo in-app.
(function(){
  const VERSION = '0.12.14';
  const DEFAULT = {
    title: 'Aiuto rapido CDSDM 0.12.14',
    text: 'Consulta la guida contestuale con il pulsante ? per completare il flusso operativo della pagina corrente.',
    steps: ['Verifica il contesto dati attivo.', 'Controlla eventuali campi obbligatori.', 'Salva o approva il documento solo quando i dati sono coerenti.'],
    note: 'Il progetto è didattico: i calcoli gestionali e fiscali sono semplificati.'
  };

  const HELP = {
    home: {
      title: 'Home e contesto aziendale',
      text: 'Controlla gruppo aziendale attivo, ruolo corrente e accesso ai dati condivisi prima di iniziare una simulazione.',
      steps: ['Seleziona il gruppo aziendale corretto.', 'Verifica il ruolo mostrato nella sidebar.', 'Usa il gruppo condiviso per esercitazioni multiutente.'],
      note: 'Dati personali legacy e gruppi aziendali sono archivi separati.'
    },
    preventivi: {
      title: 'Preventivi cliente',
      text: 'Crea preventivi, falli approvare tramite Workflow approvativi e trasformali in ordini cliente solo quando sono approvati o accettati.',
      steps: ['Compila cliente e righe.', 'Salva il preventivo.', 'Vai in Analisi → Workflow approvativi e approva.', 'Riapri il preventivo e usa Crea ordine cliente.'],
      example: 'Esempio: preventivo approvato → ordine cliente → DDT cliente → fattura.'
    },
    'ordini-cliente': {
      title: 'Ordini cliente',
      text: 'Gli ordini in bozza diventano operativi tramite approvazione/conferma e poi possono alimentare i DDT cliente.',
      steps: ['Crea ordine cliente.', 'Approva dal Workflow se resta in bozza.', 'Usa l’ordine confermato nel DDT cliente.', 'Verifica eventuali quantità non evase.'],
      note: 'Bozza non significa documento lavorabile.'
    },
    'ordini-fornitore': {
      title: 'Ordini fornitore',
      text: 'L’ordine fornitore è il punto di partenza del ciclo acquisti. Solo gli ordini confermati/lavorabili sono selezionabili nel DDT fornitore.',
      steps: ['Crea ordine fornitore.', 'Approva dal Workflow se è in bozza.', 'Alla ricezione merce crea DDT fornitore.', 'Seleziona fornitore e ordine confermato.', 'Registra quantità ricevute, accettate o in quarantena.'],
      example: 'Esempio: ordine OF-001 approvato → DDT fornitore → 8 pezzi accettati + 2 in quarantena → segnalazione ad Acquisti.'
    },
    'ddt-fornitore': {
      title: 'DDT fornitore e ricezione merce',
      text: 'Usa questa pagina per registrare merce ricevuta da ordini fornitore confermati e gestire eventuali quarantene.',
      steps: ['Seleziona fornitore.', 'Collega un ordine lavorabile.', 'Importa o compila righe ricevute.', 'Indica quantità accettate e quarantena.', 'Crea una segnalazione operativa se serve una verifica interna.'],
      note: 'Le bozze o gli ordini annullati/non approvati non dovrebbero essere proposti.'
    },
    'ddt-cliente': {
      title: 'DDT cliente',
      text: 'Crea DDT cliente da ordini cliente confermati e usali poi per fatturazione riepilogativa.',
      steps: ['Seleziona cliente.', 'Collega ordini confermati.', 'Verifica quantità evase.', 'Salva DDT.', 'Usa Fatturazione DDT cliente per emettere fattura.'],
      example: 'Esempio: due ordini cliente confermati possono essere accorpati in un DDT e poi fatturati.'
    },
    'workflow-approvativi': {
      title: 'Workflow approvativi',
      text: 'Rende operativi i documenti in bozza quando l’esercitazione richiede controllo interno o approvazione.',
      steps: ['Filtra il tipo documento.', 'Apri o verifica il documento.', 'Approva, respingi o riporta in revisione.', 'Dopo approvazione il documento diventa lavorabile nei flussi collegati.'],
      note: 'Esempio: ordini fornitore approvati diventano confermati e selezionabili nei DDT fornitore.'
    },
    'operational-reports': {
      title: 'Segnalazioni operative',
      text: 'Registra anomalie, richieste di verifica e comunicazioni interne tra reparti. Non sostituisce ordini, DDT o fatture: documenta problemi e decisioni operative.',
      steps: ['Crea una bozza o apri una segnalazione.', 'Usa Invia segnalazione per renderla effettiva.', 'Invia comunicazioni interne al reparto destinatario.', 'Aggiorna lo stato: presa in carico, lavorazione, risolta, chiusa.'],
      example: 'Esempio: merce ricevuta in quarantena → segnalazione da Magazzino ad Acquisti → verifica fornitore → risoluzione/chiusura.'
    },
    'mini-bi': {
      title: 'Mini B.I. didattica',
      text: 'Legge i dati già presenti e mostra KPI, alert, drill-down ed export. È utile per analisi didattica, non per certificazioni contabili o fiscali.',
      steps: ['Scegli area operativa.', 'Apri un KPI per vedere il dettaglio.', 'Filtra o esporta CSV se serve.', 'Usa gli alert per generare eventuali segnalazioni operative.'],
      note: 'Gli indicatori rispettano i permessi B.I. e le aree visibili del profilo corrente.'
    },
    'magazzino-quarantena': {
      title: 'Quarantena magazzino',
      text: 'Isola merce non disponibile o da verificare, per esempio danneggiata, non conforme o in attesa di decisione.',
      steps: ['Consulta gli elementi in quarantena.', 'Verifica prodotto, lotto e documento origine.', 'Decidi sblocco, reso, scarto o verifica.', 'Crea segnalazione operativa se deve intervenire un reparto.'],
      note: 'La quarantena è un dato operativo; la segnalazione è la comunicazione interna collegata.'
    },
    scadenziario: {
      title: 'Scadenziario',
      text: 'Mostra crediti e debiti operativi ricavati dai documenti e dai pagamenti registrati.',
      steps: ['Filtra per clienti o fornitori.', 'Controlla aperti e scaduti.', 'Registra incassi/pagamenti.', 'Usa solleciti o segnalazioni se serve una verifica.'],
      note: 'È una vista gestionale didattica, non uno scadenzario fiscale certificativo.'
    },
    'gestione-dati': {
      title: 'Backup, import e reset',
      text: 'Esegui sempre un backup prima di import, reset o passaggio di classe.',
      steps: ['Esporta backup JSON.', 'Controlla contesto dati attivo.', 'Importa solo file coerenti.', 'Dopo import verifica dashboard, documenti e segnalazioni.'],
      note: 'Backup/import/reset seguono le collezioni ufficiali centralizzate.'
    },
    avanzate: {
      title: 'Gestione dati',
      text: 'Area per backup, import e reset controllato dei dati del contesto attivo.',
      steps: ['Verifica il gruppo selezionato.', 'Esegui backup.', 'Importa o resetta solo quando necessario.', 'Controlla test e riepiloghi dopo l’operazione.']
    },
    'audit-sicurezza': {
      title: 'Audit sicurezza',
      text: 'Controlla membri, inviti, profili, override e permessi effettivi prima di una simulazione multiutente.',
      steps: ['Verifica membri del gruppo.', 'Controlla profili permesso.', 'Esamina override utente.', 'Esegui QA accessi.']
    }
  };

  function normalizeTarget(sectionId){ return String(sectionId || '').replace(/^section-/, ''); }
  function getHelp(sectionId){ return HELP[normalizeTarget(sectionId)] || DEFAULT; }
  function messageFor(sectionId){
    const h = getHelp(sectionId);
    return h.text || DEFAULT.text;
  }
  function list(items){
    if(!Array.isArray(items) || !items.length) return '';
    return '<ol class="cdsdm-help-steps mb-2">' + items.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>';
  }
  function escapeHtml(v){
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]; });
  }
  function renderHelp(h){
    return '<div class="cdsdm-help-card-inner">'
      + '<div class="d-flex align-items-start gap-2 mb-2"><span class="cdsdm-help-icon" aria-hidden="true">?</span><div><strong>' + escapeHtml(h.title || DEFAULT.title) + '</strong><div class="small">' + escapeHtml(h.text || DEFAULT.text) + '</div></div></div>'
      + (h.steps ? '<div class="cdsdm-help-label">Passi consigliati</div>' + list(h.steps) : '')
      + (h.example ? '<div class="cdsdm-help-example"><strong>Esempio:</strong> ' + escapeHtml(h.example) + '</div>' : '')
      + (h.note ? '<div class="cdsdm-help-note"><strong>Da ricordare:</strong> ' + escapeHtml(h.note) + '</div>' : '')
      + '</div>';
  }
  function enhanceSection(section){
    if(!section || section.querySelector('.cdsdm-help-callout')) return false;
    const h = getHelp(section.id || '');
    const box = document.createElement('div');
    box.className = 'cdsdm-help-callout alert alert-info small';
    box.setAttribute('role','note');
    box.innerHTML = renderHelp(h);
    const title = section.querySelector('h1,h2,h3');
    if(title && title.parentNode) title.parentNode.insertBefore(box, title.nextSibling);
    else section.insertBefore(box, section.firstChild);
    return true;
  }
  function refresh(){ document.querySelectorAll('.content-section').forEach(enhanceSection); }
  function init(){ refresh(); }

  window.OnboardingHelpService = { VERSION, HELP, DEFAULT, getHelp, messageFor, enhanceSection, refresh, init };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
