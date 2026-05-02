// js/features/accounting/account-statement-module.js
// CDSDM 0.3.3 - UI Estratto conto cliente/fornitore

(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.accountStatement = window.AppModules.accountStatement || {};

  let _bound = false;
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function money(v) { const n = Number(v || 0); return Number.isFinite(n) ? n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'; }
  function getDataSafe(key) {
    if (typeof getData === 'function') return getData(key) || [];
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }
  function isPlaceholderOnly($select) {
    const opts = $select.find('option');
    return opts.length <= 1 || (opts.length === 1 && String(opts.first().val() || '') === '');
  }
  function filters() {
    return {
      subjectType: String($('#statement-subject-type').val() || 'customer'),
      subjectId: String($('#statement-subject-filter').val() || 'all'),
      from: String($('#statement-date-from').val() || ''),
      to: String($('#statement-date-to').val() || ''),
      text: String($('#statement-search').val() || '').toLowerCase()
    };
  }
  function refreshSubjects() {
    const type = String($('#statement-subject-type').val() || 'customer');
    const options = window.AccountStatementService && window.AccountStatementService.buildSubjectOptions
      ? window.AccountStatementService.buildSubjectOptions(type, { customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers') })
      : [];
    const current = String($('#statement-subject-filter').val() || 'all');
    const label = type === 'supplier' ? 'Tutti i fornitori' : 'Tutti i clienti';
    $('#statement-subject-filter').html('<option value="all">' + label + '</option>' + options.map(function (o) {
      return '<option value="' + esc(o.id) + '">' + esc(o.label) + '</option>';
    }).join(''));
    if (current && $('#statement-subject-filter option').filter(function () { return String(this.value) === current; }).length) $('#statement-subject-filter').val(current);
  }
  function render() {
    if (!window.AccountStatementService || typeof window.AccountStatementService.buildStatement !== 'function') {
      $('#statement-summary').html('<div class="alert alert-danger">Servizio estratto conto non disponibile.</div>');
      return;
    }
    if (isPlaceholderOnly($('#statement-subject-filter'))) refreshSubjects();
    const f = filters();
    const result = window.AccountStatementService.buildStatement({
      customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers'), invoices: getDataSafe('invoices'), purchases: getDataSafe('purchases'), paymentEvents: getDataSafe('paymentEvents')
    }, f);
    const entries = result.entries || [];
    const s = result.summary || {};
    window._lastAccountStatement = result;
    const saldoLabel = f.subjectType === 'supplier' ? 'Saldo finale debito fornitore' : 'Saldo finale credito cliente';
    $('#statement-summary').html([
      '<div class="col-md-2"><div class="card h-100"><div class="card-body"><div class="small text-muted">Saldo iniziale</div><div class="fs-6 fw-bold">€ ' + money(s.openingBalance) + '</div></div></div></div>',
      '<div class="col-md-2"><div class="card h-100"><div class="card-body"><div class="small text-muted">Movimenti</div><div class="fs-6 fw-bold">' + (s.count || 0) + '</div></div></div></div>',
      '<div class="col-md-2"><div class="card h-100"><div class="card-body"><div class="small text-muted">Dare periodo</div><div class="fs-6 fw-bold">€ ' + money(s.debit) + '</div></div></div></div>',
      '<div class="col-md-2"><div class="card h-100"><div class="card-body"><div class="small text-muted">Avere periodo</div><div class="fs-6 fw-bold">€ ' + money(s.credit) + '</div></div></div></div>',
      '<div class="col-md-2"><div class="card h-100"><div class="card-body"><div class="small text-muted">Saldo periodo</div><div class="fs-6 fw-bold">€ ' + money(s.periodBalance) + '</div></div></div></div>',
      '<div class="col-md-2"><div class="card h-100"><div class="card-body"><div class="small text-muted">' + saldoLabel + '</div><div class="fs-6 fw-bold ' + (Number(s.closingBalance) >= 0 ? 'text-primary' : 'text-danger') + '">€ ' + money(s.closingBalance) + '</div></div></div></div>'
    ].join(''));
    $('#statement-period-label').text((f.from || 'inizio') + ' → ' + (f.to || 'oggi'));
    if (!entries.length) {
      $('#statement-table-body').html('<tr><td colspan="9" class="text-center text-muted py-4">Nessun movimento per i filtri selezionati.</td></tr>');
      return;
    }
    $('#statement-table-body').html(entries.map(function (e) {
      const cls = Number(e.statementRunningBalance) >= 0 ? 'text-primary' : 'text-danger';
      return '<tr>' +
        '<td>' + esc(e.date || '') + '</td>' +
        '<td>' + esc(e.subjectName || '') + '</td>' +
        '<td><span class="badge bg-light text-dark border">' + esc(e.type || '') + '</span></td>' +
        '<td>' + esc(e.documentNumber || '') + '</td>' +
        '<td>' + esc(e.description || '') + '</td>' +
        '<td class="text-end">' + money(e.debit) + '</td>' +
        '<td class="text-end">' + money(e.credit) + '</td>' +
        '<td class="text-end">' + money(e.statementSignedAmount) + '</td>' +
        '<td class="text-end fw-semibold ' + cls + '">' + money(e.statementRunningBalance) + '</td>' +
        '</tr>';
    }).join(''));
  }
  function exportCsv() {
    const result = window._lastAccountStatement || { entries: [], summary: {} };
    const rows = result.entries || [];
    if (!rows.length) { alert('Nessun movimento da esportare.'); return; }
    function clean(v) { return String(v == null ? '' : v).replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim(); }
    function csv(v) { const s = clean(v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
    const s = result.summary || {};
    const lines = [
      ['Estratto conto', $('#statement-subject-type').val() || '', $('#statement-subject-filter option:selected').text() || '', 'Periodo', (s.from || ''), (s.to || '')].map(csv).join(';'),
      ['Saldo iniziale', money(s.openingBalance), 'Dare', money(s.debit), 'Avere', money(s.credit), 'Saldo finale', money(s.closingBalance)].map(csv).join(';'),
      ['Data','Soggetto','Tipo','Documento','Descrizione','Dare','Avere','Segno','Saldo progressivo'].join(';')
    ];
    rows.forEach(function (e) { lines.push([e.date, e.subjectName, e.type, e.documentNumber, e.description, money(e.debit), money(e.credit), money(e.statementSignedAmount), money(e.statementRunningBalance)].map(csv).join(';')); });
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.download = 'estratto-conto_' + ($('#statement-subject-type').val() || 'soggetti') + '.csv';
    a.href = URL.createObjectURL(blob); a.click(); URL.revokeObjectURL(a.href);
  }
  function printStatement() {
    const result = window._lastAccountStatement || { entries: [], summary: {} };
    const rows = result.entries || [];
    const s = result.summary || {};
    const title = 'Estratto conto - ' + ($('#statement-subject-filter option:selected').text() || 'Tutti');
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>body{font-family:Arial,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px}th{background:#eee}.right{text-align:right}</style></head><body>' +
      '<h1>' + esc(title) + '</h1><p>Periodo: ' + esc(s.from || 'inizio') + ' - ' + esc(s.to || 'oggi') + '</p>' +
      '<p>Saldo iniziale: € ' + money(s.openingBalance) + ' | Dare: € ' + money(s.debit) + ' | Avere: € ' + money(s.credit) + ' | Saldo finale: € ' + money(s.closingBalance) + '</p>' +
      '<table><thead><tr><th>Data</th><th>Soggetto</th><th>Tipo</th><th>Documento</th><th>Descrizione</th><th>Dare</th><th>Avere</th><th>Saldo</th></tr></thead><tbody>' +
      rows.map(function (e) { return '<tr><td>' + esc(e.date) + '</td><td>' + esc(e.subjectName) + '</td><td>' + esc(e.type) + '</td><td>' + esc(e.documentNumber) + '</td><td>' + esc(e.description) + '</td><td class="right">' + money(e.debit) + '</td><td class="right">' + money(e.credit) + '</td><td class="right">' + money(e.statementRunningBalance) + '</td></tr>'; }).join('') +
      '</tbody></table></body></html>';
    const w = window.open('', '_blank');
    if (!w) { alert('Popup bloccato dal browser.'); return; }
    w.document.open(); w.document.write(html); w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 250);
  }
  function bind() {
    if (_bound) return; _bound = true;
    $('#estratto-conto').on('change', '#statement-subject-type', function () { refreshSubjects(); render(); });
    $('#estratto-conto').on('change keyup', '#statement-subject-filter,#statement-date-from,#statement-date-to,#statement-search', render);
    $('#estratto-conto').on('click', '#statement-reset-btn', function () { $('#statement-date-from,#statement-date-to,#statement-search').val(''); $('#statement-subject-filter').val('all'); render(); });
    $('#estratto-conto').on('click', '#statement-export-csv-btn', exportCsv);
    $('#estratto-conto').on('click', '#statement-print-btn', printStatement);
  }
  window.AppModules.accountStatement.bind = bind;
  window.AppModules.accountStatement.render = render;
})();
