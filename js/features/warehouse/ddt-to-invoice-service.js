(function () {
  window.DDTToInvoiceService = window.DDTToInvoiceService || {};

  function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function getDataSafe(name) { return (typeof window.getData === 'function' ? window.getData(name) : null) || []; }
  function normalizeDDT(ddt) { return (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCustomerDDT === 'function') ? window.DomainNormalizers.normalizeCustomerDDT(ddt) : (ddt || {}); }
  function getProduct(productId) { return getDataSafe('products').find(function (p) { return String(p.id) === String(productId || ''); }) || null; }
  function getCustomer(customerId) { return getDataSafe('customers').find(function (c) { return String(c.id) === String(customerId || ''); }) || null; }
  function isForfettario() { const ci = (typeof window.getData === 'function' ? window.getData('companyInfo') : null) || {}; return !!(window.TaxRegimePolicy && window.TaxRegimePolicy.getCapabilities(ci).isForfettario); }
  function resolveLineVat(product) {
    const forf = isForfettario();
    if (window.VatRateCatalog && typeof window.VatRateCatalog.getLegacyFields === 'function') return window.VatRateCatalog.getLegacyFields(forf ? { vatRateId: 'n2_2_forfettario' } : (product || {}), forf ? 'n2_2_forfettario' : 'iva_22');
    return { iva: forf ? '0' : String((product && product.iva) || '22'), esenzioneIva: forf ? 'N2.2' : ((product && product.esenzioneIva) || '') };
  }
  function fmtDate(v) {
    if (!v) return '';
    const parts = String(v).slice(0, 10).split('-');
    return parts.length === 3 ? (parts[2] + '/' + parts[1] + '/' + parts[0]) : String(v);
  }
  function unique(arr) {
    const seen = {};
    return (arr || []).map(String).filter(function (v) { if (!v || seen[v]) return false; seen[v] = true; return true; });
  }


  function normalizeSummaryOptions(options) {
    const opts = options || {};
    const groupingMode = ['separate_by_ddt', 'aggregate_product'].includes(String(opts.groupingMode || '')) ? String(opts.groupingMode) : 'separate_by_ddt';
    const lineOrder = ['by_ddt', 'product', 'date'].includes(String(opts.lineOrder || '')) ? String(opts.lineOrder) : 'by_ddt';
    return {
      groupingMode: groupingMode,
      lineOrder: lineOrder,
      includeSummaryNote: opts.includeSummaryNote !== false,
      includeXmlDatiDDT: opts.includeXmlDatiDDT !== false
    };
  }

  function ddtLabel(ddt) {
    return 'DDT ' + (ddt.number || ddt.numero || ddt.id || '') + (ddt.date ? ' del ' + fmtDate(ddt.date) : '');
  }

  function buildSummaryNoteFromCustomerDDTs(rawDDTs) {
    const list = normalizeDDTList(rawDDTs);
    if (!list.length) return '';
    return 'Fattura riepilogativa relativa ai ' + list.map(ddtLabel).join(', ') + '.';
  }

  function sortInvoiceLines(lines, mode) {
    const m = String(mode || 'by_ddt');
    return (lines || []).slice().sort(function (a, b) {
      if (m === 'product') {
        return String(a.productName || '').localeCompare(String(b.productName || '')) || String(a.sourceCustomerDDTDate || '').localeCompare(String(b.sourceCustomerDDTDate || ''));
      }
      if (m === 'date') {
        return String(a.sourceCustomerDDTDate || '').localeCompare(String(b.sourceCustomerDDTDate || '')) || String(a.sourceCustomerDDTNumber || '').localeCompare(String(b.sourceCustomerDDTNumber || '')) || String(a.productName || '').localeCompare(String(b.productName || ''));
      }
      return 0;
    });
  }

  function aggregateInvoiceLinesByProduct(lines) {
    const map = {};
    const out = [];
    (lines || []).forEach(function (line) {
      const key = [line.productId || '', line.productName || '', line.price || 0, line.iva || '', line.esenzioneIva || '', line.priceType || 'net'].join('|');
      if (!map[key]) {
        map[key] = Object.assign({}, line, {
          qty: 0,
          subtotal: 0,
          sourceDocumentType: 'customer_ddt_summary',
          sourceCustomerDDTIds: [],
          sourceCustomerDDTNumbers: [],
          sourceCustomerDDTDates: []
        });
        delete map[key].sourceLineIndex;
        out.push(map[key]);
      }
      map[key].qty += num(line.qty);
      map[key].subtotal += num(line.subtotal != null ? line.subtotal : num(line.qty) * num(line.price));
      if (line.sourceCustomerDDTId) map[key].sourceCustomerDDTIds.push(String(line.sourceCustomerDDTId));
      if (line.sourceCustomerDDTNumber) map[key].sourceCustomerDDTNumbers.push(String(line.sourceCustomerDDTNumber));
      if (line.sourceCustomerDDTDate) map[key].sourceCustomerDDTDates.push(String(line.sourceCustomerDDTDate));
    });
    out.forEach(function (line) {
      line.qty = Math.round(num(line.qty) * 1000) / 1000;
      line.subtotal = Math.round(num(line.subtotal) * 100) / 100;
      line.sourceCustomerDDTIds = unique(line.sourceCustomerDDTIds);
      line.sourceCustomerDDTNumbers = unique(line.sourceCustomerDDTNumbers);
      line.sourceCustomerDDTDates = unique(line.sourceCustomerDDTDates);
      line.sourceCustomerDDTId = line.sourceCustomerDDTIds[0] || '';
      line.sourceCustomerDDTNumber = line.sourceCustomerDDTNumbers.join(', ');
      line.sourceCustomerDDTDate = line.sourceCustomerDDTDates[0] || '';
    });
    return out;
  }

  function buildInvoiceLinesFromCustomerDDT(rawDDT, options) {
    const opts = options || {};
    const ddt = normalizeDDT(rawDDT);
    const prefix = opts.includeDDTPrefix ? ('DDT ' + (ddt.number || ddt.numero || ddt.id || '') + (ddt.date ? ' del ' + fmtDate(ddt.date) : '') + ' - ') : '';
    return (ddt.lines || []).map(function (line, idx) {
      const product = getProduct(line.productId) || {};
      const vat = resolveLineVat(product);
      const qty = num(line.shippedQty || line.deliveredQty || line.qty);
      const price = num(line.price || line.salePrice || product.salePrice);
      const desc = String(line.productDescription || line.description || product.description || '').trim();
      return {
        productId: String(line.productId || ''),
        productName: prefix + desc,
        qty: qty,
        price: price,
        subtotal: Math.round(qty * price * 100) / 100,
        iva: String(vat.iva != null ? vat.iva : '22'),
        esenzioneIva: String(vat.esenzioneIva || ''),
        isLavoro: true,
        isCosto: false,
        priceType: 'net',
        sourceDocumentType: 'customer_ddt',
        sourceCustomerDDTId: String(ddt.id || ''),
        sourceCustomerDDTNumber: String(ddt.number || ddt.numero || ''),
        sourceCustomerDDTDate: String(ddt.date || ''),
        sourceLineIndex: idx
      };
    }).filter(function (line) { return line.productName && line.qty > 0; });
  }

  function normalizeDDTList(rawDDTs) {
    if (!Array.isArray(rawDDTs)) rawDDTs = rawDDTs ? [rawDDTs] : [];
    return rawDDTs.map(normalizeDDT).filter(function (d) { return d && d.id; });
  }

  function validateDDTsForSummaryInvoice(ddts, options) {
    const list = normalizeDDTList(ddts);
    if (!list.length) return { ok: false, message: 'Seleziona almeno un DDT cliente.' };
    const customerIds = unique(list.map(function (d) { return d.customerId; }));
    if (customerIds.length !== 1) return { ok: false, message: 'La fattura riepilogativa può includere solo DDT dello stesso cliente.' };
    const invoiced = list.filter(function (d) { return !!(d.invoiceId || d.invoiceNumber || d.invoiceStatus === 'invoiced'); });
    if (invoiced.length) return { ok: false, message: 'Uno o più DDT selezionati risultano già fatturati.' };
    const lines = buildInvoiceLinesFromCustomerDDTs(list, options);
    if (!lines.length) return { ok: false, message: 'I DDT selezionati non contengono righe fatturabili.' };
    return { ok: true, ddts: list, customerId: customerIds[0], lines: lines };
  }

  function buildInvoiceLinesFromCustomerDDTs(rawDDTs, options) {
    const opts = normalizeSummaryOptions(options);
    const list = normalizeDDTList(rawDDTs).sort(function (a, b) { return String(a.date || '').localeCompare(String(b.date || '')) || String(a.number || a.id || '').localeCompare(String(b.number || b.id || '')); });
    const includePrefix = list.length > 1 && opts.groupingMode !== 'aggregate_product';
    let lines = list.reduce(function (acc, ddt) {
      return acc.concat(buildInvoiceLinesFromCustomerDDT(ddt, { includeDDTPrefix: includePrefix }));
    }, []);
    if (opts.groupingMode === 'aggregate_product') lines = aggregateInvoiceLinesByProduct(lines);
    return sortInvoiceLines(lines, opts.lineOrder);
  }

  function buildSourceInfoFromCustomerDDTs(rawDDTs, options) {
    const opts = normalizeSummaryOptions(options);
    const list = normalizeDDTList(rawDDTs);
    const docs = list.map(function (ddt) {
      return { type: 'customer_ddt', id: String(ddt.id || ''), number: String(ddt.number || ddt.numero || ''), date: String(ddt.date || ''), customerId: String(ddt.customerId || '') };
    });
    return {
      type: list.length > 1 ? 'customer_ddt_summary' : 'customer_ddt',
      ids: unique(docs.map(function (d) { return d.id; })),
      numbers: unique(docs.map(function (d) { return d.number; })),
      dates: unique(docs.map(function (d) { return d.date; })),
      documents: docs,
      summaryOptions: opts,
      summaryNote: opts.includeSummaryNote ? buildSummaryNoteFromCustomerDDTs(list) : ''
    };
  }

  function buildSourceInfo(rawDDT) {
    return buildSourceInfoFromCustomerDDTs([rawDDT]);
  }

  function showFormSection() {
    $('.content-section').addClass('d-none');
    $('#nuova-fattura-accompagnatoria').removeClass('d-none');
    $('.sidebar .nav-link').removeClass('active');
    $('.sidebar .nav-link[data-target="nuova-fattura-accompagnatoria"], #menu-nuova-fattura').addClass('active');
  }

  function startInvoiceFromCustomerDDTs(rawDDTs, options) {
    const opts = normalizeSummaryOptions(options);
    const validation = validateDDTsForSummaryInvoice(rawDDTs, opts);
    if (!validation.ok) { alert(validation.message); return false; }
    const ddts = validation.ddts;
    const lines = validation.lines;
    const customerId = validation.customerId;
    const customer = getCustomer(customerId) || {};
    showFormSection();
    if (typeof window.prepareDocumentForm === 'function') window.prepareDocumentForm('Fattura');
    const sourceInfo = buildSourceInfoFromCustomerDDTs(ddts, opts);
    if (window.App && window.App.invoices) window.App.invoices.sourceCustomerDDT = sourceInfo;
    $('#invoice-customer-select').val(String(customerId || '')).trigger('change');
    if ($('#invoice-dataRiferimento').length) {
      const dates = sourceInfo.dates || [];
      $('#invoice-dataRiferimento').val(dates.length ? dates[dates.length - 1] : '');
    }
    if (window.InvoiceFormSessionService && typeof window.InvoiceFormSessionService.setLines === 'function') window.InvoiceFormSessionService.setLines(lines); else window.tempInvoiceLines = lines;
    if (typeof window.renderLocalInvoiceLines === 'function') window.renderLocalInvoiceLines();
    if (typeof window.updateTotalsDisplay === 'function') window.updateTotalsDisplay();
    const label = ddts.length === 1 ? ('DDT cliente ' + (ddts[0].number || ddts[0].numero || ddts[0].id)) : (ddts.length + ' DDT cliente per ' + (customer.name || customer.ragioneSociale || 'cliente'));
    const message = 'Fattura precompilata da ' + label + '. Controlla dati fiscali e pagamento prima di salvare.';
    $('#invoice-form-alert').removeClass('d-none alert-warning alert-danger').addClass('alert-info').text(message);
    return true;
  }

  function startInvoiceFromCustomerDDT(rawDDT) {
    const ddt = normalizeDDT(rawDDT);
    if (!ddt || !ddt.id) { alert('DDT cliente non trovato.'); return false; }
    if (window.DocumentLifecycleService && typeof window.DocumentLifecycleService.canEditCustomerDDT === 'function') {
      const guard = window.DocumentLifecycleService.canEditCustomerDDT(ddt);
      if (!guard.ok) { alert(guard.reason); return false; }
    } else if (ddt.invoiceId || ddt.invoiceNumber) {
      alert('Questo DDT risulta già collegato alla fattura ' + (ddt.invoiceNumber || ddt.invoiceId) + ': non può generare una nuova fattura.');
      return false;
    }
    return startInvoiceFromCustomerDDTs([ddt]);
  }

  window.DDTToInvoiceService.buildInvoiceLinesFromCustomerDDT = buildInvoiceLinesFromCustomerDDT;
  window.DDTToInvoiceService.buildInvoiceLinesFromCustomerDDTs = buildInvoiceLinesFromCustomerDDTs;
  window.DDTToInvoiceService.buildSourceInfo = buildSourceInfo;
  window.DDTToInvoiceService.buildSourceInfoFromCustomerDDTs = buildSourceInfoFromCustomerDDTs;
  window.DDTToInvoiceService.buildSummaryNoteFromCustomerDDTs = buildSummaryNoteFromCustomerDDTs;
  window.DDTToInvoiceService.normalizeSummaryOptions = normalizeSummaryOptions;
  window.DDTToInvoiceService.validateDDTsForSummaryInvoice = validateDDTsForSummaryInvoice;
  window.DDTToInvoiceService.startInvoiceFromCustomerDDT = startInvoiceFromCustomerDDT;
  window.DDTToInvoiceService.startInvoiceFromCustomerDDTs = startInvoiceFromCustomerDDTs;
})();
