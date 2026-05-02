// js/features/masterdata/products-module.js

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.products = window.AppModules.products || {};

  let _bound = false;

  function getProductsStore() {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get('products') || [];
    if (typeof window.getData === 'function') return window.getData('products') || [];
    return [];
  }

  function getProductTaxDefaults() {
    if (window.TaxRegimePolicy && typeof window.TaxRegimePolicy.getInvoiceDefaults === 'function') {
      return window.TaxRegimePolicy.getInvoiceDefaults();
    }
    return { isForfettario: false, defaultIva: '22', disableIvaFields: false };
  }

  function normalizeProduct(product) {
    if (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function') {
      return window.DomainNormalizers.normalizeProductInfo(product);
    }
    return product || {};
  }

  function inferVatRateId(product) {
    const p = product || {};
    if (window.VatRateCatalog && typeof window.VatRateCatalog.resolve === 'function') {
      const rate = window.VatRateCatalog.resolve(p, getProductTaxDefaults().isForfettario ? 'n2_2_forfettario' : 'iva_22');
      return rate ? rate.id : '';
    }
    return p.vatRateId || '';
  }

  function refreshVatSelect(product) {
    const defaults = getProductTaxDefaults();
    const selected = defaults.isForfettario ? 'n2_2_forfettario' : inferVatRateId(product || {});
    if (window.VatRateCatalog && typeof window.VatRateCatalog.populateSelect === 'function') {
      window.VatRateCatalog.populateSelect($('#product-vatRateId'), selected || 'iva_22');
    }
    $('#product-vatRateId').val(selected || 'iva_22').prop('disabled', !!defaults.disableIvaFields);
    syncLegacyVatFields();
  }

  function syncLegacyVatFields() {
    const id = $('#product-vatRateId').val();
    const legacy = window.VatRateCatalog && typeof window.VatRateCatalog.getLegacyFields === 'function'
      ? window.VatRateCatalog.getLegacyFields({ vatRateId: id }, 'iva_22')
      : { iva: $('#product-iva').val() || '22', esenzioneIva: $('#product-esenzioneIva').val() || '' };
    const legacyIvaValue = String(parseFloat(legacy.iva || 0));
    if (legacyIvaValue && !$('#product-iva').find('option[value="' + legacyIvaValue + '"]').length) {
      $('#product-iva').append('<option value="' + legacyIvaValue + '">' + legacyIvaValue + '%</option>');
    }
    if (legacy.esenzioneIva && !$('#product-esenzioneIva').find('option[value="' + legacy.esenzioneIva + '"]').length) {
      $('#product-esenzioneIva').append('<option value="' + legacy.esenzioneIva + '">' + legacy.esenzioneIva + '</option>');
    }
    $('#product-iva').val(legacyIvaValue);
    $('#product-esenzioneIva').val(legacy.esenzioneIva || '');
    updateVatPreview(legacy.vatRateId || id);
  }

  function updateVatPreview(id) {
    const rate = window.VatRateCatalog && typeof window.VatRateCatalog.findById === 'function'
      ? window.VatRateCatalog.findById(id)
      : null;
    if (!rate) {
      $('#product-vat-preview').text('Regola IVA non trovata.');
      return;
    }
    const parts = [`Aliquota ${parseFloat(rate.rate || 0)}%`];
    if (rate.natureCode) parts.push(`Natura FE ${rate.natureCode}`);
    if (rate.exemptionText) parts.push(rate.exemptionText);
    if (rate.legalReference) parts.push(rate.legalReference);
    $('#product-vat-preview').text(parts.join(' · '));
  }

  function getItemType() {
    const val = String($('#product-itemType').val() || 'service');
    return ['service', 'cost', 'product'].includes(val) ? val : 'service';
  }

  function formatCurrency(value) {
    const n = parseFloat(String(value || 0).replace(',', '.'));
    return '€ ' + (isNaN(n) ? 0 : n).toFixed(2).replace('.', ',');
  }

  function updateProductStockValuePreview() {
    const qty = parseFloat(String($('#product-stockQty').val() || 0).replace(',', '.')) || 0;
    const qQty = parseFloat(String($('#product-quarantineQty').val() || 0).replace(',', '.')) || 0;
    const price = parseFloat(String($('#product-purchasePrice').val() || 0).replace(',', '.')) || 0;
    $('#product-stock-value-preview').text(formatCurrency((qty + qQty) * price));
  }

  function updateProductWarehouseUi() {
    const itemType = getItemType();
    const enabled = itemType === 'product';
    $('#product-warehouse-fields').toggleClass('opacity-50', !enabled);
    $('#product-warehouse-fields input, #product-warehouse-fields select').prop('disabled', !enabled);
    if (!enabled) {
      $('#product-stockQty,#product-reservedQty,#product-quarantineQty,#product-minStockQty').val('');
      $('#product-warehouseLocation,#product-unitOfMeasure').val('');
      $('#product-trackingMode').val('none');
      $('#product-requiresExpiry').val('false');
      $('#product-shelfLifeDays').val('');
    } else if (!$('#product-unitOfMeasure').val()) {
      $('#product-unitOfMeasure').val('pz');
    }
    updateProductStockValuePreview();
  }

  function setItemType(type) {
    const itemType = ['service', 'cost', 'product'].includes(String(type)) ? String(type) : 'service';
    $('#product-itemType').val(itemType);
    $('#product-isCosto').prop('checked', itemType === 'cost');
    $('#product-isLavoro').prop('checked', itemType !== 'cost');
    updateProductWarehouseUi();
  }

  function bind() {
    if (_bound) return;
    _bound = true;

    $('#newProductBtn').click(() => {
      CURRENT_EDITING_ID = null;
      $('#productForm')[0].reset();
      $('#productModalTitle').text('Nuova Voce');
      $('#product-id').val('Nuovo');
      setItemType('service');
      refreshVatSelect({ iva: getProductTaxDefaults().defaultIva || '22' });
      $('#productModal').modal('show');
    });

    $('#product-itemType').on('change', function () {
      setItemType($(this).val());
    });

    $('#product-vatRateId').on('change', syncLegacyVatFields);
    $('#product-purchasePrice,#product-stockQty,#product-quarantineQty').on('input.warehousePreview', updateProductStockValuePreview);

    $('#products-type-filter').on('click', '.nav-link', function () {
      $('#products-type-filter .nav-link').removeClass('active');
      $(this).addClass('active');
      if (typeof renderProductsTable === 'function') renderProductsTable();
    });

    $('#saveProductBtn').click(async () => {
      const itemType = getItemType();
      const vatLegacy = window.VatRateCatalog && typeof window.VatRateCatalog.getLegacyFields === 'function'
        ? window.VatRateCatalog.getLegacyFields({ vatRateId: $('#product-vatRateId').val() }, 'iva_22')
        : { vatRateId: $('#product-vatRateId').val(), iva: $('#product-iva').val(), esenzioneIva: $('#product-esenzioneIva').val() };

      const data = normalizeProduct({
        description: $('#product-description').val(),
        code: $('#product-code').val(),
        purchasePrice: $('#product-purchasePrice').val(),
        salePrice: $('#product-salePrice').val(),
        itemType: itemType,
        vatRateId: getProductTaxDefaults().isForfettario ? 'n2_2_forfettario' : vatLegacy.vatRateId,
        iva: getProductTaxDefaults().isForfettario ? '0' : vatLegacy.iva,
        esenzioneIva: getProductTaxDefaults().isForfettario ? 'N2.2' : vatLegacy.esenzioneIva,
        isLavoro: itemType !== 'cost',
        isCosto: itemType === 'cost',
        isInventoryItem: itemType === 'product',
        unitOfMeasure: itemType === 'product' ? ($('#product-unitOfMeasure').val() || 'pz') : '',
        stockQty: itemType === 'product' ? $('#product-stockQty').val() : 0,
        reservedQty: itemType === 'product' ? $('#product-reservedQty').val() : 0,
        quarantineQty: itemType === 'product' ? $('#product-quarantineQty').val() : 0,
        warehouseLocation: itemType === 'product' ? $('#product-warehouseLocation').val() : '',
        minStockQty: itemType === 'product' ? $('#product-minStockQty').val() : 0,
        trackingMode: itemType === 'product' ? ($('#product-trackingMode').val() || 'none') : 'none',
        requiresExpiry: itemType === 'product' ? ($('#product-requiresExpiry').val() === 'true' || $('#product-trackingMode').val() === 'expiry') : false,
        shelfLifeDays: itemType === 'product' ? $('#product-shelfLifeDays').val() : ''
      });

      let id = CURRENT_EDITING_ID ? CURRENT_EDITING_ID : 'PRD' + new Date().getTime();
      await saveDataToCloud('products', data, id);
      $('#productModal').modal('hide');
      if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
      else if (typeof renderMasterDataArea === 'function') renderMasterDataArea();
      if (typeof populateDropdowns === 'function') populateDropdowns();
    });

    $('#products-table-body').on('click', '.btn-edit-product', function (e) {
      window.AppModules.masterdata.editItem('product', $(e.currentTarget).attr('data-id'));
    });

    $('#products-table-body').on('click', '.btn-delete-product', function (e) {
      const id = $(e.currentTarget).attr('data-id');
      if (window.deleteDataFromCloud) window.deleteDataFromCloud('products', id, { skipRender: true }).then(() => {
        if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
        else if (typeof renderMasterDataArea === 'function') renderMasterDataArea();
        if (typeof populateDropdowns === 'function') populateDropdowns();
      });
    });
  }

  window.AppModules.products.bind = bind;
  window.AppModules.products.refreshVatSelect = refreshVatSelect;
  window.AppModules.products.setItemType = setItemType;
  window.AppModules.products.syncLegacyVatFields = syncLegacyVatFields;
  window.AppModules.products.updateProductWarehouseUi = updateProductWarehouseUi;
})();
