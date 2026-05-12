// js/core/permissions-policy.js
// CDSDM 0.7.5 - Permessi UI consolidati, profili, matrice, override, rules rafforzate e audit sicurezza.
// Nota: controlli didattici lato client. La sicurezza reale va applicata con regole Firestore (0.5.3+).

(function () {
  const PUBLIC_TARGETS = ['home', 'dashboard', 'manuale', 'versione', 'gruppi-aziendali'];

  const TARGET_SCOPE = {
    'preventivi': 'sales',
    'ordini-cliente': 'sales',
    'ddt-cliente': 'sales',
    'fatturazione-ddt-cliente': 'sales',
    'nuova-fattura-accompagnatoria': 'invoices',
    'elenco-fatture': 'invoices',
    'anagrafica-clienti': 'customers',

    'ordini-fornitore': 'purchases',
    'ddt-fornitore': 'purchases',
    'nuovo-acquisto': 'purchases',
    'elenco-acquisti': 'purchases',
    'anagrafica-fornitori': 'suppliers',

    'partitario': 'accounting',
    'incassi-pagamenti': 'accounting',
    'prima-nota': 'accounting',
    'estratto-conto': 'accounting',
    'solleciti': 'accounting',
    'riconciliazione-banca': 'accounting',
    'bilancino': 'accounting',
    'scadenziario': 'accounting',
    'registri-iva': 'accounting',
    'tabella-iva': 'accounting',
    'tabella-pagamenti': 'accounting',
    'banche-aziendali': 'accounting',
    'budget-marginalita': 'accounting',

    'anagrafica-prodotti': 'products',
    'magazzino-giacenza-prodotto': 'warehouse',
    'magazzino-giacenze': 'warehouse',
    'magazzino-inventario-fisico': 'warehouse',
    'magazzino-inventario': 'warehouse',
    'magazzino-lotti': 'warehouse',
    'magazzino-movimenti': 'warehouse',
    'magazzino-quarantena': 'warehouse',
    'magazzino-macerati': 'warehouse',

    'commesse': 'projects',
    'progetti': 'projects',
    'timesheet': 'projects',
    'export-timesheet': 'projects',

    'centro-notifiche': 'workflow',
    'workflow-approvativi': 'workflow',
    'operational-reports': 'operationalReports',
    'audit-trail': 'audit',
    'ux-accessibilita': 'settings',
    'centro-stampe': 'print',
    'statistiche': 'reports',
    'report-gestionali': 'reports',
    'mini-bi': 'reports',
    'simulazione-ordinario': 'reports',
    'simulazione-lm': 'reports',

    'anagrafica-azienda': 'settings',
    'uso-dati': 'settings',
    'import-massivi': 'import',
    'ruoli-permessi': 'permissions',
    'profili-permesso': 'permissions',
    'matrice-permessi': 'permissions',
    'override-permessi': 'permissions',
    'audit-sicurezza': 'securityAudit',
    'superadmin': 'permissions',
    'console-docente': 'teacherConsole',
    'migrazione-qa': 'migrationQa',
    'avanzate': 'danger'
  };

  const ROLE_DEFS = {
    admin: {
      id: 'admin', label: 'Amministratore', description: 'Accesso completo a tutte le sezioni e operazioni del Gruppo aziendale.', readOnly: false,
      targets: ['*'], writeScopes: ['*'], canManageGroup: true
    },
    teacher: {
      id: 'teacher', label: 'Docente/Revisore', description: 'Supervisione didattica completa, gestione gruppo e consultazione/scrittura operativa controllata.', readOnly: false,
      targets: ['*'], writeScopes: ['*'], canManageGroup: true
    },
    accounting: {
      id: 'accounting', label: 'Contabilità', description: 'Fatture, acquisti, incassi/pagamenti, scadenziario, registri IVA, partitario e bilancino.', readOnly: false,
      targets: PUBLIC_TARGETS.concat(['elenco-fatture','nuova-fattura-accompagnatoria','nuovo-acquisto','elenco-acquisti','partitario','incassi-pagamenti','prima-nota','estratto-conto','solleciti','riconciliazione-banca','bilancino','scadenziario','registri-iva','tabella-iva','tabella-pagamenti','banche-aziendali','budget-marginalita','centro-stampe','mini-bi','statistiche','report-gestionali','anagrafica-clienti','anagrafica-fornitori','anagrafica-prodotti','centro-notifiche','workflow-approvativi','operational-reports','audit-trail']),
      writeScopes: ['accounting','invoices','purchases','customers','suppliers','products','workflow','operationalReports']
    },
    sales: {
      id: 'sales', label: 'Vendite', description: 'Clienti, preventivi, ordini cliente, DDT cliente, fatture cliente e consultazione commerciale.', readOnly: false,
      targets: PUBLIC_TARGETS.concat(['preventivi','ordini-cliente','ddt-cliente','fatturazione-ddt-cliente','nuova-fattura-accompagnatoria','elenco-fatture','anagrafica-clienti','anagrafica-prodotti','partitario','incassi-pagamenti','scadenziario','centro-stampe','mini-bi','statistiche','report-gestionali','centro-notifiche','workflow-approvativi','operational-reports','audit-trail','commesse','progetti','timesheet','export-timesheet']),
      writeScopes: ['sales','invoices','customers','products','projects','workflow','operationalReports']
    },
    purchases: {
      id: 'purchases', label: 'Acquisti', description: 'Fornitori, ordini fornitore, DDT fornitore, acquisti e anagrafiche correlate.', readOnly: false,
      targets: PUBLIC_TARGETS.concat(['ordini-fornitore','ddt-fornitore','nuovo-acquisto','elenco-acquisti','anagrafica-fornitori','anagrafica-prodotti','scadenziario','partitario','centro-stampe','mini-bi','statistiche','report-gestionali','centro-notifiche','workflow-approvativi','operational-reports','audit-trail']),
      writeScopes: ['purchases','suppliers','products','accounting','workflow','operationalReports']
    },
    warehouse: {
      id: 'warehouse', label: 'Magazzino', description: 'Prodotti, giacenze, inventario, lotti, movimenti, quarantena e documenti di magazzino.', readOnly: false,
      targets: PUBLIC_TARGETS.concat(['anagrafica-prodotti','ordini-cliente','ddt-cliente','ordini-fornitore','ddt-fornitore','magazzino-giacenza-prodotto','magazzino-giacenze','magazzino-inventario-fisico','magazzino-inventario','magazzino-lotti','magazzino-movimenti','magazzino-quarantena','magazzino-macerati','centro-stampe','mini-bi','statistiche','report-gestionali','centro-notifiche','workflow-approvativi','operational-reports','audit-trail']),
      writeScopes: ['warehouse','products','sales','purchases','workflow','operationalReports']
    },
    readonly: {
      id: 'readonly', label: 'Sola lettura', description: 'Consultazione estesa senza creazione, modifica, import o reset.', readOnly: true,
      targets: ['home','dashboard','mini-bi','centro-notifiche','workflow-approvativi','operational-reports','audit-trail','ux-accessibilita','budget-marginalita','bilancino','centro-stampe','mini-bi','statistiche','report-gestionali','preventivi','ordini-cliente','ddt-cliente','fatturazione-ddt-cliente','elenco-fatture','ordini-fornitore','ddt-fornitore','elenco-acquisti','partitario','incassi-pagamenti','prima-nota','estratto-conto','solleciti','riconciliazione-banca','scadenziario','registri-iva','commesse','progetti','timesheet','export-timesheet','simulazione-ordinario','simulazione-lm','anagrafica-clienti','anagrafica-fornitori','anagrafica-prodotti','magazzino-giacenza-prodotto','magazzino-giacenze','magazzino-inventario-fisico','magazzino-inventario','magazzino-lotti','magazzino-movimenti','magazzino-quarantena','magazzino-macerati','uso-dati','gruppi-aziendali','manuale','versione'],
      writeScopes: []
    }
  };

  const LEGACY_ROLE_ALIASES = { commerciale: 'sales', magazzino: 'warehouse', contabilita: 'accounting' };
  const DEFAULT_SETTINGS = { enabled: false, activeRole: 'admin' };

  function getCompanyInfo() {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get('companyInfo') || {};
    if (typeof window.getData === 'function') return window.getData('companyInfo') || {};
    return (window.globalData && window.globalData.companyInfo) || {};
  }

  function normalizeRoleId(role) {
    const raw = String(role || '').trim();
    const mapped = LEGACY_ROLE_ALIASES[raw] || raw;
    return ROLE_DEFS[mapped] ? mapped : 'admin';
  }

  function normalizeSettings(input) {
    const raw = input && typeof input === 'object' ? input : {};
    return { enabled: raw.enabled === true, activeRole: normalizeRoleId(raw.activeRole || raw.currentRole || raw.defaultRole || 'admin'), updatedAt: raw.updatedAt || '' };
  }

  function getSettings() { return normalizeSettings((getCompanyInfo() || {}).accessControl || DEFAULT_SETTINGS); }

  function getBusinessGroupRoleId() {
    const g = window.currentBusinessGroup || null;
    if (!g || !g.id) return '';
    return normalizeRoleId(g.role || (g.membership && g.membership.role) || 'readonly');
  }

  function getCurrentRole() {
    const groupRole = getBusinessGroupRoleId();
    if (groupRole) return ROLE_DEFS[groupRole] || ROLE_DEFS.readonly;
    const settings = getSettings();
    if (!settings.enabled) return ROLE_DEFS.admin;
    return ROLE_DEFS[settings.activeRole] || ROLE_DEFS.admin;
  }

  function isGroupMode() { return !!getBusinessGroupRoleId(); }
  function isAdmin() { const id = getCurrentRole().id; return id === 'admin' || id === 'teacher'; }
  function getScopeForTarget(target) { return TARGET_SCOPE[String(target || '')] || ''; }

  function getActivePermissionOverrides() {
    const g = window.currentBusinessGroup || null;
    if (!g || !g.id) return null;
    const membership = g.membership || {};
    const overrides = membership.permissionOverrides || g.permissionOverrides || null;
    return overrides && typeof overrides === 'object' ? overrides : null;
  }

  function mergePermissionOverrides(basePermissions, overrides) {
    const base = Object.assign({}, basePermissions || {});
    const ov = overrides && typeof overrides === 'object' ? overrides : {};
    Object.keys(ov).forEach(k => {
      const v = String(ov[k] || '').trim();
      if (v && v !== 'inherit') base[k] = v;
    });
    return base;
  }

  function getActiveProfilePermissions() {
    const g = window.currentBusinessGroup || null;
    if (!g || !g.id) return null;
    const membership = g.membership || {};
    const effective = membership.effectiveProfilePermissions || g.effectiveProfilePermissions || null;
    if (effective && typeof effective === 'object') return effective;
    const profilePermissions = membership.profilePermissions || g.profilePermissions || null;
    const overrides = getActivePermissionOverrides();
    if ((!profilePermissions || typeof profilePermissions !== 'object') && (!overrides || typeof overrides !== 'object')) return null;
    return mergePermissionOverrides(profilePermissions || {}, overrides);
  }

  function accessRank(level) {
    const v = String(level || '').trim();
    if (v === 'admin') return 3;
    if (v === 'write') return 2;
    if (v === 'read') return 1;
    return 0;
  }

  function getProfileLevel(scope) {
    const perms = getActiveProfilePermissions();
    if (!perms) return '';
    const s = String(scope || '');
    return Object.prototype.hasOwnProperty.call(perms, s) ? String(perms[s] || 'none') : '';
  }

  function hasProfilePermissions() { return !!getActiveProfilePermissions(); }

  function getModuleCatalog() {
    if (window.PermissionMatrixService && Array.isArray(window.PermissionMatrixService.MODULE_CATALOG)) return window.PermissionMatrixService.MODULE_CATALOG.slice();
    const byScope = {};
    Object.keys(TARGET_SCOPE).forEach(target => {
      const scope = TARGET_SCOPE[target];
      if (!byScope[scope]) byScope[scope] = { id: scope, scope: scope, label: scope, targets: [] };
      byScope[scope].targets.push(target);
    });
    return Object.values(byScope);
  }

  function getModuleForTarget(target) {
    if (window.PermissionMatrixService && typeof window.PermissionMatrixService.getModuleByTarget === 'function') return window.PermissionMatrixService.getModuleByTarget(target);
    const scope = getScopeForTarget(target);
    return scope ? { id: scope, scope: scope, targets: [target] } : null;
  }

  function getModuleForScope(scope) {
    if (window.PermissionMatrixService && typeof window.PermissionMatrixService.getModuleByScope === 'function') return window.PermissionMatrixService.getModuleByScope(scope);
    return scope ? { id: scope, scope: scope } : null;
  }

  function getPermissionLevel(scopeOrTarget) {
    const key = String(scopeOrTarget || '');
    const scope = TARGET_SCOPE[key] || key;
    const profileLevel = getProfileLevel(scope);
    if (profileLevel) return profileLevel;
    const role = getCurrentRole();
    if (role.targets.indexOf('*') >= 0 || role.writeScopes.indexOf('*') >= 0) return 'admin';
    if (role.writeScopes.indexOf(scope) >= 0) return 'write';
    if (role.targets.indexOf(key) >= 0 || getModuleCatalog().some(m => m.scope === scope && (m.targets || []).some(t => role.targets.indexOf(t) >= 0))) return 'read';
    return role.readOnly ? 'read' : 'none';
  }

  function canAdmin(scope) { return accessRank(getPermissionLevel(scope)) >= 3; }


  function isReadOnly() {
    const role = getCurrentRole();
    const perms = getActiveProfilePermissions();
    if (!perms) return !!role.readOnly;
    return !Object.keys(perms).some(k => accessRank(perms[k]) >= 2);
  }

  function canAccessTarget(target) {
    if (!target) return true;
    const t = String(target);
    if (PUBLIC_TARGETS.indexOf(t) >= 0) return true;
    const scope = getScopeForTarget(t);
    const profileLevel = getProfileLevel(scope);
    if (profileLevel) return accessRank(profileLevel) >= 1;
    const role = getCurrentRole();
    return role.targets.indexOf('*') >= 0 || role.targets.indexOf(t) >= 0;
  }

  function canWrite(scope) {
    const role = getCurrentRole();
    const s = String(scope || '');
    const profileLevel = getProfileLevel(s);
    if (profileLevel) return accessRank(profileLevel) >= 2;
    if (role.readOnly) return false;
    if (role.writeScopes.indexOf('*') >= 0) return true;
    if (!s) return !role.readOnly;
    return role.writeScopes.indexOf(s) >= 0;
  }

  function canWriteTarget(target) {
    const scope = getScopeForTarget(target);
    if (!scope) return !isReadOnly();
    return canWrite(scope);
  }


  function classifyPermissionAction($el) {
    const explicit = $el.attr('data-permission-action') || $el.closest('[data-permission-action]').attr('data-permission-action');
    if (explicit) return String(explicit);
    const blob = [String($el.attr('id') || ''), String($el.attr('class') || ''), String($el.text() || $el.val() || '')].join(' ').toLowerCase();
    if (/delete|remove|reset|elimina|rimuovi|cancella|svuota|ripristina/.test(blob)) return 'canDelete';
    if (/import|upload|importa|carica/.test(blob)) return 'canImport';
    if (/config|setting|profile|permission|role|matrix|configura|permesso|profilo|ruolo|matrice/.test(blob)) return 'canConfigure';
    if (/add|create|new|genera|aggiungi|crea|nuovo/.test(blob)) return 'canCreate';
    if (/save|edit|update|approve|reject|block|pay|submit|salva|modifica|aggiorna|approva|respingi|blocca|paga|registra/.test(blob)) return 'canEdit';
    return 'canEdit';
  }

  function canPerformAction(scope, action) {
    const s = String(scope || '');
    const level = getPermissionLevel(s);
    const act = String(action || 'canEdit');
    if (window.PermissionMatrixService && typeof window.PermissionMatrixService.actionsForLevel === 'function') {
      const model = window.PermissionMatrixService.actionsForLevel(level);
      if (Object.prototype.hasOwnProperty.call(model, act)) return model[act] === true;
    }
    if (act === 'canDelete' || act === 'canImport' || act === 'canConfigure') return accessRank(level) >= 3;
    if (act === 'canCreate' || act === 'canEdit') return accessRank(level) >= 2;
    if (act === 'canViewData' || act === 'canOpenMenu') return accessRank(level) >= 1;
    return canWrite(s);
  }

  function getDeniedMessage(targetOrScope) {
    const role = getCurrentRole();
    const mode = isGroupMode() ? 'nel Gruppo aziendale attivo' : 'nel profilo applicativo legacy';
    const profile = getActiveProfilePermissions() ? ' e dalla matrice/profilo/override permesso consolidata' : '';
    return 'Operazione non consentita per il ruolo "' + role.label + '" ' + mode + profile + '. I permessi UI restano controlli didattici: la sicurezza Firestore reale è documentata dalle regole 0.6.x.';
  }

  function currentVisibleTarget() {
    const $section = $('.content-section').not('.d-none').first();
    return $section.attr('id') || $('.sidebar .nav-link.active[data-target]').data('target') || '';
  }

  function classifyWriteScope($el) {
    const direct = $el.attr('data-permission-scope') || $el.closest('[data-permission-scope]').attr('data-permission-scope');
    if (direct) return direct;
    const target = $el.attr('data-target') || $el.closest('.content-section').attr('id') || currentVisibleTarget();
    return getScopeForTarget(target) || 'general';
  }

  function isSafeAction($el) {
    if (!$el || !$el.length) return true;
    const id = String($el.attr('id') || '').toLowerCase();
    const cls = String($el.attr('class') || '').toLowerCase();
    const text = String($el.text() || $el.val() || '').toLowerCase();
    if ($el.is('a.nav-link, [data-bs-toggle], .bg-select-group, #business-group-selector, #logout-btn, #btn-view-changelog, #btn-back-to-index, #save-permissions-settings, #permission-profile-select, .member-profile-select, #permission-matrix-filter, #permission-matrix-refresh-btn, #permission-matrix-copy-json-btn, #permission-override-member-select')) return true;
    if (/filter|search|refresh|print|export|download|copy|view|open|back|close|cancel|annulla|chiudi|stampa|esporta|scarica|copia|apri|visualizza/.test(id + ' ' + cls + ' ' + text)) return true;
    return false;
  }

  function isWriteAction($el) {
    if (!$el || !$el.length || isSafeAction($el)) return false;
    const id = String($el.attr('id') || '').toLowerCase();
    const cls = String($el.attr('class') || '').toLowerCase();
    const text = String($el.text() || $el.val() || '').toLowerCase();
    const blob = id + ' ' + cls + ' ' + text;
    return $el.is('button, input[type="button"], input[type="submit"], a.btn') && /save|delete|add|create|new|import|reset|remove|revoke|accept|approve|reject|block|review|pay|submit|salva|elimina|aggiungi|crea|nuovo|importa|reset|rimuovi|revoca|accetta|approva|respingi|blocca|paga|genera/.test(blob);
  }

  function isCurrentSuperadmin() {
    try {
      return !!(window.SuperadminService && typeof window.SuperadminService.isCurrentUserSuperadmin === 'function' && window.SuperadminService.isCurrentUserSuperadmin());
    } catch (e) { return false; }
  }

  function canSeeAdvancedMenu(kind) {
    const role = getCurrentRole();
    const id = String(role && role.id || '');
    const k = String(kind || 'admin-teacher-superadmin');
    if (k === 'superadmin-only') return isCurrentSuperadmin() || id === 'superadmin';
    return isCurrentSuperadmin() || id === 'admin' || id === 'teacher' || id === 'superadmin';
  }

  function applyUiRestrictions() {
    const role = getCurrentRole();
    const mode = isGroupMode();

    function hideLegacyMenuItems() {
      // 0.13.19: le azioni legacy spostate dentro le pagine elenco non devono
      // riapparire quando la policy permessi ricalcola i menu per un ruolo abilitato.
      $('[data-menu-legacy]').addClass('d-none menu-legacy-hidden').attr('aria-hidden', 'true');
    }

    $('.sidebar .nav-link[data-target]').each(function () {
      const target = $(this).data('target');
      const allowed = canAccessTarget(target);
      $(this).closest('li').toggleClass('d-none permission-hidden', !allowed);
    });

    $('[data-menu-visibility]').each(function () {
      const visibility = $(this).attr('data-menu-visibility') || 'admin-teacher-superadmin';
      const allowed = canSeeAdvancedMenu(visibility);
      $(this).toggleClass('d-none permission-hidden menu-advanced-hidden', !allowed);
    });

    // 0.13.17+: queste voci sono nascoste per pulizia menu anche se la route resta disponibile.
    $('[data-menu-cleanup="0.13.17"]').addClass('d-none menu-cleanup-hidden');
    hideLegacyMenuItems();

    $('.nav-section-container').each(function () {
      const visibleLinks = $(this).find('.nav-link[data-target]').filter(function () {
        const $li = $(this).closest('li');
        return !$li.hasClass('d-none') && !$li.is('[data-menu-legacy]');
      });
      $(this).toggleClass('d-none permission-hidden', visibleLinks.length === 0);
    });

    $('[data-target="gruppi-aziendali"]').closest('li').removeClass('d-none permission-hidden');
    if (isAdmin()) {
      $('[data-target="ruoli-permessi"]').closest('li').removeClass('d-none permission-hidden');
      $('[data-target="console-docente"],[data-target="migrazione-qa"]').closest('li').removeClass('d-none permission-hidden');
    } else {
      $('[data-target="ruoli-permessi"]').closest('li').toggleClass('d-none permission-hidden', mode);
      $('[data-target="console-docente"],[data-target="migrazione-qa"]').closest('li').addClass('d-none permission-hidden');
    }
    $('#section-organizzazione').removeClass('d-none permission-hidden');
    $('[data-menu-visibility]').each(function () {
      const visibility = $(this).attr('data-menu-visibility') || 'admin-teacher-superadmin';
      $(this).toggleClass('d-none permission-hidden menu-advanced-hidden', !canSeeAdvancedMenu(visibility));
    });
    $('[data-menu-cleanup="0.13.17"]').addClass('d-none menu-cleanup-hidden');
    hideLegacyMenuItems();

    $('[data-permission-target]').each(function () {
      const allowed = canAccessTarget($(this).attr('data-permission-target'));
      $(this).toggleClass('d-none permission-hidden', !allowed);
    });

    $('button, input[type="button"], input[type="submit"], a.btn').each(function () {
      const $el = $(this);
      if (!isWriteAction($el)) return;
      const scope = classifyWriteScope($el);
      const action = classifyPermissionAction($el);
      const allowed = canPerformAction(scope, action);
      $el.attr('data-permission-action-resolved', action);
      $el.prop('disabled', !allowed).toggleClass('disabled permission-readonly', !allowed).attr('aria-disabled', allowed ? 'false' : 'true');
      if (!allowed && !$el.attr('title')) $el.attr('title', 'Non disponibile per il ruolo ' + role.label);
    });

    $('#permission-status-badge,#permission-mode-badge').remove();
    $('#user-name-sidebar').after('<p id="permission-status-badge" class="small text-white-50 mb-0"><i class="fas fa-user-shield me-1"></i>' + role.label + '</p>' +
      '<p id="permission-mode-badge" class="small text-white-50 mb-0"><i class="fas fa-eye me-1"></i>Permessi UI 0.7.5' + (mode ? ' gruppo' : ' legacy') + '</p>');
  }

  let guardBound = false;
  function bindPermissionGuard() {
    if (guardBound || !window.jQuery) return;
    guardBound = true;
    $(document).on('click.permissionsGuard submit.permissionsGuard', 'button, input[type="button"], input[type="submit"], a.btn, form', function (e) {
      const $el = $(this);
      if ($el.is('form')) return;
      if (!isWriteAction($el)) return;
      const scope = classifyWriteScope($el);
      const action = classifyPermissionAction($el);
      if (!canPerformAction(scope, action)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        alert(getDeniedMessage(scope));
        return false;
      }
    });
  }

  window.PermissionsPolicy = {
    VERSION: '0.7.5',
    roles: ROLE_DEFS,
    legacyRoleAliases: LEGACY_ROLE_ALIASES,
    defaults: DEFAULT_SETTINGS,
    targetScopes: TARGET_SCOPE,
    normalizeRoleId,
    normalizeSettings,
    getSettings,
    getBusinessGroupRoleId,
    getCurrentRole,
    getActiveProfilePermissions,
    getActivePermissionOverrides,
    mergePermissionOverrides,
    hasProfilePermissions,
    getModuleCatalog,
    getModuleForTarget,
    getModuleForScope,
    getPermissionLevel,
    canAdmin,
    accessRank,
    getProfileLevel,
    canAccessTarget,
    canWrite,
    canWriteTarget,
    canPerformAction,
    classifyPermissionAction,
    isReadOnly,
    isAdmin,
    isGroupMode,
    getScopeForTarget,
    getDeniedMessage,
    applyUiRestrictions,
    bindPermissionGuard
  };

  bindPermissionGuard();
})();
