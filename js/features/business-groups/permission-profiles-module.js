// js/features/business-groups/permission-profiles-module.js
// CDSDM 0.13.15 — UI Profili permesso robusta senza override individuali.

(function () {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.permissionProfiles = window.AppModules.permissionProfiles || {};
  let _bound = false;

  function esc(v) { return $('<div>').text(v == null ? '' : String(v)).html(); }

  function levelOptions(value) {
    const levels = window.PermissionProfilesService.ACCESS_LEVELS;
    return Object.keys(levels).map(k => `<option value="${k}" ${String(value || 'none') === k ? 'selected' : ''}>${esc(levels[k].label)}</option>`).join('');
  }

  function collectPermissions(prefix) {
    const out = {};
    (window.PermissionProfilesService.MODULES || []).forEach(m => {
      out[m.id] = $('#' + prefix + '-perm-' + m.id).val() || 'none';
    });
    return out;
  }

  function roleKeys(bgSvc) {
    if (bgSvc && bgSvc.ROLES && typeof bgSvc.ROLES === 'object' && !Array.isArray(bgSvc.ROLES)) {
      return Object.keys(bgSvc.ROLES);
    }
    if (bgSvc && Array.isArray(bgSvc.ROLES)) return bgSvc.ROLES.slice();
    return ['admin','teacher','accounting','sales','purchases','warehouse','readonly'];
  }

  function roleOptions(bgSvc, selectedRole) {
    return roleKeys(bgSvc).map(r => `<option value="${esc(r)}" ${String(selectedRole || '') === r ? 'selected' : ''}>${esc(bgSvc && bgSvc.roleLabel ? bgSvc.roleLabel(r) : r)}</option>`).join('');
  }

  function profileMatrix(profile, prefix) {
    const p = (profile && profile.permissions) || {};
    return `<div class="table-responsive"><table class="table table-sm align-middle mb-0"><thead><tr><th>Modulo</th><th style="width:220px">Permesso</th></tr></thead><tbody>${window.PermissionProfilesService.MODULES.map(m => `
      <tr><td><strong>${esc(m.label)}</strong><br><span class="text-muted small"><code>${esc(m.id)}</code> / scope <code>${esc(m.scope)}</code></span></td><td><select class="form-select form-select-sm" id="${prefix}-perm-${esc(m.id)}">${levelOptions(p[m.id] || 'none')}</select></td></tr>`).join('')}</tbody></table></div>`;
  }

  async function render() {
    const svc = window.PermissionProfilesService;
    const bgSvc = window.BusinessGroupsService;
    const root = $('#permission-profiles-root');
    if (!root.length) return;
    if (!svc) {
      root.html('<div class="alert alert-danger">PermissionProfilesService non inizializzato. Ricarica la pagina.</div>');
      return;
    }

    try {
      const active = window.currentBusinessGroup || null;
      const canManage = !!(bgSvc && bgSvc.canManageActiveGroup && bgSvc.canManageActiveGroup());
      if (!active || !active.id) {
        root.html('<div class="alert alert-info">Seleziona un Gruppo aziendale per configurare i profili permesso.</div>');
        return;
      }

      const profiles = await svc.listProfiles(active.id);
      const members = bgSvc && bgSvc.listMembers ? await bgSvc.listMembers(active.id) : [];
      const selectedId = $('#permission-profile-select').val() || (profiles[0] && profiles[0].id) || '';
      const selected = profiles.find(p => p.id === selectedId) || profiles[0] || null;
      const profileOptions = profiles.map(p => `<option value="${esc(p.id)}" ${selected && selected.id === p.id ? 'selected' : ''}>${esc(p.name || p.id)} — ${esc(p.roleBase || '')}</option>`).join('');
      const noProfilesBox = profiles.length ? '' : `<div class="alert alert-warning small">
        Nessun profilo permesso è ancora presente nel gruppo attivo. Usa <strong>Crea predefiniti</strong> per generare i profili standard
        admin, teacher, contabilità, vendite, acquisti, magazzino e sola lettura.
      </div>`;
      const memberRows = members.length ? members.map(m => `<tr>
        <td><strong>${esc(m.email || m.uid)}</strong><br><code class="small">${esc(m.uid)}</code></td>
        <td>${esc(m.roleLabel || (bgSvc && bgSvc.roleLabel ? bgSvc.roleLabel(m.role) : m.role) || '')}</td>
        <td>${esc(m.permissionProfileName || m.permissionProfileId || '—')}</td>
        <td style="min-width:220px"><select class="form-select form-select-sm member-profile-select" data-uid="${esc(m.uid)}" ${canManage ? '' : 'disabled'}>
          <option value="">Nessun profilo specifico</option>${profiles.map(p => `<option value="${esc(p.id)}" ${m.permissionProfileId === p.id ? 'selected' : ''}>${esc(p.name || p.id)}</option>`).join('')}
        </select></td>
      </tr>`).join('') : '<tr><td colspan="4" class="text-muted">Nessun membro nel gruppo attivo. Se un invito è stato accettato, torna in Gruppi aziendali e ricarica i dati del gruppo.</td></tr>';

      root.html(`
        <div class="alert alert-primary small">
          <strong>Versione 0.13.15.</strong> I privilegi si gestiscono tramite <strong>ruolo</strong> e <strong>profilo permesso</strong> del membro.
          Gli override individuali restano legacy e non sono più il percorso operativo consigliato.
        </div>
        ${noProfilesBox}
        <div class="row g-3">
          <div class="col-xl-5">
            <div class="card shadow-sm h-100"><div class="card-body">
              <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
                <h5 class="card-title mb-0"><i class="fas fa-layer-group me-2"></i>Profili del gruppo</h5>
                <button class="btn btn-sm btn-outline-primary" id="permission-profiles-init-btn" type="button" ${canManage ? '' : 'disabled'}>Crea predefiniti</button>
              </div>
              <select class="form-select mb-3" id="permission-profile-select">${profileOptions || '<option value="">Nessun profilo</option>'}</select>
              <div class="mb-2"><label class="form-label" for="permission-profile-id">ID profilo</label><input class="form-control" id="permission-profile-id" value="${esc(selected && selected.id || '')}" ${canManage && !(selected && selected.isSystemDefault) ? '' : 'readonly'}></div>
              <div class="mb-2"><label class="form-label" for="permission-profile-name">Nome</label><input class="form-control" id="permission-profile-name" value="${esc(selected && selected.name || '')}" ${canManage ? '' : 'disabled'}></div>
              <div class="mb-2"><label class="form-label" for="permission-profile-role">Ruolo base</label><select class="form-select" id="permission-profile-role" ${canManage ? '' : 'disabled'}>${roleOptions(bgSvc, selected && selected.roleBase)}</select></div>
              <div class="mb-2"><label class="form-label" for="permission-profile-description">Descrizione</label><textarea class="form-control" id="permission-profile-description" rows="3" ${canManage ? '' : 'disabled'}>${esc(selected && selected.description || '')}</textarea></div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" id="permission-profile-save-btn" type="button" ${canManage ? '' : 'disabled'}><i class="fas fa-save me-1"></i>Salva profilo</button>
                <button class="btn btn-outline-secondary" id="permission-profile-new-btn" type="button" ${canManage ? '' : 'disabled'}>Nuovo da ruolo</button>
                <button class="btn btn-outline-danger" id="permission-profile-delete-btn" type="button" ${canManage && selected && !selected.isSystemDefault ? '' : 'disabled'}>Elimina</button>
              </div>
            </div></div>
          </div>
          <div class="col-xl-7">
            <div class="card shadow-sm h-100"><div class="card-body">
              <h5 class="card-title"><i class="fas fa-table-list me-2"></i>Matrice moduli del profilo</h5>
              ${selected ? profileMatrix(selected, 'permission-profile') : '<div class="text-muted">Crea o seleziona un profilo.</div>'}
            </div></div>
          </div>
        </div>
        <div class="card shadow-sm mt-3"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-users-gear me-2"></i>Assegna profili ai membri</h5>
          <p class="text-muted small mb-2">Per modificare i privilegi di un collaboratore, assegna qui un profilo permesso. La Matrice permessi descrive i moduli; questa sezione collega profilo e membro.</p>
          <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Membro</th><th>Ruolo</th><th>Profilo attuale</th><th>Assegna</th></tr></thead><tbody>${memberRows}</tbody></table></div>
        </div></div>
      `);
    } catch (e) {
      console.error('Errore render Profili permesso:', e);
      root.html('<div class="alert alert-danger"><strong>Errore caricamento Profili permesso.</strong><br>' + esc(e && e.message ? e.message : e) + '<br><span class="small">Verifica che il Gruppo aziendale sia attivo e che le regole Firestore pubblicate siano quelle della build corrente.</span></div>');
    }
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '[data-target="profili-permesso"]', function () { setTimeout(function () { render(); }, 0); });
    $(document).on('click', '#permission-profiles-init-btn', async function () {
      try { const res = await window.PermissionProfilesService.ensureDefaultProfiles(); await render(); alert('Profili predefiniti creati: ' + (res && res.created || 0)); }
      catch (e) { console.error(e); alert('Errore inizializzazione profili: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('change', '#permission-profile-select', async function () { try { await render(); } catch (e) { console.error(e); } });
    $(document).on('click', '#permission-profile-new-btn', async function () {
      const role = $('#permission-profile-role').val() || 'readonly';
      const tpl = window.PermissionProfilesService.templateProfile(role);
      tpl.id = role + '_custom_' + Date.now().toString(36);
      tpl.name = tpl.name + ' personalizzato';
      $('#permission-profile-id').val(tpl.id);
      $('#permission-profile-name').val(tpl.name);
      $('#permission-profile-role').val(tpl.roleBase);
      $('#permission-profile-description').val(tpl.description);
      Object.keys(tpl.permissions).forEach(k => $('#permission-profile-perm-' + k).val(tpl.permissions[k]));
    });
    $(document).on('click', '#permission-profile-save-btn', async function () {
      try {
        const doc = await window.PermissionProfilesService.saveProfile(null, {
          id: $('#permission-profile-id').val(),
          name: $('#permission-profile-name').val(),
          roleBase: $('#permission-profile-role').val(),
          description: $('#permission-profile-description').val(),
          permissions: collectPermissions('permission-profile')
        });
        await render();
        $('#permission-profile-select').val(doc.id);
        alert('Profilo permesso salvato.');
      } catch (e) { console.error(e); alert('Errore salvataggio profilo: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#permission-profile-delete-btn', async function () {
      try {
        const id = $('#permission-profile-select').val();
        if (!id || !confirm('Eliminare il profilo selezionato?')) return;
        await window.PermissionProfilesService.deleteProfile(null, id);
        await render();
      } catch (e) { console.error(e); alert('Errore eliminazione profilo: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('change', '.member-profile-select', async function () {
      try {
        const uid = $(this).data('uid');
        const profileId = $(this).val();
        if (profileId) await window.PermissionProfilesService.assignProfileToMember(null, uid, profileId);
        else await window.PermissionProfilesService.clearMemberProfile(null, uid);
        await render();
        if (typeof renderAll === 'function') renderAll();
      } catch (e) { console.error(e); alert('Errore assegnazione profilo: ' + (e && e.message ? e.message : e)); await render(); }
    });
  }

  window.AppModules.permissionProfiles.bind = bind;
  window.AppModules.permissionProfiles.render = render;
})();
