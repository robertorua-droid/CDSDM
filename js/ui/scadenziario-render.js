// scadenziario-render.js
// CDSDM 0.2.2 - Scadenzario evoluto clienti/fornitori

function renderScadenziarioPage() {
    const sec = $('#scadenziario');
    if (sec.length === 0) return;

    const company = getCurrentCompanyInfo();
    const periodicita = (company.ivaPeriodicita || 'mensile');

    const today = new Date();
    const isoToday = today.toISOString().slice(0, 10);
    const plus60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const fromEl = $('#scad-from');
    const toEl = $('#scad-to');
    if (fromEl.val() === '') fromEl.val(isoToday);
    if (toEl.val() === '') toEl.val(plus60);

    const from = new Date(fromEl.val());
    const to = new Date(toEl.val());
    to.setHours(23, 59, 59, 999);
    const showIncassi = $('#scad-show-incassi').is(':checked');
    let showPagamenti = $('#scad-show-pagamenti').is(':checked');
    let showIVA = $('#scad-show-iva').is(':checked');
    let showIvaCrediti = $('#scad-show-iva-crediti').is(':checked');

    const scadenziarioVisibility = getTaxRegimeUiVisibility(company).scadenziario || { showPurchasePayments: false, showVatDeadlines: false };
    if (!scadenziarioVisibility.showPurchasePayments) showPagamenti = false;
    if (!scadenziarioVisibility.showVatDeadlines) {
        showIVA = false;
        showIvaCrediti = false;
    }

    const typeFilter = $('#scad-type-filter').val() || 'all';
    const statusFilter = $('#scad-status-filter').val() || 'open';
    const subjectFilter = $('#scad-subject-filter').val() || '';

    const customers = getData('customers') || [];
    const invoices = (getData('invoices') || []);
    const suppliers = scadenziarioVisibility.showPurchasePayments ? (getData('suppliers') || []) : [];
    const purchases = scadenziarioVisibility.showPurchasePayments ? (getData('purchases') || []) : [];

    let items = [];
    if (window.ScadenziarioService && typeof window.ScadenziarioService.buildItems === 'function') {
        items = window.ScadenziarioService.buildItems({ customers, invoices, suppliers, purchases }, {
            from: fromEl.val(),
            to: toEl.val(),
            today: isoToday,
            showIncassi,
            showPagamenti,
            showIVA: false,
            showIvaCrediti: false,
            filters: { type: typeFilter, status: statusFilter, subject: subjectFilter }
        });
    }

    function inRange(dateStr) {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        return d >= from && d <= to;
    }
    function fmtMoney(n) {
        return (safeFloat(n)).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function rawPaymentStatus(doc, kind) {
        if (window.ScadenziarioService && window.ScadenziarioService._internals) {
            return window.ScadenziarioService._internals.resolvePaymentStatus(doc, kind);
        }
        return doc && doc.status === 'Pagata' ? 'Pagata' : (kind === 'invoice' ? 'Da Incassare' : 'Da Pagare');
    }
    function passesExtraFilters(item) {
        const st = statusFilter || 'open';
        const tp = typeFilter || 'all';
        const q = String(subjectFilter || '').toLowerCase();
        if (tp !== 'all' && item.entity !== tp && item.kindCode !== tp) return false;
        if (st === 'open' && item.isClosed) return false;
        if (st === 'overdue' && !item.overdue) return false;
        if (st === 'partial' && item.status !== 'Parziale') return false;
        if (st === 'closed' && !item.isClosed) return false;
        if (q && String([item.soggetto, item.doc, item.kind, item.status].join(' ')).toLowerCase().indexOf(q) === -1) return false;
        return true;
    }

    // Scadenze IVA didattiche: mantenute come vista derivata, filtrabili come tipo IVA.
    if (showIVA && (typeFilter === 'all' || typeFilter === 'vat')) {
        const normInvoices = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeInvoiceStatusInfo === 'function') ? invoices.map(function (inv) { return window.DomainNormalizers.normalizeInvoiceStatusInfo(inv); }) : invoices;
        const normPurchases = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizePurchaseInfo === 'function') ? purchases.map(function (p) { return window.DomainNormalizers.normalizePurchaseInfo(p); }) : purchases;
        const getYM = (dateStr) => {
            if (!dateStr || typeof dateStr !== 'string' || dateStr.length < 7) return { y: NaN, m: NaN };
            return { y: parseInt(dateStr.slice(0, 4), 10), m: parseInt(dateStr.slice(5, 7), 10) };
        };
        const quarterOf = (m) => Math.floor((m - 1) / 3) + 1;
        function calcSaldoMensile(y, m) {
            let ivaDebito = 0;
            let ivaCredito = 0;
            normInvoices.forEach(inv => {
                if (!inv || !inv.date) return;
                const ym = getYM(inv.date);
                if (ym.y !== y || ym.m !== m) return;
                const sign = (inv.type === 'Nota di Credito') ? -1 : 1;
                ivaDebito += sign * safeFloat(inv.ivaTotale || 0);
            });
            normPurchases.forEach(p => {
                if (!p || !p.date) return;
                const ym = getYM(p.date);
                if (ym.y !== y || ym.m !== m) return;
                ivaCredito += safeFloat(p.ivaTotale || 0);
            });
            return ivaDebito - ivaCredito;
        }
        function calcSaldoTrimestrale(y, q) {
            let ivaDebito = 0;
            let ivaCredito = 0;
            normInvoices.forEach(inv => {
                if (!inv || !inv.date) return;
                const ym = getYM(inv.date);
                if (ym.y !== y || quarterOf(ym.m) !== q) return;
                const sign = (inv.type === 'Nota di Credito') ? -1 : 1;
                ivaDebito += sign * safeFloat(inv.ivaTotale || 0);
            });
            normPurchases.forEach(p => {
                if (!p || !p.date) return;
                const ym = getYM(p.date);
                if (ym.y !== y || quarterOf(ym.m) !== q) return;
                ivaCredito += safeFloat(p.ivaTotale || 0);
            });
            return ivaDebito - ivaCredito;
        }
        function pushVat(due, label, amount, id) {
            if (!inRange(due)) return;
            if (!(amount > 0 || (showIvaCrediti && amount !== 0))) return;
            const status = amount > 0 ? 'Da versare' : 'Credito';
            const it = {
                date: due,
                kind: 'IVA',
                kindCode: 'vat',
                soggetto: 'Erario',
                doc: label,
                amount: safeFloat(amount),
                paidAmount: 0,
                residualAmount: safeFloat(amount),
                status: status,
                entity: 'vat',
                id: id,
                isClosed: status === 'Credito',
                overdue: (amount > 0) && (new Date(due) < new Date(isoToday))
            };
            if (passesExtraFilters(it)) items.push(it);
        }
        if (periodicita === 'trimestrale') {
            const yStart = from.getFullYear() - 1;
            const yEnd = to.getFullYear() + 1;
            for (let dueYear = yStart; dueYear <= yEnd; dueYear++) {
                [
                    { due: `${dueYear}-05-16`, perY: dueYear, q: 1 },
                    { due: `${dueYear}-08-16`, perY: dueYear, q: 2 },
                    { due: `${dueYear}-11-16`, perY: dueYear, q: 3 },
                    { due: `${dueYear}-03-16`, perY: dueYear - 1, q: 4 }
                ].forEach(c => pushVat(c.due, `IVA ${c.perY} Q${c.q}`, calcSaldoTrimestrale(c.perY, c.q), `${c.perY}-${c.q}`));
            }
        } else {
            const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
            const endMonth = new Date(to.getFullYear(), to.getMonth(), 1);
            while (cursor <= endMonth) {
                const dueYear = cursor.getFullYear();
                const dueMonth = cursor.getMonth() + 1;
                const due = `${dueYear}-${String(dueMonth).padStart(2, '0')}-16`;
                let perY = dueYear;
                let perM = dueMonth - 1;
                if (perM === 0) { perM = 12; perY = dueYear - 1; }
                pushVat(due, `IVA ${perY}-${String(perM).padStart(2, '0')}`, calcSaldoMensile(perY, perM), `${perY}-${perM}`);
                cursor.setMonth(cursor.getMonth() + 1);
            }
        }
    }

    items.sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.kind || '').localeCompare(b.kind || ''));
    try { window._lastScadenziarioItems = (items || []).slice(); } catch (e) { }

    const summary = (window.ScadenziarioService && typeof window.ScadenziarioService.summarize === 'function') ? window.ScadenziarioService.summarize(items) : null;
    if ($('#scadenziario-summary').length && summary) {
        const balanceClass = summary.balance >= 0 ? 'text-success' : 'text-danger';
        $('#scadenziario-summary').html(`
          <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Da incassare clienti</div><div class="fs-5 fw-bold text-success">€ ${fmtMoney(summary.customerReceivables)}</div></div></div></div>
          <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Da pagare fornitori</div><div class="fs-5 fw-bold text-danger">€ ${fmtMoney(summary.supplierPayables)}</div></div></div></div>
          <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Saldo operativo</div><div class="fs-5 fw-bold ${balanceClass}">€ ${fmtMoney(summary.balance)}</div></div></div></div>
          <div class="col-md-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">Scadute / parziali</div><div class="fs-5 fw-bold">${summary.overdueCount} / ${summary.partialCount}</div></div></div></div>
        `);
    }

    const tbody = $('#scadenziario-table-body');
    if (items.length === 0) {
        tbody.html('<tr><td colspan="9" class="text-center text-muted py-4">Nessuna scadenza nel periodo e nei filtri selezionati.</td></tr>');
        return;
    }

    const rows = items.map(it => {
        const badgeType = it.entity === 'invoice'
            ? '<span class="badge bg-success">Incasso</span>'
            : (it.entity === 'purchase'
                ? '<span class="badge bg-danger">Pagamento</span>'
                : '<span class="badge bg-primary">IVA</span>');
        let badgeStatus = '<span class="badge bg-warning text-dark">' + escapeHtml(it.status) + '</span>';
        if (it.status === 'Pagata') badgeStatus = '<span class="badge bg-success">Pagata</span>';
        if (it.status === 'Parziale') badgeStatus = '<span class="badge bg-info text-dark">Parziale</span>';
        if (it.status === 'Credito') badgeStatus = '<span class="badge bg-info text-dark">Credito</span>';
        const trClass = it.overdue ? 'table-danger' : '';
        let actions = '';
        if (it.entity === 'invoice' && it.status !== 'Pagata') {
            actions = `<button class="btn btn-sm btn-success btn-scad-register-payment" data-entity="invoice" data-id="${escapeHtml(it.id)}" data-residual="${safeFloat(it.residualAmount)}" title="Registra incasso"><i class="fas fa-euro-sign"></i></button>
                       <button class="btn btn-sm btn-outline-success btn-scad-mark-invoice-paid" data-id="${escapeHtml(it.id)}" title="Salda"><i class="fas fa-check"></i></button>`;
        } else if (it.entity === 'purchase' && it.status !== 'Pagata') {
            actions = `<button class="btn btn-sm btn-danger btn-scad-register-payment" data-entity="purchase" data-id="${escapeHtml(it.id)}" data-residual="${safeFloat(it.residualAmount)}" title="Registra pagamento"><i class="fas fa-euro-sign"></i></button>
                       <button class="btn btn-sm btn-outline-success btn-scad-toggle-purchase-status" data-id="${escapeHtml(it.id)}" title="Salda"><i class="fas fa-check"></i></button>`;
        } else if (it.entity === 'purchase') {
            actions = `<button class="btn btn-sm btn-outline-secondary btn-scad-toggle-purchase-status" data-id="${escapeHtml(it.id)}" title="Riapri"><i class="fas fa-undo"></i></button>`;
        } else {
            actions = '<span class="text-muted">—</span>';
        }
        return `
          <tr class="${trClass}">
            <td>${escapeHtml(it.date)}</td>
            <td>${badgeType}</td>
            <td>${escapeHtml(it.soggetto)}</td>
            <td>${escapeHtml(it.doc)}</td>
            <td class="text-end">${fmtMoney(it.amount)}</td>
            <td class="text-end">${fmtMoney(it.paidAmount || 0)}</td>
            <td class="text-end fw-semibold">${fmtMoney(it.residualAmount != null ? it.residualAmount : it.amount)}</td>
            <td>${badgeStatus}</td>
            <td class="text-end"><div class="btn-group btn-group-sm">${actions}</div></td>
          </tr>
        `;
    }).join('');

    tbody.html(rows);
}

window.renderScadenziarioPage = renderScadenziarioPage;
