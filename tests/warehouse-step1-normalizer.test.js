// Test browser-based: normalizzazione campi magazzino prodotto (Step 1)
(function () {
  const assert = window.assert || function (condition, message) { if (!condition) throw new Error(message || 'Assertion failed'); };
  const n = window.DomainNormalizers && window.DomainNormalizers.normalizeProductInfo
    ? window.DomainNormalizers.normalizeProductInfo({ itemType: 'product', purchasePrice: '10.50', stockQty: '3', quarantineQty: '2', reservedQty: '1', minStockQty: '5', unitOfMeasure: 'pz', warehouseLocation: 'A1' })
    : null;
  if (!n) return;
  assert(n.itemType === 'product', 'itemType product atteso');
  assert(n.stockQty === 3, 'stockQty normalizzata');
  assert(n.quarantineQty === 2, 'quarantineQty normalizzata');
  assert(n.reservedQty === 1, 'reservedQty normalizzata');
  assert(n.availableNetQty === 2, 'availableNetQty attesa');
  assert(n.inventoryValue === 31.5, 'inventoryValue atteso');
  assert(n.quarantineValue === 21, 'quarantineValue atteso');
})();
