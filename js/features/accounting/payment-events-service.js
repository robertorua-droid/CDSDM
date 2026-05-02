// js/features/accounting/payment-events-service.js
// CDSDM 0.3.1 - Incassi e pagamenti evoluti
// Registro eventi pagamento derivato/compatibile con payments legacy sui documenti.

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
  function iso(v) { return str(v).slice(0, 10); }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function lower(v) { return str(v).toLowerCase(); }
  function uid(prefix) { return (prefix || 'payev') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }

  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }

  function subjectName(x, fallback) {
    return str(x && (x.name || x.ragioneSociale || x.denominazione || x.businessName || x.fullName)) || fallback || 'Soggetto';
  }

  function findById(list, id) {
    return arr(list).find(function (x) { return String(x && x.id) === String(id); });
  }

  function isCreditNote(doc) {
    return !!(doc && (doc.isCreditNote === true || lower(doc.type) === 'nota di credito' || lower(doc.documentType) === 'nota di credito'));
  }

  function getInvoiceTotal(doc) {
    return Math.abs(round2(doc && (doc.nettoDaPagare != null ? doc.nettoDaPagare : (doc.totDoc != null ? doc.totDoc : (doc.total != null ? doc.total : doc.amount)))));
  }

  function getPurchaseTotal(doc) {
    return Math.abs(round2(doc && (doc.totaleDocumento != null ? doc.totaleDocumento : (doc.total != null ? doc.total : (doc.totDoc != null ? doc.totDoc : doc.amount)))));
  }

  function paymentAmount(p) {
    return Math.abs(round2(p && (p.amount != null ? p.amount : (p.importo != null ? p.importo : p.value))));
  }

  function paymentDate(p, fallback) {
    return iso(p && (p.date || p.paymentDate || p.data || p.createdAt)) || iso(fallback) || todayIso();
  }

  function normalizeAllocation(a, fallback) {
    const docType = str(a && (a.documentType || a.entity || a.kind || fallback.documentType));
    const documentId = str(a && (a.documentId || a.docId || a.id || fallback.documentId));
    const amount = round2(a && (a.amount != null ? a.amount : (a.importo != null ? a.importo : fallback.amount)));
    return {
      documentType: docType,
      documentId: documentId,
      amount: Math.abs(amount),
      documentNumber: str(a && (a.documentNumber || a.numero || a.number || fallback.documentNumber)),
      note: str(a && (a.note || a.notes))
    };
  }

  function normalizeEvent(raw) {
    const r = raw || {};
    const type = str(r.type || r.eventType || r.kind || (r.subjectType === 'supplier' ? 'supplier_payment' : 'customer_receipt'));
    const subjectType = str(r.subjectType || (type === 'supplier_payment' ? 'supplier' : 'customer'));
    const allocationsRaw = arr(r.allocations || r.documents || r.rows);
    const allocations = allocationsRaw.map(function (a) { return normalizeAllocation(a, {}); }).filter(function (a) { return a.documentId && a.amount > 0; });
    const totalAlloc = round2(allocations.reduce(function (acc, a) { return acc + num(a.amount); }, 0));
    const amount = Math.abs(round2(r.amount != null ? r.amount : (r.importo != null ? r.importo : totalAlloc)));
    return {
      id: str(r.id) || uid('payev'),
      type: type === 'supplier' ? 'supplier_payment' : (type === 'customer' ? 'customer_receipt' : type),
      subjectType: subjectType === 'supplier' ? 'supplier' : 'customer',
      subjectId: str(r.subjectId || r.customerId || r.supplierId || r.clientId),
      date: iso(r.date || r.paymentDate || r.data) || todayIso(),
      valueDate: iso(r.valueDate || r.valuta) || '',
      amount: amount,
      method: str(r.method || r.paymentMethod || r.metodo),
      reference: str(r.reference || r.riferimento || r.cro || r.transactionId),
      notes: str(r.notes || r.note || r.description),
      allocations: allocations,
      status: str(r.status || 'confermato'),
      source: str(r.source || 'payment-events-0.3.1'),
      createdAt: str(r.createdAt) || new Date().toISOString(),
      updatedAt: str(r.updatedAt) || ''
    };
  }

  function legacyEventsFromDocs(data) {
    const d = data || {};
    const customers = arr(d.customers != null ? d.customers : getDataSafe('customers'));
    const suppliers = arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers'));
    const invoices = arr(d.invoices != null ? d.invoices : getDataSafe('invoices'));
    const purchases = arr(d.purchases != null ? d.purchases : getDataSafe('purchases'));
    const out = [];

    invoices.forEach(function (doc) {
      if (!doc || isCreditNote(doc)) return;
      const subjectId = str(doc.customerId || doc.clientId || doc.customerID);
      const subject = findById(customers, subjectId);
      const documentNumber = str(doc.number || doc.numero || doc.id);
      arr(doc.payments || doc.incassi || doc.pagamenti).forEach(function (p) {
        if (!p || p.cancelled === true || p.deleted === true || p.paymentEventId) return;
        const amount = paymentAmount(p);
        if (!(amount > 0)) return;
        out.push(normalizeEvent({
          id: str(p.id) || ('legacy_invoice_' + str(doc.id) + '_' + paymentDate(p, doc.date) + '_' + amount),
          type: 'customer_receipt', subjectType: 'customer', subjectId: subjectId,
          date: paymentDate(p, doc.date), amount: amount, method: p.method || p.paymentMethod,
          reference: p.reference, notes: p.note || p.notes, source: 'legacy-document-payment',
          allocations: [{ documentType: 'invoice', documentId: str(doc.id), amount: amount, documentNumber: documentNumber }],
          _subjectName: subjectName(subject, 'Cliente')
        }));
      });
    });

    purchases.forEach(function (doc) {
      if (!doc) return;
      const subjectId = str(doc.supplierId || doc.fornitoreId || doc.supplierID);
      const subject = findById(suppliers, subjectId);
      const documentNumber = str(doc.number || doc.numero || doc.id);
      arr(doc.payments || doc.incassi || doc.pagamenti).forEach(function (p) {
        if (!p || p.cancelled === true || p.deleted === true || p.paymentEventId) return;
        const amount = paymentAmount(p);
        if (!(amount > 0)) return;
        out.push(normalizeEvent({
          id: str(p.id) || ('legacy_purchase_' + str(doc.id) + '_' + paymentDate(p, doc.date) + '_' + amount),
          type: 'supplier_payment', subjectType: 'supplier', subjectId: subjectId,
          date: paymentDate(p, doc.date), amount: amount, method: p.method || p.paymentMethod,
          reference: p.reference, notes: p.note || p.notes, source: 'legacy-document-payment',
          allocations: [{ documentType: 'purchase', documentId: str(doc.id), amount: amount, documentNumber: documentNumber }],
          _subjectName: subjectName(subject, 'Fornitore')
        }));
      });
    });
    return out;
  }

  function buildEvents(data, options) {
    const d = data || {};
    const opt = options || {};
    const stored = arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents')).map(normalizeEvent);
    const legacy = opt.includeLegacy === false ? [] : legacyEventsFromDocs(d);
    const all = stored.concat(legacy);
    const seen = {};
    const unique = all.filter(function (e) {
      const key = e.id || [e.type, e.subjectId, e.date, e.amount, JSON.stringify(e.allocations)].join('|');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
    unique.sort(function (a, b) { return str(b.date).localeCompare(str(a.date)) || str(b.createdAt).localeCompare(str(a.createdAt)); });
    return unique;
  }

  function buildOpenDocuments(subjectType, subjectId, data) {
    const d = data || {};
    const invoices = arr(d.invoices != null ? d.invoices : getDataSafe('invoices'));
    const purchases = arr(d.purchases != null ? d.purchases : getDataSafe('purchases'));
    const events = buildEvents(d, { includeLegacy: true });
    const paidByDoc = {};
    events.forEach(function (ev) {
      arr(ev.allocations).forEach(function (a) {
        const key = a.documentType + ':' + a.documentId;
        paidByDoc[key] = round2((paidByDoc[key] || 0) + num(a.amount));
      });
    });
    if (subjectType === 'supplier') {
      return purchases.filter(function (p) { return String(p && (p.supplierId || p.fornitoreId || p.supplierID)) === String(subjectId); }).map(function (p) {
        const total = getPurchaseTotal(p);
        const key = 'purchase:' + str(p.id);
        const paid = round2(paidByDoc[key] || 0);
        return { documentType: 'purchase', documentId: str(p.id), number: str(p.number || p.numero || p.id), date: iso(p.date || p.data || p.documentDate), dueDate: iso(p.dataScadenza || p.dueDate || p.scadenza), total: total, paid: paid, residual: round2(Math.max(0, total - paid)) };
      }).filter(function (x) { return x.residual > 0.005; });
    }
    return invoices.filter(function (i) { return !isCreditNote(i) && String(i && (i.customerId || i.clientId || i.customerID)) === String(subjectId); }).map(function (i) {
      const total = getInvoiceTotal(i);
      const key = 'invoice:' + str(i.id);
      const paid = round2(paidByDoc[key] || 0);
      return { documentType: 'invoice', documentId: str(i.id), number: str(i.number || i.numero || i.id), date: iso(i.date || i.data || i.issueDate), dueDate: iso(i.dataScadenza || i.dueDate || i.scadenza), total: total, paid: paid, residual: round2(Math.max(0, total - paid)) };
    }).filter(function (x) { return x.residual > 0.005; });
  }

  function summarize(events) {
    const list = arr(events);
    const s = { count: list.length, customerReceipts: 0, supplierPayments: 0, balance: 0, allocated: 0, unallocated: 0 };
    list.forEach(function (e) {
      if (e.subjectType === 'supplier') s.supplierPayments += num(e.amount); else s.customerReceipts += num(e.amount);
      const allocated = arr(e.allocations).reduce(function (acc, a) { return acc + num(a.amount); }, 0);
      s.allocated += allocated;
      s.unallocated += Math.max(0, num(e.amount) - allocated);
    });
    s.customerReceipts = round2(s.customerReceipts);
    s.supplierPayments = round2(s.supplierPayments);
    s.allocated = round2(s.allocated);
    s.unallocated = round2(s.unallocated);
    s.balance = round2(s.customerReceipts - s.supplierPayments);
    return s;
  }

  function buildDocumentPatch(doc, kind, event) {
    const base = doc || {};
    const allocations = arr(event.allocations).filter(function (a) { return a.documentType === kind && String(a.documentId) === String(base.id); });
    const amount = round2(allocations.reduce(function (acc, a) { return acc + num(a.amount); }, 0));
    if (!(amount > 0)) return null;
    const prev = arr(base.payments).slice();
    const payment = {
      id: 'pay_' + event.id + '_' + kind + '_' + str(base.id),
      paymentEventId: event.id,
      date: event.date,
      amount: amount,
      method: event.method,
      reference: event.reference,
      note: event.notes,
      source: 'payment-events-0.3.1',
      createdAt: event.createdAt
    };
    const total = kind === 'purchase' ? getPurchaseTotal(base) : getInvoiceTotal(base);
    const paid = round2(prev.reduce(function (acc, p) { return acc + (p && p.cancelled !== true && p.deleted !== true ? paymentAmount(p) : 0); }, 0) + amount);
    const closed = total <= 0 || paid >= total - 0.005;
    return {
      payments: prev.concat([payment]),
      paidAmount: round2(Math.min(paid, Math.max(total, paid))),
      amountPaid: round2(Math.min(paid, Math.max(total, paid))),
      paymentStatus: closed ? 'Pagata' : 'Parziale',
      status: closed ? 'Pagata' : 'Parziale',
      isPaid: closed
    };
  }

  function buildSavePlan(input, data) {
    const ev = normalizeEvent(input || {});
    if (!(ev.amount > 0)) throw new Error('Importo evento non valido.');
    const allocTotal = round2(arr(ev.allocations).reduce(function (acc, a) { return acc + num(a.amount); }, 0));
    if (allocTotal > ev.amount + 0.005) throw new Error('La somma allocata supera l\'importo del movimento.');
    const d = data || {};
    const invoices = arr(d.invoices != null ? d.invoices : getDataSafe('invoices'));
    const purchases = arr(d.purchases != null ? d.purchases : getDataSafe('purchases'));
    const docUpdates = [];
    ev.allocations.forEach(function (a) {
      const collection = a.documentType === 'purchase' ? 'purchases' : 'invoices';
      const doc = a.documentType === 'purchase' ? findById(purchases, a.documentId) : findById(invoices, a.documentId);
      if (!doc) return;
      const patch = buildDocumentPatch(doc, a.documentType, ev);
      if (patch) docUpdates.push({ collection: collection, id: str(doc.id), data: patch });
    });
    return { event: ev, docUpdates: docUpdates };
  }

  win.PaymentEventsService = {
    normalizeEvent: normalizeEvent,
    buildEvents: buildEvents,
    buildOpenDocuments: buildOpenDocuments,
    summarize: summarize,
    buildSavePlan: buildSavePlan,
    _internals: { round2: round2, getInvoiceTotal: getInvoiceTotal, getPurchaseTotal: getPurchaseTotal, legacyEventsFromDocs: legacyEventsFromDocs }
  };
})();
