(function () {
  const n = window.DomainNormalizers;
  test('normalizeCustomerDDT normalizza righe consegnate e totale', function () {
    const ddt = n.normalizeCustomerDDT({ number: 'DDC-2026-0001', customerId: 1, lines: [{ productId: 10, quantity: '2', price: '12.50' }] });
    assertEqual(ddt.sourceType, 'direct', 'origine diretta default');
    assertEqual(ddt.lines[0].shippedQty, 2, 'quantità consegnata');
    assertEqual(ddt.total, 25, 'totale');
  });
})();
