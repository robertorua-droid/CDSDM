(function () {
  window.globalData = window.globalData || {};
  window.globalData.products = [
    { id:'p1', itemType:'product', code:'P1', description:'Prodotto acquisto', purchasePrice:10, salePrice:20 },
    { id:'p2', itemType:'product', code:'P2', description:'Prodotto vendita', purchasePrice:5, salePrice:30 }
  ];
  const service = window.WarehousePriceUpdateService;
  TestHarness.assert('WarehousePriceUpdateService esposto', !!service && typeof service.buildUpdatesFromDocument === 'function');
  const purchaseUpdates = service.buildUpdatesFromDocument({ id:'d1', number:'DDF-1', date:'2026-04-30', lines:[{ productId:'p1', price:12.5, receivedQty:1 }] }, 'purchase');
  TestHarness.assertEqual('prezzo acquisto proposto da DDT fornitore', purchaseUpdates[0].proposedPrice, 12.5);
  TestHarness.assertEqual('campo aggiornato acquisto', purchaseUpdates[0].priceField, 'purchasePrice');
  const saleUpdates = service.buildUpdatesFromDocument({ id:'d2', number:'DDC-1', date:'2026-04-30', lines:[{ productId:'p2', price:34, shippedQty:2 }] }, 'sale');
  TestHarness.assertEqual('prezzo vendita proposto da DDT cliente', saleUpdates[0].proposedPrice, 34);
  TestHarness.assertEqual('campo aggiornato vendita', saleUpdates[0].priceField, 'salePrice');
  const noUpdates = service.buildUpdatesFromDocument({ id:'d3', lines:[{ productId:'p1', price:10 }] }, 'purchase');
  TestHarness.assertEqual('nessun aggiornamento se prezzo invariato', noUpdates.length, 0);
})();
