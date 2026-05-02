// js/features/warehouse/warehouse-module.js
// Step 3: motore movimenti magazzino + inventario valorizzato con filtri ed export CSV.
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.warehouse = window.AppModules.warehouse || {};

  const MOVEMENT_LABELS = {
    CARICO: 'Carico',
    SCARICO: 'Scarico',
    RETTIFICA: 'Rettifica',
    QUARANTENA_IN: 'In quarantena',
    QUARANTENA_OUT: 'Da quarantena',
    SCARTO: 'Scarto',
    RESO_FORNITORE: 'Reso fornitore'
  };

  function esc(v) {
    if (window.VatRateCatalog && typeof window.VatRateCatalog.escapeHtml === 'function') return window.VatRateCatalog.escapeHtml(v);
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; });
  }

  function num(v) {
    const n = parseFloat(String(v == null ? 0 : v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function fmtQty(v) {
    const n = num(v);
    return n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }

  function fmtMoney(v) {
    return '€ ' + num(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(v) {
    if (!v) return '-';
    const parts = String(v).slice(0, 10).split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : String(v);
  }

  function emptyState(title, hint) {
    return '<div class="warehouse-empty-state"><i class="fas fa-circle-info mb-2"></i><span class="empty-title">'+esc(title)+'</span><span class="empty-hint">'+esc(hint || '')+'</span></div>';
  }

  function getStoreArray(key) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    if (typeof window.getData === 'function') return window.getData(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }

  function normalizeProduct(p) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function'
      ? window.DomainNormalizers.normalizeProductInfo(p)
      : (p || {});
  }

  function normalizeMovement(m) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeWarehouseMovement === 'function'
      ? window.DomainNormalizers.normalizeWarehouseMovement(m)
      : (m || {});
  }

  function getProducts() {
    return getStoreArray('products').map(normalizeProduct).filter(function (p) { return p.itemType === 'product'; });
  }

  function getSuppliers() {
    return getStoreArray('suppliers') || [];
  }

  function supplierLabel(s) {
    return s.name || s.nome || s.ragioneSociale || s.denominazione || s.email || ('Fornitore ' + s.id);
  }

  function getMovements() {
    return getStoreArray('warehouseMovements').map(normalizeMovement).sort(function (a, b) {
      const da = String(a.date || '') + ' ' + String(a.createdAt || '') + ' ' + String(a.id || '');
      const db = String(b.date || '') + ' ' + String(b.createdAt || '') + ' ' + String(b.id || '');
      return db.localeCompare(da);
    });
  }

  function findRawProduct(productId) {
    const products = getStoreArray('products');
    return products.find(function (p) { return String(p.id) === String(productId); }) || null;
  }

  function isUnderStock(product) {
    const min = num(product.minStockQty);
    const net = Math.max(0, num(product.stockQty) - num(product.reservedQty));
    return min > 0 && net < min;
  }

  function getValuationMethod() {
    return $('#warehouseValuationMethod').val() || 'standard';
  }

  function getSupplierDDTs() {
    return getStoreArray('supplierDDTs') || [];
  }

  function getWarehouseLots() {
    return getStoreArray('warehouseLots') || [];
  }

  function getInventoryRows(products, method) {
    method = method || getValuationMethod();
    if (window.InventoryValuationService && typeof window.InventoryValuationService.buildRows === 'function') {
      return window.InventoryValuationService.buildRows(products || [], {
        method: method,
        supplierDDTs: getSupplierDDTs()
      });
    }
    return (products || []).map(function (p) {
      const stock = num(p.stockQty);
      const reserved = num(p.reservedQty);
      const net = Math.max(0, stock - reserved);
      const quarantine = num(p.quarantineQty);
      const price = num(p.purchasePrice);
      const stockValue = stock * price;
      const quarantineValue = quarantine * price;
      const total = stockValue + quarantineValue;
      const underStock = isUnderStock(p);
      const missingPrice = price <= 0 && (stock > 0 || quarantine > 0);
      return {
        product: p,
        code: p.code || '',
        description: p.description || '',
        unitOfMeasure: p.unitOfMeasure || 'pz',
        stockQty: stock,
        reservedQty: reserved,
        netQty: net,
        quarantineQty: quarantine,
        purchasePrice: price,
        unitCost: price,
        standardCost: price,
        lastCost: 0,
        averageCost: 0,
        costSource: 'Prezzo anagrafico',
        costFallback: false,
        stockValue: stockValue,
        quarantineValue: quarantineValue,
        totalValue: total,
        underStock: underStock,
        missingPrice: missingPrice,
        hasStock: stock > 0 || quarantine > 0
      };
    });
  }

  function calculateInventorySummary(products, method) {
    method = method || getValuationMethod();
    if (window.InventoryValuationService && typeof window.InventoryValuationService.summarize === 'function') {
      return window.InventoryValuationService.summarize(products || [], {
        method: method,
        supplierDDTs: getSupplierDDTs()
      });
    }
    const rows = getInventoryRows(products || [], method);
    return rows.reduce(function (acc, row) {
      acc.rows.push(row);
      acc.productCount += 1;
      acc.stockQty += row.stockQty;
      acc.reservedQty += row.reservedQty;
      acc.netQty += row.netQty;
      acc.quarantineQty += row.quarantineQty;
      acc.stockValue += row.stockValue;
      acc.quarantineValue += row.quarantineValue;
      acc.totalValue += row.totalValue;
      if (row.underStock) acc.underStockCount += 1;
      if (row.missingPrice) acc.missingPriceCount += 1;
      if (row.costFallback) acc.fallbackCostCount += 1;
      return acc;
    }, {
      rows: [],
      productCount: 0,
      stockQty: 0,
      reservedQty: 0,
      netQty: 0,
      quarantineQty: 0,
      stockValue: 0,
      quarantineValue: 0,
      totalValue: 0,
      underStockCount: 0,
      missingPriceCount: 0,
      fallbackCostCount: 0,
      supplierCostCount: 0
    });
  }

  function filterInventoryRows(rows) {
    const filter = $('#warehouseInventoryFilter').val() || 'all';
    if (filter === 'with-stock') return rows.filter(function (r) { return r.hasStock; });
    if (filter === 'understock') return rows.filter(function (r) { return r.underStock; });
    if (filter === 'missing-price') return rows.filter(function (r) { return r.missingPrice; });
    if (filter === 'fallback-cost') return rows.filter(function (r) { return r.costFallback; });
    return rows;
  }


  function getPhysicalCountsDoc() {
    const rows = getStoreArray('warehousePhysicalCounts') || [];
    return rows.find(function (r) { return String(r.id) === 'current'; }) || { id: 'current', counts: {} };
  }

  function getPhysicalCounts() {
    const doc = getPhysicalCountsDoc();
    return (doc && doc.counts && typeof doc.counts === 'object') ? doc.counts : {};
  }

  async function savePhysicalCounts(counts) {
    if (typeof window.saveDataToCloud !== 'function') { alert('Funzione saveDataToCloud non disponibile.'); return; }
    await window.saveDataToCloud('warehousePhysicalCounts', {
      id: 'current',
      counts: counts || {},
      updatedAt: new Date().toISOString()
    }, 'current');
  }

  function renderStockQueryOptions() {
    const $sel = $('#warehouseStockQueryProduct');
    if (!$sel.length) return;
    const current = $sel.val();
    const products = getProducts();
    $sel.empty().append('<option value="">Seleziona un prodotto...</option>');
    products.forEach(function (p) {
      const label = (p.code ? p.code + ' - ' : '') + (p.description || 'Prodotto') + ' (' + fmtQty(p.stockQty) + ' ' + (p.unitOfMeasure || 'pz') + ')';
      $sel.append('<option value="'+esc(p.id)+'">'+esc(label)+'</option>');
    });
    if (current) $sel.val(current);
    renderStockQueryResult();
  }

  function renderStockQueryResult() {
    const productId = $('#warehouseStockQueryProduct').val();
    const $card = $('#warehouseStockQueryResult');
    if (!$card.length) return;
    const product = getProducts().find(function (p) { return String(p.id) === String(productId); });
    if (!product) { $card.addClass('d-none'); return; }
    const stock = num(product.stockQty);
    const reserved = num(product.reservedQty);
    const net = Math.max(0, stock - reserved);
    const quarantine = num(product.quarantineQty);
    $('#warehouseStockQueryTitle').text((product.code ? product.code + ' - ' : '') + (product.description || 'Prodotto'));
    $('#warehouseStockQueryAvailable').text(fmtQty(stock));
    $('#warehouseStockQueryReserved').text(fmtQty(reserved));
    $('#warehouseStockQueryNet').text(fmtQty(net));
    $('#warehouseStockQueryQuarantine').text(fmtQty(quarantine));
    $('#warehouseStockQueryUm').text(product.unitOfMeasure || 'pz');
    $('#warehouseStockQueryLocation').text(product.warehouseLocation || '-');
    $('#warehouseStockQueryMin').text(num(product.minStockQty) ? fmtQty(product.minStockQty) : '-');
    $card.removeClass('d-none');
  }

  function renderPhysicalInventory() {
    const $body = $('#warehouse-physical-inventory-table-body');
    if (!$body.length) return;
    $body.empty();
    const products = getProducts();
    const counts = getPhysicalCounts();
    if (!products.length) {
      $body.append('<tr><td colspan="7">' + emptyState('Nessun prodotto fisico configurato', 'Crea prodotti fisici in Servizi / Prodotti per usare l\'inventario fisico.') + '</td></tr>');
      return;
    }
    products.forEach(function (p) {
      const sys = num(p.stockQty);
      const raw = Object.prototype.hasOwnProperty.call(counts, String(p.id)) ? counts[String(p.id)] : '';
      const physical = raw === '' || raw == null ? null : num(raw);
      const hasPhysical = raw !== '' && raw != null && !isNaN(parseFloat(String(raw).replace(',', '.')));
      const diff = hasPhysical ? (physical - sys) : null;
      const diffClass = diff === null ? '' : (diff === 0 ? 'text-muted' : (diff > 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold'));
      const diffText = diff === null ? '' : (diff > 0 ? '+' + fmtQty(diff) : fmtQty(diff));
      $body.append('<tr data-product-id="'+esc(p.id)+'">'+
        '<td>'+esc(p.code || '')+'</td>'+
        '<td>'+esc(p.description || '')+'</td>'+
        '<td>'+esc(p.unitOfMeasure || 'pz')+'</td>'+
        '<td>'+esc(p.warehouseLocation || '-')+'</td>'+
        '<td class="text-end">'+fmtQty(sys)+'</td>'+
        '<td class="text-end" style="max-width:180px"><input class="form-control form-control-sm text-end warehouse-physical-count-input" type="number" step="0.001" min="0" value="'+esc(raw)+'" placeholder="—"></td>'+ 
        '<td class="text-end warehouse-physical-diff '+diffClass+'">'+diffText+'</td>'+ 
      '</tr>');
    });
  }

  function updatePhysicalDiffRow($row) {
    const productId = $row.attr('data-product-id');
    const product = getProducts().find(function (p) { return String(p.id) === String(productId); });
    const $input = $row.find('.warehouse-physical-count-input');
    const $diff = $row.find('.warehouse-physical-diff');
    if (!product || !$diff.length) return;
    const v = String($input.val() || '').trim();
    $diff.removeClass('text-success text-danger text-muted fw-semibold');
    if (v === '') { $diff.text(''); return; }
    const physical = num(v);
    const diff = physical - num(product.stockQty);
    $diff.text(diff > 0 ? '+' + fmtQty(diff) : fmtQty(diff));
    $diff.addClass(diff === 0 ? 'text-muted' : (diff > 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold'));
  }

  async function persistPhysicalCount(productId, value) {
    const counts = Object.assign({}, getPhysicalCounts());
    const v = String(value || '').trim();
    if (v === '') delete counts[String(productId)];
    else counts[String(productId)] = num(v);
    await savePhysicalCounts(counts);
  }

  async function resetPhysicalCounts() {
    if (!confirm('Azzera tutti i conteggi fisici inseriti?')) return;
    await savePhysicalCounts({});
    renderPhysicalInventory();
  }

  async function applyPhysicalInventoryAlignment() {
    const counts = getPhysicalCounts();
    const products = getProducts();
    const entries = Object.keys(counts || {}).map(function (productId) {
      const product = products.find(function (p) { return String(p.id) === String(productId); });
      if (!product) return null;
      const physical = num(counts[productId]);
      const system = num(product.stockQty);
      const diff = physical - system;
      return Number.isFinite(physical) && diff !== 0 ? { product: product, physical: physical, system: system, diff: diff } : null;
    }).filter(Boolean);

    if (!entries.length) { alert('Nessuna differenza inventariale da allineare.'); return; }
    const preview = entries.slice(0, 10).map(function (e) { return '- ' + (e.product.code || e.product.id) + ': ' + fmtQty(e.system) + ' → ' + fmtQty(e.physical) + ' (' + (e.diff > 0 ? '+' : '') + fmtQty(e.diff) + ')'; }).join('\n');
    const more = entries.length > 10 ? '\n... e altri ' + (entries.length - 10) + ' prodotti' : '';
    if (!confirm('Stai per rettificare le giacenze disponibili in base all\'inventario fisico.\n\nProdotti interessati: ' + entries.length + '\n\n' + preview + more + '\n\nLa quarantena non viene modificata. Continuare?')) return;
    const phrase = prompt('Per confermare definitivamente digita ALLINEA INVENTARIO');
    if (phrase !== 'ALLINEA INVENTARIO') { alert('Allineamento inventario annullato.'); return; }
    if (typeof window.saveDataToCloud !== 'function') { alert('Funzione saveDataToCloud non disponibile.'); return; }

    $('#warehousePhysicalApplyBtn').prop('disabled', true);
    try {
      let offset = 0;
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toISOString();
      for (const e of entries) {
        const raw = findRawProduct(e.product.id) || e.product;
        await window.saveDataToCloud('products', { stockQty: e.physical, giacenzaDisponibile: e.physical }, String(e.product.id));
        const movementId = String(getNextMovementId(offset));
        await window.saveDataToCloud('warehouseMovements', {
          id: movementId,
          date: today,
          movementType: 'RETTIFICA',
          tipoMovimento: 'RETTIFICA',
          productId: String(e.product.id),
          productCode: raw.code || e.product.code || '',
          productDescription: raw.description || e.product.description || '',
          unitOfMeasure: raw.unitOfMeasure || e.product.unitOfMeasure || 'pz',
          quantity: e.physical,
          qty: e.physical,
          causale: 'Rettifica da inventario fisico',
          notes: 'Giacenza sistema ' + fmtQty(e.system) + ' → giacenza fisica ' + fmtQty(e.physical) + ' · differenza ' + (e.diff > 0 ? '+' : '') + fmtQty(e.diff),
          documentType: 'inventario_fisico',
          documentId: 'INV-' + today,
          stockBefore: e.system,
          stockAfter: e.physical,
          quarantineBefore: num(e.product.quarantineQty),
          quarantineAfter: num(e.product.quarantineQty),
          createdAt: now
        }, movementId);
        offset++;
      }
      await savePhysicalCounts({});
      render();
      alert('Giacenze allineate per ' + entries.length + ' prodotto/i.');
    } finally {
      $('#warehousePhysicalApplyBtn').prop('disabled', false);
    }
  }

  function renderStocks() {
    const $body = $('#warehouse-stocks-table-body');
    if (!$body.length) return;
    $body.empty();
    const products = getProducts();
    if (!products.length) {
      $body.append('<tr><td colspan="10">' + emptyState('Nessun prodotto fisico configurato', 'Crea una voce di tipo Prodotto in Servizi / Prodotti per iniziare a usare il magazzino.') + '</td></tr>');
      return;
    }
    products.forEach(function (p) {
      const stock = num(p.stockQty);
      const reserved = num(p.reservedQty);
      const net = Math.max(0, stock - reserved);
      const quarantine = num(p.quarantineQty);
      const min = num(p.minStockQty);
      const below = min > 0 && net < min;
      const status = below
        ? '<span class="badge warehouse-status-badge text-bg-danger">Sotto scorta</span>'
        : (quarantine > 0 ? '<span class="badge warehouse-status-badge text-bg-warning">Quarantena</span>' : '<span class="badge warehouse-status-badge text-bg-success">OK</span>');
      $body.append('<tr>'+ 
        '<td>'+esc(p.code || '')+'</td>'+ 
        '<td>'+esc(p.description || '')+'</td>'+ 
        '<td>'+esc(p.unitOfMeasure || 'pz')+'</td>'+ 
        '<td>'+esc(p.warehouseLocation || '-')+'</td>'+ 
        '<td class="text-end">'+fmtQty(stock)+'</td>'+ 
        '<td class="text-end">'+fmtQty(reserved)+'</td>'+ 
        '<td class="text-end fw-semibold">'+fmtQty(net)+'</td>'+ 
        '<td class="text-end">'+fmtQty(quarantine)+'</td>'+ 
        '<td class="text-end">'+(min ? fmtQty(min) : '-')+'</td>'+ 
        '<td>'+status+'</td>'+ 
      '</tr>');
    });
  }

  function renderInventory() {
    const $body = $('#warehouse-inventory-table-body');
    if (!$body.length) return;
    $body.empty();
    const method = getValuationMethod();
    const summary = calculateInventorySummary(getProducts(), method);
    const rows = filterInventoryRows(summary.rows);
    if (!rows.length) {
      $body.append('<tr><td colspan="13">' + emptyState('Nessun prodotto nel filtro selezionato', 'Cambia filtro oppure verifica giacenze, quarantena e costo valorizzabile dei prodotti.') + '</td></tr>');
    } else {
      rows.forEach(function (row) {
        const notes = [];
        if (row.underStock) notes.push('<span class="badge warehouse-status-badge text-bg-danger">Sotto scorta</span>');
        if (row.missingPrice) notes.push('<span class="badge warehouse-status-badge text-bg-warning">Prezzo acquisto mancante</span>');
        if (row.quarantineQty > 0) notes.push('<span class="badge warehouse-status-badge text-bg-secondary">Quarantena</span>');
        $body.append('<tr>'+ 
          '<td>'+esc(row.code)+'</td>'+ 
          '<td>'+esc(row.description)+'</td>'+ 
          '<td>'+esc(row.unitOfMeasure)+'</td>'+ 
          '<td class="text-end">'+fmtQty(row.stockQty)+'</td>'+ 
          '<td class="text-end">'+fmtQty(row.reservedQty)+'</td>'+ 
          '<td class="text-end fw-semibold">'+fmtQty(row.netQty)+'</td>'+ 
          '<td class="text-end">'+fmtQty(row.quarantineQty)+'</td>'+ 
          '<td class="text-end">'+fmtMoney(row.unitCost != null ? row.unitCost : row.purchasePrice)+'</td>'+ 
          '<td><span class="small">'+esc(row.costSource || 'Prezzo anagrafico')+'</span></td>'+ 
          '<td class="text-end">'+fmtMoney(row.stockValue)+'</td>'+ 
          '<td class="text-end">'+fmtMoney(row.quarantineValue)+'</td>'+ 
          '<td class="text-end fw-semibold">'+fmtMoney(row.totalValue)+'</td>'+ 
          '<td>'+(notes.join(' ') || '<span class="text-muted">-</span>')+'</td>'+ 
        '</tr>');
      });
    }
    $('#warehouse-value-stock').text(fmtMoney(summary.stockValue));
    $('#warehouse-value-quarantine').text(fmtMoney(summary.quarantineValue));
    $('#warehouse-value-total').text(fmtMoney(summary.totalValue));
    $('#warehouse-understock-count').text(String(summary.underStockCount));
    $('#warehouse-inventory-summary-note').text(
      'Prodotti: ' + summary.productCount +
      ' · giacenza netta: ' + fmtQty(summary.netQty) +
      ' · quarantena: ' + fmtQty(summary.quarantineQty) +
      ' · senza costo valorizzabile: ' + summary.missingPriceCount +
      ' · fallback costo: ' + (summary.fallbackCostCount || 0) +
      ' · metodo: ' + ($('#warehouseValuationMethod option:selected').text() || 'Prezzo anagrafico')
    );
  }

  function renderMovementProductOptions() {
    const $select = $('#warehouseMovement-productId');
    if (!$select.length) return;
    const current = $select.val();
    const products = getProducts();
    $select.empty();
    if (!products.length) {
      $select.append('<option value="">Nessun prodotto fisico disponibile</option>');
      return;
    }
    $select.append('<option value="">Seleziona prodotto...</option>');
    products.forEach(function (p) {
      const label = (p.code ? p.code + ' - ' : '') + (p.description || 'Prodotto') + ' (' + fmtQty(p.stockQty) + ' ' + (p.unitOfMeasure || 'pz') + ' disp., ' + fmtQty(p.quarantineQty) + ' q.)';
      $select.append('<option value="'+esc(p.id)+'">'+esc(label)+'</option>');
    });
    if (current) $select.val(current);
  }

  function renderMovements() {
    const $body = $('#warehouse-movements-table-body');
    if (!$body.length) return;
    $body.empty();
    const movements = getMovements();
    if (!movements.length) {
      $body.append('<tr><td colspan="8">' + emptyState('Nessun movimento registrato', 'I carichi/scarichi manuali e i DDT salvati compariranno qui come storico tracciato.') + '</td></tr>');
      return;
    }
    movements.forEach(function (m) {
      const product = m.productCode ? (m.productCode + ' - ' + m.productDescription) : m.productDescription;
      const doc = m.documentId ? ((m.documentType || 'doc') + ' ' + m.documentId) : (m.documentType && m.documentType !== 'manuale' ? m.documentType : '-');
      $body.append('<tr>'+ 
        '<td>'+esc(formatDate(m.date))+'</td>'+ 
        '<td><span class="badge warehouse-status-badge text-bg-secondary">'+esc(MOVEMENT_LABELS[m.movementType] || m.movementType)+'</span></td>'+ 
        '<td>'+esc(product || '-')+'</td>'+ 
        '<td class="text-end">'+fmtQty(m.quantity)+' '+esc(m.unitOfMeasure || '')+'</td>'+ 
        '<td>'+esc(m.causale || '-')+'</td>'+ 
        '<td>'+fmtQty(m.stockBefore)+' → <strong>'+fmtQty(m.stockAfter)+'</strong></td>'+ 
        '<td>'+fmtQty(m.quarantineBefore)+' → <strong>'+fmtQty(m.quarantineAfter)+'</strong></td>'+ 
        '<td>'+esc(doc)+'</td>'+ 
      '</tr>');
    });
  }


  function renderMaceratedProducts() {
    const $body = $('#warehouse-macerated-table-body');
    if (!$body.length) return;
    $body.empty();
    const rows = getMovements().filter(function (m) { return m.movementType === 'SCARTO'; });
    if (!rows.length) {
      $body.append('<tr><td colspan="8">' + emptyState('Nessun prodotto macerato/scartato', 'Le operazioni Scarta / macero dalla quarantena compariranno qui come storico.') + '</td></tr>');
      return;
    }
    rows.forEach(function (m) {
      $body.append('<tr>'+
        '<td>'+esc(formatDate(m.date))+'</td>'+
        '<td>'+esc(m.productCode || '')+'</td>'+
        '<td>'+esc(m.productDescription || '')+'</td>'+
        '<td>'+esc(m.unitOfMeasure || 'pz')+'</td>'+
        '<td class="text-end fw-semibold">'+fmtQty(m.quantity)+'</td>'+
        '<td>'+esc(m.causale || 'Scarto/macerazione')+'</td>'+
        '<td>'+esc(m.documentId || '-')+'</td>'+
        '<td>'+esc(m.notes || '-')+'</td>'+
      '</tr>');
    });
  }

  function renderQuarantineSupplierOptions(selectedId) {
    const $sel = $('#warehouseQuarantine-supplierId');
    if (!$sel.length) return;
    $sel.empty().append('<option value="">Seleziona fornitore...</option>');
    getSuppliers().forEach(function (sp) { $sel.append('<option value="'+esc(sp.id)+'">'+esc(supplierLabel(sp))+'</option>'); });
    if (selectedId) $sel.val(String(selectedId));
  }

  function toggleQuarantineReturnFields() {
    const isReturn = ($('#warehouseQuarantine-action').val() || '') === 'return_supplier';
    $('#warehouseQuarantineReturnFields').toggleClass('d-none', !isReturn);
  }

  function renderQuarantine() {
    const $body = $('#warehouse-quarantine-table-body');
    if (!$body.length) return;
    $body.empty();
    const rows = getProducts().filter(function (p) { return num(p.quarantineQty) > 0; });
    if (!rows.length) {
      $body.append('<tr><td colspan="7">' + emptyState('Nessun prodotto in quarantena', 'Le quantità ricevute con riserva dai DDT fornitore compariranno qui per sblocco, scarto o reso.') + '</td></tr>');
      renderMaceratedProducts();
      return;
    }
    rows.forEach(function (p) {
      const q = num(p.quarantineQty);
      const value = q * num(p.purchasePrice);
      $body.append('<tr>'+ 
        '<td>'+esc(p.code || '')+'</td>'+ 
        '<td>'+esc(p.description || '')+'</td>'+ 
        '<td>'+esc(p.unitOfMeasure || 'pz')+'</td>'+ 
        '<td>'+esc(p.warehouseLocation || '-')+'</td>'+ 
        '<td class="text-end fw-semibold">'+fmtQty(q)+'</td>'+ 
        '<td class="text-end">'+fmtMoney(value)+'</td>'+ 
        '<td class="text-end"><button class="btn btn-sm btn-outline-primary warehouse-quarantine-action" data-id="'+esc(p.id)+'" type="button"><i class="fas fa-clipboard-check"></i> Gestisci</button></td>'+ 
      '</tr>');
    });
    renderMaceratedProducts();
  }

  function openQuarantineAction(productId) {
    const rawProduct = findRawProduct(productId);
    if (!rawProduct) return;
    const product = normalizeProduct(rawProduct);
    $('#warehouseQuarantine-productId').val(product.id);
    $('#warehouseQuarantine-action').val('release');
    $('#warehouseQuarantine-date').val(new Date().toISOString().slice(0, 10));
    $('#warehouseQuarantine-quantity').val(num(product.quarantineQty));
    $('#warehouseQuarantine-document').val('');
    $('#warehouseQuarantine-notes').val('');
    renderQuarantineSupplierOptions('');
    toggleQuarantineReturnFields();
    $('#warehouseQuarantine-productPreview').html(
      '<strong>'+esc((product.code ? product.code + ' - ' : '') + (product.description || 'Prodotto'))+'</strong><br>'+ 
      'Quarantena disponibile: <strong>'+fmtQty(product.quarantineQty)+' '+esc(product.unitOfMeasure || 'pz')+'</strong>' +
      ' · Giacenza disponibile attuale: '+fmtQty(product.stockQty)
    );
    $('#warehouseQuarantineActionModal').modal('show');
  }

  function computeQuarantineActionResult(product, action, quantity) {
    const currentStock = num(product.stockQty);
    const currentQuarantine = num(product.quarantineQty);
    const q = num(quantity);
    if (q <= 0) throw new Error('Inserisci una quantità maggiore di zero.');
    if (q > currentQuarantine) throw new Error('La quantità indicata supera la giacenza in quarantena.');
    let nextStock = currentStock;
    let nextQuarantine = currentQuarantine - q;
    if (action === 'release') nextStock += q;
    else if (action === 'discard' || action === 'return_supplier') {
      // La quantità esce dalla quarantena senza diventare disponibile.
    } else {
      throw new Error('Azione quarantena non valida.');
    }
    return { stockBefore: currentStock, stockAfter: nextStock, quarantineBefore: currentQuarantine, quarantineAfter: nextQuarantine };
  }

  async function saveQuarantineAction() {
    const productId = $('#warehouseQuarantine-productId').val();
    const action = $('#warehouseQuarantine-action').val() || 'release';
    const quantity = num($('#warehouseQuarantine-quantity').val());
    const date = $('#warehouseQuarantine-date').val() || new Date().toISOString().slice(0, 10);
    const documentRef = ($('#warehouseQuarantine-document').val() || '').trim();
    const notes = ($('#warehouseQuarantine-notes').val() || '').trim();
    const supplierId = ($('#warehouseQuarantine-supplierId').val() || '').trim();
    const rawProduct = findRawProduct(productId);
    if (!rawProduct) { alert('Prodotto non trovato.'); return; }
    const product = normalizeProduct(rawProduct);
    let result;
    try { result = computeQuarantineActionResult(product, action, quantity); }
    catch (e) { alert(e.message || e); return; }
    if (typeof window.saveDataToCloud !== 'function') { alert('Funzione saveDataToCloud non disponibile.'); return; }
    if (action === 'return_supplier' && !supplierId) { alert('Seleziona il fornitore a cui rendere la merce.'); return; }

    const movementType = action === 'release' ? 'QUARANTENA_OUT' : (action === 'discard' ? 'SCARTO' : 'RESO_FORNITORE');
    const causali = {
      release: 'Sblocco merce da quarantena a disponibile',
      discard: 'Scarto merce da quarantena',
      return_supplier: 'Reso a fornitore da quarantena'
    };
    const movementId = String(getNextMovementId());
    const movement = {
      id: movementId,
      date: date,
      movementType: movementType,
      tipoMovimento: movementType,
      productId: String(product.id),
      productCode: product.code || '',
      productDescription: product.description || '',
      unitOfMeasure: product.unitOfMeasure || 'pz',
      quantity: quantity,
      qty: quantity,
      causale: causali[action] || 'Gestione quarantena',
      notes: notes,
      documentType: 'quarantena',
      documentId: documentRef,
      stockBefore: result.stockBefore,
      stockAfter: result.stockAfter,
      quarantineBefore: result.quarantineBefore,
      quarantineAfter: result.quarantineAfter,
      createdAt: new Date().toISOString()
    };
    const productPatch = {
      stockQty: result.stockAfter,
      giacenzaDisponibile: result.stockAfter,
      quarantineQty: result.quarantineAfter,
      giacenzaQuarantena: result.quarantineAfter
    };
    try {
      $('#saveWarehouseQuarantineActionBtn').prop('disabled', true);
      await window.saveDataToCloud('products', productPatch, String(product.id));
      await window.saveDataToCloud('warehouseMovements', movement, movementId);
      if (action === 'return_supplier' && window.SupplierDDTService && typeof window.SupplierDDTService.createReturnDDTFromQuarantine === 'function') {
        const returnDDT = await window.SupplierDDTService.createReturnDDTFromQuarantine({ supplierId:supplierId, product:product, quantity:quantity, date:date, documentRef:documentRef, notes:notes, movementId:movementId });
        await window.saveDataToCloud('warehouseMovements', Object.assign({}, movement, { documentType:'supplier_ddt_return', documentId:returnDDT.id, returnSupplierDDTId:returnDDT.id, returnSupplierDDTNumber:returnDDT.number }), movementId);
      }
      $('#warehouseQuarantineActionModal').modal('hide');
      render();
    } finally {
      $('#saveWarehouseQuarantineActionBtn').prop('disabled', false);
    }
  }


  function getLotsSummary() {
    if (window.WarehouseLotsService && typeof window.WarehouseLotsService.summarize === 'function') {
      return window.WarehouseLotsService.summarize({
        products: getProducts(),
        warehouseLots: getWarehouseLots(),
        supplierDDTs: getSupplierDDTs(),
        suppliers: getSuppliers()
      });
    }
    return { rows: [], trackedProducts: 0, activeCount: 0, expiringCount: 0, expiredCount: 0 };
  }

  function renderLotProductOptions() {
    const products = getProducts().filter(function (p) { return p.trackingMode && p.trackingMode !== 'none'; });
    const $filter = $('#warehouseLotsProductFilter');
    const currentFilter = $filter.val() || 'all';
    if ($filter.length) {
      $filter.empty().append('<option value="all">Tutti i prodotti</option>');
      products.forEach(function (p) { $filter.append('<option value="'+esc(p.id)+'">'+esc((p.code ? p.code + ' - ' : '') + (p.description || 'Prodotto'))+'</option>'); });
      $filter.val(currentFilter);
      if (!$filter.val()) $filter.val('all');
    }
    const $modal = $('#warehouseLot-productId');
    const currentModal = $modal.val();
    if ($modal.length) {
      $modal.empty().append('<option value="">Seleziona prodotto...</option>');
      products.forEach(function (p) { $modal.append('<option value="'+esc(p.id)+'">'+esc((p.code ? p.code + ' - ' : '') + (p.description || 'Prodotto') + ' · ' + (p.trackingMode || 'none'))+'</option>'); });
      if (currentModal) $modal.val(currentModal);
    }
    const $supplier = $('#warehouseLot-supplierId');
    const curSupplier = $supplier.val();
    if ($supplier.length) {
      $supplier.empty().append('<option value="">Nessun fornitore / non indicato</option>');
      getSuppliers().forEach(function (sp) { $supplier.append('<option value="'+esc(sp.id)+'">'+esc(supplierLabel(sp))+'</option>'); });
      if (curSupplier) $supplier.val(curSupplier);
    }
  }

  function filterLotRows(rows) {
    const filter = $('#warehouseLotsFilter').val() || 'all';
    const productId = $('#warehouseLotsProductFilter').val() || 'all';
    return (rows || []).filter(function (row) {
      if (productId !== 'all' && String(row.productId) !== String(productId)) return false;
      if (filter === 'active') return row.computedStatus === 'active';
      if (filter === 'expiring') return row.isExpiring;
      if (filter === 'expired') return row.isExpired;
      if (filter === 'serial') return row.type === 'serial';
      if (filter === 'lot') return row.type === 'lot' || row.type === 'expiry';
      return true;
    });
  }

  function renderLots() {
    const $body = $('#warehouse-lots-table-body');
    if (!$body.length) return;
    renderLotProductOptions();
    const summary = getLotsSummary();
    const rows = filterLotRows(summary.rows);
    $body.empty();
    if (!rows.length) {
      $body.append('<tr><td colspan="10">' + emptyState('Nessun lotto nel filtro selezionato', 'Configura un prodotto come tracciato e registra un lotto/matricola, oppure importa campi lotto da DDT fornitore.') + '</td></tr>');
    } else {
      rows.forEach(function (row) {
        const statusLabel = row.isExpired ? '<span class="badge text-bg-danger">Scaduto</span>' : (row.isExpiring ? '<span class="badge text-bg-warning">In scadenza</span>' : (row.status === 'blocked' ? '<span class="badge text-bg-secondary">Bloccato</span>' : '<span class="badge text-bg-success">Attivo</span>'));
        const typeLabel = row.type === 'serial' ? 'Matricola' : (row.type === 'expiry' ? 'Lotto + scadenza' : 'Lotto');
        const expiry = row.expiryDate ? formatDate(row.expiryDate) + (row.daysToExpiry != null ? ' <span class="small text-muted">(' + row.daysToExpiry + ' gg)</span>' : '') : '-';
        $body.append('<tr>'+
          '<td>'+esc(row.productLabel)+'</td>'+ 
          '<td><span class="badge text-bg-info">'+esc(typeLabel)+'</span></td>'+ 
          '<td><code>'+esc(row.lotCode || '-')+'</code></td>'+ 
          '<td><code>'+esc(row.serialNumber || '-')+'</code></td>'+ 
          '<td>'+expiry+'</td>'+ 
          '<td class="text-end">'+fmtQty(row.qtyAvailable)+'</td>'+ 
          '<td class="text-end">'+fmtQty(row.qtyQuarantine)+'</td>'+ 
          '<td>'+esc(row.supplierLabel || '-')+'</td>'+ 
          '<td>'+esc(row.sourceLabel || '-')+'</td>'+ 
          '<td>'+statusLabel+'</td>'+ 
        '</tr>');
      });
    }
    $('#warehouse-lots-tracked-products').text(String(summary.trackedProducts || 0));
    $('#warehouse-lots-active-count').text(String(summary.activeCount || 0));
    $('#warehouse-lots-expiring-count').text(String(summary.expiringCount || 0));
    $('#warehouse-lots-expired-count').text(String(summary.expiredCount || 0));
    $('#warehouse-lots-summary-note').text('Righe visualizzate: ' + rows.length + ' / ' + (summary.rows || []).length + ' · quantità disponibile tracciata: ' + fmtQty(summary.qtyAvailable || 0) + ' · quarantena tracciata: ' + fmtQty(summary.qtyQuarantine || 0));
  }

  function resetLotForm() {
    const form = document.getElementById('warehouseLotForm');
    if (form) form.reset();
    $('#warehouseLot-id').val('');
    $('#warehouseLot-status').val('active');
    renderLotProductOptions();
  }

  async function saveLot() {
    if (typeof window.saveDataToCloud !== 'function') { alert('Funzione saveDataToCloud non disponibile.'); return; }
    const productId = $('#warehouseLot-productId').val();
    const product = getProducts().find(function (p) { return String(p.id) === String(productId); });
    const id = $('#warehouseLot-id').val() || ('LOT' + Date.now());
    const sourceRef = ($('#warehouseLot-sourceRef').val() || '').trim();
    const lot = {
      id: id,
      productId: productId,
      lotCode: ($('#warehouseLot-lotCode').val() || '').trim(),
      serialNumber: ($('#warehouseLot-serialNumber').val() || '').trim(),
      expiryDate: $('#warehouseLot-expiryDate').val() || '',
      qtyAvailable: num($('#warehouseLot-qtyAvailable').val()),
      qtyQuarantine: num($('#warehouseLot-qtyQuarantine').val()),
      supplierId: $('#warehouseLot-supplierId').val() || '',
      sourceDocumentNumber: sourceRef,
      sourceRef: sourceRef,
      status: $('#warehouseLot-status').val() || 'active',
      notes: ($('#warehouseLot-notes').val() || '').trim(),
      updatedAt: new Date().toISOString()
    };
    if (!getWarehouseLots().find(function (l) { return String(l.id) === String(id); })) lot.createdAt = lot.updatedAt;
    try {
      if (window.WarehouseLotsService && typeof window.WarehouseLotsService.validateLot === 'function') window.WarehouseLotsService.validateLot(lot, product);
    } catch (e) { alert(e.message || e); return; }
    $('#saveWarehouseLotBtn').prop('disabled', true);
    try {
      await window.saveDataToCloud('warehouseLots', lot, id);
      $('#warehouseLotModal').modal('hide');
      renderLots();
    } finally {
      $('#saveWarehouseLotBtn').prop('disabled', false);
    }
  }

  function exportLotsCsv() {
    const rows = filterLotRows(getLotsSummary().rows);
    const header = ['Prodotto','Tipo','Lotto','Matricola','Scadenza','Giorni a scadenza','Disponibile','Quarantena','Fornitore','Origine','Stato','Note'];
    const csvRows = [header.map(buildCsvValue).join(';')].concat(rows.map(function (r) {
      return [r.productLabel, r.type, r.lotCode, r.serialNumber, r.expiryDate, r.daysToExpiry == null ? '' : r.daysToExpiry, r.qtyAvailable, r.qtyQuarantine, r.supplierLabel, r.sourceLabel, r.computedStatus, r.notes].map(buildCsvValue).join(';');
    }));
    const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lotti_matricole_scadenze_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function render() {
    renderStockQueryOptions();
    renderStocks();
    renderPhysicalInventory();
    renderMovementProductOptions();
    renderMovements();
    renderInventory();
    renderQuarantine();
    renderMaceratedProducts();
  }

  function resetMovementForm() {
    const form = document.getElementById('warehouseMovementForm');
    if (form) form.reset();
    $('#warehouseMovement-id').val('');
    $('#warehouseMovement-date').val(new Date().toISOString().slice(0, 10));
    $('#warehouseMovement-type').val('CARICO').trigger('change');
    renderMovementProductOptions();
  }

  function getNextMovementId(offset) {
    const off = num(offset);
    if (typeof window.getNextId === 'function') return Number(window.getNextId(getStoreArray('warehouseMovements'))) + off;
    const ids = getStoreArray('warehouseMovements').map(function (m) { return parseInt(m.id, 10); }).filter(function (n) { return !isNaN(n); });
    return (ids.length ? Math.max.apply(null, ids) + 1 : 1) + off;
  }

  function computeMovementResult(product, type, quantity) {
    const currentStock = num(product.stockQty);
    const currentQuarantine = num(product.quarantineQty);
    let nextStock = currentStock;
    let nextQuarantine = currentQuarantine;
    const q = num(quantity);
    if (q < 0) throw new Error('La quantità non può essere negativa.');

    if (type === 'CARICO') nextStock += q;
    else if (type === 'SCARICO') {
      if (q > currentStock) throw new Error('Scarico superiore alla giacenza disponibile.');
      nextStock -= q;
    } else if (type === 'RETTIFICA') {
      nextStock = q;
    } else if (type === 'QUARANTENA_IN') {
      if (q > currentStock) throw new Error('La quantità da spostare in quarantena supera la giacenza disponibile.');
      nextStock -= q;
      nextQuarantine += q;
    } else if (type === 'QUARANTENA_OUT') {
      if (q > currentQuarantine) throw new Error('La quantità da sbloccare supera la giacenza in quarantena.');
      nextQuarantine -= q;
      nextStock += q;
    }
    return { stockBefore: currentStock, stockAfter: nextStock, quarantineBefore: currentQuarantine, quarantineAfter: nextQuarantine };
  }

  async function saveMovement() {
    const productId = $('#warehouseMovement-productId').val();
    const type = $('#warehouseMovement-type').val() || 'CARICO';
    const quantity = num($('#warehouseMovement-quantity').val());
    const date = $('#warehouseMovement-date').val() || new Date().toISOString().slice(0, 10);
    const causale = ($('#warehouseMovement-causale').val() || '').trim();
    const documentRef = ($('#warehouseMovement-document').val() || '').trim();
    const notes = ($('#warehouseMovement-notes').val() || '').trim();

    if (!productId) { alert('Seleziona un prodotto.'); return; }
    if (quantity < 0 || (type !== 'RETTIFICA' && quantity <= 0)) { alert('Inserisci una quantità valida.'); return; }
    const rawProduct = findRawProduct(productId);
    if (!rawProduct) { alert('Prodotto non trovato.'); return; }
    const product = normalizeProduct(rawProduct);

    let result;
    try { result = computeMovementResult(product, type, quantity); }
    catch (e) { alert(e.message || e); return; }

    if (typeof window.saveDataToCloud !== 'function') {
      alert('Funzione saveDataToCloud non disponibile.');
      return;
    }

    const movementId = String(getNextMovementId());
    const movement = {
      id: movementId,
      date: date,
      movementType: type,
      tipoMovimento: type,
      productId: String(product.id),
      productCode: product.code || '',
      productDescription: product.description || '',
      unitOfMeasure: product.unitOfMeasure || 'pz',
      quantity: quantity,
      qty: quantity,
      causale: causale,
      notes: notes,
      documentType: 'manuale',
      documentId: documentRef,
      stockBefore: result.stockBefore,
      stockAfter: result.stockAfter,
      quarantineBefore: result.quarantineBefore,
      quarantineAfter: result.quarantineAfter,
      createdAt: new Date().toISOString()
    };

    const productPatch = {
      stockQty: result.stockAfter,
      giacenzaDisponibile: result.stockAfter,
      quarantineQty: result.quarantineAfter,
      giacenzaQuarantena: result.quarantineAfter
    };

    try {
      $('#saveWarehouseMovementBtn').prop('disabled', true);
      await window.saveDataToCloud('products', productPatch, String(product.id));
      await window.saveDataToCloud('warehouseMovements', movement, movementId);
      $('#warehouseMovementModal').modal('hide');
      render();
    } finally {
      $('#saveWarehouseMovementBtn').prop('disabled', false);
    }
  }

  function buildCsvValue(v) {
    const s = String(v == null ? '' : v);
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function exportInventoryCsv() {
    const method = getValuationMethod();
    const summary = calculateInventorySummary(getProducts(), method);
    const rows = filterInventoryRows(summary.rows);
    const header = ['Codice','Prodotto','UM','Giacenza','Riservata','Netta','Quarantena','Metodo','Costo unitario','Costo standard','Ultimo costo','Costo medio','Origine costo','Valore disponibile','Valore quarantena','Valore totale','Sotto scorta','Costo mancante','Fallback costo'];
    const csvRows = [header.map(buildCsvValue).join(';')].concat(rows.map(function (r) {
      return [r.code, r.description, r.unitOfMeasure, r.stockQty, r.reservedQty, r.netQty, r.quarantineQty, method, r.unitCost != null ? r.unitCost : r.purchasePrice, r.standardCost || 0, r.lastCost || 0, r.averageCost || 0, r.costSource || '', r.stockValue, r.quarantineValue, r.totalValue, r.underStock ? 'SI' : 'NO', r.missingPrice ? 'SI' : 'NO', r.costFallback ? 'SI' : 'NO'].map(buildCsvValue).join(';');
    }));
    const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario_valorizzato_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function bind() {
    $('#newWarehouseMovementBtn').off('click.warehouse').on('click.warehouse', function () {
      resetMovementForm();
      $('#warehouseMovementModal').modal('show');
    });
    $('#saveWarehouseMovementBtn').off('click.warehouse').on('click.warehouse', saveMovement);
    $('#warehouseMovement-type').off('change.warehouse').on('change.warehouse', function () {
      const type = $(this).val();
      const help = type === 'RETTIFICA'
        ? 'Per rettifica indica la nuova giacenza disponibile.'
        : 'Per carico/scarico/quarantena indica la quantità movimentata.';
      $('#warehouseMovement-quantity-help').text(help);
    });
    $('#warehouseStockQueryProduct').off('change.warehouse').on('change.warehouse', renderStockQueryResult);
    $('#warehouse-physical-inventory-table-body').off('input.warehouse', '.warehouse-physical-count-input').on('input.warehouse', '.warehouse-physical-count-input', function () { updatePhysicalDiffRow($(this).closest('tr')); });
    $('#warehouse-physical-inventory-table-body').off('change.warehouse', '.warehouse-physical-count-input').on('change.warehouse', '.warehouse-physical-count-input', function () { persistPhysicalCount($(this).closest('tr').attr('data-product-id'), $(this).val()); });
    $('#warehousePhysicalResetBtn').off('click.warehouse').on('click.warehouse', resetPhysicalCounts);
    $('#warehousePhysicalApplyBtn').off('click.warehouse').on('click.warehouse', applyPhysicalInventoryAlignment);
    $('#warehouseInventoryFilter').off('change.warehouse').on('change.warehouse', renderInventory);
    $('#warehouseValuationMethod').off('change.warehouse').on('change.warehouse', renderInventory);
    $('#warehouseInventoryExportCsvBtn').off('click.warehouse').on('click.warehouse', exportInventoryCsv);
    $('#newWarehouseLotBtn').off('click.warehouse').on('click.warehouse', function () { resetLotForm(); $('#warehouseLotModal').modal('show'); });
    $('#saveWarehouseLotBtn').off('click.warehouse').on('click.warehouse', saveLot);
    $('#warehouseLotsFilter,#warehouseLotsProductFilter').off('change.warehouse').on('change.warehouse', renderLots);
    $('#warehouseLotsExportCsvBtn').off('click.warehouse').on('click.warehouse', exportLotsCsv);
    $('#warehouse-quarantine-table-body').off('click.warehouse', '.warehouse-quarantine-action').on('click.warehouse', '.warehouse-quarantine-action', function () { openQuarantineAction($(this).attr('data-id')); });
    $('#saveWarehouseQuarantineActionBtn').off('click.warehouse').on('click.warehouse', saveQuarantineAction);
    $('#warehouseQuarantine-action').off('change.warehouse').on('change.warehouse', toggleQuarantineReturnFields);
    if (window.AppStore && typeof window.AppStore.subscribe === 'function') {
      window.AppStore.subscribe('products', render);
      window.AppStore.subscribe('warehouseMovements', render);
      window.AppStore.subscribe('warehousePhysicalCounts', render);
      window.AppStore.subscribe('warehouseLots', render);
      window.AppStore.subscribe('suppliers', render);
    }
    render();
  }

  window.renderWarehouseArea = render;
  window.WarehouseMovementService = {
    computeMovementResult: computeMovementResult,
    calculateInventorySummary: calculateInventorySummary,
    getInventoryRows: getInventoryRows,
    computeQuarantineActionResult: computeQuarantineActionResult,
    renderMaceratedProducts: renderMaceratedProducts,
    renderPhysicalInventory: renderPhysicalInventory,
    renderLots: renderLots,
    getLotsSummary: getLotsSummary,
    applyPhysicalInventoryAlignment: applyPhysicalInventoryAlignment,
    labels: MOVEMENT_LABELS
  };
  window.AppModules.warehouse.bind = bind;
})();
