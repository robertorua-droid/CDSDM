// js/features/accounting/print-center-module.js
// CDSDM 0.4.1 - UI Centro stampe / PDF HTML

(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.printCenter = window.AppModules.printCenter || {};

  let _bound = false;
  let _lastHtml = '';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function getData(key) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    if (typeof window.getData === 'function') return window.getData(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function labelOf(x, fallback) { return String((x && (x.name || x.ragioneSociale || x.denominazione || x.displayName || x.number || x.numero || x.invoiceNumber || x.id)) || fallback || '').trim(); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function isPlaceholderOnly($select) {
    const opts = $select.find('option');
    return opts.length <= 1 || (opts.length === 1 && String(opts.first().val() || '') === '');
  }
  function populateSubjects() {
    const type = String($('#print-subject-type').val() || 'customer');
    const list = type === 'supplier' ? arr(getData('suppliers')) : arr(getData('customers'));
    const current = String($('#print-subject-id').val() || 'all');
    const first = type === 'supplier' ? 'Tutti i fornitori' : 'Tutti i clienti';
    $('#print-subject-id').html('<option value="all">' + first + '</option>' + list.map(function (x) { return '<option value="' + esc(x.id || x._id || '') + '">' + esc(labelOf(x, x.id)) + '</option>'; }).join(''));
  }
  function populateDocuments() {
    const current = String($('#print-document-id').val() || '');
    const invoices = arr(getData('invoices'));
    $('#print-document-id').html('<option value="">Prima fattura disponibile</option>' + invoices.map(function (x) {
      const n = x.number || x.numero || x.invoiceNumber || x.documentNumber || x.id;
      return '<option value="' + esc(x.id || n) + '">' + esc(n + ' - ' + (x.date || x.data || '')) + '</option>';
    }).join(''));
    if (current && $('#print-document-id option').filter(function () { return String(this.value) === current; }).length) $('#print-document-id').val(current);
  }
  function updateFormVisibility() {
    const type = String($('#print-template-type').val() || 'statement');
    $('.print-filter-subject').toggleClass('d-none', !(type === 'statement' || type === 'ledger'));
    $('.print-filter-document').toggleClass('d-none', type !== 'invoice');
    $('.print-filter-period').toggleClass('d-none', type === 'invoice');
    $('#print-template-note').text(type === 'invoice'
      ? 'Stampa documento vendita con intestazione aziendale e righe riconosciute.'
      : type === 'ledger'
        ? 'Stampa partitario dare/avere usando i movimenti derivati dal LedgerService.'
        : type === 'cashbook'
          ? 'Stampa prima nota con movimenti automatici e manuali.'
          : type === 'reminders'
            ? 'Stampa scadenze e solleciti per gestione manuale.'
            : 'Stampa estratto conto con saldo iniziale, movimenti e saldo finale.');
  }
  function readOptions() {
    return {
      subjectType: String($('#print-subject-type').val() || 'customer'),
      subjectId: String($('#print-subject-id').val() || 'all'),
      documentId: String($('#print-document-id').val() || ''),
      from: String($('#print-date-from').val() || ''),
      to: String($('#print-date-to').val() || ''),
      text: String($('#print-search').val() || ''),
      generatedAt: today()
    };
  }
  function render() {
    if (!window.PrintTemplateService || typeof window.PrintTemplateService.buildHtml !== 'function') {
      $('#print-center-status').html('<div class="alert alert-danger">Servizio stampe non disponibile.</div>');
      return;
    }
    if (isPlaceholderOnly($('#print-subject-id'))) populateSubjects();
    if (isPlaceholderOnly($('#print-document-id'))) populateDocuments();
    updateFormVisibility();
    const type = String($('#print-template-type').val() || 'statement');
    _lastHtml = window.PrintTemplateService.buildHtml(type, readOptions());
    const iframe = document.getElementById('print-preview-frame');
    if (iframe) iframe.srcdoc = _lastHtml;
    $('#print-center-status').html('<div class="alert alert-info mb-0">Anteprima generata lato browser. Per creare il PDF usa <strong>Stampa / Salva come PDF</strong>.</div>');
  }
  function printCurrent() {
    if (!_lastHtml) render();
    if (window.PrintTemplateService && typeof window.PrintTemplateService.openPrintWindow === 'function') window.PrintTemplateService.openPrintWindow(_lastHtml);
  }
  function downloadCurrent() {
    if (!_lastHtml) render();
    if (window.PrintTemplateService && typeof window.PrintTemplateService.downloadHtml === 'function') window.PrintTemplateService.downloadHtml(_lastHtml, 'stampa-cdsdm-0.4.1.html');
  }
  function bind() {
    if (_bound) return; _bound = true;
    $('#centro-stampe').on('change', '#print-template-type', function () { updateFormVisibility(); render(); });
    $('#centro-stampe').on('change', '#print-subject-type', function () { populateSubjects(); render(); });
    $('#centro-stampe').on('change keyup', '#print-subject-id,#print-document-id,#print-date-from,#print-date-to,#print-search', render);
    $('#centro-stampe').on('click', '#print-preview-btn', render);
    $('#centro-stampe').on('click', '#print-open-btn', printCurrent);
    $('#centro-stampe').on('click', '#print-download-html-btn', downloadCurrent);
  }
  window.AppModules.printCenter.bind = bind;
  window.AppModules.printCenter.render = render;
})();
