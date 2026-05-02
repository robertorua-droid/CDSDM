(function () {
  window.InvoiceService = window.InvoiceService || {};

  function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCollection(name) {
    if (typeof window.getData === 'function') return window.getData(name) || [];
    return [];
  }

  function getCompanyInfo() {
    return (typeof window.getData === 'function' ? window.getData('companyInfo') : null) || {};
  }

  function getInvoiceById(invoiceId) {
    return getCollection('invoices').find(function (inv) {
      return String(inv.id) === String(invoiceId);
    }) || null;
  }

  function getCustomerById(customerId) {
    return getCollection('customers').find(function (cust) {
      return String(cust.id) === String(customerId);
    }) || null;
  }

  function getInvoiceContextById(invoiceId) {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return null;
    const company = getCompanyInfo();
    const customer = getCustomerById(invoice.customerId) || {};
    return { invoice: invoice, company: company, customer: customer };
  }

  function calculateTotalsForInvoice(invoice, options) {
    if (!invoice) throw new Error('Documento mancante');
    if (!window.InvoiceCalculator || typeof window.InvoiceCalculator.calculateTotals !== 'function') {
      throw new Error('InvoiceCalculator non disponibile');
    }
    const company = getCompanyInfo();
    const customer = getCustomerById(invoice.customerId) || {};
    return window.InvoiceCalculator.calculateTotals(invoice.lines || [], company, customer, invoice.type || 'Fattura', options);
  }

  function createNewDocumentState(type) {
    const company = getCompanyInfo();
    const taxDefaults = (window.InvoiceCalculator && typeof window.InvoiceCalculator.getInvoiceDefaults === 'function')
      ? window.InvoiceCalculator.getInvoiceDefaults(company)
      : { isForfettario: false, defaultIva: '22' };
    const today = new Date().toISOString().slice(0, 10);
    return {
      type: type,
      title: type === 'Nota di Credito' ? 'Nuova Nota di Credito' : 'Nuova Fattura',
      today: today,
      invoiceIdLabel: 'Nuovo',
      defaultIva: taxDefaults.defaultIva,
      disableIvaField: !!taxDefaults.isForfettario,
      customerId: '',
      date: today,
      numberYear: today.substring(0, 4),
      condizioniPagamento: 'Pagamento Completo',
      paymentMethodId: 'mp05_bonifico',
      modalitaPagamento: 'Bonifico bancario',
      dataRiferimento: today,
      giorniTermini: 30,
      fineMese: false,
      giornoFissoEnabled: false,
      giornoFissoValue: '',
      bankChoice: '1',
      companyBankId: (window.CompanyBankCatalog && window.CompanyBankCatalog.getDefault && window.CompanyBankCatalog.getDefault() ? window.CompanyBankCatalog.getDefault().id : ''),
      lines: [],
      linkedInvoice: '',
      reason: '',
      attachTimesheetPdf: false,
      attachTimesheetNotes: true,
      sourceCustomerDDT: null
    };
  }

  function createEditingState(invoice, isCopy) {
    if (!invoice) return null;
    const today = new Date().toISOString().slice(0, 10);
    const type = isCopy ? 'Fattura' : (invoice.type || 'Fattura');
    const base = createNewDocumentState(type);
    const paymentInfo = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeInvoicePaymentInfo === 'function')
      ? window.DomainNormalizers.normalizeInvoicePaymentInfo(invoice, getCompanyInfo())
      : { modalitaPagamento: invoice.modalitaPagamento || 'Bonifico Bancario', bankChoice: String(invoice.bankChoice || '1') };
    const creditInfo = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCreditNoteInfo === 'function')
      ? window.DomainNormalizers.normalizeCreditNoteInfo(invoice)
      : invoice;
    const metodoNorm = paymentInfo.modalitaPagamento || 'Bonifico Bancario';
    return Object.assign({}, base, {
      type: type,
      title: isCopy ? base.title : ('Modifica ' + type + ' ' + (invoice.number || '')),
      invoiceIdLabel: isCopy ? 'Nuovo' : String(invoice.id),
      currentInvoiceId: isCopy ? null : String(invoice.id),
      customerId: invoice.customerId || '',
      date: isCopy ? today : (invoice.date || today),
      number: isCopy ? '' : (invoice.number || ''),
      isDraft: (!isCopy) && (invoice.isDraft === true || String(invoice.status || '') === 'Bozza'),
      condizioniPagamento: invoice.condizioniPagamento || base.condizioniPagamento,
      paymentMethodId: paymentInfo.paymentMethodId || invoice.paymentMethodId || "mp05_bonifico",
      paymentMethodCode: paymentInfo.paymentMethodCode || invoice.paymentMethodCode || "MP05",
      modalitaPagamento: metodoNorm,
      dataRiferimento: invoice.dataRiferimento || invoice.date || today,
      giorniTermini: (invoice.giorniTermini != null && String(invoice.giorniTermini) !== '') ? invoice.giorniTermini : base.giorniTermini,
      fineMese: !!invoice.fineMese,
      giornoFissoEnabled: !!invoice.giornoFissoEnabled,
      giornoFissoValue: (invoice.giornoFissoValue != null && String(invoice.giornoFissoValue) !== '') ? invoice.giornoFissoValue : '',
      bankChoice: String(paymentInfo.bankChoice || '1'),
      companyBankId: paymentInfo.companyBankId || invoice.companyBankId || "",
      dataScadenza: invoice.dataScadenza || '',
      linkedInvoice: creditInfo.linkedInvoice || '',
      linkedInvoiceDate: creditInfo.linkedInvoiceDate || '',
      reason: creditInfo.reason || '',
      attachTimesheetPdf: isCopy ? false : !!invoice.attachTimesheetPdf,
      attachTimesheetNotes: isCopy ? true : (invoice.attachTimesheetNotes !== false),
      lines: cloneDeep(invoice.lines || []),
      sourceCustomerDDT: isCopy ? null : normalizeSourceCustomerDDT(invoice.sourceCustomerDDT || null),
      timesheetImportState: isCopy ? null : ((window.DomainNormalizers && typeof window.DomainNormalizers.normalizeTimesheetImportInfo === 'function')
        ? window.DomainNormalizers.normalizeTimesheetImportInfo(invoice.timesheetImport || null, invoice.lines || [])
        : (invoice.timesheetImport || null))
    });
  }


  function normalizeSourceCustomerDDT(source) {
    const src = source && typeof source === 'object' ? source : null;
    if (!src) return null;
    const docs = Array.isArray(src.documents) ? src.documents : [];
    const ids = Array.isArray(src.ids) ? src.ids.map(String).filter(Boolean) : docs.map(function (d) { return String(d && d.id || ''); }).filter(Boolean);
    const numbers = Array.isArray(src.numbers) ? src.numbers.map(String).filter(Boolean) : docs.map(function (d) { return String(d && d.number || ''); }).filter(Boolean);
    if (!ids.length && !docs.length) return null;
    return {
      type: String(src.type || '').trim() || (ids.length > 1 ? 'customer_ddt_summary' : 'customer_ddt'),
      ids: ids,
      numbers: numbers,
      dates: Array.isArray(src.dates) ? src.dates.map(String).filter(Boolean) : docs.map(function (d) { return String(d && d.date || ''); }).filter(Boolean),
      documents: docs.length ? docs.map(function (d) {
        return { type: 'customer_ddt', id: String(d && d.id || ''), number: String(d && d.number || ''), date: String(d && d.date || ''), customerId: String(d && d.customerId || '') };
      }) : ids.map(function (id, idx) { return { type: 'customer_ddt', id: id, number: numbers[idx] || '', date: '', customerId: '' }; }),
      summaryOptions: src.summaryOptions || null,
      summaryNote: String(src.summaryNote || '')
    };
  }

  function buildInvoicePayload(formState) {
    const state = formState || {};
    const type = state.type || 'Fattura';
    const paymentInfo = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeInvoicePaymentInfo === 'function')
      ? window.DomainNormalizers.normalizeInvoicePaymentInfo(state, getCompanyInfo())
      : { modalitaPagamento: state.modalitaPagamento || 'Bonifico Bancario', isBonifico: (state.modalitaPagamento || 'Bonifico Bancario') === 'Bonifico Bancario', bankChoice: String(state.bankChoice || '1') };
    const creditInfo = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCreditNoteInfo === 'function')
      ? window.DomainNormalizers.normalizeCreditNoteInfo(state)
      : state;
    const timesheetImport = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeTimesheetImportInfo === 'function')
      ? window.DomainNormalizers.normalizeTimesheetImportInfo(state.timesheetImport || null, state.lines || [])
      : (state.timesheetImport || null);
    const previousInvoice = state.previousInvoice || null;
    const sourceCustomerDDT = normalizeSourceCustomerDDT(state.sourceCustomerDDT || (previousInvoice && previousInvoice.sourceCustomerDDT) || null);
    const paymentMethod = paymentInfo.modalitaPagamento || 'Bonifico Bancario';
    const isBonifico = !!paymentInfo.isBonifico;
    const customer = state.customer || {};
    const calcs = state.calcs || {};
    const bolloAcaricoEmittente = (typeof window.resolveBolloAcaricoEmittente === 'function')
      ? window.resolveBolloAcaricoEmittente(previousInvoice, customer)
      : false;

    const totalsInfo = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeInvoiceTotalsInfo === 'function')
      ? window.DomainNormalizers.normalizeInvoiceTotalsInfo(previousInvoice || state, customer, calcs)
      : {
        totalePrestazioni: calcs.totPrest,
        importoBollo: calcs.impBollo,
        bolloAcaricoEmittente: bolloAcaricoEmittente,
        rivalsa: { importo: calcs.riv },
        totaleImponibile: calcs.totImp,
        total: calcs.totDoc,
        ivaTotale: calcs.ivaTot,
        ritenutaAcconto: calcs.ritenuta,
        nettoDaPagare: calcs.nettoDaPagare
      };

    const data = {
      number: state.number,
      date: state.date,
      customerId: state.customerId,
      type: type,
      lines: state.lines || [],
      totalePrestazioni: totalsInfo.totalePrestazioni,
      importoBollo: totalsInfo.importoBollo,
      bolloAcaricoEmittente: totalsInfo.bolloAcaricoEmittente,
      rivalsa: totalsInfo.rivalsa,
      totaleImponibile: totalsInfo.totaleImponibile,
      total: totalsInfo.total,
      ivaTotale: totalsInfo.ivaTotale,
      ritenutaAcconto: totalsInfo.ritenutaAcconto,
      nettoDaPagare: totalsInfo.nettoDaPagare,
      status: type === 'Fattura' ? 'Da Incassare' : 'Emessa',
      dataScadenza: state.dataScadenza,
      dataRiferimento: state.dataRiferimento,
      giorniTermini: isBonifico ? (parseInt(state.giorniTermini, 10) || 0) : null,
      bankChoice: isBonifico ? (paymentInfo.bankChoice || '1') : null,
      companyBankId: isBonifico ? (paymentInfo.companyBankId || state.companyBankId || null) : null,
      bancaSelezionata: isBonifico ? (paymentInfo.bancaSelezionata || null) : null,
      ibanSelezionato: isBonifico ? (paymentInfo.ibanSelezionato || null) : null,
      fineMese: isBonifico ? !!state.fineMese : null,
      giornoFissoEnabled: isBonifico ? !!state.giornoFissoEnabled : null,
      giornoFissoValue: (isBonifico && state.giornoFissoEnabled) ? (parseInt(state.giornoFissoValue, 10) || null) : null,
      condizioniPagamento: state.condizioniPagamento,
      paymentMethodId: paymentInfo.paymentMethodId || state.paymentMethodId || null,
      paymentMethodCode: paymentInfo.paymentMethodCode || state.paymentMethodCode || null,
      modalitaPagamentoFE: paymentInfo.modalitaPagamentoFE || paymentInfo.paymentMethodCode || null,
      modalitaPagamento: paymentMethod,
      linkedInvoice: creditInfo.linkedInvoice,
      linkedInvoiceDate: creditInfo.linkedInvoiceDate || null,
      reason: creditInfo.reason,
      timesheetImport: timesheetImport,
      attachTimesheetPdf: !!state.attachTimesheetPdf,
      attachTimesheetNotes: !!state.attachTimesheetNotes,
      sourceCustomerDDT: sourceCustomerDDT,
      sourceDocuments: sourceCustomerDDT ? sourceCustomerDDT.documents : [],
      sourceCustomerDDTIds: sourceCustomerDDT ? sourceCustomerDDT.ids : [],
      sourceCustomerDDTNumbers: sourceCustomerDDT ? sourceCustomerDDT.numbers : [],
      isDraft: !!state.isDraft
    };

    const oldWasDraft = !!(previousInvoice && (previousInvoice.isDraft === true || String(previousInvoice.status || '') === 'Bozza'));
    if (data.isDraft) {
      data.status = 'Bozza';
      data.sentToAgenzia = false;
    } else if (oldWasDraft) {
      data.status = (type === 'Fattura') ? 'Da Incassare' : 'Emessa';
      data.sentToAgenzia = false;
    } else if (previousInvoice) {
      data.status = previousInvoice.status;
      if (previousInvoice.sentToAgenzia != null) data.sentToAgenzia = previousInvoice.sentToAgenzia;
    }

    return data;
  }

  window.InvoiceService.getCompanyInfo = getCompanyInfo;
  window.InvoiceService.getInvoiceById = getInvoiceById;
  window.InvoiceService.getCustomerById = getCustomerById;
  window.InvoiceService.getInvoiceContextById = getInvoiceContextById;
  window.InvoiceService.calculateTotalsForInvoice = calculateTotalsForInvoice;
  window.InvoiceService.createNewDocumentState = createNewDocumentState;
  window.InvoiceService.createEditingState = createEditingState;
  window.InvoiceService.buildInvoicePayload = buildInvoicePayload;
})();
