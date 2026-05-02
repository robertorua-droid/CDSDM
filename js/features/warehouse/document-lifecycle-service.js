// js/features/warehouse/document-lifecycle-service.js
// Versione 0.0.36: regole operative sugli stati documentali, blocchi e rollback collegamenti.
(function () {
  window.DocumentLifecycleService = window.DocumentLifecycleService || {};

  const STATUS = {
    customerQuote: { draft: 'Bozza', sent: 'Inviato', accepted: 'Accettato', rejected: 'Rifiutato', converted: 'Convertito', cancelled: 'Annullato' },
    customerOrder: { draft: 'Bozza', confirmed: 'Aperto', partially_fulfilled: 'Parzialmente evaso', fulfilled: 'Evaso', cancelled: 'Annullato' },
    supplierOrder: { draft: 'Bozza', confirmed: 'Aperto', partially_received: 'Parzialmente ricevuto', received: 'Ricevuto', cancelled: 'Annullato' },
    customerDDT: { draft: 'Bozza', delivered: 'Emesso', partially_delivered: 'Emesso parziale', invoiced: 'Fatturato', cancelled: 'Annullato' },
    invoice: { draft: 'Bozza', issued: 'Emessa', sent: 'Inviata', paid: 'Pagata', cancelled: 'Annullata' },
    supplierDDT: { received: 'Ricevuto', returned: 'Reso fornitore', cancelled: 'Annullato' }
  };

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function str(value) { return value == null ? '' : String(value); }
  function lower(value) { return str(value).toLowerCase(); }
  function num(value) { const n = parseFloat(str(value).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function getCollection(name) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(name) || [];
    if (typeof window.getData === 'function') return window.getData(name) || [];
    return (window.globalData && window.globalData[name]) || [];
  }

  function containsId(list, id) {
    const target = str(id);
    return asArray(list).some(function (v) { return str(v) === target; });
  }

  function sourceDocumentsContain(documents, type, id) {
    const target = str(id);
    return asArray(documents).some(function (d) { return d && str(d.type) === type && str(d.id) === target; });
  }

  function isInvoiceDraft(invoice) {
    return !!(invoice && (invoice.isDraft === true || lower(invoice.status) === 'bozza' || lower(invoice.status) === 'draft'));
  }

  function isInvoicePaid(invoice) {
    return !!(invoice && (invoice.isPaid === true || lower(invoice.status) === 'pagata' || lower(invoice.status) === 'paid'));
  }

  function isInvoiceSent(invoice) {
    return !!(invoice && (invoice.sentToAgenzia === true || lower(invoice.status) === 'inviata' || lower(invoice.status) === 'sent'));
  }

  function isCustomerDDTInvoiced(ddt) {
    return !!(ddt && (ddt.invoiceId || ddt.invoiceNumber || lower(ddt.invoiceStatus) === 'invoiced' || lower(ddt.status) === 'invoiced'));
  }

  function getCustomerDDTsForOrder(orderId) {
    return getCollection('customerDDTs').filter(function (d) {
      return str(d.sourceOrderId) === str(orderId) || containsId(d.sourceOrderIds, orderId) || sourceDocumentsContain(d.sourceDocuments, 'customer_order', orderId);
    });
  }

  function getSupplierDDTsForOrder(orderId) {
    return getCollection('supplierDDTs').filter(function (d) {
      if (d.documentKind === 'supplier_return' || d.kind === 'return') return false;
      return str(d.sourceOrderId) === str(orderId) || containsId(d.sourceOrderIds, orderId) || sourceDocumentsContain(d.sourceDocuments, 'supplier_order', orderId);
    });
  }

  function canDeleteCustomerOrder(order, options) {
    const opts = options || {};
    if (!order) return { ok: false, reason: 'Ordine cliente non trovato.' };
    const linkedDDTs = opts.linkedDDTs || getCustomerDDTsForOrder(order.id);
    if (linkedDDTs.length) return { ok: false, reason: 'Ordine cliente collegato a uno o più DDT: eliminazione bloccata. Usa annullamento/rettifica controllata.' };
    const hasFulfilled = asArray(order.lines).some(function (l) { return num(l.fulfilledQty) > 0; });
    if (hasFulfilled || ['partially_fulfilled', 'fulfilled'].indexOf(str(order.status)) !== -1) return { ok: false, reason: 'Ordine cliente già evaso in tutto o in parte: eliminazione bloccata.' };
    return { ok: true, reason: '' };
  }

  function canDeleteSupplierOrder(order, options) {
    const opts = options || {};
    if (!order) return { ok: false, reason: 'Ordine fornitore non trovato.' };
    const linkedDDTs = opts.linkedDDTs || getSupplierDDTsForOrder(order.id);
    if (linkedDDTs.length) return { ok: false, reason: 'Ordine fornitore collegato a uno o più DDT ricevuti: eliminazione bloccata. Usa annullamento/rettifica controllata.' };
    const hasReceived = asArray(order.lines).some(function (l) { return num(l.receivedQty) > 0; });
    if (hasReceived || ['partially_received', 'received'].indexOf(str(order.status)) !== -1) return { ok: false, reason: 'Ordine fornitore già ricevuto in tutto o in parte: eliminazione bloccata.' };
    return { ok: true, reason: '' };
  }

  function canDeleteCustomerDDT(ddt) {
    if (!ddt) return { ok: false, reason: 'DDT cliente non trovato.' };
    if (isCustomerDDTInvoiced(ddt)) return { ok: false, reason: 'DDT già fatturato: eliminazione/modifica bloccata. Prima elimina o annulla la fattura collegata con rollback del collegamento.' };
    return { ok: true, reason: '' };
  }

  function canEditCustomerDDT(ddt) { return canDeleteCustomerDDT(ddt); }

  function canDeleteInvoice(invoice) {
    if (!invoice) return { ok: false, reason: 'Fattura non trovata.' };
    if (isInvoicePaid(invoice)) return { ok: false, reason: 'Non è possibile cancellare una fattura pagata.' };
    if (isInvoiceSent(invoice)) return { ok: false, reason: "Non è possibile cancellare una fattura marcata come inviata all'Agenzia delle Entrate." };
    return { ok: true, reason: '' };
  }

  function getInvoiceSourceDDTIds(invoice) {
    if (!invoice) return [];
    const direct = asArray(invoice.sourceCustomerDDTIds);
    const nested = invoice.sourceCustomerDDT && Array.isArray(invoice.sourceCustomerDDT.ids) ? invoice.sourceCustomerDDT.ids : [];
    return Array.from(new Set(direct.concat(nested).map(str).filter(Boolean)));
  }

  function buildInvoiceDeleteWarning(invoice) {
    const parts = [];
    const worklogIds = invoice && invoice.timesheetImport && Array.isArray(invoice.timesheetImport.worklogIds) ? invoice.timesheetImport.worklogIds : [];
    const ddtIds = getInvoiceSourceDDTIds(invoice);
    if (worklogIds.length) parts.push(worklogIds.length + ' record Timesheet verranno sbloccati');
    if (ddtIds.length) parts.push(ddtIds.length + ' DDT cliente verranno sbloccati per una nuova fatturazione');
    if (!parts.length) return '';
    return 'Attenzione: eliminando questa fattura, ' + parts.join(' e ') + '.\n\nVuoi continuare?';
  }

  function label(area, status) {
    return (STATUS[area] && STATUS[area][status]) || status || '';
  }

  window.DocumentLifecycleService.STATUS = STATUS;
  window.DocumentLifecycleService.label = label;
  window.DocumentLifecycleService.isInvoiceDraft = isInvoiceDraft;
  window.DocumentLifecycleService.isInvoicePaid = isInvoicePaid;
  window.DocumentLifecycleService.isInvoiceSent = isInvoiceSent;
  window.DocumentLifecycleService.isCustomerDDTInvoiced = isCustomerDDTInvoiced;
  window.DocumentLifecycleService.getCustomerDDTsForOrder = getCustomerDDTsForOrder;
  window.DocumentLifecycleService.getSupplierDDTsForOrder = getSupplierDDTsForOrder;
  window.DocumentLifecycleService.canDeleteCustomerOrder = canDeleteCustomerOrder;
  window.DocumentLifecycleService.canDeleteSupplierOrder = canDeleteSupplierOrder;
  window.DocumentLifecycleService.canDeleteCustomerDDT = canDeleteCustomerDDT;
  window.DocumentLifecycleService.canEditCustomerDDT = canEditCustomerDDT;
  window.DocumentLifecycleService.canDeleteInvoice = canDeleteInvoice;
  window.DocumentLifecycleService.getInvoiceSourceDDTIds = getInvoiceSourceDDTIds;
  window.DocumentLifecycleService.buildInvoiceDeleteWarning = buildInvoiceDeleteWarning;
})();
