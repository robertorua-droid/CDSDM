// js/features/accounting/mini-balance-module.js
// CDSDM 0.4.5 - UI Bilancino gestionale
(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.miniBalance = window.AppModules.miniBalance || {};
  let _bound = false;
  function euro(v) { return '€ ' + (Number(v || 0)).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(v) { return (Number(v || 0)).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'; }
  function esc(v) { return $('<div>').text(v == null ? '' : String(v)).html(); }
  function filters() { return { from: $('#mini-balance-from').val(), to: $('#mini-balance-to').val(), includeManualCashbook: $('#mini-balance-include-manual').is(':checked'), includeWarehouse: $('#mini-balance-include-warehouse').is(':checked'), valuationMethod: $('#mini-balance-valuation-method').val() || 'standard' }; }
  function dataBundle() { const g = window.globalData || {}; return { invoices: getDataSafe('invoices'), purchases: getDataSafe('purchases'), notes: getDataSafe('notes'), customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers'), products: getDataSafe('products'), paymentEvents: getDataSafe('paymentEvents'), cashbookMovements: getDataSafe('cashbookMovements'), supplierDDTs: getDataSafe('supplierDDTs'), customerDDTs: getDataSafe('customerDDTs'), warehouseLots: getDataSafe('warehouseLots'), businessBudgets: getDataSafe('businessBudgets') }; }
  function getDataSafe(key) { if (typeof window.getData === 'function') return window.getData(key) || []; if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || []; return (window.globalData && window.globalData[key]) || []; }
  function defaultDates() { const now = new Date(); const y = now.getFullYear(); if (!$('#mini-balance-from').val()) $('#mini-balance-from').val(y + '-01-01'); if (!$('#mini-balance-to').val()) $('#mini-balance-to').val(now.toISOString().slice(0, 10)); }
  function card(title, value, sub, cls) { return '<div class="col-md-3"><div class="card h-100 shadow-sm"><div class="card-body"><div class="text-muted small">' + esc(title) + '</div><div class="h4 mb-1 ' + (cls || '') + '">' + value + '</div><div class="small text-muted">' + esc(sub || '') + '</div></div></div></div>'; }
  function render() {
    if (!window.MiniBalanceService) return;
    defaultDates();
    const result = window.MiniBalanceService.buildMiniBalance(dataBundle(), filters());
    $('#mini-balance-summary').html([
      card('Ricavi netti', euro(result.economic.revenueNet), 'fatture - note di credito'),
      card('Costi netti', euro(result.economic.costsNet), 'acquisti + costi manuali'),
      card('Margine operativo', euro(result.economic.operatingMargin), 'margine ' + pct(result.economic.marginPct), result.economic.operatingMargin < 0 ? 'text-danger' : 'text-success'),
      card('Saldo finanziario', euro(result.financial.balance), 'incassi - pagamenti + movimenti manuali', result.financial.balance < 0 ? 'text-danger' : 'text-success')
    ].join(''));
    $('#mini-balance-economic-body').html([
      ['Ricavi da fatture cliente', result.economic.revenueGross], ['Note di credito cliente', -result.economic.creditNotes], ['Ricavi netti', result.economic.revenueNet], ['Costi da acquisti', -result.economic.purchases], ['Uscite manuali prima nota', -result.economic.manualExpenses], ['Margine operativo semplificato', result.economic.operatingMargin]
    ].map(r => '<tr><td>' + esc(r[0]) + '</td><td class="text-end ' + (r[1] < 0 ? 'text-danger' : '') + '">' + euro(r[1]) + '</td></tr>').join(''));
    $('#mini-balance-financial-body').html([
      ['Incassi clienti', result.financial.customerReceipts], ['Pagamenti fornitori', -result.financial.supplierPayments], ['Entrate manuali prima nota', result.financial.manualIncome], ['Uscite manuali prima nota', -result.financial.manualExpenses], ['Saldo finanziario periodo', result.financial.balance]
    ].map(r => '<tr><td>' + esc(r[0]) + '</td><td class="text-end ' + (r[1] < 0 ? 'text-danger' : '') + '">' + euro(r[1]) + '</td></tr>').join(''));
    $('#mini-balance-open-body').html([
      ['Crediti clienti aperti', result.openItems.customerOpen], ['Debiti fornitori aperti', -result.openItems.supplierOpen], ['Saldo netto aperti', result.openItems.netOpen], ['Crediti clienti scaduti', result.openItems.overdueCustomers], ['Debiti fornitori scaduti', -result.openItems.overdueSuppliers]
    ].map(r => '<tr><td>' + esc(r[0]) + '</td><td class="text-end ' + (r[1] < 0 ? 'text-danger' : '') + '">' + euro(r[1]) + '</td></tr>').join(''));
    $('#mini-balance-warehouse-body').html([
      ['Valore magazzino stimato', result.warehouse.totalValue], ['Valore disponibile stimato', result.warehouse.availableValue], ['Valore quarantena stimato', result.warehouse.quarantineValue], ['Prodotti con costo mancante', result.warehouse.missingCost]
    ].map(r => '<tr><td>' + esc(r[0]) + '</td><td class="text-end">' + (String(r[0]).indexOf('Prodotti') >= 0 ? esc(r[1]) : euro(r[1])) + '</td></tr>').join(''));
    const budgetHtml = result.budget ? '<div class="row g-2"><div class="col-md-4"><div class="small text-muted">Ricavi vs budget</div><div class="fw-bold">' + euro(result.economic.revenueNet) + ' / ' + euro(result.budget.targetRevenue || 0) + '</div></div><div class="col-md-4"><div class="small text-muted">Costi vs budget</div><div class="fw-bold">' + euro(result.economic.costsNet) + ' / ' + euro(result.budget.targetCosts || 0) + '</div></div><div class="col-md-4"><div class="small text-muted">Margine vs budget</div><div class="fw-bold">' + euro(result.economic.operatingMargin) + ' / ' + euro(result.budget.targetMargin || 0) + '</div></div></div>' : '<span class="text-muted">Budget non disponibile.</span>';
    $('#mini-balance-budget-box').html(budgetHtml);
    $('#mini-balance-alerts').html(result.alerts.map(a => '<div class="alert alert-' + (a.level === 'danger' ? 'danger' : a.level === 'warning' ? 'warning' : 'info') + ' py-2 mb-2">' + esc(a.text) + '</div>').join(''));
    $('#mini-balance-documents-body').html(result.documents.slice(0, 120).map(r => '<tr><td>' + esc(r.date) + '</td><td>' + esc(r.label) + '</td><td>' + esc(r.number) + '</td><td>' + esc(r.subjectName) + '</td><td class="text-end">' + euro(r.total) + '</td><td class="text-end">' + euro(r.paid) + '</td><td class="text-end">' + euro(r.residual) + '</td></tr>').join('') || '<tr><td colspan="7" class="text-center text-muted py-4">Nessun documento nel periodo.</td></tr>');
  }
  function exportCsv() { const res = window.MiniBalanceService.buildMiniBalance(dataBundle(), filters()); const csv = window.MiniBalanceService.toCsv(res); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bilancino-gestionale-0.4.5.csv'; a.click(); URL.revokeObjectURL(a.href); }
  function bind() { if (_bound) return; _bound = true; $(document).on('click', '#mini-balance-refresh-btn,#mini-balance-calc-btn', render); $(document).on('click', '#mini-balance-export-btn', exportCsv); $(document).on('change', '#mini-balance-from,#mini-balance-to,#mini-balance-include-manual,#mini-balance-include-warehouse,#mini-balance-valuation-method', render); }
  window.AppModules.miniBalance.render = render;
  window.AppModules.miniBalance.bind = bind;
})();
