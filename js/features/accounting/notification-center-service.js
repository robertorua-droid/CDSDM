// js/features/accounting/notification-center-service.js
// CDSDM 0.4.1 - Centro notifiche operativo
// Vista derivata non distruttiva: aggrega alert da scadenze, magazzino, DDT, lotti, QA e riconciliazioni.

(function () {
  'use strict';

  const win = window;

  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function num(v) {
    const n = Number(String(v == null ? 0 : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function parseDate(v) {
    const s = str(v).slice(0, 10);
    if (!s) return null;
    const d = new Date(s + 'T00:00:00');
    return Number.isFinite(d.getTime()) ? d : null;
  }
  function daysBetween(a, b) {
    const da = parseDate(a); const db = parseDate(b);
    if (!da || !db) return null;
    return Math.round((da.getTime() - db.getTime()) / 86400000);
  }
  function addDays(iso, amount) {
    const d = parseDate(iso) || new Date();
    d.setDate(d.getDate() + Number(amount || 0));
    return d.toISOString().slice(0, 10);
  }
  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }
  function subjectName(x, fallback) {
    return str(x && (x.name || x.ragioneSociale || x.denominazione || x.businessName || x.fullName)) || fallback || 'Soggetto';
  }
  function docNumber(x) { return str(x && (x.number || x.numero || x.docNumber || x.id)) || 'n.d.'; }
  function isClosedStatus(v) {
    const s = lower(v);
    return ['chiuso', 'chiusa', 'closed', 'fatturato', 'fatturata', 'pagato', 'pagata', 'completato', 'completata', 'annullato', 'annullata'].indexOf(s) >= 0;
  }
  function severityRank(level) {
    return { danger: 4, warning: 3, info: 2, success: 1 }[level] || 0;
  }
  function uid(prefix, parts) {
    const base = arr(parts).map(str).join('|') || Math.random().toString(36).slice(2, 8);
    let h = 0;
    for (let i = 0; i < base.length; i += 1) h = ((h << 5) - h) + base.charCodeAt(i) | 0;
    return (prefix || 'ntf') + '_' + Math.abs(h);
  }
  function push(list, input) {
    const item = Object.assign({
      id: '',
      category: 'operativo',
      severity: 'info',
      title: 'Notifica',
      message: '',
      target: '',
      targetLabel: '',
      date: todayIso(),
      amount: 0,
      source: 'notification-center-0.4.1',
      action: ''
    }, input || {});
    item.id = item.id || uid('ntf', [item.category, item.title, item.message, item.target, item.date]);
    list.push(item);
  }

  function readData(data) {
    const d = data || {};
    return {
      customers: arr(d.customers != null ? d.customers : getDataSafe('customers')),
      suppliers: arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers')),
      products: arr(d.products != null ? d.products : getDataSafe('products')),
      invoices: arr(d.invoices != null ? d.invoices : getDataSafe('invoices')),
      purchases: arr(d.purchases != null ? d.purchases : getDataSafe('purchases')),
      customerDDTs: arr(d.customerDDTs != null ? d.customerDDTs : getDataSafe('customerDDTs')),
      customerOrders: arr(d.customerOrders != null ? d.customerOrders : getDataSafe('customerOrders')),
      supplierOrders: arr(d.supplierOrders != null ? d.supplierOrders : getDataSafe('supplierOrders')),
      warehouseLots: arr(d.warehouseLots != null ? d.warehouseLots : getDataSafe('warehouseLots')),
      warehouseMovements: arr(d.warehouseMovements != null ? d.warehouseMovements : getDataSafe('warehouseMovements')),
      bankReconciliationEvents: arr(d.bankReconciliationEvents != null ? d.bankReconciliationEvents : getDataSafe('bankReconciliationEvents')),
      paymentEvents: arr(d.paymentEvents != null ? d.paymentEvents : getDataSafe('paymentEvents')),
      cashbookMovements: arr(d.cashbookMovements != null ? d.cashbookMovements : getDataSafe('cashbookMovements')),
      businessBudgets: arr(d.businessBudgets != null ? d.businessBudgets : getDataSafe('businessBudgets'))
    };
  }

  function buildDueNotifications(list, data, options) {
    if (!win.ScadenziarioService || typeof win.ScadenziarioService.buildItems !== 'function') return;
    const today = options.today || todayIso();
    const horizon = Number(options.dueHorizonDays || 15);
    const items = win.ScadenziarioService.buildItems(data, {
      today: today,
      to: addDays(today, horizon),
      filters: { status: 'open' }
    });
    items.forEach(function (it) {
      if (it.isClosed) return;
      const delta = daysBetween(it.date, today);
      const overdue = delta != null && delta < 0;
      const severity = overdue ? 'danger' : (delta != null && delta <= 7 ? 'warning' : 'info');
      push(list, {
        category: 'scadenze',
        severity: severity,
        title: overdue ? 'Scadenza arretrata' : 'Scadenza prossima',
        message: it.kind + ' - ' + it.soggetto + ' - ' + it.doc + ' residuo € ' + round2(it.residualAmount).toFixed(2),
        date: it.date,
        amount: it.residualAmount,
        target: 'scadenziario',
        targetLabel: 'Scadenzario',
        action: overdue ? 'Verificare sollecito o registrazione pagamento.' : 'Pianificare incasso/pagamento.'
      });
    });
  }

  function stockQtyFromProduct(product) {
    return num(product.stockQty != null ? product.stockQty : (product.qty != null ? product.qty : (product.giacenza != null ? product.giacenza : product.quantity)));
  }
  function minStockFromProduct(product) {
    return num(product.minStock != null ? product.minStock : (product.scortaMinima != null ? product.scortaMinima : product.reorderPoint));
  }
  function buildWarehouseNotifications(list, d) {
    d.products.forEach(function (p) {
      if (!p) return;
      const kind = lower(p.kind || p.type || p.category);
      const isService = kind.indexOf('servizio') >= 0 || kind === 'service';
      if (isService) return;
      const min = minStockFromProduct(p);
      if (!(min > 0)) return;
      const qty = stockQtyFromProduct(p);
      if (qty <= min) {
        push(list, {
          category: 'magazzino',
          severity: qty <= 0 ? 'danger' : 'warning',
          title: qty <= 0 ? 'Prodotto esaurito' : 'Prodotto sotto scorta',
          message: (p.name || p.description || p.codice || p.id || 'Prodotto') + ': giacenza ' + qty + ', scorta minima ' + min + '.',
          target: 'magazzino-giacenza-prodotto',
          targetLabel: 'Giacenze',
          action: 'Valutare riordino o verifica inventariale.'
        });
      }
    });
  }

  function buildLotNotifications(list, d, options) {
    const today = options.today || todayIso();
    const horizon = Number(options.expiryHorizonDays || 30);
    d.warehouseLots.forEach(function (lot) {
      if (!lot) return;
      const exp = str(lot.expiryDate || lot.scadenza || lot.expirationDate).slice(0, 10);
      if (!exp) return;
      const delta = daysBetween(exp, today);
      if (delta == null || delta > horizon) return;
      const product = d.products.find(function (p) { return String(p.id) === String(lot.productId); });
      push(list, {
        category: 'lotti',
        severity: delta < 0 ? 'danger' : (delta <= 7 ? 'warning' : 'info'),
        title: delta < 0 ? 'Lotto scaduto' : 'Lotto in scadenza',
        message: (product ? (product.name || product.description || product.id) : 'Prodotto') + ' - lotto/matricola ' + (lot.lotCode || lot.serialNumber || lot.id || 'n.d.') + ' - scadenza ' + exp + '.',
        date: exp,
        target: 'magazzino-lotti',
        targetLabel: 'Lotti',
        action: 'Verificare disponibilità, quarantena o macero/scarto.'
      });
    });
  }

  function buildDdtAndOrderNotifications(list, d) {
    d.customerDDTs.forEach(function (ddt) {
      if (!ddt) return;
      const status = ddt.status || ddt.invoiceStatus || ddt.fatturazioneStato;
      const invoiced = ddt.invoiced === true || ddt.invoiceId || lower(status).indexOf('fatturat') >= 0;
      if (!invoiced && !isClosedStatus(ddt.status)) {
        const cust = d.customers.find(function (c) { return String(c.id) === String(ddt.customerId); });
        push(list, {
          category: 'documenti',
          severity: 'warning',
          title: 'DDT cliente da fatturare',
          message: 'DDT #' + docNumber(ddt) + ' - ' + subjectName(cust, 'Cliente') + '.',
          date: str(ddt.date || ddt.data || ddt.createdAt).slice(0, 10) || todayIso(),
          target: 'fatturazione-ddt-cliente',
          targetLabel: 'Fatturazione DDT',
          action: 'Valutare fatturazione riepilogativa o collegamento fattura.'
        });
      }
    });
    d.customerOrders.forEach(function (o) {
      if (!o || isClosedStatus(o.status)) return;
      push(list, {
        category: 'ordini',
        severity: 'info',
        title: 'Ordine cliente aperto',
        message: 'Ordine cliente #' + docNumber(o) + ' da evadere o monitorare.',
        date: str(o.date || o.data || o.createdAt).slice(0, 10) || todayIso(),
        target: 'ordini-cliente',
        targetLabel: 'Ordini cliente',
        action: 'Verificare evasione, DDT o stato ordine.'
      });
    });
    d.supplierOrders.forEach(function (o) {
      if (!o || isClosedStatus(o.status)) return;
      push(list, {
        category: 'ordini',
        severity: 'info',
        title: 'Ordine fornitore aperto',
        message: 'Ordine fornitore #' + docNumber(o) + ' da ricevere o monitorare.',
        date: str(o.date || o.data || o.createdAt).slice(0, 10) || todayIso(),
        target: 'ordini-fornitore',
        targetLabel: 'Ordini fornitore',
        action: 'Verificare DDT fornitore ricevuto o stato ordine.'
      });
    });
  }

  function buildReconciliationNotifications(list, d) {
    const payments = {};
    d.paymentEvents.forEach(function (ev) { if (ev && ev.id) payments[str(ev.id)] = true; });
    d.bankReconciliationEvents.forEach(function (ev) {
      if (!ev) return;
      const pid = str(ev.paymentEventId || ev.createdPaymentEventId || ev.eventId);
      if (pid && !payments[pid]) {
        push(list, {
          category: 'riconciliazione',
          severity: 'warning',
          title: 'Riconciliazione senza pagamento collegato',
          message: 'La riconciliazione ' + (ev.id || 'n.d.') + ' punta a un paymentEvent non trovato.',
          date: str(ev.bankDate || ev.createdAt).slice(0, 10) || todayIso(),
          target: 'riconciliazione-banca',
          targetLabel: 'Riconciliazione banca',
          action: 'Verificare storico riconciliazione e incassi/pagamenti.'
        });
      }
    });
  }

  function buildQaNotifications(list, d) {
    if (!win.AccountingConsistencyService || typeof win.AccountingConsistencyService.runChecks !== 'function') return;
    const result = win.AccountingConsistencyService.runChecks(d, { includeCashbook: true });
    arr(result.issues).forEach(function (issue) {
      push(list, {
        category: 'qa',
        severity: issue.severity === 'error' ? 'danger' : (issue.severity === 'warning' ? 'warning' : 'info'),
        title: 'QA contabile: ' + (issue.code || 'controllo'),
        message: issue.message || 'Anomalia di coerenza rilevata.',
        target: 'dashboard',
        targetLabel: 'Dashboard / QA',
        action: 'Aprire il controllo di coerenza e verificare i dati collegati.'
      });
    });
  }

  function filterNotifications(items, filters) {
    const f = filters || {};
    const cat = str(f.category || 'all');
    const sev = str(f.severity || 'all');
    const q = lower(f.search || '');
    return arr(items).filter(function (n) {
      if (cat !== 'all' && n.category !== cat) return false;
      if (sev !== 'all' && n.severity !== sev) return false;
      if (q) {
        const hay = lower([n.title, n.message, n.category, n.targetLabel, n.action].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function summarize(items) {
    const s = { total: 0, danger: 0, warning: 0, info: 0, success: 0, byCategory: {} };
    arr(items).forEach(function (n) {
      s.total += 1;
      s[n.severity] = (s[n.severity] || 0) + 1;
      s.byCategory[n.category] = (s.byCategory[n.category] || 0) + 1;
    });
    return s;
  }

  function buildNotifications(data, options) {
    const opt = Object.assign({ dueHorizonDays: 15, expiryHorizonDays: 30, includeQa: true }, options || {});
    const d = readData(data);
    const items = [];
    buildDueNotifications(items, d, opt);
    buildWarehouseNotifications(items, d, opt);
    buildLotNotifications(items, d, opt);
    buildDdtAndOrderNotifications(items, d, opt);
    buildReconciliationNotifications(items, d, opt);
    if (opt.includeQa !== false) buildQaNotifications(items, d, opt);
    items.sort(function (a, b) {
      return severityRank(b.severity) - severityRank(a.severity) || str(a.date).localeCompare(str(b.date)) || str(a.title).localeCompare(str(b.title));
    });
    const filtered = filterNotifications(items, opt.filters || {});
    return { items: filtered, allItems: items, summary: summarize(filtered), allSummary: summarize(items), options: opt };
  }

  win.NotificationCenterService = {
    buildNotifications: buildNotifications,
    summarize: summarize,
    filterNotifications: filterNotifications,
    _private: { readData: readData, daysBetween: daysBetween, addDays: addDays, severityRank: severityRank }
  };
})();
