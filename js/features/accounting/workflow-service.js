// js/features/accounting/workflow-service.js
// CDSDM 0.12.13 - Workflow approvativi con stato operativo documenti
(function () {
  'use strict';
  const win = window;
  const SOURCE_COLLECTION = {
    quote: 'quotes', customer_order: 'customerOrders', supplier_order: 'supplierOrders',
    customer_ddt: 'customerDDTs', supplier_ddt: 'supplierDDTs', invoice: 'invoices',
    purchase: 'purchases', credit_note: 'notes', payment_event: 'paymentEvents', bank_reconciliation: 'bankReconciliationEvents'
  };
  const STATUS_LABELS = { draft: 'Bozza', pending_review: 'Da verificare', approved: 'Approvato', rejected: 'Respinto', blocked: 'Bloccato' };
  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function num(v) { const n = Number(String(v == null ? 0 : v).replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function nowIso() { return new Date().toISOString(); }
  function getDataSafe(key) { if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || []; if (typeof win.getData === 'function') return win.getData(key) || []; return (win.globalData && win.globalData[key]) || []; }
  function readData(data) { const d = data || {}; return {
    quotes: arr(d.quotes != null ? d.quotes : getDataSafe('quotes')), customerOrders: arr(d.customerOrders != null ? d.customerOrders : getDataSafe('customerOrders')),
    supplierOrders: arr(d.supplierOrders != null ? d.supplierOrders : getDataSafe('supplierOrders')), customerDDTs: arr(d.customerDDTs != null ? d.customerDDTs : getDataSafe('customerDDTs')),
    supplierDDTs: arr(d.supplierDDTs != null ? d.supplierDDTs : getDataSafe('supplierDDTs')), invoices: arr(d.invoices != null ? d.invoices : getDataSafe('invoices')),
    purchases: arr(d.purchases != null ? d.purchases : getDataSafe('purchases')), notes: arr(d.notes != null ? d.notes : getDataSafe('notes')),
    paymentEvents: arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents')), bankReconciliationEvents: arr(d.bankReconciliationEvents != null ? d.bankReconciliationEvents : getDataSafe('bankReconciliationEvents')),
    workflowEvents: arr(d.workflowEvents != null ? d.workflowEvents : getDataSafe('workflowEvents')), customers: arr(d.customers != null ? d.customers : getDataSafe('customers')), suppliers: arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers'))
  }; }
  function idOf(x) { return str(x && (x.id || x.uid || x.docId)); }
  function docNumber(x) { return str(x && (x.number || x.numero || x.docNumber || x.invoiceNumber || x.orderNumber || x.ddtNumber || x.protocollo || x.id)) || 'n.d.'; }
  function amountOf(x) { return num(x && (x.total || x.totalAmount || x.grandTotal || x.amount || x.importo || x.totale || x.totaleDocumento)); }
  function dateOf(x) { return str(x && (x.date || x.issueDate || x.createdAt || x.data || x.documentDate || x.registrationDate)).slice(0, 10) || todayIso(); }
  function subjectName(x, data, type) { const direct = str(x && (x.subjectName || x.customerName || x.supplierName || x.clientName || x.name || x.ragioneSociale)); if (direct) return direct; const id = str(x && (x.customerId || x.clientId || x.supplierId || x.subjectId)); const list = type === 'supplier' ? data.suppliers : data.customers; const found = arr(list).find(s => String(s.id) === id); return str(found && (found.name || found.ragioneSociale || found.denominazione || found.businessName)) || 'Soggetto non specificato'; }
  function isClosedStatus(status) { const s = lower(status); return ['closed','chiuso','chiusa','approved','approvato','approvata','paid','pagato','pagata','invoiced','fatturato','fatturata','cancelled','canceled','annullato','annullata','rejected','respinto','respinta'].indexOf(s) >= 0; }
  function workflowStatusOf(doc, fallback) { const raw = lower(doc && (doc.workflowStatus || doc.approvalStatus || doc.reviewStatus)); if (['draft','pending_review','approved','rejected','blocked'].indexOf(raw) >= 0) return raw; if (lower(doc && doc.status) === 'blocked' || lower(doc && doc.status) === 'bloccato') return 'blocked'; if (isClosedStatus(doc && doc.status)) return 'approved'; return fallback || 'pending_review'; }
  function statusLabel(status) { return STATUS_LABELS[status] || status || 'Da verificare'; }
  function priorityFor(status, type) { if (status === 'blocked' || status === 'rejected') return 'danger'; if (type === 'invoice' || type === 'payment_event' || type === 'bank_reconciliation') return 'warning'; return 'info'; }
  function latestEvent(data, sourceType, sourceId) { return data.workflowEvents.filter(e => str(e.sourceType) === sourceType && str(e.sourceId) === str(sourceId)).sort((a, b) => str(b.createdAt).localeCompare(str(a.createdAt)))[0] || null; }
  function makeTask(data, cfg) { const d = cfg.doc || {}; const sourceId = idOf(d); if (!sourceId) return null; const latest = latestEvent(data, cfg.type, sourceId); const explicit = workflowStatusOf(d, cfg.defaultStatus || 'pending_review'); const status = (latest && latest.statusTo) ? workflowStatusOf({ workflowStatus: latest.statusTo }, explicit) : explicit; return {
    id: cfg.type + '_' + sourceId, sourceType: cfg.type, sourceCollection: SOURCE_COLLECTION[cfg.type] || '', sourceId, title: cfg.title || (cfg.label + ' ' + docNumber(d)), label: cfg.label, number: docNumber(d), date: dateOf(d), subjectName: cfg.subjectName || subjectName(d, data, cfg.subjectType), subjectType: cfg.subjectType || '', amount: amountOf(d), workflowStatus: status, statusLabel: statusLabel(status), priority: cfg.priority || priorityFor(status, cfg.type), suggestedAction: cfg.suggestedAction || 'Verificare e approvare', targetSection: cfg.targetSection || '', targetLabel: cfg.targetLabel || 'Apri', latestEvent: latest, doc: d
  }; }
  function includePending(task, includeApproved) { return !!task && (includeApproved || task.workflowStatus !== 'approved'); }
  function addIf(list, task, includeApproved) { if (includePending(task, includeApproved)) list.push(task); }
  function buildTasks(data, options) { const d = readData(data); const opts = options || {}; const includeApproved = opts.includeApproved === true; let tasks = [];
    d.quotes.forEach(q => addIf(tasks, makeTask(d, { doc: q, type: 'quote', label: 'Preventivo', subjectType: 'customer', defaultStatus: isClosedStatus(q.status) ? 'approved' : 'pending_review', targetSection: 'preventivi', targetLabel: 'Preventivi', suggestedAction: 'Verificare proposta commerciale e approvare prima della conversione.' }), includeApproved));
    d.customerOrders.forEach(o => addIf(tasks, makeTask(d, { doc: o, type: 'customer_order', label: 'Ordine cliente', subjectType: 'customer', defaultStatus: isClosedStatus(o.status) ? 'approved' : 'pending_review', targetSection: 'ordini-cliente', targetLabel: 'Ordini cliente', suggestedAction: 'Confermare ordine e passaggi verso DDT/fattura.' }), includeApproved));
    d.supplierOrders.forEach(o => addIf(tasks, makeTask(d, { doc: o, type: 'supplier_order', label: 'Ordine fornitore', subjectType: 'supplier', defaultStatus: isClosedStatus(o.status) ? 'approved' : 'pending_review', targetSection: 'ordini-fornitore', targetLabel: 'Ordini fornitore', suggestedAction: 'Validare ordine e condizioni di acquisto.' }), includeApproved));
    d.customerDDTs.forEach(x => { const invoiced = x.invoiced === true || x.invoiceId || lower(x.invoiceStatus || x.fatturazioneStato).indexOf('fatturat') >= 0; addIf(tasks, makeTask(d, { doc: x, type: 'customer_ddt', label: 'DDT cliente', subjectType: 'customer', defaultStatus: invoiced ? 'approved' : 'pending_review', targetSection: 'ddt-cliente', targetLabel: 'DDT cliente', suggestedAction: invoiced ? 'DDT già fatturato.' : 'Verificare DDT pronto per fatturazione.' }), includeApproved); });
    d.supplierDDTs.forEach(x => addIf(tasks, makeTask(d, { doc: x, type: 'supplier_ddt', label: 'DDT fornitore', subjectType: 'supplier', defaultStatus: isClosedStatus(x.status) ? 'approved' : 'pending_review', targetSection: 'ddt-fornitore', targetLabel: 'DDT fornitore', suggestedAction: 'Verificare ricezione, quarantena e scarti.' }), includeApproved));
    d.invoices.forEach(x => addIf(tasks, makeTask(d, { doc: x, type: 'invoice', label: 'Fattura', subjectType: 'customer', defaultStatus: workflowStatusOf(x, 'approved'), targetSection: 'elenco-fatture', targetLabel: 'Fatture', suggestedAction: 'Verificare importi, scadenze e XML.' }), includeApproved));
    d.notes.forEach(x => addIf(tasks, makeTask(d, { doc: x, type: 'credit_note', label: 'Nota di credito', subjectType: 'customer', defaultStatus: workflowStatusOf(x, 'pending_review'), targetSection: 'elenco-fatture', targetLabel: 'Documenti vendita', suggestedAction: 'Verificare collegamento a reso/rettifica.' }), includeApproved));
    d.purchases.forEach(x => addIf(tasks, makeTask(d, { doc: x, type: 'purchase', label: 'Acquisto', subjectType: 'supplier', defaultStatus: workflowStatusOf(x, isClosedStatus(x.status) ? 'approved' : 'pending_review'), targetSection: 'elenco-acquisti', targetLabel: 'Acquisti', suggestedAction: 'Verificare documento fornitore e pagamento.' }), includeApproved));
    d.paymentEvents.forEach(x => addIf(tasks, makeTask(d, { doc: x, type: 'payment_event', label: lower(x.subjectType) === 'supplier' ? 'Pagamento fornitore' : 'Incasso cliente', subjectType: lower(x.subjectType) === 'supplier' ? 'supplier' : 'customer', defaultStatus: workflowStatusOf(x, 'pending_review'), targetSection: 'incassi-pagamenti', targetLabel: 'Incassi/pagamenti', suggestedAction: 'Controllare allocazioni, metodo e riferimenti.' }), includeApproved));
    d.bankReconciliationEvents.forEach(x => addIf(tasks, makeTask(d, { doc: x, type: 'bank_reconciliation', label: 'Riconciliazione banca', subjectType: lower(x.subjectType) === 'supplier' ? 'supplier' : 'customer', defaultStatus: workflowStatusOf(x, 'pending_review'), targetSection: 'riconciliazione-banca', targetLabel: 'Riconciliazione', suggestedAction: 'Validare abbinamento banca-documento.' }), includeApproved));
    tasks = applyFilters(tasks, opts.filters || {}); tasks.sort((a,b) => ({danger:3,warning:2,info:1}[b.priority]||0)-({danger:3,warning:2,info:1}[a.priority]||0) || str(b.date).localeCompare(str(a.date))); return { tasks, summary: summarize(tasks, d.workflowEvents), events: d.workflowEvents }; }
  function applyFilters(tasks, filters) { const status = str(filters.status || 'open'); const type = str(filters.type || 'all'); const search = lower(filters.search || ''); return arr(tasks).filter(t => { if (status === 'open' && t.workflowStatus === 'approved') return false; if (status !== 'all' && status !== 'open' && t.workflowStatus !== status) return false; if (type !== 'all' && t.sourceType !== type) return false; if (search && lower([t.title,t.subjectName,t.number,t.statusLabel,t.suggestedAction].join(' ')).indexOf(search) < 0) return false; return true; }); }
  function summarize(tasks, events) { const s = { total: tasks.length, pending_review: 0, draft: 0, blocked: 0, rejected: 0, approved: 0, byType: {}, events: arr(events).length }; tasks.forEach(t => { s[t.workflowStatus] = (s[t.workflowStatus] || 0) + 1; s.byType[t.sourceType] = (s.byType[t.sourceType] || 0) + 1; }); return s; }

  function isDraftLike(status) { return ['','draft','bozza','pending_review','da verificare','review'].indexOf(lower(status)) >= 0; }
  function isOperativeLike(status) { return ['confirmed','open','aperto','partially_received','partially_fulfilled','received','fulfilled','delivered','issued','emesso','posted','registrato','paid','closed'].indexOf(lower(status)) >= 0; }
  function operationalStatusForApproval(task) {
    const type = str(task && task.sourceType);
    const doc = (task && task.doc) || {};
    const current = lower(doc.status || doc.stato || '');
    if (current === 'cancelled' || current === 'canceled' || current === 'annullato' || current === 'deleted' || current === 'eliminato') return null;
    if (type === 'supplier_order') return isDraftLike(current) ? 'confirmed' : null;
    if (type === 'customer_order') return isDraftLike(current) ? 'confirmed' : null;
    if (type === 'quote') return isDraftLike(current) ? 'approved' : null;
    if (type === 'supplier_ddt') return isDraftLike(current) ? 'received' : null;
    if (type === 'customer_ddt') return isDraftLike(current) ? 'delivered' : null;
    if (type === 'purchase') return isDraftLike(current) ? 'registered' : null;
    if (type === 'invoice') return isDraftLike(current) ? 'issued' : null;
    if (type === 'credit_note') return isDraftLike(current) ? 'issued' : null;
    if (type === 'payment_event') return isDraftLike(current) ? 'registered' : null;
    if (type === 'bank_reconciliation') return isDraftLike(current) ? 'reconciled' : null;
    return null;
  }
  function operationalPatchForAction(task, event) {
    const patch = {
      workflowStatus: event.statusTo,
      approvalStatus: event.statusTo,
      approvalNotes: event.note,
      approvedAt: event.statusTo === 'approved' ? event.createdAt : (task.doc && task.doc.approvedAt) || '',
      approvedBy: event.statusTo === 'approved' ? event.createdBy : (task.doc && task.doc.approvedBy) || '',
      updatedAt: event.createdAt
    };
    if (event.statusTo === 'approved') {
      const operationalStatus = operationalStatusForApproval(task);
      if (operationalStatus) {
        patch.status = operationalStatus;
        patch.stato = operationalStatus;
        patch.operationalStatus = operationalStatus;
        patch.confirmedAt = operationalStatus === 'confirmed' ? event.createdAt : (task.doc && task.doc.confirmedAt) || '';
        patch.confirmedBy = operationalStatus === 'confirmed' ? event.createdBy : (task.doc && task.doc.confirmedBy) || '';
      }
    }
    if (event.statusTo === 'rejected') { patch.status = isOperativeLike(task.doc && task.doc.status) ? task.doc.status : 'rejected'; patch.stato = patch.status; }
    if (event.statusTo === 'blocked') { patch.operationalStatus = 'blocked'; }
    return patch;
  }
  function createWorkflowEvent(task, action, note, user) { const targetStatus = ({ approve:'approved', reject:'rejected', block:'blocked', review:'pending_review', draft:'draft' })[action] || 'pending_review'; return { id: 'wf_' + Date.now() + '_' + Math.random().toString(36).slice(2,8), sourceType: task.sourceType, sourceCollection: task.sourceCollection || SOURCE_COLLECTION[task.sourceType] || '', sourceId: task.sourceId, sourceNumber: task.number || '', subjectName: task.subjectName || '', action, statusFrom: task.workflowStatus || 'pending_review', statusTo: targetStatus, note: str(note), createdAt: nowIso(), createdBy: str(user || (win.currentUser && (win.currentUser.email || win.currentUser.uid)) || 'utente'), version: '0.12.13' }; }
  async function applyAction(task, action, note) { if (!task || !task.sourceId || !task.sourceCollection) throw new Error('Attività workflow non valida.'); const event = createWorkflowEvent(task, action, note); const patch = operationalPatchForAction(task, event); if (typeof win.saveDataToCloud === 'function') { await win.saveDataToCloud('workflowEvents', event, event.id); await win.saveDataToCloud(task.sourceCollection, patch, task.sourceId); } else { win.globalData = win.globalData || {}; win.globalData.workflowEvents = arr(win.globalData.workflowEvents); win.globalData.workflowEvents.push(event); const col = task.sourceCollection; win.globalData[col] = arr(win.globalData[col]); const idx = win.globalData[col].findIndex(x => str(x.id) === str(task.sourceId)); if (idx >= 0) win.globalData[col][idx] = Object.assign({}, win.globalData[col][idx], patch); } return event; }
  function exportRows(tasks) { return arr(tasks).map(t => ({ tipo: t.label, numero: t.number, data: t.date, soggetto: t.subjectName, importo: t.amount, stato: t.statusLabel, azione: t.suggestedAction, sezione: t.targetLabel })); }
  win.WorkflowService = { statuses: STATUS_LABELS, sourceCollection: SOURCE_COLLECTION, buildTasks, applyAction, createWorkflowEvent, exportRows, operationalStatusForApproval, operationalPatchForAction };
})();
