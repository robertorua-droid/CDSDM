// js/features/accounting/cashbook-service.js
// CDSDM 0.3.2 - Prima nota / movimenti finanziari
// Registro finanziario semplificato derivato da paymentEvents + movimenti manuali.

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
  function uid(prefix) { return (prefix || 'cash') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }

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

  function normalizeManualMovement(raw) {
    const r = raw || {};
    const type = lower(r.type || r.movementType || 'expense');
    const direction = (r.direction === 'in' || type === 'income' || type === 'entrata') ? 'in' : (r.direction === 'transfer' || type === 'transfer' || type === 'giroconto' ? 'transfer' : 'out');
    const amount = Math.abs(round2(r.amount != null ? r.amount : (r.importo != null ? r.importo : r.value)));
    return {
      id: str(r.id) || uid('cash'),
      date: iso(r.date || r.data) || todayIso(),
      valueDate: iso(r.valueDate || r.valuta) || '',
      direction: direction,
      type: direction === 'in' ? 'income' : (direction === 'transfer' ? 'transfer' : 'expense'),
      account: str(r.account || r.cassaBanca || r.bank || r.method || 'Cassa/Banca'),
      category: str(r.category || r.categoria || (direction === 'in' ? 'Entrata manuale' : (direction === 'transfer' ? 'Giroconto' : 'Uscita manuale'))),
      amount: amount,
      subjectType: str(r.subjectType || ''),
      subjectId: str(r.subjectId || ''),
      subjectName: str(r.subjectName || ''),
      reference: str(r.reference || r.riferimento || ''),
      description: str(r.description || r.notes || r.note || ''),
      source: str(r.source || 'manual-cashbook'),
      sourceId: str(r.sourceId || ''),
      createdAt: str(r.createdAt) || new Date().toISOString(),
      updatedAt: str(r.updatedAt) || ''
    };
  }

  function paymentEventToMovement(ev, data) {
    const d = data || {};
    const subjectType = ev.subjectType === 'supplier' || ev.type === 'supplier_payment' ? 'supplier' : 'customer';
    const subjectList = subjectType === 'supplier'
      ? arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers'))
      : arr(d.customers != null ? d.customers : getDataSafe('customers'));
    const subject = findById(subjectList, ev.subjectId);
    const direction = subjectType === 'supplier' ? 'out' : 'in';
    const allocRefs = arr(ev.allocations).map(function (a) {
      return str(a.documentNumber || a.documentId || a.documentType) + (a.amount ? ' € ' + round2(a.amount).toFixed(2) : '');
    }).filter(Boolean).join(' · ');
    return {
      id: 'paymentEvent:' + str(ev.id),
      date: iso(ev.date) || todayIso(),
      valueDate: iso(ev.valueDate) || '',
      direction: direction,
      type: subjectType === 'supplier' ? 'supplier_payment' : 'customer_receipt',
      account: str(ev.method || 'Cassa/Banca'),
      category: subjectType === 'supplier' ? 'Pagamento fornitore' : 'Incasso cliente',
      amount: Math.abs(round2(ev.amount)),
      subjectType: subjectType,
      subjectId: str(ev.subjectId),
      subjectName: subjectName(subject, subjectType === 'supplier' ? 'Fornitore' : 'Cliente'),
      reference: str(ev.reference),
      description: str(ev.notes || allocRefs),
      source: 'paymentEvents',
      sourceId: str(ev.id),
      allocations: arr(ev.allocations),
      createdAt: str(ev.createdAt),
      updatedAt: str(ev.updatedAt)
    };
  }

  function buildAutomaticMovements(data, options) {
    const d = data || {};
    const opt = options || {};
    if (!win.PaymentEventsService || typeof win.PaymentEventsService.buildEvents !== 'function') return [];
    const events = win.PaymentEventsService.buildEvents({
      customers: d.customers,
      suppliers: d.suppliers,
      invoices: d.invoices,
      purchases: d.purchases,
      paymentEvents: d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents')
    }, { includeLegacy: opt.includeLegacy !== false });
    return events.map(function (ev) { return paymentEventToMovement(ev, d); });
  }

  function buildMovements(data, filters) {
    const d = data || {};
    const f = filters || {};
    const manual = arr(d.cashbookMovements != null ? d.cashbookMovements : getDataSafe('cashbookMovements')).map(normalizeManualMovement).filter(function (m) { return m.amount > 0; });
    const automatic = buildAutomaticMovements(d, { includeLegacy: true });
    let movements = automatic.concat(manual);

    if (f.direction && f.direction !== 'all') movements = movements.filter(function (m) { return m.direction === f.direction; });
    if (f.account && f.account !== 'all') movements = movements.filter(function (m) { return m.account === f.account; });
    if (f.from) movements = movements.filter(function (m) { return str(m.date) >= str(f.from); });
    if (f.to) movements = movements.filter(function (m) { return str(m.date) <= str(f.to); });
    const q = lower(f.search || '');
    if (q) {
      movements = movements.filter(function (m) {
        return [m.date, m.account, m.category, m.subjectName, m.reference, m.description, m.source].some(function (x) { return lower(x).indexOf(q) >= 0; });
      });
    }

    movements.sort(function (a, b) { return str(a.date).localeCompare(str(b.date)) || str(a.id).localeCompare(str(b.id)); });
    let balance = 0;
    movements = movements.map(function (m) {
      const income = m.direction === 'in' ? round2(m.amount) : 0;
      const expense = m.direction === 'out' ? round2(m.amount) : 0;
      balance = round2(balance + income - expense);
      return Object.assign({}, m, { income: income, expense: expense, balance: balance });
    });
    return movements;
  }

  function summarize(movements) {
    const rows = arr(movements);
    const summary = {
      income: 0,
      expense: 0,
      transfers: 0,
      balance: 0,
      count: rows.length,
      automaticCount: 0,
      manualCount: 0,
      byAccount: {}
    };
    rows.forEach(function (m) {
      const amount = round2(m.amount);
      if (m.direction === 'in') summary.income = round2(summary.income + amount);
      else if (m.direction === 'out') summary.expense = round2(summary.expense + amount);
      else summary.transfers = round2(summary.transfers + amount);
      if (m.source === 'paymentEvents' || str(m.id).indexOf('paymentEvent:') === 0) summary.automaticCount += 1;
      else summary.manualCount += 1;
      const key = str(m.account || 'Cassa/Banca');
      summary.byAccount[key] = summary.byAccount[key] || { account: key, income: 0, expense: 0, balance: 0, count: 0 };
      if (m.direction === 'in') summary.byAccount[key].income = round2(summary.byAccount[key].income + amount);
      else if (m.direction === 'out') summary.byAccount[key].expense = round2(summary.byAccount[key].expense + amount);
      summary.byAccount[key].balance = round2(summary.byAccount[key].income - summary.byAccount[key].expense);
      summary.byAccount[key].count += 1;
    });
    summary.balance = round2(summary.income - summary.expense);
    summary.accounts = Object.keys(summary.byAccount).sort().map(function (k) { return summary.byAccount[k]; });
    return summary;
  }

  function createManualMovement(input) {
    const movement = normalizeManualMovement(Object.assign({}, input || {}, { source: 'manual-cashbook' }));
    if (!(movement.amount > 0)) throw new Error('Importo non valido.');
    if (!movement.date) throw new Error('Data movimento mancante.');
    if (!movement.account) throw new Error('Conto/Cassa/Banca mancante.');
    if (!movement.category) throw new Error('Categoria mancante.');
    return movement;
  }

  function getAccounts(data) {
    const d = data || {};
    const base = ['Cassa', 'Banca', 'Carta', 'PayPal'];
    const manual = arr(d.cashbookMovements != null ? d.cashbookMovements : getDataSafe('cashbookMovements')).map(function (m) { return normalizeManualMovement(m).account; });
    const auto = buildAutomaticMovements(d, { includeLegacy: true }).map(function (m) { return m.account; });
    const set = {};
    base.concat(manual).concat(auto).forEach(function (a) { if (str(a)) set[str(a)] = true; });
    return Object.keys(set).sort();
  }

  win.CashbookService = {
    normalizeManualMovement,
    buildAutomaticMovements,
    buildMovements,
    summarize,
    createManualMovement,
    getAccounts,
    _private: { round2, num, str }
  };
})();
