(function () {
  const h = window.TestHarness;

  h.test('Step 18 - normalizzazione DDT fornitore conserva origine da ordini multipli', function () {
    const ddt = window.DomainNormalizers.normalizeSupplierDDT({
      id: 'ddf1',
      sourceType: 'supplier_orders',
      sourceOrderIds: ['of1', 'of2'],
      sourceOrderNumbers: ['OF-1', 'OF-2'],
      sourceDocuments: [
        { type: 'supplier_order', id: 'of1', number: 'OF-1' },
        { type: 'supplier_order', id: 'of2', number: 'OF-2' }
      ],
      lines: [
        { productId: 'p1', productDescription: 'Prodotto A', receivedQty: 2, acceptedQty: 1, quarantineQty: 1, rejectedQty: 0, price: 10, sourceOrderId: 'of1', sourceOrderLineIndex: 0 },
        { productId: 'p2', productDescription: 'Prodotto B', receivedQty: 3, acceptedQty: 3, quarantineQty: 0, rejectedQty: 0, price: 5, sourceOrderId: 'of2', sourceOrderLineIndex: 1 }
      ]
    });
    h.assertEqual(ddt.sourceType, 'supplier_orders', 'origine multi-ordine conservata');
    h.assertDeepEqual(ddt.sourceOrderIds, ['of1', 'of2'], 'ID ordini fornitore sorgente conservati');
    h.assertEqual(ddt.lines[1].sourceOrderId, 'of2', 'origine riga conservata');
    h.assertEqual(ddt.total, 35, 'totale DDT calcolato dalle quantità ricevute');
  });

  h.test('Step 18 - aggiornamento ordine fornitore filtra righe per sourceOrderId', function () {
    const order = window.DomainNormalizers.normalizeSupplierOrder({
      id: 'of1',
      status: 'confirmed',
      lines: [
        { productId: 'p1', qty: 5, receivedQty: 1, price: 10 },
        { productId: 'p2', qty: 4, receivedQty: 0, price: 5 }
      ]
    });
    const updated = window.SupplierDDTService.updateOrderFromDDT(order, [
      { productId: 'p1', receivedQty: 2, sourceOrderId: 'of1', sourceOrderLineIndex: 0 },
      { productId: 'p2', receivedQty: 99, sourceOrderId: 'of2', sourceOrderLineIndex: 0 }
    ]);
    h.assertEqual(updated.lines[0].receivedQty, 3, 'aggiorna solo la riga del relativo ordine');
    h.assertEqual(updated.lines[1].receivedQty, 0, 'ignora righe DDT di altri ordini');
    h.assertEqual(updated.status, 'partially_received', 'stato parzialmente ricevuto');
  });

  h.test('Step 18 - buildProductResults aggrega accettato e quarantena', function () {
    window.getData = function (name) {
      if (name === 'products') return [
        { id: 'p1', itemType: 'product', description: 'Prodotto A', stockQty: 10, quarantineQty: 2 }
      ];
      return [];
    };
    const result = window.SupplierDDTService.buildProductResults([
      { productId: 'p1', productDescription: 'Prodotto A', acceptedQty: 2, quarantineQty: 1 },
      { productId: 'p1', productDescription: 'Prodotto A', acceptedQty: 3, quarantineQty: 2 }
    ]);
    h.assertEqual(result.p1.accepted, 5, 'quantità accettata aggregata');
    h.assertEqual(result.p1.quarantine, 3, 'quantità in quarantena aggregata');
    h.assertEqual(result.p1.stockAfter, 15, 'giacenza disponibile dopo carico');
    h.assertEqual(result.p1.quarantineAfter, 5, 'quarantena dopo carico');
  });
})();
