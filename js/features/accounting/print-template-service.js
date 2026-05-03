// js/features/accounting/print-template-service.js
// CDSDM 0.4.1 - Stampe e PDF HTML avanzati
// Genera template HTML stampabili tramite browser, senza backend custom e senza nuove collezioni Firestore.

(function () {
  'use strict';

  const win = window;
  function str(v) { return String(v == null ? '' : v).trim(); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function num(v) { const n = Number(String(v == null ? 0 : v).replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function iso(v) { return str(v).slice(0, 10); }
  function esc(v) { return str(v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function money(v) { return round2(v).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function getData(key) {
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    if (typeof win.getData === 'function') return win.getData(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }
  function asArrayData(key) { const v = getData(key); return Array.isArray(v) ? v : []; }
  function getCompanyInfo() {
    const raw = getData('companyInfo') || {};
    return (win.DomainNormalizers && typeof win.DomainNormalizers.normalizeCompanyInfo === 'function') ? win.DomainNormalizers.normalizeCompanyInfo(raw) : raw;
  }
  function companyName(c) { return str(c.name || c.ragioneSociale || c.denominazione || c.nomeStudio || 'CDSDM'); }
  function companyLine(c) {
    return [c.address || c.indirizzo, c.cap, c.city || c.comune, c.province || c.provincia, c.country || c.nazione].map(str).filter(Boolean).join(' ');
  }
  function companyFiscalLine(c) {
    const piva = str(c.vatNumber || c.partitaIva || c.partitaIVA);
    const cf = str(c.fiscalCode || c.codiceFiscale);
    return [piva ? 'P.IVA ' + piva : '', cf ? 'CF ' + cf : '', c.email || '', c.pec || ''].filter(Boolean).join(' · ');
  }
  function safeId(v) { return str(v || '').toLowerCase(); }
  function findById(list, id) {
    const sid = safeId(id);
    return arr(list).find(function (x) { return safeId(x && (x.id || x._id || x.uid)) === sid; }) || null;
  }
  function customerName(id, customers) {
    const c = findById(customers, id) || {};
    return str(c.name || c.ragioneSociale || c.denominazione || c.displayName || id || 'Cliente');
  }
  function supplierName(id, suppliers) {
    const s = findById(suppliers, id) || {};
    return str(s.name || s.ragioneSociale || s.denominazione || s.displayName || id || 'Fornitore');
  }
  function documentNumber(d) { return str(d.number || d.numero || d.invoiceNumber || d.documentNumber || d.id || ''); }
  function documentDate(d) { return iso(d.date || d.data || d.issueDate || d.createdAt || ''); }
  function documentTotal(d) {
    return round2(d.total || d.totale || d.totalAmount || d.importoTotale || d.grandTotal || d.amount || d.totaleDocumento || 0);
  }
  function rowsFromDocument(d) {
    return arr(d.lines || d.righe || d.items || d.rows).map(function (r) {
      const qty = num(r.qty || r.quantity || r.quantita || 1);
      const unit = num(r.price || r.unitPrice || r.prezzo || r.prezzoUnitario || r.amount || 0);
      const total = round2(r.total || r.lineTotal || r.totale || (qty * unit));
      return { code: str(r.code || r.codice || r.productCode), description: str(r.description || r.descrizione || r.name || r.nome || r.productName), qty: qty, unit: unit, total: total };
    });
  }
  function style() {
    return '<style>' +
      ':root{font-family:Arial,Helvetica,sans-serif;color:#111}body{margin:28px;font-size:12px}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 8px}.muted{color:#666}.header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #222;padding-bottom:14px;margin-bottom:18px}.brand{font-size:12px}.doc-meta{text-align:right}.box{border:1px solid #ddd;border-radius:8px;padding:10px;margin:10px 0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kpi{border:1px solid #ddd;border-radius:8px;padding:8px}.kpi b{display:block;font-size:15px;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #ddd;padding:6px;vertical-align:top}th{background:#f2f2f2;text-align:left}.right{text-align:right}.center{text-align:center}.total-row td{font-weight:bold;background:#f8f8f8}.footer{margin-top:26px;border-top:1px solid #ddd;padding-top:8px;font-size:10px;color:#666}.no-print{margin-bottom:14px}@media print{.no-print{display:none}body{margin:0}.page-break{page-break-before:always}}' +
      '</style>';
  }
  function page(title, body, opts) {
    const c = getCompanyInfo();
    const o = opts || {};
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title>' + style() + '</head><body>' +
      '<div class="no-print"><button onclick="window.print()">Stampa / Salva come PDF</button></div>' +
      '<div class="header"><div class="brand"><h1>' + esc(companyName(c)) + '</h1><div>' + esc(companyLine(c)) + '</div><div>' + esc(companyFiscalLine(c)) + '</div></div>' +
      '<div class="doc-meta"><strong>' + esc(title) + '</strong><br>Generato il ' + esc(o.generatedAt || today()) + '<br>CDSDM 0.4.1</div></div>' +
      body +
      '<div class="footer">Documento gestionale generato lato browser. Usa la funzione Stampa/Salva come PDF del browser per creare il PDF. Il progetto resta front-end only e non invia dati a backend custom.</div>' +
      '</body></html>';
  }
  function filterTextMatch(entry, text, fields) {
    const q = str(text).toLowerCase();
    if (!q) return true;
    return fields.map(function (f) { return str(entry && entry[f]); }).join(' ').toLowerCase().indexOf(q) >= 0;
  }
  function inPeriod(date, from, to) {
    const d = iso(date);
    if (from && d && d < from) return false;
    if (to && d && d > to) return false;
    return true;
  }
  function buildStatementHtml(options) {
    const opt = options || {};
    const subjectType = str(opt.subjectType || 'customer');
    if (!win.AccountStatementService || typeof win.AccountStatementService.buildStatement !== 'function') {
      return page('Estratto conto', '<div class="box">Servizio estratto conto non disponibile.</div>');
    }
    const result = win.AccountStatementService.buildStatement({ customers: asArrayData('customers'), suppliers: asArrayData('suppliers'), invoices: asArrayData('invoices'), purchases: asArrayData('purchases'), paymentEvents: asArrayData('paymentEvents') }, opt);
    const s = result.summary || {};
    const rows = arr(result.entries);
    const title = 'Estratto conto ' + (subjectType === 'supplier' ? 'fornitore' : 'cliente');
    const body = '<h2>' + esc(title) + '</h2>' +
      '<p class="muted">Periodo: ' + esc(s.from || 'inizio') + ' - ' + esc(s.to || 'oggi') + '</p>' +
      '<div class="grid"><div class="kpi">Saldo iniziale<b>€ ' + money(s.openingBalance) + '</b></div><div class="kpi">Dare<b>€ ' + money(s.debit) + '</b></div><div class="kpi">Avere<b>€ ' + money(s.credit) + '</b></div><div class="kpi">Saldo finale<b>€ ' + money(s.closingBalance) + '</b></div></div>' +
      '<table><thead><tr><th>Data</th><th>Soggetto</th><th>Tipo</th><th>Documento</th><th>Descrizione</th><th class="right">Dare</th><th class="right">Avere</th><th class="right">Saldo</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (e) { return '<tr><td>' + esc(e.date) + '</td><td>' + esc(e.subjectName) + '</td><td>' + esc(e.type) + '</td><td>' + esc(e.documentNumber) + '</td><td>' + esc(e.description) + '</td><td class="right">' + money(e.debit) + '</td><td class="right">' + money(e.credit) + '</td><td class="right">' + money(e.statementRunningBalance) + '</td></tr>'; }).join('') : '<tr><td colspan="8" class="center muted">Nessun movimento.</td></tr>') +
      '</tbody></table>';
    return page(title, body);
  }
  function buildLedgerHtml(options) {
    const opt = options || {};
    if (!win.LedgerService || typeof win.LedgerService.buildEntries !== 'function') {
      return page('Partitario', '<div class="box">Servizio partitario non disponibile.</div>');
    }
    let rows = win.LedgerService.buildEntries({ customers: asArrayData('customers'), suppliers: asArrayData('suppliers'), invoices: asArrayData('invoices'), purchases: asArrayData('purchases'), paymentEvents: asArrayData('paymentEvents') }, opt) || [];
    rows = rows.filter(function (e) { return inPeriod(e.date, opt.from, opt.to) && filterTextMatch(e, opt.text, ['subjectName', 'type', 'documentNumber', 'description']); });
    let debit = 0; let credit = 0;
    rows.forEach(function (e) { debit = round2(debit + num(e.debit)); credit = round2(credit + num(e.credit)); });
    const title = 'Partitario ' + (opt.subjectType === 'supplier' ? 'fornitori' : opt.subjectType === 'customer' ? 'clienti' : 'clienti e fornitori');
    const body = '<h2>' + esc(title) + '</h2><p class="muted">Periodo: ' + esc(opt.from || 'inizio') + ' - ' + esc(opt.to || 'oggi') + '</p>' +
      '<div class="grid"><div class="kpi">Movimenti<b>' + rows.length + '</b></div><div class="kpi">Dare<b>€ ' + money(debit) + '</b></div><div class="kpi">Avere<b>€ ' + money(credit) + '</b></div><div class="kpi">Saldo netto<b>€ ' + money(debit - credit) + '</b></div></div>' +
      '<table><thead><tr><th>Data</th><th>Soggetto</th><th>Tipo</th><th>Documento</th><th>Descrizione</th><th class="right">Dare</th><th class="right">Avere</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (e) { return '<tr><td>' + esc(e.date) + '</td><td>' + esc(e.subjectName) + '</td><td>' + esc(e.type) + '</td><td>' + esc(e.documentNumber) + '</td><td>' + esc(e.description) + '</td><td class="right">' + money(e.debit) + '</td><td class="right">' + money(e.credit) + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="center muted">Nessun movimento.</td></tr>') +
      '</tbody></table>';
    return page(title, body);
  }
  function buildInvoiceHtml(options) {
    const invoices = asArrayData('invoices');
    const customers = asArrayData('customers');
    const id = str((options || {}).documentId);
    const inv = findById(invoices, id) || invoices.find(function (x) { return documentNumber(x) === id; }) || invoices[0] || null;
    if (!inv) return page('Documento vendita', '<div class="box">Nessuna fattura o nota di credito disponibile.</div>');
    const rows = rowsFromDocument(inv);
    const cust = customerName(inv.customerId || inv.clienteId || inv.customer || inv.cliente, customers);
    const title = (str(inv.type || inv.documentType || '').toLowerCase().indexOf('credit') >= 0 ? 'Nota di credito' : 'Fattura') + ' ' + documentNumber(inv);
    const body = '<h2>' + esc(title) + '</h2>' +
      '<div class="box"><strong>Cliente:</strong> ' + esc(cust) + '<br><strong>Data:</strong> ' + esc(documentDate(inv)) + '<br><strong>Scadenza:</strong> ' + esc(iso(inv.dueDate || inv.scadenza || '')) + '</div>' +
      '<table><thead><tr><th>Codice</th><th>Descrizione</th><th class="right">Q.tà</th><th class="right">Prezzo</th><th class="right">Totale</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr><td>' + esc(r.code) + '</td><td>' + esc(r.description) + '</td><td class="right">' + money(r.qty) + '</td><td class="right">€ ' + money(r.unit) + '</td><td class="right">€ ' + money(r.total) + '</td></tr>'; }).join('') : '<tr><td colspan="5" class="center muted">Righe non disponibili nel formato riconosciuto.</td></tr>') +
      '<tr class="total-row"><td colspan="4" class="right">Totale documento</td><td class="right">€ ' + money(documentTotal(inv)) + '</td></tr></tbody></table>';
    return page(title, body);
  }
  function buildCashbookHtml(options) {
    const opt = options || {};
    let rows = [];
    if (win.CashbookService && typeof win.CashbookService.buildMovements === 'function') {
      rows = win.CashbookService.buildMovements({ paymentEvents: asArrayData('paymentEvents'), cashbookMovements: asArrayData('cashbookMovements'), customers: asArrayData('customers'), suppliers: asArrayData('suppliers') }, opt) || [];
    } else {
      rows = asArrayData('cashbookMovements');
    }
    rows = rows.filter(function (e) { return inPeriod(e.date || e.valueDate, opt.from, opt.to) && filterTextMatch(e, opt.text, ['account', 'category', 'subjectName', 'description', 'reference']); });
    let income = 0; let outcome = 0;
    rows.forEach(function (e) { income += num(e.income || (e.direction === 'in' ? e.amount : 0)); outcome += num(e.outcome || e.expense || (e.direction === 'out' ? e.amount : 0)); });
    const body = '<h2>Prima nota / movimenti finanziari</h2><p class="muted">Periodo: ' + esc(opt.from || 'inizio') + ' - ' + esc(opt.to || 'oggi') + '</p>' +
      '<div class="grid"><div class="kpi">Movimenti<b>' + rows.length + '</b></div><div class="kpi">Entrate<b>€ ' + money(income) + '</b></div><div class="kpi">Uscite<b>€ ' + money(outcome) + '</b></div><div class="kpi">Saldo<b>€ ' + money(income - outcome) + '</b></div></div>' +
      '<table><thead><tr><th>Data</th><th>Conto</th><th>Categoria</th><th>Soggetto</th><th>Riferimento</th><th>Descrizione</th><th class="right">Entrate</th><th class="right">Uscite</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (e) { return '<tr><td>' + esc(e.date || e.valueDate) + '</td><td>' + esc(e.account) + '</td><td>' + esc(e.category || e.type) + '</td><td>' + esc(e.subjectName) + '</td><td>' + esc(e.reference) + '</td><td>' + esc(e.description || e.notes) + '</td><td class="right">' + money(e.income || (e.direction === 'in' ? e.amount : 0)) + '</td><td class="right">' + money(e.outcome || e.expense || (e.direction === 'out' ? e.amount : 0)) + '</td></tr>'; }).join('') : '<tr><td colspan="8" class="center muted">Nessun movimento.</td></tr>') +
      '</tbody></table>';
    return page('Prima nota', body);
  }
  function buildRemindersHtml(options) {
    const opt = options || {};
    let rows = [];
    if (win.ReminderService && typeof win.ReminderService.buildReminderRows === 'function') {
      rows = win.ReminderService.buildReminderRows({ customers: asArrayData('customers'), suppliers: asArrayData('suppliers'), invoices: asArrayData('invoices'), purchases: asArrayData('purchases'), paymentEvents: asArrayData('paymentEvents'), reminderEvents: asArrayData('reminderEvents') }, opt) || [];
    } else if (win.ScadenziarioService && typeof win.ScadenziarioService.buildSchedule === 'function') {
      const result = win.ScadenziarioService.buildSchedule({ customers: asArrayData('customers'), suppliers: asArrayData('suppliers'), invoices: asArrayData('invoices'), purchases: asArrayData('purchases'), paymentEvents: asArrayData('paymentEvents') }, opt);
      rows = arr(result && (result.rows || result.entries || result.items));
    }
    rows = arr(rows).filter(function (e) { return filterTextMatch(e, opt.text, ['subjectName', 'documentNumber', 'description', 'level']); });
    const body = '<h2>Solleciti e promemoria scadenze</h2><p class="muted">Elenco operativo generato per copia/stampa manuale, senza invio automatico.</p>' +
      '<table><thead><tr><th>Scadenza</th><th>Tipo</th><th>Soggetto</th><th>Documento</th><th class="right">Residuo</th><th>Livello</th><th>Note</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (e) { return '<tr><td>' + esc(e.dueDate || e.date || e.scadenza) + '</td><td>' + esc(e.subjectType || e.type) + '</td><td>' + esc(e.subjectName || e.customerName || e.supplierName) + '</td><td>' + esc(e.documentNumber || e.number) + '</td><td class="right">€ ' + money(e.residual || e.residuo || e.openAmount || e.amount) + '</td><td>' + esc(e.level || e.reminderLevel || '') + '</td><td>' + esc(e.notes || '') + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="center muted">Nessuna scadenza disponibile per la stampa.</td></tr>') +
      '</tbody></table>';
    return page('Solleciti e promemoria', body);
  }
  function buildHtml(type, options) {
    const t = str(type || 'statement');
    if (t === 'invoice') return buildInvoiceHtml(options);
    if (t === 'ledger') return buildLedgerHtml(options);
    if (t === 'cashbook') return buildCashbookHtml(options);
    if (t === 'reminders') return buildRemindersHtml(options);
    return buildStatementHtml(options);
  }
  function openPrintWindow(html) {
    const w = win.open('', '_blank');
    if (!w) { alert('Popup bloccato dal browser.'); return false; }
    w.document.open(); w.document.write(html); w.document.close(); w.focus();
    setTimeout(function () { try { w.print(); } catch (e) {} }, 250);
    return true;
  }
  function downloadHtml(html, filename) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.download = filename || 'stampa-cdsdm.html';
    a.href = URL.createObjectURL(blob); a.click(); URL.revokeObjectURL(a.href);
  }

  win.PrintTemplateService = {
    buildHtml: buildHtml,
    openPrintWindow: openPrintWindow,
    downloadHtml: downloadHtml,
    _internals: { esc: esc, money: money, rowsFromDocument: rowsFromDocument, page: page }
  };
})();
