// Test browser-based: gestione quarantena (Step 7)
(function () {
  const assert = window.assert || function (condition, message) { if (!condition) throw new Error(message || 'Assertion failed'); };
  const svc = window.WarehouseMovementService;
  if (!svc || typeof svc.computeQuarantineActionResult !== 'function') return;

  let out = svc.computeQuarantineActionResult({ stockQty: 10, quarantineQty: 5 }, 'release', 2);
  assert(out.stockAfter === 12 && out.quarantineAfter === 3, 'sblocco quarantena atteso');

  out = svc.computeQuarantineActionResult({ stockQty: 10, quarantineQty: 5 }, 'discard', 2);
  assert(out.stockAfter === 10 && out.quarantineAfter === 3, 'scarto quarantena atteso');

  out = svc.computeQuarantineActionResult({ stockQty: 10, quarantineQty: 5 }, 'return_supplier', 4);
  assert(out.stockAfter === 10 && out.quarantineAfter === 1, 'reso fornitore da quarantena atteso');

  let failed = false;
  try { svc.computeQuarantineActionResult({ stockQty: 10, quarantineQty: 1 }, 'release', 2); }
  catch (e) { failed = true; }
  assert(failed, 'blocco quantità superiore alla quarantena atteso');
})();
