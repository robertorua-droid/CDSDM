// js/features/warehouse/warehouse-price-update-service.js
// Step 10: aggiornamento prudente dei prezzi prodotto da DDT cliente/fornitore.
(function () {
  function esc(v) {
    if (window.VatRateCatalog && typeof window.VatRateCatalog.escapeHtml === 'function') return window.VatRateCatalog.escapeHtml(v);
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]; });
  }
  function num(v) { const n = parseFloat(String(v == null ? 0 : v).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmtMoney(v) { return '€ ' + num(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function formatDate(v) { if (!v) return ''; const p = String(v).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(v); }
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
  function findProduct(id) {
    return (getStoreArray('products') || []).map(normalizeProduct).find(function (p) { return String(p.id) === String(id); }) || null;
  }
  function nearlySame(a, b) { return Math.abs(num(a) - num(b)) < 0.0001; }

  function buildUpdatesFromDocument(document, direction) {
    const doc = document || {};
    const isPurchase = direction === 'purchase';
    const priceField = isPurchase ? 'purchasePrice' : 'salePrice';
    const aliasField = isPurchase ? 'prezzoAcquisto' : 'prezzoVendita';
    const lastField = isPurchase ? 'lastPurchasePrice' : 'lastSalePrice';
    const lastSourceField = isPurchase ? 'lastPurchasePriceSource' : 'lastSalePriceSource';
    const lastSourceLabelField = isPurchase ? 'lastPurchasePriceSourceLabel' : 'lastSalePriceSourceLabel';
    const lastDateField = isPurchase ? 'lastPurchasePriceDate' : 'lastSalePriceDate';
    const documentType = isPurchase ? 'supplier_ddt' : 'customer_ddt';
    const sourceLabel = (isPurchase ? 'DDT fornitore' : 'DDT cliente') + ' ' + (doc.number || doc.numero || doc.id || '');
    const grouped = {};

    (doc.lines || []).forEach(function (line) {
      const productId = String(line.productId || '');
      if (!productId) return;
      const proposed = isPurchase
        ? num(line.purchasePrice || line.unitCost || line.price || line.unitPrice)
        : num(line.salePrice || line.price || line.unitPrice);
      if (proposed <= 0) return;
      grouped[productId] = {
        productId: productId,
        proposedPrice: proposed,
        line: line
      };
    });

    return Object.keys(grouped).map(function (productId) {
      const product = findProduct(productId);
      if (!product) return null;
      const currentPrice = num(product[priceField]);
      if (nearlySame(currentPrice, grouped[productId].proposedPrice)) return null;
      return {
        productId: productId,
        productCode: product.code || product.codice || '',
        productDescription: product.description || product.descrizione || grouped[productId].line.productDescription || grouped[productId].line.description || '',
        direction: direction,
        priceField: priceField,
        aliasField: aliasField,
        lastField: lastField,
        lastSourceField: lastSourceField,
        lastSourceLabelField: lastSourceLabelField,
        lastDateField: lastDateField,
        currentPrice: currentPrice,
        proposedPrice: grouped[productId].proposedPrice,
        documentType: documentType,
        documentId: String(doc.id || ''),
        documentNumber: doc.number || doc.numero || '',
        documentDate: doc.date || doc.data || '',
        sourceLabel: sourceLabel.trim()
      };
    }).filter(Boolean);
  }

  function buildPreviewHtml(updates, direction) {
    const title = direction === 'purchase' ? 'Aggiorna prezzi di acquisto' : 'Aggiorna prezzi di vendita';
    if (!updates.length) {
      return '<div class="alert alert-info mb-0">Nessun prezzo da aggiornare: i prodotti collegati hanno già lo stesso valore oppure il documento non contiene prezzi validi.</div>';
    }
    const rows = updates.map(function (u) {
      return '<tr><td>'+esc(u.productCode || '-')+'</td><td>'+esc(u.productDescription || '-')+'</td><td class="text-end">'+fmtMoney(u.currentPrice)+'</td><td class="text-end fw-semibold">'+fmtMoney(u.proposedPrice)+'</td><td>'+esc(u.sourceLabel || '-')+'</td></tr>';
    }).join('');
    return '<div class="alert alert-warning small"><strong>'+esc(title)+'.</strong> L\'aggiornamento non è automatico: confermando verranno aggiornati solo i prodotti elencati sotto. Le vecchie fatture/DDT non vengono ricalcolati.</div>'+
      '<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Codice</th><th>Prodotto</th><th class="text-end">Prezzo attuale</th><th class="text-end">Nuovo prezzo</th><th>Fonte</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  async function applyUpdates(updates) {
    if (!updates.length) return 0;
    if (typeof window.saveDataToCloud !== 'function') throw new Error('Funzione saveDataToCloud non disponibile.');
    const now = new Date().toISOString();
    for (const u of updates) {
      const data = {
        updatedAt: now
      };
      data[u.priceField] = u.proposedPrice;
      data[u.aliasField] = u.proposedPrice;
      data[u.lastField] = u.proposedPrice;
      data[u.lastSourceField] = u.documentType;
      data[u.lastSourceLabelField] = u.sourceLabel;
      data[u.lastDateField] = u.documentDate || now.slice(0, 10);
      data.lastPriceUpdateDocumentId = u.documentId;
      data.lastPriceUpdateDocumentNumber = u.documentNumber;
      data.lastPriceUpdateAt = now;
      await window.saveDataToCloud('products', data, String(u.productId));
    }
    return updates.length;
  }

  function ensureModal() {
    if (document.getElementById('warehousePriceUpdateModal')) return;
    $('body').append('<div class="modal fade" id="warehousePriceUpdateModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="warehousePriceUpdateModalTitle">Aggiorna prezzi prodotto</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button></div><div class="modal-body" id="warehousePriceUpdateModalBody"></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button><button type="button" class="btn btn-primary" id="confirmWarehousePriceUpdateBtn">Aggiorna prezzi</button></div></div></div></div>');
  }

  function openConfirm(document, direction) {
    ensureModal();
    const updates = buildUpdatesFromDocument(document, direction);
    const $modal = $('#warehousePriceUpdateModal');
    $('#warehousePriceUpdateModalTitle').text(direction === 'purchase' ? 'Aggiorna prezzi di acquisto da DDT fornitore' : 'Aggiorna prezzi di vendita da DDT cliente');
    $('#warehousePriceUpdateModalBody').html(buildPreviewHtml(updates, direction));
    $('#confirmWarehousePriceUpdateBtn').prop('disabled', updates.length === 0).off('click.priceUpdate').on('click.priceUpdate', async function () {
      try {
        $('#confirmWarehousePriceUpdateBtn').prop('disabled', true).text('Aggiornamento...');
        const count = await applyUpdates(updates);
        $('#warehousePriceUpdateModalBody').prepend('<div class="alert alert-success">Aggiornati '+count+' prodotti.</div>');
        if (window.renderProductsArea) window.renderProductsArea();
        if (window.renderWarehouseArea) window.renderWarehouseArea();
        if (window.renderSupplierDDTsArea) window.renderSupplierDDTsArea();
        if (window.renderCustomerDDTsArea) window.renderCustomerDDTsArea();
        setTimeout(function () { $modal.modal('hide'); }, 700);
      } catch (e) {
        $('#warehousePriceUpdateModalBody').prepend('<div class="alert alert-danger">Errore aggiornamento prezzi: '+esc(e.message || e)+'</div>');
      } finally {
        $('#confirmWarehousePriceUpdateBtn').prop('disabled', false).text('Aggiorna prezzi');
      }
    });
    $modal.modal('show');
  }

  window.WarehousePriceUpdateService = {
    buildUpdatesFromDocument: buildUpdatesFromDocument,
    buildPreviewHtml: buildPreviewHtml,
    applyUpdates: applyUpdates,
    updatePurchasePricesFromSupplierDDT: function (ddt) { openConfirm(ddt, 'purchase'); },
    updateSalePricesFromCustomerDDT: function (ddt) { openConfirm(ddt, 'sale'); },
    formatDate: formatDate
  };
})();
