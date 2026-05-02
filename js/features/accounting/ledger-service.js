// js/features/accounting/ledger-service.js
// CDSDM 0.3.1 - Partitario clienti e fornitori
// Vista derivata da fatture, note di credito, acquisti, paymentEvents 0.3.1 e payments legacy.

(function () {
  'use strict';

  const win = window;

  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function num(v) {
    const n = Number(String(v == null ? 0 : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function iso(v) { return str(v).slice(0, 10); }
  function parseDate(v) {
    const s = iso(v);
    if (!s) return null;
    const d = new Date(s + 'T00:00:00');
    return Number.isFinite(d.getTime()) ? d : null;
  }
  function inRange(date, from, to) {
    const d = parseDate(date);
    if (!d) return true;
    const f = parseDate(from);
    const t = parseDate(to);
    if (f && d < f) return false;
    if (t) { t.setHours(23, 59, 59, 999); if (d > t) return false; }
    return true;
  }
  function arr(v) { return Array.isArray(v) ? v : []; }

  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
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

  function getSubjectName(subject, fallback) {
    return str(subject && (subject.name || subject.ragioneSociale || subject.denominazione || subject.fullName || subject.businessName)) || fallback || 'Soggetto';
  }

  function findById(list, id) {
    return arr(list).find(function (x) { return String(x && x.id) === String(id); });
  }

  function paymentDate(payment, fallback) {
    return iso(payment && (payment.date || payment.paymentDate || payment.data || payment.createdAt)) || iso(fallback);
  }

  function paymentAmount(payment) {
    return Math.abs(round2(payment && (payment.amount != null ? payment.amount : (payment.importo != null ? payment.importo : payment.value))));
  }

  function buildEntries(data, options) {
    const d = data || {};
    const opt = options || {};
    const subjectType = str(opt.subjectType || 'customer');
    const subjectId = str(opt.subjectId || 'all');
    const includeClosed = opt.includeClosed === true;
    const from = opt.from || '';
    const to = opt.to || '';
    const customers = arr(d.customers != null ? d.customers : getDataSafe('customers'));
    const suppliers = arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers'));
    const invoices = arr(d.invoices != null ? d.invoices : getDataSafe('invoices'));
    const purchases = arr(d.purchases != null ? d.purchases : getDataSafe('purchases'));
    const entries = [];

    if (subjectType === 'customer') {
      invoices.forEach(function (docRaw) {
        if (!docRaw) return;
        const doc = (win.DomainNormalizers && typeof win.DomainNormalizers.normalizeInvoiceStatusInfo === 'function')
          ? win.DomainNormalizers.normalizeInvoiceStatusInfo(docRaw)
          : docRaw;
        const sid = str(doc.customerId || doc.clientId || doc.customerID);
        if (!sid || (subjectId !== 'all' && sid !== subjectId)) return;
        const subject = findById(customers, sid);
        const amount = getInvoiceTotal(doc);
        if (!(amount > 0)) return;
        const date = iso(doc.date || doc.data || doc.issueDate || doc.createdAt);
        if (!inRange(date, from, to)) return;
        const credit = isCreditNote(doc);
        entries.push({
          id: 'doc_' + str(doc.id || Math.random()),
          subjectType: 'customer', subjectId: sid, subjectName: getSubjectName(subject, 'Cliente'),
          date: date, sourceDate: date,
          type: credit ? 'Nota di credito cliente' : 'Fattura cliente',
          documentType: credit ? 'creditNote' : 'invoice',
          documentId: doc.id,
          documentNumber: str(doc.number || doc.numero || doc.id),
          description: (credit ? 'Nota di credito' : 'Fattura') + ' #' + str(doc.number || doc.numero || doc.id),
          debit: credit ? 0 : amount,
          credit: credit ? amount : 0,
          source: doc
        });
        arr(doc.payments || doc.paymentEvents || doc.incassi || doc.pagamenti).forEach(function (p) {
          if (!p || p.cancelled === true || p.deleted === true || p.paymentEventId) return;
          const pa = paymentAmount(p);
          if (!(pa > 0)) return;
          const pd = paymentDate(p, date);
          if (!inRange(pd, from, to)) return;
          entries.push({
            id: str(p.id || ('pay_' + doc.id + '_' + pd + '_' + pa)),
            subjectType: 'customer', subjectId: sid, subjectName: getSubjectName(subject, 'Cliente'),
            date: pd, sourceDate: date,
            type: 'Incasso cliente', documentType: 'payment', documentId: doc.id,
            documentNumber: str(doc.number || doc.numero || doc.id),
            description: 'Incasso su fattura #' + str(doc.number || doc.numero || doc.id) + (p.note ? ' - ' + str(p.note) : ''),
            debit: 0, credit: pa, source: p
          });
        });
      });
    }

    if (subjectType === 'supplier') {
      purchases.forEach(function (docRaw) {
        if (!docRaw) return;
        const doc = (win.DomainNormalizers && typeof win.DomainNormalizers.normalizePurchaseInfo === 'function')
          ? win.DomainNormalizers.normalizePurchaseInfo(docRaw)
          : docRaw;
        const sid = str(doc.supplierId || doc.fornitoreId || doc.supplierID);
        if (!sid || (subjectId !== 'all' && sid !== subjectId)) return;
        const subject = findById(suppliers, sid);
        const amount = getPurchaseTotal(doc);
        if (!(amount > 0)) return;
        const date = iso(doc.date || doc.data || doc.documentDate || doc.createdAt);
        if (!inRange(date, from, to)) return;
        const isNegative = num(doc.totaleDocumento != null ? doc.totaleDocumento : doc.total) < 0;
        entries.push({
          id: 'pur_' + str(doc.id || Math.random()),
          subjectType: 'supplier', subjectId: sid, subjectName: getSubjectName(subject, 'Fornitore'),
          date: date, sourceDate: date,
          type: isNegative ? 'Rettifica fornitore' : 'Acquisto fornitore',
          documentType: isNegative ? 'supplierCredit' : 'purchase',
          documentId: doc.id,
          documentNumber: str(doc.number || doc.numero || doc.id),
          description: (isNegative ? 'Rettifica' : 'Acquisto') + ' #' + str(doc.number || doc.numero || doc.id),
          debit: isNegative ? amount : 0,
          credit: isNegative ? 0 : amount,
          source: doc
        });
        arr(doc.payments || doc.paymentEvents || doc.incassi || doc.pagamenti).forEach(function (p) {
          if (!p || p.cancelled === true || p.deleted === true || p.paymentEventId) return;
          const pa = paymentAmount(p);
          if (!(pa > 0)) return;
          const pd = paymentDate(p, date);
          if (!inRange(pd, from, to)) return;
          entries.push({
            id: str(p.id || ('pay_' + doc.id + '_' + pd + '_' + pa)),
            subjectType: 'supplier', subjectId: sid, subjectName: getSubjectName(subject, 'Fornitore'),
            date: pd, sourceDate: date,
            type: 'Pagamento fornitore', documentType: 'payment', documentId: doc.id,
            documentNumber: str(doc.number || doc.numero || doc.id),
            description: 'Pagamento su acquisto #' + str(doc.number || doc.numero || doc.id) + (p.note ? ' - ' + str(p.note) : ''),
            debit: pa, credit: 0, source: p
          });
        });
      });
    }


    // Eventi finanziari 0.3.1: letti dalla collezione opzionale paymentEvents.
    // I mirror dentro doc.payments hanno paymentEventId e sono esclusi sopra per evitare doppi conteggi.
    if (win.PaymentEventsService && typeof win.PaymentEventsService.buildEvents === 'function') {
      const paymentEvents = win.PaymentEventsService.buildEvents({
        customers: customers, suppliers: suppliers, invoices: invoices, purchases: purchases,
        paymentEvents: arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents'))
      }, { includeLegacy: false });
      paymentEvents.forEach(function (ev) {
        if (!ev || ev.status === 'annullato' || ev.deleted === true) return;
        if (subjectType === 'customer' && ev.subjectType !== 'customer') return;
        if (subjectType === 'supplier' && ev.subjectType !== 'supplier') return;
        if (subjectId !== 'all' && String(ev.subjectId) !== String(subjectId)) return;
        if (!inRange(ev.date, from, to)) return;
        const subject = ev.subjectType === 'supplier' ? findById(suppliers, ev.subjectId) : findById(customers, ev.subjectId);
        const label = ev.subjectType === 'supplier' ? 'Pagamento fornitore' : 'Incasso cliente';
        const docs = arr(ev.allocations).map(function (a) { return (a.documentType === 'purchase' ? 'Acq.' : 'Fatt.') + ' #' + str(a.documentNumber || a.documentId); }).join(', ');
        entries.push({
          id: 'payev_' + str(ev.id),
          subjectType: ev.subjectType,
          subjectId: ev.subjectId,
          subjectName: getSubjectName(subject, ev.subjectType === 'supplier' ? 'Fornitore' : 'Cliente'),
          date: ev.date,
          sourceDate: ev.date,
          type: label,
          documentType: 'paymentEvent',
          documentId: ev.id,
          documentNumber: str(ev.reference || ev.id),
          description: label + (docs ? ' - ' + docs : '') + (ev.notes ? ' - ' + str(ev.notes) : ''),
          debit: ev.subjectType === 'supplier' ? ev.amount : 0,
          credit: ev.subjectType === 'customer' ? ev.amount : 0,
          source: ev
        });
      });
    }

    entries.sort(function (a, b) {
      return str(a.date).localeCompare(str(b.date)) || str(a.subjectName).localeCompare(str(b.subjectName)) || str(a.type).localeCompare(str(b.type));
    });

    let running = 0;
    entries.forEach(function (e) {
      const signed = subjectType === 'supplier' ? round2(e.credit - e.debit) : round2(e.debit - e.credit);
      running = round2(running + signed);
      e.signedAmount = signed;
      e.runningBalance = running;
    });

    if (!includeClosed) {
      return entries.filter(function (e) { return true; });
    }
    return entries;
  }

  function summarize(entries, subjectType) {
    const list = arr(entries);
    const s = { count: list.length, debit: 0, credit: 0, balance: 0, openSubjects: 0, subjectBalances: [] };
    const bySubject = {};
    list.forEach(function (e) {
      s.debit += num(e.debit);
      s.credit += num(e.credit);
      const key = e.subjectId || 'unknown';
      if (!bySubject[key]) bySubject[key] = { subjectId: key, subjectName: e.subjectName || 'Soggetto', debit: 0, credit: 0, balance: 0 };
      bySubject[key].debit += num(e.debit);
      bySubject[key].credit += num(e.credit);
    });
    Object.keys(bySubject).forEach(function (key) {
      const row = bySubject[key];
      row.debit = round2(row.debit);
      row.credit = round2(row.credit);
      row.balance = subjectType === 'supplier' ? round2(row.credit - row.debit) : round2(row.debit - row.credit);
      if (Math.abs(row.balance) > 0.005) s.openSubjects += 1;
      s.subjectBalances.push(row);
    });
    s.debit = round2(s.debit);
    s.credit = round2(s.credit);
    s.balance = subjectType === 'supplier' ? round2(s.credit - s.debit) : round2(s.debit - s.credit);
    s.subjectBalances.sort(function (a, b) { return Math.abs(b.balance) - Math.abs(a.balance); });
    return s;
  }

  function buildSubjectOptions(subjectType, data) {
    const d = data || {};
    const list = subjectType === 'supplier'
      ? arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers'))
      : arr(d.customers != null ? d.customers : getDataSafe('customers'));
    return list.map(function (x) { return { id: str(x.id), label: getSubjectName(x, subjectType === 'supplier' ? 'Fornitore' : 'Cliente') }; })
      .filter(function (x) { return !!x.id; })
      .sort(function (a, b) { return a.label.localeCompare(b.label); });
  }

  win.LedgerService = {
    buildEntries: buildEntries,
    summarize: summarize,
    buildSubjectOptions: buildSubjectOptions,
    _internals: { getInvoiceTotal: getInvoiceTotal, getPurchaseTotal: getPurchaseTotal, paymentAmount: paymentAmount, round2: round2 }
  };
})();
