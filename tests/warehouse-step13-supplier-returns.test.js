(function () {
  window.TestHarness = window.TestHarness || { test: function(){}, assert: function(c,m){ if(!c) throw new Error(m||'assert'); }, assertEqual: function(a,b,m){ if(a!==b) throw new Error((m||'assertEqual')+' atteso '+b+' ottenuto '+a); } };
  const T = window.TestHarness;
  T.test('Step 13 - quarantena: reso fornitore scarica solo quarantena', function () {
    const product = { stockQty: 5, quarantineQty: 3 };
    const result = window.WarehouseMovementService.computeQuarantineActionResult(product, 'return_supplier', 2);
    T.assertEqual(result.stockAfter, 5, 'il reso non aumenta il disponibile');
    T.assertEqual(result.quarantineAfter, 1, 'il reso riduce la quarantena');
  });
  T.test('Step 13 - DDT reso fornitore riconosciuto come documento separato', function () {
    const ddt = window.SupplierDDTService.normalizeDDT({ ddtDirection:'return_supplier', status:'return_supplier', lines:[{ productId:'p1', productDescription:'Prodotto prova', returnQty:2, price:10 }] });
    T.assertEqual(ddt.ddtDirection, 'return_supplier', 'direzione DDT reso');
    T.assertEqual(ddt.status, 'return_supplier', 'stato DDT reso');
    T.assertEqual(ddt.lines[0].returnQty, 2, 'quantità resa preservata');
    T.assertEqual(ddt.total, 20, 'totale di riferimento su quantità resa');
    T.assertTrue(window.SupplierDDTService.isReturnDDT(ddt), 'il servizio distingue i DDT reso');
  });

  T.test('Step 13 UX - DDT fornitore in tab e macerati in sezione separata', function () {
    T.assertTrue(!!document.getElementById('supplier-ddt-received-tab'), 'tab DDT ricevuti presente');
    T.assertTrue(!!document.getElementById('supplier-ddt-return-tab'), 'tab DDT reso presente');
    T.assertTrue(!!document.getElementById('magazzino-macerati'), 'sezione separata prodotti macerati presente');
  });
  T.test('Step 13 - stampa DDT reso fornitore usa layout dedicato', function () {
    const html = window.DDTPrintService.buildPrintableDDT({ number:'DDR-F-2026-0001', date:'2026-05-01', supplierName:'Fornitore demo', ddtDirection:'return_supplier', lines:[{ productCode:'A1', productDescription:'Merce difettosa', returnQty:1 }] }, 'supplier_return');
    T.assertTrue(html.indexOf('DDT RESO FORNITORE') >= 0, 'titolo layout reso');
    T.assertTrue(html.indexOf('Q.tà resa') >= 0, 'colonna quantità resa');
  });
})();
if (window.TestHarness && typeof window.TestHarness.run === 'function') window.TestHarness.run();
