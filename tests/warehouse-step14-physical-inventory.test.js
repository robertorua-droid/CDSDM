(function () {
  const results = [];
  function test(name, fn) {
    try { fn(); results.push({ name, ok: true }); }
    catch (e) { results.push({ name, ok: false, error: e.message || String(e) }); }
  }

  test('menu Magazzino espone Giacenza prodotto e Inventario fisico', function () {
    if (!document.querySelector('[data-target="magazzino-giacenza-prodotto"]')) throw new Error('Voce Giacenza prodotto assente');
    if (!document.querySelector('[data-target="magazzino-inventario-fisico"]')) throw new Error('Voce Inventario fisico assente');
  });

  test('sezioni operative inventario fisico presenti', function () {
    if (!document.getElementById('warehouseStockQueryProduct')) throw new Error('Select giacenza prodotto assente');
    if (!document.getElementById('warehouse-physical-inventory-table-body')) throw new Error('Tabella inventario fisico assente');
    if (!document.getElementById('warehousePhysicalApplyBtn')) throw new Error('Pulsante allinea inventario assente');
  });

  window.__warehouseStep14PhysicalInventoryResults = results;
})();
