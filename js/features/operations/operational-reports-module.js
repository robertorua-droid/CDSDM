// js/features/operations/operational-reports-module.js
// CDSDM 0.13.3 - UI Segnalazioni operative con usabilita mobile progressiva.
(function () {
  'use strict';
  window.AppModules = window.AppModules || {};
  window.AppModules.operationalReports = window.AppModules.operationalReports || {};
  let _bound = false;
  let _selectedId = '';

  function svc() { return window.OperationalReportsService; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return v == null ? '' : String(v); }
  function esc(v) { return str(v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]); }
  function money(v) { const n = Number(v || 0); return Number.isFinite(n) ? n.toFixed(2).replace('.', ',') : '0,00'; }
  function getVal(id) { return $('#' + id).val() || ''; }
  function setVal(id, value) { $('#' + id).val(value == null ? '' : String(value)); }
  function storeArray(key) { if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || []; if (typeof window.getData === 'function') return window.getData(key) || []; return (window.globalData && window.globalData[key]) || []; }
  function subjectLabel(s) { return str(s && (s.name || s.nome || s.ragioneSociale || s.denominazione || s.email || s.id)); }
  function optionHtml(map, selected) { return Object.keys(map || {}).map(k => '<option value="' + esc(k) + '"' + (String(selected) === k ? ' selected' : '') + '>' + esc(map[k]) + '</option>').join(''); }
  function badgeStatus(status) { const tone = { draft:'secondary', reported:'warning text-dark', assigned:'info text-dark', in_progress:'primary', waiting_info:'dark', resolved:'success', closed:'success', cancelled:'secondary' }[status] || 'secondary'; return '<span class="badge bg-' + tone + '">' + esc((svc().STATUSES || {})[status] || status) + '</span>'; }
  function badgeSeverity(sev) { const tone = { low:'info text-dark', medium:'warning text-dark', high:'danger', blocking:'dark' }[sev] || 'secondary'; return '<span class="badge bg-' + tone + '">' + esc((svc().SEVERITIES || {})[sev] || sev) + '</span>'; }
  function filters() { return { status: getVal('operational-report-filter-status') || 'open', area: getVal('operational-report-filter-area') || 'all', severity: getVal('operational-report-filter-severity') || 'all', search: getVal('operational-report-search') || '' }; }
  function download(filename, content, type) { const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.download = filename; a.href = URL.createObjectURL(blob); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }
  function activateListTab() { const el = document.getElementById('operational-reports-list-tab'); if (el && window.bootstrap && window.bootstrap.Tab) window.bootstrap.Tab.getOrCreateInstance(el).show(); }
  function currentReport() { const result = svc().list({ status:'all' }); return arr(result.all).find(r => String(r.id) === String(_selectedId)) || null; }

  function renderSummary(summary) {
    const card = (label, value, hint, tone) => '<div class="col-sm-6 col-lg-3"><div class="card h-100 border-' + esc(tone || 'light') + '"><div class="card-body py-3"><div class="text-muted small">' + esc(label) + '</div><div class="fs-4 fw-semibold">' + esc(value) + '</div><div class="small text-muted">' + esc(hint || '') + '</div></div></div></div>';
    $('#operational-report-summary').html([
      card('Segnalazioni totali', summary.total, 'collezione operationalReports', 'primary'),
      card('Aperte', summary.open, 'da gestire', 'warning'),
      card('Bloccanti', summary.blocking, 'priorità massima', 'danger'),
      card('Chiuse/risolte', summary.closed, 'storico', 'success')
    ].join(''));
  }

  function renderTable(reports) {
    if (!reports.length) {
      $('#operational-report-table-body').html('<tr><td colspan="9" class="text-center text-muted py-4">Nessuna segnalazione operativa per i filtri selezionati.</td></tr>');
      return;
    }
    $('#operational-report-table-body').html(reports.map(r => '<tr class="operational-report-mobile-row ' + (String(r.id) === String(_selectedId) ? 'table-active' : '') + '">' +
      '<td><button class="btn btn-link p-0 operational-report-open" data-id="' + esc(r.id) + '"><strong>' + esc(r.code) + '</strong></button><div class="small text-muted">' + esc((r.updatedAt || '').slice(0, 16).replace('T', ' ')) + '</div></td>' +
      '<td>' + badgeStatus(r.status) + '</td>' +
      '<td>' + badgeSeverity(r.severity) + '</td>' +
      '<td><div class="fw-semibold">' + esc(r.title) + '</div><div class="small text-muted">' + esc((svc().REPORT_TYPES || {})[r.type] || r.type) + '</div></td>' +
      '<td>' + esc((svc().AREAS || {})[r.originArea] || r.originArea) + '</td>' +
      '<td>' + esc((svc().AREAS || {})[r.targetArea] || r.targetArea) + '</td>' +
      '<td>' + esc(r.assigneeName || ((svc().AREAS || {})[r.assigneeArea] || r.assigneeArea)) + '</td>' +
      '<td><div class="small">' + esc([r.relatedDocumentType, r.relatedDocumentNumber || r.relatedDocumentId].filter(Boolean).join(' ')) + '</div><div class="small text-muted">' + esc(r.relatedProductName || r.relatedCustomerName || r.relatedSupplierName || '') + '</div></td>' +
      '<td><div class="btn-group btn-group-sm operational-report-row-actions"><button class="btn btn-outline-primary operational-report-open" data-id="' + esc(r.id) + '">Apri</button><button class="btn btn-outline-secondary operational-report-print" data-id="' + esc(r.id) + '">Stampa</button></div></td>' +
      '</tr>').join(''));
  }

  function renderWorkflowActions(report) {
    const actions = svc().getNextActions ? svc().getNextActions(report.status) : [];
    if (!actions.length) return '<span class="text-muted small">Nessuna azione guidata disponibile per lo stato corrente.</span>';
    const tone = { send: 'primary', take_charge: 'info', start_work: 'primary', request_info: 'warning', resolve: 'success', close: 'success', cancel: 'outline-secondary' };
    return actions.map(a => {
      const def = (svc().WORKFLOW_ACTIONS || {})[a] || { label: a };
      return '<button class="btn btn-sm btn-' + esc(tone[a] || 'outline-primary') + ' operational-report-action" data-id="' + esc(report.id) + '" data-action="' + esc(a) + '" type="button">' + esc(def.label) + '</button>';
    }).join('');
  }

  function renderDetail(report) {
    const r = report || currentReport();
    if (!r) { $('#operational-report-detail').html('<div class="alert alert-light border mb-0">Seleziona una segnalazione per vedere dettaglio, comunicazioni interne, stampa e workflow.</div>'); return; }
    const messages = arr(r.messages).length ? arr(r.messages).map(m => '<div class="border-bottom py-2"><div class="d-flex justify-content-between"><strong>' + esc(m.createdBy) + '</strong><span class="small text-muted">' + esc((m.createdAt || '').slice(0, 16).replace('T', ' ')) + '</span></div><div>' + esc(m.message) + '</div><div class="small text-muted">Area: ' + esc((svc().AREAS || {})[m.area] || m.area) + ' · Stato: ' + esc((svc().STATUSES || {})[m.status] || m.status) + '</div></div>').join('') : '<div class="text-muted small">Nessuna comunicazione interna.</div>';
    const actionButtons = renderWorkflowActions(r);
    $('#operational-report-detail').html('<div class="card"><div class="card-body">' +
      '<div class="d-flex justify-content-between align-items-start gap-2 operational-report-detail-header"><div><h5 class="mb-1">' + esc(r.code) + ' · ' + esc(r.title) + '</h5><div class="small text-muted">Creata da ' + esc(r.reporterName) + ' · ' + esc((r.createdAt || '').slice(0, 16).replace('T', ' ')) + '</div></div><div>' + badgeStatus(r.status) + ' ' + badgeSeverity(r.severity) + '</div></div>' +
      '<hr><p>' + esc(r.description || 'Nessuna descrizione.') + '</p><p><strong>Azione richiesta:</strong> ' + esc(r.actionRequired || '-') + '</p>' +
      '<div class="row g-2 small"><div class="col-md-4"><strong>Origine</strong><br>' + esc((svc().AREAS || {})[r.originArea] || r.originArea) + '</div><div class="col-md-4"><strong>Destinatario</strong><br>' + esc((svc().AREAS || {})[r.targetArea] || r.targetArea) + '</div><div class="col-md-4"><strong>Referente</strong><br>' + esc(r.assigneeName || r.assigneeArea || '-') + '</div></div>' +
      '<div class="alert alert-light border small mt-3 mb-3"><strong>Collegamenti:</strong> ' + esc([r.relatedDocumentType, r.relatedDocumentNumber || r.relatedDocumentId, r.relatedProductName, r.relatedCustomerName, r.relatedSupplierName].filter(Boolean).join(' · ') || 'nessun collegamento') + '</div>' +
      '<div class="alert alert-light border mt-3"><div class="fw-semibold mb-2">Workflow operativo</div><div class="d-flex flex-wrap gap-2 operational-report-action-strip">' + actionButtons + '</div><div class="small text-muted mt-2">Usa questi pulsanti per trasformare una bozza in segnalazione effettiva e seguirne presa in carico, lavorazione e chiusura.</div></div>' +
      '<div class="row g-2 align-items-end"><div class="col-md-4"><label class="form-label" for="operational-report-status-next">Cambio stato manuale</label><select class="form-select" id="operational-report-status-next">' + optionHtml(svc().STATUSES, r.status) + '</select></div><div class="col-md-6"><label class="form-label" for="operational-report-status-note">Nota avanzamento</label><input class="form-control" id="operational-report-status-note" placeholder="Esito, verifica, presa in carico..."></div><div class="col-md-2"><button class="btn btn-primary w-100" id="operational-report-update-status" data-id="' + esc(r.id) + '" type="button">Aggiorna</button></div></div>' +
      '<hr><h6>Comunicazioni interne</h6><p class="small text-muted">Invia aggiornamenti al reparto o referente destinatario della segnalazione.</p><div class="mb-2">' + messages + '</div><div class="row g-2 align-items-end"><div class="col-md-3"><label class="form-label" for="operational-report-message-area">A/Reparto</label><select class="form-select" id="operational-report-message-area">' + optionHtml(svc().AREAS, r.targetArea) + '</select></div><div class="col-md-7"><label class="form-label" for="operational-report-message">Messaggio interno</label><input class="form-control" id="operational-report-message" placeholder="Scrivi comunicazione interna al referente/reparto"></div><div class="col-md-2"><button class="btn btn-outline-primary w-100" id="operational-report-add-message" data-id="' + esc(r.id) + '" type="button"><i class="fas fa-paper-plane"></i> Invia comunicazione</button></div></div>' +
      '</div></div>');
  }


  function renderSupplierLinkOptions() {
    const suppliers = storeArray('suppliers');
    const current = getVal('operational-report-link-supplier');
    const html = '<option value="">Seleziona fornitore...</option>' + suppliers.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(subjectLabel(s)) + '</option>'; }).join('');
    $('#operational-report-link-supplier').html(html).val(current);
  }

  function renderDocumentTypeOptions() {
    const selected = getVal('operational-report-related-doc-type') || 'supplier_order';
    $('#operational-report-related-doc-type').html(optionHtml(svc().DOCUMENT_TYPES || { supplier_order: 'Ordine fornitore', supplier_ddt: 'DDT fornitore', other: 'Altro documento' }, selected));
  }

  function renderLinkableDocumentOptions() {
    const type = getVal('operational-report-related-doc-type') || 'supplier_order';
    const supplierId = getVal('operational-report-link-supplier');
    const docs = svc().getLinkableDocuments ? svc().getLinkableDocuments(type, { supplierId: supplierId }) : [];
    const selected = getVal('operational-report-link-document');
    let html = '<option value="">Seleziona documento...</option>';
    html += docs.map(function (d) {
      const meta = [d.date, d.supplierName, d.status ? 'stato ' + d.status : '', d.quarantineQty ? 'quarantena ' + d.quarantineQty : ''].filter(Boolean).join(' · ');
      return '<option value="' + esc(d.id) + '">' + esc((d.number || d.id) + (meta ? ' · ' + meta : '')) + '</option>';
    }).join('');
    $('#operational-report-link-document').html(html).val(selected);
    if (!docs.some(function (d) { return String(d.id) === String(selected); })) $('#operational-report-link-document').val('');
  }

  function applyLinkedDocumentSelection() {
    const type = getVal('operational-report-related-doc-type') || 'supplier_order';
    const supplierId = getVal('operational-report-link-supplier');
    const docId = getVal('operational-report-link-document');
    const docs = svc().getLinkableDocuments ? svc().getLinkableDocuments(type, { supplierId: supplierId }) : [];
    const doc = docs.find(function (d) { return String(d.id) === String(docId); });
    if (!doc || !svc().buildPayloadFromLinkedDocument) return;
    const payload = svc().buildPayloadFromLinkedDocument(type, doc);
    setVal('operational-report-related-doc-id', payload.relatedDocumentId || doc.id || '');
    setVal('operational-report-related-doc-number', payload.relatedDocumentNumber || doc.number || '');
    setVal('operational-report-related-supplier', payload.relatedSupplierName || doc.supplierName || '');
    if (!getVal('operational-report-title')) setVal('operational-report-title', payload.title || '');
    if (!getVal('operational-report-description')) setVal('operational-report-description', payload.description || '');
    if (!getVal('operational-report-action')) setVal('operational-report-action', payload.actionRequired || '');
  }

  function refreshGuidedLinks() {
    renderSupplierLinkOptions();
    renderDocumentTypeOptions();
    renderLinkableDocumentOptions();
  }

  function selectValue(id, fallback) {
    const current = getVal(id);
    return current || fallback;
  }

  function setSelectOptions(id, html, selected, fallback) {
    const $el = $('#' + id);
    $el.html(html);
    const wanted = selected || fallback || '';
    if (wanted && $el.find('option[value="' + String(wanted).replace(/"/g, '\"') + '"]').length) $el.val(wanted);
    else if (fallback && $el.find('option[value="' + String(fallback).replace(/"/g, '\"') + '"]').length) $el.val(fallback);
  }

  function fillFormOptions() {
    const formType = selectValue('operational-report-type', 'generic_operational_note');
    const formOrigin = selectValue('operational-report-origin', 'warehouse');
    const formTarget = selectValue('operational-report-target', 'management');
    const formSeverity = selectValue('operational-report-severity', 'medium');
    const formStatus = selectValue('operational-report-status', 'draft');
    const filterStatus = selectValue('operational-report-filter-status', 'open');
    const filterArea = selectValue('operational-report-filter-area', 'all');
    const filterSeverity = selectValue('operational-report-filter-severity', 'all');

    setSelectOptions('operational-report-type', optionHtml(svc().REPORT_TYPES, ''), formType, 'generic_operational_note');
    setSelectOptions('operational-report-origin', optionHtml(svc().AREAS, ''), formOrigin, 'warehouse');
    setSelectOptions('operational-report-target', optionHtml(svc().AREAS, ''), formTarget, 'management');
    setSelectOptions('operational-report-severity', optionHtml(svc().SEVERITIES, ''), formSeverity, 'medium');
    setSelectOptions('operational-report-status', optionHtml(svc().STATUSES, ''), formStatus, 'draft');
    setSelectOptions('operational-report-filter-status', '<option value="open">Aperte / da gestire</option><option value="all">Tutte</option>' + optionHtml(svc().STATUSES, ''), filterStatus, 'open');
    setSelectOptions('operational-report-filter-area', '<option value="all">Tutte</option>' + optionHtml(svc().AREAS, ''), filterArea, 'all');
    setSelectOptions('operational-report-filter-severity', '<option value="all">Tutte</option>' + optionHtml(svc().SEVERITIES, ''), filterSeverity, 'all');
    refreshGuidedLinks();
  }

  function render() {
    if (!svc()) { $('#operational-report-feedback').html('<div class="alert alert-danger">OperationalReportsService non disponibile.</div>'); return; }
    fillFormOptions();
    const result = svc().list(filters());
    window._lastOperationalReportsResult = result;
    renderSummary(result.summary);
    renderTable(result.reports);
    if (_selectedId) renderDetail(); else renderDetail(null);
    const qa = svc().runQa();
    $('#operational-report-feedback').html('<div class="alert alert-light border small mb-0">Segnalazioni operative 0.12.13: collezione <code>operationalReports</code>, invio segnalazioni, comunicazioni interne, workflow guidato, collegamenti a ordini/DDT lavorabili, filtri persistenti e layout elenco/form in tab. QA locale: ' + (qa.passed ? '<span class="text-success">OK</span>' : '<span class="text-danger">attenzione</span>') + '.</div>');
  }

  async function saveForm(mode) {
    try {
      const sendNow = mode === 'send';
      const payload = {
        type: getVal('operational-report-type'), originArea: getVal('operational-report-origin'), category: getVal('operational-report-origin'), targetArea: getVal('operational-report-target'), assigneeArea: getVal('operational-report-target'), severity: getVal('operational-report-severity'), status: sendNow ? 'reported' : 'draft', title: getVal('operational-report-title'), description: getVal('operational-report-description'), actionRequired: getVal('operational-report-action'), assigneeName: getVal('operational-report-assignee'), relatedProductName: getVal('operational-report-related-product'), relatedCustomerName: getVal('operational-report-related-customer'), relatedSupplierName: getVal('operational-report-related-supplier'), relatedDocumentType: getVal('operational-report-related-doc-type'), relatedDocumentId: getVal('operational-report-related-doc-id'), relatedDocumentNumber: getVal('operational-report-related-doc-number')
      };
      const initialMessage = getVal('operational-report-initial-message');
      const saved = await svc().submitReport(payload, sendNow ? 'send' : 'draft', initialMessage);
      _selectedId = saved.id;
      if (typeof window.loadAllDataFromCloud === 'function' && window.currentUser) await window.loadAllDataFromCloud();
      activateListTab();
      render();
      $('#operational-report-form input,#operational-report-form textarea').val('');
      $('#operational-report-status').val('draft');
      $('#operational-report-related-doc-type').val('supplier_order');
      $('#operational-report-link-supplier,#operational-report-link-document').val('');
    } catch (e) { console.error(e); alert('Errore salvataggio segnalazione: ' + (e && e.message ? e.message : e)); }
  }

  async function updateStatus(id) { try { await svc().updateStatus(id, getVal('operational-report-status-next'), getVal('operational-report-status-note')); if (typeof window.loadAllDataFromCloud === 'function' && window.currentUser) await window.loadAllDataFromCloud(); render(); } catch (e) { console.error(e); alert(e && e.message ? e.message : e); } }
  async function workflowAction(id, action) { try { const note = getVal('operational-report-status-note'); await svc().workflowAction(id, action, note); if (typeof window.loadAllDataFromCloud === 'function' && window.currentUser) await window.loadAllDataFromCloud(); render(); } catch (e) { console.error(e); alert(e && e.message ? e.message : e); } }
  async function addMessage(id) { try { const message = getVal('operational-report-message'); const area = getVal('operational-report-message-area'); if (!message) return alert('Inserisci una comunicazione.'); await svc().addMessage(id, message, area); if (typeof window.loadAllDataFromCloud === 'function' && window.currentUser) await window.loadAllDataFromCloud(); render(); } catch (e) { console.error(e); alert(e && e.message ? e.message : e); } }
  function printReport(id) { const r = arr(svc().list({ status:'all' }).all).find(x => String(x.id) === String(id)); if (!r) return alert('Segnalazione non trovata.'); const w = window.open('', '_blank'); w.document.write(svc().printableHtml(r)); w.document.close(); svc().markPrinted(id).catch(() => {}); }
  function exportCsv() { const result = window._lastOperationalReportsResult || svc().list(filters()); download('CDSDM_segnalazioni_operative.csv', svc().toCsv(result.reports || []), 'text/csv;charset=utf-8'); }
  async function createFromBiAlert(alert) { try { const payload = svc().buildFromAlert(alert || {}); const saved = await svc().save(payload); _selectedId = saved.id; render(); return saved; } catch (e) { alert(e && e.message ? e.message : e); throw e; } }


  async function createFromSupplierDDTQuarantine(ddt) {
    try {
      if (!svc().buildFromSupplierDDTQuarantine) throw new Error('Funzione creazione da quarantena non disponibile.');
      const payload = svc().buildFromSupplierDDTQuarantine(ddt || {});
      const saved = await svc().submitReport(payload, 'draft', 'Bozza generata da DDT fornitore con merce in quarantena. Verificare e usare Invia segnalazione per renderla effettiva.');
      _selectedId = saved.id;
      if (typeof window.loadAllDataFromCloud === 'function' && window.currentUser) await window.loadAllDataFromCloud();
      activateListTab();
      if ($('[data-target="operational-reports"]').length) $('[data-target="operational-reports"]').first().trigger('click');
      render();
      return saved;
    } catch (e) { alert(e && e.message ? e.message : e); throw e; }
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $('#operational-reports').on('click', '#operational-report-refresh', render);
    $('#operational-reports').on('click', '#operational-report-save-draft', function () { saveForm('draft'); });
    $('#operational-reports').on('click', '#operational-report-send', function () { saveForm('send'); });
    $('#operational-reports').on('change input', '#operational-report-filter-status,#operational-report-filter-area,#operational-report-filter-severity,#operational-report-search', render);
    $('#operational-reports').on('change', '#operational-report-link-supplier,#operational-report-related-doc-type', function () { renderLinkableDocumentOptions(); });
    $('#operational-reports').on('change', '#operational-report-link-document', applyLinkedDocumentSelection);
    $('#operational-reports').on('click', '.operational-report-open', function () { _selectedId = String($(this).data('id') || ''); render(); });
    $('#operational-reports').on('click', '.operational-report-print', function () { printReport($(this).data('id')); });
    $('#operational-reports').on('click', '#operational-report-update-status', function () { updateStatus($(this).data('id')); });
    $('#operational-reports').on('click', '.operational-report-action', function () { workflowAction($(this).data('id'), $(this).data('action')); });
    $('#operational-reports').on('click', '#operational-report-add-message', function () { addMessage($(this).data('id')); });
    $('#operational-reports').on('click', '#operational-report-export-csv', exportCsv);
  }

  window.AppModules.operationalReports.bind = bind;
  window.AppModules.operationalReports.render = function () { bind(); render(); };
  window.AppModules.operationalReports.createFromBiAlert = createFromBiAlert;
  window.AppModules.operationalReports.createFromSupplierDDTQuarantine = createFromSupplierDDTQuarantine;
})();
