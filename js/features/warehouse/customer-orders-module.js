// js/features/warehouse/customer-orders-module.js
// Step 4: ordini cliente base, preparatori per DDT cliente da ordine.
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.customerOrders = window.AppModules.customerOrders || {};

  let _bound = false;
  let tempLines = [];
  let currentDetailId = null;

  const STATUS_LABELS = {
    draft: 'Bozza',
    confirmed: 'Aperto',
    partially_fulfilled: 'Parzialmente evaso',
    fulfilled: 'Evaso',
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
    if (status === 'fulfilled') return 'text-bg-success';
    if (status === 'partially_fulfilled') return 'text-bg-warning';
    if (status === 'confirmed') return 'text-bg-primary';
    return 'text-bg-light text-dark';
  }

  function getStatusFilter() {
    return $('#customerOrderStatusFilter').val() || 'all';
  }

  function matchesStatusFilter(order, filter) {
    if (!filter || filter === 'all') return true;
    if (filter === 'open') return ['confirmed', 'partially_fulfilled'].indexOf(order.status) !== -1;
    return order.status === filter;
  }

  function renderSummary(orders) {
    const $summary = $('#customer-orders-summary');
    if (!$summary.length) return;
    const counts = orders.reduce(function (acc, o) {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    const cards = [
      { label: 'Bozze', value: counts.draft || 0, hint: 'da approvare nel Workflow' },
      { label: 'Confermati', value: counts.confirmed || 0, hint: 'lavorabili in DDT' },
      { label: 'Parzialmente evasi', value: counts.partially_fulfilled || 0, hint: 'DDT già parziale' },
      { label: 'Evasi', value: counts.fulfilled || 0, hint: 'completati' },
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
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCustomerOrder === 'function'
      ? window.DomainNormalizers.normalizeCustomerOrder(o)
      : (o || {});
  }
  function normalizeProduct(p) {
    return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function'
      ? window.DomainNormalizers.normalizeProductInfo(p)
      : (p || {});
  }
  function getOrders() {
    return getStoreArray('customerOrders').map(normalizeOrder).sort(function (a, b) {
      const da = String(a.date || '') + ' ' + String(a.number || '') + ' ' + String(a.id || '');
      const db = String(b.date || '') + ' ' + String(b.number || '') + ' ' + String(b.id || '');
      return db.localeCompare(da);
    });
  }
  function getCustomers() { return getStoreArray('customers') || []; }
  function getProducts() { return (getStoreArray('products') || []).map(normalizeProduct).filter(function (p) { return p.itemType === 'product'; }); }

  function getNextOrderId() {
    const ids = getStoreArray('customerOrders').map(function (o) { return parseInt(o.id, 10); }).filter(function (n) { return !isNaN(n); });
    return ids.length ? Math.max.apply(null, ids) + 1 : 1;
  }
  function previewOrderNumber() {
    const year = new Date().getFullYear();
    const max = getStoreArray('customerOrders').reduce(function (acc, o) {
      const n = String(o.number || o.numero || '');
      const m = n.match(/^OC-(\d{4})-(\d+)$/);
      if (m && String(m[1]) === String(year)) return Math.max(acc, parseInt(m[2], 10) || 0);
      return acc;
    }, 0);
    return 'OC-' + year + '-' + String(max + 1).padStart(4, '0');
  }

  function renderCustomerOptions() {
    const $sel = $('#customerOrder-customerId');
    if (!$sel.length) return;
    const cur = $sel.val();
    $sel.empty().append('<option value="">Seleziona cliente...</option>');
    getCustomers().forEach(function (c) {
      const label = c.name || c.nome || c.ragioneSociale || c.denominazione || c.email || ('Cliente ' + c.id);
      $sel.append('<option value="'+esc(c.id)+'">'+esc(label)+'</option>');
    });
    if (cur) $sel.val(cur);
  }

  function renderProductOptions() {
    const $sel = $('#customerOrder-productId');
    if (!$sel.length) return;
    const cur = $sel.val();
    $sel.empty().append('<option value="">Seleziona prodotto...</option>');
    getProducts().forEach(function (p) {
      const label = (p.code ? p.code + ' - ' : '') + (p.description || 'Prodotto') + ' · disp. ' + fmtQty(p.stockQty) + ' ' + (p.unitOfMeasure || 'pz');
      $sel.append('<option value="'+esc(p.id)+'" data-price="'+esc(p.salePrice || 0)+'">'+esc(label)+'</option>');
    });
    if (cur) $sel.val(cur);
    syncSelectedProductPrice();
  }

  function syncSelectedProductPrice() {
    const id = $('#customerOrder-productId').val();
    const p = getProducts().find(function (x) { return String(x.id) === String(id); });
    if (p && !$('#customerOrder-linePrice').data('manual')) $('#customerOrder-linePrice').val(num(p.salePrice).toFixed(2));
  }

  function recalcTempLines() {
    const $body = $('#customerOrder-lines-body');
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
          '<td class="text-end"><button class="btn btn-outline-danger customer-order-remove-line" data-index="'+i+'" type="button" title="Elimina"><i class="fas fa-trash"></i></button></div></td>'+
        '</tr>');
      });
    }
    const total = tempLines.reduce(function (sum, l) { return sum + num(l.qty) * num(l.price); }, 0);
    $('#customerOrder-total').text(fmtMoney(total));
  }

  function resetForm() {
    const form = document.getElementById('customerOrderForm');
    if (form) form.reset();
    $('#customerOrder-id').val('');
    $('#customerOrder-number').val(previewOrderNumber());
    $('#customerOrder-date').val(today());
    $('#customerOrder-expectedDeliveryDate').val('');
    $('#customerOrder-status').val('draft');
    tempLines = [];
    renderCustomerOptions();
    renderProductOptions();
    $('#customerOrder-lineQty').val('1');
    $('#customerOrder-linePrice').data('manual', false);
    recalcTempLines();
  }

  function addLine() {
    const productId = $('#customerOrder-productId').val();
    const qty = num($('#customerOrder-lineQty').val());
    const price = num($('#customerOrder-linePrice').val());
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
      fulfilledQty: 0,
      shippedQty: 0,
      remainingQty: qty,
      price: price,
      salePrice: price,
      lineTotal: qty * price
    });
    $('#customerOrder-lineQty').val('1');
    $('#customerOrder-linePrice').data('manual', false);
    syncSelectedProductPrice();
    recalcTempLines();
  }

  async function saveOrder() {
    const customerId = $('#customerOrder-customerId').val();
    const customer = getCustomers().find(function (c) { return String(c.id) === String(customerId); });
    if (!customer) { alert('Seleziona un cliente.'); return; }
    if (!tempLines.length) { alert('Aggiungi almeno una riga prodotto.'); return; }
    const id = String($('#customerOrder-id').val() || getNextOrderId());
    const customerName = customer.name || customer.nome || customer.ragioneSociale || customer.denominazione || '';
    const raw = {
      id: id,
      number: ($('#customerOrder-number').val() || previewOrderNumber()).trim(),
      date: $('#customerOrder-date').val() || today(),
      expectedDeliveryDate: $('#customerOrder-expectedDeliveryDate').val() || '',
      customerId: String(customer.id),
      customerName: customerName,
      status: $('#customerOrder-status').val() || 'draft',
      lines: tempLines,
      notes: ($('#customerOrder-notes').val() || '').trim(),
      updatedAt: new Date().toISOString()
    };
    if (!getStoreArray('customerOrders').some(function (o) { return String(o.id) === id; })) raw.createdAt = raw.updatedAt;
    const order = normalizeOrder(raw);
    try {
      $('#saveCustomerOrderBtn').prop('disabled', true);
      await window.saveDataToCloud('customerOrders', order, id);
      $('#customerOrderModal').modal('hide');
      render();
    } finally {
      $('#saveCustomerOrderBtn').prop('disabled', false);
    }
  }

  function render() {
    renderCustomerOptions();
    renderProductOptions();
    const $body = $('#customer-orders-table-body');
    if (!$body.length) return;
    $body.empty();
    const allOrders = getOrders();
    renderSummary(allOrders);
    const filter = getStatusFilter();
    const orders = allOrders.filter(function (o) { return matchesStatusFilter(o, filter); });
    if (!allOrders.length) {
      $body.append('<tr><td colspan="9">' + emptyState('Nessun ordine cliente registrato', 'Crea un ordine cliente per preparare uno o più DDT cliente.') + '</td></tr>');
      return;
    }
    if (!orders.length) {
      $body.append('<tr><td colspan="9">' + emptyState('Nessun ordine cliente per il filtro selezionato', 'Cambia filtro stato per vedere altri ordini cliente.') + '</td></tr>');
      return;
    }
    orders.forEach(function (o) {
      const linesCount = (o.lines || []).length;
      const ordered = (o.lines || []).reduce(function (sum, l) { return sum + num(l.qty); }, 0);
      const fulfilled = (o.lines || []).reduce(function (sum, l) { return sum + num(l.fulfilledQty); }, 0);
      const badge = statusBadgeClass(o.status);
      $body.append('<tr>'+
        '<td>'+esc(o.number || '-')+'</td>'+
        '<td>'+esc(formatDate(o.date))+'</td>'+
        '<td>'+esc(o.customerName || '-')+'</td>'+
        '<td><span class="badge warehouse-status-badge '+badge+'">'+esc(STATUS_LABELS[o.status] || o.status)+'</span></td>'+
        '<td class="text-end">'+linesCount+'</td>'+
        '<td class="text-end">'+fmtQty(ordered)+'</td>'+
        '<td class="text-end">'+fmtQty(fulfilled)+'</td>'+
        '<td class="text-end fw-semibold">'+fmtMoney(o.total || 0)+'</td>'+
        '<td class="text-end"><div class="warehouse-actions btn-group btn-group-sm"><button class="btn btn-outline-primary customer-order-detail" data-id="'+esc(o.id)+'" type="button" title="Dettaglio"><i class="fas fa-eye"></i></button> '+
          (['confirmed','partially_fulfilled'].indexOf(o.status) !== -1 ? '<button class="btn btn-outline-success customer-order-create-ddt" data-id="'+esc(o.id)+'" type="button" title="Crea DDT da ordine"><i class="fas fa-truck-fast"></i></button> ' : '') +
          '<button class="btn btn-outline-danger customer-order-delete" data-id="'+esc(o.id)+'" type="button" title="Elimina"><i class="fas fa-trash"></i></button></div></td>'+
      '</tr>');
    });
  }

  function showDetail(id) {
    const order = getOrders().find(function (o) { return String(o.id) === String(id); });
    if (!order) return;
    currentDetailId = String(id);
    $('#customerOrderDetailModalTitle').text('Ordine cliente ' + (order.number || ''));
    const documentLinks = window.DocumentLinksService ? window.DocumentLinksService.renderFor('customer_order', order) : '';
    const lines = (order.lines || []).map(function (l) {
      return '<tr><td>'+esc(l.productCode || '')+'</td><td>'+esc(l.productDescription || l.description || '')+'</td><td>'+esc(l.unitOfMeasure || 'pz')+'</td><td class="text-end">'+fmtQty(l.qty)+'</td><td class="text-end">'+fmtQty(l.fulfilledQty)+'</td><td class="text-end">'+fmtQty(Math.max(0, num(l.qty)-num(l.fulfilledQty)))+'</td><td class="text-end">'+fmtMoney(l.price)+'</td><td class="text-end">'+fmtMoney(num(l.qty)*num(l.price))+'</td></tr>';
    }).join('');
    $('#customerOrderDetailModalBody').html(
      documentLinks +
      '<div class="row g-2 mb-3">'+
        '<div class="col-md-4"><strong>Cliente:</strong><br>'+esc(order.customerName || '-')+'</div>'+
        '<div class="col-md-2"><strong>Data:</strong><br>'+esc(formatDate(order.date))+'</div>'+
        '<div class="col-md-3"><strong>Consegna prevista:</strong><br>'+esc(formatDate(order.expectedDeliveryDate))+'</div>'+
        '<div class="col-md-3"><strong>Stato:</strong><br>'+esc(STATUS_LABELS[order.status] || order.status)+'</div>'+
      '</div>'+
      '<table class="table table-sm align-middle"><thead><tr><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Ord.</th><th class="text-end">Evaso</th><th class="text-end">Residuo</th><th class="text-end">Prezzo</th><th class="text-end">Totale</th></tr></thead><tbody>'+(lines || '<tr><td colspan="8" class="text-muted text-center">Nessuna riga.</td></tr>')+'</tbody></table>'+
      '<div class="text-end h5">Totale ordine: '+fmtMoney(order.total || 0)+'</div>'+
      (order.notes ? '<div class="alert alert-secondary small mt-3">'+esc(order.notes)+'</div>' : '')+
      '<div class="alert alert-info small mt-3 mb-0">Le quantità evase vengono aggiornate dai DDT cliente. Un DDT può derivare da questo ordine singolo oppure da più ordini dello stesso cliente.</div>'
    );
    $('#customerOrderDetailModal').modal('show');
  }

  async function deleteOrder(id) {
    const order = getOrders().find(function (o) { return String(o.id) === String(id); });
    if (!order) return;
    if (window.DocumentLifecycleService && typeof window.DocumentLifecycleService.canDeleteCustomerOrder === 'function') {
      const guard = window.DocumentLifecycleService.canDeleteCustomerOrder(order);
      if (!guard.ok) { alert(guard.reason); return; }
    } else {
      const hasFulfilled = (order.lines || []).some(function (l) { return num(l.fulfilledQty) > 0; });
      if (hasFulfilled) { alert('Ordine già parzialmente evaso: eliminazione bloccata in modo prudenziale.'); return; }
    }
    if (!confirm('Eliminare l\'ordine cliente ' + (order.number || id) + '?')) return;
    await window.deleteDataFromCloud('customerOrders', id, { skipRender: true });
    render();
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $('#newCustomerOrderBtn, #menu-nuovo-ordine-cliente').on('click.customerOrders', function (e) { if (e) e.preventDefault(); resetForm(); $('#customerOrderModal').modal('show'); });
    $('#customerOrder-productId').on('change.customerOrders', function () { $('#customerOrder-linePrice').data('manual', false); syncSelectedProductPrice(); });
    $('#customerOrder-linePrice').on('input.customerOrders', function () { $(this).data('manual', true); });
    $('#addCustomerOrderLineBtn').on('click.customerOrders', addLine);
    $('#customerOrder-lines-body').on('click.customerOrders', '.customer-order-remove-line', function () { tempLines.splice(parseInt($(this).attr('data-index'), 10), 1); recalcTempLines(); });
    $('#saveCustomerOrderBtn').on('click.customerOrders', saveOrder);
    $('#customer-orders-table-body').on('click.customerOrders', '.customer-order-detail', function () { showDetail($(this).attr('data-id')); });
    $('#customer-orders-table-body').on('click.customerOrders', '.customer-order-delete', function () { deleteOrder($(this).attr('data-id')); });
    $('#customer-orders-table-body').on('click.customerOrders', '.customer-order-create-ddt', function () { const id = $(this).attr('data-id'); if (window.CustomerDDTService && typeof window.CustomerDDTService.loadFromOrder === 'function') { $('#customerDdtModal').modal('show'); window.CustomerDDTService.loadFromOrder(id); } else { alert('Modulo DDT cliente non ancora disponibile.'); } });
    $('#customerOrderStatusFilter').on('change.customerOrders', render);
    $('#deleteCustomerOrderFromDetailBtn').on('click.customerOrders', function () { if (currentDetailId) deleteOrder(currentDetailId).then(function(){ $('#customerOrderDetailModal').modal('hide'); }); });
    if (window.AppStore && typeof window.AppStore.subscribe === 'function') {
      window.AppStore.subscribe('customerOrders', render);
      window.AppStore.subscribe('customers', renderCustomerOptions);
      window.AppStore.subscribe('products', function () { renderProductOptions(); render(); });
    }
    render();
  }

  window.renderCustomerOrdersArea = render;
  window.CustomerOrderService = {
    normalizeOrder: normalizeOrder,
    statusLabels: STATUS_LABELS,
    matchesStatusFilter: matchesStatusFilter,
    previewOrderNumber: previewOrderNumber
  };
  window.AppModules.customerOrders.bind = bind;
})();
