// js/features/accounting/accounting-consistency-service.js
// CDSDM 0.3.7 - Consolidamento QA e coerenza contabile
// Servizio di verifica trasversale: non persiste dati e non introduce backend custom.

(function () {
  'use strict';

  const win = window;

  function str(v) { return String(v == null ? '' : v).trim(); }
  function num(v) {
    const n = Number(String(v == null ? 0 : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function abs(v) { return Math.abs(round2(v)); }

  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }

  function readData(data) {
    const d = data || {};
    return {
      customers: arr(d.customers != null ? d.customers : getDataSafe('customers')),
      suppliers: arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers')),
      invoices: arr(d.invoices != null ? d.invoices : getDataSafe('invoices')),
      purchases: arr(d.purchases != null ? d.purchases : getDataSafe('purchases')),
      paymentEvents: arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents')),
      cashbookMovements: arr(d.cashbookMovements != null ? d.cashbookMovements : getDataSafe('cashbookMovements')),
      bankReconciliationEvents: arr(d.bankReconciliationEvents != null ? d.bankReconciliationEvents : getDataSafe('bankReconciliationEvents')),
      businessBudgets: arr(d.businessBudgets != null ? d.businessBudgets : getDataSafe('businessBudgets')),
      warehouseLots: arr(d.warehouseLots != null ? d.warehouseLots : getDataSafe('warehouseLots')),
      reminderEvents: arr(d.reminderEvents != null ? d.reminderEvents : getDataSafe('reminderEvents'))
    };
  }

  function severityRank(s) {
    return s === 'error' ? 3 : (s === 'warning' ? 2 : 1);
  }

  function pushIssue(issues, severity, code, message, context) {
    issues.push({
      severity: severity || 'info',
      code: code || 'QA_INFO',
      message: message || '',
      context: context || {}
    });
  }

  function documentKey(type, id) {
    return str(type) + ':' + str(id);
  }

  function allocatedByDocument(events) {
    const map = {};
    arr(events).forEach(function (ev) {
      if (!ev || ev.deleted === true || ev.cancelled === true || ev.status === 'annullato') return;
      arr(ev.allocations).forEach(function (a) {
        const key = documentKey(a.documentType, a.documentId);
        if (!str(a.documentType) || !str(a.documentId)) return;
        map[key] = round2((map[key] || 0) + abs(a.amount));
      });
    });
    return map;
  }

  function legacyPaymentsTotal(doc) {
    return arr(doc && doc.payments).reduce(function (sum, p) {
      if (!p || p.deleted === true || p.cancelled === true || p.paymentEventId) return sum;
      return round2(sum + abs(p.amount != null ? p.amount : (p.importo != null ? p.importo : p.value)));
    }, 0);
  }

  function documentTotal(doc, kind) {
    if (kind === 'purchase') return abs(doc && (doc.totaleDocumento != null ? doc.totaleDocumento : (doc.total != null ? doc.total : (doc.totDoc != null ? doc.totDoc : doc.amount))));
    return abs(doc && (doc.nettoDaPagare != null ? doc.nettoDaPagare : (doc.totDoc != null ? doc.totDoc : (doc.total != null ? doc.total : doc.amount))));
  }

  function isCreditNote(doc) {
    const t = str(doc && (doc.type || doc.documentType)).toLowerCase();
    return !!(doc && (doc.isCreditNote === true || t === 'nota di credito' || t === 'creditnote' || t === 'credit note'));
  }

  function expectedCollections() {
    return [
      'warehouseLots',
      'paymentEvents',
      'cashbookMovements',
      'reminderEvents',
      'bankReconciliationEvents',
      'businessBudgets'
    ];
  }

  function checkOpenDocuments(data, issues) {
    const d = readData(data);
    const allocated = allocatedByDocument(d.paymentEvents);
    d.invoices.forEach(function (doc) {
      if (!doc || isCreditNote(doc)) return;
      const total = documentTotal(doc, 'invoice');
      const paid = round2((allocated[documentKey('invoice', doc.id)] || 0) + legacyPaymentsTotal(doc));
      if (paid - total > 0.01) {
        pushIssue(issues, 'warning', 'INVOICE_OVERPAID', 'Incassi superiori al totale fattura.', { documentType: 'invoice', documentId: doc.id, total: total, paid: paid });
      }
    });
    d.purchases.forEach(function (doc) {
      if (!doc) return;
      const total = documentTotal(doc, 'purchase');
      const paid = round2((allocated[documentKey('purchase', doc.id)] || 0) + legacyPaymentsTotal(doc));
      if (paid - total > 0.01) {
        pushIssue(issues, 'warning', 'PURCHASE_OVERPAID', 'Pagamenti superiori al totale acquisto.', { documentType: 'purchase', documentId: doc.id, total: total, paid: paid });
      }
    });
  }

  function checkPaymentEvents(data, issues) {
    const d = readData(data);
    d.paymentEvents.forEach(function (ev) {
      if (!ev || ev.deleted === true || ev.cancelled === true || ev.status === 'annullato') return;
      const amount = abs(ev.amount);
      const allocated = arr(ev.allocations).reduce(function (sum, a) { return round2(sum + abs(a.amount)); }, 0);
      if (amount <= 0) pushIssue(issues, 'error', 'PAYMENT_EVENT_ZERO', 'Evento pagamento/incasso con importo nullo.', { eventId: ev.id });
      if (allocated - amount > 0.01) pushIssue(issues, 'warning', 'PAYMENT_EVENT_OVERALLOCATED', 'Allocazioni superiori all’importo dell’evento.', { eventId: ev.id, amount: amount, allocated: allocated });
      arr(ev.allocations).forEach(function (a) {
        if (!str(a.documentType) || !str(a.documentId)) pushIssue(issues, 'warning', 'PAYMENT_ALLOCATION_INCOMPLETE', 'Allocazione incompleta su evento pagamento/incasso.', { eventId: ev.id });
      });
    });
  }

  function checkCashbook(data, issues) {
    const d = readData(data);
    if (!win.CashbookService || typeof win.CashbookService.buildMovements !== 'function') return;
    const movements = win.CashbookService.buildMovements(d, {});
    const automaticIds = {};
    movements.forEach(function (m) {
      if (str(m.id).indexOf('paymentEvent:') === 0) automaticIds[str(m.sourceId || '').trim()] = true;
    });
    d.paymentEvents.forEach(function (ev) {
      if (!ev || ev.deleted === true || ev.cancelled === true || ev.status === 'annullato') return;
      if (!automaticIds[str(ev.id)]) {
        pushIssue(issues, 'warning', 'PAYMENT_EVENT_NOT_IN_CASHBOOK', 'Evento pagamento/incasso non risulta tra i movimenti automatici di prima nota.', { eventId: ev.id });
      }
    });
  }

  function checkReconciliations(data, issues) {
    const d = readData(data);
    const payments = {};
    d.paymentEvents.forEach(function (ev) { if (ev && ev.id) payments[str(ev.id)] = true; });
    d.bankReconciliationEvents.forEach(function (ev) {
      if (!ev) return;
      const paymentEventId = str(ev.paymentEventId || ev.createdPaymentEventId || ev.eventId);
      if (paymentEventId && !payments[paymentEventId]) {
        pushIssue(issues, 'warning', 'RECONCILIATION_PAYMENT_MISSING', 'Riconciliazione collegata a un paymentEvent non trovato.', { reconciliationId: ev.id, paymentEventId: paymentEventId });
      }
    });
  }

  function checkCollectionsShape(data, issues) {
    const d = readData(data);
    expectedCollections().forEach(function (key) {
      if (!Array.isArray(d[key])) pushIssue(issues, 'error', 'COLLECTION_NOT_ARRAY', 'Collezione applicativa non inizializzata come array.', { key: key });
    });
  }

  function runChecks(data, options) {
    const opt = options || {};
    const issues = [];
    checkCollectionsShape(data, issues);
    checkPaymentEvents(data, issues);
    checkOpenDocuments(data, issues);
    if (opt.includeCashbook !== false) checkCashbook(data, issues);
    checkReconciliations(data, issues);

    const summary = { ok: true, errors: 0, warnings: 0, info: 0, issueCount: issues.length };
    issues.forEach(function (i) {
      if (i.severity === 'error') summary.errors += 1;
      else if (i.severity === 'warning') summary.warnings += 1;
      else summary.info += 1;
    });
    summary.ok = summary.errors === 0;
    issues.sort(function (a, b) { return severityRank(b.severity) - severityRank(a.severity) || str(a.code).localeCompare(str(b.code)); });
    return { summary: summary, issues: issues };
  }

  win.AccountingConsistencyService = {
    expectedCollections: expectedCollections,
    runChecks: runChecks,
    allocatedByDocument: allocatedByDocument
  };
})();
