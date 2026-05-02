// js/features/scadenziario/scadenziario-module.js
// CDSDM 0.2.2 - Scadenzario evoluto clienti/fornitori

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.scadenziario = window.AppModules.scadenziario || {};

  let _bound = false;

  function refreshScadenziarioFallback() {
    try {
      if (typeof renderScadenziarioPage === 'function') renderScadenziarioPage();
      if (typeof renderInvoicesTable === 'function') renderInvoicesTable();
      if (typeof renderPurchasesTable === 'function') renderPurchasesTable();
    } catch (e) { }
  }

  function refreshAfterSave(entity) {
    try {
      if (entity === 'invoice' && window.UiRefresh && typeof window.UiRefresh.refreshInvoicesAnalysisAndScadenziario === 'function') {
        window.UiRefresh.refreshInvoicesAnalysisAndScadenziario();
        return;
      }
      if (entity === 'purchase' && window.UiRefresh && typeof window.UiRefresh.refreshPurchasesAnalysisAndScadenziario === 'function') {
        window.UiRefresh.refreshPurchasesAnalysisAndScadenziario();
        return;
      }
      refreshScadenziarioFallback();
    } catch (e) {
      refreshScadenziarioFallback();
    }
  }

  function parsePositiveAmount(raw) {
    const n = Number(String(raw == null ? '' : raw).replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  async function registerPayment(entity, id, residualHint) {
    const collection = entity === 'purchase' ? 'purchases' : 'invoices';
    const kind = entity === 'purchase' ? 'purchase' : 'invoice';
    const doc = (getData(collection) || []).find((x) => String(x.id) === String(id));
    if (!doc) return;
    const residual = Number(residualHint || ((window.ScadenziarioService && window.ScadenziarioService._internals) ? window.ScadenziarioService._internals.residualAmount(doc, kind) : 0));
    const defaultAmount = residual > 0 ? residual.toFixed(2).replace('.', ',') : '';
    const label = entity === 'purchase' ? 'pagamento fornitore' : 'incasso cliente';
    const rawAmount = window.prompt('Importo ' + label + ' da registrare:', defaultAmount);
    if (rawAmount === null) return;
    const amount = parsePositiveAmount(rawAmount);
    if (!(amount > 0)) {
      alert('Importo non valido.');
      return;
    }
    const paymentDate = window.prompt('Data ' + label + ' (AAAA-MM-GG):', new Date().toISOString().slice(0, 10));
    if (paymentDate === null) return;
    const note = window.prompt('Nota facoltativa:', '') || '';
    if (!window.ScadenziarioService || typeof window.ScadenziarioService.buildPaymentPatch !== 'function') {
      alert('Servizio scadenzario non disponibile.');
      return;
    }
    const patch = window.ScadenziarioService.buildPaymentPatch(doc, kind, amount, paymentDate, note);
    await saveDataToCloud(collection, patch, String(id));
    refreshAfterSave(entity);
  }

  function exportCsv() {
    try {
      const items = (window._lastScadenziarioItems || []).slice();
      if (!items.length) {
        alert('Nessun dato da esportare per il periodo selezionato.');
        return;
      }
      const from = String($('#scad-from').val() || '').trim();
      const to = String($('#scad-to').val() || '').trim();
      function cleanText(val) { return String(val ?? '').replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim(); }
      function formatDateIT(dateStr) {
        const s = cleanText(dateStr);
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
        if (m) return `${m[3]}/${m[2]}/${m[1]}`;
        return s;
      }
      function escapeCsvField(val) {
        const s = String(val ?? '');
        if (/[";\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      }
      function fmt(n) {
        const v = Number(n || 0);
        return Number.isFinite(v) ? v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : cleanText(n);
      }
      function downloadCsv(csvText, filename) {
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.download = filename;
        a.href = URL.createObjectURL(blob);
        a.click();
        URL.revokeObjectURL(a.href);
      }
      const header = ['Data', 'Tipo', 'Soggetto', 'Documento', 'Importo', 'Pagato/Incassato', 'Residuo', 'Stato'];
      const lines = [header.join(';')];
      items.forEach(it => {
        const row = [
          formatDateIT(it.date || ''), cleanText(it.kind || ''), cleanText(it.soggetto || ''), cleanText(it.doc || ''),
          fmt(it.amount), fmt(it.paidAmount), fmt(it.residualAmount), cleanText(it.status || '')
        ].map(escapeCsvField).join(';');
        lines.push(row);
      });
      const fn = `scadenziario_${from || 'da'}_${to || 'a'}.csv`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      downloadCsv(lines.join('\r\n'), fn);
    } catch (e) {
      console.error('Export scadenziario CSV error:', e);
      alert('Errore export CSV.');
    }
  }

  function bind() {
    if (_bound) return;
    _bound = true;

    $('#scadenziario').on('change keyup', '#scad-from, #scad-to, #scad-show-incassi, #scad-show-pagamenti, #scad-show-iva, #scad-show-iva-crediti, #scad-type-filter, #scad-status-filter, #scad-subject-filter', function () {
      try { if (typeof renderScadenziarioPage === 'function') renderScadenziarioPage(); } catch (e2) { }
    });

    $('#scadenziario').on('click', '#scad-export-csv-btn', exportCsv);

    $('#scadenziario-table-body').on('click', '.btn-scad-register-payment', async function () {
      const id = $(this).attr('data-id');
      const entity = $(this).attr('data-entity');
      const residual = $(this).attr('data-residual');
      await registerPayment(entity, id, residual);
    });

    $('#scadenziario-table-body').on('click', '.btn-scad-mark-invoice-paid', async function () {
      const id = $(this).attr('data-id');
      const invObjRaw = (getData('invoices') || []).find((i) => String(i.id) === String(id));
      if (!invObjRaw || invObjRaw.isCreditNote === true || invObjRaw.type === 'Nota di Credito') return;
      const total = (window.ScadenziarioService && window.ScadenziarioService._internals) ? window.ScadenziarioService._internals.residualAmount(invObjRaw, 'invoice') : 0;
      const patch = (window.ScadenziarioService && typeof window.ScadenziarioService.buildPaymentPatch === 'function' && total > 0)
        ? window.ScadenziarioService.buildPaymentPatch(invObjRaw, 'invoice', total, new Date().toISOString().slice(0, 10), 'Saldo da scadenzario')
        : { status: 'Pagata', isPaid: true };
      await saveDataToCloud('invoices', patch, String(id));
      refreshAfterSave('invoice');
    });

    $('#scadenziario-table-body').on('click', '.btn-scad-toggle-purchase-status', async function () {
      const id = $(this).attr('data-id');
      const p = (getData('purchases') || []).find((x) => String(x.id) === String(id));
      if (!p) return;
      const closed = String(p.status || '').toLowerCase() === 'pagata' || p.isPaid === true;
      let patch;
      if (closed) {
        patch = { status: 'Da Pagare', isPaid: false, paymentStatus: 'Da Pagare' };
      } else {
        const residual = (window.ScadenziarioService && window.ScadenziarioService._internals) ? window.ScadenziarioService._internals.residualAmount(p, 'purchase') : 0;
        patch = (window.ScadenziarioService && typeof window.ScadenziarioService.buildPaymentPatch === 'function' && residual > 0)
          ? window.ScadenziarioService.buildPaymentPatch(p, 'purchase', residual, new Date().toISOString().slice(0, 10), 'Saldo da scadenzario')
          : { status: 'Pagata', isPaid: true };
      }
      await saveDataToCloud('purchases', patch, String(id));
      refreshAfterSave('purchase');
    });
  }

  window.AppModules.scadenziario.bind = bind;
})();
