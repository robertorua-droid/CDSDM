// js/features/masterdata/payment-methods-module.js
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.paymentMethods = window.AppModules.paymentMethods || {};

  let _bound = false;
  let _editingId = null;

  function getMethod(id) {
    return window.PaymentMethodCatalog && typeof window.PaymentMethodCatalog.findById === 'function'
      ? window.PaymentMethodCatalog.findById(id)
      : null;
  }

  function setFormDefaults() {
    _editingId = null;
    $('#paymentMethodForm')[0].reset();
    $('#paymentMethod-id').val('Nuovo');
    $('#paymentMethod-code').val('MP05');
    $('#paymentMethod-macroArea').val('bonifico');
    $('#paymentMethod-requiresBank').prop('checked', true);
    $('#paymentMethod-isActive').prop('checked', true);
    $('#paymentMethod-code, #paymentMethod-label, #paymentMethod-macroArea, #paymentMethod-requiresBank, #paymentMethod-isActive').prop('disabled', false);
    $('#savePaymentMethodBtn').prop('disabled', false).show();
    $('#paymentMethod-system-alert').addClass('d-none');
  }

  function openForEdit(id) {
    const method = getMethod(id);
    if (!method) return;
    _editingId = String(method.id || id);
    $('#paymentMethodForm')[0].reset();
    $('#paymentMethod-id').val(method.id || '');
    $('#paymentMethod-code').val(method.code || '');
    $('#paymentMethod-label').val(method.label || method.description || '');
    $('#paymentMethod-macroArea').val(method.macroArea || 'altro');
    $('#paymentMethod-requiresBank').prop('checked', method.requiresBank === true || method.requiresBank === 'true');
    $('#paymentMethod-isActive').prop('checked', method.isActive !== false);

    const isSystem = method.isSystem === true || method.isSystem === 'true';
    $('#paymentMethod-code, #paymentMethod-label, #paymentMethod-macroArea, #paymentMethod-requiresBank, #paymentMethod-isActive').prop('disabled', isSystem);
    $('#savePaymentMethodBtn').prop('disabled', isSystem).toggle(!isSystem);
    $('#paymentMethod-system-alert').toggleClass('d-none', !isSystem);
    $('#paymentMethodModal').modal('show');
  }

  function buildData() {
    const code = String($('#paymentMethod-code').val() || '').trim().toUpperCase();
    const label = String($('#paymentMethod-label').val() || '').trim();
    const macroArea = String($('#paymentMethod-macroArea').val() || '').trim().toLowerCase();
    return {
      code,
      feCode: code,
      label,
      description: label,
      macroArea,
      requiresBank: $('#paymentMethod-requiresBank').is(':checked') || macroArea === 'bonifico',
      isSystem: false,
      isActive: $('#paymentMethod-isActive').is(':checked')
    };
  }

  function validateData(data) {
    if (!/^MP\d{2}$/.test(data.code || '')) return 'Inserisci un codice FE nel formato MPxx, ad esempio MP05.';
    if (!data.label) return 'Inserisci una descrizione.';
    if (!data.macroArea) return 'Seleziona una macro area.';
    return '';
  }

  async function save() {
    const data = buildData();
    const err = validateData(data);
    if (err) {
      alert(err);
      return;
    }
    const id = _editingId || ('PM' + Date.now());
    await saveDataToCloud('paymentMethods', data, id);
    $('#paymentMethodModal').modal('hide');
    if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
    if (typeof populateDropdowns === 'function') populateDropdowns();
  }

  async function remove(id) {
    const method = getMethod(id);
    if (!method || method.isSystem) return;
    if (!confirm('Eliminare la modalita di pagamento personalizzata selezionata? I documenti gia emessi non vengono modificati.')) return;
    await deleteDataFromCloud('paymentMethods', id, { skipRender: true });
    if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
    if (typeof populateDropdowns === 'function') populateDropdowns();
  }

  function syncBankFlag() {
    const macro = String($('#paymentMethod-macroArea').val() || '').toLowerCase();
    if (macro === 'bonifico') $('#paymentMethod-requiresBank').prop('checked', true);
  }

  function bind() {
    if (_bound) return;
    _bound = true;

    $('#newPaymentMethodBtn').on('click', function () {
      setFormDefaults();
      $('#paymentMethodModal').modal('show');
    });
    $('#savePaymentMethodBtn').on('click', save);
    $('#payment-methods-table-body').on('click', '.btn-edit-payment-method', function () {
      openForEdit($(this).attr('data-id'));
    });
    $('#payment-methods-table-body').on('click', '.btn-delete-payment-method', function () {
      remove($(this).attr('data-id'));
    });
    $('#paymentMethod-macroArea').on('change', syncBankFlag);
  }

  window.AppModules.paymentMethods.bind = bind;
})();
