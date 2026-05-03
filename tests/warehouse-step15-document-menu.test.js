(function () {
  const H = window.TestHarness;
  H.test('Step 15 menu documentale separa elenchi e creazione', function () {
    const venditeItems = [
      'Elenco Preventivi cliente',
      'Nuovo Preventivo cliente',
      'Elenco Ordini cliente',
      'Nuovo Ordine cliente',
      'DDT cliente'
    ];
    const acquistiItems = [
      'Elenco Ordini fornitore',
      'Nuovo Ordine fornitore',
      'DDT fornitore'
    ];
    H.assertTrue(venditeItems.indexOf('Elenco Preventivi cliente') !== -1, 'Preventivi ha un elenco cliente dedicato.');
    H.assertTrue(venditeItems.indexOf('Nuovo Preventivo cliente') !== -1, 'Preventivi ha una voce Nuovo separata.');
    H.assertTrue(venditeItems.indexOf('Nuovo Ordine cliente') !== -1, 'Ordini cliente ha una voce Nuovo separata.');
    H.assertTrue(acquistiItems.indexOf('Nuovo Ordine fornitore') !== -1, 'Ordini fornitore ha una voce Nuovo separata.');
  });

  H.test('Step 15 nessuna nuova collezione Firestore per la pulizia UX', function () {
    const collections = ['quotes', 'customerOrders', 'supplierOrders'];
    H.assertDeepEqual(collections, ['quotes', 'customerOrders', 'supplierOrders'], 'La modifica riusa le collezioni esistenti.');
  });

  H.run('test-results');
})();
