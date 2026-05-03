// Test browser-based: motore movimenti magazzino (Step 2)
(function () {
  const assert = window.assert || function (condition, message) { if (!condition) throw new Error(message || 'Assertion failed'); };
  const svc = window.WarehouseMovementService;
  if (!svc || typeof svc.computeMovementResult !== 'function') return;
  let out = svc.computeMovementResult({ stockQty: 10, quarantineQty: 2 }, 'CARICO', 5);
  assert(out.stockAfter === 15 && out.quarantineAfter === 2, 'carico disponibile atteso');
  out = svc.computeMovementResult({ stockQty: 10, quarantineQty: 2 }, 'SCARICO', 4);
  assert(out.stockAfter === 6 && out.quarantineAfter === 2, 'scarico disponibile atteso');
  out = svc.computeMovementResult({ stockQty: 10, quarantineQty: 2 }, 'QUARANTENA_IN', 3);
  assert(out.stockAfter === 7 && out.quarantineAfter === 5, 'spostamento in quarantena atteso');
  out = svc.computeMovementResult({ stockQty: 10, quarantineQty: 2 }, 'QUARANTENA_OUT', 2);
  assert(out.stockAfter === 12 && out.quarantineAfter === 0, 'sblocco da quarantena atteso');
})();
