// js/features/masterdata/masterdata-helpers.js
// Helper condivisi per anagrafiche (nessun bundler)

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.masterdata = window.AppModules.masterdata || {};

  function getStoreCollection(name) {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get(name) || [];
    if (typeof window.getData === 'function') return window.getData(name) || [];
    return [];
  }

  function getStoreCompanyInfo() {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get('companyInfo') || {};
    if (typeof window.getData === 'function') return window.getData('companyInfo') || {};
    return {};
  }

  function editItem(type, id) {
    // type: 'customer' | 'product' | 'supplier'
    if (type === 'customer' || type === 'product' || type === 'supplier') {
      CURRENT_EDITING_ID = String(id);
    }

    let item = getStoreCollection(`${type}s`).find(i => String(i.id) === String(id));
    if (type === "customer" && typeof populateDropdowns === "function") populateDropdowns();
    if (!item) return;
    if (type === 'customer' && window.DomainNormalizers && typeof window.DomainNormalizers.normalizeCustomerInfo === 'function') item = window.DomainNormalizers.normalizeCustomerInfo(item);

    $(`#${type}Form`)[0].reset();
    $(`#${type}ModalTitle`).text('Modifica');
    $(`#${type}-id`).val(String(item.id));

    for (const key in item) {
      const field = $(`#${type}-${key}`);
      if (field.length) {
        if (field.is(':checkbox')) field.prop('checked', item[key]);
        else field.val(item[key]);
      }
    }

    if (type === 'product') {
      const normalizedProduct = (window.DomainNormalizers && typeof window.DomainNormalizers.normalizeProductInfo === 'function')
        ? window.DomainNormalizers.normalizeProductInfo(item)
        : item;
      const itemType = normalizedProduct.itemType || ((normalizedProduct.isCosto === true || normalizedProduct.isCosto === 'true') ? 'cost' : 'service');
      if (window.AppModules && window.AppModules.products && typeof window.AppModules.products.setItemType === 'function') {
        window.AppModules.products.setItemType(itemType);
      } else {
        $('#product-itemType').val(itemType);
      }
      if (window.AppModules && window.AppModules.products && typeof window.AppModules.products.refreshVatSelect === 'function') {
        window.AppModules.products.refreshVatSelect(normalizedProduct);
      }
      $('#product-purchasePrice').val(normalizedProduct.purchasePrice === '' || normalizedProduct.purchasePrice == null ? '' : normalizedProduct.purchasePrice);
      $('#product-salePrice').val(normalizedProduct.salePrice === '' || normalizedProduct.salePrice == null ? '' : normalizedProduct.salePrice);
      $('#product-unitOfMeasure').val(normalizedProduct.unitOfMeasure || '');
      $('#product-stockQty').val(normalizedProduct.stockQty || '');
      $('#product-reservedQty').val(normalizedProduct.reservedQty || '');
      $('#product-quarantineQty').val(normalizedProduct.quarantineQty || '');
      $('#product-warehouseLocation').val(normalizedProduct.warehouseLocation || '');
      $('#product-minStockQty').val(normalizedProduct.minStockQty || '');
      $('#product-trackingMode').val(normalizedProduct.trackingMode || 'none');
      $('#product-requiresExpiry').val(normalizedProduct.requiresExpiry ? 'true' : 'false');
      $('#product-shelfLifeDays').val(normalizedProduct.shelfLifeDays === '' || normalizedProduct.shelfLifeDays == null ? '' : normalizedProduct.shelfLifeDays);
      if (window.AppModules && window.AppModules.products && typeof window.AppModules.products.updateProductWarehouseUi === 'function') {
        window.AppModules.products.updateProductWarehouseUi();
      }
      if (normalizedProduct.iva == '0') $('#product-esenzioneIva').val(normalizedProduct.esenzioneIva || normalizedProduct.natureCode || '');
    }

    $(`#${type}Modal`).modal('show');
  }

  window.AppModules.masterdata.editItem = editItem;
  // compatibilita (se qualche parte del codice la richiamasse direttamente)
  window.editItem = editItem;
})();
