// js/features/warehouse/document-links-service.js
// Versione 0.0.37: vista "Documenti collegati" per ciclo preventivo -> ordine -> DDT -> fattura.
(function () {
  function esc(v) {
    if (window.VatRateCatalog && typeof window.VatRateCatalog.escapeHtml === 'function') return window.VatRateCatalog.escapeHtml(v);
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; });
  }
  function str(v) { return String(v == null ? '' : v); }
  function asArray(v) { return Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]); }
  function containsId(list, id) { const s = str(id); return asArray(list).some(function (x) { return str(x) === s; }); }
  function fmtDate(v) { if (!v) return '-'; const s = String(v).slice(0, 10); const p = s.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; }
  function getStoreArray(key) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key) || [];
    if (typeof window.getData === 'function') return window.getData(key) || [];
    return (window.globalData && window.globalData[key]) || [];
  }
  function sourceDocsContain(docs, type, id) {
    const s = str(id);
    return asArray(docs).some(function (d) { return d && str(d.type) === type && str(d.id) === s; });
  }
  function sourceDocsOfType(docs, type) { return asArray(docs).filter(function (d) { return d && str(d.type) === type; }); }
  function ddtIdsFromInvoice(inv) {
    const ids = asArray(inv && inv.sourceCustomerDDTIds);
    const nested = inv && inv.sourceCustomerDDT && Array.isArray(inv.sourceCustomerDDT.ids) ? inv.sourceCustomerDDT.ids : [];
    sourceDocsOfType(inv && inv.sourceDocuments, 'customer_ddt').forEach(function (d) { ids.push(d.id); });
    nested.forEach(function (id) { ids.push(id); });
    return ids.filter(function (id, idx, arr) { return id != null && id !== '' && arr.map(str).indexOf(str(id)) === idx; });
  }
  function docKey(item) { return [item.type, item.id || '', item.number || '', item.title || ''].join('|'); }
  function unique(items) {
    const seen = {};
    return items.filter(function (item) { const k = docKey(item); if (seen[k]) return false; seen[k] = true; return true; });
  }
  function pushDoc(list, type, title, doc, extra) {
    if (!doc) return;
    list.push(Object.assign({ type: type, title: title, id: doc.id, number: doc.number || doc.numero || '', date: doc.date || doc.data || '', status: doc.status || doc.stato || '', note: '' }, extra || {}));
  }
  function customerDDTsForOrder(orderId) {
    return getStoreArray('customerDDTs').filter(function (d) {
      return str(d.sourceOrderId) === str(orderId) || containsId(d.sourceOrderIds, orderId) || sourceDocsContain(d.sourceDocuments, 'customer_order', orderId) || asArray(d.lines).some(function (l) { return str(l.sourceOrderId) === str(orderId); });
    });
  }
  function supplierDDTsForOrder(orderId) {
    return getStoreArray('supplierDDTs').filter(function (d) {
      const dir = str(d.ddtDirection || d.direction || '').toLowerCase();
      if (dir === 'return_supplier') return false;
      return str(d.sourceOrderId) === str(orderId) || containsId(d.sourceOrderIds, orderId) || sourceDocsContain(d.sourceDocuments, 'supplier_order', orderId) || asArray(d.lines).some(function (l) { return str(l.sourceOrderId) === str(orderId); });
    });
  }
  function invoicesForCustomerDDT(ddtId) {
    return getStoreArray('invoices').filter(function (inv) {
      return containsId(ddtIdsFromInvoice(inv), ddtId) || sourceDocsContain(inv.sourceDocuments, 'customer_ddt', ddtId);
    });
  }
  function movementsFor(documentType, documentId) {
    return getStoreArray('warehouseMovements').filter(function (m) {
      return str(m.documentType) === documentType && str(m.documentId) === str(documentId);
    });
  }
  function worklogsForInvoice(invoiceId) {
    return getStoreArray('worklogs').filter(function (w) { return str(w.invoiceId) === str(invoiceId); });
  }
  function build(type, doc) {
    const items = [];
    if (!doc) return items;
    if (type === 'customer_quote') {
      const orders = getStoreArray('customerOrders').filter(function (o) { return str(o.id) === str(doc.orderId) || str(o.sourceQuoteId) === str(doc.id) || sourceDocsContain(o.sourceDocuments, 'customer_quote', doc.id); });
      orders.forEach(function (o) { pushDoc(items, 'customer_order', 'Ordine cliente generato', o, { note: 'Conversione preventivo → ordine' }); });
    }
    if (type === 'customer_order') {
      getStoreArray('customerQuotes').concat(getStoreArray('quotes')).filter(function (q) { return str(q.orderId) === str(doc.id) || str(doc.convertedOrderId) === str(doc.id); }).forEach(function (q) { pushDoc(items, 'customer_quote', 'Preventivo sorgente', q); });
      customerDDTsForOrder(doc.id).forEach(function (d) { pushDoc(items, 'customer_ddt', 'DDT cliente collegato', d, { note: d.invoiceId ? 'Fatturato' : 'Da fatturare' }); });
      customerDDTsForOrder(doc.id).forEach(function (d) { invoicesForCustomerDDT(d.id).forEach(function (inv) { pushDoc(items, 'invoice', 'Fattura collegata', inv, { note: 'Collegata tramite DDT ' + (d.number || d.id) }); }); });
    }
    if (type === 'customer_ddt') {
      const orderIds = asArray(doc.sourceOrderIds).concat(str(doc.sourceOrderId) ? [doc.sourceOrderId] : []);
      sourceDocsOfType(doc.sourceDocuments, 'customer_order').forEach(function (d) { orderIds.push(d.id); });
      orderIds.forEach(function (id) { const o = getStoreArray('customerOrders').find(function (x) { return str(x.id) === str(id); }); pushDoc(items, 'customer_order', 'Ordine cliente sorgente', o); });
      invoicesForCustomerDDT(doc.id).forEach(function (inv) { pushDoc(items, 'invoice', 'Fattura collegata', inv); });
      if (doc.invoiceId && !items.some(function (x) { return x.type === 'invoice' && str(x.id) === str(doc.invoiceId); })) {
        const inv = getStoreArray('invoices').find(function (x) { return str(x.id) === str(doc.invoiceId); });
        pushDoc(items, 'invoice', 'Fattura collegata', inv || { id: doc.invoiceId, number: doc.invoiceNumber || '', date: '', status: '' });
      }
      const movs = movementsFor('customer_ddt', doc.id);
      if (movs.length) items.push({ type: 'warehouse_movement', title: 'Movimenti magazzino generati', id: str(doc.id), number: String(movs.length), date: '', status: 'movimenti', note: 'Scarichi collegati al DDT cliente' });
    }
    if (type === 'invoice') {
      const ddtIds = ddtIdsFromInvoice(doc);
      ddtIds.forEach(function (id) { const d = getStoreArray('customerDDTs').find(function (x) { return str(x.id) === str(id); }); pushDoc(items, 'customer_ddt', 'DDT incluso in fattura', d || { id: id, number: id }); });
      ddtIds.forEach(function (id) { const d = getStoreArray('customerDDTs').find(function (x) { return str(x.id) === str(id); }); if (!d) return; asArray(d.sourceOrderIds).concat(str(d.sourceOrderId) ? [d.sourceOrderId] : []).forEach(function (oid) { const o = getStoreArray('customerOrders').find(function (x) { return str(x.id) === str(oid); }); pushDoc(items, 'customer_order', 'Ordine origine indiretto', o, { note: 'Tramite DDT ' + (d.number || d.id) }); }); });
      const wls = worklogsForInvoice(doc.id);
      if (wls.length) items.push({ type: 'worklog', title: 'Timesheet collegati', id: str(doc.id), number: String(wls.length), date: '', status: 'fatturati', note: 'Record timesheet marcati con questa fattura' });
    }
    if (type === 'supplier_order') {
      supplierDDTsForOrder(doc.id).forEach(function (d) { pushDoc(items, 'supplier_ddt', 'DDT fornitore ricevuto', d); });
    }
    if (type === 'supplier_ddt') {
      const orderIds = asArray(doc.sourceOrderIds).concat(str(doc.sourceOrderId) ? [doc.sourceOrderId] : []);
      sourceDocsOfType(doc.sourceDocuments, 'supplier_order').forEach(function (d) { orderIds.push(d.id); });
      orderIds.forEach(function (id) { const o = getStoreArray('supplierOrders').find(function (x) { return str(x.id) === str(id); }); pushDoc(items, 'supplier_order', 'Ordine fornitore sorgente', o); });
      const movs = movementsFor('supplier_ddt', doc.id);
      if (movs.length) items.push({ type: 'warehouse_movement', title: 'Movimenti magazzino generati', id: str(doc.id), number: String(movs.length), date: '', status: 'movimenti', note: 'Carichi/quarantena collegati al DDT fornitore' });
    }
    return unique(items);
  }
  function labelType(type) {
    return ({ customer_quote: 'Preventivo cliente', customer_order: 'Ordine cliente', customer_ddt: 'DDT cliente', invoice: 'Fattura', supplier_order: 'Ordine fornitore', supplier_ddt: 'DDT fornitore', warehouse_movement: 'Movimenti', worklog: 'Timesheet' })[type] || type;
  }
  function render(type, doc) {
    const items = build(type, doc);
    if (!items.length) return '<div class="card border-0 shadow-sm mb-3"><div class="card-body"><h6 class="mb-2"><i class="fas fa-link me-1"></i>Documenti collegati</h6><div class="text-muted small">Nessun documento collegato rilevato.</div></div></div>';
    const rows = items.map(function (it) {
      return '<tr><td><span class="badge text-bg-light text-dark">'+esc(labelType(it.type))+'</span></td><td>'+esc(it.title || '')+'</td><td>'+esc(it.number || it.id || '-')+'</td><td>'+esc(fmtDate(it.date))+'</td><td>'+esc(it.status || '-')+'</td><td class="small text-muted">'+esc(it.note || '')+'</td></tr>';
    }).join('');
    return '<div class="card border-0 shadow-sm mb-3 document-links-card"><div class="card-body"><h6 class="mb-2"><i class="fas fa-link me-1"></i>Documenti collegati</h6><div class="table-responsive"><table class="table table-sm align-middle mb-0"><thead><tr><th>Tipo</th><th>Relazione</th><th>Numero/ID</th><th>Data</th><th>Stato</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table></div></div></div>';
  }
  window.DocumentLinksService = { build: build, render: render, renderFor: render };
})();
