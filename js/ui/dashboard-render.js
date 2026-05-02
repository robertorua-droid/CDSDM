// dashboard-render.js

function renderStatisticsPage() {
    const container = $('#stats-table-container').empty();
    const companyInfoStats = getCurrentCompanyInfo();
    const showForfettarioSimulation = getTaxRegimeCapabilities(companyInfoStats).canUseLmSimulation;

    const selectedYear = ($('#stats-year-filter').length ? ($('#stats-year-filter').val() || 'all') : 'all');
    const inSelectedYear = (inv) => {
        if (selectedYear === 'all') return true;
        return (inv.date && typeof inv.date === 'string' && inv.date.substring(0, 4) === String(selectedYear));
    };
    const facts = getData('invoices').filter(i => inSelectedYear(i) && (i.type === 'Fattura' || i.type === undefined || i.type === ''));
    const notes = getData('invoices').filter(i => inSelectedYear(i) && i.type === 'Nota di Credito');

    if (facts.length === 0) {
        container.html('<div class="alert alert-info">Nessun dato.</div>');
        if (showForfettarioSimulation) renderTaxSimulation(0, 0);
        else $('#tax-simulation-container').empty();
        return;
    }

    const totF = facts.reduce((s, i) => s + safeFloat(i.total), 0);
    const totN = notes.reduce((s, i) => s + safeFloat(i.total), 0);
    const net = totF - totN;

    let cust = {};
    facts.forEach(i => {
        const c = String(i.customerId);
        if (!cust[c]) cust[c] = 0;
        cust[c] += safeFloat(i.total)
    });
    notes.forEach(i => {
        const c = String(i.customerId);
        if (cust[c]) cust[c] -= safeFloat(i.total)
    });

    let h = `<h5>Dettaglio Clienti</h5><table class="table table-striped table-sm">
<thead><tr><th>Cliente</th><th>Fatturato Netto</th><th>% sul Totale</th></tr></thead><tbody>`;
    Object.keys(cust)
        .sort((a, b) => cust[b] - cust[a])
        .forEach(cid => {
            const c = getData('customers').find(x => String(x.id) === String(cid)) || { name: '?' };
            const tot = cust[cid];
            const perc = net > 0 ? (tot / net) * 100 : 0;
            h += `<tr><td>${c.name}</td><td>€ ${tot.toFixed(2)}</td><td>${perc.toFixed(1)}%</td></tr>`;
        });
    h += `<tr class="fw-bold"><td>TOTALE</td><td>€ ${net.toFixed(2)}</td><td>100%</td></tr></tbody></table>`;
    container.html(h);

    const impF = facts.reduce((s, i) => s + safeFloat(i.totaleImponibile || i.total), 0);
    const impN = notes.reduce((s, i) => s + safeFloat(i.totaleImponibile || i.total), 0);
    if (showForfettarioSimulation) renderTaxSimulation(impF, impN);
    else $('#tax-simulation-container').empty();
}

function renderTaxSimulation(fatturatoImponibile, noteCreditoImponibile) {
    const container = $('#tax-simulation-container').empty();
    const comp = getCurrentCompanyInfo();
    const coeff = safeFloat(comp.coefficienteRedditivita);
    const taxRate = safeFloat(comp.aliquotaSostitutiva);
    const inpsRate = safeFloat(comp.aliquotaContributi);

    if (!coeff || !taxRate || !inpsRate) {
        container.html('<div class="alert alert-warning">Dati mancanti.</div>');
        return;
    }

    const grossRevenue = fatturatoImponibile - noteCreditoImponibile;
    const taxableIncome = grossRevenue * (coeff / 100);
    const socialSecurity = taxableIncome * (inpsRate / 100);
    const netTaxable = taxableIncome - socialSecurity;
    const tax = (netTaxable > 0) ? netTaxable * (taxRate / 100) : 0;
    const totalDue = socialSecurity + tax;

    const html = `
<div class="row">
  <div class="col-md-6">
    <h5>Simulazione Contributi INPS</h5>
    <table class="table table-sm">
      <tr><th>Reddito Lordo Imponibile</th><td>€ ${taxableIncome.toFixed(2)}</td></tr>
      <tr><th>Aliquota Contributi INPS</th><td>${inpsRate}%</td></tr>
      <tr><th>Contributi Totali Previsti</th><td>€ ${socialSecurity.toFixed(2)}</td></tr>
      <tr><th>Stima Primo Acconto (40%)</th><td>€ ${(socialSecurity * 0.4).toFixed(2)}</td></tr>
      <tr><th>Stima Secondo Acconto (40%)</th><td>€ ${(socialSecurity * 0.4).toFixed(2)}</td></tr>
    </table>
  </div>
  <div class="col-md-6">
    <h5>Simulazione Imposta Sostitutiva (IRPEF)</h5>
    <table class="table table-sm">
      <tr><th>Reddito Lordo Imponibile</th><td>€ ${taxableIncome.toFixed(2)}</td></tr>
      <tr><th>Contributi INPS Deducibili</th><td>- € ${socialSecurity.toFixed(2)}</td></tr>
      <tr><th>Reddito Netto Imponibile</th><td>€ ${netTaxable.toFixed(2)}</td></tr>
      <tr><th>Aliquota Imposta</th><td>${taxRate}%</td></tr>
      <tr><th>Imposta Totale Prevista</th><td>€ ${tax.toFixed(2)}</td></tr>
      <tr><th>Stima Primo Acconto (50%)</th><td>€ ${(tax * 0.5).toFixed(2)}</td></tr>
      <tr><th>Stima Secondo Acconto (50%)</th><td>€ ${(tax * 0.5).toFixed(2)}</td></tr>
      <tr class="table-primary fw-bold"><th>Totale Uscite Stimate (Contributi + Imposte)</th><td>€ ${totalDue.toFixed(2)}</td></tr>
    </table>
  </div>
</div>`;

    container.html(html);
}

function _dashPad2(n) {
    n = parseInt(n, 10) || 0;
    return (n < 10 ? '0' : '') + String(n);
}

function _dashFormatHoursFromMinutes(mins) {
    const m = Math.max(0, parseInt(mins, 10) || 0);
    const h = m / 60;
    // formato italiano con 2 decimali
    try {
        return h.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' h';
    } catch (e) {
        return (Math.round(h * 100) / 100).toFixed(2) + ' h';
    }
}

function _dashFormatDateIT(iso) {
    if (!iso || typeof iso !== 'string' || iso.length < 10) return '';
    const y = iso.substring(0, 4);
    const m = iso.substring(5, 7);
    const d = iso.substring(8, 10);
    return d + '/' + m + '/' + y;
}

function _dashMonthName(m) {
    const names = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const i = (parseInt(m, 10) || 1) - 1;
    return names[i] || ('Mese ' + m);
}

function refreshDashboardFilters() {
    const $year = $('#dash-year');
    const $month = $('#dash-month');
    const $mode = $('#dash-mode');
    if (!$year.length || !$month.length || !$mode.length) return;

    const prevYear = String($year.val() || '').trim();
    const prevMonth = String($month.val() || '').trim();

    const yearsSet = new Set();
    const addYearFromDate = (d) => {
        if (!d || typeof d !== 'string' || d.length < 4) return;
        const y = d.substring(0, 4);
        if (/^\d{4}$/.test(y)) yearsSet.add(y);
    };

    (getData('worklogs') || []).forEach(w => addYearFromDate(w.date));
    (getData('invoices') || []).forEach(i => addYearFromDate(i.date));
    (getData('purchases') || []).forEach(p => addYearFromDate(p.date));

    const currentYear = String(new Date().getFullYear());
    yearsSet.add(currentYear);

    const years = Array.from(yearsSet).sort().reverse();
    $year.empty();
    years.forEach(y => $year.append(`<option value="${y}">${y}</option>`));

    if (prevYear && years.includes(prevYear)) $year.val(prevYear);
    else if (years.includes(currentYear)) $year.val(currentYear);
    else if (years.length) $year.val(years[0]);

    $month.empty();
    for (let m = 1; m <= 12; m++) {
        const mm = _dashPad2(m);
        $month.append(`<option value="${mm}">${_dashMonthName(m)}</option>`);
    }
    const currentMonth = _dashPad2(new Date().getMonth() + 1);
    if (prevMonth && $month.find(`option[value="${prevMonth}"]`).length) $month.val(prevMonth);
    else $month.val(currentMonth);

    // Default mode
    const modeVal = String($mode.val() || '').trim();
    if (modeVal !== 'year' && modeVal !== 'month') {
        $mode.val('year');
    }

    // show/hide mese
    if (String($mode.val()) === 'month') $('#dash-month-wrap').show();
    else $('#dash-month-wrap').hide();
}

function renderDashboardPage() {
    const $container = $('#dashboard-container');
    if (!$container.length) return;

    refreshDashboardFilters();

    const mode = String($('#dash-mode').val() || 'year');
    const year = String($('#dash-year').val() || String(new Date().getFullYear()));
    const month = String($('#dash-month').val() || _dashPad2(new Date().getMonth() + 1));

    let start = year + '-01-01';
    let end = year + '-12-31';

    if (mode === 'month') {
        const m = parseInt(month, 10) || (new Date().getMonth() + 1);
        const startDate = new Date(parseInt(year, 10), m - 1, 1);
        const endDate = new Date(parseInt(year, 10), m, 0);
        start = startDate.toISOString().slice(0, 10);
        end = endDate.toISOString().slice(0, 10);
    }

    if (!window.ExecutiveDashboardService || typeof window.ExecutiveDashboardService.computeDashboardSummary !== 'function') {
        $container.html('<div class="alert alert-warning">Servizio Dashboard Direzionale non disponibile.</div>');
        return;
    }

    const summary = window.ExecutiveDashboardService.computeDashboardSummary({ start: start, end: end, mode: mode });
    const periodLabel = (mode === 'month') ? (_dashMonthName(parseInt(month, 10)) + ' ' + year) : ('Anno ' + year);

    const fmtMoney = function (value) {
        const n = (typeof window.safeFloat === 'function') ? window.safeFloat(value) : (parseFloat(value) || 0);
        try { return n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }); }
        catch (e) { return '€ ' + n.toFixed(2); }
    };
    const fmtNum = function (value) {
        const n = parseInt(value, 10) || 0;
        try { return n.toLocaleString('it-IT'); } catch (e) { return String(n); }
    };
    const esc = (typeof window.escapeHtml === 'function') ? window.escapeHtml : function (v) {
        return String(v == null ? '' : v).replace(/[&<>"]/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]; });
    };

    const marginClass = summary.estimatedGrossMargin >= 0 ? 'text-success' : 'text-danger';
    const uninvoicedHours = _dashFormatHoursFromMinutes(summary.uninvoicedMinutes);

    const kpiHtml = `
      <div class="alert alert-info shadow-sm">
        <strong>Dashboard Direzionale 0.2.1.</strong>
        Vista sintetica calcolata dai dati già presenti in archivio: fatture, acquisti, magazzino, DDT, ordini e timesheet. Nessuna nuova collezione Firestore.
      </div>
      <div class="row g-3 mb-3">
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Fatturato netto</div>
              <div class="display-6">${fmtMoney(summary.revenue)}</div>
              <div class="small text-muted">Note credito incluse: ${fmtMoney(summary.creditNotes)}</div>
              <div class="small text-muted">${esc(periodLabel)} · ${_dashFormatDateIT(start)} - ${_dashFormatDateIT(end)}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Acquisti / costi periodo</div>
              <div class="display-6">${fmtMoney(summary.purchases)}</div>
              <div class="small text-muted">Margine lordo stimato</div>
              <div class="h5 ${marginClass}">${fmtMoney(summary.estimatedGrossMargin)}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Scadenze aperte</div>
              <div class="display-6">${fmtMoney(summary.openReceivables)}</div>
              <div class="small text-muted">Clienti scaduti: <b>${fmtMoney(summary.overdueReceivables)}</b></div>
              <div class="small text-muted">Fornitori aperti: <b>${fmtMoney(summary.openPayables)}</b></div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Valore magazzino</div>
              <div class="display-6">${fmtMoney(summary.inventory.totalValue)}</div>
              <div class="small text-muted">Disponibile: <b>${fmtMoney(summary.inventory.availableValue)}</b></div>
              <div class="small text-muted">Quarantena: <b>${fmtMoney(summary.inventory.quarantineValue)}</b></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-md-6 col-xl-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">DDT cliente da fatturare</div><div class="h2 mb-0">${fmtNum(summary.openCustomerDDTs.length)}</div><div class="small text-muted">documenti non ancora collegati a fattura</div></div></div></div>
        <div class="col-12 col-md-6 col-xl-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Ordini cliente aperti</div><div class="h2 mb-0">${fmtNum(summary.openCustomerOrders.length)}</div><div class="small text-muted">non evasi/annullati</div></div></div></div>
        <div class="col-12 col-md-6 col-xl-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Ordini fornitore aperti</div><div class="h2 mb-0">${fmtNum(summary.openSupplierOrders.length)}</div><div class="small text-muted">non ricevuti/completati</div></div></div></div>
        <div class="col-12 col-md-6 col-xl-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Timesheet non fatturato</div><div class="h2 mb-0">${esc(uninvoicedHours)}</div><div class="small text-muted">ore fatturabili prive di fattura</div></div></div></div>
      </div>
    `;

    const trendRows = summary.byPeriod.map(function (r) {
        return `<tr>
          <td>${esc(mode === 'month' ? _dashFormatDateIT(r.key) : r.key)}</td>
          <td class="text-end">${fmtMoney(r.revenue)}</td>
          <td class="text-end">${fmtMoney(r.purchases)}</td>
          <td class="text-end ${r.margin >= 0 ? 'text-success' : 'text-danger'}">${fmtMoney(r.margin)}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="4" class="text-muted">Nessun dato economico nel periodo selezionato.</td></tr>';

    const topCustomerRows = summary.topCustomers.map(function (r) {
        return `<tr><td>${esc(r.name)}</td><td class="text-end">${fmtMoney(r.total)}</td></tr>`;
    }).join('') || '<tr><td colspan="2" class="text-muted">Nessun cliente nel periodo selezionato.</td></tr>';

    const openDdtRows = summary.openCustomerDDTs.slice(0, 8).map(function (d) {
        return `<tr><td>${esc(d.number || d.numero || d.id)}</td><td>${esc(d.date || d.data || '')}</td><td>${esc(d.customerName || d.clienteNome || '')}</td></tr>`;
    }).join('') || '<tr><td colspan="3" class="text-muted">Nessun DDT cliente da fatturare.</td></tr>';

    const detailHtml = `
      <div class="row g-3">
        <div class="col-12 col-xl-7">
          <div class="card shadow-sm mb-3">
            <div class="card-header"><strong>Andamento direzionale</strong></div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-sm mb-0">
                  <thead><tr><th>${mode === 'month' ? 'Giorno' : 'Periodo'}</th><th class="text-end">Fatturato</th><th class="text-end">Acquisti</th><th class="text-end">Margine stimato</th></tr></thead>
                  <tbody>${trendRows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-5">
          <div class="card shadow-sm mb-3">
            <div class="card-header"><strong>Top clienti per fatturato</strong></div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-sm mb-0">
                  <thead><tr><th>Cliente</th><th class="text-end">Totale</th></tr></thead>
                  <tbody>${topCustomerRows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-12 col-xl-7">
          <div class="card shadow-sm mb-3">
            <div class="card-header"><strong>DDT cliente da fatturare</strong></div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-sm mb-0">
                  <thead><tr><th>Numero</th><th>Data</th><th>Cliente</th></tr></thead>
                  <tbody>${openDdtRows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-5">
          <div class="card shadow-sm mb-3">
            <div class="card-header"><strong>Alert operativi</strong></div>
            <div class="card-body">
              <ul class="mb-0">
                <li>Prodotti sotto scorta: <strong>${fmtNum(summary.inventory.lowStockCount)}</strong></li>
                <li>Valore merce in quarantena: <strong>${fmtMoney(summary.inventory.quarantineValue)}</strong></li>
                <li>Scadenze clienti scadute: <strong>${fmtMoney(summary.overdueReceivables)}</strong></li>
                <li>Scadenze fornitori scadute: <strong>${fmtMoney(summary.overduePayables)}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    $container.html(kpiHtml + detailHtml);
}

window.renderStatisticsPage = renderStatisticsPage;
window.renderTaxSimulation = renderTaxSimulation;
window.refreshDashboardFilters = refreshDashboardFilters;
window.renderDashboardPage = renderDashboardPage;
