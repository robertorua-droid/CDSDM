// js/core/vat-rate-catalog.js
// Catalogo IVA/Natura FE centralizzato, senza bundler.
(function () {
  const SYSTEM_RATES = [
    { id: 'iva_22', code: 'IVA22', label: 'IVA 22%', rate: 22, natureCode: '', exemptionText: '', legalReference: '', isSystem: true, isActive: true },
    { id: 'iva_10', code: 'IVA10', label: 'IVA 10%', rate: 10, natureCode: '', exemptionText: '', legalReference: '', isSystem: true, isActive: true },
    { id: 'iva_5', code: 'IVA5', label: 'IVA 5%', rate: 5, natureCode: '', exemptionText: '', legalReference: '', isSystem: true, isActive: true },
    { id: 'iva_4', code: 'IVA4', label: 'IVA 4%', rate: 4, natureCode: '', exemptionText: '', legalReference: '', isSystem: true, isActive: true },
    { id: 'n1_escluse', code: 'N1', label: 'N1 - Escluse ex art. 15', rate: 0, natureCode: 'N1', exemptionText: 'Escluse ex art. 15', legalReference: 'Art. 15 DPR 633/72', isSystem: true, isActive: true },
    { id: 'n2_1_non_soggette', code: 'N2.1', label: 'N2.1 - Non soggette artt. 7-7-septies', rate: 0, natureCode: 'N2.1', exemptionText: 'Non soggette artt. 7-7-septies', legalReference: 'Artt. 7-7-septies DPR 633/72', isSystem: true, isActive: true },
    { id: 'n2_2_forfettario', code: 'N2.2', label: 'N2.2 - Non soggette altri casi / Forfettario', rate: 0, natureCode: 'N2.2', exemptionText: 'Non soggette - altri casi', legalReference: 'Regime forfettario / altri casi non soggetti', isSystem: true, isActive: true },
    { id: 'n3_1_non_imponibili_export', code: 'N3.1', label: 'N3.1 - Non imponibili esportazioni', rate: 0, natureCode: 'N3.1', exemptionText: 'Non imponibili - esportazioni', legalReference: '', isSystem: true, isActive: true },
    { id: 'n3_2_non_imponibili_intra', code: 'N3.2', label: 'N3.2 - Non imponibili cessioni intra UE', rate: 0, natureCode: 'N3.2', exemptionText: 'Non imponibili - cessioni intra UE', legalReference: '', isSystem: true, isActive: true },
    { id: 'n3_3_non_imponibili_san_marino', code: 'N3.3', label: 'N3.3 - Non imponibili San Marino', rate: 0, natureCode: 'N3.3', exemptionText: 'Non imponibili - San Marino', legalReference: '', isSystem: true, isActive: true },
    { id: 'n3_4_non_imponibili_assimilate', code: 'N3.4', label: 'N3.4 - Non imponibili operazioni assimilate', rate: 0, natureCode: 'N3.4', exemptionText: 'Non imponibili - operazioni assimilate', legalReference: '', isSystem: true, isActive: true },
    { id: 'n3_5_non_imponibili_intento', code: 'N3.5', label: 'N3.5 - Non imponibili dichiarazione intento', rate: 0, natureCode: 'N3.5', exemptionText: 'Non imponibili - dichiarazione intento', legalReference: '', isSystem: true, isActive: true },
    { id: 'n3_6_non_imponibili_altro', code: 'N3.6', label: 'N3.6 - Non imponibili altre operazioni', rate: 0, natureCode: 'N3.6', exemptionText: 'Non imponibili - altre operazioni', legalReference: '', isSystem: true, isActive: true },
    { id: 'n4_esenti', code: 'N4', label: 'N4 - Esenti', rate: 0, natureCode: 'N4', exemptionText: 'Esenti', legalReference: 'Art. 10 DPR 633/72', isSystem: true, isActive: true },
    { id: 'n5_margine', code: 'N5', label: 'N5 - Regime del margine', rate: 0, natureCode: 'N5', exemptionText: 'Regime del margine / IVA non esposta', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_1_reverse_rottami', code: 'N6.1', label: 'N6.1 - Reverse charge rottami', rate: 0, natureCode: 'N6.1', exemptionText: 'Inversione contabile - rottami', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_2_reverse_oro', code: 'N6.2', label: 'N6.2 - Reverse charge oro e argento puro', rate: 0, natureCode: 'N6.2', exemptionText: 'Inversione contabile - oro e argento puro', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_3_reverse_subappalto', code: 'N6.3', label: 'N6.3 - Reverse charge subappalto edilizia', rate: 0, natureCode: 'N6.3', exemptionText: 'Inversione contabile - subappalto edilizia', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_4_reverse_fabbricati', code: 'N6.4', label: 'N6.4 - Reverse charge fabbricati', rate: 0, natureCode: 'N6.4', exemptionText: 'Inversione contabile - fabbricati', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_5_reverse_cellulari', code: 'N6.5', label: 'N6.5 - Reverse charge telefoni cellulari', rate: 0, natureCode: 'N6.5', exemptionText: 'Inversione contabile - telefoni cellulari', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_6_reverse_elettronica', code: 'N6.6', label: 'N6.6 - Reverse charge prodotti elettronici', rate: 0, natureCode: 'N6.6', exemptionText: 'Inversione contabile - prodotti elettronici', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_7_reverse_edilizia', code: 'N6.7', label: 'N6.7 - Reverse charge edilizia', rate: 0, natureCode: 'N6.7', exemptionText: 'Inversione contabile - edilizia', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_8_reverse_energia', code: 'N6.8', label: 'N6.8 - Reverse charge energia', rate: 0, natureCode: 'N6.8', exemptionText: 'Inversione contabile - energia', legalReference: '', isSystem: true, isActive: true },
    { id: 'n6_9_reverse_altri', code: 'N6.9', label: 'N6.9 - Reverse charge altri casi', rate: 0, natureCode: 'N6.9', exemptionText: 'Inversione contabile - altri casi', legalReference: '', isSystem: true, isActive: true },
    { id: 'n7_iva_assolta_altro_stato', code: 'N7', label: 'N7 - IVA assolta in altro Stato UE', rate: 0, natureCode: 'N7', exemptionText: 'IVA assolta in altro Stato UE', legalReference: '', isSystem: true, isActive: true }
  ];

  function safeFloat(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function getCustomRates() {
    const list = (window.AppStore && typeof window.AppStore.get === 'function')
      ? (window.AppStore.get('vatRates') || [])
      : ((window.getData && window.getData('vatRates')) || (window.globalData && window.globalData.vatRates) || []);
    return Array.isArray(list) ? list : [];
  }

  function normalizeRate(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const rate = safeFloat(src.rate != null ? src.rate : src.iva);
    const natureCode = String(src.natureCode || src.feNatureCode || src.esenzioneIva || '').trim();
    const code = String(src.code || natureCode || ('IVA' + String(rate).replace('.', '_'))).trim().toUpperCase();
    const label = String(src.label || src.description || (natureCode ? `${natureCode} - ${src.exemptionText || 'Natura FE'}` : `IVA ${rate}%`)).trim();
    return Object.assign({}, src, {
      id: String(src.id || code || ('vat_' + Date.now())),
      code,
      label,
      description: String(src.description || label).trim(),
      rate,
      natureCode,
      feNatureCode: natureCode,
      exemptionText: String(src.exemptionText || src.exemptionReason || '').trim(),
      legalReference: String(src.legalReference || '').trim(),
      isSystem: src.isSystem === true || src.isSystem === 'true',
      isActive: src.isActive === false || src.isActive === 'false' ? false : true
    });
  }

  function getAll(options) {
    const opts = options || {};
    const merged = [];
    const seen = new Set();
    SYSTEM_RATES.concat(getCustomRates()).forEach(function (raw) {
      const item = normalizeRate(raw);
      if (!item.id || seen.has(item.id)) return;
      seen.add(item.id);
      if (opts.activeOnly && item.isActive === false) return;
      merged.push(item);
    });
    return merged;
  }

  function findById(id) {
    const strId = String(id || '').trim();
    return getAll().find(r => String(r.id) === strId) || null;
  }

  function findByLegacy(iva, esenzioneIva) {
    const rate = safeFloat(iva);
    const nature = String(esenzioneIva || '').trim();
    if (rate === 0 && nature) {
      return getAll().find(r => safeFloat(r.rate) === 0 && String(r.natureCode || '') === nature) || null;
    }
    return getAll().find(r => safeFloat(r.rate) === rate && !String(r.natureCode || '').trim()) || null;
  }

  function resolve(input, fallback) {
    const src = input && typeof input === 'object' ? input : {};
    return findById(src.vatRateId) || findByLegacy(src.iva, src.esenzioneIva) || findById(fallback || 'iva_22') || findById('iva_22');
  }

  function getLegacyFields(input, fallback) {
    const rate = resolve(input, fallback) || {};
    return {
      vatRateId: rate.id || '',
      iva: String(safeFloat(rate.rate)),
      esenzioneIva: rate.natureCode || '',
      natureCode: rate.natureCode || '',
      vatLabel: rate.label || ''
    };
  }

  function optionHtml(selectedId, options) {
    const selected = String(selectedId || '');
    return getAll({ activeOnly: !(options && options.includeInactive) }).map(function (r) {
      const suffix = r.isSystem ? '' : ' · custom';
      const sel = String(r.id) === selected ? ' selected' : '';
      return `<option value="${escapeHtml(r.id)}"${sel}>${escapeHtml(r.label + suffix)}</option>`;
    }).join('');
  }

  function populateSelect($select, selectedId, options) {
    if (!$select || !$select.length) return;
    $select.empty().append(optionHtml(selectedId, options));
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.VatRateCatalog = {
    SYSTEM_RATES,
    normalizeRate,
    getAll,
    findById,
    findByLegacy,
    resolve,
    getLegacyFields,
    populateSelect,
    escapeHtml
  };
})();
