// js/core/payment-method-catalog.js
// Catalogo Modalita Pagamento FE centralizzato, senza bundler.
(function () {
  const SYSTEM_METHODS = [
    { id: 'mp01_contanti', code: 'MP01', label: 'Contanti', macroArea: 'contanti', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp02_assegno', code: 'MP02', label: 'Assegno', macroArea: 'assegno', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp03_assegno_circolare', code: 'MP03', label: 'Assegno circolare', macroArea: 'assegno', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp04_contanti_tesoreria', code: 'MP04', label: 'Contanti presso Tesoreria', macroArea: 'contanti', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp05_bonifico', code: 'MP05', label: 'Bonifico bancario', macroArea: 'bonifico', requiresBank: true, isSystem: true, isActive: true },
    { id: 'mp06_vaglia_cambiario', code: 'MP06', label: 'Vaglia cambiario', macroArea: 'altro', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp07_bollettino_bancario', code: 'MP07', label: 'Bollettino bancario', macroArea: 'bollettino', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp08_carta_pagamento', code: 'MP08', label: 'Carta di pagamento', macroArea: 'carta', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp09_rid', code: 'MP09', label: 'RID', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp10_rid_utenze', code: 'MP10', label: 'RID utenze', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp11_rid_veloce', code: 'MP11', label: 'RID veloce', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp12_riba', code: 'MP12', label: 'Ri.Ba.', macroArea: 'ricevuta_bancaria', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp13_mav', code: 'MP13', label: 'MAV', macroArea: 'bollettino', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp14_quietanza_erario', code: 'MP14', label: 'Quietanza erario', macroArea: 'altro', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp15_giroconto', code: 'MP15', label: 'Giroconto su conti di contabilita speciale', macroArea: 'altro', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp16_domiciliazione_bancaria', code: 'MP16', label: 'Domiciliazione bancaria', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp17_domiciliazione_postale', code: 'MP17', label: 'Domiciliazione postale', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp18_bollettino_postale', code: 'MP18', label: 'Bollettino postale', macroArea: 'bollettino', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp19_sepa_direct_debit', code: 'MP19', label: 'SEPA Direct Debit', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp20_sepa_direct_debit_core', code: 'MP20', label: 'SEPA Direct Debit CORE', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp21_sepa_direct_debit_b2b', code: 'MP21', label: 'SEPA Direct Debit B2B', macroArea: 'addebito', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp22_trattenuta_somme_riscosse', code: 'MP22', label: 'Trattenuta su somme gia riscosse', macroArea: 'trattenuta', requiresBank: false, isSystem: true, isActive: true },
    { id: 'mp23_pago_pa', code: 'MP23', label: 'PagoPA', macroArea: 'pago_pa', requiresBank: false, isSystem: true, isActive: true }
  ];

  function getCustomMethods() {
    const list = (window.AppStore && typeof window.AppStore.get === 'function')
      ? (window.AppStore.get('paymentMethods') || [])
      : ((window.getData && window.getData('paymentMethods')) || (window.globalData && window.globalData.paymentMethods) || []);
    return Array.isArray(list) ? list : [];
  }

  function inferMacroArea(code, label) {
    const c = String(code || '').toUpperCase();
    const l = String(label || '').toLowerCase();
    if (c === 'MP05' || l.includes('bonifico')) return 'bonifico';
    if (c === 'MP01' || c === 'MP04' || l.includes('contanti')) return 'contanti';
    if (c === 'MP02' || c === 'MP03' || l.includes('assegno')) return 'assegno';
    if (c === 'MP12' || l.includes('ri.ba')) return 'ricevuta_bancaria';
    if (c === 'MP23' || l.includes('pagopa')) return 'pago_pa';
    if (['MP09', 'MP10', 'MP11', 'MP16', 'MP17', 'MP19', 'MP20', 'MP21'].includes(c)) return 'addebito';
    if (['MP07', 'MP13', 'MP18'].includes(c)) return 'bollettino';
    if (c === 'MP08' || l.includes('carta')) return 'carta';
    if (c === 'MP22' || l.includes('trattenuta')) return 'trattenuta';
    return 'altro';
  }

  function normalizeMethod(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const code = String(src.code || src.feCode || 'MP05').trim().toUpperCase();
    const label = String(src.label || src.description || src.name || code).trim();
    const macroArea = String(src.macroArea || src.area || '').trim().toLowerCase() || inferMacroArea(code, label);
    return Object.assign({}, src, {
      id: String(src.id || (code.toLowerCase() + '_' + label.toLowerCase().replace(/[^a-z0-9]+/g, '_'))),
      code,
      feCode: code,
      label,
      description: String(src.description || label).trim(),
      macroArea,
      requiresBank: src.requiresBank === true || src.requiresBank === 'true' || macroArea === 'bonifico',
      isSystem: src.isSystem === true || src.isSystem === 'true',
      isActive: src.isActive === false || src.isActive === 'false' ? false : true
    });
  }

  function getAll(options) {
    const opts = options || {};
    const merged = [];
    const seen = new Set();
    SYSTEM_METHODS.concat(getCustomMethods()).forEach(function (raw) {
      const item = normalizeMethod(raw);
      if (!item.id || seen.has(item.id)) return;
      seen.add(item.id);
      if (opts.activeOnly && item.isActive === false) return;
      merged.push(item);
    });
    return merged;
  }

  function findById(id) {
    const strId = String(id || '').trim();
    return getAll().find(m => String(m.id) === strId) || null;
  }

  function findByCode(code) {
    const strCode = String(code || '').trim().toUpperCase();
    return getAll().find(m => String(m.code || '').toUpperCase() === strCode) || null;
  }

  function findByLegacyLabel(label) {
    const s = String(label || '').trim().toLowerCase();
    if (!s) return null;
    if (s.includes('bonifico')) return findByCode('MP05');
    if (s.includes('assegno')) return findByCode('MP02');
    if (s.includes('contanti')) return findByCode('MP01');
    if (s.includes('rimessa')) return findByCode('MP05');
    return null;
  }

  function resolve(input, fallback) {
    const src = input && typeof input === 'object' ? input : {};
    return findById(src.paymentMethodId) || findByCode(src.paymentMethodCode || src.modalitaPagamentoFE) || findByLegacyLabel(src.modalitaPagamento || src.paymentMethod) || findById(fallback || 'mp05_bonifico') || findByCode('MP05');
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.PaymentMethodCatalog = {
    SYSTEM_METHODS,
    normalizeMethod,
    getAll,
    getActive: function () { return getAll({ activeOnly: true }); },
    findById,
    findByCode,
    resolve,
    escapeHtml
  };
})();
