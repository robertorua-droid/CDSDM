// js/features/scadenziario/scadenziario-service.js
// CDSDM 0.3.1 - Scadenzario evoluto clienti/fornitori con paymentEvents

(function () {
  'use strict';

  const win = window;

  function str(v) { return String(v == null ? '' : v).trim(); }
  function num(v) {
    const n = Number(String(v == null ? 0 : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function lower(v) { return str(v).toLowerCase(); }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function parseDate(s) {
    const val = str(s).slice(0, 10);
    if (!val) return null;
    const d = new Date(val + 'T00:00:00');
    return Number.isFinite(d.getTime()) ? d : null;
  }
  function inRange(dateStr, from, to) {
    const d = parseDate(dateStr);
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }
  function isCreditNote(doc) {
    return !!(doc && (doc.isCreditNote === true || lower(doc.type) === 'nota di credito' || lower(doc.documentType) === 'nota di credito'));
  }
  function sumPayments(payments) {
    if (!Array.isArray(payments)) return 0;
    return round2(payments.reduce(function (acc, p) {
      if (!p) return acc;
      if (p.cancelled === true || p.deleted === true || p.paymentEventId) return acc;
      return acc + num(p.amount || p.importo || p.value);
    }, 0));
  }
  function getDocTotal(doc, kind) {
    if (!doc) return 0;
    if (kind === 'invoice') {
      return round2(doc.nettoDaPagare != null ? doc.nettoDaPagare : (doc.totDoc != null ? doc.totDoc : (doc.total != null ? doc.total : doc.amount)));
    }
    return round2(doc.totaleDocumento != null ? doc.totaleDocumento : (doc.total != null ? doc.total : (doc.totDoc != null ? doc.totDoc : doc.amount)));
  }
  function getEventAllocationsAmount(doc) {
    if (!doc || !doc.id) return 0;
    const docType = doc.supplierId || doc.fornitoreId || doc.supplierID ? 'purchase' : 'invoice';
    const events = (win.PaymentEventsService && typeof win.PaymentEventsService.buildEvents === 'function')
      ? win.PaymentEventsService.buildEvents({ paymentEvents: (typeof win.getData === 'function' ? win.getData('paymentEvents') : ((win.globalData && win.globalData.paymentEvents) || [])) }, { includeLegacy: false })
      : [];
    return round2(events.reduce(function (acc, ev) {
      if (!ev || ev.status === 'annullato' || ev.deleted === true) return acc;
      const allocations = Array.isArray(ev.allocations) ? ev.allocations : [];
      return acc + allocations.reduce(function (sub, a) {
        if (String(a.documentType) === docType && String(a.documentId) === String(doc.id)) return sub + num(a.amount);
        return sub;
      }, 0);
    }, 0));
  }

  function getPaidAmount(doc) {
    if (!doc) return 0;
    const explicit = doc.paidAmount != null ? doc.paidAmount : (doc.amountPaid != null ? doc.amountPaid : doc.importoPagato);
    const explicitNum = explicit != null ? num(explicit) : 0;
    const legacy = sumPayments(doc.payments || doc.paymentEvents || doc.incassi || doc.pagamenti);
    const allocated = getEventAllocationsAmount(doc);
    return round2(Math.max(explicitNum, legacy + allocated, allocated));
  }
  function resolvePaymentStatus(doc, kind) {
    const total = getDocTotal(doc, kind);
    const paid = getPaidAmount(doc);
    const status = str(doc && doc.status);
    const isClosed = lower(status) === 'pagata' || lower(status) === 'pagato' || doc.isPaid === true;
    if (isClosed || (total > 0 && paid >= total - 0.005)) return 'Pagata';
    if (paid > 0) return 'Parziale';
    return kind === 'invoice' ? 'Da Incassare' : 'Da Pagare';
  }
  function residualAmount(doc, kind) {
    const total = getDocTotal(doc, kind);
    const paid = getPaidAmount(doc);
    return round2(Math.max(0, total - paid));
  }
  function matchFilter(item, filters) {
    const f = filters || {};
    const type = str(f.type || 'all');
    const status = str(f.status || 'open');
    const subject = lower(f.subject || '');
    if (type !== 'all' && item.entity !== type && item.kindCode !== type) return false;
    if (status === 'open' && item.isClosed) return false;
    if (status === 'overdue' && !item.overdue) return false;
    if (status === 'partial' && item.status !== 'Parziale') return false;
    if (status === 'closed' && !item.isClosed) return false;
    if (subject) {
      const hay = lower([item.soggetto, item.doc, item.kind, item.status].join(' '));
      if (hay.indexOf(subject) === -1) return false;
    }
    return true;
  }

  function buildPaymentPatch(doc, kind, amount, paymentDate, note) {
    const base = doc || {};
    const total = getDocTotal(base, kind);
    const prevPayments = Array.isArray(base.payments) ? base.payments.slice() : [];
    const cleanAmount = round2(amount);
    if (!(cleanAmount > 0)) throw new Error('Importo non valido');
    const prevPaid = getPaidAmount(base);
    const newPaid = round2(prevPaid + cleanAmount);
    const closed = total <= 0 || newPaid >= total - 0.005;
    const event = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      date: str(paymentDate) || todayIso(),
      amount: cleanAmount,
      note: str(note),
      source: 'scadenziario-0.2.2',
      createdAt: new Date().toISOString()
    };
    const status = closed ? 'Pagata' : 'Parziale';
    return {
      payments: prevPayments.concat([event]),
      paidAmount: round2(Math.min(newPaid, Math.max(total, newPaid))),
      amountPaid: round2(Math.min(newPaid, Math.max(total, newPaid))),
      paymentStatus: status,
      status: status,
      isPaid: closed
    };
  }

  function buildItems(data, options) {
    const d = data || {};
    const opt = options || {};
    const from = parseDate(opt.from || '');
    const to = parseDate(opt.to || '');
    if (to) to.setHours(23, 59, 59, 999);
    const today = parseDate(opt.today || todayIso());
    const showIncassi = opt.showIncassi !== false;
    const showPagamenti = opt.showPagamenti !== false;
    const showIVA = opt.showIVA === true;
    const showIvaCrediti = opt.showIvaCrediti === true;
    const customers = Array.isArray(d.customers) ? d.customers : [];
    const suppliers = Array.isArray(d.suppliers) ? d.suppliers : [];
    const invoices = Array.isArray(d.invoices) ? d.invoices : [];
    const purchases = Array.isArray(d.purchases) ? d.purchases : [];
    const items = [];

    if (showIncassi) {
      invoices.forEach(function (invRaw) {
        const inv = (win.DomainNormalizers && typeof win.DomainNormalizers.normalizeInvoiceStatusInfo === 'function')
          ? win.DomainNormalizers.normalizeInvoiceStatusInfo(invRaw)
          : invRaw;
        if (!inv || isCreditNote(inv)) return;
        const due = str(inv.dataScadenza || inv.dueDate || inv.scadenza).slice(0, 10);
        if (!inRange(due, from, to)) return;
        const total = getDocTotal(inv, 'invoice');
        const paid = getPaidAmount(inv);
        const residual = residualAmount(inv, 'invoice');
        const status = resolvePaymentStatus(inv, 'invoice');
        const cust = customers.find(function (c) { return String(c.id) === String(inv.customerId); });
        const isClosed = status === 'Pagata';
        items.push({
          date: due,
          kind: 'Incasso cliente',
          kindCode: 'invoice',
          soggetto: cust ? (cust.name || cust.ragioneSociale || 'Cliente') : 'Cliente',
          doc: 'Fatt. #' + (inv.number || inv.numero || inv.id || ''),
          amount: total,
          paidAmount: paid,
          residualAmount: residual,
          status: status,
          entity: 'invoice',
          id: inv.id,
          isClosed: isClosed,
          overdue: (!isClosed) && today && parseDate(due) && parseDate(due) < today
        });
      });
    }

    if (showPagamenti) {
      purchases.forEach(function (pRaw) {
        const p = (win.DomainNormalizers && typeof win.DomainNormalizers.normalizePurchaseInfo === 'function')
          ? win.DomainNormalizers.normalizePurchaseInfo(pRaw)
          : pRaw;
        if (!p) return;
        const due = str(p.dataScadenza || p.dueDate || p.scadenza).slice(0, 10);
        if (!inRange(due, from, to)) return;
        const total = getDocTotal(p, 'purchase');
        const paid = getPaidAmount(p);
        const residual = residualAmount(p, 'purchase');
        const status = resolvePaymentStatus(p, 'purchase');
        const sup = suppliers.find(function (s) { return String(s.id) === String(p.supplierId); });
        const isClosed = status === 'Pagata';
        items.push({
          date: due,
          kind: 'Pagamento fornitore',
          kindCode: 'purchase',
          soggetto: sup ? (sup.name || sup.ragioneSociale || 'Fornitore') : 'Fornitore',
          doc: 'Acq. #' + (p.number || p.numero || p.id || ''),
          amount: total,
          paidAmount: paid,
          residualAmount: residual,
          status: status,
          entity: 'purchase',
          id: p.id,
          isClosed: isClosed,
          overdue: (!isClosed) && today && parseDate(due) && parseDate(due) < today
        });
      });
    }

    // Le scadenze IVA restano didattiche e vengono calcolate dal render storico per compatibilità.
    // Qui non vengono duplicate: il render può aggiungerle prima del filtro finale se richiesto.
    const filtered = items.filter(function (item) { return matchFilter(item, opt.filters || {}); });
    filtered.sort(function (a, b) { return str(a.date).localeCompare(str(b.date)) || str(a.kind).localeCompare(str(b.kind)); });
    return filtered;
  }

  function summarize(items) {
    const list = Array.isArray(items) ? items : [];
    const summary = {
      count: list.length,
      openCount: 0,
      overdueCount: 0,
      partialCount: 0,
      closedCount: 0,
      customerReceivables: 0,
      supplierPayables: 0,
      totalResidual: 0,
      totalPaid: 0,
      balance: 0
    };
    list.forEach(function (it) {
      const residual = num(it.residualAmount != null ? it.residualAmount : it.amount);
      const paid = num(it.paidAmount);
      if (it.isClosed) summary.closedCount += 1; else summary.openCount += 1;
      if (it.overdue) summary.overdueCount += 1;
      if (it.status === 'Parziale') summary.partialCount += 1;
      if (it.entity === 'invoice') summary.customerReceivables += residual;
      if (it.entity === 'purchase') summary.supplierPayables += residual;
      summary.totalResidual += residual;
      summary.totalPaid += paid;
    });
    summary.customerReceivables = round2(summary.customerReceivables);
    summary.supplierPayables = round2(summary.supplierPayables);
    summary.totalResidual = round2(summary.totalResidual);
    summary.totalPaid = round2(summary.totalPaid);
    summary.balance = round2(summary.customerReceivables - summary.supplierPayables);
    return summary;
  }

  win.ScadenziarioService = {
    buildItems: buildItems,
    summarize: summarize,
    buildPaymentPatch: buildPaymentPatch,
    _internals: { getPaidAmount: getPaidAmount, residualAmount: residualAmount, resolvePaymentStatus: resolvePaymentStatus, inRange: inRange }
  };
})();
