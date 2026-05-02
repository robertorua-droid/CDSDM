// js/features/accounting/reminder-service.js
// CDSDM 0.3.4 - Solleciti e promemoria scadenze
// Vista operativa derivata da scadenzario, fatture/acquisti e storico opzionale reminderEvents.

(function () {
  'use strict';
  const win = window;
  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function num(v) { const n = Number(String(v == null ? 0 : v).replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function iso(v) { return str(v).slice(0, 10); }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function uid(prefix) { return (prefix || 'rem') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
  function parseDate(v) { const s = iso(v); if (!s) return null; const d = new Date(s + 'T00:00:00'); return Number.isFinite(d.getTime()) ? d : null; }
  function daysBetween(a, b) { const da = parseDate(a); const db = parseDate(b); if (!da || !db) return 0; return Math.floor((db.getTime() - da.getTime()) / 86400000); }
  function getDataSafe(key) { if (typeof win.getData === 'function') return win.getData(key) || []; if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || []; return (win.globalData && win.globalData[key]) || []; }
  function subjectLabel(x, fallback) { return str(x && (x.name || x.ragioneSociale || x.denominazione || x.businessName || x.fullName)) || fallback || 'Soggetto'; }
  function findById(list, id) { return arr(list).find(function (x) { return String(x && x.id) === String(id); }); }
  function normalizeHistory(raw) {
    const r = raw || {};
    return { id: str(r.id) || uid('rem'), subjectType: str(r.subjectType || r.type || 'customer') === 'supplier' ? 'supplier' : 'customer', subjectId: str(r.subjectId || r.customerId || r.supplierId), documentType: str(r.documentType || r.entity || 'invoice'), documentId: str(r.documentId || r.docId), documentNumber: str(r.documentNumber || r.number || r.numero), date: iso(r.date || r.createdAt) || todayIso(), level: str(r.level || 'primo'), channel: str(r.channel || 'email'), status: str(r.status || 'preparato'), message: str(r.message || r.text || r.body), notes: str(r.notes || r.note), createdAt: str(r.createdAt) || new Date().toISOString(), updatedAt: str(r.updatedAt) || '' };
  }
  function historyForKey(history, subjectType, subjectId, documentType, documentId) {
    return arr(history).map(normalizeHistory).filter(function (h) { return h.subjectType === subjectType && String(h.subjectId) === String(subjectId) && String(h.documentType) === String(documentType) && String(h.documentId) === String(documentId); }).sort(function (a, b) { return str(a.date).localeCompare(str(b.date)); });
  }
  function buildItems(data, options) {
    const d = data || {}; const opt = options || {}; const today = iso(opt.today || todayIso());
    const typeFilter = str(opt.subjectType || 'all'); const levelFilter = str(opt.level || 'all'); const statusFilter = str(opt.status || 'open'); const text = lower(opt.text || '');
    const customers = arr(d.customers != null ? d.customers : getDataSafe('customers')); const suppliers = arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers'));
    const invoices = arr(d.invoices != null ? d.invoices : getDataSafe('invoices')); const purchases = arr(d.purchases != null ? d.purchases : getDataSafe('purchases'));
    const reminderEvents = arr(d.reminderEvents != null ? d.reminderEvents : getDataSafe('reminderEvents'));
    let items = [];
    if (win.ScadenziarioService && typeof win.ScadenziarioService.buildItems === 'function') {
      items = win.ScadenziarioService.buildItems({ customers: customers, suppliers: suppliers, invoices: invoices, purchases: purchases }, { from: '', to: '2999-12-31', today: today, showIncassi: true, showPagamenti: true, filters: { type: 'all', status: statusFilter === 'closed' ? 'closed' : (statusFilter === 'overdue' ? 'overdue' : 'open'), subject: '' } });
    }
    const enriched = items.filter(function (it) { if (!it || it.isClosed) return statusFilter === 'closed'; if (statusFilter === 'overdue' && !it.overdue) return false; if (statusFilter === 'open' && it.isClosed) return false; const subjectType = it.entity === 'purchase' ? 'supplier' : 'customer'; if (typeFilter !== 'all' && typeFilter !== subjectType) return false; return true; }).map(function (it) {
      const subjectType = it.entity === 'purchase' ? 'supplier' : 'customer'; const documentType = it.entity === 'purchase' ? 'purchase' : 'invoice';
      let doc = documentType === 'invoice' ? findById(invoices, it.id) : findById(purchases, it.id);
      const subjectId = str(it.subjectId || (doc && (doc.customerId || doc.supplierId || doc.fornitoreId || doc.clientId)) || '');
      const subject = subjectType === 'supplier' ? findById(suppliers, subjectId) : findById(customers, subjectId);
      const history = historyForKey(reminderEvents, subjectType, subjectId, documentType, it.id);
      const daysLate = Math.max(0, daysBetween(it.date, today));
      const level = daysLate >= 60 ? 'terzo' : (daysLate >= 30 ? 'secondo' : 'primo');
      const lastReminder = history.length ? history[history.length - 1] : null;
      return Object.assign({}, it, { subjectType: subjectType, subjectId: subjectId, subjectName: subjectLabel(subject, it.soggetto || (subjectType === 'supplier' ? 'Fornitore' : 'Cliente')), documentType: documentType, documentId: str(it.id), documentNumber: str((doc && (doc.number || doc.numero)) || it.doc || it.id), dueDate: it.date, daysLate: daysLate, reminderLevel: level, reminderCount: history.length, lastReminderDate: lastReminder ? lastReminder.date : '', lastReminderStatus: lastReminder ? lastReminder.status : '', history: history });
    });
    return enriched.filter(function (it) { if (levelFilter !== 'all' && it.reminderLevel !== levelFilter) return false; if (text) { const hay = lower([it.subjectName, it.documentNumber, it.doc, it.status, it.reminderLevel].join(' ')); if (hay.indexOf(text) < 0) return false; } return true; }).sort(function (a, b) { return (b.daysLate - a.daysLate) || str(a.subjectName).localeCompare(str(b.subjectName)); });
  }
  function summarize(items) { const list = arr(items); const s = { count: list.length, residual: 0, overdueCount: 0, firstLevel: 0, secondLevel: 0, thirdLevel: 0, reminded: 0 }; list.forEach(function (it) { s.residual += num(it.residualAmount != null ? it.residualAmount : it.amount); if (it.overdue) s.overdueCount += 1; if (it.reminderLevel === 'terzo') s.thirdLevel += 1; else if (it.reminderLevel === 'secondo') s.secondLevel += 1; else s.firstLevel += 1; if (it.reminderCount > 0) s.reminded += 1; }); s.residual = round2(s.residual); return s; }
  function buildReminderText(item, options) {
    const it = item || {}; const opt = options || {}; const company = opt.companyInfo || getDataSafe('companyInfo') || {}; const companyName = subjectLabel(company, 'La nostra azienda');
    const kind = it.subjectType === 'supplier' ? 'pagamento' : 'incasso'; const polite = it.subjectType === 'supplier' ? 'le chiediamo di verificare con noi lo stato del documento indicato.' : 'le chiediamo cortesemente di verificare la posizione indicata e comunicarci eventuali difformità.';
    const days = num(it.daysLate); const residual = round2(it.residualAmount != null ? it.residualAmount : it.amount);
    return ['Oggetto: Promemoria scadenza documento ' + str(it.documentNumber || it.doc || it.documentId), '', 'Gentile ' + str(it.subjectName || 'Cliente/Fornitore') + ',', '', 'risulta ancora aperta la scadenza relativa al documento ' + str(it.documentNumber || it.doc || it.documentId) + ', con importo residuo di € ' + residual.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' e data scadenza ' + str(it.dueDate || '-') + (days > 0 ? ' (' + days + ' giorni di ritardo).' : '.'), '', 'Si tratta di un promemoria di livello ' + str(it.reminderLevel || 'primo') + ' per il ciclo ' + kind + '; ' + polite, '', 'Cordiali saluti,', companyName].join('\n');
  }
  function buildReminderEvent(item, message, options) { const it = item || {}; const opt = options || {}; return normalizeHistory({ id: opt.id || uid('rem'), subjectType: it.subjectType, subjectId: it.subjectId, documentType: it.documentType, documentId: it.documentId, documentNumber: it.documentNumber || it.doc, date: opt.date || todayIso(), level: opt.level || it.reminderLevel || 'primo', channel: opt.channel || 'email', status: opt.status || 'preparato', message: message || buildReminderText(it, opt), notes: opt.notes || '', createdAt: new Date().toISOString() }); }
  win.ReminderService = { buildItems: buildItems, summarize: summarize, buildReminderText: buildReminderText, buildReminderEvent: buildReminderEvent, normalizeHistory: normalizeHistory, _internals: { daysBetween: daysBetween, round2: round2, historyForKey: historyForKey } };
})();
