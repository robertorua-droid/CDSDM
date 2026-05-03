// js/features/warehouse/supplier-ddts-module.js
// Step 18: DDT fornitore ricevuti/resi, quarantena avanzata e ricevimento da ordini fornitore multipli.
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.supplierDDTs = window.AppModules.supplierDDTs || {};

  let _bound = false;
  let tempLines = [];

  const STATUS_LABELS = {
    draft: 'Bozza',
    received: 'Ricevuto',
    received_with_reserve: 'Ricevuto con riserva',
    partially_rejected: 'Parzialmente respinto',
    rejected: 'Respinto',
    return_supplier: 'Reso al fornitore',
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
  function normalizeOrder(o) { return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeSupplierOrder === 'function' ? window.DomainNormalizers.normalizeSupplierOrder(o) : (o || {}); }
  function normalizeDDT(d) { return window.DomainNormalizers && typeof window.DomainNormalizers.normalizeSupplierDDT === 'function' ? window.DomainNormalizers.normalizeSupplierDDT(d) : (d || {}); }
  function getProducts() { return (getStoreArray('products') || []).map(normalizeProduct).filter(function (p) { return p.itemType === 'product'; }); }
  function getSuppliers() { return getStoreArray('suppliers') || []; }
  function getOrders() { return (getStoreArray('supplierOrders') || []).map(normalizeOrder).filter(function (o) { return o.status !== 'cancelled' && o.status !== 'received' && o.status !== 'draft'; }); }
  function lineRemainingQty(l) { return Math.max(0, num(l.qty) - num(l.receivedQty)); }
  function orderRemainingQty(o) { return (o.lines || []).reduce(function(s,l){ return s + lineRemainingQty(l); }, 0); }
  function getOpenOrders() { return getOrders().filter(function(o){ return ['confirmed','partially_received'].indexOf(o.status) !== -1 && orderRemainingQty(o) > 0; }); }
  function getDDTs() { return (getStoreArray('supplierDDTs') || []).map(normalizeDDT).sort(function(a,b){ return (String(b.date||'')+' '+String(b.id||'')).localeCompare(String(a.date||'')+' '+String(a.id||'')); }); }
  function isReturnDDT(d) { return String(d && (d.ddtDirection || d.direction || d.tipoDDT || '')).toLowerCase() === 'return_supplier'; }
  function getReceivedDDTs() { return getDDTs().filter(function (d) { return !isReturnDDT(d); }); }
  function getReturnDDTs() { return getDDTs().filter(isReturnDDT); }
  function findRawProduct(id) { return (getStoreArray('products') || []).find(function (p) { return String(p.id) === String(id); }) || null; }
  function getNextId() { const ids = getStoreArray('supplierDDTs').map(function(d){return parseInt(d.id,10);}).filter(function(n){return !isNaN(n);}); return ids.length ? Math.max.apply(null, ids)+1 : 1; }
  function getNextMovementId(offset) { const ids = getStoreArray('warehouseMovements').map(function (m) { return parseInt(m.id, 10); }).filter(function (n) { return !isNaN(n); }); return (ids.length ? Math.max.apply(null, ids) : 0) + 1 + (offset || 0); }
  function previewNumber() { const year = new Date().getFullYear(); const max = getStoreArray('supplierDDTs').reduce(function(acc,d){ const m=String(d.number||d.numero||'').match(/^DDF-(\d{4})-(\d+)$/); return (m && String(m[1])===String(year)) ? Math.max(acc, parseInt(m[2],10)||0) : acc; },0); return 'DDF-' + year + '-' + String(max+1).padStart(4,'0'); }
  function previewReturnNumber() { const year = new Date().getFullYear(); const max = getStoreArray('supplierDDTs').reduce(function(acc,d){ const m=String(d.number||d.numero||'').match(/^DDR-F-(\d{4})-(\d+)$/); return (m && String(m[1])===String(year)) ? Math.max(acc, parseInt(m[2],10)||0) : acc; },0); return 'DDR-F-' + year + '-' + String(max+1).padStart(4,'0'); }
  function supplierLabel(s) { return s.name || s.nome || s.ragioneSociale || s.denominazione || s.email || ('Fornitore ' + s.id); }
  function orderLabel(o) { return (o.number || ('Ordine ' + o.id)) + ' · ' + (o.supplierName || '') + ' · residuo ' + fmtQty(orderRemainingQty(o)); }
  function uniq(arr) { return Array.from(new Set((arr || []).filter(function(v){ return v !== '' && v != null; }).map(String))); }

  function ensureModal() {
    if ($('#supplierDdtModal').length) return;
    $('body').append(`
    <div class="modal fade" id="supplierDdtModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">DDT fornitore / Ricevimento merci</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button></div>
        <div class="modal-body"><form id="supplierDdtForm" onsubmit="return false;">
          <input type="hidden" id="supplierDdt-id" />
          <div class="row g-3 mb-3">
            <div class="col-md-3"><label class="form-label">Numero DDT</label><input class="form-control" id="supplierDdt-number" /></div>
            <div class="col-md-3"><label class="form-label">Data</label><input class="form-control" id="supplierDdt-date" type="date" /></div>
            <div class="col-md-3"><label class="form-label">Doc. fornitore</label><input class="form-control" id="supplierDdt-supplierDocumentNumber" placeholder="Numero documento ricevuto" /></div>
            <div class="col-md-3"><label class="form-label">Origine</label><select class="form-select" id="supplierDdt-sourceType"><option value="direct">Diretto senza ordine</option><option value="supplier_order">Da ordine fornitore</option><option value="supplier_orders">Da più ordini fornitore</option></select></div>
            <div class="col-md-6"><label class="form-label">Fornitore</label><select class="form-select" id="supplierDdt-supplierId"></select></div>
            <div class="col-md-6" id="supplierDdt-singleOrderWrap"><label class="form-label">Ordine fornitore</label><select class="form-select" id="supplierDdt-sourceOrderId" disabled></select></div>
            <div class="col-12"><label class="form-label">Note</label><input class="form-control" id="supplierDdt-notes" /></div>
          </div>
          <div class="card mb-3 d-none" id="supplierDdt-multiOrdersPanel"><div class="card-header fw-semibold d-flex justify-content-between align-items-center"><span>Ordini fornitore da accorpare</span><span class="small text-muted">Stesso fornitore, solo ordini confermati o parzialmente ricevuti</span></div><div class="card-body">
            <div class="alert alert-warning small py-2 mb-3"><strong>Controllo operativo.</strong> Seleziona solo ordini dello stesso fornitore. Le righe residue vengono proposte nel DDT e puoi ripartire la quantità ricevuta tra accettata, quarantena e respinta.</div>
            <div class="table-responsive"><table class="table table-sm align-middle mb-0"><thead><tr><th></th><th>Ordine</th><th>Data</th><th>Fornitore</th><th class="text-end">Residuo</th><th>Stato</th></tr></thead><tbody id="supplierDdt-multiOrdersBody"></tbody></table></div>
          </div></div>
          <div class="card mb-3"><div class="card-header fw-semibold">Righe DDT</div><div class="card-body">
            <div class="row g-2 align-items-end" id="supplierDdt-manualLineControls">
              <div class="col-md-4"><label class="form-label">Prodotto</label><select class="form-select" id="supplierDdt-productId"></select></div>
              <div class="col-md-2"><label class="form-label">Ricevuta</label><input class="form-control text-end" id="supplierDdt-lineReceivedQty" type="number" min="0" step="1" inputmode="decimal" value="1" /></div>
              <div class="col-md-2"><label class="form-label">Accettata</label><input class="form-control text-end" id="supplierDdt-lineAcceptedQty" type="number" min="0" step="1" inputmode="decimal" value="1" /></div>
              <div class="col-md-2"><label class="form-label">Quarantena</label><input class="form-control text-end" id="supplierDdt-lineQuarantineQty" type="number" min="0" step="1" inputmode="decimal" value="0" /></div>
              <div class="col-md-2"><label class="form-label">Respinta</label><input class="form-control text-end" id="supplierDdt-lineRejectedQty" type="number" min="0" step="1" inputmode="decimal" value="0" /></div>
              <div class="col-md-2"><label class="form-label">Prezzo acq.</label><input class="form-control text-end" id="supplierDdt-linePrice" type="number" min="0" step="0.01" /></div>
              <div class="col-md-8"><label class="form-label">Note riga</label><input class="form-control" id="supplierDdt-lineNotes" /></div>
              <div class="col-md-2"><button class="btn btn-outline-primary w-100" id="addSupplierDdtLineBtn" type="button"><i class="fas fa-plus"></i> Aggiungi</button></div>
            </div>
            <div class="table-responsive mt-3"><table class="table table-sm align-middle mb-0"><thead><tr><th>Origine</th><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Residuo origine</th><th class="text-end">Ricev.</th><th class="text-end">Accett.</th><th class="text-end">Quarant.</th><th class="text-end">Resp.</th><th class="text-end">Prezzo</th><th>Note</th><th class="text-end">Azioni</th></tr></thead><tbody id="supplierDdt-lines-body"><tr><td colspan="12" class="text-center text-muted py-3">Nessuna riga inserita.</td></tr></tbody></table></div>
          </div></div>
        </form></div>
        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button><button type="button" class="btn btn-primary" id="saveSupplierDdtBtn">Salva DDT</button></div>
      </div></div>
    </div>
    <div class="modal fade" id="supplierDdtDetailModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="supplierDdtDetailModalTitle">Dettaglio DDT fornitore</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button></div><div class="modal-body" id="supplierDdtDetailModalBody"></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button></div></div></div></div>`);
  }

  function computeStatus(lines) {
    const received = lines.reduce(function(s,l){return s+num(l.receivedQty);},0);
    const accepted = lines.reduce(function(s,l){return s+num(l.acceptedQty);},0);
    const quarantine = lines.reduce(function(s,l){return s+num(l.quarantineQty);},0);
    const rejected = lines.reduce(function(s,l){return s+num(l.rejectedQty);},0);
    if (received > 0 && rejected >= received && accepted === 0 && quarantine === 0) return 'rejected';
    if (quarantine > 0) return 'received_with_reserve';
    if (rejected > 0) return 'partially_rejected';
    return 'received';
  }

  function selectedSourceType() { return $('#supplierDdt-sourceType').val() || 'direct'; }
  function renderSupplierOptions() { const $sel = $('#supplierDdt-supplierId'); if (!$sel.length) return; const cur=$sel.val(); $sel.empty().append('<option value="">Seleziona fornitore...</option>'); getSuppliers().forEach(function(s){ $sel.append('<option value="'+esc(s.id)+'">'+esc(supplierLabel(s))+'</option>'); }); if (cur) $sel.val(cur); }
  function renderOrderOptions() { const $sel = $('#supplierDdt-sourceOrderId'); if (!$sel.length) return; const cur=$sel.val(); const supplierId=$('#supplierDdt-supplierId').val() || ''; $sel.empty().append('<option value="">Nessun ordine collegato</option>'); getOpenOrders().filter(function(o){ return !supplierId || String(o.supplierId) === String(supplierId); }).forEach(function(o){ $sel.append('<option value="'+esc(o.id)+'">'+esc(orderLabel(o))+'</option>'); }); if (cur && $sel.find('option[value="'+esc(cur)+'"]').length) $sel.val(cur); }
  function renderProductOptions() { const $sel = $('#supplierDdt-productId'); if (!$sel.length) return; const cur=$sel.val(); $sel.empty().append('<option value="">Seleziona prodotto...</option>'); getProducts().forEach(function(p){ const label=(p.code?p.code+' - ':'')+(p.description||'Prodotto')+' · disp. '+fmtQty(p.stockQty)+' · acq. '+fmtMoney(p.purchasePrice||0); $sel.append('<option value="'+esc(p.id)+'">'+esc(label)+'</option>'); }); if (cur) $sel.val(cur); syncSelectedProductPrice(); }
  function renderMultiOrderOptions() {
    const $body = $('#supplierDdt-multiOrdersBody'); if (!$body.length) return;
    const selected = getSelectedMultiOrderIds();
    const lockedSupplierId = $('#supplierDdt-supplierId').val() || '';
    const orders = getOpenOrders().filter(function(o){ return !lockedSupplierId || String(o.supplierId) === String(lockedSupplierId); });
    if (!orders.length) { $body.html('<tr><td colspan="6">'+emptyState('Nessun ordine fornitore selezionabile', 'Gli ordini aperti o parzialmente ricevuti compariranno qui.')+'</td></tr>'); return; }
    $body.html(orders.map(function(o){ const checked = selected.indexOf(String(o.id)) !== -1 ? ' checked' : ''; const badge = o.status === 'partially_received' ? 'text-bg-warning' : (o.status === 'confirmed' ? 'text-bg-primary' : 'text-bg-light text-dark'); return '<tr><td><input class="form-check-input supplier-ddt-multi-order" type="checkbox" value="'+esc(o.id)+'"'+checked+'></td><td>'+esc(o.number || o.id)+'</td><td>'+esc(formatDate(o.date))+'</td><td>'+esc(o.supplierName || '-')+'</td><td class="text-end">'+fmtQty(orderRemainingQty(o))+'</td><td><span class="badge warehouse-status-badge '+badge+'">'+esc(o.status)+'</span></td></tr>'; }).join(''));
  }
  function getSelectedMultiOrderIds() { return $('.supplier-ddt-multi-order:checked').map(function(){ return String($(this).val()); }).get(); }
  function syncSelectedProductPrice() { const id=$('#supplierDdt-productId').val(); const p=getProducts().find(function(x){return String(x.id)===String(id);}); if (p && !$('#supplierDdt-linePrice').data('manual')) $('#supplierDdt-linePrice').val(num(p.purchasePrice).toFixed(2)); }
  function syncSourceUI() { const type=selectedSourceType(); const isSingle=type==='supplier_order'; const isMulti=type==='supplier_orders'; $('#supplierDdt-sourceOrderId').prop('disabled', !isSingle); $('#supplierDdt-singleOrderWrap').toggleClass('d-none', isMulti); $('#supplierDdt-multiOrdersPanel').toggleClass('d-none', !isMulti); $('#supplierDdt-manualLineControls').toggleClass('d-none', isMulti || isSingle); if (!isSingle) $('#supplierDdt-sourceOrderId').val(''); renderMultiOrderOptions(); }
  function setLineTotalsFromReceived() { const r = num($('#supplierDdt-lineReceivedQty').val()); const a = num($('#supplierDdt-lineAcceptedQty').val()); const q = num($('#supplierDdt-lineQuarantineQty').val()); const rej = num($('#supplierDdt-lineRejectedQty').val()); if (a + q + rej === 0 && r > 0) $('#supplierDdt-lineAcceptedQty').val(r); }
  function lineOrigin(l) { if (l.sourceOrderNumber) return 'Ord. ' + l.sourceOrderNumber; if (l.sourceOrderId) return 'Ord. ' + l.sourceOrderId; return 'Diretto'; }

  function recalcLines() {
    const $body=$('#supplierDdt-lines-body'); if (!$body.length) return; $body.empty();
    if (!tempLines.length) { $body.append('<tr><td colspan="12" class="text-center text-muted py-3">Nessuna riga inserita.</td></tr>'); return; }
    tempLines.forEach(function(l,i){
      const maxAttr = l.sourceOrderId ? ' data-max="'+esc(l.remainingSourceQty || l.receivedQty || 0)+'"' : '';
      const removeDisabled = (selectedSourceType()==='supplier_orders' || selectedSourceType()==='supplier_order') ? ' disabled title="Rimuovi l\'ordine sorgente o imposta quantità 0"' : '';
      $body.append('<tr><td>'+esc(lineOrigin(l))+'</td><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="text-end">'+(l.sourceOrderId ? fmtQty(l.remainingSourceQty) : '-')+'</td><td><input class="form-control form-control-sm text-end supplier-ddt-line-field" data-field="receivedQty" data-index="'+i+'" type="number" min="0" step="1" inputmode="decimal" value="'+esc(num(l.receivedQty))+'"'+maxAttr+'></td><td><input class="form-control form-control-sm text-end supplier-ddt-line-field" data-field="acceptedQty" data-index="'+i+'" type="number" min="0" step="1" inputmode="decimal" value="'+esc(num(l.acceptedQty))+'"></td><td><input class="form-control form-control-sm text-end supplier-ddt-line-field" data-field="quarantineQty" data-index="'+i+'" type="number" min="0" step="1" inputmode="decimal" value="'+esc(num(l.quarantineQty))+'"></td><td><input class="form-control form-control-sm text-end supplier-ddt-line-field" data-field="rejectedQty" data-index="'+i+'" type="number" min="0" step="1" inputmode="decimal" value="'+esc(num(l.rejectedQty))+'"></td><td class="text-end">'+fmtMoney(l.price)+'</td><td>'+esc(l.notes||'')+'</td><td class="text-end"><button class="btn btn-sm btn-outline-danger supplier-ddt-remove-line" data-index="'+i+'" type="button"'+removeDisabled+'><i class="fas fa-trash"></i></button></td></tr>');
    });
  }

  function resetForm() { ensureModal(); const form=document.getElementById('supplierDdtForm'); if (form) form.reset(); $('#supplierDdt-id').val(''); $('#supplierDdt-number').val(previewNumber()); $('#supplierDdt-date').val(today()); $('#supplierDdt-sourceType').val('direct'); tempLines=[]; renderSupplierOptions(); renderOrderOptions(); renderProductOptions(); $('#supplierDdt-lineReceivedQty').val('1'); $('#supplierDdt-lineAcceptedQty').val('1'); $('#supplierDdt-lineQuarantineQty').val('0'); $('#supplierDdt-lineRejectedQty').val('0'); $('#supplierDdt-linePrice').data('manual', false); syncSourceUI(); recalcLines(); }

  function orderLineToDDTLine(order, line, index) {
    const remaining = lineRemainingQty(line);
    const price = num(line.price || line.purchasePrice || line.unitCost);
    return { productId:String(line.productId||''), productCode:line.productCode||'', productDescription:line.productDescription||line.description||'', description:line.productDescription||line.description||'', unitOfMeasure:line.unitOfMeasure||'pz', orderedQty:num(line.qty), receivedBeforeQty:num(line.receivedQty), remainingSourceQty:remaining, receivedQty:remaining, acceptedQty:remaining, quarantineQty:0, rejectedQty:0, price:price, purchasePrice:price, unitCost:price, notes:'', sourceOrderId:String(order.id), sourceOrderNumber:order.number || '', sourceOrderLineIndex:index };
  }
  function loadFromOrder(orderId) { const order = getOpenOrders().find(function(o){return String(o.id)===String(orderId);}); if (!order) return; $('#supplierDdt-sourceType').val('supplier_order'); $('#supplierDdt-sourceOrderId').val(order.id); $('#supplierDdt-supplierId').val(order.supplierId || ''); tempLines = (order.lines || []).map(function(l, idx){ return orderLineToDDTLine(order, l, idx); }).filter(function(l){return l.receivedQty>0;}); syncSourceUI(); recalcLines(); }
  function loadFromMultiOrders() {
    const ids = getSelectedMultiOrderIds();
    const orders = ids.map(function(id){ return getOpenOrders().find(function(o){ return String(o.id) === String(id); }); }).filter(Boolean);
    if (!orders.length) { tempLines = []; recalcLines(); return; }
    const supplierIds = uniq(orders.map(function(o){ return o.supplierId; }));
    if (supplierIds.length > 1) { alert('Puoi accorpare solo ordini dello stesso fornitore.'); $(document.activeElement).prop('checked', false); return loadFromMultiOrders(); }
    $('#supplierDdt-supplierId').val(supplierIds[0] || '');
    tempLines = [];
    orders.forEach(function(order){ (order.lines || []).forEach(function(line, idx){ const ddtLine = orderLineToDDTLine(order, line, idx); if (ddtLine.receivedQty > 0) tempLines.push(ddtLine); }); });
    renderMultiOrderOptions();
    recalcLines();
  }

  function addLine() {
    const productId=$('#supplierDdt-productId').val(); const received=num($('#supplierDdt-lineReceivedQty').val()); const accepted=num($('#supplierDdt-lineAcceptedQty').val()); const quarantine=num($('#supplierDdt-lineQuarantineQty').val()); const rejected=num($('#supplierDdt-lineRejectedQty').val()); const price=num($('#supplierDdt-linePrice').val()); const notes=($('#supplierDdt-lineNotes').val()||'').trim();
    if (!productId) { alert('Seleziona un prodotto.'); return; }
    if (received <= 0) { alert('La quantità ricevuta deve essere maggiore di zero.'); return; }
    if (Math.abs((accepted+quarantine+rejected)-received) > 0.0001) { alert('Accettata + Quarantena + Respinta deve essere uguale alla quantità ricevuta.'); return; }
    const p=getProducts().find(function(x){return String(x.id)===String(productId);}); if (!p) { alert('Prodotto non trovato.'); return; }
    tempLines.push({ productId:String(p.id), productCode:p.code||'', productDescription:p.description||'', description:p.description||'', unitOfMeasure:p.unitOfMeasure||'pz', orderedQty:0, receivedQty:received, acceptedQty:accepted, quarantineQty:quarantine, rejectedQty:rejected, price:price, purchasePrice:price, unitCost:price, notes:notes });
    $('#supplierDdt-lineReceivedQty').val('1'); $('#supplierDdt-lineAcceptedQty').val('1'); $('#supplierDdt-lineQuarantineQty').val('0'); $('#supplierDdt-lineRejectedQty').val('0'); $('#supplierDdt-lineNotes').val(''); $('#supplierDdt-linePrice').data('manual', false); syncSelectedProductPrice(); recalcLines();
  }

  function buildProductResults(lines) {
    const map = {};
    lines.forEach(function(l){ const id=String(l.productId||''); if (!id) throw new Error('Riga senza prodotto.'); const raw=findRawProduct(id); if (!raw) throw new Error('Prodotto non trovato: '+(l.productDescription||id)); const p=normalizeProduct(raw); if (!map[id]) map[id]={ product:p, stockBefore:num(p.stockQty), quarantineBefore:num(p.quarantineQty), accepted:0, quarantine:0, lines:[] }; map[id].accepted += num(l.acceptedQty); map[id].quarantine += num(l.quarantineQty); map[id].lines.push(l); });
    Object.keys(map).forEach(function(id){ const r=map[id]; r.stockAfter=r.stockBefore+r.accepted; r.quarantineAfter=r.quarantineBefore+r.quarantine; });
    return map;
  }
  function updateOrderFromDDT(order, lines) { if (!order) return null; const updatedLines=(order.lines||[]).map(function(ol, idx){ const receivedDelta=lines.filter(function(l){ const sameOrder = !l.sourceOrderId || String(l.sourceOrderId)===String(order.id); const sameIndex = l.sourceOrderLineIndex != null && l.sourceOrderLineIndex !== '' ? parseInt(l.sourceOrderLineIndex,10)===idx : String(l.productId)===String(ol.productId); return sameOrder && sameIndex; }).reduce(function(s,l){return s+num(l.receivedQty);},0); const nextReceived=num(ol.receivedQty)+receivedDelta; return Object.assign({}, ol, { receivedQty: nextReceived, remainingQty: Math.max(0, num(ol.qty)-nextReceived) }); }); const ordered=updatedLines.reduce(function(s,l){return s+num(l.qty);},0); const received=updatedLines.reduce(function(s,l){return s+num(l.receivedQty);},0); const status = received <= 0 ? (order.status || 'confirmed') : (received >= ordered ? 'received' : 'partially_received'); return Object.assign({}, order, { lines: updatedLines, status: status, stato: status, updatedAt: new Date().toISOString() }); }
  function validateLineQuantities() { tempLines.forEach(function(l){ if (num(l.receivedQty) < 0 || num(l.acceptedQty) < 0 || num(l.quarantineQty) < 0 || num(l.rejectedQty) < 0) throw new Error('Le quantità non possono essere negative.'); if (Math.abs((num(l.acceptedQty)+num(l.quarantineQty)+num(l.rejectedQty))-num(l.receivedQty)) > 0.0001) throw new Error('Verifica le righe: accettata + quarantena + respinta deve coincidere con ricevuta.'); if (l.sourceOrderId && num(l.receivedQty) > num(l.remainingSourceQty) + 0.0001) throw new Error('La quantità ricevuta per '+(l.productDescription || l.productId)+' supera il residuo dell\'ordine '+(l.sourceOrderNumber || l.sourceOrderId)+'.'); }); }
  function getSourceOrdersForCurrentDDT() { const type=selectedSourceType(); if (type==='supplier_order') { const id=$('#supplierDdt-sourceOrderId').val() || ''; const order=getOpenOrders().find(function(o){ return String(o.id)===String(id); }); return order ? [order] : []; } if (type==='supplier_orders') { const ids=uniq(tempLines.map(function(l){ return l.sourceOrderId; })); return ids.map(function(id){ return getOpenOrders().find(function(o){ return String(o.id)===String(id); }); }).filter(Boolean); } return []; }

  async function saveDDT() {
    const supplierId=$('#supplierDdt-supplierId').val(); const supplier=getSuppliers().find(function(s){return String(s.id)===String(supplierId);});
    if (!supplier) { alert('Seleziona un fornitore.'); return; }
    try { validateLineQuantities(); } catch(e){ alert(e.message || e); return; }
    const operativeLines = tempLines.filter(function(l){ return num(l.receivedQty) > 0; });
    if (!operativeLines.length) { alert('Aggiungi almeno una riga con quantità ricevuta maggiore di zero.'); return; }
    if (typeof window.saveDataToCloud !== 'function') { alert('Funzione saveDataToCloud non disponibile.'); return; }
    const sourceType=selectedSourceType(); const sourceOrders=getSourceOrdersForCurrentDDT();
    if ((sourceType==='supplier_order' || sourceType==='supplier_orders') && !sourceOrders.length) { alert('Seleziona almeno un ordine fornitore valido.'); return; }
    const sourceSupplierIds=uniq(sourceOrders.map(function(o){ return o.supplierId; }));
    if (sourceSupplierIds.length && String(sourceSupplierIds[0]) !== String(supplier.id)) { alert('Il fornitore del DDT deve coincidere con il fornitore degli ordini selezionati.'); return; }
    let productResults; try { productResults=buildProductResults(operativeLines); } catch(e){ alert(e.message||e); return; }
    const id=String($('#supplierDdt-id').val() || getNextId()); const supplierName=supplierLabel(supplier); const now=new Date().toISOString();
    const sourceOrderIds=uniq(sourceOrders.map(function(o){ return o.id; })); const sourceOrderNumbers=uniq(sourceOrders.map(function(o){ return o.number || o.id; }));
    const raw={ id:id, number:($('#supplierDdt-number').val()||previewNumber()).trim(), ddtDirection:'received_supplier', supplierDocumentNumber:($('#supplierDdt-supplierDocumentNumber').val()||'').trim(), date:$('#supplierDdt-date').val()||today(), supplierId:String(supplier.id), supplierName:supplierName, sourceType: sourceType === 'supplier_orders' ? 'supplier_orders' : (sourceType === 'supplier_order' ? 'supplier_order' : 'direct'), sourceOrderId: sourceType === 'supplier_order' ? (sourceOrderIds[0] || '') : '', sourceOrderIds: sourceOrderIds, sourceOrderNumbers: sourceOrderNumbers, sourceDocuments: sourceOrders.map(function(o){ return { type:'supplier_order', id:String(o.id), number:o.number || '', date:o.date || '' }; }), lines:operativeLines.map(function(l){return Object.assign({},l,{ lineTotal:num(l.receivedQty)*num(l.price) });}), notes:($('#supplierDdt-notes').val()||'').trim(), status:computeStatus(operativeLines), updatedAt:now };
    if (!getStoreArray('supplierDDTs').some(function(d){return String(d.id)===id;})) raw.createdAt=now;
    const ddt=normalizeDDT(raw);
    try {
      $('#saveSupplierDdtBtn').prop('disabled', true);
      await window.saveDataToCloud('supplierDDTs', ddt, id);
      let movementOffset=0;
      for (const productId of Object.keys(productResults)) {
        const r=productResults[productId];
        await window.saveDataToCloud('products', { stockQty:r.stockAfter, giacenzaDisponibile:r.stockAfter, quarantineQty:r.quarantineAfter, giacenzaQuarantena:r.quarantineAfter }, productId);
        if (r.accepted > 0) { const mid=String(getNextMovementId(movementOffset)); await window.saveDataToCloud('warehouseMovements', { id:mid, date:ddt.date, movementType:'CARICO', tipoMovimento:'CARICO', productId:productId, productCode:r.product.code||'', productDescription:r.product.description||'', unitOfMeasure:r.product.unitOfMeasure||'pz', quantity:r.accepted, qty:r.accepted, causale:'DDT fornitore - merce accettata', documentType:'supplier_ddt', documentId:id, stockBefore:r.stockBefore, stockAfter:r.stockBefore+r.accepted, quarantineBefore:r.quarantineBefore, quarantineAfter:r.quarantineBefore, sourceOrderIds:sourceOrderIds, createdAt:now }, mid); movementOffset++; }
        if (r.quarantine > 0) { const mid=String(getNextMovementId(movementOffset)); await window.saveDataToCloud('warehouseMovements', { id:mid, date:ddt.date, movementType:'QUARANTENA_IN', tipoMovimento:'QUARANTENA_IN', productId:productId, productCode:r.product.code||'', productDescription:r.product.description||'', unitOfMeasure:r.product.unitOfMeasure||'pz', quantity:r.quarantine, qty:r.quarantine, causale:'DDT fornitore - merce in quarantena/riserva', documentType:'supplier_ddt', documentId:id, stockBefore:r.stockBefore+r.accepted, stockAfter:r.stockBefore+r.accepted, quarantineBefore:r.quarantineBefore, quarantineAfter:r.quarantineBefore+r.quarantine, sourceOrderIds:sourceOrderIds, createdAt:now }, mid); movementOffset++; }
      }
      for (const order of sourceOrders) { const updatedOrder=updateOrderFromDDT(order, ddt.lines || []); if (updatedOrder) await window.saveDataToCloud('supplierOrders', updatedOrder, String(order.id)); }
      $('#supplierDdtModal').modal('hide'); render(); if (window.renderWarehouseArea) window.renderWarehouseArea(); if (window.renderSupplierOrdersArea) window.renderSupplierOrdersArea();
    } finally { $('#saveSupplierDdtBtn').prop('disabled', false); }
  }

  function originLabel(d) { if (d.sourceType === 'supplier_orders') return 'Ordini ' + ((d.sourceOrderNumbers || d.sourceOrderIds || []).join(', ') || '-'); if (d.sourceType==='supplier_order') return 'Ordine '+(d.sourceOrderNumber || d.sourceOrderId || ''); return 'Diretto'; }
  function render() {
    ensureModal(); renderSupplierOptions(); renderOrderOptions(); renderProductOptions(); renderMultiOrderOptions();
    const $body=$('#supplier-ddts-table-body'); if (!$body.length) return; $body.empty(); const ddts=getReceivedDDTs();
    if (!ddts.length) $body.append('<tr><td colspan="10">' + emptyState('Nessun DDT fornitore ricevuto', 'Registra un DDT fornitore diretto, da singolo ordine o da più ordini fornitore.') + '</td></tr>');
    ddts.forEach(function(d){ const received=(d.lines||[]).reduce(function(s,l){return s+num(l.receivedQty);},0); const accepted=(d.lines||[]).reduce(function(s,l){return s+num(l.acceptedQty);},0); const quarantine=(d.lines||[]).reduce(function(s,l){return s+num(l.quarantineQty);},0); const rejected=(d.lines||[]).reduce(function(s,l){return s+num(l.rejectedQty);},0); const badge=d.status==='rejected'?'text-bg-danger':(d.status==='received_with_reserve'?'text-bg-warning':(d.status==='partially_rejected'?'text-bg-warning':'text-bg-success'));
      $body.append('<tr><td>'+esc(d.number||'-')+'</td><td>'+esc(formatDate(d.date))+'</td><td>'+esc(d.supplierName||'-')+'</td><td>'+esc(originLabel(d))+'</td><td><span class="badge warehouse-status-badge '+badge+'">'+esc(STATUS_LABELS[d.status]||d.status)+'</span></td><td class="text-end">'+fmtQty(received)+'</td><td class="text-end">'+fmtQty(accepted)+'</td><td class="text-end">'+fmtQty(quarantine)+'</td><td class="text-end">'+fmtQty(rejected)+'</td><td class="text-end"><div class="warehouse-actions btn-group btn-group-sm"><button class="btn btn-outline-primary supplier-ddt-detail" data-id="'+esc(d.id)+'" type="button" title="Dettaglio"><i class="fas fa-eye"></i></button><button class="btn btn-outline-secondary supplier-ddt-print" data-id="'+esc(d.id)+'" type="button" title="Stampa / PDF"><i class="fas fa-print"></i></button><button class="btn btn-outline-success supplier-ddt-update-purchase-prices" data-id="'+esc(d.id)+'" type="button" title="Aggiorna prezzi acquisto prodotti"><i class="fas fa-tags"></i></button></div></td></tr>');
    });
    renderReturnDDTs();
  }

  function renderReturnDDTs() {
    const $body=$('#supplier-return-ddts-table-body'); if (!$body.length) return; $body.empty(); const ddts=getReturnDDTs();
    if (!ddts.length) { $body.append('<tr><td colspan="8">' + emptyState('Nessun DDT di reso fornitore', 'I resi possono essere generati dalla gestione quarantena.') + '</td></tr>'); return; }
    ddts.forEach(function(d){ const returned=(d.lines||[]).reduce(function(s,l){return s+num(l.returnQty || l.qty || l.receivedQty);},0); const origin=d.sourceType==='quarantine_return' ? 'Quarantena' : 'Manuale';
      $body.append('<tr><td>'+esc(d.number||'-')+'</td><td>'+esc(formatDate(d.date))+'</td><td>'+esc(d.supplierName||'-')+'</td><td>'+esc(origin)+'</td><td><span class="badge warehouse-status-badge text-bg-secondary">'+esc(STATUS_LABELS[d.status]||'Reso')+'</span></td><td class="text-end">'+fmtQty(returned)+'</td><td>'+esc(d.notes||'')+'</td><td class="text-end"><div class="warehouse-actions btn-group btn-group-sm"><button class="btn btn-outline-primary supplier-ddt-detail" data-id="'+esc(d.id)+'" type="button" title="Dettaglio"><i class="fas fa-eye"></i></button><button class="btn btn-outline-secondary supplier-ddt-print" data-id="'+esc(d.id)+'" type="button" title="Stampa / PDF"><i class="fas fa-print"></i></button></div></td></tr>');
    });
  }

  function showDetail(id) {
    const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (!d) return; const isReturn=isReturnDDT(d);
    $('#supplierDdtDetailModalTitle').text((isReturn ? 'DDT reso fornitore ' : 'DDT fornitore ')+(d.number||''));
    const rows=(d.lines||[]).map(function(l){ if (isReturn) return '<tr><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||l.description||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="text-end">'+fmtQty(l.returnQty || l.qty || l.receivedQty)+'</td><td class="text-end">'+fmtMoney(l.price)+'</td><td>'+esc(l.notes||'')+'</td></tr>'; return '<tr><td>'+esc(lineOrigin(l))+'</td><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||l.description||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="text-end">'+fmtQty(l.receivedQty)+'</td><td class="text-end">'+fmtQty(l.acceptedQty)+'</td><td class="text-end">'+fmtQty(l.quarantineQty)+'</td><td class="text-end">'+fmtQty(l.rejectedQty)+'</td><td class="text-end">'+fmtMoney(l.price)+'</td><td>'+esc(l.notes||'')+'</td></tr>'; }).join('');
    const quarantineQty=(d.lines||[]).reduce(function(s,l){ return s + num(l.quarantineQty); }, 0);
    const quarantineAction=(!isReturn && quarantineQty>0)?'<button class="btn btn-outline-warning btn-sm supplier-ddt-create-quarantine-report" data-id="'+esc(d.id)+'" type="button"><i class="fas fa-triangle-exclamation"></i> Segnala quarantena</button>':'';
    const actions='<div class="d-flex justify-content-end gap-2 mb-3">'+quarantineAction+(!isReturn?'<button class="btn btn-outline-success btn-sm supplier-ddt-update-purchase-prices" data-id="'+esc(d.id)+'" type="button"><i class="fas fa-tags"></i> Aggiorna prezzi acquisto</button>':'')+'<button class="btn btn-outline-secondary btn-sm supplier-ddt-print" data-id="'+esc(d.id)+'" type="button"><i class="fas fa-print"></i> Stampa / PDF</button></div>';
    const linkedDocs = window.DocumentLinksService ? window.DocumentLinksService.renderFor('supplier_ddt', d) : ((!isReturn && (d.sourceDocuments || []).length) ? '<div class="alert alert-secondary small"><strong>Ordini collegati:</strong> '+esc((d.sourceDocuments || []).map(function(x){ return x.number || x.id; }).join(', '))+'</div>' : '');
    const cols=isReturn?'<thead><tr><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Reso</th><th class="text-end">Valore rif.</th><th>Note</th></tr></thead>':'<thead><tr><th>Origine</th><th>Codice</th><th>Prodotto</th><th>UM</th><th class="text-end">Ricev.</th><th class="text-end">Accett.</th><th class="text-end">Quarant.</th><th class="text-end">Resp.</th><th class="text-end">Prezzo</th><th>Note</th></tr></thead>';
    const colspan=isReturn?6:10;
    $('#supplierDdtDetailModalBody').html(actions+linkedDocs+'<div class="row g-2 mb-3"><div class="col-md-4"><strong>Fornitore:</strong><br>'+esc(d.supplierName||'-')+'</div><div class="col-md-2"><strong>Data:</strong><br>'+esc(formatDate(d.date))+'</div><div class="col-md-3"><strong>Doc. fornitore:</strong><br>'+esc(d.supplierDocumentNumber||'-')+'</div><div class="col-md-3"><strong>Origine:</strong><br>'+esc(isReturn ? (d.sourceType==='quarantine_return'?'Quarantena':'Manuale') : originLabel(d))+'</div></div><table class="table table-sm align-middle">'+cols+'<tbody>'+(rows||'<tr><td colspan="'+colspan+'" class="text-muted text-center">Nessuna riga.</td></tr>')+'</tbody></table>'+(d.notes?'<div class="alert alert-secondary small mt-3">'+esc(d.notes)+'</div>':'')+'<div class="alert alert-info small mt-3 mb-0">I movimenti collegati sono visibili in Magazzino → Movimenti con documento <code>supplier_ddt '+esc(d.id)+'</code>.</div>');
    $('#supplierDdtDetailModal').modal('show');
  }

  async function createReturnDDTFromQuarantine(payload) {
    payload = payload || {}; if (typeof window.saveDataToCloud !== 'function') throw new Error('Funzione saveDataToCloud non disponibile.');
    const supplierId = String(payload.supplierId || ''); const supplier = getSuppliers().find(function(s){ return String(s.id) === supplierId; }); if (!supplier) throw new Error('Seleziona un fornitore per generare il DDT di reso.');
    const product = normalizeProduct(payload.product || findRawProduct(payload.productId) || {}); const quantity = num(payload.quantity); if (!product.id || quantity <= 0) throw new Error('Prodotto o quantità non validi per il DDT di reso.');
    const id = String(getNextId()); const now = new Date().toISOString(); const price = num(product.purchasePrice || payload.price || 0);
    const line = { productId:String(product.id), productCode:product.code||'', productDescription:product.description||'', description:product.description||'', unitOfMeasure:product.unitOfMeasure||'pz', returnQty:quantity, qty:quantity, receivedQty:0, acceptedQty:0, quarantineQty:0, rejectedQty:0, price:price, purchasePrice:price, unitCost:price, lineTotal:quantity*price, notes:payload.notes||'' };
    const ddt = normalizeDDT({ id:id, number:previewReturnNumber(), date:payload.date || today(), ddtDirection:'return_supplier', direction:'return_supplier', supplierId:supplierId, supplierName:supplierLabel(supplier), sourceType:'quarantine_return', sourceWarehouseMovementId:String(payload.movementId || ''), supplierDocumentNumber:payload.documentRef || '', lines:[line], notes:payload.notes || 'Reso a fornitore da quarantena', status:'return_supplier', createdAt:now, updatedAt:now });
    ddt.ddtDirection = 'return_supplier'; ddt.direction = 'return_supplier'; ddt.status = 'return_supplier'; ddt.stato = 'return_supplier'; ddt.total = quantity * price;
    await window.saveDataToCloud('supplierDDTs', ddt, id);
    return ddt;
  }

  function bind() {
    if (_bound) return; _bound = true; ensureModal();
    $('#newSupplierDdtBtn').on('click.supplierDDTs', function(){ resetForm(); $('#supplierDdtModal').modal('show'); });
    $(document).on('change.supplierDDTs', '#supplierDdt-sourceType', function(){ tempLines=[]; syncSourceUI(); recalcLines(); });
    $(document).on('change.supplierDDTs', '#supplierDdt-sourceOrderId', function(){ if ($(this).val()) loadFromOrder($(this).val()); });
    $(document).on('change.supplierDDTs', '#supplierDdt-supplierId', function(){ renderOrderOptions(); if (selectedSourceType()==='supplier_orders') { tempLines=[]; renderMultiOrderOptions(); recalcLines(); } });
    $(document).on('change.supplierDDTs', '.supplier-ddt-multi-order', loadFromMultiOrders);
    $(document).on('change.supplierDDTs', '#supplierDdt-productId', function(){ $('#supplierDdt-linePrice').data('manual', false); syncSelectedProductPrice(); });
    $(document).on('input.supplierDDTs', '#supplierDdt-linePrice', function(){ $(this).data('manual', true); });
    $(document).on('input.supplierDDTs', '#supplierDdt-lineReceivedQty', setLineTotalsFromReceived);
    $(document).on('input.supplierDDTs', '.supplier-ddt-line-field', function(){ const i=parseInt($(this).attr('data-index'),10); const field=$(this).attr('data-field'); if (isNaN(i) || !tempLines[i] || !field) return; const max=$(this).attr('data-max'); let value=num($(this).val()); if (field==='receivedQty' && max !== undefined && max !== '' && value > num(max)) { value=num(max); $(this).val(value); } tempLines[i][field]=value; });
    $(document).on('click.supplierDDTs', '#addSupplierDdtLineBtn', addLine);
    $(document).on('click.supplierDDTs', '.supplier-ddt-remove-line', function(){ if ($(this).prop('disabled')) return; tempLines.splice(parseInt($(this).attr('data-index'),10),1); recalcLines(); });
    $(document).on('click.supplierDDTs', '#saveSupplierDdtBtn', saveDDT);
    $(document).on('click.supplierDDTs', '.supplier-ddt-detail', function(){ showDetail($(this).attr('data-id')); });
    $(document).on('click.supplierDDTs', '.supplier-ddt-print', function(e){ const id=$(e.currentTarget).attr('data-id'); const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (d && window.DDTPrintService) window.DDTPrintService.printDDT(d, isReturnDDT(d) ? 'supplier_return' : 'supplier'); });
    $(document).on('click.supplierDDTs', '.supplier-ddt-update-purchase-prices', function(e){ const id=$(e.currentTarget).attr('data-id'); const d=getDDTs().find(function(x){return String(x.id)===String(id);}); if (d && !isReturnDDT(d) && window.WarehousePriceUpdateService) window.WarehousePriceUpdateService.updatePurchasePricesFromSupplierDDT(d); });
    $(document).on('click.supplierDDTs', '.supplier-ddt-create-quarantine-report', async function(e){
      const id=$(e.currentTarget).attr('data-id'); const d=getDDTs().find(function(x){return String(x.id)===String(id);});
      if (!d) return alert('DDT fornitore non trovato.');
      if (!window.AppModules || !window.AppModules.operationalReports || typeof window.AppModules.operationalReports.createFromSupplierDDTQuarantine !== 'function') return alert('Modulo Segnalazioni operative non disponibile.');
      try { await window.AppModules.operationalReports.createFromSupplierDDTQuarantine(d); $('#supplierDdtDetailModal').modal('hide'); alert('Bozza di segnalazione quarantena creata. Aprila in Workflow → Segnalazioni operative e usa Invia segnalazione per renderla effettiva.'); } catch(err) { console.error(err); }
    });
    if (window.AppStore && typeof window.AppStore.subscribe === 'function') ['supplierDDTs','suppliers','products','supplierOrders','warehouseMovements'].forEach(function(k){ window.AppStore.subscribe(k, render); });
    render();
  }

  window.SupplierDDTService = { computeStatus: computeStatus, buildProductResults: buildProductResults, updateOrderFromDDT: updateOrderFromDDT, normalizeDDT: normalizeDDT, isReturnDDT: isReturnDDT, createReturnDDTFromQuarantine: createReturnDDTFromQuarantine, printDDT: function(d){ if (window.DDTPrintService) window.DDTPrintService.printDDT(d, isReturnDDT(d) ? 'supplier_return' : 'supplier'); }, loadFromOrder: loadFromOrder };
  window.renderSupplierDDTsArea = render;
  window.AppModules.supplierDDTs.bind = bind;
})();
