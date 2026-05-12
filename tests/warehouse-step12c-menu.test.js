(function () {
  const H = window.TestHarness;
  H.run('Step 12C Menu - aree operative', function (h) {
    const expectedAreas = ['Anagrafiche', 'Vendite', 'Acquisti', 'Magazzino', 'Impostazioni'];
    h.assertEqual(expectedAreas.length, 5, 'Le aree operative principali sono definite.');
    const venditeItems = ['Preventivi', 'Ordini cliente', 'DDT cliente', 'Elenco documenti vendita'];
    const acquistiItems = ['Ordini fornitore', 'DDT fornitore', 'Nuovo Acquisto', 'Elenco Acquisti'];
    const magazzinoItems = ['Giacenze', 'Inventario valorizzato', 'Movimenti', 'Quarantena', 'Prodotti macerati'];
    h.assert(venditeItems.includes('Preventivi'), 'Vendite include la voce predisposta Preventivi.');
    h.assert(!magazzinoItems.includes('DDT cliente'), 'I DDT cliente non appartengono più al gruppo Magazzino.');
    h.assert(acquistiItems.includes('DDT fornitore'), 'Acquisti include i DDT fornitore.');
    h.assert(magazzinoItems.includes('Prodotti macerati'), 'Magazzino include la voce separata Prodotti macerati.');
  });
})();
