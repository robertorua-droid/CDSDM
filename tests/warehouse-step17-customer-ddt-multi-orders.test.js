(function () {
  const h = window.TestHarness;

  h.test('Step 17 - normalizzazione DDT cliente conserva origine da ordini multipli', function () {
    const ddt = window.DomainNormalizers.normalizeCustomerDDT({
      id: 'ddt1',
      sourceType: 'customer_orders',
      sourceOrderIds: ['o1', 'o2'],
      sourceOrderNumbers: ['OC-1', 'OC-2'],
      sourceDocuments: [
        { type: 'customer_order', id: 'o1', number: 'OC-1' },
        { type: 'customer_order', id: 'o2', number: 'OC-2' }
      ],
      lines: [
        { productId: 'p1', productDescription: 'Prodotto A', shippedQty: 2, price: 10, sourceOrderId: 'o1', sourceOrderLineIndex: 0 },
        { productId: 'p2', productDescription: 'Prodotto B', shippedQty: 3, price: 5, sourceOrderId: 'o2', sourceOrderLineIndex: 1 }
      ]
    });
    h.assertEqual(ddt.sourceType, 'customer_orders', 'origine multi-ordine conservata');
    h.assertDeepEqual(ddt.sourceOrderIds, ['o1', 'o2'], 'ID ordini sorgente conservati');
    h.assertEqual(ddt.lines[1].sourceOrderId, 'o2', 'origine riga conservata');
    h.assertEqual(ddt.total, 35, 'totale DDT calcolato dalle righe');
  });

  h.test('Step 17 - aggiornamento singolo ordine da righe DDT filtrate per sourceOrderId', function () {
    const order = window.DomainNormalizers.normalizeCustomerOrder({
      id: 'o1',
      status: 'confirmed',
      lines: [
        { productId: 'p1', qty: 5, fulfilledQty: 1, price: 10 },
        { productId: 'p2', qty: 4, fulfilledQty: 0, price: 5 }
      ]
    });
    const updated = window.CustomerDDTService.updateOrderFromDDT(order, [
      { productId: 'p1', shippedQty: 2, sourceOrderId: 'o1', sourceOrderLineIndex: 0 },
      { productId: 'p2', shippedQty: 99, sourceOrderId: 'o2', sourceOrderLineIndex: 0 }
    ]);
    h.assertEqual(updated.lines[0].fulfilledQty, 3, 'aggiorna solo la riga del relativo ordine');
    h.assertEqual(updated.lines[1].fulfilledQty, 0, 'ignora righe DDT di altri ordini');
    h.assertEqual(updated.status, 'partially_fulfilled', 'stato parziale');
  });

  h.test('Step 17 - buildProductResults aggrega lo scarico per prodotto', function () {
    window.getData = function (name) {
      if (name === 'products') return [
        { id: 'p1', itemType: 'product', description: 'Prodotto A', stockQty: 10, quarantineQty: 0 }
      ];
      return [];
    };
    const result = window.CustomerDDTService.buildProductResults([
      { productId: 'p1', productDescription: 'Prodotto A', shippedQty: 2 },
      { productId: 'p1', productDescription: 'Prodotto A', shippedQty: 3 }
    ]);
    h.assertEqual(result.p1.shipped, 5, 'quantità scaricata aggregata');
    h.assertEqual(result.p1.stockAfter, 5, 'giacenza dopo scarico');
  });
})();
