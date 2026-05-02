// masterdata-render.js

function getStoreValue(key, fallback) {
    if (window.AppStore && typeof window.AppStore.get === 'function') {
        const value = window.AppStore.get(key);
        if (value !== undefined && value !== null) return value;
    }
    if (typeof window.getData === 'function') return window.getData(key);
    return fallback;
}

// Bind (una sola volta) dei campi ricerca per Anagrafiche (Clienti/Fornitori)
let __anagraficheSearchBound = false;
function bindAnagraficheSearchOnce() {
    if (__anagraficheSearchBound) return;
    __anagraficheSearchBound = true;

    $('#customers-search-filter').off('input.custSearch').on('input.custSearch', function () {
        if (typeof renderCustomersTable === 'function') renderCustomersTable();
    });
    $('#customers-reset-search-btn').off('click.custSearch').on('click.custSearch', function () {
        try { $('#customers-search-filter').val(''); } catch (e) { }
        if (typeof renderCustomersTable === 'function') renderCustomersTable();
    });

    $('#suppliers-search-filter').off('input.supSearch').on('input.supSearch', function () {
        if (typeof renderSuppliersTable === 'function') renderSuppliersTable();
    });
    $('#suppliers-reset-search-btn').off('click.supSearch').on('click.supSearch', function () {
        try { $('#suppliers-search-filter').val(''); } catch (e) { }
        if (typeof renderSuppliersTable === 'function') renderSuppliersTable();
    });
}

function renderProductsTable() {
    const table = $('#products-table-body').empty();
    const ci = getStoreValue('companyInfo', {}) || {};
    const isForf = window.TaxRegimePolicy ? window.TaxRegimePolicy.isForfettario(ci) : false;
    const esc = (window.VatRateCatalog && window.VatRateCatalog.escapeHtml) ? window.VatRateCatalog.escapeHtml : function (v) { return String(v || ''); };

    const activeTypeFilter = String($('#products-type-filter .nav-link.active').attr('data-product-type-filter') || 'all');
    const products = (getStoreValue('products', []) || [])
        .map(pRaw => (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function')
            ? window.DomainNormalizers.normalizeProductInfo(pRaw)
            : (pRaw || {}))
        .filter(p => activeTypeFilter === 'all' || String(p.itemType || 'service') === activeTypeFilter);

    products.forEach(p => {
        const purchasePrice = p.purchasePrice === '' || p.purchasePrice == null ? '-' : '€ ' + parseFloat(p.purchasePrice || 0).toFixed(2);
        const salePrice = p.salePrice === '' || p.salePrice == null ? '-' : '€ ' + parseFloat(p.salePrice || 0).toFixed(2);
        const typeLabel = p.itemType === 'product' ? 'Prodotto' : (p.itemType === 'cost' ? 'Costo' : 'Servizio');
        const vatRate = (window.VatRateCatalog && typeof window.VatRateCatalog.resolve === 'function')
            ? window.VatRateCatalog.resolve(isForf ? { vatRateId: 'n2_2_forfettario' } : p, isForf ? 'n2_2_forfettario' : 'iva_22')
            : null;
        const vatLabel = vatRate ? vatRate.label : ((isForf ? '0' : (p.iva || '0')) + '%');
        const trackingLabels = { none: 'No lotto', lot: 'Lotto', serial: 'Matricola', expiry: 'Scadenza' };
        const trackingLabel = p.itemType === 'product' && p.trackingMode && p.trackingMode !== 'none' ? '<div class="small mt-1"><span class="badge text-bg-info">' + esc(trackingLabels[p.trackingMode] || p.trackingMode) + '</span></div>' : '';
        table.append(`
<tr>
  <td>${esc(p.code || '')}</td>
  <td><span class="badge text-bg-${p.itemType === 'product' ? 'primary' : (p.itemType === 'cost' ? 'warning' : 'secondary')}">${typeLabel}</span></td>
  <td>${esc(p.description || '')}${trackingLabel}</td>
  <td class="text-end-numbers col-price">${p.itemType === 'product' ? purchasePrice : '<span class="text-muted">-</span>'}</td>
  <td class="text-end-numbers col-price pe-5">${salePrice}</td>
  <td>${esc(vatLabel)}</td>
  <td class="text-end col-actions">
    <button class="btn btn-sm btn-outline-secondary btn-edit-product" data-id="${esc(p.id)}"><i class="fas fa-edit"></i></button>
    <button class="btn btn-sm btn-outline-danger btn-delete-product" data-id="${esc(p.id)}"><i class="fas fa-trash"></i></button>
  </td>
</tr>`);
    });

    if (!products.length) {
        const labels = { service: 'servizi', product: 'prodotti', cost: 'costi', all: 'voci' };
        table.append(`<tr><td colspan="7" class="text-center text-muted py-4">Nessuna voce da mostrare per il filtro ${labels[activeTypeFilter] || 'selezionato'}.</td></tr>`);
    }
}

function renderVatRatesTable() {
    const table = $('#vat-rates-table-body');
    if (!table.length) return;
    table.empty();
    const esc = (window.VatRateCatalog && window.VatRateCatalog.escapeHtml) ? window.VatRateCatalog.escapeHtml : function (v) { return String(v || ''); };
    const rates = (window.VatRateCatalog && typeof window.VatRateCatalog.getAll === 'function')
        ? window.VatRateCatalog.getAll()
        : [];

    rates.forEach(r => {
        const isSystem = r.isSystem === true || r.isSystem === 'true';
        table.append(`
<tr class="${r.isActive === false ? 'table-secondary opacity-75' : ''}">
  <td><code>${esc(r.code || '')}</code></td>
  <td>${esc(r.label || r.description || '')}</td>
  <td class="text-end">${parseFloat(r.rate || 0)}%</td>
  <td>${r.natureCode ? '<code>' + esc(r.natureCode) + '</code>' : '-'}</td>
  <td class="small">${esc(r.legalReference || r.exemptionText || '-')}</td>
  <td>${isSystem ? '<span class="badge text-bg-secondary">Sistema</span>' : '<span class="badge text-bg-info">Custom</span>'}${r.isActive === false ? ' <span class="badge text-bg-light">Disattivo</span>' : ''}</td>
  <td class="text-end">
    <button class="btn btn-sm btn-outline-secondary btn-edit-vat-rate" data-id="${esc(r.id)}"><i class="fas fa-eye"></i></button>
    <button class="btn btn-sm btn-outline-danger btn-delete-vat-rate" data-id="${esc(r.id)}" ${isSystem ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
  </td>
</tr>`);
    });
}

function renderPaymentMethodsTable() {
    const table = $('#payment-methods-table-body');
    if (!table.length) return;
    table.empty();
    const esc = (window.PaymentMethodCatalog && window.PaymentMethodCatalog.escapeHtml) ? window.PaymentMethodCatalog.escapeHtml : function (v) { return String(v || ''); };
    const methods = (window.PaymentMethodCatalog && typeof window.PaymentMethodCatalog.getAll === 'function')
        ? window.PaymentMethodCatalog.getAll()
        : [];

    methods.forEach(m => {
        const isSystem = m.isSystem === true || m.isSystem === 'true';
        table.append(`
<tr class="${m.isActive === false ? 'table-secondary opacity-75' : ''}">
  <td><code>${esc(m.code || '')}</code></td>
  <td>${esc(m.label || m.description || '')}</td>
  <td><span class="badge text-bg-light text-dark">${esc(m.macroArea || 'altro')}</span></td>
  <td>${m.requiresBank ? '<span class="badge text-bg-primary">Sì</span>' : '<span class="text-muted">No</span>'}</td>
  <td>${isSystem ? '<span class="badge text-bg-secondary">Sistema</span>' : '<span class="badge text-bg-info">Custom</span>'}${m.isActive === false ? ' <span class="badge text-bg-light">Disattivo</span>' : ''}</td>
  <td class="text-end">
    <button class="btn btn-sm btn-outline-secondary btn-edit-payment-method" data-id="${esc(m.id)}"><i class="fas fa-eye"></i></button>
    <button class="btn btn-sm btn-outline-danger btn-delete-payment-method" data-id="${esc(m.id)}" ${isSystem ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
  </td>
</tr>`);
    });
}

function renderCustomersTable() {
    const table = $('#customers-table-body').empty();
    const q = String($('#customers-search-filter').val() || '').trim().toLowerCase();

    let customers = (getStoreValue('customers', []) || []).slice()
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

    if (q) {
        customers = customers.filter(c => {
            const name = String(c.name || '').toLowerCase();
            const piva = String(c.piva || '').toLowerCase();
            const sdi = String(c.sdi || '').toLowerCase();
            const addr = String(c.address || '').toLowerCase();
            return name.includes(q) || piva.includes(q) || sdi.includes(q) || addr.includes(q);
        });
    }

    customers.forEach(c => {
        table.append(`
<tr>
  <td>${c.name || ''}</td>
  <td>${c.piva || ''}</td>
  <td>${c.sdi || '-'}</td>
  <td>${c.address || ''}</td>
  <td class="text-end">
    <button class="btn btn-sm btn-outline-secondary btn-edit-customer" data-id="${c.id}"><i class="fas fa-edit"></i></button>
    <button class="btn btn-sm btn-outline-danger btn-delete-customer" data-id="${c.id}"><i class="fas fa-trash"></i></button>
  </td>
</tr>`);
    });
}

function renderSuppliersTable() {
    const table = $('#suppliers-table-body');
    if (!table.length) return;
    table.empty();

    const q = String($('#suppliers-search-filter').val() || '').trim().toLowerCase();

    let suppliers = (getStoreValue('suppliers', []) || [])
        .slice()
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

    if (q) {
        suppliers = suppliers.filter(s => {
            const name = String(s.name || '').toLowerCase();
            const piva = String(s.piva || '').toLowerCase();
            const pec = String(s.pec || '').toLowerCase();
            return name.includes(q) || piva.includes(q) || pec.includes(q);
        });
    }

    suppliers.forEach(s => {
        table.append(`
            <tr>
                <td>${s.name || ''}</td>
                <td>${s.piva || ''}</td>
                <td>${s.pec || ''}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-edit-supplier" data-id="${s.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-supplier" data-id="${s.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

window.bindAnagraficheSearchOnce = bindAnagraficheSearchOnce;
window.renderProductsTable = renderProductsTable;
window.renderVatRatesTable = renderVatRatesTable;
window.renderCustomersTable = renderCustomersTable;
window.renderSuppliersTable = renderSuppliersTable;

function renderCompanyBanksTable() {
    const table = $('#company-banks-table-body');
    if (!table.length) return;
    table.empty();
    const esc = (window.CompanyBankCatalog && window.CompanyBankCatalog.escapeHtml) ? window.CompanyBankCatalog.escapeHtml : function (v) { return String(v || ''); };
    const customBanks = getStoreValue('companyBanks', []) || [];
    const banks = customBanks.length && window.CompanyBankCatalog ? window.CompanyBankCatalog.getAll() : (window.CompanyBankCatalog ? window.CompanyBankCatalog.getAll() : []);

    banks.forEach(b => {
        const isLegacy = b.isLegacy === true || b.isLegacy === 'true';
        table.append(`
<tr class="${b.isActive === false ? 'table-secondary opacity-75' : ''}">
  <td>${esc(b.accountLabel || b.label || '')}${isLegacy ? ' <span class="badge text-bg-secondary">Legacy</span>' : ''}</td>
  <td>${esc(b.bankName || '')}</td>
  <td><code>${esc(b.iban || '')}</code></td>
  <td>${esc(b.bic || '-')}</td>
  <td>${b.isDefault ? '<span class="badge text-bg-primary">Sì</span>' : '<span class="text-muted">No</span>'}</td>
  <td>${b.isActive !== false ? '<span class="badge text-bg-success">Attiva</span>' : '<span class="badge text-bg-light">Disattiva</span>'}</td>
  <td class="text-end">
    <button class="btn btn-sm btn-outline-secondary btn-edit-company-bank" data-id="${esc(b.id)}" ${isLegacy ? 'disabled title="Modifica i campi legacy in Impostazioni → Azienda"' : ''}><i class="fas fa-edit"></i></button>
    <button class="btn btn-sm btn-outline-danger btn-delete-company-bank" data-id="${esc(b.id)}" ${isLegacy ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
  </td>
</tr>`);
    });
    if (!banks.length) {
        table.append('<tr><td colspan="7" class="text-center text-muted py-4">Nessuna banca aziendale configurata. Aggiungi una banca oppure compila Banca 1/IBAN 1 in Impostazioni → Azienda.</td></tr>');
    }
}
window.renderCompanyBanksTable = renderCompanyBanksTable;
