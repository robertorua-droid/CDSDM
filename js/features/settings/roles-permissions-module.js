// js/features/settings/roles-permissions-module.js
// 0.2.6 - UI impostazioni ruoli e permessi applicativi.

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.rolesPermissions = window.AppModules.rolesPermissions || {};

  let _bound = false;

  function getCompanyInfo() {
    if (window.AppStore && typeof window.AppStore.get === 'function') return window.AppStore.get('companyInfo') || {};
    if (typeof window.getData === 'function') return window.getData('companyInfo') || {};
    return (window.globalData && window.globalData.companyInfo) || {};
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; });
  }

  function renderRoleCards(activeRole) {
    const roles = (window.PermissionsPolicy && window.PermissionsPolicy.roles) || {};
    return Object.keys(roles).map(function (key) {
      const role = roles[key];
      const targets = role.targets.indexOf('*') >= 0 ? 'Tutte le sezioni' : role.targets.length + ' sezioni abilitate';
      const writes = role.writeScopes.indexOf('*') >= 0 ? 'Scrittura completa' : (role.readOnly ? 'Sola lettura' : role.writeScopes.join(', '));
      return '<div class="col-md-6 col-xl-4">' +
        '<div class="card h-100 shadow-sm ' + (activeRole === key ? 'border-primary' : '') + '">' +
        '<div class="card-body">' +
        '<div class="d-flex justify-content-between align-items-start mb-2"><h3 class="h6 mb-0">' + esc(role.label) + '</h3>' + (activeRole === key ? '<span class="badge text-bg-primary">Attivo</span>' : '') + '</div>' +
        '<p class="small text-muted">' + esc(role.description) + '</p>' +
        '<div class="small"><strong>Accesso:</strong> ' + esc(targets) + '</div>' +
        '<div class="small"><strong>Scrittura:</strong> ' + esc(writes) + '</div>' +
        '</div></div></div>';
    }).join('');
  }

  function render() {
    const policy = window.PermissionsPolicy;
    if (!policy) return;
    const settings = policy.getSettings();
    const role = policy.getCurrentRole();
    const roles = policy.roles;
    const options = Object.keys(roles).map(function (key) {
      return '<option value="' + esc(key) + '" ' + (settings.activeRole === key ? 'selected' : '') + '>' + esc(roles[key].label) + '</option>';
    }).join('');

    $('#roles-permissions-container').html(`
      <div class="alert alert-warning shadow-sm">
        <strong>Nota di sicurezza.</strong> I ruoli 0.2.6 sono controlli applicativi front-end per didattica e UX. Per sicurezza reale multiutente servono regole Firestore coerenti e un modello organizzazione/utenti.
      </div>
      <div class="row g-3 mb-3">
        <div class="col-lg-5">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h3 class="h5 mb-3"><i class="fas fa-user-shield me-2"></i>Configurazione attiva</h3>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" role="switch" id="permissions-enabled" ${settings.enabled ? 'checked' : ''}>
                <label class="form-check-label" for="permissions-enabled">Abilita controlli applicativi</label>
              </div>
              <label class="form-label" for="permissions-active-role">Ruolo applicativo corrente</label>
              <select class="form-select" id="permissions-active-role">${options}</select>
              <p class="small text-muted mt-2 mb-3">Ruolo attuale: <strong>${esc(role.label)}</strong>. Le limitazioni sono applicate a menu, accesso sezione e pulsanti di scrittura in sola lettura.</p>
              <button class="btn btn-primary" id="save-permissions-settings" type="button"><i class="fas fa-save me-1"></i>Salva impostazioni</button>
            </div>
          </div>
        </div>
        <div class="col-lg-7">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <h3 class="h5 mb-3">Limiti dichiarati</h3>
              <ul class="small mb-0">
                <li>Non viene introdotto backend custom.</li>
                <li>La persistenza resta in <code>settings/companyInfo.accessControl</code>.</li>
                <li>Il controllo è reversibile e compatibile con dati esistenti.</li>
                <li>Il ruolo <em>Sola lettura</em> disabilita le azioni principali di modifica lato UI.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <h3 class="h5 mb-3">Profili disponibili</h3>
      <div class="row g-3">${renderRoleCards(settings.activeRole)}</div>
    `);
  }

  async function save() {
    const company = getCompanyInfo();
    const accessControl = {
      enabled: $('#permissions-enabled').is(':checked'),
      activeRole: $('#permissions-active-role').val() || 'admin',
      updatedAt: new Date().toISOString()
    };
    await window.saveDataToCloud('companyInfo', { ...company, accessControl });
    render();
    if (window.PermissionsPolicy) window.PermissionsPolicy.applyUiRestrictions();
    alert('Ruoli e permessi applicativi salvati.');
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $(document).on('click', '#save-permissions-settings', save);
    if (window.AppStore && typeof window.AppStore.subscribe === 'function') {
      window.AppStore.subscribe('companyInfo', function () {
        if ($('#ruoli-permessi').is(':visible')) render();
        if (window.PermissionsPolicy) window.PermissionsPolicy.applyUiRestrictions();
      });
    }
  }

  window.AppModules.rolesPermissions.render = render;
  window.AppModules.rolesPermissions.bind = bind;
})();
