(function () {
  const service = window.DDTPrintService;
  TestHarness.assert('DDTPrintService esposto', !!service && typeof service.buildPrintableDDT === 'function');
  const html = service.buildPrintableDDT({ number:'DDC-2026-0001', date:'2026-04-30', customerName:'Cliente Test', transportReason:'Vendita', lines:[{ productCode:'P1', productDescription:'Prodotto test', unitOfMeasure:'pz', shippedQty:2, price:10 }] }, 'customer');
  TestHarness.assert('stampa DDT cliente contiene titolo e prodotto', html.indexOf('DOCUMENTO DI TRASPORTO CLIENTE') >= 0 && html.indexOf('Prodotto test') >= 0);
  const html2 = service.buildPrintableDDT({ number:'DDF-2026-0001', supplierName:'Fornitore Test', lines:[{ productCode:'P2', productDescription:'Merce', receivedQty:3, acceptedQty:2, quarantineQty:1, rejectedQty:0, price:5 }] }, 'supplier');
  TestHarness.assert('stampa DDT fornitore contiene quarantena', html2.indexOf('DDT FORNITORE') >= 0 && html2.indexOf('Quarant.') >= 0);
})();