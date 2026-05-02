// js/features/masterdata/vat-rates-module.js
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.vatRates = window.AppModules.vatRates || {};

  let _bound = false;
  let _editingId = null;

  function getRate(id) {
    return window.VatRateCatalog && typeof window.VatRateCatalog.findById === 'function'
      ? window.VatRateCatalog.findById(id)
      : null;
  }

  function setFormDefaults() {
    _editingId = null;
    $('#vatRateForm')[0].reset();
    $('#vatRate-id').val('Nuovo');
    $('#vatRate-rate').val('22');
    $('#vatRate-isActive').prop('checked', true);
    $('#vatRate-code, #vatRate-label, #vatRate-natureCode, #vatRate-exemptionText, #vatRate-legalReference').prop('disabled', false);
    $('#saveVatRateBtn').prop('disabled', false).show();
    $('#vatRate-system-alert').addClass('d-none');
  }

  function openForEdit(id) {
    const rate = getRate(id);
    if (!rate) return;
    _editingId = String(rate.id || id);
    $('#vatRateForm')[0].reset();
    $('#vatRate-id').val(rate.id || '');
    $('#vatRate-code').val(rate.code || '');
    $('#vatRate-label').val(rate.label || rate.description || '');
    $('#vatRate-rate').val(rate.rate != null ? rate.rate : 0);
    $('#vatRate-natureCode').val(rate.natureCode || rate.feNatureCode || '');
    $('#vatRate-exemptionText').val(rate.exemptionText || '');
    $('#vatRate-legalReference').val(rate.legalReference || '');
    $('#vatRate-isActive').prop('checked', rate.isActive !== false);

    const isSystem = rate.isSystem === true || rate.isSystem === 'true';
    $('#vatRate-code, #vatRate-label, #vatRate-rate, #vatRate-natureCode, #vatRate-exemptionText, #vatRate-legalReference, #vatRate-isActive').prop('disabled', isSystem);
    $('#saveVatRateBtn').prop('disabled', isSystem).toggle(!isSystem);
    $('#vatRate-system-alert').toggleClass('d-none', !isSystem);
    $('#vatRateModal').modal('show');
  }

  function buildData() {
    const rate = parseFloat($('#vatRate-rate').val());
    const natureCode = String($('#vatRate-natureCode').val() || '').trim().toUpperCase();
    return {
      code: String($('#vatRate-code').val() || '').trim().toUpperCase(),
      label: String($('#vatRate-label').val() || '').trim(),
      description: String($('#vatRate-label').val() || '').trim(),
      rate: isNaN(rate) ? 0 : rate,
      natureCode,
      feNatureCode: natureCode,
      exemptionText: String($('#vatRate-exemptionText').val() || '').trim(),
      legalReference: String($('#vatRate-legalReference').val() || '').trim(),
      isSystem: false,
      isActive: $('#vatRate-isActive').is(':checked')
    };
  }

  function validateData(data) {
    if (!data.code) return 'Inserisci un codice.';
    if (!data.label) return 'Inserisci una descrizione.';
    if (data.rate < 0) return 'L\'aliquota non può essere negativa.';
    if (data.rate > 0 && data.natureCode) return 'Per aliquote IVA maggiori di 0 il codice Natura FE deve restare vuoto.';
    if (data.rate === 0 && !data.natureCode) return 'Per aliquote 0% indica il codice Natura FE/esenzione.';
    return '';
  }

  async function save() {
    const data = buildData();
    const err = validateData(data);
    if (err) {
      alert(err);
      return;
    }
    const id = _editingId || ('VAT' + Date.now());
    await saveDataToCloud('vatRates', data, id);
    $('#vatRateModal').modal('hide');
    if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
    if (typeof populateDropdowns === 'function') populateDropdowns();
  }

  async function remove(id) {
    const rate = getRate(id);
    if (!rate || rate.isSystem) return;
    if (!confirm('Eliminare il codice IVA personalizzato selezionato? I documenti già emessi non vengono modificati.')) return;
    await deleteDataFromCloud('vatRates', id, { skipRender: true });
    if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
    if (typeof populateDropdowns === 'function') populateDropdowns();
  }

  function bind() {
    if (_bound) return;
    _bound = true;

    $('#newVatRateBtn').on('click', function () {
      setFormDefaults();
      $('#vatRateModal').modal('show');
    });

    $('#saveVatRateBtn').on('click', save);

    $('#vat-rates-table-body').on('click', '.btn-edit-vat-rate', function () {
      openForEdit($(this).attr('data-id'));
    });

    $('#vat-rates-table-body').on('click', '.btn-delete-vat-rate', function () {
      remove($(this).attr('data-id'));
    });

    $('#vatRate-rate').on('change keyup', function () {
      const rate = parseFloat($(this).val());
      const isZero = !isNaN(rate) && rate === 0;
      $('#vatRate-natureCode').prop('required', isZero);
    });
  }

  window.AppModules.vatRates.bind = bind;
})();
