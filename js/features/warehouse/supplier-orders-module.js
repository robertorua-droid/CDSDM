// js/features/warehouse/supplier-orders-module.js
// Step 5: ordini fornitore base, preparatori per DDT fornitore e ricevimento merci.
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.supplierOrders = window.AppModules.supplierOrders || {};

  let _bound = false;
  let tempLines = [];
  let currentDetailId = null;

  const STATUS_LABELS = {
    draft: 'Bozza',
    confirmed: 'Aperto',
    partially_received: 'Parzialmente ricevuto',
    received: 'Ricevuto',
    cancelled: 'Annullato'
  };

  function esc(v) {
    if (window.VatRateCatalog && typeof window.VatRateCatalog.escapeHtml === 'function') return window.VatRateCatalog.escapeHtml(v);
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; });
  }
  function num(v) { const n = parseFloat(String(v == null ? 0 : v).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmtQty(v) { return num(v).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 3 }); }
  function fmtMoney(v) { return '€ ' + num(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function formatDate(v) { if (!v) return '-'; const p = String(v).slice(0,10).split('-'); return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : String(v); }
  function emptyState(title, hint) { return '<div class="warehouse-empty-state"><i class="fas fa-circle-info mb-2"></i><span class="empty-title">'+esc(title)+'</span><span class="empty-hint">'+esc(hint || '')+'</span></div>'; }

  function statusBadgeClass(status) {
    if (status === 'cancelled') return 'text-bg-secondary';
    if (status === 'received') return 'text-bg-success';
    if (status === 'partially_received') return 'text-bg-warning';
    if (status === 'confirmed') return 'text-bg-primary';
    return 'text-bg-light text-dark';
  }

  function getStatusFilter() {
    return $('#supplierOrderStatusFilter').val() || 'all';
  }

  function matchesStatusFilter(order, filter) {
    if (!filter || filter === 'all') return true;
    if (filter === 'open') return ['confirmed', 'partially_received'].indexOf(order.status) !== -1;
    return order.status === filter;
  }

  function renderSummary(orders) {
    const $summary = $('#supplier-orders-summary');
    if (!$summary.length) return;
    const counts = orders.reduce(function (acc, o) {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    const cards = [
      { label: 'Bozze', value: counts.draft || 0, hint: 'da approvare nel Workflow' },
      { label: 'Confermati', value: counts.confirmed || 0, hint: 'lavorabili in DDT' },
      { label: 'Parzialmente ricevuti', value: counts.partially_received || 0, hint: 'ricevimento parziale' },
      { label: 'Ricevuti', value: counts.received || 0, hint: 'completati' },
      { label: 'Annullati', value: counts.cancelled || 0, hint: 'non operativi' }
    ];
    $summary.html(cards.map(function (c) {
      return '<div class="col-6 col-lg-2"><div class="card h-100 shadow-sm border-0"><div class="card-body py-2"><div class="small text-muted">'+esc(c.label)+'</div><div class="h4 mb-0">'+esc(c.value)+'</div><div class="small text-muted">'+esc(c.hint)+'</div></div></div></div>';
    }).join(''));
  }

  function getStoreArray(key) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    if (typeof window.getData === 'function') return window.getData(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }
  function normalizeOrder(o) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeSupplierOrder === 'function'
      ? window.DomainNormalizers.normalizeSupplierOrder(o)
      : (o || {});
  }
  function normalizeProduct(p) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function'
      ? window.DomainNormalizers.normalizeProductInfo(p)
      : (p || {});
  }
  function getOrders() {
    return getStoreArray('supplierOrders').map(normalizeOrder).sort(function (a, b) {
      const da = String(a.date || '') + ' ' + String(a.number || '') + ' ' + String(a.id || '');
      const db = String(b.date || '') + ' ' + String(b.number || '') + ' ' + String(b.id || '');
      return db.localeCompare(da);
    });
  }
  function getSuppliers() { return getStoreArray('suppliers') || []; }
  function getProducts() { return (getStoreArray('products') || []).map(normalizeProduct).filter(function (p) { return p.itemType === 'product'; }); }

  function getNextOrderId() {
    const ids = getStoreArray('supplierOrders').map(function (o) { return parseInt(o.id, 10); }).filter(function (n) { return !isNaN(n); });
    return ids.length ? Math.max.apply(null, ids) + 1 : 1;
  }
  function previewOrderNumber() {
    const year = new Date().getFullYear();
    const max = getStoreArray('supplierOrders').reduce(function (acc, o) {
      const n = String(o.number || o.numero || '');
      const m = n.match(/^OF-(\d{4})-(\d+)$/);
      if (m && String(m[1]) === String(year)) return Math.max(acc, parseInt(m[2], 10) || 0);
      return acc;
    }, 0);
    return 'OF-' + year + '-' + String(max + 1).padStart(4, '0');
  }

  function renderSupplierOptions() {
    const $sel = $('#supplierOrder-supplierId');
    if (!$sel.length) return;
    const cur = $sel.val();
    $sel.empty().append('<option value="">Seleziona fornitore...</option>');
    getSuppliers().forEach(function (s) {
      const label = s.name || s.nome || s.ragioneSociale || s.denominazione || s.email || ('Fornitore ' + s.id);
      $sel.append('<option value="'+esc(s.id)+'">'+esc(label)+'</option>');
    });
    if (cur) $sel.val(cur);
  }

  function renderProductOptions() {
    const $sel = $('#supplierOrder-productId');
    if (!$sel.length) return;
    const cur = $sel.val();
    $sel.empty().append('<option value="">Seleziona prodotto...</option>');
    getProducts().forEach(function (p) {
      const label = (p.code ? p.code + ' - ' : '') + (p.description || 'Prodotto') + ' · prezzo acq. ' + fmtMoney(p.purchasePrice || 0);
      $sel.append('<option value="'+esc(p.id)+'" data-price="'+esc(p.purchasePrice || 0)+'">'+esc(label)+'</option>');
    });
    if (cur) $sel.val(cur);
    syncSelectedProductPrice();
  }

  function syncSelectedProductPrice() {
    const id = $('#supplierOrder-productId').val();
    const p = getProducts().find(function (x) { return String(x.id) === String(id); });
    if (p && !$('#supplierOrder-linePrice').data('manual')) $('#supplierOrder-linePrice').val(num(p.purchasePrice).toFixed(2));
  }

  function recalcTempLines() {
    const $body = $('#supplierOrder-lines-body');
    if (!$body.length) return;
    $body.empty();
    if (!tempLines.length) {
      $body.append('<tr><td colspan="7" class="text-center text-muted py-3">Nessuna riga inserita.</td></tr>');
    } else {
      tempLines.forEach(function (l, i) {
        $body.append('<tr>'+
          '<td>'+esc(l.productCode || '')+'</td>'+
          '<td>'+esc(l.productDescription || '')+'</td>'+
          '<td>'+esc(l.unitOfMeasure || 'pz')+'</td>'+
          '<td class="text-end">'+fmtQty(l.qty)+'</td>'+
          '<td class="text-end">'+fmtMoney(l.price)+'</td>'+
          '<td class="text-end fw-semibold">'+fmtMoney(l.qty * l.price)+'</td>'+
          '<td class="text-end"><button class="btn btn-outline-danger supplier-order-remove-line" data-index="'+i+'" type="button" title="Elimina"><i class="fas fa-trash"></i></button></div></td>'+
        '</tr>');
      });
    }
    const total = tempLines.reduce(function (sum, l) { return sum + num(l.qty) * num(l.price); }, 0);
    $('#supplierOrder-total').text(fmtMoney(total));
  }

  function resetForm() {
    const form = document.getElementById('supplierOrderForm');
    if (form) form.reset();
    $('#supplierOrder-id').val('');
    $('#supplierOrder-number').val(previewOrderNumber());
    $('#supplierOrder-date').val(today());
    $('#supplierOrder-expectedDeliveryDate').val('');
    $('#supplierOrder-status').val('draft');
    tempLines = [];
    renderSupplierOptions();
    renderProductOptions();
    $('#supplierOrder-lineQty').val('1');
    $('#supplierOrder-linePrice').data('manual', false);
    recalcTempLines();
  }

  function addLine() {
    const productId = $('#supplierOrder-productId').val();
    const qty = num($('#supplierOrder-lineQty').val());
    const price = num($('#supplierOrder-linePrice').val());
    if (!productId) { alert('Seleziona un prodotto.'); return; }
    if (qty <= 0) { alert('Inserisci una quantità maggiore di zero.'); return; }
    const p = getProducts().find(function (x) { return String(x.id) === String(productId); });
    if (!p) { alert('Prodotto non trovato.'); return; }
    tempLines.push({
      productId: String(p.id),
      productCode: p.code || '',
      productDescription: p.description || '',
      description: p.description || '',
      unitOfMeasure: p.unitOfMeasure || 'pz',
      qty: qty,
      orderedQty: qty,
      receivedQty: 0,
      acceptedQty: 0,
      quarantineQty: 0,
      rejectedQty: 0,
      remainingQty: qty,
      price: price,
      purchasePrice: price,
      unitCost: price,
      lineTotal: qty * price
    });
    $('#supplierOrder-lineQty').val('1');
    $('#supplierOrder-linePrice').data('manual', false);
    syncSelectedProductPrice();
    recalcTempLines();
  }

  async function saveOrder() {
    const supplierId = $('#supplierOrder-supplierId').val();
    const supplier = getSuppliers().find(function (s) { return String(s.id) === String(supplierId); });
    if (!supplier) { alert('Seleziona un fornitore.'); return; }
    if (!tempLines.length) { alert('Aggiungi almeno una riga prodotto.'); return; }
    const id = String($('#supplierOrder-id').val() || getNextOrderId());
    const supplierName = supplier.name || supplier.nome || supplier.ragioneSociale || supplier.denominazione || '';
    const raw = {
      id: id,
      number: ($('#supplierOrder-number').val() || previewOrderNumber()).trim(),
      date: $('#supplierOrder-date').val() || today(),
      expectedDeliveryDate: $('#supplierOrder-expectedDeliveryDate').val() || '',
      supplierId: String(supplier.id),
      supplierName: supplierName,
      status: $('#supplierOrder-status').val() || 'draft',
      lines: tempLines,
      notes: ($('#supplierOrder-notes').val() || '').trim(),
      updatedAt: new Date().toISOString()
    };
    if (!getStoreArray('supplierOrders').some(function (o) { return String(o.id) === id; })) raw.createdAt = raw.updatedAt;
    const order = normalizeOrder(raw);
    try {
      $('#saveSupplierOrderBtn').prop('disabled', true);
      await window.saveDataToCloud('supplierOrders', order, id);
      $('#supplierOrderModal').modal('hide');
      render();
    } finally {
      $('#saveSupplierOrderBtn').prop('disabled', false);
    }
  }

  function render() {
    renderSupplierOptions();
    renderProductOptions();
    const $body = $('#supplier-orders-table-body');
    if (!$body.length) return;
    $body.empty();
    const allOrders = getOrders();
    renderSummary(allOrders);
    const filter = getStatusFilter();
    const orders = allOrders.filter(function (o) { return matchesStatusFilter(o, filter); });
    if (!allOrders.length) {
      $body.append('<tr><td colspan="9">' + emptyState('Nessun ordine fornitore registrato', 'Crea un ordine fornitore per preparare il ricevimento merci tramite DDT.') + '</td></tr>');
      return;
    }
    if (!orders.length) {
      $body.append('<tr><td colspan="9">' + emptyState('Nessun ordine fornitore per il filtro selezionato', 'Cambia filtro stato per vedere altri ordini fornitore.') + '</td></tr>');
      return;
    }
    orders.forEach(function (o) {
      const linesCount = (o.lines || []).length;
      const ordered = (o.lines || []).reduce(function (sum, l) { return sum + num(l.qty); }, 0);
      const received = (o.lines || []).reduce(function (sum, l) { return sum + num(l.receivedQty); }, 0);
      const badge = statusBadgeClass(o.status);
      $body.append('<tr>'+
        '<td>'+esc(o.number || '-')+'</td>'+
        '<td>'+esc(formatDate(o.date))+'</td>'+
        '<td>'+esc(o.supplierName || '-')+'</td>'+
        '<td><span class="badge warehouse-status-badge '+badge+'">'+esc(STATUS_LABELS[o.status] || o.status)+'</span></td>'+
        '<td class="text-end">'+linesCount+'</td>'+
        '<td class="text-end">'+fmtQty(ordered)+'</td>'+
        '<td class="text-end">'+fmtQty(received)+'</td>'+
        '<td class="text-end fw-semibold">'+fmtMoney(o.total || 0)+'</td>'+
        '<td class="text-end"><div class="warehouse-actions btn-group btn-group-sm"><button class="btn btn-outline-primary supplier-order-detail" data-id="'+esc(o.id)+'" type="button" title="Dettaglio"><i class="fas fa-eye"></i></button> '+
          '<button class="btn btn-outline-danger supplier-order-delete" data-id="'+esc(o.id)+'" type="button" title="Elimina"><i class="fas fa-trash"></i></button></div></td>'+
      '</tr>');
    });
  }

  function showDetail(id) {
    const order = getOrders().find(function (o) { return String(o.id) === String(id); });
    if (!order) return;
    currentDetailId = String(id);
    $('#supplierOrderDetailModalTitle').text('Ordine fornitore ' + (order.number || ''));
    const documentLinks = window.DocumentLinksService ? window.DocumentLinksService.renderFor('supplier_order', order) : '';
    const lines = (order.lines || []).map(function (l) {
      return '<tr><td>'+esc(l.productCode || '')+'</td><td>'+esc(l.productDescription || l.description || '')+'</td><td>'+esc(l.unitOfMeasure || 'pz')+'</td><td class="text-end">'+fmtQty(l.qty)+'</td><td class="text-end">'+fmtQty(l.receivedQty)+'</td><td class="text-end">'+fmtQty(Math.max(0, num(l.qty)-num(l.receivedQty)))+'</td><td class="text-end">'+fmtMoney(l.price)+'</td><td class="text-end">'+fmtMoney(num(l.qty)*num(l.price))+'</td></tr>';
    }).join('');
    $('#supplierOrderDetailModalBody').html(
      documentLinks +
      '<div class="row g-2 mb-3">'+
        '<div class="col-md-4"><strong>Fornitore:</strong><br>'+esc(order.supplierName || '-')+'</div>'+
        '<div class="col-md-2"><strong>Data:</strong><br>'+esc(formatDate(order.date))+'</div>'+
        '<div class="col-md-3"><strong>Consegna prevista:</strong><br>'+esc(formatDate(order.expectedDeliveryDate))+'</div>'+
        '<div class="col-md-3"><strong>Stato:</strong><br>'+esc(STATUS_LABELS[order.status] || order.status)+'</div>'+
      '</div>'+
      '<table class="table table-sm align-middle"><thead><tr><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Ord.</th><th class="text-end">Ricev.</th><th class="text-end">Residuo</th><th class="text-end">Prezzo acq.</th><th class="text-end">Totale</th></tr></thead><tbody>'+(lines || '<tr><td colspan="8" class="text-muted text-center">Nessuna riga.</td></tr>')+'</tbody></table>'+
      '<div class="text-end h5">Totale ordine: '+fmtMoney(order.total || 0)+'</div>'+
      (order.notes ? '<div class="alert alert-secondary small mt-3">'+esc(order.notes)+'</div>' : '')+
      '<div class="alert alert-info small mt-3 mb-0">Questo step prepara il DDT fornitore: le quantità ricevute saranno aggiornate negli step ricevimento merci/DDT fornitore.</div>'
    );
    $('#supplierOrderDetailModal').modal('show');
  }

  async function deleteOrder(id) {
    const order = getOrders().find(function (o) { return String(o.id) === String(id); });
    if (!order) return;
    if (window.DocumentLifecycleService && typeof window.DocumentLifecycleService.canDeleteSupplierOrder === 'function') {
      const guard = window.DocumentLifecycleService.canDeleteSupplierOrder(order);
      if (!guard.ok) { alert(guard.reason); return; }
    } else {
      const hasReceived = (order.lines || []).some(function (l) { return num(l.receivedQty) > 0; });
      if (hasReceived) { alert('Ordine già parzialmente ricevuto: eliminazione bloccata in modo prudenziale.'); return; }
    }
    if (!confirm('Eliminare l\'ordine fornitore ' + (order.number || id) + '?')) return;
    await window.deleteDataFromCloud('supplierOrders', id, { skipRender: true });
    render();
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $('#newSupplierOrderBtn, #menu-nuovo-ordine-fornitore').on('click.supplierOrders', function (e) { if (e) e.preventDefault(); resetForm(); $('#supplierOrderModal').modal('show'); });
    $('#supplierOrder-productId').on('change.supplierOrders', function () { $('#supplierOrder-linePrice').data('manual', false); syncSelectedProductPrice(); });
    $('#supplierOrder-linePrice').on('input.supplierOrders', function () { $(this).data('manual', true); });
    $('#addSupplierOrderLineBtn').on('click.supplierOrders', addLine);
    $('#supplierOrder-lines-body').on('click.supplierOrders', '.supplier-order-remove-line', function () { tempLines.splice(parseInt($(this).attr('data-index'), 10), 1); recalcTempLines(); });
    $('#saveSupplierOrderBtn').on('click.supplierOrders', saveOrder);
    $('#supplier-orders-table-body').on('click.supplierOrders', '.supplier-order-detail', function () { showDetail($(this).attr('data-id')); });
    $('#supplier-orders-table-body').on('click.supplierOrders', '.supplier-order-delete', function () { deleteOrder($(this).attr('data-id')); });
    $('#supplierOrderStatusFilter').on('change.supplierOrders', render);
    $('#deleteSupplierOrderFromDetailBtn').on('click.supplierOrders', function () { if (currentDetailId) deleteOrder(currentDetailId).then(function(){ $('#supplierOrderDetailModal').modal('hide'); }); });
    if (window.AppStore && typeof window.AppStore.subscribe === 'function') {
      window.AppStore.subscribe('supplierOrders', render);
      window.AppStore.subscribe('suppliers', renderSupplierOptions);
      window.AppStore.subscribe('products', function () { renderProductOptions(); render(); });
    }
    render();
  }

  window.renderSupplierOrdersArea = render;
  window.SupplierOrderService = {
    normalizeOrder: normalizeOrder,
    statusLabels: STATUS_LABELS,
    matchesStatusFilter: matchesStatusFilter,
    previewOrderNumber: previewOrderNumber
  };
  window.AppModules.supplierOrders.bind = bind;
})();
