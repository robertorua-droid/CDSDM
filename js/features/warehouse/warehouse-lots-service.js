// js/features/warehouse/warehouse-lots-service.js
// CDSDM 0.2.4: registro didattico lotti / matricole / scadenze con compatibilità legacy.
(function () {
  window.WarehouseLotsService = window.WarehouseLotsService || {};

  function num(v) {
    const n = parseFloat(String(v == null ? 0 : v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function str(v) { return String(v == null ? '' : v); }

  function todayIso() { return new Date().toISOString().slice(0, 10); }

  function daysUntil(dateIso) {
    if (!dateIso) return null;
    const d = new Date(String(dateIso).slice(0, 10) + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    const t = new Date(todayIso() + 'T00:00:00');
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  }

  function normalizeProduct(p) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function'
      ? window.DomainNormalizers.normalizeProductInfo(p)
      : (p || {});
  }

  function normalizeLot(l) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeWarehouseLot === 'function'
      ? window.DomainNormalizers.normalizeWarehouseLot(l)
      : (l || {});
  }

  function productLabel(product) {
    if (!product) return 'Prodotto non trovato';
    return (product.code ? product.code + ' - ' : '') + (product.description || product.name || product.id || 'Prodotto');
  }

  function buildRows(options) {
    const opts = options || {};
    const products = (opts.products || []).map(normalizeProduct);
    const productMap = new Map(products.map(function (p) { return [String(p.id), p]; }));
    const suppliers = opts.suppliers || [];
    const supplierMap = new Map(suppliers.map(function (s) { return [String(s.id), s.name || s.ragioneSociale || s.denominazione || s.email || s.id]; }));
    const explicitLots = (opts.warehouseLots || []).map(normalizeLot).map(function (lot) {
      return Object.assign({}, lot, { sourceType: 'warehouseLots' });
    });

    const derivedLots = [];
    (opts.supplierDDTs || []).forEach(function (ddt) {
      const lines = Array.isArray(ddt.lines) ? ddt.lines : [];
      lines.forEach(function (line, idx) {
        const lotCode = line.lotCode || line.lotto || line.batchCode || line.batch || '';
        const serialNumber = line.serialNumber || line.matricola || line.seriale || '';
        const expiryDate = line.expiryDate || line.scadenza || line.dataScadenza || '';
        if (!lotCode && !serialNumber && !expiryDate) return;
        derivedLots.push(normalizeLot({
          id: 'DDT-' + (ddt.id || ddt.number || 'source') + '-' + idx,
          productId: line.productId,
          lotCode: lotCode,
          serialNumber: serialNumber,
          expiryDate: expiryDate,
          qtyAvailable: num(line.acceptedQty || line.qtyAccepted || line.qty || line.quantity),
          qtyQuarantine: num(line.quarantineQty || line.qtyQuarantine),
          supplierId: ddt.supplierId,
          sourceDocumentId: ddt.id,
          sourceDocumentNumber: ddt.number || ddt.numero || '',
          status: 'active',
          sourceType: 'supplierDDT'
        }));
      });
    });

    return explicitLots.concat(derivedLots).map(function (lot) {
      const product = productMap.get(String(lot.productId)) || null;
      const d = daysUntil(lot.expiryDate);
      const expired = d !== null && d < 0;
      const expiring = d !== null && d >= 0 && d <= 30;
      const type = lot.serialNumber ? 'serial' : (lot.expiryDate ? 'expiry' : 'lot');
      const totalQty = num(lot.qtyAvailable) + num(lot.qtyQuarantine);
      return Object.assign({}, lot, {
        product: product,
        productLabel: productLabel(product),
        trackingMode: product ? product.trackingMode : type,
        type: type,
        qtyTotal: totalQty,
        supplierLabel: supplierMap.get(String(lot.supplierId)) || '',
        sourceLabel: lot.sourceDocumentNumber || lot.sourceDocumentId || (lot.sourceType === 'supplierDDT' ? 'DDT fornitore' : 'Manuale'),
        daysToExpiry: d,
        isExpired: expired,
        isExpiring: expiring,
        computedStatus: expired ? 'expired' : (lot.status || 'active')
      });
    }).sort(function (a, b) {
      const pa = a.productLabel || '';
      const pb = b.productLabel || '';
      if (pa !== pb) return pa.localeCompare(pb);
      return str(a.expiryDate || '9999-12-31').localeCompare(str(b.expiryDate || '9999-12-31')) || str(a.lotCode).localeCompare(str(b.lotCode));
    });
  }

  function summarize(options) {
    const opts = options || {};
    const products = (opts.products || []).map(normalizeProduct);
    const rows = buildRows(opts);
    const trackedProducts = products.filter(function (p) { return p.itemType === 'product' && p.trackingMode && p.trackingMode !== 'none'; }).length;
    return rows.reduce(function (acc, row) {
      if (row.computedStatus === 'active') acc.activeCount += 1;
      if (row.isExpiring) acc.expiringCount += 1;
      if (row.isExpired) acc.expiredCount += 1;
      acc.qtyAvailable += num(row.qtyAvailable);
      acc.qtyQuarantine += num(row.qtyQuarantine);
      return acc;
    }, { rows: rows, trackedProducts: trackedProducts, activeCount: 0, expiringCount: 0, expiredCount: 0, qtyAvailable: 0, qtyQuarantine: 0 });
  }

  function validateLot(lot, product) {
    const p = normalizeProduct(product || {});
    if (!lot || !lot.productId) throw new Error('Seleziona un prodotto tracciato.');
    if (p.trackingMode === 'serial' && !lot.serialNumber) throw new Error('Per i prodotti a matricola indica la matricola.');
    if ((p.trackingMode === 'lot' || p.trackingMode === 'expiry') && !lot.lotCode) throw new Error('Per i prodotti a lotto indica il codice lotto.');
    if ((p.trackingMode === 'expiry' || p.requiresExpiry) && !lot.expiryDate) throw new Error('Per i prodotti con scadenza indica la data di scadenza.');
    if (num(lot.qtyAvailable) < 0 || num(lot.qtyQuarantine) < 0) throw new Error('Le quantità non possono essere negative.');
    if (num(lot.qtyAvailable) + num(lot.qtyQuarantine) <= 0) throw new Error('Indica almeno una quantità disponibile o in quarantena.');
    return true;
  }

  window.WarehouseLotsService.buildRows = buildRows;
  window.WarehouseLotsService.summarize = summarize;
  window.WarehouseLotsService.validateLot = validateLot;
  window.WarehouseLotsService.daysUntil = daysUntil;
})();
