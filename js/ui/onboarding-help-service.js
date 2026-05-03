// CDSDM 0.12.15 - Aiuti rapidi contestuali non invasivi e guida visuale.
(function(){
  const VERSION = '0.12.15';
  const DEFAULT = {
    title: 'Aiuto rapido CDSDM 0.12.15',
    text: 'Apri questa guida quando ti serve un promemoria sul flusso operativo della pagina corrente.',
    steps: ['Verifica il contesto dati attivo.', 'Controlla eventuali campi obbligatori.', 'Salva, approva o invia solo quando i dati sono coerenti.'],
    note: 'Gli aiuti rapidi sono contestuali: il manuale completo resta disponibile da Info → Manuale Utente.'
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
      example: 'Preventivo approvato → ordine cliente → DDT cliente → fattura.'
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
      example: 'Ordine OF-001 approvato → DDT fornitore → 8 pezzi accettati + 2 in quarantena → segnalazione ad Acquisti.'
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
      example: 'Due ordini cliente confermati possono essere accorpati in un DDT e poi fatturati.'
    },
    'workflow-approvativi': {
      title: 'Workflow approvativi',
      text: 'Rende operativi i documenti in bozza quando l’esercitazione richiede controllo interno o approvazione.',
      steps: ['Filtra il tipo documento.', 'Apri o verifica il documento.', 'Approva, respingi o riporta in revisione.', 'Dopo approvazione il documento diventa lavorabile nei flussi collegati.'],
      note: 'Gli ordini fornitore approvati diventano confermati e selezionabili nei DDT fornitore.'
    },
    'operational-reports': {
      title: 'Segnalazioni operative',
      text: 'Registra anomalie, richieste di verifica e comunicazioni interne tra reparti. Non sostituisce ordini, DDT o fatture: documenta problemi e decisioni operative.',
      steps: ['Crea una bozza o apri una segnalazione.', 'Usa Invia segnalazione per renderla effettiva.', 'Invia comunicazioni interne al reparto destinatario.', 'Aggiorna lo stato: presa in carico, lavorazione, risolta, chiusa.'],
      example: 'Merce ricevuta in quarantena → segnalazione da Magazzino ad Acquisti → verifica fornitore → risoluzione/chiusura.'
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
    avanzate: {
      title: 'Gestione dati',
      text: 'Area per backup, import e reset controllato dei dati del contesto attivo.',
      steps: ['Verifica il gruppo selezionato.', 'Esegui backup.', 'Importa o resetta solo quando necessario.', 'Controlla test e riepiloghi dopo l’operazione.'],
      note: 'Backup/import/reset seguono le collezioni ufficiali centralizzate.'
    },
    'audit-sicurezza': {
      title: 'Audit sicurezza',
      text: 'Controlla membri, inviti, profili, override e permessi effettivi prima di una simulazione multiutente.',
      steps: ['Verifica membri del gruppo.', 'Controlla profili permesso.', 'Esamina override utente.', 'Esegui QA accessi.']
    }
  };

  function normalizeTarget(sectionId){ return String(sectionId || '').replace(/^section-/, ''); }
  function getHelp(sectionId){ return HELP[normalizeTarget(sectionId)] || DEFAULT; }
  function messageFor(sectionId){ return (getHelp(sectionId).text || DEFAULT.text); }
  function escapeHtml(v){
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]; });
  }
  function list(items){
    if(!Array.isArray(items) || !items.length) return '';
    return '<ol class="cdsdm-help-steps mb-2">' + items.map(function(s){ return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>';
  }
  function renderHelp(h){
    return '<div class="cdsdm-help-card-inner">'
      + '<div class="d-flex align-items-start gap-2 mb-2"><span class="cdsdm-help-icon" aria-hidden="true">?</span><div><strong>' + escapeHtml(h.title || DEFAULT.title) + '</strong><div class="small">' + escapeHtml(h.text || DEFAULT.text) + '</div></div></div>'
      + (h.steps ? '<div class="cdsdm-help-label">Passi consigliati</div>' + list(h.steps) : '')
      + (h.example ? '<div class="cdsdm-help-example"><strong>Esempio:</strong> ' + escapeHtml(h.example) + '</div>' : '')
      + (h.note ? '<div class="cdsdm-help-note"><strong>Da ricordare:</strong> ' + escapeHtml(h.note) + '</div>' : '')
      + '<div class="mt-2"><a href="#" class="small cdsdm-help-open-manual">Apri Manuale utente completo</a></div>'
      + '</div>';
  }
  function ensureTitleWrapper(title){
    if(!title) return null;
    if(title.parentElement && title.parentElement.classList.contains('cdsdm-page-title-row')) return title.parentElement;
    const row = document.createElement('div');
    row.className = 'cdsdm-page-title-row';
    title.parentNode.insertBefore(row, title);
    row.appendChild(title);
    return row;
  }
  function enhanceSection(section){
    if(!section || section.id === 'manuale' || section.id === 'versione') return false;
    section.querySelectorAll('.cdsdm-help-callout').forEach(function(old){ old.remove(); });
    if(section.querySelector('.cdsdm-context-help-panel')) return false;
    const title = section.querySelector('h1,h2,h3');
    if(!title) return false;
    const h = getHelp(section.id || '');
    const row = ensureTitleWrapper(title);
    if(!row) return false;
    const btn = document.createElement('button');
    const panelId = 'cdsdm-help-panel-' + normalizeTarget(section.id || 'page');
    btn.className = 'btn btn-sm btn-outline-info cdsdm-title-help-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Apri aiuto rapido: ' + (h.title || DEFAULT.title));
    btn.setAttribute('title', 'Aiuto rapido');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('data-cdsdm-help-panel', panelId);
    btn.innerHTML = '<i class="fas fa-question" aria-hidden="true"></i>';
    row.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'cdsdm-context-help-panel d-none';
    panel.setAttribute('role', 'note');
    panel.innerHTML = renderHelp(h);
    row.parentNode.insertBefore(panel, row.nextSibling);
    return true;
  }
  function refresh(){
    document.querySelectorAll('.content-section').forEach(enhanceSection);
  }
  function decorateVisibleSection(){
    refresh();
    document.querySelectorAll('.content-section:not(.d-none)').forEach(enhanceSection);
  }
  function togglePanel(btn){
    const panel = document.getElementById(btn.getAttribute('data-cdsdm-help-panel'));
    if(!panel) return;
    const willOpen = panel.classList.contains('d-none');
    document.querySelectorAll('.cdsdm-context-help-panel').forEach(function(p){ p.classList.add('d-none'); });
    document.querySelectorAll('.cdsdm-title-help-btn').forEach(function(b){ b.setAttribute('aria-expanded','false'); });
    if(willOpen){ panel.classList.remove('d-none'); btn.setAttribute('aria-expanded','true'); }
  }
  function openManual(){
    const link = document.querySelector('.sidebar .nav-link[data-target="manuale"]');
    if(link) link.click();
  }
  function init(){ refresh(); }

  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('.cdsdm-title-help-btn');
    if(btn){ e.preventDefault(); togglePanel(btn); return; }
    const manual = e.target.closest && e.target.closest('.cdsdm-help-open-manual');
    if(manual){ e.preventDefault(); openManual(); }
  });

  window.OnboardingHelpService = { VERSION, HELP, DEFAULT, getHelp, messageFor, renderHelp, enhanceSection, refresh, decorateVisibleSection, init };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
