(function () {
  const h = window.TestHarness;

  function seed(data) {
    window.getData = function (name) { return data[name] || []; };
    window.AppStore = null;
  }

  h.test('Step 20 - ordine cliente mostra DDT e fattura indiretta', function () {
    seed({
      customerOrders: [{ id: 'o1', number: 'OC-1' }],
      customerDDTs: [{ id: 'd1', number: 'DDT-1', sourceOrderIds: ['o1'], invoiceId: 'i1', invoiceNumber: 'F-1' }],
      invoices: [{ id: 'i1', number: 'F-1', sourceCustomerDDTIds: ['d1'] }]
    });
    const docs = window.DocumentLinksService.build('customer_order', { id: 'o1', number: 'OC-1' });
    h.assert(docs.some(function (d) { return d.type === 'customer_ddt' && d.id === 'd1'; }), 'trova DDT cliente collegato');
    h.assert(docs.some(function (d) { return d.type === 'invoice' && d.id === 'i1'; }), 'trova fattura collegata tramite DDT');
  });

  h.test('Step 20 - fattura mostra DDT inclusi, ordini indiretti e timesheet', function () {
    seed({
      customerOrders: [{ id: 'o1', number: 'OC-1' }],
      customerDDTs: [{ id: 'd1', number: 'DDT-1', sourceOrderIds: ['o1'] }],
      worklogs: [{ id: 'w1', invoiceId: 'i1' }, { id: 'w2', invoiceId: 'i1' }]
    });
    const docs = window.DocumentLinksService.build('invoice', { id: 'i1', number: 'F-1', sourceCustomerDDTIds: ['d1'] });
    h.assert(docs.some(function (d) { return d.type === 'customer_ddt' && d.id === 'd1'; }), 'trova DDT incluso');
    h.assert(docs.some(function (d) { return d.type === 'customer_order' && d.id === 'o1'; }), 'trova ordine origine indiretto');
    h.assert(docs.some(function (d) { return d.type === 'worklog' && d.number === '2'; }), 'trova timesheet collegati');
  });

  h.test('Step 20 - DDT fornitore mostra ordine sorgente e movimenti', function () {
    seed({
      supplierOrders: [{ id: 'so1', number: 'OF-1' }],
      warehouseMovements: [{ id: 'm1', documentType: 'supplier_ddt', documentId: 'sd1' }]
    });
    const docs = window.DocumentLinksService.build('supplier_ddt', { id: 'sd1', number: 'DF-1', sourceOrderIds: ['so1'] });
    h.assert(docs.some(function (d) { return d.type === 'supplier_order' && d.id === 'so1'; }), 'trova ordine fornitore sorgente');
    h.assert(docs.some(function (d) { return d.type === 'warehouse_movement' && d.number === '1'; }), 'trova movimenti di magazzino');
  });

  h.test('Step 20 - render produce scheda Documenti collegati', function () {
    seed({ customerDDTs: [] });
    const html = window.DocumentLinksService.renderFor('customer_order', { id: 'o1' });
    h.assert(html.indexOf('Documenti collegati') !== -1, 'titolo presente');
  });
})();
