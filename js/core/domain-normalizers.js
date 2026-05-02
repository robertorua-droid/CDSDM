(function () {
  function pickFirst() {
    for (let i = 0; i < arguments.length; i++) {
      const v = arguments[i];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return '';
  }



  function numField() {
    for (let i = 0; i < arguments.length; i++) {
      const v = arguments[i];
      if (v === '' || v === null || v === undefined) continue;
      const n = parseFloat(String(v).replace(',', '.'));
      if (!isNaN(n)) return n;
    }
    return 0;
  }

  function normalizeCompanyInfo(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const normalized = Object.assign({}, src);

    const address = pickFirst(src.address, src.indirizzo, src.street);
    const zip = pickFirst(src.zip, src.cap, src.postalCode);
    const comune = pickFirst(src.comune, src.city, src.town);
    const province = pickFirst(src.province, src.provincia, src.siglaProvincia);
    const country = pickFirst(src.country, src.nazione, src.nation, 'IT');
    const banca1 = pickFirst(src.banca1, src.banca);
    const iban1 = pickFirst(src.iban1, src.iban);
    const banca2 = pickFirst(src.banca2);
    const iban2 = pickFirst(src.iban2);

    normalized.address = address;
    normalized.indirizzo = pickFirst(src.indirizzo, address);
    normalized.street = pickFirst(src.street, address);

    normalized.zip = zip;
    normalized.cap = pickFirst(src.cap, zip);
    normalized.postalCode = pickFirst(src.postalCode, zip);

    normalized.comune = comune;
    normalized.city = pickFirst(src.city, comune);
    normalized.town = pickFirst(src.town, comune);

    normalized.province = province;
    normalized.provincia = pickFirst(src.provincia, province);
    normalized.siglaProvincia = pickFirst(src.siglaProvincia, province);

    normalized.country = country;
    normalized.nazione = pickFirst(src.nazione, country);
    normalized.nation = pickFirst(src.nation, country);

    normalized.banca1 = banca1;
    normalized.banca = pickFirst(src.banca, banca1);
    normalized.iban1 = iban1;
    normalized.iban = pickFirst(src.iban, iban1);
    normalized.banca2 = banca2;
    normalized.iban2 = iban2;

    if (window.TaxRegimePolicy && typeof window.TaxRegimePolicy.resolve === 'function') {
      const regime = window.TaxRegimePolicy.resolve(src);
      if (regime) normalized.taxRegime = regime;
    }

    return normalized;
  }

  function normalizeCustomerInfo(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const normalized = Object.assign({}, src);

    const nome = pickFirst(src.nome, src.firstName);
    const cognome = pickFirst(src.cognome, src.lastName);
    const denominazione = pickFirst(src.name, src.ragioneSociale, [nome, cognome].filter(Boolean).join(' ').trim());
    const address = pickFirst(src.address, src.indirizzo, src.street);
    const cap = pickFirst(src.cap, src.zip, src.postalCode);
    const comune = pickFirst(src.comune, src.city, src.town);
    const provincia = pickFirst(src.provincia, src.province, src.siglaProvincia);
    const nazione = pickFirst(src.nazione, src.country, src.nation, 'IT');
    const piva = pickFirst(src.piva, src.partitaIva, src.vatNumber);
    const codiceFiscale = pickFirst(src.codiceFiscale, src.cf, src.taxCode);

    normalized.nome = nome;
    normalized.firstName = pickFirst(src.firstName, nome);
    normalized.cognome = cognome;
    normalized.lastName = pickFirst(src.lastName, cognome);

    normalized.name = denominazione;
    normalized.ragioneSociale = pickFirst(src.ragioneSociale, denominazione);

    normalized.address = address;
    normalized.indirizzo = pickFirst(src.indirizzo, address);
    normalized.street = pickFirst(src.street, address);

    normalized.cap = cap;
    normalized.zip = pickFirst(src.zip, cap);
    normalized.postalCode = pickFirst(src.postalCode, cap);

    normalized.comune = comune;
    normalized.city = pickFirst(src.city, comune);
    normalized.town = pickFirst(src.town, comune);

    normalized.provincia = provincia;
    normalized.province = pickFirst(src.province, provincia);
    normalized.siglaProvincia = pickFirst(src.siglaProvincia, provincia);

    normalized.nazione = nazione;
    normalized.country = pickFirst(src.country, nazione);
    normalized.nation = pickFirst(src.nation, nazione);

    normalized.piva = piva;
    normalized.partitaIva = pickFirst(src.partitaIva, piva);
    normalized.vatNumber = pickFirst(src.vatNumber, piva);

    normalized.codiceFiscale = codiceFiscale;
    normalized.cf = pickFirst(src.cf, codiceFiscale);
    normalized.taxCode = pickFirst(src.taxCode, codiceFiscale);

    return normalized;
  }


  function normalizeCreditNoteInfo(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const normalized = Object.assign({}, src);

    const typeRaw = pickFirst(src.type, src.documentType, src.tipoDocumento, 'Fattura');
    const linkedInvoice = pickFirst(
      src.linkedInvoice,
      src.linkedDocument,
      src.linkedInvoiceNumber,
      src.relatedInvoice,
      src.relatedInvoiceNumber,
      src.invoiceReference,
      src.linkedDocumentNumber
    );
    const linkedInvoiceDate = pickFirst(
      src.linkedInvoiceDate,
      src.linkedDocumentDate,
      src.relatedInvoiceDate,
      src.invoiceReferenceDate,
      src.documentReferenceDate
    );
    const reason = pickFirst(src.reason, src.causale, src.noteReason, src.creditNoteReason, src.description);
    const typeNorm = String(typeRaw || '').trim().toLowerCase().includes('nota') ? 'Nota di Credito' : typeRaw;

    normalized.type = typeNorm || 'Fattura';
    normalized.documentType = pickFirst(src.documentType, normalized.type);
    normalized.tipoDocumento = pickFirst(src.tipoDocumento, normalized.type);
    normalized.linkedInvoice = linkedInvoice;
    normalized.linkedDocument = pickFirst(src.linkedDocument, linkedInvoice);
    normalized.linkedInvoiceNumber = pickFirst(src.linkedInvoiceNumber, linkedInvoice);
    normalized.relatedInvoice = pickFirst(src.relatedInvoice, linkedInvoice);
    normalized.relatedInvoiceNumber = pickFirst(src.relatedInvoiceNumber, linkedInvoice);
    normalized.invoiceReference = pickFirst(src.invoiceReference, linkedInvoice);
    normalized.linkedInvoiceDate = linkedInvoiceDate;
    normalized.linkedDocumentDate = pickFirst(src.linkedDocumentDate, linkedInvoiceDate);
    normalized.relatedInvoiceDate = pickFirst(src.relatedInvoiceDate, linkedInvoiceDate);
    normalized.invoiceReferenceDate = pickFirst(src.invoiceReferenceDate, linkedInvoiceDate);
    normalized.reason = reason;
    normalized.causale = pickFirst(src.causale, reason);
    normalized.noteReason = pickFirst(src.noteReason, reason);
    normalized.creditNoteReason = pickFirst(src.creditNoteReason, reason);

    return normalized;
  }

  function normalizeInvoicePaymentInfo(rawInvoice, rawCompany) {
    const invoice = rawInvoice && typeof rawInvoice === 'object' ? rawInvoice : {};
    const company = normalizeCompanyInfo(rawCompany && typeof rawCompany === 'object' ? rawCompany : {});
    const normalized = Object.assign({}, invoice);

    const method = (window.PaymentMethodCatalog && typeof window.PaymentMethodCatalog.resolve === 'function')
      ? window.PaymentMethodCatalog.resolve(invoice, 'mp05_bonifico')
      : null;
    const modalitaPagamento = method ? method.label : pickFirst(invoice.modalitaPagamento, invoice.paymentMethod, 'Bonifico Bancario');
    const paymentMethodId = method ? method.id : pickFirst(invoice.paymentMethodId, 'mp05_bonifico');
    const paymentMethodCode = method ? method.code : pickFirst(invoice.paymentMethodCode, invoice.modalitaPagamentoFE, 'MP05');
    const isBonifico = method ? method.macroArea === 'bonifico' || method.requiresBank === true : String(modalitaPagamento).toLowerCase().includes('bonifico');

    let bankChoice = String(pickFirst(invoice.bankChoice, invoice.bank, '1')).trim();
    bankChoice = bankChoice === '2' ? '2' : '1';

    let companyBank = null;
    if (window.CompanyBankCatalog && typeof window.CompanyBankCatalog.resolve === 'function') {
      companyBank = window.CompanyBankCatalog.resolve(invoice.companyBankId || invoice.companyBank || '');
    }

    const banca1 = pickFirst(company.banca1, company.banca);
    const iban1 = pickFirst(company.iban1, company.iban);
    const banca2 = pickFirst(company.banca2);
    const iban2 = pickFirst(company.iban2);
    const hasBank2 = !!pickFirst(banca2, iban2);

    const bankChoiceRequested = isBonifico ? bankChoice : '1';
    const bankChoiceEffective = bankChoiceRequested === '2' && hasBank2 ? '2' : '1';
    const legacyBanca = bankChoiceEffective === '2' ? banca2 : banca1;
    const legacyIban = bankChoiceEffective === '2' ? iban2 : iban1;

    const bancaSelezionata = companyBank ? (companyBank.bankName || companyBank.accountLabel || '') : legacyBanca;
    const ibanSelezionato = companyBank ? (companyBank.iban || '') : legacyIban;

    normalized.paymentMethodId = paymentMethodId;
    normalized.paymentMethodCode = paymentMethodCode;
    normalized.modalitaPagamentoFE = paymentMethodCode;
    normalized.modalitaPagamento = modalitaPagamento;
    normalized.paymentMethod = pickFirst(invoice.paymentMethod, modalitaPagamento);
    normalized.isBonifico = isBonifico;
    normalized.bankChoice = bankChoiceRequested;
    normalized.bankChoiceRequested = bankChoiceRequested;
    normalized.bankChoiceEffective = bankChoiceEffective;
    normalized.companyBankId = companyBank ? companyBank.id : pickFirst(invoice.companyBankId, '');
    normalized.companyBankLabel = companyBank ? (companyBank.accountLabel || companyBank.label || '') : '';
    normalized.hasBank2 = hasBank2;
    normalized.bancaSelezionata = bancaSelezionata;
    normalized.ibanSelezionato = ibanSelezionato;
    normalized.selectedBankName = bancaSelezionata;
    normalized.selectedIban = ibanSelezionato;

    return normalized;
  }


  function normalizeTimesheetImportInfo(rawState, rawLines) {
    const src = rawState && typeof rawState === 'object' ? rawState : {};
    const lines = Array.isArray(rawLines) ? rawLines : [];
    const normalized = Object.assign({}, src);

    const lineIds = [];
    lines.forEach(function (line) {
      if (!line || line.tsImport !== true) return;
      const ids = line.tsWorklogIds || (line.tsMeta && line.tsMeta.worklogIds);
      if (Array.isArray(ids)) ids.forEach(function (id) { if (String(id || '').trim()) lineIds.push(String(id).trim()); });
      else if (typeof ids === 'string' && ids) ids.split(',').forEach(function (id) { if (String(id || '').trim()) lineIds.push(String(id).trim()); });
    });

    const stateIds = [];
    const srcIds = src.worklogIds || src.importedWorklogIds || src.ids || [];
    if (Array.isArray(srcIds)) srcIds.forEach(function (id) { if (String(id || '').trim()) stateIds.push(String(id).trim()); });
    else if (typeof srcIds === 'string' && srcIds) srcIds.split(',').forEach(function (id) { if (String(id || '').trim()) stateIds.push(String(id).trim()); });

    const groupsSrc = Array.isArray(src.groups) ? src.groups : (Array.isArray(src.items) ? src.items : []);
    const groups = groupsSrc.map(function (g) {
      const group = g && typeof g === 'object' ? g : {};
      const groupIdsRaw = group.worklogIds || group.ids || [];
      const groupIds = [];
      if (Array.isArray(groupIdsRaw)) groupIdsRaw.forEach(function (id) { if (String(id || '').trim()) groupIds.push(String(id).trim()); });
      else if (typeof groupIdsRaw === 'string' && groupIdsRaw) groupIdsRaw.split(',').forEach(function (id) { if (String(id || '').trim()) groupIds.push(String(id).trim()); });
      return Object.assign({}, group, {
        key: pickFirst(group.key, group.groupKey, [pickFirst(group.projectId, group.progettoId), pickFirst(group.periodLabel, group.periodo)].filter(Boolean).join('__')),
        commessaId: pickFirst(group.commessaId, group.jobId),
        projectId: pickFirst(group.projectId, group.progettoId),
        periodLabel: pickFirst(group.periodLabel, group.periodo),
        minutes: parseInt(group.minutes, 10) || 0,
        hours: parseFloat(group.hours) || 0,
        productId: pickFirst(group.productId, group.serviceId, group.prodottoId),
        rate: parseFloat(group.rate) || 0,
        amount: parseFloat(group.amount) || 0,
        tipo: pickFirst(group.tipo, group.type),
        worklogIds: Array.from(new Set(groupIds))
      });
    });

    const allIds = Array.from(new Set([].concat(stateIds, lineIds, groups.reduce(function (acc, g) { return acc.concat(g.worklogIds || []); }, [])).map(String).filter(Boolean)));
    const batchId = pickFirst(src.batchId, src.tsImportBatchId, src.importBatchId);
    const importedAt = pickFirst(src.importedAt, src.createdAt, src.updatedAt);

    normalized.batchId = batchId;
    normalized.tsImportBatchId = pickFirst(src.tsImportBatchId, batchId);
    normalized.importBatchId = pickFirst(src.importBatchId, batchId);
    normalized.importedAt = importedAt;
    normalized.worklogIds = allIds;
    normalized.importedWorklogIds = pickFirst(src.importedWorklogIds, allIds.join(',')) ? allIds : allIds;
    normalized.groups = groups;
    normalized.items = Array.isArray(src.items) ? groups : groups;
    normalized.hasImportedLines = allIds.length > 0 || lines.some(function (line) { return !!(line && line.tsImport === true); });
    normalized.importedLineCount = lines.filter(function (line) { return !!(line && line.tsImport === true); }).length;

    return normalized.hasImportedLines || groups.length || allIds.length ? normalized : null;
  }


  function normalizePurchaseInfo(rawPurchase) {
    const src = rawPurchase && typeof rawPurchase === 'object' ? rawPurchase : {};
    const normalized = Object.assign({}, src);

    const supplierId = pickFirst(src.supplierId, src.fornitoreId, src.vendorId, src.supplierID);
    const number = pickFirst(src.number, src.numero, src.documentNumber, src.docNumber);
    const date = pickFirst(src.date, src.data, src.documentDate);
    const dataRiferimento = pickFirst(src.dataRiferimento, src.refDate, src.referenceDate, date);
    const giorniTermini = parseInt(pickFirst(src.giorniTermini, src.paymentDays, src.termsDays, src.paymentTermsDays, 0), 10) || 0;
    const dataScadenza = pickFirst(src.dataScadenza, src.dueDate, src.scadenza);
    const statusRaw = pickFirst(src.status, src.stato, 'Da Pagare');
    const statusKey = String(statusRaw || '').trim().toLowerCase();
    const status = statusKey === 'pagata' ? 'Pagata' : 'Da Pagare';
    const notes = pickFirst(src.notes, src.note, src.description);

    const sf = (typeof window.safeFloat === 'function')
      ? window.safeFloat
      : function (v) {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
      };

    const rawLines = Array.isArray(src.lines) ? src.lines : (Array.isArray(src.righe) ? src.righe : []);
    const lines = rawLines.map(function (line) {
      const l = line && typeof line === 'object' ? line : {};
      const qty = sf(pickFirst(l.qty, l.quantity, l.qta, 0));
      const price = sf(pickFirst(l.price, l.unitPrice, l.prezzoUnitario, 0));
      const iva = String(pickFirst(l.iva, l.ivaPerc, l.vatRate, l.aliquotaIVA, '0'));
      const natura = pickFirst(l.natura, l.vatNature, l.naturaIva, l.esenzioneIva);
      const subtotal = sf(l.subtotal != null ? l.subtotal : qty * price);
      return Object.assign({}, l, {
        description: pickFirst(l.description, l.descrizione, l.label),
        descrizione: pickFirst(l.descrizione, l.description, l.label),
        qty: qty,
        quantity: qty,
        qta: qty,
        price: price,
        unitPrice: price,
        prezzoUnitario: price,
        iva: iva,
        ivaPerc: pickFirst(l.ivaPerc, iva),
        vatRate: pickFirst(l.vatRate, iva),
        natura: natura,
        vatNature: pickFirst(l.vatNature, natura),
        subtotal: subtotal
      });
    });

    const imponibile = sf(pickFirst(src.imponibile, src.imponibileTotale, src.subtotal, src.linesSubtotal));
    const ivaTotale = sf(pickFirst(src.ivaTotale, src.ivaTot, src.vatTotal, src.taxTotal));
    const totaleDocumento = sf(pickFirst(src.totaleDocumento, src.total, src.totale, src.documentTotal));
    const calcImponibile = lines.reduce(function (acc, l) { return acc + sf(l.subtotal); }, 0);
    const calcIvaTotale = lines.reduce(function (acc, l) { return acc + (sf(l.subtotal) * (sf(l.iva) / 100)); }, 0);
    const effectiveImponibile = imponibile || calcImponibile;
    const effectiveIvaTotale = ivaTotale || calcIvaTotale;
    const effectiveTotaleDocumento = totaleDocumento || (effectiveImponibile + effectiveIvaTotale);

    normalized.supplierId = supplierId;
    normalized.fornitoreId = pickFirst(src.fornitoreId, supplierId);
    normalized.vendorId = pickFirst(src.vendorId, supplierId);
    normalized.number = number;
    normalized.numero = pickFirst(src.numero, number);
    normalized.documentNumber = pickFirst(src.documentNumber, number);
    normalized.date = date;
    normalized.data = pickFirst(src.data, date);
    normalized.documentDate = pickFirst(src.documentDate, date);
    normalized.dataRiferimento = dataRiferimento;
    normalized.refDate = pickFirst(src.refDate, dataRiferimento);
    normalized.referenceDate = pickFirst(src.referenceDate, dataRiferimento);
    normalized.giorniTermini = giorniTermini;
    normalized.paymentDays = parseInt(pickFirst(src.paymentDays, giorniTermini), 10) || giorniTermini;
    normalized.termsDays = parseInt(pickFirst(src.termsDays, giorniTermini), 10) || giorniTermini;
    normalized.dataScadenza = dataScadenza;
    normalized.dueDate = pickFirst(src.dueDate, dataScadenza);
    normalized.scadenza = pickFirst(src.scadenza, dataScadenza);
    normalized.status = status;
    normalized.stato = pickFirst(src.stato, status);
    normalized.notes = notes;
    normalized.note = pickFirst(src.note, notes);
    normalized.lines = lines;
    normalized.righe = lines;
    normalized.imponibile = effectiveImponibile;
    normalized.imponibileTotale = pickFirst(src.imponibileTotale, effectiveImponibile);
    normalized.ivaTotale = effectiveIvaTotale;
    normalized.ivaTot = pickFirst(src.ivaTot, effectiveIvaTotale);
    normalized.vatTotal = pickFirst(src.vatTotal, effectiveIvaTotale);
    normalized.totaleDocumento = effectiveTotaleDocumento;
    normalized.total = pickFirst(src.total, effectiveTotaleDocumento);
    normalized.totale = pickFirst(src.totale, effectiveTotaleDocumento);
    normalized.documentTotal = pickFirst(src.documentTotal, effectiveTotaleDocumento);

    return normalized;
  }



  function normalizeInvoiceStatusInfo(rawInvoice) {
    const src = rawInvoice && typeof rawInvoice === 'object' ? rawInvoice : {};
    const normalized = Object.assign({}, src);

    const typeRaw = pickFirst(src.type, src.documentType, src.tipoDocumento, 'Fattura');
    const typeNorm = String(typeRaw || '').trim().toLowerCase().includes('nota') ? 'Nota di Credito' : typeRaw;
    const statusRaw = pickFirst(src.status, src.stato, src.documentStatus, src.paymentStatus, src.isPaid === true ? 'Pagata' : (src.isDraft === true ? 'Bozza' : 'Emessa'));
    const statusKey = String(statusRaw || '').trim().toLowerCase();

    let status = 'Emessa';
    if (['bozza', 'draft'].includes(statusKey)) status = 'Bozza';
    else if (['pagata', 'pagato', 'paid'].includes(statusKey)) status = 'Pagata';
    else if (['inviata', 'inviato', 'sent'].includes(statusKey)) status = 'Inviata';
    else if (['da incassare', 'non pagata', 'open'].includes(statusKey)) status = 'Emessa';

    const sentToAgenzia = src.sentToAgenzia === true || String(src.sentToAgenzia).toLowerCase() === 'true' || status === 'Inviata';
    const isDraft = src.isDraft === true || String(src.isDraft).toLowerCase() === 'true' || status === 'Bozza';

    normalized.type = typeNorm || 'Fattura';
    normalized.documentType = pickFirst(src.documentType, normalized.type);
    normalized.tipoDocumento = pickFirst(src.tipoDocumento, normalized.type);
    normalized.status = isDraft ? 'Bozza' : (status === 'Inviata' ? 'Emessa' : status);
    normalized.stato = pickFirst(src.stato, normalized.status);
    normalized.documentStatus = pickFirst(src.documentStatus, normalized.status);
    normalized.sentToAgenzia = sentToAgenzia;
    normalized.isDraft = isDraft;
    normalized.isPaid = normalized.status === 'Pagata';
    normalized.isCreditNote = normalized.type === 'Nota di Credito';
    normalized.exportStatus = isDraft ? 'Bozza' : (sentToAgenzia ? 'Inviata' : normalized.status);
    normalized.paymentDate = pickFirst(src.paymentDate, src.dataPagamento, src.paidAt);
    normalized.issueDate = pickFirst(src.issueDate, src.dataInvio, src.sentAt);

    return normalized;
  }

  function normalizeInvoiceTotalsInfo(rawInvoice, rawCustomer, rawCalc) {
    const invoice = rawInvoice && typeof rawInvoice === 'object' ? rawInvoice : {};
    const customer = rawCustomer && typeof rawCustomer === 'object' ? rawCustomer : {};
    const calc = rawCalc && typeof rawCalc === 'object' ? rawCalc : {};
    const normalized = Object.assign({}, invoice);

    const sf = (typeof window.safeFloat === 'function')
      ? window.safeFloat
      : function (v) {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
      };

    const bolloAcaricoEmittente = (typeof window.resolveBolloAcaricoEmittente === 'function')
      ? !!window.resolveBolloAcaricoEmittente(invoice, customer)
      : !!invoice.bolloAcaricoEmittente;

    const totPrest = sf(calc.totPrest != null ? calc.totPrest : invoice.totalePrestazioni);
    const riv = sf(calc.riv != null ? calc.riv : ((invoice.rivalsa && invoice.rivalsa.importo) != null ? invoice.rivalsa.importo : invoice.rivalsaImporto));
    const impBollo = sf(calc.impBollo != null ? calc.impBollo : invoice.importoBollo);
    const totImp = sf(calc.totImp != null ? calc.totImp : invoice.totaleImponibile);
    const ivaTot = sf(calc.ivaTot != null ? calc.ivaTot : invoice.ivaTotale);
    const ritenuta = sf(calc.ritenuta != null ? calc.ritenuta : invoice.ritenutaAcconto);
    const totDoc = sf(calc.totDoc != null ? calc.totDoc : invoice.total);
    const nettoDaPagare = sf(calc.nettoDaPagare != null ? calc.nettoDaPagare : invoice.nettoDaPagare);

    normalized.totalePrestazioni = totPrest;
    normalized.rivalsa = Object.assign({}, invoice.rivalsa || {}, { importo: riv });
    normalized.rivalsaImporto = riv;
    normalized.importoBollo = impBollo;
    normalized.totaleImponibile = totImp;
    normalized.ivaTotale = ivaTot;
    normalized.ritenutaAcconto = ritenuta;
    normalized.total = totDoc;
    normalized.nettoDaPagare = nettoDaPagare;
    normalized.bolloAcaricoEmittente = bolloAcaricoEmittente;
    normalized.bolloIncludedInTotale = calc.bolloIncludedInTotale != null
      ? !!calc.bolloIncludedInTotale
      : !bolloAcaricoEmittente;
    normalized.hasRivalsa = riv > 0;
    normalized.hasBollo = impBollo > 0;
    normalized.hasIva = ivaTot > 0;
    normalized.hasRitenuta = ritenuta > 0;
    normalized.vatMap = calc.vatMap || invoice.vatMap || new Map();

    return normalized;
  }


  function normalizeProductInfo(rawProduct) {
    const src = rawProduct && typeof rawProduct === 'object' ? rawProduct : {};
    const normalized = Object.assign({}, src);
    const legacyIsCosto = (src.isCosto === true || src.isCosto === 'true');
    const rawType = String(pickFirst(src.itemType, src.tipoVoce, src.type, legacyIsCosto ? 'cost' : 'service')).trim().toLowerCase();
    let itemType = rawType;
    if (['lavoro', 'servizio', 'service'].includes(rawType)) itemType = 'service';
    else if (['costo', 'cost'].includes(rawType)) itemType = 'cost';
    else if (['prodotto', 'product', 'magazzino'].includes(rawType)) itemType = 'product';
    else itemType = legacyIsCosto ? 'cost' : 'service';

    const vatDefaults = (window.VatRateCatalog && typeof window.VatRateCatalog.getLegacyFields === 'function')
      ? window.VatRateCatalog.getLegacyFields(src, itemType === 'cost' ? 'iva_22' : 'iva_22')
      : { vatRateId: pickFirst(src.vatRateId), iva: String(pickFirst(src.iva, '22')), esenzioneIva: pickFirst(src.esenzioneIva), natureCode: pickFirst(src.natureCode, src.esenzioneIva), vatLabel: '' };

    normalized.description = pickFirst(src.description, src.descrizione, src.name);
    normalized.descrizione = pickFirst(src.descrizione, normalized.description);
    normalized.name = pickFirst(src.name, normalized.description);
    normalized.code = pickFirst(src.code, src.codice, src.sku);
    normalized.codice = pickFirst(src.codice, normalized.code);
    normalized.itemType = itemType;
    normalized.tipoVoce = itemType === 'product' ? 'Prodotto' : (itemType === 'cost' ? 'Costo' : 'Servizio');
    normalized.isCosto = itemType === 'cost';
    normalized.isLavoro = itemType !== 'cost';
    normalized.isInventoryItem = itemType === 'product';
    normalized.vatRateId = vatDefaults.vatRateId || pickFirst(src.vatRateId);
    normalized.iva = vatDefaults.iva;
    normalized.esenzioneIva = vatDefaults.esenzioneIva || '';
    normalized.natureCode = vatDefaults.natureCode || '';
    normalized.vatLabel = vatDefaults.vatLabel || '';

    const rawPurchasePrice = pickFirst(src.purchasePrice, src.prezzoAcquisto, src.costoUnitario, src.unitCost, '');
    const rawSalePrice = pickFirst(src.salePrice, src.prezzoVendita, src.prezzoUnitario, src.unitPrice, '');
    const purchaseNum = parseFloat(String(rawPurchasePrice).replace(',', '.'));
    const saleNum = parseFloat(String(rawSalePrice).replace(',', '.'));
    normalized.purchasePrice = isNaN(purchaseNum) ? '' : purchaseNum;
    normalized.prezzoAcquisto = normalized.purchasePrice;
    normalized.salePrice = isNaN(saleNum) ? '' : saleNum;
    normalized.prezzoVendita = normalized.salePrice;
    normalized.lastPurchasePrice = numField(src.lastPurchasePrice, src.ultimoPrezzoAcquisto, '');
    normalized.lastPurchasePriceSource = pickFirst(src.lastPurchasePriceSource, src.ultimoPrezzoAcquistoFonte, '');
    normalized.lastPurchasePriceSourceLabel = pickFirst(src.lastPurchasePriceSourceLabel, src.ultimoPrezzoAcquistoDocumento, '');
    normalized.lastPurchasePriceDate = pickFirst(src.lastPurchasePriceDate, src.ultimoPrezzoAcquistoData, '');
    normalized.lastSalePrice = numField(src.lastSalePrice, src.ultimoPrezzoVendita, '');
    normalized.lastSalePriceSource = pickFirst(src.lastSalePriceSource, src.ultimoPrezzoVenditaFonte, '');
    normalized.lastSalePriceSourceLabel = pickFirst(src.lastSalePriceSourceLabel, src.ultimoPrezzoVenditaDocumento, '');
    normalized.lastSalePriceDate = pickFirst(src.lastSalePriceDate, src.ultimoPrezzoVenditaData, '');
    normalized.lastPriceUpdateDocumentId = pickFirst(src.lastPriceUpdateDocumentId, src.ultimoAggiornamentoPrezzoDocumentoId, '');
    normalized.lastPriceUpdateDocumentNumber = pickFirst(src.lastPriceUpdateDocumentNumber, src.ultimoAggiornamentoPrezzoDocumento, '');
    normalized.lastPriceUpdateAt = pickFirst(src.lastPriceUpdateAt, src.ultimoAggiornamentoPrezzoData, '');

    normalized.unitOfMeasure = pickFirst(src.unitOfMeasure, src.um, src.unitaMisura, src.uom, itemType === 'product' ? 'pz' : '');
    normalized.um = normalized.unitOfMeasure;
    normalized.stockQty = itemType === 'product' ? numField(src.stockQty, src.giacenzaDisponibile, src.giacenza, src.quantityOnHand, 0) : 0;
    normalized.quarantineQty = itemType === 'product' ? numField(src.quarantineQty, src.giacenzaQuarantena, src.qtyQuarantena, src.quarantine, 0) : 0;
    normalized.reservedQty = itemType === 'product' ? numField(src.reservedQty, src.giacenzaRiservata, src.qtyRiservata, src.reserved, 0) : 0;
    normalized.minStockQty = itemType === 'product' ? numField(src.minStockQty, src.scortaMinima, src.minimumStock, 0) : 0;
    normalized.warehouseLocation = pickFirst(src.warehouseLocation, src.ubicazioneMagazzino, src.location, src.locazione, [src.locCorsia, src.locScaffale, src.locPiano].filter(Boolean).join(' / '));
    normalized.ubicazioneMagazzino = normalized.warehouseLocation;
    const rawTrackingMode = String(pickFirst(src.trackingMode, src.tracciabilita, src.trackingType, 'none')).trim().toLowerCase();
    normalized.trackingMode = ['none', 'lot', 'serial', 'expiry'].includes(rawTrackingMode) ? rawTrackingMode : 'none';
    normalized.tracciabilita = normalized.trackingMode;
    normalized.requiresExpiry = src.requiresExpiry === true || src.requiresExpiry === 'true' || normalized.trackingMode === 'expiry';
    normalized.shelfLifeDays = itemType === 'product' ? numField(src.shelfLifeDays, src.durataGiorni, '') : '';
    normalized.isTracked = itemType === 'product' && normalized.trackingMode !== 'none';
    normalized.availableNetQty = itemType === 'product' ? Math.max(0, normalized.stockQty - normalized.reservedQty) : 0;
    normalized.inventoryValue = itemType === 'product' ? normalized.stockQty * (normalized.purchasePrice || 0) : 0;
    normalized.quarantineValue = itemType === 'product' ? normalized.quarantineQty * (normalized.purchasePrice || 0) : 0;
    normalized.totalInventoryValue = normalized.inventoryValue + normalized.quarantineValue;
    return normalized;
  }


  function normalizeWarehouseLot(rawLot) {
    const src = rawLot && typeof rawLot === 'object' ? rawLot : {};
    const normalized = Object.assign({}, src);
    const rawStatus = String(pickFirst(src.status, src.stato, 'active')).trim().toLowerCase();
    normalized.id = pickFirst(src.id, src.lotId, src.uid);
    normalized.productId = String(pickFirst(src.productId, src.prodottoId, src.itemId, ''));
    normalized.lotCode = pickFirst(src.lotCode, src.lotto, src.batchCode, src.batch, '');
    normalized.serialNumber = pickFirst(src.serialNumber, src.matricola, src.seriale, '');
    normalized.expiryDate = pickFirst(src.expiryDate, src.scadenza, src.dataScadenza, '');
    normalized.qtyAvailable = numField(src.qtyAvailable, src.quantityAvailable, src.disponibile, src.qty, 0);
    normalized.qtyQuarantine = numField(src.qtyQuarantine, src.quarantineQty, src.quarantena, 0);
    normalized.supplierId = String(pickFirst(src.supplierId, src.fornitoreId, ''));
    normalized.sourceDocumentId = pickFirst(src.sourceDocumentId, src.sourceSupplierDDTId, src.documentId, '');
    normalized.sourceDocumentNumber = pickFirst(src.sourceDocumentNumber, src.sourceRef, src.documentNumber, '');
    normalized.status = ['active', 'blocked', 'closed', 'expired'].includes(rawStatus) ? rawStatus : 'active';
    normalized.notes = pickFirst(src.notes, src.note, '');
    normalized.createdAt = pickFirst(src.createdAt, '');
    normalized.updatedAt = pickFirst(src.updatedAt, '');
    return normalized;
  }


  function normalizeQuote(rawQuote) {
    const src = rawQuote && typeof rawQuote === 'object' ? rawQuote : {};
    const normalized = Object.assign({}, src);
    const rawStatus = String(pickFirst(src.status, src.stato, 'draft')).trim().toLowerCase();
    const statusMap = {
      bozza: 'draft', draft: 'draft',
      inviato: 'sent', sent: 'sent',
      accettato: 'accepted', accepted: 'accepted',
      rifiutato: 'rejected', rejected: 'rejected',
      convertito: 'converted', converted: 'converted',
      annullato: 'cancelled', cancelled: 'cancelled'
    };
    normalized.status = statusMap[rawStatus] || 'draft';
    normalized.stato = normalized.status;
    normalized.number = pickFirst(src.number, src.numero, src.quoteNumber, src.numeroPreventivo, '');
    normalized.numero = normalized.number;
    normalized.date = pickFirst(src.date, src.data, new Date().toISOString().slice(0, 10));
    normalized.validUntil = pickFirst(src.validUntil, src.validoFinoAl, src.expiryDate, '');
    normalized.customerId = String(pickFirst(src.customerId, src.clienteId, src.customer && src.customer.id, ''));
    normalized.customerName = pickFirst(src.customerName, src.clienteNome, src.customer && (src.customer.name || src.customer.nome || src.customer.ragioneSociale), '');
    normalized.notes = pickFirst(src.notes, src.note, '');
    normalized.orderId = String(pickFirst(src.orderId, src.ordineId, ''));
    normalized.orderNumber = pickFirst(src.orderNumber, src.numeroOrdine, '');
    normalized.convertedAt = pickFirst(src.convertedAt, src.convertitoIl, '');
    const lines = Array.isArray(src.lines) ? src.lines : (Array.isArray(src.righe) ? src.righe : []);
    normalized.lines = lines.map(function (line) {
      const l = line && typeof line === 'object' ? line : {};
      const qty = numField(l.qty, l.quantity, l.quantita, 0);
      const price = numField(l.price, l.unitPrice, l.salePrice, l.prezzo, 0);
      const productDescription = pickFirst(l.productDescription, l.description, l.descrizione, l.productName, '');
      return Object.assign({}, l, {
        productId: String(pickFirst(l.productId, l.prodottoId, l.itemId, '')),
        productCode: pickFirst(l.productCode, l.code, l.codice, ''),
        productDescription: productDescription,
        description: productDescription,
        unitOfMeasure: pickFirst(l.unitOfMeasure, l.um, 'pz'),
        qty: qty,
        quotedQty: qty,
        price: price,
        salePrice: price,
        lineTotal: qty * price
      });
    });
    normalized.total = normalized.lines.reduce(function (sum, line) { return sum + numField(line.lineTotal, 0); }, 0);
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, '');
    normalized.updatedAt = pickFirst(src.updatedAt, src.updated_at, '');
    return normalized;
  }


  function normalizeCustomerOrder(rawOrder) {
    const src = rawOrder && typeof rawOrder === 'object' ? rawOrder : {};
    const normalized = Object.assign({}, src);
    const rawStatus = String(pickFirst(src.status, src.stato, 'draft')).trim().toLowerCase();
    const statusMap = {
      bozza: 'draft', draft: 'draft',
      confermato: 'confirmed', confirmed: 'confirmed',
      parziale: 'partially_fulfilled', parzialmente_evaso: 'partially_fulfilled', partially_fulfilled: 'partially_fulfilled',
      evaso: 'fulfilled', fulfilled: 'fulfilled',
      annullato: 'cancelled', cancelled: 'cancelled'
    };
    normalized.status = statusMap[rawStatus] || 'draft';
    normalized.stato = normalized.status;
    normalized.number = pickFirst(src.number, src.numero, src.orderNumber, src.numeroOrdine, '');
    normalized.numero = normalized.number;
    normalized.date = pickFirst(src.date, src.data, new Date().toISOString().slice(0, 10));
    normalized.expectedDeliveryDate = pickFirst(src.expectedDeliveryDate, src.dataConsegnaPrevista, src.deliveryDate, '');
    normalized.customerId = String(pickFirst(src.customerId, src.clienteId, src.customer && src.customer.id, ''));
    normalized.customerName = pickFirst(src.customerName, src.clienteNome, src.customer && (src.customer.name || src.customer.nome || src.customer.ragioneSociale), '');
    normalized.notes = pickFirst(src.notes, src.note, '');
    normalized.invoiceId = String(pickFirst(src.invoiceId, src.fatturaId, src.sourceInvoiceLink && src.sourceInvoiceLink.invoiceId, ''));
    normalized.invoiceNumber = pickFirst(src.invoiceNumber, src.numeroFattura, src.sourceInvoiceLink && src.sourceInvoiceLink.invoiceNumber, '');
    normalized.invoicedAt = pickFirst(src.invoicedAt, src.fatturatoIl, src.sourceInvoiceLink && src.sourceInvoiceLink.linkedAt, '');
    normalized.invoiceStatus = pickFirst(src.invoiceStatus, src.statoFatturazione, normalized.invoiceId ? 'invoiced' : '');
    const lines = Array.isArray(src.lines) ? src.lines : (Array.isArray(src.righe) ? src.righe : []);
    normalized.lines = lines.map(function (line) {
      const l = line && typeof line === 'object' ? line : {};
      const qty = numField(l.qty, l.quantity, l.quantita, l.orderedQty, 0);
      const fulfilled = numField(l.fulfilledQty, l.shippedQty, l.evaso, l.quantitaEvasa, 0);
      const price = numField(l.price, l.unitPrice, l.salePrice, l.prezzo, 0);
      const productDescription = pickFirst(l.productDescription, l.description, l.descrizione, l.productName, '');
      return Object.assign({}, l, {
        productId: String(pickFirst(l.productId, l.prodottoId, l.itemId, '')),
        productCode: pickFirst(l.productCode, l.code, l.codice, ''),
        productDescription: productDescription,
        description: productDescription,
        unitOfMeasure: pickFirst(l.unitOfMeasure, l.um, 'pz'),
        qty: qty,
        orderedQty: qty,
        fulfilledQty: fulfilled,
        shippedQty: fulfilled,
        remainingQty: Math.max(0, qty - fulfilled),
        price: price,
        salePrice: price,
        lineTotal: qty * price
      });
    });
    normalized.total = normalized.lines.reduce(function (sum, line) { return sum + numField(line.lineTotal, 0); }, 0);
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, '');
    normalized.updatedAt = pickFirst(src.updatedAt, src.updated_at, '');
    return normalized;
  }


  function normalizeSupplierOrder(rawOrder) {
    const src = rawOrder && typeof rawOrder === 'object' ? rawOrder : {};
    const normalized = Object.assign({}, src);
    const rawStatus = String(pickFirst(src.status, src.stato, 'draft')).trim().toLowerCase();
    const statusMap = {
      bozza: 'draft', draft: 'draft',
      confermato: 'confirmed', confirmed: 'confirmed',
      parziale: 'partially_received', parzialmente_ricevuto: 'partially_received', partially_received: 'partially_received',
      ricevuto: 'received', received: 'received',
      annullato: 'cancelled', cancelled: 'cancelled'
    };
    normalized.status = statusMap[rawStatus] || 'draft';
    normalized.stato = normalized.status;
    normalized.number = pickFirst(src.number, src.numero, src.orderNumber, src.numeroOrdine, '');
    normalized.numero = normalized.number;
    normalized.date = pickFirst(src.date, src.data, new Date().toISOString().slice(0, 10));
    normalized.expectedDeliveryDate = pickFirst(src.expectedDeliveryDate, src.dataConsegnaPrevista, src.deliveryDate, '');
    normalized.supplierId = String(pickFirst(src.supplierId, src.fornitoreId, src.supplier && src.supplier.id, ''));
    normalized.supplierName = pickFirst(src.supplierName, src.fornitoreNome, src.supplier && (src.supplier.name || src.supplier.nome || src.supplier.ragioneSociale), '');
    normalized.notes = pickFirst(src.notes, src.note, '');
    const lines = Array.isArray(src.lines) ? src.lines : (Array.isArray(src.righe) ? src.righe : []);
    normalized.lines = lines.map(function (line) {
      const l = line && typeof line === 'object' ? line : {};
      const qty = numField(l.qty, l.quantity, l.quantita, l.orderedQty, 0);
      const received = numField(l.receivedQty, l.ricevuto, l.quantitaRicevuta, 0);
      const accepted = numField(l.acceptedQty, l.accettato, l.quantitaAccettata, 0);
      const quarantine = numField(l.quarantineQty, l.riservaQty, l.quantitaQuarantena, l.quantitaRiserva, 0);
      const rejected = numField(l.rejectedQty, l.respinto, l.quantitaRespinta, 0);
      const price = numField(l.price, l.unitPrice, l.purchasePrice, l.unitCost, l.prezzo, 0);
      const productDescription = pickFirst(l.productDescription, l.description, l.descrizione, l.productName, '');
      return Object.assign({}, l, {
        productId: String(pickFirst(l.productId, l.prodottoId, l.itemId, '')),
        productCode: pickFirst(l.productCode, l.code, l.codice, ''),
        productDescription: productDescription,
        description: productDescription,
        unitOfMeasure: pickFirst(l.unitOfMeasure, l.um, 'pz'),
        qty: qty,
        orderedQty: qty,
        receivedQty: received,
        acceptedQty: accepted,
        quarantineQty: quarantine,
        rejectedQty: rejected,
        remainingQty: Math.max(0, qty - received),
        price: price,
        purchasePrice: price,
        unitCost: price,
        lineTotal: qty * price
      });
    });
    normalized.total = normalized.lines.reduce(function (sum, line) { return sum + numField(line.lineTotal, 0); }, 0);
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, '');
    normalized.updatedAt = pickFirst(src.updatedAt, src.updated_at, '');
    return normalized;
  }


  function normalizeSupplierDDT(rawDDT) {
    const src = rawDDT && typeof rawDDT === 'object' ? rawDDT : {};
    const normalized = Object.assign({}, src);
    const rawStatus = String(pickFirst(src.status, src.stato, 'draft')).trim().toLowerCase();
    const statusMap = {
      bozza: 'draft', draft: 'draft',
      ricevuto: 'received', received: 'received',
      ricevuto_con_riserva: 'received_with_reserve', riserva: 'received_with_reserve', received_with_reserve: 'received_with_reserve',
      parzialmente_respinto: 'partially_rejected', partially_rejected: 'partially_rejected',
      respinto: 'rejected', rejected: 'rejected',
      reso_fornitore: 'return_supplier', return_supplier: 'return_supplier',
      annullato: 'cancelled', cancelled: 'cancelled'
    };
    normalized.status = statusMap[rawStatus] || 'draft';
    normalized.stato = normalized.status;
    normalized.number = pickFirst(src.number, src.numero, src.ddtNumber, src.numeroDDT, '');
    normalized.numero = normalized.number;
    normalized.ddtDirection = pickFirst(src.ddtDirection, src.direction, src.tipoDDT, 'received_supplier');
    normalized.direction = normalized.ddtDirection;
    normalized.supplierDocumentNumber = pickFirst(src.supplierDocumentNumber, src.numeroDocumentoFornitore, src.numeroDocumento, '');
    normalized.date = pickFirst(src.date, src.data, new Date().toISOString().slice(0, 10));
    normalized.supplierId = String(pickFirst(src.supplierId, src.fornitoreId, src.supplier && src.supplier.id, ''));
    normalized.supplierName = pickFirst(src.supplierName, src.fornitoreNome, src.supplier && (src.supplier.name || src.supplier.nome || src.supplier.ragioneSociale), '');
    const supplierSourceType = pickFirst(src.sourceType, src.tipoOrigine, src.originType, 'direct');
    normalized.sourceType = supplierSourceType === 'supplier_orders' ? 'supplier_orders' : (supplierSourceType === 'supplier_order' || supplierSourceType === 'quarantine_return' ? supplierSourceType : 'direct');
    normalized.sourceOrderId = String(pickFirst(src.sourceOrderId, src.ordineFornitoreId, src.orderId, ''));
    normalized.sourceOrderIds = Array.isArray(src.sourceOrderIds) ? src.sourceOrderIds.map(String) : (normalized.sourceOrderId ? [normalized.sourceOrderId] : []);
    normalized.sourceOrderNumbers = Array.isArray(src.sourceOrderNumbers) ? src.sourceOrderNumbers : [];
    normalized.sourceDocuments = Array.isArray(src.sourceDocuments) ? src.sourceDocuments : normalized.sourceOrderIds.map(function (id, index) { return { type: 'supplier_order', id: id, number: normalized.sourceOrderNumbers[index] || '' }; });
    normalized.notes = pickFirst(src.notes, src.note, '');
    const lines = Array.isArray(src.lines) ? src.lines : (Array.isArray(src.righe) ? src.righe : []);
    normalized.lines = lines.map(function (line) {
      const l = line && typeof line === 'object' ? line : {};
      const returnQty = numField(l.returnQty, l.quantitaResa, 0);
      const received = normalized.ddtDirection === 'return_supplier' ? 0 : numField(l.receivedQty, l.documentQty, l.qty, l.quantity, l.quantitaRicevuta, l.quantitaDocumento, l.quantita, 0);
      const accepted = numField(l.acceptedQty, l.accettato, l.quantitaAccettata, 0);
      const quarantine = numField(l.quarantineQty, l.riservaQty, l.quantitaQuarantena, l.quantitaRiserva, 0);
      const rejected = numField(l.rejectedQty, l.respinto, l.quantitaRespinta, 0);
      const price = numField(l.price, l.unitPrice, l.purchasePrice, l.unitCost, l.prezzo, 0);
      const productDescription = pickFirst(l.productDescription, l.description, l.descrizione, l.productName, '');
      return Object.assign({}, l, {
        productId: String(pickFirst(l.productId, l.prodottoId, l.itemId, '')),
        productCode: pickFirst(l.productCode, l.code, l.codice, ''),
        productDescription: productDescription,
        description: productDescription,
        unitOfMeasure: pickFirst(l.unitOfMeasure, l.um, 'pz'),
        orderedQty: numField(l.orderedQty, l.quantitaOrdinata, 0),
        receivedQty: received,
        acceptedQty: accepted,
        quarantineQty: quarantine,
        rejectedQty: rejected,
        returnQty: returnQty,
        price: price,
        purchasePrice: price,
        unitCost: price,
        lineTotal: (normalized.ddtDirection === 'return_supplier' ? returnQty : received) * price,
        notes: pickFirst(l.notes, l.note, ''),
        sourceOrderId: String(pickFirst(l.sourceOrderId, l.ordineFornitoreId, '')),
        sourceOrderNumber: pickFirst(l.sourceOrderNumber, l.numeroOrdineFornitore, ''),
        sourceOrderLineIndex: pickFirst(l.sourceOrderLineIndex, l.indiceRigaOrdine, ''),
        remainingSourceQty: numField(l.remainingSourceQty, l.residuoOrigine, 0)
      });
    });
    normalized.total = normalized.lines.reduce(function (sum, line) { return sum + numField(line.lineTotal, 0); }, 0);
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, '');
    normalized.updatedAt = pickFirst(src.updatedAt, src.updated_at, '');
    return normalized;
  }


  function normalizeCustomerDDT(rawDDT) {
    const src = rawDDT && typeof rawDDT === 'object' ? rawDDT : {};
    const normalized = Object.assign({}, src);
    const rawStatus = String(pickFirst(src.status, src.stato, 'draft')).trim().toLowerCase();
    const statusMap = { bozza: 'draft', draft: 'draft', consegnato: 'delivered', delivered: 'delivered', parzialmente_consegnato: 'partially_delivered', partially_delivered: 'partially_delivered', annullato: 'cancelled', cancelled: 'cancelled' };
    normalized.status = statusMap[rawStatus] || 'draft';
    normalized.stato = normalized.status;
    normalized.number = pickFirst(src.number, src.numero, src.ddtNumber, src.numeroDDT, '');
    normalized.numero = normalized.number;
    normalized.date = pickFirst(src.date, src.data, new Date().toISOString().slice(0, 10));
    normalized.customerId = String(pickFirst(src.customerId, src.clienteId, src.customer && src.customer.id, ''));
    normalized.customerName = pickFirst(src.customerName, src.clienteNome, src.customer && (src.customer.name || src.customer.nome || src.customer.ragioneSociale), '');
    const customerSourceTypeRaw = pickFirst(src.sourceType, src.tipoOrigine, src.originType, 'direct');
    normalized.sourceType = customerSourceTypeRaw === 'customer_orders' ? 'customer_orders' : (customerSourceTypeRaw === 'customer_order' ? 'customer_order' : 'direct');
    normalized.sourceOrderId = String(pickFirst(src.sourceOrderId, src.ordineClienteId, src.orderId, ''));
    normalized.sourceOrderIds = Array.isArray(src.sourceOrderIds) ? src.sourceOrderIds.map(String) : (normalized.sourceOrderId ? [normalized.sourceOrderId] : []);
    normalized.sourceOrderNumbers = Array.isArray(src.sourceOrderNumbers) ? src.sourceOrderNumbers : [];
    normalized.sourceDocuments = Array.isArray(src.sourceDocuments) ? src.sourceDocuments : normalized.sourceOrderIds.map(function (id, index) { return { type: 'customer_order', id: id, number: normalized.sourceOrderNumbers[index] || '' }; });
    normalized.transportReason = pickFirst(src.transportReason, src.causaleTrasporto, src.reason, 'Vendita');
    normalized.carrier = pickFirst(src.carrier, src.vettore, '');
    normalized.packages = pickFirst(src.packages, src.colli, '');
    normalized.weight = pickFirst(src.weight, src.peso, '');
    normalized.goodsAppearance = pickFirst(src.goodsAppearance, src.aspettoBeni, src.aspettoEsteriore, '');
    normalized.notes = pickFirst(src.notes, src.note, '');
    normalized.invoiceId = String(pickFirst(src.invoiceId, src.fatturaId, src.sourceInvoiceLink && src.sourceInvoiceLink.invoiceId, ''));
    normalized.invoiceNumber = pickFirst(src.invoiceNumber, src.numeroFattura, src.sourceInvoiceLink && src.sourceInvoiceLink.invoiceNumber, '');
    normalized.invoicedAt = pickFirst(src.invoicedAt, src.fatturatoIl, src.sourceInvoiceLink && src.sourceInvoiceLink.linkedAt, '');
    normalized.invoiceStatus = pickFirst(src.invoiceStatus, src.statoFatturazione, normalized.invoiceId ? 'invoiced' : '');
    const lines = Array.isArray(src.lines) ? src.lines : (Array.isArray(src.righe) ? src.righe : []);
    normalized.lines = lines.map(function (line) {
      const l = line && typeof line === 'object' ? line : {};
      const shipped = numField(l.shippedQty, l.deliveredQty, l.documentQty, l.qty, l.quantity, l.quantitaConsegnata, l.quantitaDocumento, l.quantita, 0);
      const price = numField(l.price, l.unitPrice, l.salePrice, l.prezzo, 0);
      const productDescription = pickFirst(l.productDescription, l.description, l.descrizione, l.productName, '');
      return Object.assign({}, l, {
        productId: String(pickFirst(l.productId, l.prodottoId, l.itemId, '')),
        productCode: pickFirst(l.productCode, l.code, l.codice, ''),
        productDescription: productDescription,
        description: productDescription,
        unitOfMeasure: pickFirst(l.unitOfMeasure, l.um, 'pz'),
        orderedQty: numField(l.orderedQty, l.quantitaOrdinata, 0),
        shippedQty: shipped,
        deliveredQty: shipped,
        qty: shipped,
        price: price,
        salePrice: price,
        lineTotal: shipped * price,
        notes: pickFirst(l.notes, l.note, ''),
        sourceOrderId: String(pickFirst(l.sourceOrderId, l.ordineClienteId, '')),
        sourceOrderNumber: pickFirst(l.sourceOrderNumber, l.numeroOrdineCliente, ''),
        sourceOrderLineIndex: pickFirst(l.sourceOrderLineIndex, l.indiceRigaOrdine, '')
      });
    });
    normalized.total = normalized.lines.reduce(function (sum, line) { return sum + numField(line.lineTotal, 0); }, 0);
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, '');
    normalized.updatedAt = pickFirst(src.updatedAt, src.updated_at, '');
    return normalized;
  }


  function normalizeWorkflowEvent(rawEvent) {
    const src = rawEvent && typeof rawEvent === 'object' ? rawEvent : {};
    const normalized = Object.assign({}, src);
    normalized.id = String(pickFirst(src.id, src.uid, 'wf_' + Date.now()));
    normalized.sourceType = String(pickFirst(src.sourceType, src.tipoOrigine, '')).trim();
    normalized.sourceCollection = String(pickFirst(src.sourceCollection, src.collezioneOrigine, '')).trim();
    normalized.sourceId = String(pickFirst(src.sourceId, src.documentId, src.documentoId, '')).trim();
    normalized.action = String(pickFirst(src.action, src.azione, 'review')).trim();
    normalized.statusFrom = String(pickFirst(src.statusFrom, src.statoDa, '')).trim();
    normalized.statusTo = String(pickFirst(src.statusTo, src.statoA, 'pending_review')).trim();
    normalized.note = pickFirst(src.note, src.notes, src.nota, '');
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, new Date().toISOString());
    normalized.createdBy = pickFirst(src.createdBy, src.user, src.utente, 'utente');
    normalized.version = pickFirst(src.version, '0.4.2');
    return normalized;
  }


  function normalizeAuditEvent(rawEvent) {
    const src = rawEvent && typeof rawEvent === 'object' ? rawEvent : {};
    const normalized = Object.assign({}, src);
    normalized.id = String(pickFirst(src.id, src.uid, 'aud_' + Date.now()));
    normalized.timestamp = pickFirst(src.timestamp, src.createdAt, src.date, new Date().toISOString());
    normalized.category = String(pickFirst(src.category, src.categoria, 'manuale')).trim();
    normalized.action = String(pickFirst(src.action, src.azione, 'note')).trim();
    normalized.entityType = String(pickFirst(src.entityType, src.sourceType, src.tipoEntita, 'generic')).trim();
    normalized.entityId = String(pickFirst(src.entityId, src.sourceId, src.documentId, '')).trim();
    normalized.entityLabel = String(pickFirst(src.entityLabel, src.sourceNumber, src.label, '')).trim();
    normalized.subjectName = String(pickFirst(src.subjectName, src.soggetto, src.subject, '')).trim();
    normalized.amount = numField(src.amount, src.importo, 0);
    normalized.actor = String(pickFirst(src.actor, src.createdBy, src.user, 'utente')).trim();
    normalized.source = String(pickFirst(src.source, 'auditEvents')).trim();
    normalized.severity = String(pickFirst(src.severity, src.priority, 'info')).trim();
    normalized.note = pickFirst(src.note, src.notes, src.description, '');
    normalized.version = pickFirst(src.version, '0.4.3');
    return normalized;
  }

  window.DomainNormalizers = window.DomainNormalizers || {};
  window.DomainNormalizers.pickFirst = pickFirst;
  window.DomainNormalizers.normalizeCompanyInfo = normalizeCompanyInfo;

  function normalizeWarehouseMovement(rawMovement) {
    const src = rawMovement && typeof rawMovement === 'object' ? rawMovement : {};
    const normalized = Object.assign({}, src);
    const typeRaw = String(pickFirst(src.movementType, src.type, src.tipoMovimento, 'CARICO')).trim().toUpperCase();
    const allowed = ['CARICO', 'SCARICO', 'RETTIFICA', 'QUARANTENA_IN', 'QUARANTENA_OUT', 'SCARTO', 'RESO_FORNITORE'];
    normalized.movementType = allowed.includes(typeRaw) ? typeRaw : 'CARICO';
    normalized.tipoMovimento = normalized.movementType;
    normalized.productId = String(pickFirst(src.productId, src.prodottoId, src.itemId, ''));
    normalized.productCode = pickFirst(src.productCode, src.codiceProdotto, src.code, '');
    normalized.productDescription = pickFirst(src.productDescription, src.descrizioneProdotto, src.description, '');
    normalized.unitOfMeasure = pickFirst(src.unitOfMeasure, src.um, 'pz');
    normalized.quantity = numField(src.quantity, src.qty, src.quantita, 0);
    normalized.qty = normalized.quantity;
    normalized.date = pickFirst(src.date, src.data, new Date().toISOString().slice(0, 10));
    normalized.causale = pickFirst(src.causale, src.reason, '');
    normalized.notes = pickFirst(src.notes, src.note, '');
    normalized.documentType = pickFirst(src.documentType, src.tipoDocumento, 'manuale');
    normalized.documentId = pickFirst(src.documentId, src.documentoId, '');
    normalized.stockBefore = numField(src.stockBefore, src.giacenzaPrima, 0);
    normalized.stockAfter = numField(src.stockAfter, src.giacenzaDopo, 0);
    normalized.quarantineBefore = numField(src.quarantineBefore, src.quarantenaPrima, 0);
    normalized.quarantineAfter = numField(src.quarantineAfter, src.quarantenaDopo, 0);
    normalized.createdAt = pickFirst(src.createdAt, src.created_at, '');
    return normalized;
  }

  window.DomainNormalizers.normalizeProductInfo = normalizeProductInfo;
  window.DomainNormalizers.normalizeWarehouseMovement = normalizeWarehouseMovement;
  window.DomainNormalizers.normalizeWarehouseLot = normalizeWarehouseLot;
  window.DomainNormalizers.normalizeWorkflowEvent = normalizeWorkflowEvent;
  window.DomainNormalizers.normalizeAuditEvent = normalizeAuditEvent;
  window.DomainNormalizers.normalizeQuote = normalizeQuote;
  window.DomainNormalizers.normalizeCustomerOrder = normalizeCustomerOrder;
  window.DomainNormalizers.normalizeSupplierOrder = normalizeSupplierOrder;
  window.DomainNormalizers.normalizeSupplierDDT = normalizeSupplierDDT;
  window.DomainNormalizers.normalizeCustomerDDT = normalizeCustomerDDT;
  window.DomainNormalizers.normalizeCustomerInfo = normalizeCustomerInfo;
  window.DomainNormalizers.normalizeCreditNoteInfo = normalizeCreditNoteInfo;
  window.DomainNormalizers.normalizeInvoicePaymentInfo = normalizeInvoicePaymentInfo;
  window.DomainNormalizers.normalizeTimesheetImportInfo = normalizeTimesheetImportInfo;
  window.DomainNormalizers.normalizePurchaseInfo = normalizePurchaseInfo;
  window.DomainNormalizers.normalizeInvoiceStatusInfo = normalizeInvoiceStatusInfo;
  window.DomainNormalizers.normalizeInvoiceTotalsInfo = normalizeInvoiceTotalsInfo;
  window.normalizeCompanyInfo = normalizeCompanyInfo;
  window.normalizeProductInfo = normalizeProductInfo;
  window.normalizeWarehouseMovement = normalizeWarehouseMovement;
  window.normalizeWarehouseLot = normalizeWarehouseLot;
  window.normalizeWorkflowEvent = normalizeWorkflowEvent;
  window.normalizeAuditEvent = normalizeAuditEvent;
  window.normalizeQuote = normalizeQuote;
  window.normalizeCustomerOrder = normalizeCustomerOrder;
  window.normalizeSupplierOrder = normalizeSupplierOrder;
  window.normalizeSupplierDDT = normalizeSupplierDDT;
  window.normalizeCustomerDDT = normalizeCustomerDDT;
  window.normalizeCustomerInfo = normalizeCustomerInfo;
  window.normalizeCreditNoteInfo = normalizeCreditNoteInfo;
  window.normalizeInvoicePaymentInfo = normalizeInvoicePaymentInfo;
  window.normalizeTimesheetImportInfo = normalizeTimesheetImportInfo;
  window.normalizePurchaseInfo = normalizePurchaseInfo;
  window.normalizeInvoiceStatusInfo = normalizeInvoiceStatusInfo;
  window.normalizeInvoiceTotalsInfo = normalizeInvoiceTotalsInfo;
})();
