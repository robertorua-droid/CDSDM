// js/features/accounting/bank-reconciliation-service.js
// CDSDM 0.3.5 - Riconciliazione pagamenti
// Import CSV banca, proposte di abbinamento a documenti aperti e creazione eventi pagamento confermabili.

(function () {
  'use strict';

  const win = window;

  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function num(v) {
    const s = String(v == null ? 0 : v).trim().replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  function round2(v) { return Math.round(num(v) * 100) / 100; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function iso(v) {
    const s = str(v);
    if (!s) return '';
    const m1 = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m1) return [m1[1], String(m1[2]).padStart(2, '0'), String(m1[3]).padStart(2, '0')].join('-');
    const m2 = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (m2) {
      const y = m2[3].length === 2 ? '20' + m2[3] : m2[3];
      return [y, String(m2[2]).padStart(2, '0'), String(m2[1]).padStart(2, '0')].join('-');
    }
    return s.slice(0, 10);
  }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function uid(prefix) { return (prefix || 'reco') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
  function getDataSafe(key) {
    if (typeof win.getData === 'function') return win.getData(key) || [];
    if (win.AppStore && typeof win.AppStore.get === 'function') return win.AppStore.get(key) || [];
    return (win.globalData && win.globalData[key]) || [];
  }
  function subjectName(x, fallback) { return str(x && (x.name || x.ragioneSociale || x.denominazione || x.businessName || x.fullName)) || fallback || 'Soggetto'; }

  function parseCsvLine(line, sep) {
    const out = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i += 1; }
        else quoted = !quoted;
      } else if (ch === sep && !quoted) {
        out.push(cur); cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out;
  }

  function parseCsv(text) {
    const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(function (l) { return str(l); });
    if (lines.length < 2) return [];
    const first = lines[0];
    const sep = (first.split(';').length >= first.split(',').length) ? ';' : ',';
    const headers = parseCsvLine(first, sep).map(function (h) { return lower(h).replace(/\s+/g, ''); });
    return lines.slice(1).map(function (line, idx) {
      const cells = parseCsvLine(line, sep);
      const obj = { _rowNumber: idx + 2 };
      headers.forEach(function (h, i) { obj[h] = str(cells[i]); });
      return normalizeBankRow(obj);
    }).filter(function (r) { return r.date || r.description || r.amount !== 0; });
  }

  function pick(raw, keys) {
    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i];
      if (raw[k] != null && str(raw[k]) !== '') return raw[k];
    }
    return '';
  }

  function rowHash(input) {
    const base = [input.date, input.valueDate, input.amount, input.reference, input.description, input.account].map(str).join('|');
    let h = 0;
    for (let i = 0; i < base.length; i += 1) h = ((h << 5) - h) + base.charCodeAt(i) | 0;
    return 'bank_' + Math.abs(h);
  }

  function normalizeBankRow(raw) {
    const date = iso(pick(raw, ['data', 'datacontabile', 'datamovimento', 'date', 'operationdate']));
    const valueDate = iso(pick(raw, ['datavaluta', 'valuta', 'valuedate']));
    const income = num(pick(raw, ['entrata', 'accredito', 'avere', 'income', 'credit']));
    const expense = num(pick(raw, ['uscita', 'addebito', 'dare', 'expense', 'debit']));
    let amount = num(pick(raw, ['importo', 'amount', 'totale', 'movimento']));
    if (!amount && (income || expense)) amount = Math.abs(income) - Math.abs(expense);
    const direction = amount < 0 || expense > 0 ? 'out' : 'in';
    const normalized = {
      id: str(raw.id) || '',
      rowNumber: raw._rowNumber || raw.rowNumber || '',
      date: date || todayIso(),
      valueDate: valueDate || '',
      amount: Math.abs(round2(amount)),
      direction: direction,
      signedAmount: round2(direction === 'out' ? -Math.abs(amount || expense) : Math.abs(amount || income)),
      account: str(pick(raw, ['conto', 'banca', 'account', 'iban'])) || 'Banca',
      reference: str(pick(raw, ['riferimento', 'cro', 'trn', 'idoperazione', 'reference', 'transactionid'])),
      description: str(pick(raw, ['descrizione', 'causale', 'description', 'note', 'notes']))
    };
    normalized.rowHash = rowHash(normalized);
    normalized.id = normalized.id || normalized.rowHash;
    return normalized;
  }

  function existingReconciledHashes(data) {
    const d = data || {};
    const set = {};
    arr(d.bankReconciliationEvents != null ? d.bankReconciliationEvents : getDataSafe('bankReconciliationEvents')).forEach(function (e) {
      if (e && e.bankRowHash) set[str(e.bankRowHash)] = true;
    });
    return set;
  }

  function getOpenDocsByType(subjectType, data) {
    const d = data || {};
    const subjects = subjectType === 'supplier' ? arr(d.suppliers != null ? d.suppliers : getDataSafe('suppliers')) : arr(d.customers != null ? d.customers : getDataSafe('customers'));
    let out = [];
    if (!win.PaymentEventsService || typeof win.PaymentEventsService.buildOpenDocuments !== 'function') return out;
    subjects.forEach(function (s) {
      const docs = win.PaymentEventsService.buildOpenDocuments(subjectType, str(s.id), d).map(function (doc) {
        return Object.assign({}, doc, { subjectType: subjectType, subjectId: str(s.id), subjectName: subjectName(s, subjectType === 'supplier' ? 'Fornitore' : 'Cliente') });
      });
      out = out.concat(docs);
    });
    return out;
  }

  function scoreCandidate(row, doc) {
    let score = 0;
    const diff = Math.abs(round2(row.amount - doc.residual));
    if (diff < 0.01) score += 60;
    else if (diff <= 1) score += 40;
    else if (diff <= 5) score += 20;
    else if (row.amount <= doc.residual + 0.01) score += 10;
    const hay = lower([row.description, row.reference].join(' '));
    const name = lower(doc.subjectName);
    const numDoc = lower(doc.number);
    if (name && hay.indexOf(name) >= 0) score += 25;
    if (numDoc && hay.indexOf(numDoc) >= 0) score += 15;
    if (doc.dueDate && row.date && row.date >= doc.dueDate) score += 5;
    return score;
  }

  function suggestMatches(bankRows, data) {
    const d = data || {};
    const reconciled = existingReconciledHashes(d);
    const customerDocs = getOpenDocsByType('customer', d);
    const supplierDocs = getOpenDocsByType('supplier', d);
    return arr(bankRows).map(function (row) {
      const docs = row.direction === 'out' ? supplierDocs : customerDocs;
      const candidates = docs.map(function (doc) {
        return Object.assign({}, doc, { score: scoreCandidate(row, doc), allocationAmount: round2(Math.min(row.amount, doc.residual)) });
      }).filter(function (c) { return c.score >= 20 && c.allocationAmount > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
      return Object.assign({}, row, { reconciled: !!reconciled[row.rowHash], candidates: candidates, suggested: candidates[0] || null });
    });
  }

  function buildPaymentEventFromMatch(row, candidate, options) {
    const c = candidate || {};
    const amount = round2((options && options.amount) || c.allocationAmount || Math.min(row.amount, c.residual || row.amount));
    if (!(amount > 0)) throw new Error('Importo riconciliazione non valido.');
    return {
      id: uid('payev_reco'),
      type: c.subjectType === 'supplier' ? 'supplier_payment' : 'customer_receipt',
      subjectType: c.subjectType === 'supplier' ? 'supplier' : 'customer',
      subjectId: str(c.subjectId),
      date: row.date || todayIso(),
      valueDate: row.valueDate || '',
      amount: amount,
      method: row.account || 'Banca',
      reference: row.reference || row.rowHash,
      notes: 'Riconciliazione banca 0.3.5: ' + str(row.description),
      source: 'bank-reconciliation-0.3.5',
      allocations: [{ documentType: c.documentType, documentId: c.documentId, documentNumber: c.number, amount: amount }]
    };
  }

  function buildReconciliationEvent(row, candidate, paymentEvent) {
    return {
      id: uid('reco'),
      bankRowHash: row.rowHash,
      bankDate: row.date,
      bankValueDate: row.valueDate || '',
      bankAmount: row.amount,
      bankDirection: row.direction,
      bankAccount: row.account,
      bankReference: row.reference,
      bankDescription: row.description,
      subjectType: candidate.subjectType,
      subjectId: candidate.subjectId,
      subjectName: candidate.subjectName,
      documentType: candidate.documentType,
      documentId: candidate.documentId,
      documentNumber: candidate.number,
      paymentEventId: paymentEvent.id,
      amount: paymentEvent.amount,
      status: 'confirmed',
      source: 'bank-reconciliation-0.3.5',
      createdAt: new Date().toISOString()
    };
  }

  function summarize(rows) {
    const list = arr(rows);
    const s = { count: list.length, incoming: 0, outgoing: 0, suggested: 0, reconciled: 0, unmatched: 0 };
    list.forEach(function (r) {
      if (r.direction === 'out') s.outgoing = round2(s.outgoing + r.amount); else s.incoming = round2(s.incoming + r.amount);
      if (r.reconciled) s.reconciled += 1;
      else if (r.suggested) s.suggested += 1;
      else s.unmatched += 1;
    });
    return s;
  }

  win.BankReconciliationService = {
    parseCsv,
    normalizeBankRow,
    suggestMatches,
    buildPaymentEventFromMatch,
    buildReconciliationEvent,
    summarize,
    _private: { rowHash, scoreCandidate, getOpenDocsByType, round2 }
  };
})();
