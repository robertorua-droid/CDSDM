// js/features/warehouse/ddt-print-service.js
// Step 13: stampa/PDF DDT cliente, DDT fornitore ricevuto e DDT reso fornitore.
(function () {
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[c]; }); }
  function num(v) { const n = parseFloat(String(v == null ? 0 : v).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmtQty(v) { return num(v).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 3 }); }
  function fmtMoney(v) { return '€ ' + num(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function formatDate(v) { if (!v) return '-'; const p = String(v).slice(0,10).split('-'); return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : String(v); }
  function getDataSafe(key) { if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key); if (typeof window.getData === 'function') return window.getData(key); return (window.globalData && window.globalData[key]) || null; }
  function first(obj, keys) { obj = obj || {}; for (const k of keys) if (obj[k] != null && obj[k] !== '') return obj[k]; return ''; }
  function companyBlock() {
    const c = getDataSafe('companyInfo') || {};
    const name = first(c, ['name','ragioneSociale','denominazione']) || 'Azienda';
    const address = [first(c, ['address','indirizzo']), [first(c, ['cap']), first(c, ['city','comune']), first(c, ['province','provincia'])].filter(Boolean).join(' ')].filter(Boolean).join('<br>');
    const fiscal = [first(c, ['vatNumber','partitaIva','piva']) ? 'P.IVA ' + esc(first(c, ['vatNumber','partitaIva','piva'])) : '', first(c, ['codiceFiscale','fiscalCode']) ? 'CF ' + esc(first(c, ['codiceFiscale','fiscalCode'])) : ''].filter(Boolean).join(' · ');
    return '<div class="company"><h1>'+esc(name)+'</h1><div>'+address+'</div><div>'+fiscal+'</div><div>'+esc(first(c, ['email','pec','phone','telefono']))+'</div></div>';
  }
  function rowsHtml(lines, type) {
    if (type === 'supplier') {
      return (lines || []).map(function (l) { return '<tr><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||l.description||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="num">'+fmtQty(l.receivedQty)+'</td><td class="num">'+fmtQty(l.acceptedQty)+'</td><td class="num">'+fmtQty(l.quarantineQty)+'</td><td class="num">'+fmtQty(l.rejectedQty)+'</td><td class="num">'+fmtMoney(l.price||l.purchasePrice||l.unitCost)+'</td><td>'+esc(l.notes||'')+'</td></tr>'; }).join('');
    }
    if (type === 'supplier_return') {
      return (lines || []).map(function (l) { return '<tr><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||l.description||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="num">'+fmtQty(l.returnQty || l.qty || l.quantity || l.receivedQty)+'</td><td class="num">'+fmtMoney(l.price||l.purchasePrice||l.unitCost)+'</td><td>'+esc(l.notes||'')+'</td></tr>'; }).join('');
    }
    return (lines || []).map(function (l) { const total = num(l.lineTotal || num(l.shippedQty || l.deliveredQty || l.qty) * num(l.price || l.salePrice)); return '<tr><td>'+esc(l.productCode||'')+'</td><td>'+esc(l.productDescription||l.description||'')+'</td><td>'+esc(l.unitOfMeasure||'pz')+'</td><td class="num">'+fmtQty(l.shippedQty||l.deliveredQty||l.qty)+'</td><td class="num">'+fmtMoney(l.price||l.salePrice)+'</td><td class="num">'+fmtMoney(total)+'</td><td>'+esc(l.notes||'')+'</td></tr>'; }).join('');
  }
  function buildPrintableDDT(ddt, type) {
    ddt = ddt || {}; type = type === 'supplier' || type === 'supplier_return' ? type : 'customer';
    const isSupplier = type === 'supplier' || type === 'supplier_return';
    const isSupplierReturn = type === 'supplier_return';
    const subjectLabel = isSupplier ? 'Fornitore' : 'Cliente';
    const subjectName = isSupplier ? (ddt.supplierName || '-') : (ddt.customerName || '-');
    const origin = isSupplierReturn ? (ddt.sourceType === 'quarantine_return' ? 'Da quarantena' : 'Reso fornitore') : (ddt.sourceType === 'customer_orders' || ddt.sourceType === 'supplier_orders' ? 'Da ordini ' + esc((ddt.sourceOrderNumbers || ddt.sourceOrderIds || []).join(', ')) : (ddt.sourceType === 'supplier_order' || ddt.sourceType === 'customer_order' ? 'Da ordine ' + esc(ddt.sourceOrderNumber || ddt.sourceOrderId || '') : 'Diretto'));
    const title = isSupplierReturn ? 'DDT RESO FORNITORE' : (type === 'supplier' ? 'DDT FORNITORE / RICEVIMENTO MERCI' : 'DOCUMENTO DI TRASPORTO CLIENTE');
    const supplierCols = '<tr><th>Codice</th><th>Descrizione</th><th>UM</th><th>Ricev.</th><th>Accett.</th><th>Quarant.</th><th>Resp.</th><th>Prezzo</th><th>Note</th></tr>';
    const supplierReturnCols = '<tr><th>Codice</th><th>Descrizione</th><th>UM</th><th>Q.tà resa</th><th>Valore rif.</th><th>Note</th></tr>';
    const customerCols = '<tr><th>Codice</th><th>Descrizione</th><th>UM</th><th>Consegn.</th><th>Prezzo</th><th>Totale</th><th>Note</th></tr>';
    const cols = isSupplierReturn ? supplierReturnCols : (type === 'supplier' ? supplierCols : customerCols);
    const emptyColspan = isSupplierReturn ? 6 : (type === 'supplier' ? 9 : 7);
    const logistics = isSupplierReturn ? '<div><b>Causale:</b> Reso a fornitore</div><div><b>Rif. documento:</b> '+esc(ddt.supplierDocumentNumber||'-')+'</div>' : (type === 'supplier' ? '<div><b>Documento fornitore:</b> '+esc(ddt.supplierDocumentNumber||'-')+'</div>' : '<div><b>Causale trasporto:</b> '+esc(ddt.transportReason||'-')+'</div><div><b>Vettore:</b> '+esc(ddt.carrier||'-')+'</div><div><b>Colli:</b> '+esc(ddt.packages||'-')+'</div><div><b>Peso:</b> '+esc(ddt.weight||'-')+'</div><div><b>Aspetto beni:</b> '+esc(ddt.goodsAppearance||'-')+'</div>');
    return '<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title+' '+(ddt.number||''))+'</title><style>body{font-family:Arial,sans-serif;color:#111;margin:24px;font-size:12px}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:18px}.company h1{font-size:20px;margin:0 0 6px}.doc-title{text-align:right}.doc-title h2{font-size:18px;margin:0 0 8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}.box{border:1px solid #ccc;padding:10px;min-height:56px}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #bbb;padding:6px;vertical-align:top}th{background:#eee;text-align:left}.num{text-align:right;white-space:nowrap}.notes{margin-top:14px;border:1px solid #ccc;padding:10px;min-height:36px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:60px}.line{border-top:1px solid #222;text-align:center;padding-top:6px}.small{font-size:11px;color:#555}@media print{button{display:none}body{margin:0}.no-print{display:none}}</style></head><body><div class="top">'+companyBlock()+'<div class="doc-title"><h2>'+esc(title)+'</h2><div><b>Numero:</b> '+esc(ddt.number||'-')+'</div><div><b>Data:</b> '+esc(formatDate(ddt.date))+'</div><div><b>Origine:</b> '+origin+'</div></div></div><div class="grid"><div class="box"><b>'+subjectLabel+'</b><br>'+esc(subjectName)+'</div><div class="box">'+logistics+'</div></div><table><thead>'+cols+'</thead><tbody>'+(rowsHtml(ddt.lines||[], type) || '<tr><td colspan="'+emptyColspan+'">Nessuna riga.</td></tr>')+'</tbody></table><div class="notes"><b>Note:</b><br>'+esc(ddt.notes||'')+'</div><div class="sign"><div class="line">Firma mittente</div><div class="line">Firma destinatario / ricevente</div></div><p class="small">Documento didattico generato dal gestionale. Per creare un PDF usa Stampa → Salva come PDF.</p></body></html>';
  }
  function printDDT(ddt, type) {
    const w = window.open('', '_blank');
    if (!w) { alert('Popup bloccato. Consenti le finestre popup per stampare il DDT.'); return; }
    w.document.open(); w.document.write(buildPrintableDDT(ddt, type)); w.document.close();
    setTimeout(function(){ try { w.focus(); w.print(); } catch(e) {} }, 250);
  }
  window.DDTPrintService = { buildPrintableDDT: buildPrintableDDT, printDDT: printDDT };
})();
