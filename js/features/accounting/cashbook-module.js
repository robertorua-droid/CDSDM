// js/features/accounting/cashbook-module.js
// CDSDM 0.3.2 - UI Prima nota / movimenti finanziari

(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.cashbook = window.AppModules.cashbook || {};

  let _bound = false;

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function money(v) { const n = Number(v || 0); return Number.isFinite(n) ? n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'; }
  function amountVal(raw) { const n = Number(String(raw == null ? '' : raw).replace(',', '.')); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; }
  function getDataSafe(key) { if (typeof getData === 'function') return getData(key) || []; if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || []; return (window.globalData && window.globalData[key]) || []; }

  function dataBundle() {
    return {
      customers: getDataSafe('customers'),
      suppliers: getDataSafe('suppliers'),
      invoices: getDataSafe('invoices'),
      purchases: getDataSafe('purchases'),
      paymentEvents: getDataSafe('paymentEvents'),
      cashbookMovements: getDataSafe('cashbookMovements')
    };
  }

  function renderAccountOptions() {
    if (!window.CashbookService) return;
    const accounts = window.CashbookService.getAccounts(dataBundle());
    const filterPrev = $('#cashbook-filter-account').val() || 'all';
    $('#cashbook-filter-account').html('<option value="all">Tutti</option>' + accounts.map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('')).val(accounts.indexOf(filterPrev) >= 0 ? filterPrev : 'all');
  }

  function getFilters() {
    return {
      direction: $('#cashbook-filter-direction').val() || 'all',
      account: $('#cashbook-filter-account').val() || 'all',
      from: $('#cashbook-filter-from').val() || '',
      to: $('#cashbook-filter-to').val() || '',
      search: $('#cashbook-filter-text').val() || ''
    };
  }

  function renderSummary(summary) {
    const cards = [
      { label: 'Entrate', value: summary.income, cls: 'text-success', icon: 'fa-arrow-trend-up' },
      { label: 'Uscite', value: summary.expense, cls: 'text-danger', icon: 'fa-arrow-trend-down' },
      { label: 'Saldo periodo', value: summary.balance, cls: summary.balance >= 0 ? 'text-success' : 'text-danger', icon: 'fa-scale-balanced' },
      { label: 'Movimenti', value: summary.count, raw: true, cls: 'text-primary', icon: 'fa-list' }
    ];
    $('#cashbook-summary').html(cards.map(function (c) {
      return '<div class="col-md-3"><div class="card h-100"><div class="card-body">' +
        '<div class="d-flex justify-content-between align-items-center"><span class="text-muted small">' + esc(c.label) + '</span><i class="fas ' + c.icon + ' text-muted"></i></div>' +
        '<div class="fs-5 fw-bold ' + c.cls + '">' + (c.raw ? esc(c.value) : '€ ' + money(c.value)) + '</div>' +
        '</div></div></div>';
    }).join(''));

    if (!summary.accounts.length) {
      $('#cashbook-account-balances').html('<p class="text-muted mb-0">Nessun conto movimentato nel filtro corrente.</p>');
      return;
    }
    $('#cashbook-account-balances').html(summary.accounts.map(function (a) {
      return '<div class="d-flex justify-content-between border-bottom py-1"><span>' + esc(a.account) + '<br><small class="text-muted">' + a.count + ' mov.</small></span><strong class="' + (a.balance >= 0 ? 'text-success' : 'text-danger') + '">€ ' + money(a.balance) + '</strong></div>';
    }).join(''));
  }

  function render() {
    if (!window.CashbookService) return;
    renderAccountOptions();
    const movements = window.CashbookService.buildMovements(dataBundle(), getFilters());
    const summary = window.CashbookService.summarize(movements);
    renderSummary(summary);
    $('#cashbook-table-body').html(movements.length ? movements.map(function (m) {
      const sourceBadge = m.source === 'paymentEvents' || String(m.id).indexOf('paymentEvent:') === 0
        ? '<span class="badge bg-info-subtle text-info-emphasis">da incassi/pagamenti</span>'
        : '<span class="badge bg-secondary-subtle text-secondary-emphasis">manuale</span>';
      const dirBadge = m.direction === 'in'
        ? '<span class="badge bg-success-subtle text-success-emphasis">Entrata</span>'
        : (m.direction === 'transfer' ? '<span class="badge bg-primary-subtle text-primary-emphasis">Giroconto</span>' : '<span class="badge bg-danger-subtle text-danger-emphasis">Uscita</span>');
      return '<tr>' +
        '<td>' + esc(m.date) + '</td>' +
        '<td>' + dirBadge + '</td>' +
        '<td>' + esc(m.account) + '</td>' +
        '<td>' + esc(m.category) + '</td>' +
        '<td>' + esc(m.subjectName || '') + '</td>' +
        '<td>' + esc(m.reference || '') + '</td>' +
        '<td>' + esc(m.description || '') + '<div class="small mt-1">' + sourceBadge + '</div></td>' +
        '<td class="text-end text-success">' + (m.income ? money(m.income) : '') + '</td>' +
        '<td class="text-end text-danger">' + (m.expense ? money(m.expense) : '') + '</td>' +
        '<td class="text-end fw-bold ' + (m.balance >= 0 ? 'text-success' : 'text-danger') + '">' + money(m.balance) + '</td>' +
        '</tr>';
    }).join('') : '<tr><td colspan="10" class="text-center text-muted py-4">Nessun movimento di prima nota per i filtri selezionati.</td></tr>');
  }

  function resetForm() {
    $('#cashbook-date').val(new Date().toISOString().slice(0, 10));
    $('#cashbook-value-date').val('');
    $('#cashbook-direction').val('out');
    $('#cashbook-account').val('Banca');
    $('#cashbook-category').val('Spesa generica');
    $('#cashbook-amount').val('');
    $('#cashbook-reference').val('');
    $('#cashbook-description').val('');
  }

  async function saveManualMovement() {
    if (window.PermissionsPolicy && !window.PermissionsPolicy.canWrite('accounting')) { alert(window.PermissionsPolicy.getDeniedMessage('prima-nota')); return; }
    try {
      if (!window.CashbookService) throw new Error('CashbookService non disponibile.');
      const movement = window.CashbookService.createManualMovement({
        date: $('#cashbook-date').val(),
        valueDate: $('#cashbook-value-date').val(),
        direction: $('#cashbook-direction').val(),
        account: $('#cashbook-account').val(),
        category: $('#cashbook-category').val(),
        amount: amountVal($('#cashbook-amount').val()),
        reference: $('#cashbook-reference').val(),
        description: $('#cashbook-description').val()
      });
      await saveDataToCloud('cashbookMovements', movement, movement.id);
      resetForm();
      render();
      alert('Movimento manuale registrato in prima nota.');
    } catch (e) {
      alert(e.message || e);
    }
  }

  function exportCsv() {
    if (!window.CashbookService) return;
    const rows = window.CashbookService.buildMovements(dataBundle(), getFilters());
    const header = ['Data','Data valuta','Direzione','Conto','Categoria','Soggetto','Riferimento','Descrizione','Entrate','Uscite','Saldo','Origine'];
    const lines = [header].concat(rows.map(function (m) {
      return [m.date, m.valueDate, m.direction, m.account, m.category, m.subjectName, m.reference, m.description, m.income, m.expense, m.balance, m.source];
    })).map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prima-nota.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $('#prima-nota').on('change keyup', '#cashbook-filter-direction,#cashbook-filter-account,#cashbook-filter-from,#cashbook-filter-to,#cashbook-filter-text', render);
    $('#prima-nota').on('click', '#cashbook-refresh-btn', render);
    $('#prima-nota').on('click', '#cashbook-export-csv-btn', exportCsv);
    $('#prima-nota').on('click', '#cashbook-save-btn', saveManualMovement);
    $('#prima-nota').on('click', '#cashbook-reset-form-btn', resetForm);
  }

  window.AppModules.cashbook.bind = bind;
  window.AppModules.cashbook.render = function () { resetForm(); render(); };
})();
