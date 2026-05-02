// js/core/permissions-policy.js
// 0.3.1 - Ruoli e permessi applicativi front-end.
// Nota: controlli didattici lato client. La sicurezza reale va applicata con regole Firestore.

(function () {
  const ROLE_DEFS = {
    admin: {
      id: 'admin', label: 'Admin', description: 'Accesso completo a tutte le sezioni e operazioni.', readOnly: false,
      targets: ['*'], writeScopes: ['*']
    },
    commerciale: {
      id: 'commerciale', label: 'Commerciale', description: 'Vendite, clienti, preventivi, ordini, DDT cliente, fatture e consultazione KPI.', readOnly: false,
      targets: ['home','dashboard','centro-notifiche','workflow-approvativi','audit-trail','ux-accessibilita','budget-marginalita','bilancino','centro-stampe','statistiche','report-gestionali','preventivi','ordini-cliente','ddt-cliente','fatturazione-ddt-cliente','nuova-fattura-accompagnatoria','elenco-fatture','partitario','incassi-pagamenti','prima-nota','estratto-conto','solleciti','riconciliazione-banca','scadenziario','anagrafica-clienti','anagrafica-prodotti','manuale','versione'],
      writeScopes: ['sales','customers','invoices','scadenziario']
    },
    magazzino: {
      id: 'magazzino', label: 'Magazzino', description: 'Magazzino, prodotti, ordini/DT di magazzino e report operativi.', readOnly: false,
      targets: ['home','dashboard','centro-notifiche','workflow-approvativi','audit-trail','ux-accessibilita','budget-marginalita','bilancino','centro-stampe','report-gestionali','anagrafica-prodotti','ordini-cliente','ddt-cliente','ordini-fornitore','ddt-fornitore','magazzino-giacenza-prodotto','magazzino-giacenze','magazzino-inventario-fisico','magazzino-inventario','magazzino-lotti','magazzino-movimenti','magazzino-quarantena','magazzino-macerati','manuale','versione'],
      writeScopes: ['warehouse','products']
    },
    contabilita: {
      id: 'contabilita', label: 'Contabilità', description: 'Fatture, acquisti, scadenzario, registri IVA, fiscalità e report.', readOnly: false,
      targets: ['home','dashboard','centro-notifiche','workflow-approvativi','audit-trail','ux-accessibilita','budget-marginalita','bilancino','centro-stampe','statistiche','report-gestionali','nuova-fattura-accompagnatoria','elenco-fatture','nuovo-acquisto','elenco-acquisti','partitario','incassi-pagamenti','prima-nota','estratto-conto','solleciti','riconciliazione-banca','scadenziario','registri-iva','simulazione-ordinario','simulazione-lm','anagrafica-clienti','anagrafica-fornitori','anagrafica-prodotti','tabella-iva','tabella-pagamenti','banche-aziendali','manuale','versione'],
      writeScopes: ['accounting','invoices','purchases','scadenziario','masterdata']
    },
    readonly: {
      id: 'readonly', label: 'Sola lettura', description: 'Consultazione estesa senza creazione, modifica, import o reset.', readOnly: true,
      targets: ['home','dashboard','centro-notifiche','workflow-approvativi','audit-trail','ux-accessibilita','budget-marginalita','bilancino','centro-stampe','statistiche','report-gestionali','preventivi','ordini-cliente','ddt-cliente','fatturazione-ddt-cliente','elenco-fatture','ordini-fornitore','ddt-fornitore','elenco-acquisti','partitario','incassi-pagamenti','prima-nota','estratto-conto','solleciti','riconciliazione-banca','scadenziario','registri-iva','commesse','progetti','timesheet','export-timesheet','simulazione-ordinario','simulazione-lm','anagrafica-clienti','anagrafica-fornitori','anagrafica-prodotti','magazzino-giacenza-prodotto','magazzino-giacenze','magazzino-inventario-fisico','magazzino-inventario','magazzino-lotti','magazzino-movimenti','magazzino-quarantena','magazzino-macerati','uso-dati','manuale','versione'],
      writeScopes: []
    }
  };

  const DEFAULT_SETTINGS = { enabled: false, activeRole: 'admin' };

  function getCompanyInfo() {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get('companyInfo') || {};
    if (typeof window.getData === 'function') return window.getData('companyInfo') || {};
    return (window.globalData && window.globalData.companyInfo) || {};
  }

  function normalizeSettings(input) {
    const raw = input && typeof input === 'object' ? input : {};
    const role = ROLE_DEFS[raw.activeRole] ? raw.activeRole : 'admin';
    return { enabled: raw.enabled === true, activeRole: role, updatedAt: raw.updatedAt || '' };
  }

  function getSettings() {
    return normalizeSettings((getCompanyInfo() || {}).accessControl || DEFAULT_SETTINGS);
  }

  function getCurrentRole() {
    const settings = getSettings();
    if (!settings.enabled) return ROLE_DEFS.admin;
    return ROLE_DEFS[settings.activeRole] || ROLE_DEFS.admin;
  }

  function isAdmin() { return getCurrentRole().id === 'admin'; }

  function canAccessTarget(target) {
    if (!target) return true;
    const role = getCurrentRole();
    return role.targets.indexOf('*') >= 0 || role.targets.indexOf(String(target)) >= 0;
  }

  function isReadOnly() {
    const settings = getSettings();
    return settings.enabled === true && !!getCurrentRole().readOnly;
  }

  function canWrite(scope) {
    const role = getCurrentRole();
    if (role.writeScopes.indexOf('*') >= 0) return true;
    return !isReadOnly() && (!scope || role.writeScopes.indexOf(String(scope)) >= 0);
  }

  function getDeniedMessage(target) {
    const role = getCurrentRole();
    return 'Accesso non consentito per il ruolo applicativo "' + role.label + '". Modifica il ruolo in Impostazioni > Ruoli e permessi.';
  }

  function applyUiRestrictions() {
    const role = getCurrentRole();
    const settings = getSettings();

    $('.sidebar .nav-link[data-target]').each(function () {
      const target = $(this).data('target');
      const allowed = !settings.enabled || canAccessTarget(target);
      $(this).closest('li').toggleClass('d-none permission-hidden', !allowed);
    });

    $('.nav-section-container').each(function () {
      const visibleLinks = $(this).find('.nav-link[data-target]').filter(function () { return !$(this).closest('li').hasClass('d-none'); });
      $(this).toggleClass('d-none permission-hidden', visibleLinks.length === 0);
    });

    $('[data-target="ruoli-permessi"]').closest('li').removeClass('d-none permission-hidden');
    $('#section-settings').removeClass('d-none permission-hidden');

    const readOnly = isReadOnly();
    const writeSelectors = [
      'button[id^="save"]','#payev-save-btn','#cashbook-save-btn','button[id^="delete"]','button[id^="add"]','button[id^="import"]','button[id^="reset"]','button[id^="btn-delete"]','button[id^="btn-reset"]','button[id^="btn-import"]',
      '#menu-nuova-fattura','#menu-nuova-nota-credito','#menu-nuovo-preventivo-cliente','#menu-nuovo-ordine-cliente','#menu-nuovo-ordine-fornitore','#menu-nuovo-acquisto',
      '.btn-danger','.btn-warning'
    ].join(',');
    $(writeSelectors).not('#logout-btn,#btn-view-changelog,#btn-back-to-index,#save-permissions-settings').prop('disabled', readOnly).toggleClass('disabled permission-readonly', readOnly);

    $('#permission-status-badge').remove();
    if (settings.enabled) {
      $('#user-name-sidebar').after('<p id="permission-status-badge" class="small text-white-50 mb-0"><i class="fas fa-user-shield me-1"></i>' + role.label + '</p>');
    }
  }

  window.PermissionsPolicy = {
    roles: ROLE_DEFS,
    defaults: DEFAULT_SETTINGS,
    normalizeSettings,
    getSettings,
    getCurrentRole,
    canAccessTarget,
    canWrite,
    isReadOnly,
    isAdmin,
    getDeniedMessage,
    applyUiRestrictions
  };
})();
