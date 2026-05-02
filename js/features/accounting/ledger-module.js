// js/features/accounting/ledger-module.js
// CDSDM 0.3.0 - UI Partitario clienti e fornitori

(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.ledger = window.AppModules.ledger || {};

  let _bound = false;

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }
  function money(v) {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
  }
  function getDataSafe(key) {
    if (typeof getData === 'function') return getData(key) || [];
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }
  function isPlaceholderOnly($select) {
    const opts = $select.find('option');
    return opts.length <= 1 || (opts.length === 1 && String(opts.first().val() || '') === '');
  }
  function currentFilters() {
    return {
      subjectType: String($('#ledger-subject-type').val() || 'customer'),
      subjectId: String($('#ledger-subject-filter').val() || 'all'),
      from: String($('#ledger-date-from').val() || ''),
      to: String($('#ledger-date-to').val() || ''),
      text: String($('#ledger-search').val() || '').toLowerCase()
    };
  }
  function refreshSubjects() {
    const type = String($('#ledger-subject-type').val() || 'customer');
    const options = (window.LedgerService && typeof window.LedgerService.buildSubjectOptions === 'function')
      ? window.LedgerService.buildSubjectOptions(type, { customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers') })
      : [];
    const current = String($('#ledger-subject-filter').val() || 'all');
    const label = type === 'supplier' ? 'Tutti i fornitori' : 'Tutti i clienti';
    $('#ledger-subject-filter').html('<option value="all">' + label + '</option>' + options.map(function (o) {
      return '<option value="' + esc(o.id) + '">' + esc(o.label) + '</option>';
    }).join(''));
    if (current && $('#ledger-subject-filter option').filter(function () { return String(this.value) === current; }).length) $('#ledger-subject-filter').val(current);
  }
  function filterRows(entries, filters) {
    if (!filters.text) return entries;
    return entries.filter(function (e) {
      return String([e.subjectName, e.type, e.documentNumber, e.description].join(' ')).toLowerCase().indexOf(filters.text) >= 0;
    });
  }
  function render() {
    if (!window.LedgerService || typeof window.LedgerService.buildEntries !== 'function') {
      $('#ledger-summary').html('<div class="alert alert-danger">Servizio partitario non disponibile.</div>');
      return;
    }
    if (isPlaceholderOnly($('#ledger-subject-filter'))) refreshSubjects();
    const filters = currentFilters();
    const entries = filterRows(window.LedgerService.buildEntries({
      customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers'), invoices: getDataSafe('invoices'), purchases: getDataSafe('purchases')
    }, filters), filters);
    const summary = window.LedgerService.summarize(entries, filters.subjectType);
    window._lastLedgerEntries = entries.slice();
    window._lastLedgerSummary = summary;
    const saldoLabel = filters.subjectType === 'supplier' ? 'Debito netto verso fornitori' : 'Credito netto verso clienti';
    const saldoClass = summary.balance >= 0 ? 'text-primary' : 'text-danger';
    $('#ledger-summary').html([
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Movimenti</div><div class="fs-5 fw-bold">' + summary.count + '</div></div></div></div>',
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Dare</div><div class="fs-5 fw-bold">€ ' + money(summary.debit) + '</div></div></div></div>',
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Avere</div><div class="fs-5 fw-bold">€ ' + money(summary.credit) + '</div></div></div></div>',
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">' + saldoLabel + '</div><div class="fs-5 fw-bold ' + saldoClass + '">€ ' + money(summary.balance) + '</div></div></div></div>'
    ].join(''));

    if (!entries.length) {
      $('#ledger-table-body').html('<tr><td colspan="8" class="text-center text-muted py-4">Nessun movimento nel partitario per i filtri selezionati.</td></tr>');
    } else {
      $('#ledger-table-body').html(entries.map(function (e) {
        const signClass = e.runningBalance >= 0 ? 'text-primary' : 'text-danger';
        return '<tr>' +
          '<td>' + esc(e.date || '') + '</td>' +
          '<td>' + esc(e.subjectName || '') + '</td>' +
          '<td><span class="badge bg-light text-dark border">' + esc(e.type || '') + '</span></td>' +
          '<td>' + esc(e.documentNumber || '') + '</td>' +
          '<td>' + esc(e.description || '') + '</td>' +
          '<td class="text-end">' + money(e.debit) + '</td>' +
          '<td class="text-end">' + money(e.credit) + '</td>' +
          '<td class="text-end fw-semibold ' + signClass + '">' + money(e.runningBalance) + '</td>' +
          '</tr>';
      }).join(''));
    }

    const top = summary.subjectBalances.slice(0, 8);
    $('#ledger-subject-balances').html(top.length ? top.map(function (s) {
      const cls = s.balance >= 0 ? 'text-primary' : 'text-danger';
      return '<div class="d-flex justify-content-between border-bottom py-1"><span>' + esc(s.subjectName) + '</span><strong class="' + cls + '">€ ' + money(s.balance) + '</strong></div>';
    }).join('') : '<div class="text-muted small">Nessun saldo per soggetto.</div>');
  }
  function exportCsv() {
    const rows = window._lastLedgerEntries || [];
    if (!rows.length) { alert('Nessun movimento da esportare.'); return; }
    function clean(v) { return String(v == null ? '' : v).replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim(); }
    function csv(v) { const s = clean(v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
    const lines = [['Data','Soggetto','Tipo','Documento','Descrizione','Dare','Avere','Saldo progressivo'].join(';')];
    rows.forEach(function (e) {
      lines.push([e.date, e.subjectName, e.type, e.documentNumber, e.description, money(e.debit), money(e.credit), money(e.runningBalance)].map(csv).join(';'));
    });
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.download = 'partitario_' + ($('#ledger-subject-type').val() || 'soggetti') + '.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function bind() {
    if (_bound) return;
    _bound = true;
    $('#partitario').on('change', '#ledger-subject-type', function () { refreshSubjects(); render(); });
    $('#partitario').on('change keyup', '#ledger-subject-filter,#ledger-date-from,#ledger-date-to,#ledger-search', render);
    $('#partitario').on('click', '#ledger-reset-btn', function () { $('#ledger-date-from,#ledger-date-to,#ledger-search').val(''); $('#ledger-subject-filter').val('all'); render(); });
    $('#partitario').on('click', '#ledger-export-csv-btn', exportCsv);
  }

  window.AppModules.ledger.bind = bind;
  window.AppModules.ledger.render = render;
})();
