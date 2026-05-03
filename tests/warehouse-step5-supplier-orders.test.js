(function () {
  const assert = window.TestHarness && window.TestHarness.assert;
  const test = window.TestHarness && window.TestHarness.test;
  if (!assert || !test) return;

  test('normalizeSupplierOrder calcola ricevuto residuo e totale', function () {
    const order = window.DomainNormalizers.normalizeSupplierOrder({
      id: '1',
      numero: 'OF-2026-0001',
      stato: 'confermato',
      fornitoreId: 'f1',
      fornitoreNome: 'Fornitore Demo',
      righe: [{ prodottoId: 'p1', descrizione: 'Prodotto A', quantita: 10, quantitaRicevuta: 3, prezzo: 4.5 }]
    });
    assert.equal(order.status, 'confirmed');
    assert.equal(order.supplierId, 'f1');
    assert.equal(order.lines[0].qty, 10);
    assert.equal(order.lines[0].receivedQty, 3);
    assert.equal(order.lines[0].remainingQty, 7);
    assert.equal(order.total, 45);
  });

  test('normalizeSupplierOrder conserva campi ricevimento futuri', function () {
    const order = window.DomainNormalizers.normalizeSupplierOrder({
      lines: [{ productId: 'p2', qty: 5, receivedQty: 5, acceptedQty: 3, quarantineQty: 1, rejectedQty: 1, unitCost: 2 }]
    });
    assert.equal(order.lines[0].acceptedQty, 3);
    assert.equal(order.lines[0].quarantineQty, 1);
    assert.equal(order.lines[0].rejectedQty, 1);
    assert.equal(order.total, 10);
  });
})();
