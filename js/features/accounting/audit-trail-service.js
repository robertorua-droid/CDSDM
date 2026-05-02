// js/features/accounting/audit-trail-service.js
// CDSDM 0.4.3 - Registro attivita / audit trail applicativo
// Nota: audit didattico lato client. Non sostituisce logging server-side o regole Firestore.
(function () {
  'use strict';
  const win = window;
  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function num(v) { const n = Number(String(v == null ? 0 : v).replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  function nowIso() { return new Date().toISOString(); }
  function idOf(x) { return str(x && (x.id || x.docId || x.uid)); }
  function dateOf(x) { return str(x && (x.createdAt || x.updatedAt || x.date || x.data || x.paymentDate || x.valueDate || x.month || x.year)) || nowIso(); }
  function getDataSafe(key) {
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    if (typeof win.getData === 'function') return win.getData(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }
  function readData(data) {
    const d = data || {};
    return {
      auditEvents: arr(d.auditEvents != null ? d.auditEvents : getDataSafe('auditEvents')),
      workflowEvents: arr(d.workflowEvents != null ? d.workflowEvents : getDataSafe('workflowEvents')),
      paymentEvents: arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents')),
      cashbookMovements: arr(d.cashbookMovements != null ? d.cashbookMovements : getDataSafe('cashbookMovements')),
      reminderEvents: arr(d.reminderEvents != null ? d.reminderEvents : getDataSafe('reminderEvents')),
      bankReconciliationEvents: arr(d.bankReconciliationEvents != null ? d.bankReconciliationEvents : getDataSafe('bankReconciliationEvents')),
      businessBudgets: arr(d.businessBudgets != null ? d.businessBudgets : getDataSafe('businessBudgets')),
      warehouseLots: arr(d.warehouseLots != null ? d.warehouseLots : getDataSafe('warehouseLots'))
    };
  }
  function currentUserLabel() {
    return str(win.currentUser && (win.currentUser.email || win.currentUser.displayName || win.currentUser.uid)) || 'utente';
  }
  function normalizeAuditEvent(input) {
    const raw = input && typeof input === 'object' ? input : {};
    return {
      id: str(raw.id) || ('aud_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
      timestamp: str(raw.timestamp || raw.createdAt || raw.date) || nowIso(),
      category: str(raw.category) || 'manuale',
      action: str(raw.action) || 'note',
      entityType: str(raw.entityType || raw.sourceType) || 'generic',
      entityId: str(raw.entityId || raw.sourceId) || '',
      entityLabel: str(raw.entityLabel || raw.sourceNumber || raw.title) || '',
      subjectName: str(raw.subjectName || raw.subject || raw.customerName || raw.supplierName) || '',
      amount: num(raw.amount != null ? raw.amount : raw.importo),
      actor: str(raw.actor || raw.createdBy || raw.user) || currentUserLabel(),
      source: str(raw.source) || 'auditEvents',
      severity: str(raw.severity) || 'info',
      note: str(raw.note || raw.notes || raw.description),
      version: str(raw.version) || '0.4.3'
    };
  }
  function eventFromWorkflow(e) {
    return normalizeAuditEvent({ id: 'wf_' + idOf(e), timestamp: e.createdAt, category: 'workflow', action: e.action || (str(e.statusFrom) + ' > ' + str(e.statusTo)), entityType: e.sourceType, entityId: e.sourceId, entityLabel: e.sourceNumber, subjectName: e.subjectName, actor: e.createdBy, source: 'workflowEvents', severity: e.statusTo === 'blocked' || e.statusTo === 'rejected' ? 'warning' : 'info', note: e.note });
  }
  function eventFromPayment(e) {
    const isSupplier = lower(e.subjectType) === 'supplier' || lower(e.type).indexOf('supplier') >= 0;
    return normalizeAuditEvent({ id: 'pay_' + idOf(e), timestamp: e.createdAt || e.date || e.paymentDate, category: 'pagamenti', action: isSupplier ? 'pagamento fornitore' : 'incasso cliente', entityType: 'paymentEvent', entityId: idOf(e), entityLabel: e.reference || e.method || idOf(e), subjectName: e.subjectName, amount: e.amount, actor: e.createdBy, source: 'paymentEvents', severity: 'info', note: e.notes || e.note });
  }
  function eventFromCashbook(e) {
    return normalizeAuditEvent({ id: 'cash_' + idOf(e), timestamp: e.createdAt || e.date, category: 'prima_nota', action: e.direction === 'in' ? 'entrata manuale' : (e.direction === 'transfer' ? 'giroconto' : 'uscita manuale'), entityType: 'cashbookMovement', entityId: idOf(e), entityLabel: e.reference || e.category, subjectName: e.subjectName, amount: e.amount, actor: e.createdBy, source: 'cashbookMovements', severity: 'info', note: e.description || e.notes });
  }
  function eventFromReminder(e) {
    return normalizeAuditEvent({ id: 'rem_' + idOf(e), timestamp: e.createdAt || e.date, category: 'solleciti', action: 'sollecito registrato', entityType: e.documentType || 'reminder', entityId: e.documentId || idOf(e), entityLabel: e.documentNumber || e.level, subjectName: e.subjectName, amount: e.amount, actor: e.createdBy, source: 'reminderEvents', severity: 'warning', note: e.note || e.message });
  }
  function eventFromReconciliation(e) {
    return normalizeAuditEvent({ id: 'rec_' + idOf(e), timestamp: e.createdAt || e.date || e.valueDate, category: 'riconciliazione', action: 'riconciliazione banca', entityType: 'bankReconciliation', entityId: idOf(e), entityLabel: e.reference || e.documentNumber, subjectName: e.subjectName, amount: e.amount, actor: e.createdBy, source: 'bankReconciliationEvents', severity: 'info', note: e.causal || e.description || e.note });
  }
  function eventFromBudget(e) {
    return normalizeAuditEvent({ id: 'bud_' + idOf(e), timestamp: e.updatedAt || e.createdAt || (e.year ? String(e.year) + '-01-01' : ''), category: 'budget', action: 'budget aggiornato', entityType: 'businessBudget', entityId: idOf(e), entityLabel: e.year || '', actor: e.updatedBy || e.createdBy, source: 'businessBudgets', severity: 'info', note: e.notes || e.note });
  }
  function buildEvents(data, options) {
    const d = readData(data);
    const opts = options || {};
    let events = [];
    events = events.concat(d.auditEvents.map(normalizeAuditEvent));
    events = events.concat(d.workflowEvents.map(eventFromWorkflow));
    events = events.concat(d.paymentEvents.map(eventFromPayment));
    events = events.concat(d.cashbookMovements.map(eventFromCashbook));
    events = events.concat(d.reminderEvents.map(eventFromReminder));
    events = events.concat(d.bankReconciliationEvents.map(eventFromReconciliation));
    events = events.concat(d.businessBudgets.map(eventFromBudget));
    events = applyFilters(dedupe(events), opts.filters || {});
    events.sort((a, b) => str(b.timestamp).localeCompare(str(a.timestamp)) || str(b.id).localeCompare(str(a.id)));
    return { events, summary: summarize(events), sources: summarizeSources(events) };
  }
  function dedupe(events) {
    const seen = new Set();
    return arr(events).filter(e => { const k = e.source + '|' + e.id; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function applyFilters(events, filters) {
    const category = str(filters.category || 'all');
    const source = str(filters.source || 'all');
    const severity = str(filters.severity || 'all');
    const from = str(filters.from || '');
    const to = str(filters.to || '');
    const search = lower(filters.search || '');
    return arr(events).filter(e => {
      const day = str(e.timestamp).slice(0, 10);
      if (category !== 'all' && e.category !== category) return false;
      if (source !== 'all' && e.source !== source) return false;
      if (severity !== 'all' && e.severity !== severity) return false;
      if (from && day && day < from) return false;
      if (to && day && day > to) return false;
      if (search && lower([e.action, e.entityType, e.entityLabel, e.subjectName, e.actor, e.note, e.source].join(' ')).indexOf(search) < 0) return false;
      return true;
    });
  }
  function summarize(events) {
    const s = { total: events.length, warning: 0, info: 0, manuale: 0, workflow: 0, pagamenti: 0, riconciliazione: 0 };
    events.forEach(e => { s[e.severity] = (s[e.severity] || 0) + 1; s[e.category] = (s[e.category] || 0) + 1; });
    return s;
  }
  function summarizeSources(events) {
    const out = {};
    events.forEach(e => { out[e.source] = (out[e.source] || 0) + 1; });
    return out;
  }
  async function logEvent(input) {
    const event = normalizeAuditEvent(Object.assign({}, input || {}, { source: 'auditEvents', timestamp: (input && input.timestamp) || nowIso(), actor: (input && input.actor) || currentUserLabel() }));
    if (typeof win.saveDataToCloud === 'function') {
      await win.saveDataToCloud('auditEvents', event, event.id);
    } else {
      win.globalData = win.globalData || {};
      win.globalData.auditEvents = arr(win.globalData.auditEvents);
      win.globalData.auditEvents.push(event);
    }
    return event;
  }
  function exportRows(events) {
    return arr(events).map(e => ({ data: e.timestamp, categoria: e.category, azione: e.action, entita: e.entityType, riferimento: e.entityLabel || e.entityId, soggetto: e.subjectName, importo: e.amount, utente: e.actor, fonte: e.source, priorita: e.severity, note: e.note }));
  }
  win.AuditTrailService = { normalizeAuditEvent, buildEvents, logEvent, exportRows };
})();
