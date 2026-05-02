// js/core/company-bank-catalog.js
// Catalogo runtime delle banche aziendali. Unisce la nuova collezione companyBanks
// con i campi legacy companyInfo.banca/iban e companyInfo.banca2/iban2.
(function () {
  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
    });
  }

  function getDataSafe(key) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(key);
    if (typeof window.getData === 'function') return window.getData(key);
    return (window.globalData && window.globalData[key]) || null;
  }

  function normalizeBank(raw, fallbackId) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const id = String(src.id || fallbackId || ('bank_' + Date.now())).trim();
    const label = String(src.accountLabel || src.label || src.bankName || '').trim();
    const bankName = String(src.bankName || src.banca || src.name || '').trim();
    const iban = String(src.iban || '').replace(/\s+/g, '').trim().toUpperCase();
    const bic = String(src.bic || '').trim().toUpperCase();
    const accountHolder = String(src.accountHolder || src.intestatario || '').trim();
    return {
      id: id,
      bankName: bankName,
      accountLabel: label || bankName || id,
      label: label || bankName || id,
      iban: iban,
      bic: bic,
      accountHolder: accountHolder,
      notes: String(src.notes || '').trim(),
      isDefault: src.isDefault === true || src.isDefault === 'true',
      isActive: src.isActive !== false && src.isActive !== 'false',
      isLegacy: src.isLegacy === true || src.isLegacy === 'true'
    };
  }

  function getCustomBanks() {
    const arr = getDataSafe('companyBanks') || [];
    return (Array.isArray(arr) ? arr : []).map(function (b) { return normalizeBank(b, b && b.id); });
  }

  function getLegacyBanks() {
    const ci = getDataSafe('companyInfo') || {};
    const out = [];
    if (ci.banca || ci.banca1 || ci.iban || ci.iban1) {
      out.push(normalizeBank({
        id: 'legacy_bank_1',
        bankName: ci.banca1 || ci.banca || 'Banca 1',
        accountLabel: 'Banca 1' + ((ci.banca1 || ci.banca) ? ' - ' + (ci.banca1 || ci.banca) : ''),
        iban: ci.iban1 || ci.iban || '',
        accountHolder: ci.name || ci.ragioneSociale || '',
        isDefault: true,
        isLegacy: true
      }, 'legacy_bank_1'));
    }
    if (ci.banca2 || ci.iban2) {
      out.push(normalizeBank({
        id: 'legacy_bank_2',
        bankName: ci.banca2 || 'Banca 2',
        accountLabel: 'Banca 2' + (ci.banca2 ? ' - ' + ci.banca2 : ''),
        iban: ci.iban2 || '',
        accountHolder: ci.name || ci.ragioneSociale || '',
        isDefault: false,
        isLegacy: true
      }, 'legacy_bank_2'));
    }
    return out;
  }

  function getAll() {
    const custom = getCustomBanks();
    const customActiveOrAll = custom;
    const hasCustom = customActiveOrAll.length > 0;
    const list = hasCustom ? customActiveOrAll : getLegacyBanks();
    const active = list.filter(function (b) { return b.isActive !== false; });
    const source = active.length ? active : list;
    if (!source.some(function (b) { return b.isDefault; }) && source[0]) source[0].isDefault = true;
    return source;
  }

  function getActive() {
    return getAll().filter(function (b) { return b.isActive !== false; });
  }

  function findById(id) {
    const sid = String(id || '').trim();
    if (!sid) return null;
    return getAll().find(function (b) { return String(b.id) === sid; }) || null;
  }

  function getDefault() {
    const active = getActive();
    return active.find(function (b) { return b.isDefault; }) || active[0] || null;
  }

  function resolve(id) {
    return findById(id) || getDefault();
  }

  window.CompanyBankCatalog = { escapeHtml: esc, normalizeBank: normalizeBank, getAll: getAll, getActive: getActive, findById: findById, getDefault: getDefault, resolve: resolve };
})();
