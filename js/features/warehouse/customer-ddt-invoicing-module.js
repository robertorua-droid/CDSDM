(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.customerDDTInvoicing = window.AppModules.customerDDTInvoicing || {};

  let _bound = false;
  let selectedIds = {};

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }
  function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function getDataSafe(name) { return (typeof window.getData === 'function' ? window.getData(name) : null) || []; }
  function normalizeDDT(ddt) {
    return (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCustomerDDT === 'function')
      ? window.DomainNormalizers.normalizeCustomerDDT(ddt)
      : (ddt || {});
  }
  function fmtDate(v) {
    if (!v) return '-';
    const p = String(v).slice(0, 10).split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : String(v);
  }
  function fmtMoney(v) {
    try { return (num(v)).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }); }
    catch (e) { return '€ ' + num(v).toFixed(2); }
  }
  function fmtQty(v) {
    try { return num(v).toLocaleString('it-IT', { maximumFractionDigits: 3 }); }
    catch (e) { return String(num(v)); }
  }
  function getCustomerName(customerId) {
    const c = getDataSafe('customers').find(function (x) { return String(x.id) === String(customerId || ''); }) || {};
    return c.name || c.ragioneSociale || c.nome || '';
  }
  function isInvoiced(ddt) {
    return !!(ddt.invoiceId || ddt.invoiceNumber || String(ddt.invoiceStatus || '').toLowerCase() === 'invoiced');
  }
  function getAvailableDDTs() {
    return getDataSafe('customerDDTs')
      .map(normalizeDDT)
      .filter(function (d) {
        return d && d.id && !isInvoiced(d) && d.status !== 'cancelled' && Array.isArray(d.lines) && d.lines.some(function (l) { return num(l.shippedQty || l.qty) > 0; });
      })
      .sort(function (a, b) { return String(a.date || '').localeCompare(String(b.date || '')) || String(a.number || a.id || '').localeCompare(String(b.number || b.id || '')); });
  }
  function getFilteredDDTs() {
    const cid = String($('#summary-ddt-customer-select').val() || '');
    return getAvailableDDTs().filter(function (d) { return !cid || String(d.customerId || '') === cid; });
  }
  function getSelectedDDTs() {
    const byId = {};
    getAvailableDDTs().forEach(function (d) { byId[String(d.id)] = d; });
    return Object.keys(selectedIds).filter(function (id) { return !!selectedIds[id] && byId[id]; }).map(function (id) { return byId[id]; });
  }
  function getSummaryOptions() {
    return {
      groupingMode: $('#summary-ddt-grouping-mode').val() || 'separate_by_ddt',
      lineOrder: $('#summary-ddt-line-order').val() || 'by_ddt',
      includeSummaryNote: !$('#summary-ddt-include-note').length || $('#summary-ddt-include-note').is(':checked'),
      includeXmlDatiDDT: !$('#summary-ddt-include-xml-ddt').length || $('#summary-ddt-include-xml-ddt').is(':checked')
    };
  }
  function renderCustomerOptions() {
    const $sel = $('#summary-ddt-customer-select');
    if (!$sel.length) return;
    const current = String($sel.val() || '');
    const seen = {};
    const opts = ['<option value="">Tutti i clienti con DDT da fatturare</option>'];
    getAvailableDDTs().forEach(function (d) {
      const id = String(d.customerId || '');
      if (!id || seen[id]) return;
      seen[id] = true;
      const label = d.customerName || getCustomerName(id) || id;
      opts.push('<option value="' + esc(id) + '">' + esc(label) + '</option>');
    });
    $sel.html(opts.join(''));
    if (current && seen[current]) $sel.val(current);
  }
  function renderDDTTable() {
    const $body = $('#summary-ddt-table-body');
    if (!$body.length) return;
    const ddts = getFilteredDDTs();
    $body.empty();
    if (!ddts.length) {
      $body.append('<tr><td colspan="7"><div class="warehouse-empty-state"><span class="empty-title">Nessun DDT da fatturare</span><span class="empty-hint">Non ci sono DDT cliente non fatturati per il filtro selezionato.</span></div></td></tr>');
      return;
    }
    ddts.forEach(function (d) {
      const id = String(d.id || '');
      const rows = (d.lines || []).filter(function (l) { return num(l.shippedQty || l.qty) > 0; }).length;
      const origin = d.sourceType === 'customer_order' ? ('Ordine ' + (d.sourceOrderId || '')) : 'Diretto';
      $body.append('<tr>' +
        '<td><input class="form-check-input summary-ddt-check" type="checkbox" data-id="' + esc(id) + '" ' + (selectedIds[id] ? 'checked' : '') + '></td>' +
        '<td class="fw-semibold">' + esc(d.number || d.numero || id) + '</td>' +
        '<td>' + esc(fmtDate(d.date)) + '</td>' +
        '<td>' + esc(d.customerName || getCustomerName(d.customerId) || '-') + '</td>' +
        '<td class="text-end">' + esc(rows) + '</td>' +
        '<td class="text-end">' + esc(fmtMoney(d.total || 0)) + '</td>' +
        '<td>' + esc(origin) + '</td>' +
      '</tr>');
    });
  }
  function renderPreview() {
    const $body = $('#summary-ddt-preview-table-body');
    const $summary = $('#summary-ddt-selected-summary');
    const $footer = $('#summary-ddt-preview-footer');
    const $btn = $('#create-summary-invoice-btn');
    if (!$body.length) return;
    const ddts = getSelectedDDTs();
    const validation = window.DDTToInvoiceService && typeof window.DDTToInvoiceService.validateDDTsForSummaryInvoice === 'function'
      ? window.DDTToInvoiceService.validateDDTsForSummaryInvoice(ddts, getSummaryOptions())
      : { ok: false, message: 'Servizio fatturazione DDT non disponibile.' };
    $body.empty();
    if (!ddts.length) {
      $body.append('<tr><td colspan="4" class="text-muted text-center py-3">Seleziona uno o più DDT.</td></tr>');
      $summary.text('Nessun DDT selezionato.');
      $footer.text('Totale anteprima: € 0,00');
      $btn.prop('disabled', true);
      return;
    }
    if (!validation.ok) {
      $body.append('<tr><td colspan="4" class="text-danger text-center py-3">' + esc(validation.message) + '</td></tr>');
      $summary.text(ddts.length + ' DDT selezionati - selezione non valida.');
      $footer.text('Totale anteprima: € 0,00');
      $btn.prop('disabled', true);
      return;
    }
    let total = 0;
    validation.lines.forEach(function (l) {
      const lineTotal = num(l.subtotal != null ? l.subtotal : (num(l.qty) * num(l.price)));
      total += lineTotal;
      $body.append('<tr><td>' + esc(l.productName || '') + '</td><td class="text-end">' + esc(fmtQty(l.qty)) + '</td><td class="text-end">' + esc(fmtMoney(l.price)) + '</td><td class="text-end">' + esc(fmtMoney(lineTotal)) + '</td></tr>');
    });
    const customerName = (ddts[0] && (ddts[0].customerName || getCustomerName(ddts[0].customerId))) || 'cliente';
    $summary.text(ddts.length + ' DDT selezionati per ' + customerName + ' - ' + validation.lines.length + ' righe fattura.');
    $footer.text('Totale anteprima: ' + fmtMoney(total));
    $btn.prop('disabled', false);
  }
  function render() {
    renderCustomerOptions();
    const visibleIds = {};
    getAvailableDDTs().forEach(function (d) { visibleIds[String(d.id)] = true; });
    Object.keys(selectedIds).forEach(function (id) { if (!visibleIds[id]) delete selectedIds[id]; });
    renderDDTTable();
    renderPreview();
  }
  function bind() {
    if (_bound) return;
    _bound = true;
    $(document).on('change.summaryDDTInvoice', '#summary-ddt-customer-select', function () { renderDDTTable(); renderPreview(); });
    $(document).on('change.summaryDDTInvoice', '#summary-ddt-grouping-mode, #summary-ddt-line-order, #summary-ddt-include-note, #summary-ddt-include-xml-ddt', function () { renderPreview(); });
    $(document).on('change.summaryDDTInvoice', '.summary-ddt-check', function () {
      const id = String($(this).attr('data-id') || '');
      if (this.checked) selectedIds[id] = true; else delete selectedIds[id];
      renderPreview();
    });
    $(document).on('click.summaryDDTInvoice', '#summary-ddt-clear-selection', function () { selectedIds = {}; render(); });
    $(document).on('click.summaryDDTInvoice', '#create-summary-invoice-btn', function () {
      const ddts = getSelectedDDTs();
      if (!ddts.length) { alert('Seleziona almeno un DDT cliente.'); return; }
      if (window.DDTToInvoiceService && typeof window.DDTToInvoiceService.startInvoiceFromCustomerDDTs === 'function') {
        window.DDTToInvoiceService.startInvoiceFromCustomerDDTs(ddts, getSummaryOptions());
      }
    });
    if (window.AppStore && typeof window.AppStore.subscribe === 'function') {
      ['customerDDTs','customers','products','invoices'].forEach(function (k) { window.AppStore.subscribe(k, render); });
    }
    render();
  }

  window.renderCustomerDDTInvoicingArea = render;
  window.AppModules.customerDDTInvoicing.bind = bind;
})();
