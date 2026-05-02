// js/features/warehouse/warehouse-qa-service.js
// Versione 0.2.0: controlli di coerenza operativa e integrità UI senza modifiche ai dati.
(function () {
  'use strict';

  window.WarehouseQAService = window.WarehouseQAService || {};

  function asArray(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return v == null ? '' : String(v); }
  function num(v) {
    const n = parseFloat(str(v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }
  function get(name) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(name) || [];
    if (typeof window.getData === 'function') return window.getData(name) || [];
    return (window.globalData && window.globalData[name]) || [];
  }
  function isPhysical(p) {
    return !!p && (p.type === 'product' || p.itemType === 'product' || p.isPhysical === true || p.trackStock === true || p.kind === 'physical');
  }
  function nearlyZero(v) { return Math.abs(num(v)) <= 0.0001; }
  function byId(collection, id) {
    return asArray(get(collection)).find(function (x) { return str(x && x.id) === str(id); });
  }
  function pushIssue(list, severity, area, id, message, extra) {
    list.push({ severity: severity || 'warning', area: area || 'Generale', id: id || '', message: message || '', extra: extra || null });
  }

  function expectedStock(productId) {
    let stock = 0;
    let quarantine = 0;
    asArray(get('warehouseMovements')).forEach(function (m) {
      if (str(m.productId) !== str(productId)) return;
      const q = num(m.quantity || m.qty);
      switch (str(m.movementType || m.tipoMovimento).toUpperCase()) {
        case 'CARICO': stock += q; break;
        case 'SCARICO': stock -= q; break;
        case 'RETTIFICA': stock += q; break;
        case 'QUARANTENA_IN': quarantine += q; break;
        case 'QUARANTENA_OUT': quarantine -= q; break;
        case 'SCARTO': quarantine -= q; break;
        case 'RESO_FORNITORE': quarantine -= q; break;
      }
    });
    return { stock: stock, quarantine: quarantine };
  }

  function auditInventory() {
    return asArray(get('products')).filter(isPhysical).map(function (p) {
      const ex = expectedStock(p.id);
      const stock = num(p.stockQty || p.giacenzaDisponibile);
      const quarantine = num(p.quarantineQty || p.giacenzaQuarantena);
      return {
        productId: p.id,
        sku: p.sku || p.code || '',
        name: p.name || p.description || '',
        storedStock: stock,
        expectedStock: ex.stock,
        stockDelta: stock - ex.stock,
        storedQuarantine: quarantine,
        expectedQuarantine: ex.quarantine,
        quarantineDelta: quarantine - ex.quarantine
      };
    }).filter(function (r) {
      return !nearlyZero(r.stockDelta) || !nearlyZero(r.quarantineDelta);
    });
  }

  function auditDocumentLinks() {
    const issues = [];
    asArray(get('customerDDTs')).forEach(function (d) {
      if (d.invoiceId && !byId('invoices', d.invoiceId)) {
        pushIssue(issues, 'error', 'DDT cliente', d.id, 'DDT marcato fatturato ma fattura non trovata');
      }
      asArray(d.sourceOrderIds).forEach(function (orderId) {
        if (!byId('customerOrders', orderId)) pushIssue(issues, 'warning', 'DDT cliente', d.id, 'Ordine cliente sorgente non trovato: ' + orderId);
      });
    });
    asArray(get('invoices')).forEach(function (inv) {
      asArray(inv.sourceCustomerDDTIds).forEach(function (id) {
        if (!byId('customerDDTs', id)) pushIssue(issues, 'error', 'Fatture', inv.id, 'Fattura collegata a DDT cliente non trovato: ' + id);
      });
      asArray(inv.sourceTimesheetIds || inv.worklogIds).forEach(function (id) {
        if (!byId('worklogs', id)) pushIssue(issues, 'warning', 'Fatture', inv.id, 'Fattura collegata a timesheet non trovato: ' + id);
      });
    });
    asArray(get('supplierDDTs')).forEach(function (d) {
      asArray(d.sourceOrderIds || d.sourceSupplierOrderIds).forEach(function (orderId) {
        if (!byId('supplierOrders', orderId)) pushIssue(issues, 'warning', 'DDT fornitore', d.id, 'Ordine fornitore sorgente non trovato: ' + orderId);
      });
    });
    return issues;
  }

  function auditOrderResiduals() {
    const issues = [];
    function checkLines(collection, area, orderedKeys, doneKeys) {
      asArray(get(collection)).forEach(function (doc) {
        asArray(doc.lines || doc.rows || doc.items).forEach(function (line, idx) {
          const ordered = num(orderedKeys.map(function (k) { return line[k]; }).find(function (v) { return v != null; }));
          const done = num(doneKeys.map(function (k) { return line[k]; }).find(function (v) { return v != null; }));
          if (done < -0.0001) pushIssue(issues, 'error', area, doc.id, 'Quantità evasa/ricevuta negativa alla riga ' + (idx + 1));
          if (ordered > 0 && done - ordered > 0.0001) pushIssue(issues, 'error', area, doc.id, 'Quantità evasa/ricevuta superiore all’ordinato alla riga ' + (idx + 1));
        });
      });
    }
    checkLines('customerOrders', 'Ordini cliente', ['quantity', 'qty', 'orderedQty'], ['deliveredQty', 'fulfilledQty', 'evadedQty']);
    checkLines('supplierOrders', 'Ordini fornitore', ['quantity', 'qty', 'orderedQty'], ['receivedQty', 'fulfilledQty']);
    return issues;
  }

  function auditNavigation(root) {
    const issues = [];
    const doc = root || document;
    if (!doc || !doc.querySelectorAll) return issues;
    const ids = {};
    doc.querySelectorAll('[id]').forEach(function (el) {
      const id = el.getAttribute('id');
      ids[id] = (ids[id] || 0) + 1;
    });
    Object.keys(ids).forEach(function (id) {
      if (ids[id] > 1) pushIssue(issues, 'error', 'Navigazione', id, 'ID duplicato nel DOM: ' + id);
    });
    doc.querySelectorAll('a[data-target]').forEach(function (a) {
      const target = a.getAttribute('data-target');
      if (target && !doc.getElementById(target)) pushIssue(issues, 'error', 'Navigazione', target, 'Voce menu senza sezione di destinazione: ' + target);
    });
    const sidebar = doc.querySelector('.sidebar');
    if (sidebar && sidebar.querySelector('.content-section')) {
      pushIssue(issues, 'error', 'Navigazione', 'sidebar', 'Una sezione contenuto è stata inserita dentro la sidebar');
    }
    return issues;
  }

  function runFullAudit(options) {
    const opts = options || {};
    const inventory = auditInventory();
    const links = auditDocumentLinks();
    const residuals = auditOrderResiduals();
    const navigation = opts.includeDom === false ? [] : auditNavigation(opts.root || (typeof document !== 'undefined' ? document : null));
    return {
      inventory: inventory,
      links: links,
      residuals: residuals,
      navigation: navigation,
      issueCount: inventory.length + links.length + residuals.length + navigation.length,
      generatedAt: new Date().toISOString(),
      version: '0.2.0'
    };
  }

  window.WarehouseQAService.auditInventory = auditInventory;
  window.WarehouseQAService.auditDocumentLinks = auditDocumentLinks;
  window.WarehouseQAService.auditOrderResiduals = auditOrderResiduals;
  window.WarehouseQAService.auditNavigation = auditNavigation;
  window.WarehouseQAService.runFullAudit = runFullAudit;
})();
