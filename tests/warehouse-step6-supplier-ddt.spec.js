(function () {
  const assert = window.TestHarness ? window.TestHarness.assert : function (cond, msg) { if (!cond) throw new Error(msg || 'assert'); };
  const normalize = window.DomainNormalizers && window.DomainNormalizers.normalizeSupplierDDT;
  assert(typeof normalize === 'function', 'normalizeSupplierDDT disponibile');
  const ddt = normalize({ lines: [{ receivedQty: 10, acceptedQty: 6, quarantineQty: 3, rejectedQty: 1, price: 2 }] });
  assert(ddt.lines[0].receivedQty === 10, 'receivedQty normalizzata');
  assert(ddt.lines[0].acceptedQty === 6, 'acceptedQty normalizzata');
  assert(ddt.lines[0].quarantineQty === 3, 'quarantineQty normalizzata');
  assert(ddt.lines[0].rejectedQty === 1, 'rejectedQty normalizzata');
  assert(ddt.total === 20, 'totale DDT calcolato su quantità ricevuta');
  if (window.TestHarness) window.TestHarness.pass('supplier-ddt-step6');
})();
