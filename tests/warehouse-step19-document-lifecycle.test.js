(function () {
  const h = window.TestHarness;

  h.test('Step 19 - blocca eliminazione ordine cliente collegato a DDT', function () {
    window.getData = function (name) {
      if (name === 'customerDDTs') return [{ id: 'd1', sourceOrderIds: ['o1'], status: 'delivered' }];
      return [];
    };
    const guard = window.DocumentLifecycleService.canDeleteCustomerOrder({ id: 'o1', status: 'confirmed', lines: [{ qty: 2, fulfilledQty: 0 }] });
    h.assertEqual(guard.ok, false, 'ordine collegato a DDT non eliminabile');
  });

  h.test('Step 19 - blocca eliminazione ordine fornitore collegato a DDT ricevuto', function () {
    window.getData = function (name) {
      if (name === 'supplierDDTs') return [{ id: 'sf1', sourceDocuments: [{ type: 'supplier_order', id: 'so1' }] }];
      return [];
    };
    const guard = window.DocumentLifecycleService.canDeleteSupplierOrder({ id: 'so1', status: 'confirmed', lines: [{ qty: 5, receivedQty: 0 }] });
    h.assertEqual(guard.ok, false, 'ordine fornitore collegato a DDT non eliminabile');
  });

  h.test('Step 19 - blocca DDT cliente già fatturato', function () {
    const guard = window.DocumentLifecycleService.canDeleteCustomerDDT({ id: 'd1', invoiceId: '10', invoiceNumber: 'F-1' });
    h.assertEqual(guard.ok, false, 'DDT fatturato bloccato');
  });

  h.test('Step 19 - warning fattura include rollback Timesheet e DDT', function () {
    const msg = window.DocumentLifecycleService.buildInvoiceDeleteWarning({
      id: '10',
      timesheetImport: { worklogIds: ['w1', 'w2'] },
      sourceCustomerDDTIds: ['d1', 'd2', 'd2']
    });
    h.assert(msg.indexOf('2 record Timesheet') !== -1, 'include conteggio Timesheet');
    h.assert(msg.indexOf('2 DDT cliente') !== -1, 'include conteggio DDT univoci');
  });
})();
