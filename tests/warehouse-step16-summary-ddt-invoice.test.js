(function () {
  const harness = window.TestHarness || { test: function(){}, assertEqual: function(){}, assert: function(){} };

  harness.test('Step 16 - fattura riepilogativa da DDT cliente multipli dello stesso cliente', function () {
    window.getData = function (name) {
      if (name === 'products') return [
        { id: 'p1', description: 'Prodotto A', salePrice: 10, vatRateId: 'iva_22', iva: '22' },
        { id: 'p2', description: 'Prodotto B', salePrice: 5, vatRateId: 'iva_22', iva: '22' }
      ];
      if (name === 'companyInfo') return { taxRegime: 'ordinario' };
      if (name === 'customers') return [{ id: 'c1', name: 'Cliente Test' }];
      return [];
    };
    const ddts = [
      { id: 'd1', number: 'DDC-1', date: '2026-05-01', customerId: 'c1', lines: [{ productId: 'p1', productDescription: 'Prodotto A', shippedQty: 2, price: 10 }] },
      { id: 'd2', number: 'DDC-2', date: '2026-05-02', customerId: 'c1', lines: [{ productId: 'p2', productDescription: 'Prodotto B', shippedQty: 3, price: 5 }] }
    ];
    const validation = window.DDTToInvoiceService.validateDDTsForSummaryInvoice(ddts);
    harness.assert(validation.ok, 'DDT dello stesso cliente validi');
    harness.assertEqual(validation.lines.length, 2, 'righe fattura da due DDT');
    harness.assert(validation.lines[0].productName.indexOf('DDT DDC-1') === 0, 'prefisso DDT presente in fattura riepilogativa');
    const src = window.DDTToInvoiceService.buildSourceInfoFromCustomerDDTs(ddts);
    harness.assertEqual(src.type, 'customer_ddt_summary', 'source type riepilogativo');
    harness.assertEqual(src.ids.length, 2, 'source info conserva entrambi i DDT');
  });

  harness.test('Step 16 - blocco DDT cliente di clienti diversi', function () {
    const result = window.DDTToInvoiceService.validateDDTsForSummaryInvoice([
      { id: 'd1', customerId: 'c1', lines: [{ productId: 'p1', shippedQty: 1, price: 1 }] },
      { id: 'd2', customerId: 'c2', lines: [{ productId: 'p1', shippedQty: 1, price: 1 }] }
    ]);
    harness.assert(!result.ok, 'clienti diversi non ammessi');
  });
})();
