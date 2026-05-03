(function () {
  const T = window.TestHarness;
  const products = [{ id: 'p1', code: 'A', description: 'Prodotto A', salePrice: 10, iva: '22' }];
  window.getData = function (name) {
    if (name === 'products') return products;
    if (name === 'companyInfo') return { regime: 'ordinario' };
    return [];
  };
  window.VatRateCatalog = { getLegacyFields: function () { return { iva: '22', esenzioneIva: '' }; } };
  window.TaxRegimePolicy = { getCapabilities: function () { return { isForfettario: false }; } };

  const ddts = [
    { id: 'd1', number: 'DDT-1', date: '2026-05-01', customerId: 'c1', lines: [{ productId: 'p1', productDescription: 'Prodotto A', shippedQty: 2, price: 10 }] },
    { id: 'd2', number: 'DDT-2', date: '2026-05-03', customerId: 'c1', lines: [{ productId: 'p1', productDescription: 'Prodotto A', shippedQty: 3, price: 10 }] }
  ];

  T.test('Fattura riepilogativa: aggrega prodotti uguali', function () {
    const lines = window.DDTToInvoiceService.buildInvoiceLinesFromCustomerDDTs(ddts, { groupingMode: 'aggregate_product' });
    T.assertEqual(lines.length, 1, 'Le righe uguali devono essere accorpate');
    T.assertApprox(lines[0].qty, 5, 0.0001, 'Quantità aggregata');
    T.assertApprox(lines[0].subtotal, 50, 0.0001, 'Subtotale aggregato');
    T.assertDeepEqual(lines[0].sourceCustomerDDTIds, ['d1', 'd2'], 'Riferimenti DDT conservati');
  });

  T.test('Fattura riepilogativa: conserva opzioni e nota sorgente', function () {
    const source = window.DDTToInvoiceService.buildSourceInfoFromCustomerDDTs(ddts, { groupingMode: 'aggregate_product', lineOrder: 'product', includeSummaryNote: true, includeXmlDatiDDT: true });
    T.assertEqual(source.summaryOptions.groupingMode, 'aggregate_product', 'Opzione raggruppamento conservata');
    T.assertIncludes(source.summaryNote, 'DDT-1', 'Nota contiene primo DDT');
    T.assertIncludes(source.summaryNote, 'DDT-2', 'Nota contiene secondo DDT');
  });

  T.run('test-results');
})();
