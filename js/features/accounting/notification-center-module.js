// js/features/accounting/notification-center-module.js
// CDSDM 0.4.1 - UI Centro notifiche operativo

(function () {
  'use strict';

  window.AppModules = window.AppModules || {};
  window.AppModules.notificationCenter = window.AppModules.notificationCenter || {};

  let _bound = false;

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }
  function money(v) { return Number(v || 0).toFixed(2).replace('.', ','); }
  function getDataSafe(key) {
    if (typeof window.getData === 'function') return window.getData(key) || [];
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }
  function bundle() {
    return {
      customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers'), products: getDataSafe('products'),
      invoices: getDataSafe('invoices'), purchases: getDataSafe('purchases'), customerDDTs: getDataSafe('customerDDTs'),
      customerOrders: getDataSafe('customerOrders'), supplierOrders: getDataSafe('supplierOrders'), warehouseLots: getDataSafe('warehouseLots'),
      warehouseMovements: getDataSafe('warehouseMovements'), bankReconciliationEvents: getDataSafe('bankReconciliationEvents'),
      paymentEvents: getDataSafe('paymentEvents'), cashbookMovements: getDataSafe('cashbookMovements'), businessBudgets: getDataSafe('businessBudgets')
    };
  }
  function currentFilters() {
    return {
      category: $('#notification-filter-category').val() || 'all',
      severity: $('#notification-filter-severity').val() || 'all',
      search: $('#notification-search').val() || ''
    };
  }
  function severityBadge(sev) {
    const map = { danger: 'danger', warning: 'warning text-dark', info: 'info text-dark', success: 'success' };
    const label = { danger: 'Critica', warning: 'Attenzione', info: 'Info', success: 'OK' }[sev] || sev;
    return '<span class="badge bg-' + (map[sev] || 'secondary') + '">' + esc(label) + '</span>';
  }
  function categoryLabel(cat) {
    return {
      scadenze: 'Scadenze', magazzino: 'Magazzino', lotti: 'Lotti', documenti: 'Documenti', ordini: 'Ordini',
      riconciliazione: 'Riconciliazione', qa: 'QA', operativo: 'Operativo'
    }[cat] || cat;
  }
  function card(label, value, hint, tone) {
    return '<div class="col-md-3"><div class="card h-100 border-' + esc(tone || 'light') + '"><div class="card-body py-3"><div class="text-muted small">' + esc(label) + '</div><div class="fs-4 fw-semibold">' + esc(value) + '</div><div class="small text-muted">' + esc(hint || '') + '</div></div></div></div>';
  }
  function renderSummary(summary) {
    $('#notification-summary').html([
      card('Totale notifiche', summary.total, 'filtri correnti', 'primary'),
      card('Critiche', summary.danger || 0, 'intervento prioritario', 'danger'),
      card('Attenzioni', summary.warning || 0, 'da verificare', 'warning'),
      card('Informative', summary.info || 0, 'monitoraggio', 'info')
    ].join(''));
  }
  function renderTable(items) {
    if (!items.length) {
      $('#notification-table-body').html('<tr><td colspan="7" class="text-center text-muted py-4">Nessuna notifica per i filtri selezionati.</td></tr>');
      return;
    }
    $('#notification-table-body').html(items.map(function (n) {
      return '<tr>' +
        '<td>' + severityBadge(n.severity) + '</td>' +
        '<td><span class="badge bg-light text-dark border">' + esc(categoryLabel(n.category)) + '</span></td>' +
        '<td><div class="fw-semibold">' + esc(n.title) + '</div><div class="small text-muted">' + esc(n.message) + '</div></td>' +
        '<td>' + esc(n.date || '') + '</td>' +
        '<td class="text-end">' + (Number(n.amount || 0) ? '€ ' + money(n.amount) : '') + '</td>' +
        '<td>' + esc(n.action || '') + '</td>' +
        '<td>' + (n.target ? '<button class="btn btn-sm btn-outline-primary notification-open-target" data-target="' + esc(n.target) + '">' + esc(n.targetLabel || 'Apri') + '</button>' : '') + '</td>' +
        '</tr>';
    }).join(''));
  }
  function renderCategoryPills(summary) {
    const cats = Object.keys(summary.byCategory || {}).sort();
    $('#notification-category-pills').html(cats.length ? cats.map(function (c) {
      return '<span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis border me-1 mb-1">' + esc(categoryLabel(c)) + ': ' + esc(summary.byCategory[c]) + '</span>';
    }).join('') : '<span class="text-muted small">Nessuna categoria attiva.</span>');
  }
  function render() {
    if (!window.NotificationCenterService) {
      $('#notification-summary').html('<div class="alert alert-danger">Servizio notifiche non disponibile.</div>');
      return;
    }
    const options = {
      dueHorizonDays: Number($('#notification-due-horizon').val() || 15),
      expiryHorizonDays: Number($('#notification-expiry-horizon').val() || 30),
      includeQa: $('#notification-include-qa').is(':checked'),
      filters: currentFilters()
    };
    const result = window.NotificationCenterService.buildNotifications(bundle(), options);
    window._lastNotificationCenterResult = result;
    renderSummary(result.summary);
    renderCategoryPills(result.summary);
    renderTable(result.items);
    $('#notification-status').html('<div class="alert alert-light border small mb-0">Centro notifiche 0.4.1: vista derivata, nessuna correzione automatica e nessuna persistenza aggiuntiva.</div>');
  }
  function openTarget(target) {
    if (!target) return;
    const link = $('.nav-link[data-target="' + target + '"]').first();
    if (link.length) link.trigger('click');
  }
  function csvCell(v) {
    const s = String(v == null ? '' : v).replace(/\r\n|\r|\n/g, ' ').trim();
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function exportCsv() {
    const result = window._lastNotificationCenterResult;
    if (!result) return;
    const lines = [['Severita', 'Categoria', 'Titolo', 'Messaggio', 'Data', 'Importo', 'Azione', 'Destinazione'].join(';')];
    result.items.forEach(function (n) {
      lines.push([n.severity, categoryLabel(n.category), n.title, n.message, n.date, money(n.amount), n.action, n.targetLabel].map(csvCell).join(';'));
    });
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.download = 'centro_notifiche_041.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function bind() {
    if (_bound) return;
    _bound = true;
    $('#centro-notifiche').on('click', '#notification-refresh-btn', render);
    $('#centro-notifiche').on('change input', '#notification-filter-category,#notification-filter-severity,#notification-search,#notification-due-horizon,#notification-expiry-horizon,#notification-include-qa', render);
    $('#centro-notifiche').on('click', '#notification-export-csv-btn', exportCsv);
    $('#centro-notifiche').on('click', '.notification-open-target', function () { openTarget($(this).data('target')); });
  }

  window.AppModules.notificationCenter.bind = bind;
  window.AppModules.notificationCenter.render = render;
})();
