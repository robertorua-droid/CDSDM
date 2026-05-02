// js/features/warehouse/inventory-valuation-service.js
// CDSDM 0.2.3: servizio didattico per valorizzazione magazzino derivata da dati esistenti.
(function () {
  function num(v) {
    const n = parseFloat(String(v == null ? 0 : v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function asArray(v) { return Array.isArray(v) ? v : []; }

  function normalizeProduct(p) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function'
      ? window.DomainNormalizers.normalizeProductInfo(p)
      : (p || {});
  }

  function normalizeSupplierDDT(d) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeSupplierDDT === 'function'
      ? window.DomainNormalizers.normalizeSupplierDDT(d)
      : (d || {});
  }

  function isIncomingSupplierDDT(ddt) {
    const direction = String(ddt.ddtDirection || ddt.direction || '').toLowerCase();
    const status = String(ddt.status || ddt.stato || '').toLowerCase();
    return direction !== 'return_supplier' && status !== 'return_supplier' && status !== 'cancelled' && status !== 'annullato';
  }

  function getLineProductId(line) {
    return String(line.productId || line.prodottoId || line.itemId || '').trim();
  }

  function getLineCost(line) {
    return num(line.price || line.purchasePrice || line.unitCost || line.costoUnitario || line.prezzoAcquisto);
  }

  function getLineQty(line) {
    const accepted = num(line.acceptedQty);
    const quarantine = num(line.quarantineQty);
    const received = num(line.receivedQty || line.qty || line.quantity);
    const traced = accepted + quarantine;
    return traced > 0 ? traced : Math.max(0, received);
  }

  function buildCostIndex(supplierDDTs) {
    const index = {};
    asArray(supplierDDTs).map(normalizeSupplierDDT).filter(isIncomingSupplierDDT).forEach(function (ddt) {
      const date = String(ddt.date || ddt.data || ddt.createdAt || '');
      asArray(ddt.lines).forEach(function (line, lineIndex) {
        const productId = getLineProductId(line);
        const qty = getLineQty(line);
        const cost = getLineCost(line);
        if (!productId || qty <= 0 || cost <= 0) return;
        if (!index[productId]) {
          index[productId] = {
            productId: productId,
            totalQty: 0,
            totalCost: 0,
            weightedAverageCost: 0,
            lastCost: 0,
            lastCostDate: '',
            lastSourceNumber: '',
            samples: 0
          };
        }
        const entry = index[productId];
        entry.totalQty += qty;
        entry.totalCost += qty * cost;
        entry.samples += 1;
        const comparable = date + ' ' + String(ddt.id || '') + ' ' + String(lineIndex).padStart(4, '0');
        const previousComparable = String(entry._lastComparable || '');
        if (!previousComparable || comparable.localeCompare(previousComparable) >= 0) {
          entry.lastCost = cost;
          entry.lastCostDate = date;
          entry.lastSourceNumber = ddt.number || ddt.numero || ddt.supplierDocumentNumber || ddt.id || '';
          entry._lastComparable = comparable;
        }
      });
    });
    Object.keys(index).forEach(function (productId) {
      const e = index[productId];
      e.weightedAverageCost = e.totalQty > 0 ? e.totalCost / e.totalQty : 0;
      delete e._lastComparable;
    });
    return index;
  }

  function resolveCost(product, costInfo, method) {
    const standard = num(product.purchasePrice || product.prezzoAcquisto || product.costoAcquisto);
    const last = num(costInfo && costInfo.lastCost);
    const average = num(costInfo && costInfo.weightedAverageCost);
    let unitCost = standard;
    let source = 'Prezzo anagrafico';
    let fallback = false;

    if (method === 'last') {
      if (last > 0) { unitCost = last; source = 'Ultimo costo DDT fornitore'; }
      else { unitCost = standard; source = 'Fallback prezzo anagrafico'; fallback = true; }
    } else if (method === 'average') {
      if (average > 0) { unitCost = average; source = 'Costo medio ponderato semplificato'; }
      else { unitCost = standard; source = 'Fallback prezzo anagrafico'; fallback = true; }
    } else {
      unitCost = standard;
      source = 'Prezzo anagrafico';
    }

    return {
      method: method || 'standard',
      unitCost: unitCost,
      standardCost: standard,
      lastCost: last,
      averageCost: average,
      costSource: source,
      fallback: fallback,
      hasSupplierCost: last > 0 || average > 0,
      missingCost: unitCost <= 0
    };
  }

  function buildRows(products, options) {
    options = options || {};
    const method = options.method || 'standard';
    const supplierDDTs = options.supplierDDTs || [];
    const costIndex = options.costIndex || buildCostIndex(supplierDDTs);
    return asArray(products).map(normalizeProduct).filter(function (p) { return p.itemType === 'product'; }).map(function (p) {
      const stock = num(p.stockQty);
      const reserved = num(p.reservedQty);
      const net = Math.max(0, stock - reserved);
      const quarantine = num(p.quarantineQty);
      const min = num(p.minStockQty);
      const costInfo = costIndex[String(p.id)] || null;
      const cost = resolveCost(p, costInfo, method);
      const stockValue = stock * cost.unitCost;
      const netValue = net * cost.unitCost;
      const quarantineValue = quarantine * cost.unitCost;
      return {
        product: p,
        productId: String(p.id || ''),
        code: p.code || '',
        description: p.description || '',
        unitOfMeasure: p.unitOfMeasure || 'pz',
        stockQty: stock,
        reservedQty: reserved,
        netQty: net,
        quarantineQty: quarantine,
        purchasePrice: cost.unitCost,
        unitCost: cost.unitCost,
        standardCost: cost.standardCost,
        lastCost: cost.lastCost,
        averageCost: cost.averageCost,
        costMethod: cost.method,
        costSource: cost.costSource,
        costFallback: cost.fallback,
        hasSupplierCost: cost.hasSupplierCost,
        stockValue: stockValue,
        netValue: netValue,
        quarantineValue: quarantineValue,
        totalValue: stockValue + quarantineValue,
        underStock: min > 0 && net < min,
        missingPrice: cost.missingCost && (stock > 0 || quarantine > 0),
        hasStock: stock > 0 || quarantine > 0,
        lastCostDate: costInfo ? costInfo.lastCostDate : '',
        lastSourceNumber: costInfo ? costInfo.lastSourceNumber : '',
        costSamples: costInfo ? costInfo.samples : 0,
        purchasedQtyForAverage: costInfo ? costInfo.totalQty : 0
      };
    });
  }

  function summarize(products, options) {
    const rows = buildRows(products, options || {});
    return rows.reduce(function (acc, row) {
      acc.rows.push(row);
      acc.productCount += 1;
      acc.stockQty += row.stockQty;
      acc.reservedQty += row.reservedQty;
      acc.netQty += row.netQty;
      acc.quarantineQty += row.quarantineQty;
      acc.stockValue += row.stockValue;
      acc.netValue += row.netValue;
      acc.quarantineValue += row.quarantineValue;
      acc.totalValue += row.totalValue;
      if (row.underStock) acc.underStockCount += 1;
      if (row.missingPrice) acc.missingPriceCount += 1;
      if (row.costFallback) acc.fallbackCostCount += 1;
      if (row.hasSupplierCost) acc.supplierCostCount += 1;
      return acc;
    }, {
      rows: [],
      productCount: 0,
      stockQty: 0,
      reservedQty: 0,
      netQty: 0,
      quarantineQty: 0,
      stockValue: 0,
      netValue: 0,
      quarantineValue: 0,
      totalValue: 0,
      underStockCount: 0,
      missingPriceCount: 0,
      fallbackCostCount: 0,
      supplierCostCount: 0
    });
  }

  window.InventoryValuationService = {
    buildCostIndex: buildCostIndex,
    resolveCost: resolveCost,
    buildRows: buildRows,
    summarize: summarize
  };
})();
