// js/features/masterdata/company-banks-module.js
(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.companyBanks = window.AppModules.companyBanks || {};

  let _bound = false;
  let _editingId = null;

  function getBanksRaw() {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get('companyBanks') || [];
    if (typeof window.getData === 'function') return window.getData('companyBanks') || [];
    return [];
  }

  function getBank(id) {
    const sid = String(id || '');
    return (getBanksRaw() || []).find(function (b) { return String(b.id) === sid; }) || null;
  }

  function resetForm() {
    _editingId = null;
    const form = $('#companyBankForm')[0];
    if (form) form.reset();
    $('#companyBank-id').val('Nuovo');
    $('#companyBank-isActive').prop('checked', true);
    $('#companyBank-isDefault').prop('checked', !((getBanksRaw() || []).some(function (b) { return b && b.isDefault; })));
  }

  function openForEdit(id) {
    const bank = getBank(id);
    if (!bank) return;
    _editingId = String(bank.id || id);
    const form = $('#companyBankForm')[0];
    if (form) form.reset();
    $('#companyBank-id').val(bank.id || '');
    $('#companyBank-accountLabel').val(bank.accountLabel || bank.label || '');
    $('#companyBank-bankName').val(bank.bankName || bank.banca || '');
    $('#companyBank-accountHolder').val(bank.accountHolder || '');
    $('#companyBank-iban').val(bank.iban || '');
    $('#companyBank-bic').val(bank.bic || '');
    $('#companyBank-notes').val(bank.notes || '');
    $('#companyBank-isDefault').prop('checked', bank.isDefault === true || bank.isDefault === 'true');
    $('#companyBank-isActive').prop('checked', bank.isActive !== false && bank.isActive !== 'false');
    $('#companyBankModal').modal('show');
  }

  function buildData() {
    return {
      accountLabel: String($('#companyBank-accountLabel').val() || '').trim(),
      bankName: String($('#companyBank-bankName').val() || '').trim(),
      accountHolder: String($('#companyBank-accountHolder').val() || '').trim(),
      iban: String($('#companyBank-iban').val() || '').replace(/\s+/g, '').trim().toUpperCase(),
      bic: String($('#companyBank-bic').val() || '').trim().toUpperCase(),
      notes: String($('#companyBank-notes').val() || '').trim(),
      isDefault: $('#companyBank-isDefault').is(':checked'),
      isActive: $('#companyBank-isActive').is(':checked')
    };
  }

  function validate(data) {
    if (!data.accountLabel) return 'Inserisci una etichetta conto.';
    if (!data.iban) return 'Inserisci un IBAN.';
    if (!/^[A-Z]{2}[A-Z0-9]{10,32}$/.test(data.iban)) return 'Controlla il formato IBAN: deve iniziare con il codice paese, es. IT...';
    return '';
  }

  async function unsetOtherDefaults(exceptId) {
    const banks = getBanksRaw() || [];
    const updates = [];
    banks.forEach(function (b) {
      if (!b || String(b.id) === String(exceptId)) return;
      if (b.isDefault === true || b.isDefault === 'true') updates.push({ id: String(b.id), data: { isDefault: false } });
    });
    if (!updates.length) return;
    if (window.batchSaveDataToCloud) await batchSaveDataToCloud('companyBanks', updates);
    else {
      for (const u of updates) await saveDataToCloud('companyBanks', u.data, u.id);
    }
  }

  async function save() {
    const data = buildData();
    const err = validate(data);
    if (err) { alert(err); return; }
    const id = _editingId || ('BANK' + Date.now());
    if (data.isDefault) await unsetOtherDefaults(id);
    await saveDataToCloud('companyBanks', data, id);
    $('#companyBankModal').modal('hide');
    if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
    if (typeof populateDropdowns === 'function') populateDropdowns();
  }

  async function remove(id) {
    if (!getBank(id)) return;
    if (!confirm('Eliminare la banca aziendale selezionata? Le fatture gia emesse non vengono modificate.')) return;
    await deleteDataFromCloud('companyBanks', id, { skipRender: true });
    if (window.UiRefresh && typeof window.UiRefresh.refreshMasterDataArea === 'function') window.UiRefresh.refreshMasterDataArea();
    if (typeof populateDropdowns === 'function') populateDropdowns();
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $('#newCompanyBankBtn').on('click', function () { resetForm(); $('#companyBankModal').modal('show'); });
    $('#saveCompanyBankBtn').on('click', save);
    $('#company-banks-table-body').on('click', '.btn-edit-company-bank', function () { openForEdit($(this).attr('data-id')); });
    $('#company-banks-table-body').on('click', '.btn-delete-company-bank', function () { remove($(this).attr('data-id')); });
  }

  window.AppModules.companyBanks.bind = bind;
})();
