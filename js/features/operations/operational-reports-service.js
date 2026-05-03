// js/features/operations/operational-reports-service.js
// CDSDM 0.12.10 - Segnalazioni operative: collegamenti guidati, bozze effettive e quarantena.
(function () {
  'use strict';
  const W = window;
  const COLLECTION = 'operationalReports';

  const REPORT_TYPES = {
    quarantine_goods: 'Merce ricevuta messa in quarantena',
    missing_location_product: 'Prodotto non trovato in ubicazione',
    stock_difference: 'Differenza inventariale / giacenza',
    damaged_goods: 'Merce danneggiata',
    non_conforming_goods: 'Merce non conforme',
    supplier_delivery_mismatch: 'Ricezione fornitore non coerente',
    partial_supplier_receipt: 'Ricezione fornitore parziale',
    customer_order_not_fulfillable: 'Ordine cliente non evadibile',
    document_data_missing: 'Dati documento mancanti',
    payment_due_check: 'Scadenza/pagamento da verificare',
    inventory_adjustment_request: 'Richiesta rettifica inventario',
    lot_expiring: 'Lotto in scadenza',
    lot_unknown: 'Lotto non identificato',
    return_to_supplier_check: 'Reso a fornitore da verificare',
    customer_return_check: 'Reso cliente da verificare',
    generic_operational_note: 'Nota operativa generica'
  };
  const AREAS = { warehouse: 'Magazzino', purchases: 'Acquisti', sales: 'Vendite', accounting: 'Contabilità', management: 'Direzione', teaching: 'Didattica' };
  const STATUSES = { draft: 'Bozza', reported: 'Segnalata', assigned: 'Assegnata', in_progress: 'In lavorazione', waiting_info: 'In attesa info', resolved: 'Risolta', closed: 'Chiusa', cancelled: 'Annullata' };
  const SEVERITIES = { low: 'Bassa', medium: 'Media', high: 'Alta', blocking: 'Bloccante' };
  const PRIORITIES = { low: 'Bassa', normal: 'Normale', high: 'Alta', urgent: 'Urgente' };


  const DOCUMENT_TYPES = {
    supplier_order: 'Ordine fornitore',
    supplier_ddt: 'DDT fornitore',
    customer_order: 'Ordine cliente',
    customer_ddt: 'DDT cliente',
    invoice: 'Fattura cliente',
    purchase: 'Acquisto / fattura fornitore',
    product: 'Prodotto',
    other: 'Altro documento'
  };
  const SUPPLIER_ORDER_WORKABLE_STATUSES = ['approved', 'confirmed', 'partially_received', 'open', 'in_progress'];
  const SUPPLIER_ORDER_EXCLUDED_STATUSES = ['draft', 'cancelled', 'deleted', 'rejected', 'not_approved', 'not-approved', 'received', 'closed', 'archived'];
  function docNumber(doc) { return str(doc && (doc.number || doc.numero || doc.code || doc.codice || doc.supplierDocumentNumber || doc.id)); }
  function supplierName(s) { return str(s && (s.name || s.nome || s.ragioneSociale || s.denominazione || s.email || s.id)); }
  function productName(p) { return str(p && ((p.code || p.codice || '') + ((p.code || p.codice) && (p.description || p.descrizione || p.name) ? ' - ' : '') + (p.description || p.descrizione || p.name || p.nome || p.id))); }
  function isSupplierOrderWorkable(order) {
    const status = lower(order && (order.status || order.stato || ''));
    const deleted = !!(order && (order.deleted || order.isDeleted || order.archived));
    if (deleted || SUPPLIER_ORDER_EXCLUDED_STATUSES.indexOf(status) >= 0) return false;
    if (SUPPLIER_ORDER_WORKABLE_STATUSES.indexOf(status) >= 0) return true;
    return !status || status === 'pending_approval' ? false : false;
  }
  function getSuppliers() { return getStoreArray('suppliers'); }
  function getSupplierOrdersForSupplier(supplierId) {
    return getStoreArray('supplierOrders').filter(function (o) {
      return isSupplierOrderWorkable(o) && (!supplierId || String(o.supplierId || o.fornitoreId || '') === String(supplierId));
    }).map(function (o) {
      return { id: str(o.id), number: docNumber(o), supplierId: str(o.supplierId || o.fornitoreId), supplierName: str(o.supplierName || o.fornitoreNome), date: str(o.date || o.data), status: str(o.status || o.stato), raw: o };
    });
  }
  function getSupplierDDTsForSupplier(supplierId) {
    return getStoreArray('supplierDDTs').filter(function (d) {
      const direction = lower(d.ddtDirection || d.direction || d.tipoDDT || 'received_supplier');
      const status = lower(d.status || d.stato || '');
      const deleted = !!(d.deleted || d.isDeleted || d.archived);
      return !deleted && direction !== 'return_supplier' && status !== 'cancelled' && (!supplierId || String(d.supplierId || d.fornitoreId || '') === String(supplierId));
    }).map(function (d) {
      const q = arr(d.lines).reduce(function (s, l) { return s + Number(l.quarantineQty || l.qtyQuarantine || 0); }, 0);
      return { id: str(d.id), number: docNumber(d), supplierId: str(d.supplierId || d.fornitoreId), supplierName: str(d.supplierName || d.fornitoreNome), date: str(d.date || d.data), status: str(d.status || d.stato), quarantineQty: q, raw: d };
    });
  }
  function getLinkableDocuments(type, filters) {
    const f = filters || {};
    if (type === 'supplier_order') return getSupplierOrdersForSupplier(f.supplierId);
    if (type === 'supplier_ddt') return getSupplierDDTsForSupplier(f.supplierId);
    return [];
  }
  function buildPayloadFromLinkedDocument(type, doc) {
    doc = doc || {};
    const raw = doc.raw || doc;
    const supplierId = str(doc.supplierId || raw.supplierId || raw.fornitoreId);
    const supplier = supplierId ? getSuppliers().find(function (s) { return String(s.id) === String(supplierId); }) : null;
    const label = DOCUMENT_TYPES[type] || type || 'Documento collegato';
    const supplierLabel = supplierName(supplier) || doc.supplierName || raw.supplierName || raw.fornitoreNome || '';
    return {
      relatedDocumentType: type,
      relatedDocumentId: str(doc.id || raw.id),
      relatedDocumentNumber: str(doc.number || docNumber(raw)),
      relatedSupplierId: supplierId,
      relatedSupplierName: supplierLabel,
      title: 'Verifica operativa su ' + label + ' ' + (doc.number || docNumber(raw) || ''),
      description: 'Segnalazione collegata a ' + label + (supplierLabel ? ' del fornitore ' + supplierLabel : '') + '.',
      actionRequired: 'Verificare il documento collegato e comunicare l\'esito al reparto destinatario.'
    };
  }
  function buildFromSupplierDDTQuarantine(ddt) {
    ddt = ddt || {};
    const quarantineLines = arr(ddt.lines).filter(function (l) { return Number(l.quarantineQty || l.qtyQuarantine || 0) > 0; });
    const qty = quarantineLines.reduce(function (s, l) { return s + Number(l.quarantineQty || l.qtyQuarantine || 0); }, 0);
    const products = quarantineLines.map(function (l) { return str(l.productCode || l.codice || '') + (l.productDescription || l.description ? ' - ' + str(l.productDescription || l.description) : ''); }).filter(Boolean).join('; ');
    return normalizeReport({
      type: 'quarantine_goods',
      category: 'warehouse',
      severity: qty > 0 ? 'high' : 'medium',
      status: 'draft',
      title: 'Merce ricevuta messa in quarantena',
      description: 'Dal DDT fornitore ' + (docNumber(ddt) || '') + ' risultano quantità in quarantena' + (products ? ': ' + products : '.') ,
      originArea: 'warehouse',
      targetArea: 'purchases',
      assigneeArea: 'purchases',
      relatedSupplierId: str(ddt.supplierId || ddt.fornitoreId),
      relatedSupplierName: str(ddt.supplierName || ddt.fornitoreNome),
      relatedDocumentType: 'supplier_ddt',
      relatedDocumentId: str(ddt.id),
      relatedDocumentNumber: docNumber(ddt),
      actionRequired: 'Verificare con Acquisti la non conformità, contattare il fornitore e decidere reso, sostituzione o sblocco della quarantena.',
      source: 'supplier_ddt_quarantine'
    });
  }

  function arr(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return v == null ? '' : String(v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function nowIso() { return new Date().toISOString(); }
  function todayIso() { return nowIso().slice(0, 10); }
  function esc(v) { return str(v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]); }
  function getCurrentUserName() { return str(W.currentUser && (W.currentUser.displayName || W.currentUser.email || W.currentUser.uid)) || 'utente'; }
  function getCurrentUid() { return str(W.currentUser && W.currentUser.uid); }
  function getStoreArray(key) { if (W.AppStore && typeof W.AppStore.get === 'function') return arr(W.AppStore.get(key)); if (typeof W.getData === 'function') return arr(W.getData(key)); return arr(W.globalData && W.globalData[key]); }
  function putLocal(report) { W.globalData = W.globalData || {}; W.globalData[COLLECTION] = arr(W.globalData[COLLECTION]); const i = W.globalData[COLLECTION].findIndex(r => str(r.id) === str(report.id)); if (i >= 0) W.globalData[COLLECTION][i] = Object.assign({}, W.globalData[COLLECTION][i], report); else W.globalData[COLLECTION].push(report); if (W.AppStore && typeof W.AppStore.set === 'function') W.AppStore.set(COLLECTION, W.globalData[COLLECTION], { silent: true }); }
  function nextId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
  function sequenceNumber(existing, date) { const year = str(date || todayIso()).slice(0, 4) || String(new Date().getFullYear()); const count = arr(existing).filter(r => str(r.code).indexOf('SO-' + year + '-') === 0).length + 1; return 'SO-' + year + '-' + String(count).padStart(4, '0'); }
  function validKey(obj, key, fallback) { const k = str(key || fallback); return Object.prototype.hasOwnProperty.call(obj, k) ? k : fallback; }
  function isClosed(r) { return ['resolved', 'closed', 'cancelled'].indexOf(str(r.status)) >= 0; }
  const WORKFLOW_ACTIONS = {
    send: { status: 'reported', label: 'Invia segnalazione' },
    take_charge: { status: 'assigned', label: 'Prendi in carico' },
    start_work: { status: 'in_progress', label: 'Avvia lavorazione' },
    request_info: { status: 'waiting_info', label: 'Richiedi info' },
    resolve: { status: 'resolved', label: 'Segna come risolta' },
    close: { status: 'closed', label: 'Chiudi' },
    cancel: { status: 'cancelled', label: 'Annulla' }
  };
  const NEXT_ACTIONS_BY_STATUS = {
    draft: ['send', 'cancel'],
    reported: ['take_charge', 'start_work', 'request_info', 'cancel'],
    assigned: ['start_work', 'request_info', 'resolve', 'cancel'],
    in_progress: ['request_info', 'resolve', 'cancel'],
    waiting_info: ['start_work', 'resolve', 'cancel'],
    resolved: ['close'],
    closed: [],
    cancelled: []
  };
  function canWrite() { if (!W.PermissionsPolicy || typeof W.PermissionsPolicy.canWrite !== 'function') return true; return W.PermissionsPolicy.canWrite('operationalReports') || W.PermissionsPolicy.canWrite('workflow'); }
  function canAdmin() { if (!W.PermissionsPolicy || typeof W.PermissionsPolicy.canAdmin !== 'function') return canWrite(); return W.PermissionsPolicy.canAdmin('operationalReports') || W.PermissionsPolicy.canAdmin('workflow') || (W.PermissionsPolicy.isAdmin && W.PermissionsPolicy.isAdmin()); }

  function normalizeReport(input, existing) {
    const src = input || {};
    const now = nowIso();
    const id = str(src.id) || nextId('oprep');
    const createdAt = str(src.createdAt) || now;
    const reportedAt = str(src.reportedAt) || (str(src.status || 'draft') === 'draft' ? '' : now);
    return {
      id,
      code: str(src.code) || sequenceNumber(existing || getStoreArray(COLLECTION), src.createdAt || todayIso()),
      type: validKey(REPORT_TYPES, src.type, 'generic_operational_note'),
      category: validKey(AREAS, src.category || src.originArea, 'warehouse'),
      severity: validKey(SEVERITIES, src.severity, 'medium'),
      status: validKey(STATUSES, src.status, 'draft'),
      priority: validKey(PRIORITIES, src.priority, src.severity === 'blocking' ? 'urgent' : 'normal'),
      title: str(src.title) || REPORT_TYPES[validKey(REPORT_TYPES, src.type, 'generic_operational_note')],
      description: str(src.description),
      originArea: validKey(AREAS, src.originArea || src.category, 'warehouse'),
      targetArea: validKey(AREAS, src.targetArea || src.assigneeArea, 'management'),
      reporterUid: str(src.reporterUid) || getCurrentUid(),
      reporterName: str(src.reporterName) || getCurrentUserName(),
      assigneeUid: str(src.assigneeUid),
      assigneeName: str(src.assigneeName),
      assigneeRole: str(src.assigneeRole),
      assigneeArea: validKey(AREAS, src.assigneeArea || src.targetArea, 'management'),
      relatedProductId: str(src.relatedProductId),
      relatedProductName: str(src.relatedProductName),
      relatedCustomerId: str(src.relatedCustomerId),
      relatedCustomerName: str(src.relatedCustomerName),
      relatedSupplierId: str(src.relatedSupplierId),
      relatedSupplierName: str(src.relatedSupplierName),
      relatedDocumentType: str(src.relatedDocumentType),
      relatedDocumentId: str(src.relatedDocumentId),
      relatedDocumentNumber: str(src.relatedDocumentNumber),
      actionRequired: str(src.actionRequired),
      resolutionNotes: str(src.resolutionNotes),
      createdAt,
      updatedAt: now,
      reportedAt,
      takenInChargeAt: str(src.takenInChargeAt),
      resolvedAt: str(src.resolvedAt),
      closedAt: str(src.closedAt),
      createdBy: str(src.createdBy) || getCurrentUserName(),
      updatedBy: getCurrentUserName(),
      source: str(src.source) || 'manual',
      teachingScenarioId: str(src.teachingScenarioId),
      simulationEventId: str(src.simulationEventId),
      printCount: Number(src.printCount || 0),
      lastPrintedAt: str(src.lastPrintedAt),
      messages: arr(src.messages).map(m => ({ id: str(m.id) || nextId('msg'), createdAt: str(m.createdAt) || now, createdBy: str(m.createdBy) || getCurrentUserName(), area: validKey(AREAS, m.area || src.targetArea, 'management'), message: str(m.message), status: str(m.status || src.status || 'reported') }))
    };
  }

  function filterReports(reports, filters) {
    const f = filters || {};
    let out = arr(reports).slice();
    const status = str(f.status || 'open');
    const area = str(f.area || 'all');
    const severity = str(f.severity || 'all');
    const q = lower(f.search || f.query || '');
    if (status === 'open') out = out.filter(r => !isClosed(r));
    else if (status !== 'all') out = out.filter(r => str(r.status) === status);
    if (area !== 'all') out = out.filter(r => str(r.originArea) === area || str(r.targetArea) === area || str(r.assigneeArea) === area || str(r.category) === area);
    if (severity !== 'all') out = out.filter(r => str(r.severity) === severity);
    if (q) out = out.filter(r => lower([r.code, r.title, r.description, r.reporterName, r.assigneeName, r.relatedProductName, r.relatedCustomerName, r.relatedSupplierName, r.relatedDocumentNumber, r.actionRequired].join(' ')).indexOf(q) >= 0);
    out.sort((a, b) => {
      const sev = { blocking: 4, high: 3, medium: 2, low: 1 };
      const st = { reported: 5, assigned: 4, in_progress: 3, waiting_info: 2, draft: 1, resolved: 0, closed: 0, cancelled: 0 };
      return (st[str(b.status)] || 0) - (st[str(a.status)] || 0) || (sev[str(b.severity)] || 0) - (sev[str(a.severity)] || 0) || str(b.updatedAt || b.createdAt).localeCompare(str(a.updatedAt || a.createdAt));
    });
    return out;
  }

  function summarize(reports) {
    const s = { total: arr(reports).length, open: 0, blocking: 0, byStatus: {}, byArea: {}, bySeverity: {}, closed: 0 };
    arr(reports).forEach(r => { const st = str(r.status || 'reported'); const ar = str(r.targetArea || r.originArea || 'management'); const se = str(r.severity || 'medium'); s.byStatus[st] = (s.byStatus[st] || 0) + 1; s.byArea[ar] = (s.byArea[ar] || 0) + 1; s.bySeverity[se] = (s.bySeverity[se] || 0) + 1; if (!isClosed(r)) s.open++; else s.closed++; if (se === 'blocking' && !isClosed(r)) s.blocking++; });
    return s;
  }

  function list(filters) { const reports = getStoreArray(COLLECTION).map(r => normalizeReport(r, [])); return { reports: filterReports(reports, filters), summary: summarize(reports), all: reports }; }

  async function save(report) {
    if (!canWrite()) throw new Error('Permesso non disponibile per salvare segnalazioni operative.');
    const normalized = normalizeReport(report, getStoreArray(COLLECTION));
    if (typeof W.saveDataToCloud === 'function') await W.saveDataToCloud(COLLECTION, normalized, normalized.id);
    else putLocal(normalized);
    return normalized;
  }

  function appendMessage(report, message, area, status, author) {
    const text = str(message);
    if (!text) return report;
    report.messages = arr(report.messages).concat([{
      id: nextId('msg'),
      createdAt: nowIso(),
      createdBy: str(author) || getCurrentUserName(),
      area: validKey(AREAS, area || report.targetArea, 'management'),
      message: text,
      status: str(status || report.status || 'reported')
    }]);
    return report;
  }

  function applyStatusDates(report, status) {
    const now = nowIso();
    report.updatedAt = now;
    report.updatedBy = getCurrentUserName();
    if (status === 'reported' && !report.reportedAt) report.reportedAt = now;
    if ((status === 'assigned' || status === 'in_progress') && !report.takenInChargeAt) report.takenInChargeAt = now;
    if (status === 'resolved' && !report.resolvedAt) report.resolvedAt = now;
    if (status === 'closed' && !report.closedAt) report.closedAt = now;
    return report;
  }

  async function submitReport(report, mode, initialMessage) {
    if (!canWrite()) throw new Error('Permesso non disponibile per salvare segnalazioni operative.');
    const sendNow = mode === 'send' || str(report && report.status) === 'reported';
    const normalized = normalizeReport(Object.assign({}, report || {}, { status: sendNow ? 'reported' : 'draft' }), getStoreArray(COLLECTION));
    if (sendNow) {
      applyStatusDates(normalized, 'reported');
      appendMessage(normalized, initialMessage || normalized.actionRequired || normalized.description || ('Segnalazione inviata a ' + (AREAS[normalized.targetArea] || normalized.targetArea) + '.'), normalized.targetArea, 'reported');
    }
    return save(normalized);
  }

  async function updateStatus(id, status, note) {
    const current = getStoreArray(COLLECTION).find(r => str(r.id) === str(id));
    if (!current) throw new Error('Segnalazione non trovata.');
    if ((status === 'closed' || status === 'cancelled') && !canAdmin()) throw new Error('Chiusura/annullamento riservati ad admin o responsabili autorizzati.');
    const next = normalizeReport(Object.assign({}, current, { status }), getStoreArray(COLLECTION));
    applyStatusDates(next, status);
    if (note) appendMessage(next, note, next.targetArea, status);
    return save(next);
  }

  async function workflowAction(id, action, note) {
    const def = WORKFLOW_ACTIONS[str(action)];
    if (!def) throw new Error('Azione workflow non riconosciuta.');
    const current = getStoreArray(COLLECTION).find(r => str(r.id) === str(id));
    if (!current) throw new Error('Segnalazione non trovata.');
    const allowed = arr(NEXT_ACTIONS_BY_STATUS[str(current.status || 'draft')]);
    if (allowed.indexOf(action) < 0) throw new Error('Azione non prevista per lo stato corrente.');
    const defaultNote = def.label + ' da ' + getCurrentUserName() + '.';
    return updateStatus(id, def.status, note || defaultNote);
  }

  async function addMessage(id, message, area) {
    const current = getStoreArray(COLLECTION).find(r => str(r.id) === str(id));
    if (!current) throw new Error('Segnalazione non trovata.');
    const next = normalizeReport(current, getStoreArray(COLLECTION));
    appendMessage(next, message, area || next.targetArea, next.status);
    return save(next);
  }

  function buildFromAlert(alert) {
    const a = alert || {};
    const areaMap = { magazzino: 'warehouse', warehouse: 'warehouse', acquisti: 'purchases', purchases: 'purchases', vendite: 'sales', sales: 'sales', contabilita: 'accounting', contabilità: 'accounting', accounting: 'accounting', direzione: 'management', didattica: 'teaching' };
    const area = areaMap[lower(a.area)] || 'management';
    const sevMap = { danger: 'high', warning: 'medium', info: 'low', blocking: 'blocking', high: 'high', medium: 'medium', low: 'low' };
    return normalizeReport({
      source: 'mini-bi-alert',
      status: 'reported',
      type: area === 'warehouse' ? 'inventory_adjustment_request' : 'generic_operational_note',
      category: area,
      originArea: area,
      targetArea: area === 'warehouse' ? 'warehouse' : 'management',
      severity: sevMap[lower(a.severity)] || 'medium',
      title: str(a.message || a.title || 'Alert operativo B.I.'),
      description: str(a.message || a.description || ''),
      actionRequired: str(a.action || 'Verificare la segnalazione e aggiornare lo stato.'),
      relatedDocumentType: str(a.source || 'mini-bi'),
      relatedDocumentId: str(a.id || ''),
      relatedDocumentNumber: str(a.source || '')
    }, getStoreArray(COLLECTION));
  }

  function csvCell(v) { const s = str(v).replace(/\r\n|\r|\n/g, ' '); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function exportRows(reports) { return arr(reports).map(r => ({ codice: r.code, stato: STATUSES[r.status] || r.status, gravita: SEVERITIES[r.severity] || r.severity, origine: AREAS[r.originArea] || r.originArea, destinatario: AREAS[r.targetArea] || r.targetArea, titolo: r.title, referente: r.assigneeName || r.assigneeArea, collegamento: [r.relatedDocumentType, r.relatedDocumentNumber || r.relatedDocumentId, r.relatedProductName].filter(Boolean).join(' '), aggiornata: r.updatedAt })); }
  function toCsv(reports) { const rows = exportRows(reports); const head = ['Codice', 'Stato', 'Gravità', 'Origine', 'Destinatario', 'Titolo', 'Referente', 'Collegamento', 'Aggiornata']; const keys = ['codice', 'stato', 'gravita', 'origine', 'destinatario', 'titolo', 'referente', 'collegamento', 'aggiornata']; return '\ufeff' + [head.join(';')].concat(rows.map(r => keys.map(k => csvCell(r[k])).join(';'))).join('\r\n'); }

  function printableHtml(report) {
    const r = normalizeReport(report || {}, []);
    const messages = arr(r.messages).map(m => '<li><strong>' + esc((m.createdAt || '').slice(0, 16).replace('T', ' ')) + ' · ' + esc(m.createdBy) + ':</strong> ' + esc(m.message) + '</li>').join('') || '<li>Nessuna comunicazione interna.</li>';
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(r.code) + '</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#222}.box{border:1px solid #ccc;padding:14px;margin:12px 0}h1{font-size:22px}.row{display:flex;gap:12px}.row>div{flex:1}.small{font-size:12px;color:#666}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Stampa</button><h1>Segnalazione operativa ' + esc(r.code) + '</h1><p class="small">Documento gestionale didattico/non certificativo generato da CDSDM.</p><div class="row"><div class="box"><strong>Tipo</strong><br>' + esc(REPORT_TYPES[r.type] || r.type) + '</div><div class="box"><strong>Stato</strong><br>' + esc(STATUSES[r.status] || r.status) + '</div><div class="box"><strong>Gravità</strong><br>' + esc(SEVERITIES[r.severity] || r.severity) + '</div></div><div class="box"><h2>' + esc(r.title) + '</h2><p>' + esc(r.description) + '</p><p><strong>Azione richiesta:</strong> ' + esc(r.actionRequired) + '</p></div><div class="row"><div class="box"><strong>Origine</strong><br>' + esc(AREAS[r.originArea] || r.originArea) + '<br>' + esc(r.reporterName) + '</div><div class="box"><strong>Destinatario</strong><br>' + esc(AREAS[r.targetArea] || r.targetArea) + '<br>' + esc(r.assigneeName || r.assigneeArea) + '</div></div><div class="box"><strong>Collegamenti</strong><br>Prodotto: ' + esc(r.relatedProductName || r.relatedProductId || '-') + '<br>Cliente: ' + esc(r.relatedCustomerName || r.relatedCustomerId || '-') + '<br>Fornitore: ' + esc(r.relatedSupplierName || r.relatedSupplierId || '-') + '<br>Documento: ' + esc([r.relatedDocumentType, r.relatedDocumentNumber || r.relatedDocumentId].filter(Boolean).join(' ') || '-') + '</div><div class="box"><strong>Comunicazioni interne</strong><ul>' + messages + '</ul></div><div class="box"><strong>Esito/risoluzione</strong><br>' + esc(r.resolutionNotes || '-') + '</div></body></html>';
  }

  async function markPrinted(id) { const current = getStoreArray(COLLECTION).find(r => str(r.id) === str(id)); if (!current) return null; const next = normalizeReport(Object.assign({}, current, { printCount: Number(current.printCount || 0) + 1, lastPrintedAt: nowIso() }), getStoreArray(COLLECTION)); return save(next); }

  function getNextActions(status) { return arr(NEXT_ACTIONS_BY_STATUS[str(status || 'draft')]); }

  function runQa() {
    const draft = normalizeReport({ id: 'r0', code: 'SO-2026-0000', type: 'quarantine_goods', title: 'Merce in quarantena', severity: 'high', status: 'draft', originArea: 'warehouse', targetArea: 'purchases', description: 'Test', actionRequired: 'Verificare fornitore' }, []);
    const sample = [normalizeReport({ id: 'r1', code: 'SO-2026-0001', type: 'missing_location_product', title: 'Prodotto non trovato', severity: 'high', status: 'reported', originArea: 'warehouse', targetArea: 'purchases', description: 'Test', actionRequired: 'Verificare' }, []), normalizeReport({ id: 'r2', type: 'document_data_missing', severity: 'medium', status: 'closed', originArea: 'accounting', targetArea: 'sales' }, [])];
    appendMessage(draft, 'Comunicazione iniziale a Acquisti', 'purchases', 'reported');
    const listResult = filterReports(sample, { status: 'open', area: 'purchases' });
    const csv = toCsv(sample);
    const fromAlert = buildFromAlert({ severity: 'warning', area: 'magazzino', message: 'Prodotto sotto-scorta', action: 'Controllare riordino' });
    return { passed: listResult.length === 1 && csv.indexOf('SO-2026-0001') >= 0 && fromAlert.source === 'mini-bi-alert' && draft.messages.length === 1 && getNextActions('draft').indexOf('send') >= 0, open: listResult.length, csvLength: csv.length, fromAlertType: fromAlert.type, workflowActions: getNextActions('draft').join(',') };
  }

  W.OperationalReportsService = { COLLECTION, REPORT_TYPES, AREAS, STATUSES, SEVERITIES, PRIORITIES, DOCUMENT_TYPES, SUPPLIER_ORDER_WORKABLE_STATUSES, WORKFLOW_ACTIONS, NEXT_ACTIONS_BY_STATUS, normalizeReport, list, filterReports, summarize, save, submitReport, updateStatus, workflowAction, addMessage, getNextActions, buildFromAlert, buildFromSupplierDDTQuarantine, buildPayloadFromLinkedDocument, getLinkableDocuments, getSupplierOrdersForSupplier, getSupplierDDTsForSupplier, isSupplierOrderWorkable, exportRows, toCsv, printableHtml, markPrinted, runQa, canWrite, canAdmin };
})();
