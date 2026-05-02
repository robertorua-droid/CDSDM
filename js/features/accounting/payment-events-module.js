// js/features/accounting/payment-events-module.js
// CDSDM 0.3.1 - UI Incassi e pagamenti evoluti

(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.paymentEvents = window.AppModules.paymentEvents || {};

  let _bound = false;

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function money(v) { const n = Number(v || 0); return Number.isFinite(n) ? n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'; }
  function getDataSafe(key) { if (typeof getData === 'function') return getData(key) || []; if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || []; return (window.globalData && window.globalData[key]) || []; }
  function subjectName(x, fallback) { return String((x && (x.name || x.ragioneSociale || x.denominazione || x.businessName || x.fullName || x.displayName || x.nomeCompleto || ([x.nome, x.cognome].filter(Boolean).join(' ').trim()))) || fallback || 'Soggetto'); }
  function subjectId(x) { return String((x && (x.id || x._id || x.uid || x.code || x.codice)) || '').trim(); }
  function isPlaceholderOnly($select) { const opts = $select.find('option'); return opts.length <= 1 || (opts.length === 1 && String(opts.first().val() || '') === ''); }
  function findById(list, id) { return (Array.isArray(list) ? list : []).find(function (x) { return String(x && x.id) === String(id); }); }
  function amountVal(raw) { const n = Number(String(raw == null ? '' : raw).replace(',', '.')); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; }

  function dataBundle() {
    return { customers: getDataSafe('customers'), suppliers: getDataSafe('suppliers'), invoices: getDataSafe('invoices'), purchases: getDataSafe('purchases'), paymentEvents: getDataSafe('paymentEvents') };
  }

  function renderSubjects() {
    const type = $('#payev-subject-type').val() || 'customer';
    const list = type === 'supplier' ? getDataSafe('suppliers') : getDataSafe('customers');
    const current = String($('#payev-subject-id').val() || '');
    const options = list.map(function (s) {
      const id = subjectId(s);
      if (!id) return '';
      return '<option value="' + esc(id) + '">' + esc(subjectName(s, type === 'supplier' ? 'Fornitore' : 'Cliente')) + '</option>';
    }).join('');
    $('#payev-subject-id').html('<option value="">Seleziona...</option>' + options);
    if (current && $('#payev-subject-id option').filter(function () { return String(this.value) === current; }).length) $('#payev-subject-id').val(current);
    renderOpenDocuments();
  }

  function renderOpenDocuments() {
    const subjectType = $('#payev-subject-type').val() || 'customer';
    const subjectId = $('#payev-subject-id').val() || '';
    if (!subjectId || !window.PaymentEventsService) {
      $('#payev-open-documents').html('<div class="text-muted small">Seleziona un soggetto per visualizzare documenti aperti.</div>');
      return;
    }
    const docs = window.PaymentEventsService.buildOpenDocuments(subjectType, subjectId, dataBundle());
    if (!docs.length) {
      $('#payev-open-documents').html('<div class="alert alert-light border mb-0">Nessun documento aperto per il soggetto selezionato.</div>');
      return;
    }
    $('#payev-open-documents').html(docs.map(function (d, idx) {
      return '<div class="row g-2 align-items-center border-bottom py-2 payev-allocation-row" data-document-type="' + esc(d.documentType) + '" data-document-id="' + esc(d.documentId) + '" data-document-number="' + esc(d.number) + '">' +
        '<div class="col-md-1"><input class="form-check-input payev-alloc-enabled" type="checkbox" ' + (idx === 0 ? 'checked' : '') + '></div>' +
        '<div class="col-md-4"><strong>' + esc(d.documentType === 'purchase' ? 'Acq.' : 'Fatt.') + ' #' + esc(d.number) + '</strong><div class="small text-muted">Doc. ' + esc(d.date || '-') + ' · Scad. ' + esc(d.dueDate || '-') + '</div></div>' +
        '<div class="col-md-2 text-end">Tot. € ' + money(d.total) + '</div>' +
        '<div class="col-md-2 text-end">Residuo € ' + money(d.residual) + '</div>' +
        '<div class="col-md-3"><input class="form-control form-control-sm text-end payev-alloc-amount" value="' + esc(String(d.residual).replace('.', ',')) + '" placeholder="Importo"></div>' +
        '</div>';
    }).join(''));
  }

  function currentFilteredEvents() {
    const type = $('#payev-filter-type').val() || 'all';
    const text = String($('#payev-filter-text').val() || '').toLowerCase();
    const from = $('#payev-filter-from').val() || '';
    const to = $('#payev-filter-to').val() || '';
    const customers = getDataSafe('customers');
    const suppliers = getDataSafe('suppliers');
    const events = window.PaymentEventsService ? window.PaymentEventsService.buildEvents(dataBundle(), { includeLegacy: true }) : [];
    return events.filter(function (e) {
      if (type !== 'all' && e.subjectType !== type) return false;
      if (from && String(e.date) < from) return false;
      if (to && String(e.date) > to) return false;
      const subj = e.subjectType === 'supplier' ? findById(suppliers, e.subjectId) : findById(customers, e.subjectId);
      e._subjectName = subjectName(subj, e.subjectType === 'supplier' ? 'Fornitore' : 'Cliente');
      const hay = [e._subjectName, e.reference, e.method, e.notes, e.date].join(' ').toLowerCase();
      return !text || hay.indexOf(text) >= 0;
    });
  }

  function render() {
    if (!window.PaymentEventsService) {
      $('#payment-events-root').html('<div class="alert alert-danger">Servizio incassi/pagamenti non disponibile.</div>');
      return;
    }
    if (isPlaceholderOnly($('#payev-subject-id'))) renderSubjects();
    const events = currentFilteredEvents();
    const summary = window.PaymentEventsService.summarize(events);
    window._lastPaymentEvents = events.slice();
    $('#payev-summary').html([
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Movimenti</div><div class="fs-5 fw-bold">' + summary.count + '</div></div></div></div>',
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Incassi clienti</div><div class="fs-5 fw-bold text-success">€ ' + money(summary.customerReceipts) + '</div></div></div></div>',
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Pagamenti fornitori</div><div class="fs-5 fw-bold text-danger">€ ' + money(summary.supplierPayments) + '</div></div></div></div>',
      '<div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="small text-muted">Saldo finanziario</div><div class="fs-5 fw-bold">€ ' + money(summary.balance) + '</div></div></div></div>'
    ].join(''));
    if (!events.length) {
      $('#payev-table-body').html('<tr><td colspan="8" class="text-center text-muted py-4">Nessun movimento finanziario per i filtri selezionati.</td></tr>');
    } else {
      $('#payev-table-body').html(events.map(function (e) {
        const label = e.subjectType === 'supplier' ? 'Pagamento fornitore' : 'Incasso cliente';
        const badge = e.source === 'legacy-document-payment' ? '<span class="badge bg-light text-dark border ms-1">legacy</span>' : '<span class="badge bg-primary-subtle text-primary-emphasis border ms-1">0.3.1</span>';
        const alloc = (e.allocations || []).map(function (a) { return (a.documentType === 'purchase' ? 'Acq.' : 'Fatt.') + ' #' + (a.documentNumber || a.documentId) + ' € ' + money(a.amount); }).join('<br>');
        return '<tr>' +
          '<td>' + esc(e.date) + '</td>' +
          '<td>' + esc(label) + badge + '</td>' +
          '<td>' + esc(e._subjectName || '') + '</td>' +
          '<td class="text-end fw-semibold">€ ' + money(e.amount) + '</td>' +
          '<td>' + esc(e.method || '-') + '</td>' +
          '<td>' + esc(e.reference || '-') + '</td>' +
          '<td class="small">' + (alloc || '<span class="text-muted">Non allocato</span>') + '</td>' +
          '<td>' + esc(e.notes || '') + '</td>' +
          '</tr>';
      }).join(''));
    }
  }

  async function saveEvent() {
    const subjectType = $('#payev-subject-type').val() || 'customer';
    const subjectId = $('#payev-subject-id').val() || '';
    const amount = amountVal($('#payev-amount').val());
    if (!subjectId) { alert('Seleziona cliente o fornitore.'); return; }
    if (!(amount > 0)) { alert('Importo non valido.'); return; }
    const allocations = [];
    $('#payev-open-documents .payev-allocation-row').each(function () {
      const $row = $(this);
      if (!$row.find('.payev-alloc-enabled').is(':checked')) return;
      const a = amountVal($row.find('.payev-alloc-amount').val());
      if (!(a > 0)) return;
      allocations.push({ documentType: $row.data('document-type'), documentId: String($row.data('document-id')), documentNumber: String($row.data('document-number') || ''), amount: a });
    });
    let plan;
    try {
      plan = window.PaymentEventsService.buildSavePlan({
        id: 'payev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        type: subjectType === 'supplier' ? 'supplier_payment' : 'customer_receipt',
        subjectType: subjectType, subjectId: subjectId,
        date: $('#payev-date').val() || new Date().toISOString().slice(0, 10),
        valueDate: $('#payev-value-date').val() || '', amount: amount,
        method: $('#payev-method').val() || '', reference: $('#payev-reference').val() || '', notes: $('#payev-notes').val() || '',
        allocations: allocations
      }, dataBundle());
    } catch (e) { alert(e.message || e); return; }

    await saveDataToCloud('paymentEvents', plan.event, plan.event.id);
    for (const upd of plan.docUpdates) {
      await saveDataToCloud(upd.collection, upd.data, upd.id);
    }
    $('#payev-amount,#payev-reference,#payev-notes').val('');
    $('#payev-value-date').val('');
    renderOpenDocuments();
    render();
    try { if (window.AppModules.ledger && window.AppModules.ledger.render) window.AppModules.ledger.render(); } catch (e2) {}
    try { if (typeof renderScadenziarioPage === 'function') renderScadenziarioPage(); } catch (e3) {}
  }

  function exportCsv() {
    const rows = window._lastPaymentEvents || [];
    if (!rows.length) { alert('Nessun movimento da esportare.'); return; }
    function csv(v) { const s = String(v == null ? '' : v).replace(/\r\n|\r|\n/g, ' '); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
    const lines = [['Data','Tipo','Soggetto','Importo','Metodo','Riferimento','Allocazioni','Note'].join(';')];
    rows.forEach(function (e) {
      const alloc = (e.allocations || []).map(function (a) { return (a.documentType === 'purchase' ? 'Acq.' : 'Fatt.') + ' #' + (a.documentNumber || a.documentId) + ' ' + money(a.amount); }).join(' | ');
      lines.push([e.date, e.subjectType === 'supplier' ? 'Pagamento fornitore' : 'Incasso cliente', e._subjectName || '', money(e.amount), e.method, e.reference, alloc, e.notes].map(csv).join(';'));
    });
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.download = 'incassi_pagamenti_031.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $('#incassi-pagamenti').on('change', '#payev-subject-type', renderSubjects);
    $('#incassi-pagamenti').on('change', '#payev-subject-id', renderOpenDocuments);
    $('#incassi-pagamenti').on('change keyup', '#payev-filter-type,#payev-filter-from,#payev-filter-to,#payev-filter-text', render);
    $('#incassi-pagamenti').on('click', '#payev-save-btn', saveEvent);
    $('#incassi-pagamenti').on('click', '#payev-refresh-btn', function () { renderSubjects(); render(); });
    $('#incassi-pagamenti').on('click', '#payev-export-csv-btn', exportCsv);
  }

  window.AppModules.paymentEvents.bind = bind;
  window.AppModules.paymentEvents.render = render;
})();
