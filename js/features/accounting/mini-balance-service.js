// js/features/accounting/mini-balance-service.js
// CDSDM 0.4.5 - Bilancino gestionale semplificato
(function () {
  'use strict';
  const win = window;

  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function num(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const cleaned = str(v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function iso(v) { return str(v).slice(0, 10); }
  function parseDate(v) { const s = iso(v); if (!s) return null; const d = new Date(s + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; }
  function inRange(date, from, to) {
    const d = parseDate(date); if (!d) return true;
    const f = parseDate(from); const t = parseDate(to); if (t) t.setHours(23, 59, 59, 999);
    if (f && d < f) return false; if (t && d > t) return false; return true;
  }
  function todayYearStart() { const y = new Date().getFullYear(); return y + '-01-01'; }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }
  function dataBundle(input) {
    const d = input || {};
    const keys = ['invoices', 'purchases', 'customers', 'suppliers', 'products', 'paymentEvents', 'cashbookMovements', 'warehouseLots', 'supplierDDTs', 'customerDDTs', 'businessBudgets'];
    const out = {};
    keys.forEach(k => { out[k] = arr(d[k] != null ? d[k] : getDataSafe(k)); });
    return out;
  }
  function firstNumber(obj, names) {
    const o = obj || {};
    for (let i = 0; i < names.length; i++) {
      let cur = o;
      String(names[i]).split('.').forEach(p => { cur = cur && cur[p]; });
      if (cur != null && cur !== '') {
        const n = num(cur);
        if (Number.isFinite(n)) return n;
      }
    }
    return 0;
  }
  function docDate(doc) { return iso((doc || {}).date || (doc || {}).data || (doc || {}).issueDate || (doc || {}).invoiceDate || (doc || {}).createdAt); }
  function dueDate(doc) { return iso((doc || {}).dueDate || (doc || {}).dataScadenza || (doc || {}).scadenza || docDate(doc)); }
  function docNumber(doc) { return str((doc || {}).number || (doc || {}).numero || (doc || {}).invoiceNumber || (doc || {}).documentNumber || (doc || {}).id); }
  function totalAmount(doc) { return Math.abs(round2(firstNumber(doc || {}, ['totals.total', 'totals.grandTotal', 'totaleDocumento', 'totalGross', 'total', 'totale', 'amount', 'importo']))); }
  function netAmount(doc) { return Math.abs(round2(firstNumber(doc || {}, ['totals.net', 'totals.taxable', 'totals.imponibile', 'totalNet', 'netAmount', 'taxableAmount', 'imponibile', 'totaleImponibile', 'subtotal', 'amountNet', 'importoNetto', 'amount', 'importo', 'total', 'totale']))); }
  function paidLegacy(doc) { return round2(arr((doc || {}).payments).reduce((s, p) => s + Math.abs(num((p || {}).amount || (p || {}).importo || (p || {}).value)), 0) + firstNumber(doc || {}, ['paidAmount', 'amountPaid', 'importoPagato'])); }
  function idOf(x) { return str((x || {}).id || (x || {}).uid || (x || {}).docId); }
  function findById(list, id) { return arr(list).find(x => String(idOf(x)) === String(id)); }
  function subjectName(x, fallback) { return str(x && (x.name || x.ragioneSociale || x.denominazione || x.businessName || x.fullName || x.nome)) || fallback || 'Soggetto'; }
  function isCreditNote(doc) { const t = lower((doc || {}).type || (doc || {}).documentType || (doc || {}).kind || (doc || {}).categoria); return t.indexOf('credit') >= 0 || t.indexOf('nota') >= 0 || t.indexOf('credito') >= 0 || (doc || {}).isCreditNote === true; }

  function paymentAllocations(data) {
    const map = {};
    arr(data.paymentEvents).forEach(ev => {
      const type = lower(ev.type || ev.eventType || ev.kind);
      const sign = type.indexOf('supplier') >= 0 || type.indexOf('payment') >= 0 ? 'supplier' : 'customer';
      arr(ev.allocations).forEach(a => {
        const did = str(a.documentId || a.docId || a.invoiceId || a.purchaseId);
        if (!did) return;
        map[did] = round2((map[did] || 0) + Math.abs(num(a.amount || a.importo || a.value)));
      });
      if (!arr(ev.allocations).length) {
        const did = str(ev.documentId || ev.invoiceId || ev.purchaseId);
        if (did) map[did] = round2((map[did] || 0) + Math.abs(num(ev.amount || ev.importo || ev.value)));
      }
    });
    return map;
  }

  function buildDocumentRows(data, filters) {
    const d = dataBundle(data); const f = filters || {}; const from = f.from || ''; const to = f.to || ''; const payMap = paymentAllocations(d);
    const customers = d.customers, suppliers = d.suppliers; const rows = [];
    arr(d.invoices).forEach(inv => {
      if (isCreditNote(inv)) return;
      const date = docDate(inv); if (!inRange(date, from, to)) return;
      const customerId = str(inv.customerId || inv.clienteId || inv.clientId); const cname = subjectName(findById(customers, customerId), str(inv.customerName || inv.cliente || inv.subjectName || 'Cliente'));
      const total = totalAmount(inv); const paid = round2(Math.max(paidLegacy(inv), payMap[idOf(inv)] || 0)); const residual = round2(Math.max(0, total - paid));
      rows.push({ date, dueDate: dueDate(inv), type: 'invoice', label: 'Fattura cliente', documentId: idOf(inv), number: docNumber(inv), subjectId: customerId, subjectName: cname, total, paid, residual, sign: 'credit' });
    });
    arr(d.invoices).concat(arr(d.notes)).forEach(note => {
      if (!isCreditNote(note)) return;
      const date = docDate(note); if (!inRange(date, from, to)) return;
      const customerId = str(note.customerId || note.clienteId || note.clientId); const cname = subjectName(findById(customers, customerId), str(note.customerName || note.cliente || 'Cliente'));
      const total = totalAmount(note) || netAmount(note);
      rows.push({ date, dueDate: date, type: 'credit_note', label: 'Nota credito cliente', documentId: idOf(note), number: docNumber(note), subjectId: customerId, subjectName: cname, total: -total, paid: 0, residual: -total, sign: 'debit' });
    });
    arr(d.purchases).forEach(pur => {
      const date = docDate(pur); if (!inRange(date, from, to)) return;
      const supplierId = str(pur.supplierId || pur.fornitoreId); const sname = subjectName(findById(suppliers, supplierId), str(pur.supplierName || pur.fornitore || 'Fornitore'));
      const total = totalAmount(pur); const paid = round2(Math.max(paidLegacy(pur), payMap[idOf(pur)] || 0)); const residual = round2(Math.max(0, total - paid));
      rows.push({ date, dueDate: dueDate(pur), type: 'purchase', label: 'Acquisto fornitore', documentId: idOf(pur), number: docNumber(pur), subjectId: supplierId, subjectName: sname, total, paid, residual, sign: 'debt' });
    });
    return rows.sort((a, b) => str(a.date).localeCompare(str(b.date)) || str(a.number).localeCompare(str(b.number)));
  }

  function manualCashbook(data, filters) {
    const d = dataBundle(data); const f = filters || {}; const rows = [];
    arr(d.cashbookMovements).forEach(m => {
      if (String(m.source || '').indexOf('paymentEvent') >= 0) return;
      const date = iso(m.date || m.data || m.createdAt); if (!inRange(date, f.from, f.to)) return;
      const dir = lower(m.direction || m.type || m.movementType || m.kind);
      const amount = Math.abs(num(m.amount || m.importo || m.value));
      const isIn = dir === 'in' || dir === 'income' || dir === 'entrata' || dir === 'receipt';
      const isOut = dir === 'out' || dir === 'expense' || dir === 'uscita' || dir === 'payment';
      rows.push({ date, description: str(m.description || m.note || m.category || m.account || 'Movimento manuale'), account: str(m.account || m.conto || 'cassa/banca'), income: isIn ? amount : 0, expense: isOut ? amount : 0 });
    });
    return rows;
  }

  function summarizePayments(data, filters) {
    const d = dataBundle(data); const f = filters || {}; const result = { customerReceipts: 0, supplierPayments: 0, manualIncome: 0, manualExpenses: 0, balance: 0, movements: [] };
    arr(d.paymentEvents).forEach(ev => {
      const date = iso(ev.date || ev.paymentDate || ev.createdAt); if (!inRange(date, f.from, f.to)) return;
      const amount = Math.abs(num(ev.amount || ev.importo || ev.value)); const type = lower(ev.type || ev.eventType || ev.kind);
      const isSupplier = type.indexOf('supplier') >= 0 || type.indexOf('payment') >= 0 || type.indexOf('fornitore') >= 0;
      if (isSupplier) result.supplierPayments = round2(result.supplierPayments + amount); else result.customerReceipts = round2(result.customerReceipts + amount);
      result.movements.push({ date, type: isSupplier ? 'Pagamento fornitore' : 'Incasso cliente', amount: isSupplier ? -amount : amount, reference: str(ev.reference || ev.note || ev.id) });
    });
    manualCashbook(d, f).forEach(m => {
      result.manualIncome = round2(result.manualIncome + m.income); result.manualExpenses = round2(result.manualExpenses + m.expense);
      result.movements.push({ date: m.date, type: m.income ? 'Entrata manuale' : 'Uscita manuale', amount: round2(m.income - m.expense), reference: m.description });
    });
    result.balance = round2(result.customerReceipts - result.supplierPayments + result.manualIncome - result.manualExpenses);
    result.movements.sort((a, b) => str(a.date).localeCompare(str(b.date)));
    return result;
  }

  function warehouseSummary(data, options) {
    const d = dataBundle(data); const method = (options || {}).valuationMethod || 'standard';
    if (win.InventoryValuationService && typeof win.InventoryValuationService.buildRows === 'function') {
      const rows = win.InventoryValuationService.buildRows(d.products, { method, supplierDDTs: d.supplierDDTs });
      const s = win.InventoryValuationService.summarize(rows);
      return { method, totalValue: round2(s.totalValue || s.stockValue || 0), availableValue: round2(s.netValue || s.stockValue || 0), quarantineValue: round2(s.quarantineValue || 0), missingCost: s.missingPriceCount || s.missingCostCount || 0, rows };
    }
    const rows = arr(d.products).map(p => { const stock = num(p.stockQty || p.giacenza); const quarantine = num(p.quarantineQty); const cost = num(p.purchasePrice || p.prezzoAcquisto || p.cost); return { product: p, totalValue: round2((stock + quarantine) * cost), netValue: round2(stock * cost), quarantineValue: round2(quarantine * cost), missingPrice: cost <= 0 && (stock || quarantine) }; });
    return { method, totalValue: round2(rows.reduce((s, r) => s + r.totalValue, 0)), availableValue: round2(rows.reduce((s, r) => s + r.netValue, 0)), quarantineValue: round2(rows.reduce((s, r) => s + r.quarantineValue, 0)), missingCost: rows.filter(r => r.missingPrice).length, rows };
  }

  function buildMiniBalance(input, filters) {
    const d = dataBundle(input); const f = Object.assign({ from: todayYearStart(), to: todayIso(), includeManualCashbook: true, includeWarehouse: true, valuationMethod: 'standard' }, filters || {});
    const docs = buildDocumentRows(d, f); const payments = summarizePayments(d, f);
    const revenueGross = round2(docs.filter(r => r.type === 'invoice').reduce((s, r) => s + Math.abs(r.total), 0));
    const creditNotes = round2(Math.abs(docs.filter(r => r.type === 'credit_note').reduce((s, r) => s + r.total, 0)));
    const revenueNet = round2(revenueGross - creditNotes);
    const purchases = round2(docs.filter(r => r.type === 'purchase').reduce((s, r) => s + Math.abs(r.total), 0));
    const manualExpenses = f.includeManualCashbook ? payments.manualExpenses : 0;
    const manualIncome = f.includeManualCashbook ? payments.manualIncome : 0;
    const costsNet = round2(purchases + manualExpenses);
    const operatingMargin = round2(revenueNet - costsNet);
    const marginPct = revenueNet ? round2((operatingMargin / revenueNet) * 100) : 0;
    const customerOpen = round2(docs.filter(r => r.type === 'invoice').reduce((s, r) => s + r.residual, 0) - creditNotes);
    const supplierOpen = round2(docs.filter(r => r.type === 'purchase').reduce((s, r) => s + r.residual, 0));
    const today = parseDate(f.today || todayIso());
    const overdueCustomers = round2(docs.filter(r => r.type === 'invoice' && r.residual > 0 && parseDate(r.dueDate) && today && parseDate(r.dueDate) < today).reduce((s, r) => s + r.residual, 0));
    const overdueSuppliers = round2(docs.filter(r => r.type === 'purchase' && r.residual > 0 && parseDate(r.dueDate) && today && parseDate(r.dueDate) < today).reduce((s, r) => s + r.residual, 0));
    const wh = f.includeWarehouse ? warehouseSummary(d, f) : { method: f.valuationMethod, totalValue: 0, availableValue: 0, quarantineValue: 0, missingCost: 0, rows: [] };
    const year = Number(str(f.from).slice(0, 4)) || new Date().getFullYear();
    let budget = null;
    if (win.BusinessBudgetService && typeof win.BusinessBudgetService.compareBudget === 'function') {
      budget = win.BusinessBudgetService.compareBudget(d, year).totals || null;
    }
    const alerts = [];
    if (operatingMargin < 0) alerts.push({ level: 'danger', text: 'Margine operativo semplificato negativo nel periodo.' });
    if (customerOpen > 0) alerts.push({ level: 'warning', text: 'Crediti clienti aperti: € ' + customerOpen.toFixed(2) });
    if (overdueCustomers > 0) alerts.push({ level: 'danger', text: 'Crediti clienti scaduti: € ' + overdueCustomers.toFixed(2) });
    if (wh.missingCost > 0) alerts.push({ level: 'warning', text: wh.missingCost + ' prodotti con costo mancante nella valorizzazione magazzino.' });
    alerts.push({ level: 'info', text: 'Bilancino gestionale: non include ammortamenti, ratei/risconti, imposte o scritture di assestamento.' });
    return { version: '0.4.5', filters: f, economic: { revenueGross, creditNotes, revenueNet, purchases, manualExpenses, costsNet, operatingMargin, marginPct }, financial: { customerReceipts: payments.customerReceipts, supplierPayments: payments.supplierPayments, manualIncome, manualExpenses, balance: payments.balance }, openItems: { customerOpen, supplierOpen, netOpen: round2(customerOpen - supplierOpen), overdueCustomers, overdueSuppliers }, warehouse: wh, budget, documents: docs, movements: payments.movements, alerts };
  }

  function toCsv(result) {
    const r = result || buildMiniBalance(); const lines = [];
    lines.push(['Sezione', 'Voce', 'Importo'].join(';'));
    [['Conto economico', 'Ricavi lordi', r.economic.revenueGross], ['Conto economico', 'Note credito', r.economic.creditNotes], ['Conto economico', 'Ricavi netti', r.economic.revenueNet], ['Conto economico', 'Costi acquisti', r.economic.purchases], ['Conto economico', 'Costi manuali', r.economic.manualExpenses], ['Conto economico', 'Margine operativo', r.economic.operatingMargin], ['Finanziario', 'Incassi clienti', r.financial.customerReceipts], ['Finanziario', 'Pagamenti fornitori', r.financial.supplierPayments], ['Finanziario', 'Saldo finanziario', r.financial.balance], ['Aperti', 'Crediti clienti', r.openItems.customerOpen], ['Aperti', 'Debiti fornitori', r.openItems.supplierOpen], ['Magazzino', 'Valore stimato', r.warehouse.totalValue]].forEach(row => lines.push(row.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')));
    return lines.join('\n');
  }

  win.MiniBalanceService = { buildMiniBalance, buildDocumentRows, summarizePayments, warehouseSummary, toCsv, _private: { num, round2, inRange, totalAmount, netAmount } };
})();
