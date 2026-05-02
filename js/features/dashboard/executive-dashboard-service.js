// js/features/dashboard/executive-dashboard-service.js
// CDSDM 0.2.1 - Dashboard Direzionale
// Servizio di calcolo KPI derivati dai dati già presenti in AppStore/globalData.
// Non introduce nuove collezioni Firestore e mantiene compatibilità con dati legacy.

(function () {
  'use strict';

  function arr(key) {
    if (window.AppStore && typeof window.AppStore.get === 'function') {
      const value = window.AppStore.get(key);
      return Array.isArray(value) ? value : [];
    }
    const value = window.globalData && window.globalData[key];
    return Array.isArray(value) ? value : [];
  }

  function num(value) {
    if (typeof window.safeFloat === 'function') return window.safeFloat(value);
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'string') value = value.replace(',', '.');
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function str(value) { return value === null || value === undefined ? '' : String(value); }
  function dateOf(obj) { return str(obj && (obj.date || obj.data || obj.documentDate || obj.createdAt)).slice(0, 10); }
  function inRange(date, start, end) { return !!date && (!start || date >= start) && (!end || date <= end); }
  function periodKey(date, mode) { return mode === 'month' ? str(date).slice(0, 10) : str(date).slice(0, 7); }

  function isCreditNote(doc) {
    const t = str(doc && (doc.type || doc.tipo || doc.documentType)).toLowerCase();
    return t.indexOf('nota') >= 0 || t.indexOf('credito') >= 0 || t === 'credit_note';
  }

  function totalOf(doc) {
    return num(doc && (doc.total != null ? doc.total : (doc.totale != null ? doc.totale : (doc.grandTotal != null ? doc.grandTotal : doc.amount))));
  }

  function isPaid(doc) {
    const status = str(doc && (doc.status || doc.stato || doc.paymentStatus)).toLowerCase();
    if (status.indexOf('pagat') >= 0 || status.indexOf('saldat') >= 0 || status === 'paid') return true;
    const total = totalOf(doc);
    const paid = num(doc && (doc.paidAmount || doc.amountPaid || doc.importoPagato));
    return total > 0 && paid >= total - 0.005;
  }

  function isCancelled(doc) {
    const status = str(doc && (doc.status || doc.stato)).toLowerCase();
    return status.indexOf('annull') >= 0 || status.indexOf('cancel') >= 0;
  }

  function customerNameById(id) {
    const match = arr('customers').find(function (c) { return str(c.id) === str(id); });
    return match ? (match.name || match.ragioneSociale || match.denominazione || ('Cliente #' + id)) : (id ? ('Cliente #' + id) : 'Cliente non indicato');
  }

  function computeInventory(products) {
    let availableValue = 0;
    let quarantineValue = 0;
    let lowStockCount = 0;
    let productCount = 0;
    products.forEach(function (p) {
      const type = str(p.itemType || p.tipoVoce || p.type).toLowerCase();
      const stock = num(p.stockQty != null ? p.stockQty : (p.giacenzaDisponibile != null ? p.giacenzaDisponibile : p.giacenza));
      const quarantine = num(p.quarantineQty != null ? p.quarantineQty : (p.giacenzaQuarantena != null ? p.giacenzaQuarantena : p.quarantine));
      const hasStockFields = p.stockQty != null || p.giacenza != null || p.giacenzaDisponibile != null || p.quarantineQty != null;
      const isProduct = type === 'product' || type === 'prodotto' || hasStockFields;
      if (!isProduct) return;
      const cost = num(p.purchasePrice != null ? p.purchasePrice : (p.prezzoAcquisto != null ? p.prezzoAcquisto : (p.unitCost != null ? p.unitCost : p.costoUnitario)));
      const minStock = num(p.minStockQty != null ? p.minStockQty : (p.scortaMinima != null ? p.scortaMinima : p.minimumStock));
      productCount++;
      availableValue += stock * cost;
      quarantineValue += quarantine * cost;
      if (minStock > 0 && stock <= minStock) lowStockCount++;
    });
    return { productCount, availableValue, quarantineValue, totalValue: availableValue + quarantineValue, lowStockCount };
  }

  function computeOpenCustomerDDTs(ddts) {
    return ddts.filter(function (d) {
      if (!d || isCancelled(d)) return false;
      const status = str(d.status || d.stato).toLowerCase();
      return !d.invoiceId && status.indexOf('invoic') < 0 && status.indexOf('fattur') < 0;
    });
  }

  function computeOpenOrders(orders) {
    return orders.filter(function (o) {
      if (!o || isCancelled(o)) return false;
      const status = str(o.status || o.stato).toLowerCase();
      const closedStatuses = ['fulfilled', 'fulfilled_full', 'evasa', 'evaso', 'completato', 'completata', 'received', 'fully_received', 'ricevuto', 'ricevuta'];
      return closedStatuses.indexOf(status) < 0;
    });
  }

  function computeDashboardSummary(options) {
    options = options || {};
    const start = options.start || '';
    const end = options.end || '';
    const mode = options.mode === 'month' ? 'month' : 'year';

    const invoices = arr('invoices');
    const purchases = arr('purchases');
    const products = arr('products');
    const worklogs = arr('worklogs');
    const customerDDTs = arr('customerDDTs');
    const customerOrders = arr('customerOrders');
    const supplierOrders = arr('supplierOrders');

    const byPeriod = {};
    const byCustomer = {};
    let revenue = 0;
    let creditNotes = 0;
    let openReceivables = 0;
    let overdueReceivables = 0;

    invoices.forEach(function (doc) {
      const d = dateOf(doc);
      if (!inRange(d, start, end) || isCancelled(doc)) return;
      const total = totalOf(doc);
      const sign = isCreditNote(doc) ? -1 : 1;
      if (sign < 0) creditNotes += total;
      revenue += sign * total;

      const key = periodKey(d, mode);
      if (!byPeriod[key]) byPeriod[key] = { key, revenue: 0, purchases: 0, margin: 0 };
      byPeriod[key].revenue += sign * total;

      const customerId = doc.customerId || doc.clienteId || doc.customerName || doc.cliente || '';
      const customerName = doc.customerName || doc.clienteNome || doc.cliente || customerNameById(customerId);
      const ckey = str(customerId || customerName || 'unknown');
      if (!byCustomer[ckey]) byCustomer[ckey] = { name: customerName || 'Cliente non indicato', total: 0 };
      byCustomer[ckey].total += sign * total;

      if (sign > 0 && !isPaid(doc)) {
        const paid = num(doc.paidAmount || doc.amountPaid || doc.importoPagato);
        const residual = Math.max(0, total - paid);
        openReceivables += residual;
        const dueDate = str(doc.dueDate || doc.dataScadenza || doc.scadenza).slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);
        if (dueDate && dueDate < today) overdueReceivables += residual;
      }
    });

    let purchaseTotal = 0;
    let openPayables = 0;
    let overduePayables = 0;
    purchases.forEach(function (doc) {
      const d = dateOf(doc);
      if (!inRange(d, start, end) || isCancelled(doc)) return;
      const total = totalOf(doc);
      purchaseTotal += total;
      const key = periodKey(d, mode);
      if (!byPeriod[key]) byPeriod[key] = { key, revenue: 0, purchases: 0, margin: 0 };
      byPeriod[key].purchases += total;
      if (!isPaid(doc)) {
        const paid = num(doc.paidAmount || doc.amountPaid || doc.importoPagato);
        const residual = Math.max(0, total - paid);
        openPayables += residual;
        const dueDate = str(doc.dueDate || doc.dataScadenza || doc.scadenza).slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);
        if (dueDate && dueDate < today) overduePayables += residual;
      }
    });

    Object.keys(byPeriod).forEach(function (key) { byPeriod[key].margin = byPeriod[key].revenue - byPeriod[key].purchases; });

    let uninvoicedMinutes = 0;
    worklogs.forEach(function (wl) {
      const d = str(wl && wl.date).slice(0, 10);
      if (!inRange(d, start, end)) return;
      if (wl.billable === false || wl.invoiceId) return;
      uninvoicedMinutes += parseInt(wl.minutesFinal != null && wl.minutesFinal !== '' ? wl.minutesFinal : wl.minutes, 10) || 0;
    });

    const inventory = computeInventory(products);
    const openCustomerDDTs = computeOpenCustomerDDTs(customerDDTs);
    const openCustomerOrders = computeOpenOrders(customerOrders);
    const openSupplierOrders = computeOpenOrders(supplierOrders);

    return {
      period: { start, end, mode },
      revenue,
      creditNotes,
      purchases: purchaseTotal,
      estimatedGrossMargin: revenue - purchaseTotal,
      openReceivables,
      overdueReceivables,
      openPayables,
      overduePayables,
      inventory,
      openCustomerDDTs,
      openCustomerOrders,
      openSupplierOrders,
      uninvoicedMinutes,
      byPeriod: Object.keys(byPeriod).sort().map(function (key) { return byPeriod[key]; }),
      topCustomers: Object.keys(byCustomer).map(function (key) { return byCustomer[key]; }).sort(function (a, b) { return b.total - a.total; }).slice(0, 8)
    };
  }

  window.ExecutiveDashboardService = {
    computeDashboardSummary,
    _private: { computeInventory, computeOpenOrders, computeOpenCustomerDDTs }
  };
})();
