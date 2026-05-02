// js/features/business-groups/permission-overrides-module.js
// CDSDM 0.6.4 — UI override permessi per singolo membro.

(function () {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.permissionOverrides = window.AppModules.permissionOverrides || {};
  let _bound = false;

  function esc(v) { return $('<div>').text(v == null ? '' : String(v)).html(); }
  function svc() { return window.PermissionOverridesService; }
  function canManage() { return window.BusinessGroupsService && window.BusinessGroupsService.canManageActiveGroup && window.BusinessGroupsService.canManageActiveGroup(); }
  function moduleCatalog() { return svc() && svc().moduleCatalog ? svc().moduleCatalog() : []; }
  function levelOptions(selected) {
    const labels = svc().LEVEL_LABELS;
    return svc().LEVELS.map(l => `<option value="${esc(l)}" ${l === selected ? 'selected' : ''}>${esc(labels[l] || l)}</option>`).join('');
  }
  function collectOverrides() {
    const out = {};
    moduleCatalog().forEach(m => {
      const id = String(m.id || m.scope || '');
      const level = $('#permission-override-level-' + id).val() || 'inherit';
      if (level !== 'inherit') out[id] = level;
    });
    return out;
  }
  function badge(level) {
    const l = String(level || 'none');
    const cls = l === 'admin' ? 'bg-danger' : l === 'write' ? 'bg-primary' : l === 'read' ? 'bg-info text-dark' : 'bg-secondary';
    return `<span class="badge ${cls}">${esc(l)}</span>`;
  }

  async function render() {
    const root = $('#permission-overrides-root');
    if (!root.length || !svc()) return;
    const active = window.currentBusinessGroup || null;
    if (!active || !active.id) {
      root.html('<div class="alert alert-info">Seleziona un Gruppo aziendale per configurare override permessi per singolo utente.</div>');
      return;
    }
    const members = await svc().listMembersWithOverrides(active.id);
    const selectedUid = $('#permission-override-member-select').val() || (members[0] && members[0].uid) || '';
    const selected = members.find(m => m.uid === selectedUid) || members[0] || null;
    const manageable = canManage();
    const memberOptions = members.map(m => `<option value="${esc(m.uid)}" ${selected && selected.uid === m.uid ? 'selected' : ''}>${esc(m.email || m.uid)} — ${esc(m.roleLabel || m.role || '')}${m.overrideCount ? ' — override: ' + m.overrideCount : ''}</option>`).join('');
    const overrides = selected ? (selected.permissionOverrides || {}) : {};
    const effective = selected ? (selected.effectiveProfilePermissions || selected.profilePermissions || {}) : {};
    const rows = selected ? moduleCatalog().map(m => {
      const id = String(m.id || m.scope || '');
      const inherited = (selected.profilePermissions || {})[id] || 'none';
      const ov = overrides[id] || 'inherit';
      const eff = effective[id] || inherited || 'none';
      return `<tr>
        <td><strong>${esc(m.label || id)}</strong><br><span class="text-muted small"><code>${esc(id)}</code> / scope <code>${esc(m.scope || id)}</code></span></td>
        <td>${badge(inherited)}</td>
        <td style="min-width:220px"><select class="form-select form-select-sm permission-override-level" id="permission-override-level-${esc(id)}" ${manageable ? '' : 'disabled'}>${levelOptions(ov)}</select></td>
        <td>${badge(eff)}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="4" class="text-muted">Nessun membro selezionato.</td></tr>';
    const memberRows = members.length ? members.map(m => `<tr>
      <td><strong>${esc(m.email || m.uid)}</strong><br><code class="small">${esc(m.uid)}</code></td>
      <td>${esc(m.roleLabel || m.role || '')}</td>
      <td>${esc(m.permissionProfileName || m.permissionProfileId || '—')}</td>
      <td>${m.overrideCount ? `<span class="badge bg-warning text-dark">${m.overrideCount} override</span>` : '<span class="text-muted">Nessuno</span>'}</td>
    </tr>`).join('') : '<tr><td colspan="4" class="text-muted">Nessun membro nel gruppo.</td></tr>';

    root.html(`
      <div class="alert alert-primary small">
        <strong>Versione 0.6.4.</strong> Gli override modificano i permessi di un singolo membro senza alterare il profilo assegnato. L'ordine effettivo è: ruolo → profilo permesso → override utente.
      </div>
      <div class="row g-3">
        <div class="col-xl-4">
          <div class="card shadow-sm h-100"><div class="card-body">
            <h5 class="card-title"><i class="fas fa-user-gear me-2"></i>Membro</h5>
            <label class="form-label" for="permission-override-member-select">Seleziona membro</label>
            <select class="form-select mb-3" id="permission-override-member-select">${memberOptions || '<option value="">Nessun membro</option>'}</select>
            ${selected ? `<div class="small">
              <p class="mb-1"><strong>Email:</strong> ${esc(selected.email || '—')}</p>
              <p class="mb-1"><strong>UID:</strong> <code>${esc(selected.uid)}</code></p>
              <p class="mb-1"><strong>Ruolo:</strong> ${esc(selected.roleLabel || selected.role || '—')}</p>
              <p class="mb-1"><strong>Profilo:</strong> ${esc(selected.permissionProfileName || selected.permissionProfileId || '—')}</p>
              <p class="mb-0"><strong>Override attivi:</strong> ${selected.overrideCount || 0}</p>
            </div>` : '<div class="text-muted small">Nessun membro selezionato.</div>'}
            <hr>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-primary" id="permission-overrides-save-btn" type="button" ${manageable && selected ? '' : 'disabled'}><i class="fas fa-save me-1"></i>Salva override</button>
              <button class="btn btn-outline-secondary" id="permission-overrides-clear-btn" type="button" ${manageable && selected ? '' : 'disabled'}>Rimuovi override</button>
            </div>
          </div></div>
        </div>
        <div class="col-xl-8">
          <div class="card shadow-sm h-100"><div class="card-body">
            <h5 class="card-title"><i class="fas fa-sliders me-2"></i>Matrice override utente</h5>
            <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Modulo</th><th>Profilo</th><th>Override</th><th>Effettivo</th></tr></thead><tbody>${rows}</tbody></table></div>
          </div></div>
        </div>
      </div>
      <div class="card shadow-sm mt-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-users me-2"></i>Riepilogo membri</h5>
        <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Membro</th><th>Ruolo</th><th>Profilo</th><th>Override</th></tr></thead><tbody>${memberRows}</tbody></table></div>
      </div></div>
      <div class="card shadow-sm mt-3"><div class="card-body small">
        <h6>Persistenza 0.6.4</h6>
        <pre class="mb-0"><code>businessGroups/{groupId}/members/{uid}.permissionOverrides
businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions
users/{uid}/memberships/{groupId}.permissionOverrides
users/{uid}/memberships/{groupId}.effectiveProfilePermissions</code></pre>
      </div></div>
    `);
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('change', '#permission-override-member-select', async function () { try { await render(); } catch (e) { console.error(e); } });
    $(document).on('click', '#permission-overrides-save-btn', async function () {
      try {
        const targetUid = $('#permission-override-member-select').val();
        await svc().saveMemberOverrides(null, targetUid, collectOverrides());
        await render();
        if (typeof renderAll === 'function') renderAll();
        alert('Override permessi salvati.');
      } catch (e) { console.error(e); alert('Errore salvataggio override: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#permission-overrides-clear-btn', async function () {
      try {
        const targetUid = $('#permission-override-member-select').val();
        if (!targetUid || !confirm('Rimuovere tutti gli override del membro selezionato?')) return;
        await svc().clearMemberOverrides(null, targetUid);
        await render();
        if (typeof renderAll === 'function') renderAll();
        alert('Override rimossi.');
      } catch (e) { console.error(e); alert('Errore rimozione override: ' + (e && e.message ? e.message : e)); }
    });
  }

  window.AppModules.permissionOverrides.bind = bind;
  window.AppModules.permissionOverrides.render = render;
})();
