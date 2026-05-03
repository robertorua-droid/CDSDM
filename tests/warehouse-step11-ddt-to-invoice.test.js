(function () {
  const harness = window.TestHarness || { test: function(){}, assertEqual: function(){}, assert: function(){} };
  harness.test('Step 11 - DDT cliente genera righe fattura senza movimentare magazzino', function () {
    window.getData = function (name) {
      if (name === 'products') return [{ id: 'p1', description: 'Prodotto A', salePrice: 12, vatRateId: 'iva_22', iva: '22' }];
      if (name === 'companyInfo') return { taxRegime: 'ordinario' };
      if (name === 'customers') return [{ id: 'c1', name: 'Cliente Test' }];
      return [];
    };
    const ddt = { id: 'd1', number: 'DDC-2026-0001', date: '2026-04-30', customerId: 'c1', lines: [{ productId: 'p1', productDescription: 'Prodotto A', shippedQty: 3, price: 12 }] };
    const lines = window.DDTToInvoiceService.buildInvoiceLinesFromCustomerDDT(ddt);
    harness.assertEqual(lines.length, 1, 'una riga fattura generata');
    harness.assertEqual(lines[0].qty, 3, 'quantità dal DDT');
    harness.assertEqual(lines[0].price, 12, 'prezzo dal DDT');
    harness.assertEqual(lines[0].sourceCustomerDDTId, 'd1', 'metadato sorgente DDT');
    const src = window.DDTToInvoiceService.buildSourceInfo(ddt);
    harness.assertEqual(src.ids[0], 'd1', 'source info contiene DDT');
  });
})();
