// js/features/accounting/bank-reconciliation-module.js
// CDSDM 0.3.5 - UI riconciliazione pagamenti

(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.bankReconciliation = window.AppModules.bankReconciliation || {};

  let _bound = false;
  let currentRows = [];

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function money(v) { const n = Number(v || 0); return Number.isFinite(n) ? n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'; }
  function getDataSafe(key) { if (typeof getData === 'function') return getData(key) || []; if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || []; return (window.globalData && window.globalData[key]) || []; }
  function dataBundle() { return { customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers'), invoices: getDataSafe('invoices'), purchases: getDataSafe('purchases'), paymentEvents: getDataSafe('paymentEvents'), bankReconciliationEvents: getDataSafe('bankReconciliationEvents') }; }

  function renderSummary() {
    const s = window.BankReconciliationService.summarize(currentRows);
    $('#bank-reco-summary').html([
      card('Movimenti importati', s.count, 'fa-building-columns', true),
      card('Entrate banca', s.incoming, 'fa-arrow-trend-up'),
      card('Uscite banca', s.outgoing, 'fa-arrow-trend-down'),
      card('Proposte / già riconc.', s.suggested + ' / ' + s.reconciled, 'fa-link', true)
    ].join(''));
  }
  function card(label, value, icon, raw) {
    return '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="d-flex justify-content-between"><span class="text-muted small">' + esc(label) + '</span><i class="fas ' + icon + ' text-muted"></i></div><div class="fs-5 fw-bold">' + (raw ? esc(value) : '€ ' + money(value)) + '</div></div></div></div>';
  }

  function renderTable() {
    renderSummary();
    if (!currentRows.length) {
      $('#bank-reco-table-body').html('<tr><td colspan="9" class="text-center text-muted py-4">Carica o incolla un CSV bancario per generare le proposte di riconciliazione.</td></tr>');
      return;
    }
    $('#bank-reco-table-body').html(currentRows.map(function (r, idx) {
      const status = r.reconciled ? '<span class="badge bg-success">già riconciliato</span>' : (r.suggested ? '<span class="badge bg-info text-dark">proposta</span>' : '<span class="badge bg-warning text-dark">da verificare</span>');
      const opts = ['<option value="">Nessun abbinamento</option>'].concat((r.candidates || []).map(function (c, i) {
        const label = (c.subjectType === 'supplier' ? 'Forn.' : 'Cli.') + ' ' + c.subjectName + ' · ' + (c.documentType === 'purchase' ? 'Acq.' : 'Fatt.') + ' #' + c.number + ' · residuo € ' + money(c.residual) + ' · score ' + c.score;
        return '<option value="' + i + '" ' + (i === 0 ? 'selected' : '') + '>' + esc(label) + '</option>';
      }));
      return '<tr data-row-index="' + idx + '">' +
        '<td>' + esc(r.date) + '<br><small class="text-muted">' + esc(r.valueDate || '') + '</small></td>' +
        '<td>' + (r.direction === 'out' ? '<span class="badge bg-danger-subtle text-danger-emphasis">Uscita</span>' : '<span class="badge bg-success-subtle text-success-emphasis">Entrata</span>') + '</td>' +
        '<td class="text-end fw-semibold">€ ' + money(r.amount) + '</td>' +
        '<td>' + esc(r.account) + '</td>' +
        '<td>' + esc(r.reference || '-') + '</td>' +
        '<td class="small">' + esc(r.description) + '</td>' +
        '<td><select class="form-select form-select-sm bank-reco-match-select" ' + (r.reconciled ? 'disabled' : '') + '>' + opts.join('') + '</select></td>' +
        '<td>' + status + '</td>' +
        '<td class="text-end"><button class="btn btn-sm btn-primary bank-reco-confirm-btn" type="button" ' + (r.reconciled || !(r.candidates || []).length ? 'disabled' : '') + '>Conferma</button></td>' +
        '</tr>';
    }).join(''));
  }

  function parseText() {
    if (!window.BankReconciliationService) return;
    const text = $('#bank-reco-csv-text').val() || '';
    currentRows = window.BankReconciliationService.suggestMatches(window.BankReconciliationService.parseCsv(text), dataBundle());
    renderTable();
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) { $('#bank-reco-csv-text').val(String(e.target.result || '')); parseText(); };
    reader.readAsText(file, 'UTF-8');
  }

  async function confirmRow(btn) {
    if (window.PermissionsPolicy && !window.PermissionsPolicy.canWrite('accounting')) { alert(window.PermissionsPolicy.getDeniedMessage('riconciliazione-banca')); return; }
    const $tr = $(btn).closest('tr');
    const idx = Number($tr.data('row-index'));
    const row = currentRows[idx];
    if (!row || row.reconciled) return;
    const cidx = Number($tr.find('.bank-reco-match-select').val());
    const candidate = row.candidates && row.candidates[cidx];
    if (!candidate) { alert('Seleziona un abbinamento valido.'); return; }
    try {
      const ev = window.BankReconciliationService.buildPaymentEventFromMatch(row, candidate, {});
      const plan = window.PaymentEventsService.buildSavePlan(ev, dataBundle());
      await saveDataToCloud('paymentEvents', plan.event, plan.event.id);
      for (const upd of plan.docUpdates) await saveDataToCloud(upd.collection, upd.data, upd.id);
      const reco = window.BankReconciliationService.buildReconciliationEvent(row, candidate, plan.event);
      await saveDataToCloud('bankReconciliationEvents', reco, reco.id);
      row.reconciled = true;
      renderTable();
      try { if (window.AppModules.paymentEvents && window.AppModules.paymentEvents.render) window.AppModules.paymentEvents.render(); } catch (e1) {}
      try { if (window.AppModules.cashbook && window.AppModules.cashbook.render) window.AppModules.cashbook.render(); } catch (e2) {}
      try { if (window.AppModules.ledger && window.AppModules.ledger.render) window.AppModules.ledger.render(); } catch (e3) {}
    } catch (e) { alert(e.message || e); }
  }

  function loadTemplate() {
    $('#bank-reco-csv-text').val('data;dataValuta;importo;conto;riferimento;descrizione\n2026-05-01;2026-05-01;1220,00;Banca;TRN-001;Bonifico cliente Rossi fattura 12\n2026-05-02;2026-05-02;-610,00;Banca;TRN-002;Pagamento fornitore Bianchi acquisto 7\n');
    parseText();
  }

  function exportCsv() {
    if (!currentRows.length) { alert('Nessun dato da esportare.'); return; }
    const header = ['Data','Data valuta','Direzione','Importo','Conto','Riferimento','Descrizione','Stato','Proposta'];
    const lines = [header].concat(currentRows.map(function (r) { const s = r.suggested; return [r.date, r.valueDate, r.direction, r.amount, r.account, r.reference, r.description, r.reconciled ? 'riconciliato' : (s ? 'proposto' : 'non abbinato'), s ? (s.subjectName + ' ' + s.documentType + ' ' + s.number) : '']; })).map(function (row) { return row.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'riconciliazione_banca_035.csv'; a.click(); URL.revokeObjectURL(url);
  }

  function render() { currentRows = window.BankReconciliationService ? window.BankReconciliationService.suggestMatches(currentRows, dataBundle()) : currentRows; renderTable(); }

  function bind() {
    if (_bound) return; _bound = true;
    $('#riconciliazione-banca').on('change', '#bank-reco-file', function () { if (this.files && this.files[0]) readFile(this.files[0]); });
    $('#riconciliazione-banca').on('click', '#bank-reco-parse-btn', parseText);
    $('#riconciliazione-banca').on('click', '#bank-reco-template-btn', loadTemplate);
    $('#riconciliazione-banca').on('click', '#bank-reco-export-btn', exportCsv);
    $('#riconciliazione-banca').on('click', '.bank-reco-confirm-btn', function () { confirmRow(this); });
  }

  window.AppModules.bankReconciliation.bind = bind;
  window.AppModules.bankReconciliation.render = render;
})();
