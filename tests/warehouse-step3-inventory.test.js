// Test browser-based: inventario valorizzato (Step 3)
(function () {
  const assert = window.assert || function (condition, message) { if (!condition) throw new Error(message || 'Assertion failed'); };
  const svc = window.WarehouseMovementService;
  if (!svc || typeof svc.calculateInventorySummary !== 'function') return;
  const summary = svc.calculateInventorySummary([
    { itemType: 'product', code: 'A', description: 'Prodotto A', stockQty: 10, reservedQty: 2, quarantineQty: 1, minStockQty: 9, purchasePrice: 5 },
    { itemType: 'product', code: 'B', description: 'Prodotto B', stockQty: 0, reservedQty: 0, quarantineQty: 3, minStockQty: 0, purchasePrice: 0 }
  ]);
  assert(summary.productCount === 2, 'conteggio prodotti atteso');
  assert(summary.stockQty === 10, 'giacenza disponibile totale attesa');
  assert(summary.netQty === 8, 'giacenza netta totale attesa');
  assert(summary.quarantineQty === 4, 'quarantena totale attesa');
  assert(summary.stockValue === 50, 'valore disponibile atteso');
  assert(summary.quarantineValue === 5, 'valore quarantena atteso');
  assert(summary.totalValue === 55, 'valore totale atteso');
  assert(summary.underStockCount === 1, 'conteggio sotto scorta atteso');
  assert(summary.missingPriceCount === 1, 'conteggio prezzi mancanti atteso');
})();
