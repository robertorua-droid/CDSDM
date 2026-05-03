// js/features/warehouse/customer-ddts-module.js
// Step 17: DDT cliente con scarico magazzino, diretto, da singolo ordine o da più ordini cliente.
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.customerDDTs = window.AppModules.customerDDTs || {};

  let _bound = false;
  let tempLines = [];

  const STATUS_LABELS = {
    draft: 'Bozza',
    delivered: 'Consegnato',
    partially_delivered: 'Parzialmente consegnato',
    cancelled: 'Annullato'
  };

  function esc(v) { if (window.VatRateCatalog && typeof window.VatRateCatalog.escapeHtml === 'function') return window.VatRateCatalog.escapeHtml(v); return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[c]; }); }
  function num(v) { const n = parseFloat(String(v == null ? 0 : v).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmtQty(v) { return num(v).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 3 }); }
  function fmtMoney(v) { return '€ ' + num(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function formatDate(v) { if (!v) return '-'; const p = String(v).slice(0,10).split('-'); return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : String(v); }
  function emptyState(title, hint) { return '<div class="warehouse-empty-state"><i class="fas fa-circle-info mb-2"></i><span class="empty-title">'+esc(title)+'</span><span class="empty-hint">'+esc(hint || '')+'</span></div>'; }
  function getStoreArray(key) { if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || []; if (typeof window.getData === 'function') return window.getData(key) || []; return (window.globalData && window.globalData[key]) || []; }
  function normalizeProduct(p) { return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function' ? window.DomainNormalizers.normalizeProductInfo(p) : (p || {}); }
  function normalizeOrder(o) { return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCustomerOrder === 'function' ? window.DomainNormalizers.normalizeCustomerOrder(o) : (o || {}); }
  function normalizeDDT(d) { return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCustomerDDT === 'function' ? window.DomainNormalizers.normalizeCustomerDDT(d) : (d || {}); }
  function getProducts() { return (getStoreArray('products') || []).map(normalizeProduct).filter(function (p) { return p.itemType === 'product'; }); }
  function getCustomers() { return getStoreArray('customers') || []; }
  function getOrders() { return (getStoreArray('customerOrders') || []).map(normalizeOrder).filter(function (o) { return o.status !== 'cancelled' && o.status !== 'fulfilled' && o.status !== 'draft'; }); }
  function getOpenOrders() { return getOrders().filter(function(o){ return ['confirmed','partially_fulfilled'].indexOf(o.status) !== -1 && orderRemainingQty(o) > 0; }); }
  function getDDTs() { return (getStoreArray('customerDDTs') || []).map(normalizeDDT).sort(function(a,b){ return (String(b.date||'')+' '+String(b.id||'')).localeCompare(String(a.date||'')+' '+String(a.id||'')); }); }
  function findRawProduct(id) { return (getStoreArray('products') || []).find(function (p) { return String(p.id) === String(id); }) || null; }
  function getNextId() { const ids = getStoreArray('customerDDTs').map(function(d){return parseInt(d.id,10);}).filter(function(n){return !isNaN(n);}); return ids.length ? Math.max.apply(null, ids)+1 : 1; }
  function getNextMovementId(offset) { const ids = getStoreArray('warehouseMovements').map(function (m) { return parseInt(m.id, 10); }).filter(function (n) { return !isNaN(n); }); return (ids.length ? Math.max.apply(null, ids) : 0) + 1 + (offset || 0); }
  function previewNumber() { const year = new Date().getFullYear(); const max = getStoreArray('customerDDTs').reduce(function(acc,d){ const m=String(d.number||d.numero||'').match(/^DDC-(\d{4})-(\d+)$/); return (m && String(m[1])===String(year)) ? Math.max(acc, parseInt(m[2],10)||0) : acc; },0); return 'DDC-' + year + '-' + String(max+1).padStart(4,'0'); }
  function customerLabel(c) { return c.name || c.nome || c.ragioneSociale || c.denominazione || c.email || ('Cliente ' + c.id); }
  function lineRemainingQty(l) { return Math.max(0, num(l.qty) - num(l.fulfilledQty)); }
  function orderRemainingQty(o) { return (o.lines || []).reduce(function(s,l){ return s + lineRemainingQty(l); }, 0); }
  function orderLabel(o) { return (o.number || ('Ordine ' + o.id)) + ' · ' + (o.customerName || '') + ' · residuo ' + fmtQty(orderRemainingQty(o)); }
  function uniq(arr) { return Array.from(new Set((arr || []).filter(function(v){ return v !== '' && v != null; }).map(String))); }

  function computeStatus(lines, sourceOrders) {
    const shipped = (lines || []).reduce(function(s,l){return s+num(l.shippedQty);},0);
    const orders = Array.isArray(sourceOrders) ? sourceOrders : (sourceOrders ? [sourceOrders] : []);
    if (orders.length) {
      const remainingBefore = orders.reduce(function(s,o){ return s + orderRemainingQty(o); }, 0);
      if (shipped + 0.0001 < remainingBefore) return 'partially_delivered';
    }
    return 'delivered';
  }

  function ensureModal() {
    if ($('#customerDdtModal').length) return;
    $('body').append(`
    <div class="modal fade" id="customerDdtModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">DDT cliente</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button></div>
        <div class="modal-body"><form id="customerDdtForm" onsubmit="return false;">
          <input type="hidden" id="customerDdt-id" />
          <div class="row g-3 mb-3">
            <div class="col-md-3"><label class="form-label">Numero DDT</label><input class="form-control" id="customerDdt-number" /></div>
            <div class="col-md-3"><label class="form-label">Data</label><input class="form-control" id="customerDdt-date" type="date" /></div>
            <div class="col-md-3"><label class="form-label">Origine</label><select class="form-select" id="customerDdt-sourceType"><option value="direct">Diretto senza ordine</option><option value="customer_order">Da ordine cliente</option><option value="customer_orders">Da più ordini cliente</option></select></div>
            <div class="col-md-3" id="customerDdt-singleOrderWrap"><label class="form-label">Ordine cliente</label><select class="form-select" id="customerDdt-sourceOrderId" disabled></select></div>
            <div class="col-md-6"><label class="form-label">Cliente</label><select class="form-select" id="customerDdt-customerId"></select></div>
            <div class="col-md-3"><label class="form-label">Causale trasporto</label><input class="form-control" id="customerDdt-transportReason" value="Vendita" /></div>
            <div class="col-md-3"><label class="form-label">Vettore</label><input class="form-control" id="customerDdt-carrier" /></div>
            <div class="col-md-2"><label class="form-label">Colli</label><input class="form-control" id="customerDdt-packages" /></div>
            <div class="col-md-2"><label class="form-label">Peso</label><input class="form-control" id="customerDdt-weight" /></div>
            <div class="col-md-4"><label class="form-label">Aspetto beni</label><input class="form-control" id="customerDdt-goodsAppearance" placeholder="Scatole, colli, bancale..." /></div>
            <div class="col-md-4"><label class="form-label">Note</label><input class="form-control" id="customerDdt-notes" /></div>
          </div>
          <div class="card mb-3 d-none" id="customerDdt-multiOrdersPanel"><div class="card-header fw-semibold d-flex justify-content-between align-items-center"><span>Ordini cliente da accorpare</span><span class="small text-muted">Stesso cliente, solo ordini confermati o parzialmente evasi</span></div><div class="card-body">
            <div class="alert alert-warning small py-2 mb-3"><strong>Controllo operativo.</strong> Seleziona solo ordini dello stesso cliente. Le righe residue vengono proposte nel DDT e puoi ridurre le quantità da consegnare prima del salvataggio.</div>
            <div class="table-responsive"><table class="table table-sm align-middle mb-0"><thead><tr><th></th><th>Ordine</th><th>Data</th><th>Cliente</th><th class="text-end">Residuo</th><th>Stato</th></tr></thead><tbody id="customerDdt-multiOrdersBody"></tbody></table></div>
          </div></div>
          <div class="card mb-3"><div class="card-header fw-semibold">Righe DDT</div><div class="card-body">
            <div class="row g-2 align-items-end" id="customerDdt-manualLineControls">
              <div class="col-md-5"><label class="form-label">Prodotto</label><select class="form-select" id="customerDdt-productId"></select></div>
              <div class="col-md-2"><label class="form-label">Quantità consegnata</label><input class="form-control text-end" id="customerDdt-lineShippedQty" type="number" min="0" step="1" inputmode="decimal" value="1" /></div>
              <div class="col-md-2"><label class="form-label">Prezzo vendita</label><input class="form-control text-end" id="customerDdt-linePrice" type="number" min="0" step="0.01" /></div>
              <div class="col-md-2"><label class="form-label">Note riga</label><input class="form-control" id="customerDdt-lineNotes" /></div>
              <div class="col-md-1"><button class="btn btn-outline-primary w-100" id="addCustomerDdtLineBtn" type="button"><i class="fas fa-plus"></i></button></div>
            </div>
            <div class="table-responsive mt-3"><table class="table table-sm align-middle mb-0"><thead><tr><th>Origine</th><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Residuo origine</th><th class="text-end">Consegn.</th><th class="text-end">Prezzo</th><th>Note</th><th class="text-end">Azioni</th></tr></thead><tbody id="customerDdt-lines-body"><tr><td colspan="9" class="text-center text-muted py-3">Nessuna riga inserita.</td></tr></tbody></table></div>
          </div></div>
        </form></div>
        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button><button type="button" class="btn btn-primary" id="saveCustomerDdtBtn">Salva DDT</button></div>
      </div></div>
    </div>
    <div class="modal fade" id="customerDdtDetailModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="customerDdtDetailModalTitle">Dettaglio DDT cliente</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button></div><div class="modal-body" id="customerDdtDetailModalBody"></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button></div></div></div></div>`);
  }

  function renderCustomerOptions() { const $sel = $('#customerDdt-customerId'); if (!$sel.length) return; const cur=$sel.val(); $sel.empty().append('<option value="">Seleziona cliente...</option>'); getCustomers().forEach(function(c){ $sel.append('<option value="'+esc(c.id)+'">'+esc(customerLabel(c))+'</option>'); }); if (cur) $sel.val(cur); }
  function renderOrderOptions() { const $sel = $('#customerDdt-sourceOrderId'); if (!$sel.length) return; const cur=$sel.val(); const customerId=$('#customerDdt-customerId').val() || ''; $sel.empty().append('<option value="">Nessun ordine collegato</option>'); getOpenOrders().filter(function(o){ return !customerId || String(o.customerId) === String(customerId); }).forEach(function(o){ $sel.append('<option value="'+esc(o.id)+'">'+esc(orderLabel(o))+'</option>'); }); if (cur && $sel.find('option[value="'+esc(cur)+'"]').length) $sel.val(cur); }
  function renderProductOptions() { const $sel = $('#customerDdt-productId'); if (!$sel.length) return; const cur=$sel.val(); $sel.empty().append('<option value="">Seleziona prodotto...</option>'); getProducts().forEach(function(p){ const net=Math.max(0,num(p.stockQty)-num(p.reservedQty)); const label=(p.code?p.code+' - ':'')+(p.description||'Prodotto')+' · disp. '+fmtQty(net)+' · vendita '+fmtMoney(p.salePrice||0); $sel.append('<option value="'+esc(p.id)+'">'+esc(label)+'</option>'); }); if (cur) $sel.val(cur); syncSelectedProductPrice(); }
  function renderMultiOrderOptions() {
    const $body = $('#customerDdt-multiOrdersBody');
    if (!$body.length) return;
    const selected = getSelectedMultiOrderIds();
    const lockedCustomerId = $('#customerDdt-customerId').val() || '';
    const orders = getOpenOrders().filter(function(o){ return !lockedCustomerId || String(o.customerId) === String(lockedCustomerId); });
    if (!orders.length) {
      $body.html('<tr><td colspan="6">'+emptyState('Nessun ordine cliente selezionabile', 'Gli ordini aperti o parzialmente evasi compariranno qui.')+'</td></tr>');
      return;
    }
    $body.html(orders.map(function(o){
      const checked = selected.indexOf(String(o.id)) !== -1 ? ' checked' : '';
      const badge = o.status === 'partially_fulfilled' ? 'text-bg-warning' : (o.status === 'confirmed' ? 'text-bg-primary' : 'text-bg-light text-dark');
      return '<tr><td><input class="form-check-input customer-ddt-multi-order" type="checkbox" value="'+esc(o.id)+'"'+checked+'></td><td>'+esc(o.number || o.id)+'</td><td>'+esc(formatDate(o.date))+'</td><td>'+esc(o.customerName || '-')+'</td><td class="text-end">'+fmtQty(orderRemainingQty(o))+'</td><td><span class="badge warehouse-status-badge '+badge+'">'+esc(o.status)+'</span></td></tr>';
    }).join(''));
  }
  function getSelectedMultiOrderIds() { return $('.customer-ddt-multi-order:checked').map(function(){ return String($(this).val()); }).get(); }
  function syncSelectedProductPrice() { const id=$('#customerDdt-productId').val(); const p=getProducts().find(function(x){return String(x.id)===String(id);}); if (p && !$('#customerDdt-linePrice').data('manual')) $('#customerDdt-linePrice').val(num(p.salePrice).toFixed(2)); }
  function selectedSourceType() { return $('#customerDdt-sourceType').val() || 'direct'; }
  function syncSourceUI() {
    const type = selectedSourceType();
    const isSingle = type === 'customer_order';
    const isMulti = type === 'customer_orders';
    $('#customerDdt-sourceOrderId').prop('disabled', !isSingle);
    $('#customerDdt-singleOrderWrap').toggleClass('d-none', isMulti);
    $('#customerDdt-multiOrdersPanel').toggleClass('d-none', !isMulti);
    $('#customerDdt-manualLineControls').toggleClass('d-none', isMulti || isSingle);
    if (!isSingle) $('#customerDdt-sourceOrderId').val('');
    renderMultiOrderOptions();
  }
  function lineOrigin(l) { if (l.sourceOrderNumber) return 'Ord. ' + l.sourceOrderNumber; if (l.sourceOrderId) return 'Ord. ' + l.sourceOrderId; return 'Diretto'; }
  function recalcLines() {
    const $body=$('#customerDdt-lines-body'); if (!$body.length) return; $body.empty();
    if (!tempLines.length) { $body.append('<tr><td colspan="9" class="text-center text-muted py-3">Nessuna riga inserita.</td></tr>'); return; }
    tempLines.forEach(function(l,i){
      const readonlyOrigin = l.sourceOrderId ? ' data-max="'+esc(l.remainingSourceQty || l.shippedQty || 0)+'"' : '';
      const removeDisabled = selectedSourceType() === 'customer_orders' || selectedSourceType() === 'customer_order' ? ' disabled title="Rimuovi l\'ordine sorgente o imposta quantità 0"' : '';
      $body.append('<tr><td>'+esc(lineOrigin(l))+'</td><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="text-end">'+(l.sourceOrderId ? fmtQty(l.remainingSourceQty) : '-')+'</td><td><input class="form-control form-control-sm text-end customer-ddt-line-qty" data-index="'+i+'" type="number" min="0" step="1" inputmode="decimal" value="'+esc(num(l.shippedQty))+'"'+readonlyOrigin+'></td><td class="text-end">'+fmtMoney(l.price)+'</td><td>'+esc(l.notes||'')+'</td><td class="text-end"><button class="btn btn-sm btn-outline-danger customer-ddt-remove-line" data-index="'+i+'" type="button"'+removeDisabled+'><i class="fas fa-trash"></i></button></td></tr>');
    });
  }
  function resetForm() { ensureModal(); const form=document.getElementById('customerDdtForm'); if (form) form.reset(); $('#customerDdt-id').val(''); $('#customerDdt-number').val(previewNumber()); $('#customerDdt-date').val(today()); $('#customerDdt-sourceType').val('direct'); $('#customerDdt-transportReason').val('Vendita'); tempLines=[]; renderCustomerOptions(); renderOrderOptions(); renderProductOptions(); $('#customerDdt-lineShippedQty').val('1'); $('#customerDdt-linePrice').data('manual', false); syncSourceUI(); recalcLines(); }

  function orderLineToDDTLine(order, line, index) {
    const remaining = lineRemainingQty(line);
    return {
      productId:String(line.productId||''),
      productCode:line.productCode||'',
      productDescription:line.productDescription||line.description||'',
      description:line.productDescription||line.description||'',
      unitOfMeasure:line.unitOfMeasure||'pz',
      orderedQty:num(line.qty),
      fulfilledQty:num(line.fulfilledQty),
      remainingSourceQty:remaining,
      shippedQty:remaining,
      deliveredQty:remaining,
      qty:remaining,
      price:num(line.price || line.salePrice),
      salePrice:num(line.price || line.salePrice),
      notes:'',
      sourceOrderId:String(order.id),
      sourceOrderNumber:order.number || '',
      sourceOrderLineIndex:index
    };
  }
  function loadFromOrder(orderId) { const order = getOpenOrders().find(function(o){return String(o.id)===String(orderId);}); if (!order) return; $('#customerDdt-sourceType').val('customer_order'); $('#customerDdt-sourceOrderId').val(order.id); $('#customerDdt-customerId').val(order.customerId || ''); tempLines = (order.lines || []).map(function(l, idx){ return orderLineToDDTLine(order, l, idx); }).filter(function(l){return l.shippedQty>0;}); syncSourceUI(); recalcLines(); }
  function loadFromMultiOrders() {
    const ids = getSelectedMultiOrderIds();
    const orders = ids.map(function(id){ return getOpenOrders().find(function(o){ return String(o.id) === String(id); }); }).filter(Boolean);
    if (!orders.length) { tempLines = []; recalcLines(); return; }
    const customerIds = uniq(orders.map(function(o){ return o.customerId; }));
    if (customerIds.length > 1) { alert('Puoi accorpare solo ordini dello stesso cliente.'); $(document.activeElement).prop('checked', false); return loadFromMultiOrders(); }
    $('#customerDdt-customerId').val(customerIds[0] || '');
    tempLines = [];
    orders.forEach(function(order){
      (order.lines || []).forEach(function(line, idx){
        const ddtLine = orderLineToDDTLine(order, line, idx);
        if (ddtLine.shippedQty > 0) tempLines.push(ddtLine);
      });
    });
    renderMultiOrderOptions();
    recalcLines();
  }
  function addLine() { const productId=$('#customerDdt-productId').val(); const shipped=num($('#customerDdt-lineShippedQty').val()); const price=num($('#customerDdt-linePrice').val()); const notes=($('#customerDdt-lineNotes').val()||'').trim(); if (!productId) { alert('Seleziona un prodotto.'); return; } if (shipped <= 0) { alert('La quantità consegnata deve essere maggiore di zero.'); return; } const p=getProducts().find(function(x){return String(x.id)===String(productId);}); if (!p) { alert('Prodotto non trovato.'); return; } tempLines.push({ productId:String(p.id), productCode:p.code||'', productDescription:p.description||'', description:p.description||'', unitOfMeasure:p.unitOfMeasure||'pz', orderedQty:0, shippedQty:shipped, deliveredQty:shipped, qty:shipped, price:price, salePrice:price, notes:notes }); $('#customerDdt-lineShippedQty').val('1'); $('#customerDdt-lineNotes').val(''); $('#customerDdt-linePrice').data('manual', false); syncSelectedProductPrice(); recalcLines(); }
  function buildProductResults(lines) { const map = {}; lines.forEach(function(l){ const id=String(l.productId||''); if (!id) throw new Error('Riga senza prodotto.'); const shipped=num(l.shippedQty); if (shipped <= 0) return; const raw=findRawProduct(id); if (!raw) throw new Error('Prodotto non trovato: '+(l.productDescription||id)); const p=normalizeProduct(raw); if (!map[id]) map[id]={ product:p, stockBefore:num(p.stockQty), quarantineBefore:num(p.quarantineQty), shipped:0, lines:[] }; map[id].shipped += shipped; map[id].lines.push(l); }); Object.keys(map).forEach(function(id){ const r=map[id]; if (r.shipped > r.stockBefore + 0.0001) throw new Error('Giacenza insufficiente per '+(r.product.description||id)+': disponibile '+fmtQty(r.stockBefore)+', richiesta '+fmtQty(r.shipped)+'.'); r.stockAfter=r.stockBefore-r.shipped; r.quarantineAfter=r.quarantineBefore; }); return map; }
  function updateOrderFromDDT(order, lines) { if (!order) return null; const updatedLines=(order.lines||[]).map(function(ol, idx){ const delta=lines.filter(function(l){ const sameOrder = !l.sourceOrderId || String(l.sourceOrderId)===String(order.id); const sameIndex = l.sourceOrderLineIndex != null ? parseInt(l.sourceOrderLineIndex,10)===idx : String(l.productId)===String(ol.productId); return sameOrder && sameIndex; }).reduce(function(s,l){return s+num(l.shippedQty);},0); const next=num(ol.fulfilledQty)+delta; return Object.assign({}, ol, { fulfilledQty: next, shippedQty: next, remainingQty: Math.max(0, num(ol.qty)-next) }); }); const ordered=updatedLines.reduce(function(s,l){return s+num(l.qty);},0); const fulfilled=updatedLines.reduce(function(s,l){return s+num(l.fulfilledQty);},0); const status = fulfilled <= 0 ? (order.status || 'confirmed') : (fulfilled >= ordered ? 'fulfilled' : 'partially_fulfilled'); return Object.assign({}, order, { lines: updatedLines, status: status, stato: status, updatedAt: new Date().toISOString() }); }
  function validateLineQuantities() {
    tempLines.forEach(function(l){ l.shippedQty = num(l.shippedQty); l.deliveredQty = l.shippedQty; l.qty = l.shippedQty; });
    tempLines = tempLines.filter(function(l){ return num(l.shippedQty) > 0; });
    for (const l of tempLines) {
      if (l.sourceOrderId && num(l.shippedQty) > num(l.remainingSourceQty) + 0.0001) throw new Error('La quantità consegnata per '+(l.productDescription || l.productId)+' supera il residuo dell\'ordine '+(l.sourceOrderNumber || l.sourceOrderId)+'.');
    }
  }
  function getSourceOrdersForCurrentDDT() {
    const type = selectedSourceType();
    if (type === 'customer_order') {
      const id = $('#customerDdt-sourceOrderId').val() || '';
      return id ? getOpenOrders().filter(function(o){ return String(o.id) === String(id); }) : [];
    }
    if (type === 'customer_orders') {
      const ids = uniq(tempLines.map(function(l){ return l.sourceOrderId; }));
      return ids.map(function(id){ return getOpenOrders().find(function(o){ return String(o.id) === String(id); }); }).filter(Boolean);
    }
    return [];
  }
  async function saveDDT() { const customerId=$('#customerDdt-customerId').val(); const customer=getCustomers().find(function(c){return String(c.id)===String(customerId);}); if (!customer) { alert('Seleziona un cliente.'); return; } try { validateLineQuantities(); } catch(e){ alert(e.message || e); return; } if (!tempLines.length) { alert('Aggiungi almeno una riga con quantità consegnata maggiore di zero.'); return; } if (typeof window.saveDataToCloud !== 'function') { alert('Funzione saveDataToCloud non disponibile.'); return; } const sourceType=selectedSourceType(); const sourceOrders=getSourceOrdersForCurrentDDT(); if ((sourceType==='customer_order' || sourceType==='customer_orders') && !sourceOrders.length) { alert('Seleziona almeno un ordine cliente valido.'); return; } const sourceCustomerIds=uniq(sourceOrders.map(function(o){ return o.customerId; })); if (sourceCustomerIds.length && String(sourceCustomerIds[0]) !== String(customer.id)) { alert('Il cliente del DDT deve coincidere con il cliente degli ordini selezionati.'); return; } let productResults; try { productResults=buildProductResults(tempLines); } catch(e){ alert(e.message||e); return; } const id=String($('#customerDdt-id').val() || getNextId()); const customerName=customerLabel(customer); const now=new Date().toISOString(); const sourceOrderIds=uniq(sourceOrders.map(function(o){ return o.id; })); const sourceOrderNumbers=uniq(sourceOrders.map(function(o){ return o.number || o.id; })); const raw={ id:id, number:($('#customerDdt-number').val()||previewNumber()).trim(), date:$('#customerDdt-date').val()||today(), customerId:String(customer.id), customerName:customerName, sourceType: sourceType === 'customer_orders' ? 'customer_orders' : (sourceType === 'customer_order' ? 'customer_order' : 'direct'), sourceOrderId: sourceType === 'customer_order' ? (sourceOrderIds[0] || '') : '', sourceOrderIds: sourceOrderIds, sourceOrderNumbers: sourceOrderNumbers, sourceDocuments: sourceOrders.map(function(o){ return { type:'customer_order', id:String(o.id), number:o.number || '', date:o.date || '' }; }), transportReason:($('#customerDdt-transportReason').val()||'Vendita').trim(), carrier:($('#customerDdt-carrier').val()||'').trim(), packages:($('#customerDdt-packages').val()||'').trim(), weight:($('#customerDdt-weight').val()||'').trim(), goodsAppearance:($('#customerDdt-goodsAppearance').val()||'').trim(), lines:tempLines.map(function(l){return Object.assign({},l,{ lineTotal:num(l.shippedQty)*num(l.price) });}), notes:($('#customerDdt-notes').val()||'').trim(), status:computeStatus(tempLines, sourceOrders), updatedAt:now }; if (!getStoreArray('customerDDTs').some(function(d){return String(d.id)===id;})) raw.createdAt=now; const ddt=normalizeDDT(raw); try { $('#saveCustomerDdtBtn').prop('disabled', true); await window.saveDataToCloud('customerDDTs', ddt, id); let movementOffset=0; for (const productId of Object.keys(productResults)) { const r=productResults[productId]; await window.saveDataToCloud('products', { stockQty:r.stockAfter, giacenzaDisponibile:r.stockAfter, quarantineQty:r.quarantineAfter, giacenzaQuarantena:r.quarantineAfter }, productId); if (r.shipped > 0) { const mid=String(getNextMovementId(movementOffset)); await window.saveDataToCloud('warehouseMovements', { id:mid, date:ddt.date, movementType:'SCARICO', tipoMovimento:'SCARICO', productId:productId, productCode:r.product.code||'', productDescription:r.product.description||'', unitOfMeasure:r.product.unitOfMeasure||'pz', quantity:r.shipped, qty:r.shipped, causale:'DDT cliente - consegna merce', documentType:'customer_ddt', documentId:id, stockBefore:r.stockBefore, stockAfter:r.stockAfter, quarantineBefore:r.quarantineBefore, quarantineAfter:r.quarantineAfter, sourceOrderIds:sourceOrderIds, createdAt:now }, mid); movementOffset++; } } for (const order of sourceOrders) { const updatedOrder=updateOrderFromDDT(order, ddt.lines || []); if (updatedOrder) await window.saveDataToCloud('customerOrders', updatedOrder, String(order.id)); } $('#customerDdtModal').modal('hide'); render(); if (window.renderWarehouseArea) window.renderWarehouseArea(); if (window.renderCustomerOrdersArea) window.renderCustomerOrdersArea(); } finally { $('#saveCustomerDdtBtn').prop('disabled', false); } }
  function originLabel(d) { if (d.sourceType === 'customer_orders') return 'Ordini ' + ((d.sourceOrderNumbers || d.sourceOrderIds || []).join(', ') || '-'); if (d.sourceType==='customer_order') return 'Ordine '+(d.sourceOrderNumber || d.sourceOrderId || ''); return 'Diretto'; }
  function render() { ensureModal(); renderCustomerOptions(); renderOrderOptions(); renderProductOptions(); renderMultiOrderOptions(); const $body=$('#customer-ddts-table-body'); if (!$body.length) return; $body.empty(); const ddts=getDDTs(); if (!ddts.length) { $body.append('<tr><td colspan="9">' + emptyState('Nessun DDT cliente registrato', 'Crea un DDT cliente diretto, da ordine o da più ordini cliente.') + '</td></tr>'); return; } ddts.forEach(function(d){ const shipped=(d.lines||[]).reduce(function(s,l){return s+num(l.shippedQty);},0); const badge=d.status==='partially_delivered'?'text-bg-warning':(d.status==='cancelled'?'text-bg-secondary':'text-bg-success'); const invoiceBadge=d.invoiceId ? '<div class="small mt-1"><span class="badge warehouse-status-badge text-bg-info">Fatturato '+esc(d.invoiceNumber||d.invoiceId)+'</span></div>' : ''; const invoiceBtn=d.invoiceId ? '<button class="btn btn-outline-secondary" type="button" disabled title="DDT già collegato a fattura"><i class="fas fa-file-invoice"></i></button>' : '<button class="btn btn-outline-warning customer-ddt-create-invoice" data-id="'+esc(d.id)+'" type="button" title="Crea fattura da DDT"><i class="fas fa-file-invoice-dollar"></i></button>'; $body.append('<tr><td>'+esc(d.number||'-')+'</td><td>'+esc(formatDate(d.date))+'</td><td>'+esc(d.customerName||'-')+'</td><td>'+esc(originLabel(d))+'</td><td><span class="badge warehouse-status-badge '+badge+'">'+esc(STATUS_LABELS[d.status]||d.status)+'</span>'+invoiceBadge+'</td><td class="text-end">'+fmtQty(shipped)+'</td><td class="text-end fw-semibold">'+fmtMoney(d.total||0)+'</td><td>'+esc(d.transportReason||'-')+'</td><td class="text-end"><div class="warehouse-actions btn-group btn-group-sm"><button class="btn btn-outline-primary customer-ddt-detail" data-id="'+esc(d.id)+'" type="button" title="Dettaglio"><i class="fas fa-eye"></i></button><button class="btn btn-outline-secondary customer-ddt-print" data-id="'+esc(d.id)+'" type="button" title="Stampa / PDF"><i class="fas fa-print"></i></button><button class="btn btn-outline-success customer-ddt-update-sale-prices" data-id="'+esc(d.id)+'" type="button" title="Aggiorna prezzi vendita prodotti"><i class="fas fa-tags"></i></button>'+invoiceBtn+'</div></td></tr>'); }); }
  function showDetail(id) { const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (!d) return; $('#customerDdtDetailModalTitle').text('DDT cliente '+(d.number||'')); const rows=(d.lines||[]).map(function(l){return '<tr><td>'+esc(lineOrigin(l))+'</td><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||l.description||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="text-end">'+fmtQty(l.shippedQty)+'</td><td class="text-end">'+fmtMoney(l.price)+'</td><td class="text-end">'+fmtMoney(l.lineTotal||num(l.shippedQty)*num(l.price))+'</td><td>'+esc(l.notes||'')+'</td></tr>';}).join(''); const linkedDocs = window.DocumentLinksService ? window.DocumentLinksService.renderFor('customer_ddt', d) : ((d.sourceDocuments || []).length ? '<div class="alert alert-secondary small"><strong>Ordini collegati:</strong> '+esc((d.sourceDocuments || []).map(function(x){ return x.number || x.id; }).join(', '))+'</div>' : ''); $('#customerDdtDetailModalBody').html('<div class="d-flex justify-content-end gap-2 mb-3">'+(d.invoiceId?'<span class="badge text-bg-info align-self-center">Fatturato '+esc(d.invoiceNumber||d.invoiceId)+'</span>':'<button class="btn btn-outline-warning btn-sm customer-ddt-create-invoice" data-id="'+esc(d.id)+'" type="button"><i class="fas fa-file-invoice-dollar"></i> Crea fattura</button>')+'<button class="btn btn-outline-success btn-sm customer-ddt-update-sale-prices" data-id="'+esc(d.id)+'" type="button"><i class="fas fa-tags"></i> Aggiorna prezzi vendita</button><button class="btn btn-outline-secondary btn-sm customer-ddt-print" data-id="'+esc(d.id)+'" type="button"><i class="fas fa-print"></i> Stampa / PDF</button></div>'+linkedDocs+'<div class="row g-2 mb-3"><div class="col-md-4"><strong>Cliente:</strong><br>'+esc(d.customerName||'-')+'</div><div class="col-md-2"><strong>Data:</strong><br>'+esc(formatDate(d.date))+'</div><div class="col-md-3"><strong>Origine:</strong><br>'+esc(originLabel(d))+'</div><div class="col-md-3"><strong>Causale:</strong><br>'+esc(d.transportReason||'-')+'</div><div class="col-md-3"><strong>Vettore:</strong><br>'+esc(d.carrier||'-')+'</div><div class="col-md-3"><strong>Colli:</strong><br>'+esc(d.packages||'-')+'</div><div class="col-md-3"><strong>Peso:</strong><br>'+esc(d.weight||'-')+'</div><div class="col-md-3"><strong>Aspetto:</strong><br>'+esc(d.goodsAppearance||'-')+'</div></div><table class="table table-sm align-middle"><thead><tr><th>Origine</th><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Consegn.</th><th class="text-end">Prezzo</th><th class="text-end">Totale</th><th>Note</th></tr></thead><tbody>'+(rows||'<tr><td colspan="8" class="text-muted text-center">Nessuna riga.</td></tr>')+'</tbody></table>'+(d.notes?'<div class="alert alert-secondary small mt-3">'+esc(d.notes)+'</div>':'')+'<div class="alert alert-info small mt-3 mb-0">I movimenti generati dal DDT sono visibili in Magazzino → Movimenti con documento <code>customer_ddt '+esc(d.id)+'</code>.</div>'); $('#customerDdtDetailModal').modal('show'); }
  function bind() { if (_bound) return; _bound = true; ensureModal(); $('#newCustomerDdtBtn').on('click.customerDDTs', function(){ resetForm(); $('#customerDdtModal').modal('show'); }); $(document).on('change.customerDDTs', '#customerDdt-sourceType', function(){ tempLines=[]; syncSourceUI(); recalcLines(); }); $(document).on('change.customerDDTs', '#customerDdt-sourceOrderId', function(){ if ($(this).val()) loadFromOrder($(this).val()); }); $(document).on('change.customerDDTs', '#customerDdt-customerId', function(){ renderOrderOptions(); if (selectedSourceType()==='customer_orders') { tempLines=[]; renderMultiOrderOptions(); recalcLines(); } }); $(document).on('change.customerDDTs', '.customer-ddt-multi-order', loadFromMultiOrders); $(document).on('change.customerDDTs', '#customerDdt-productId', function(){ $('#customerDdt-linePrice').data('manual', false); syncSelectedProductPrice(); }); $(document).on('input.customerDDTs', '#customerDdt-linePrice', function(){ $(this).data('manual', true); }); $(document).on('input.customerDDTs', '.customer-ddt-line-qty', function(){ const i=parseInt($(this).attr('data-index'),10); if (isNaN(i) || !tempLines[i]) return; const max=$(this).attr('data-max'); let value=num($(this).val()); if (max !== undefined && max !== '' && value > num(max)) { value = num(max); $(this).val(value); } tempLines[i].shippedQty=value; tempLines[i].deliveredQty=value; tempLines[i].qty=value; }); $(document).on('click.customerDDTs', '#addCustomerDdtLineBtn', addLine); $(document).on('click.customerDDTs', '.customer-ddt-remove-line', function(){ if ($(this).prop('disabled')) return; tempLines.splice(parseInt($(this).attr('data-index'),10),1); recalcLines(); }); $(document).on('click.customerDDTs', '#saveCustomerDdtBtn', saveDDT); $('#customer-ddts-table-body').on('click.customerDDTs', '.customer-ddt-detail', function(){ showDetail($(this).attr('data-id')); }); $(document).on('click.customerDDTs', '.customer-ddt-print', function(e){ const id=$(e.currentTarget).attr('data-id'); const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (d && window.DDTPrintService) window.DDTPrintService.printDDT(d, 'customer'); });
    $(document).on('click.customerDDTs', '.customer-ddt-create-invoice', function(e){ const id=$(e.currentTarget).attr('data-id'); const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (d && window.DDTToInvoiceService) { $('#customerDdtDetailModal').modal('hide'); window.DDTToInvoiceService.startInvoiceFromCustomerDDT(d); } });
    $(document).on('click.customerDDTs', '.customer-ddt-update-sale-prices', function(e){ const id=$(e.currentTarget).attr('data-id'); const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (d && window.WarehousePriceUpdateService) window.WarehousePriceUpdateService.updateSalePricesFromCustomerDDT(d); }); if (window.AppStore && typeof window.AppStore.subscribe === 'function') { ['customerDDTs','customers','products','customerOrders','warehouseMovements'].forEach(function(k){ window.AppStore.subscribe(k, render); }); } render(); }
  window.CustomerDDTService = { computeStatus: computeStatus, buildProductResults: buildProductResults, updateOrderFromDDT: updateOrderFromDDT, normalizeDDT: normalizeDDT, printDDT: function(d){ if (window.DDTPrintService) window.DDTPrintService.printDDT(d, 'customer'); }, loadFromOrder: loadFromOrder };
  window.renderCustomerDDTsArea = render;
  window.AppModules.customerDDTs.bind = bind;
})();
