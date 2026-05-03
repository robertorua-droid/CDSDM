(function () {
  const H = window.TestHarness;
  H.run('Step 12D - Elenchi ordini e filtri stato', function (h) {
    h.assert(window.CustomerOrderService && typeof window.CustomerOrderService.matchesStatusFilter === 'function', 'CustomerOrderService espone il filtro stato.');
    h.assert(window.SupplierOrderService && typeof window.SupplierOrderService.matchesStatusFilter === 'function', 'SupplierOrderService espone il filtro stato.');
    h.assertEqual(window.CustomerOrderService.statusLabels.confirmed, 'Aperto', 'Ordine cliente confermato mostrato come Aperto.');
    h.assertEqual(window.SupplierOrderService.statusLabels.confirmed, 'Aperto', 'Ordine fornitore confermato mostrato come Aperto.');
    h.assert(window.CustomerOrderService.matchesStatusFilter({ status: 'partially_fulfilled' }, 'open'), 'Filtro open include ordini cliente parzialmente evasi.');
    h.assert(window.SupplierOrderService.matchesStatusFilter({ status: 'partially_received' }, 'open'), 'Filtro open include ordini fornitore parzialmente ricevuti.');
    h.assert(!window.CustomerOrderService.matchesStatusFilter({ status: 'fulfilled' }, 'open'), 'Filtro open esclude ordini cliente evasi.');
    h.assert(!window.SupplierOrderService.matchesStatusFilter({ status: 'received' }, 'open'), 'Filtro open esclude ordini fornitore ricevuti.');
  });
})();
