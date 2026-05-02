// js/features/accounting/account-statement-service.js
// CDSDM 0.3.3 - Estratto conto cliente/fornitore
// Vista derivata dal partitario: saldo iniziale, movimenti di periodo e saldo finale.

(function () {
  'use strict';

  const win = window;
  function str(v) { return String(v == null ? '' : v).trim(); }
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
  function arr(v) { return Array.isArray(v) ? v : []; }
  function inPeriod(date, from, to) {
    const d = parseDate(date);
    if (!d) return true;
    const f = parseDate(from);
    const t = parseDate(to);
    if (f && d < f) return false;
    if (t) { t.setHours(23, 59, 59, 999); if (d > t) return false; }
    return true;
  }
  function beforeFrom(date, from) {
    const d = parseDate(date);
    const f = parseDate(from);
    return !!(d && f && d < f);
  }
  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }

  function buildSubjectOptions(subjectType, data) {
    if (win.LedgerService && typeof win.LedgerService.buildSubjectOptions === 'function') {
      return win.LedgerService.buildSubjectOptions(subjectType, data || {});
    }
    return [];
  }

  function signed(entry, subjectType) {
    return subjectType === 'supplier'
      ? round2(num(entry.credit) - num(entry.debit))
      : round2(num(entry.debit) - num(entry.credit));
  }

  function buildStatement(data, options) {
    if (!win.LedgerService || typeof win.LedgerService.buildEntries !== 'function') {
      return { entries: [], summary: { openingBalance: 0, debit: 0, credit: 0, periodBalance: 0, closingBalance: 0, count: 0 } };
    }
    const d = data || {};
    const opt = options || {};
    const subjectType = str(opt.subjectType || 'customer');
    const subjectId = str(opt.subjectId || 'all');
    const from = iso(opt.from || '');
    const to = iso(opt.to || '');
    const text = str(opt.text || '').toLowerCase();

    const all = win.LedgerService.buildEntries({
      customers: arr(d.customers != null ? d.customers : getDataSafe('customers')),
      suppliers: arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers')),
      invoices: arr(d.invoices != null ? d.invoices : getDataSafe('invoices')),
      purchases: arr(d.purchases != null ? d.purchases : getDataSafe('purchases')),
      paymentEvents: arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents'))
    }, { subjectType: subjectType, subjectId: subjectId, includeClosed: true });

    let opening = 0;
    const periodRows = [];
    all.forEach(function (e) {
      const s = signed(e, subjectType);
      if (from && beforeFrom(e.date, from)) {
        opening = round2(opening + s);
        return;
      }
      if (!inPeriod(e.date, from, to)) return;
      if (text) {
        const hay = String([e.subjectName, e.type, e.documentNumber, e.description].join(' ')).toLowerCase();
        if (hay.indexOf(text) < 0) return;
      }
      periodRows.push(Object.assign({}, e));
    });

    let running = opening;
    let debit = 0;
    let credit = 0;
    periodRows.sort(function (a, b) {
      return str(a.date).localeCompare(str(b.date)) || str(a.subjectName).localeCompare(str(b.subjectName)) || str(a.type).localeCompare(str(b.type));
    });
    periodRows.forEach(function (e) {
      debit = round2(debit + num(e.debit));
      credit = round2(credit + num(e.credit));
      running = round2(running + signed(e, subjectType));
      e.statementSignedAmount = signed(e, subjectType);
      e.statementRunningBalance = running;
    });

    return {
      entries: periodRows,
      summary: {
        subjectType: subjectType,
        subjectId: subjectId,
        from: from,
        to: to,
        openingBalance: round2(opening),
        debit: round2(debit),
        credit: round2(credit),
        periodBalance: round2(subjectType === 'supplier' ? credit - debit : debit - credit),
        closingBalance: round2(running),
        count: periodRows.length
      }
    };
  }

  win.AccountStatementService = {
    buildStatement: buildStatement,
    buildSubjectOptions: buildSubjectOptions,
    _internals: { signed: signed, round2: round2 }
  };
})();
