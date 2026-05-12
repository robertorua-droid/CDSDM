// js/features/business-groups/business-groups-module.js
// CDSDM 0.13.16 — UI Gruppi aziendali, inviti responsive e guida permessi

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.businessGroups = window.AppModules.businessGroups || {};
  let _bound = false;

  function esc(v) { return $('<div>').text(String(v == null ? '' : v)).html(); }
  function roleOptions(selected) {
    const svc = window.BusinessGroupsService;
    return Object.keys(svc.ROLES).map(role => `<option value="${esc(role)}" ${role === selected ? 'selected' : ''}>${esc(svc.roleLabel(role))}</option>`).join('');
  }
  function inviteText(invite) {
    const expiry = invite.expiresAtIso || invite.expiresAt || '';
    return `Gruppo aziendale: ${invite.groupName || invite.groupId}\nID gruppo: ${invite.groupId}\nCodice invito: ${invite.id}\nEmail invitata: ${invite.email}\nRuolo: ${invite.roleLabel || invite.role}\nScadenza: ${expiry ? String(expiry).slice(0, 10) : ''}\n\nIstruzioni: apri l’app, scegli Registrati con invito, usa questa email, imposta una password e inserisci ID gruppo + codice.`;
  }

  function statusBadge(status) {
    const s = String(status || 'pending');
    const cls = s === 'pending' ? 'success' : (s === 'accepted' ? 'primary' : (s === 'expired' ? 'warning' : 'secondary'));
    const label = { pending: 'In attesa', accepted: 'Accettato', revoked: 'Revocato', expired: 'Scaduto', replaced: 'Rigenerato' }[s] || s;
    return `<span class="badge text-bg-${cls}">${esc(label)}</span>`;
  }

  async function render() {
    const svc = window.BusinessGroupsService;
    const $root = $('#business-groups-root');
    if (!svc || !$root.length) return;
    const memberships = await svc.listMemberships();
    const active = window.currentBusinessGroup || null;
    const canManage = svc.canManageActiveGroup();
    const activeGroupId = active && active.id ? active.id : '';
    const members = activeGroupId ? await svc.listMembers(activeGroupId) : [];
    const inviteFilters = {
      email: $('#business-group-invite-filter-email').val() || '',
      status: $('#business-group-invite-filter-status').val() || 'all'
    };
    const invites = activeGroupId ? await svc.listInvites(activeGroupId, inviteFilters) : [];
    const profileSvc = window.PermissionProfilesService;
    let permissionProfiles = [];
    try {
      permissionProfiles = activeGroupId && profileSvc ? await profileSvc.listProfiles(activeGroupId) : [];
    } catch (profileError) {
      console.warn('Profili permesso non caricati in Gruppi aziendali:', profileError);
      permissionProfiles = [];
    }
    const profileOptions = permissionProfiles.map(p => `<option value="${esc(p.id)}">${esc(p.name || p.id)} — ${esc(p.roleBase || '')}</option>`).join('');

    const membershipRows = memberships.map(m => `
      <tr class="${active && active.id === m.groupId ? 'table-primary' : ''}">
        <td><strong>${esc(m.groupName || m.groupId)}</strong><br><span class="text-muted small">${esc(m.groupId)}</span></td>
        <td>${esc(svc.roleLabel(m.role || 'readonly'))}</td>
        <td>${esc(m.status || 'active')}</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-primary bg-select-group" data-group-id="${esc(m.groupId)}" type="button">Seleziona</button></td>
      </tr>`).join('') || '<tr><td colspan="4" class="text-muted text-center py-4">Nessun Gruppo aziendale collegato. Crea il primo gruppo o accetta un invito.</td></tr>';

    const memberRows = members.map(m => {
      const activeMember = (m.status || 'active') === 'active';
      const self = window.currentUser && m.uid === window.currentUser.uid;
      return `
        <tr class="${activeMember ? '' : 'table-light text-muted'}">
          <td><strong>${esc(m.displayName || m.email || m.uid)}</strong><br><span class="text-muted small">${esc(m.uid)}</span></td>
          <td>${esc(m.email || '—')}</td>
          <td>${canManage && activeMember ? `<select class="form-select form-select-sm bg-member-role" data-uid="${esc(m.uid)}" ${self ? 'data-self="true"' : ''}>${roleOptions(m.role || 'readonly')}</select>` : esc(svc.roleLabel(m.role || 'readonly'))}</td>
          <td>${esc(m.permissionProfileName || m.permissionProfileId || '—')}</td>
          <td>${esc(m.status || 'active')}</td>
          <td class="text-end">${canManage && activeMember && !self ? `<button class="btn btn-sm btn-outline-danger bg-remove-member" data-uid="${esc(m.uid)}" type="button"><i class="fas fa-user-minus me-1"></i>Rimuovi</button>` : ''}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="6" class="text-muted text-center py-4">Nessun membro trovato per il gruppo attivo.</td></tr>';

    const inviteCards = invites.map(inv => {
      const effective = inv.effectiveStatus || inv.status || 'pending';
      const expiry = inv.expiresAtIso || inv.expiresAt || '';
      const email = inv.email || '—';
      const roleLabel = svc.roleLabel(inv.role || 'readonly');
      const profileLabel = inv.permissionProfileName || inv.permissionProfileId || 'Nessun profilo';
      return `
      <div class="bg-invite-card ${effective === 'pending' ? '' : 'is-muted'}">
        <div class="bg-invite-main">
          <div class="bg-invite-identity">
            <div class="bg-invite-email" title="${esc(email)}">${esc(email)}</div>
            <div class="bg-invite-code">Codice: <code>${esc(inv.id)}</code></div>
            ${inv.replacedByInviteCode ? `<div class="bg-invite-code text-muted">Nuovo codice: <code>${esc(inv.replacedByInviteCode)}</code></div>` : ''}
          </div>
          <div class="bg-invite-meta">
            <div><span class="bg-invite-label">Ruolo</span><strong>${esc(roleLabel)}</strong></div>
            <div><span class="bg-invite-label">Profilo</span><span>${esc(profileLabel)}</span></div>
            <div><span class="bg-invite-label">Stato</span>${statusBadge(effective)}</div>
            <div><span class="bg-invite-label">Scadenza</span><span>${esc(expiry ? String(expiry).slice(0, 10) : '—')}</span></div>
          </div>
        </div>
        <div class="bg-invite-actions">
          <button class="btn btn-sm btn-outline-secondary bg-copy-invite" data-invite-id="${esc(inv.id)}" type="button"><i class="fas fa-copy me-1"></i>Copia</button>
          ${canManage && effective !== 'accepted' ? `<button class="btn btn-sm btn-outline-info bg-regenerate-invite" data-invite-id="${esc(inv.id)}" type="button"><i class="fas fa-sync-alt me-1"></i>Rigenera</button>` : ''}
          ${canManage && effective === 'pending' ? `<button class="btn btn-sm btn-outline-warning bg-revoke-invite" data-invite-id="${esc(inv.id)}" type="button"><i class="fas fa-ban me-1"></i>Revoca</button>` : ''}
        </div>
      </div>`;
    }).join('') || '<div class="text-muted text-center py-4 border rounded-3">Nessun invito trovato con i filtri attivi.</div>';

    $root.html(`
      <div class="alert alert-info small">
        <strong>Aiuto rapido 0.13.16.</strong> Da qui il docente/amministratore crea il Gruppo aziendale, genera inviti e controlla membri. L'app non invia email automatiche: copia il codice invito e comunicalo manualmente allo studente insieme all'ID gruppo. I privilegi operativi si assegnano da Profili permesso, non da Override individuali.
      </div>
      <div class="row g-3">
        <div class="col-lg-5">
          <div class="card shadow-sm h-100"><div class="card-body">
            <h5 class="card-title"><i class="fas fa-building-user me-2"></i>Crea Gruppo aziendale</h5>
            <label class="form-label" for="business-group-name">Nome gruppo</label>
            <input class="form-control" id="business-group-name" placeholder="Es. Alfa S.r.l." type="text">
            <div class="form-check mt-3">
              <input class="form-check-input" id="business-group-copy-legacy" type="checkbox" checked>
              <label class="form-check-label" for="business-group-copy-legacy">Copia prudente i dati personali legacy nel nuovo gruppo</label>
            </div>
            <p class="small text-muted mt-2 mb-3">La copia non cancella i dati legacy e preserva gli ID esistenti.</p>
            <button class="btn btn-primary" id="business-group-create-btn" type="button"><i class="fas fa-plus me-1"></i>Crea gruppo</button>
          </div></div>
        </div>
        <div class="col-lg-7">
          <div class="card shadow-sm h-100"><div class="card-body">
            <h5 class="card-title"><i class="fas fa-users me-2"></i>Gruppi disponibili</h5>
            <div class="mb-2 small"><strong>Attivo:</strong> ${esc(svc.activeLabel())}</div>
            <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Gruppo</th><th>Ruolo</th><th>Stato</th><th></th></tr></thead><tbody>${membershipRows}</tbody></table></div>
            ${active && active.id ? `<button class="btn btn-outline-secondary btn-sm" id="business-group-use-legacy-btn" type="button"><i class="fas fa-user-lock me-1"></i>Torna ai dati personali legacy</button>` : ''}
          </div></div>
        </div>
      </div>

      <div class="card shadow-sm mt-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-ticket-alt me-2"></i>Accetta invito</h5>
        <p class="small text-muted">Lo studente invitato accede con il proprio account Firebase e inserisce ID gruppo e codice ricevuti dal docente/amministratore.</p>
        <div class="row g-2 align-items-end">
          <div class="col-md-5"><label class="form-label" for="business-group-accept-id">ID gruppo</label><input class="form-control" id="business-group-accept-id" placeholder="businessGroups/{groupId}"></div>
          <div class="col-md-4"><label class="form-label" for="business-group-accept-code">Codice invito</label><input class="form-control" id="business-group-accept-code" placeholder="BG-XXXX-YYYY"></div>
          <div class="col-md-3"><button class="btn btn-outline-primary w-100" id="business-group-accept-invite-btn" type="button"><i class="fas fa-user-check me-1"></i>Accetta</button></div>
        </div>
      </div></div>

      ${activeGroupId ? `
      <div class="row g-3 mt-1">
        <div class="col-xl-8">
          <div class="card shadow-sm h-100"><div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div><h5 class="card-title mb-1"><i class="fas fa-id-badge me-2"></i>Membri del gruppo attivo</h5><p class="small text-muted mb-0">Ruoli attivi nel dataset condiviso.</p></div>
              <span class="badge text-bg-${canManage ? 'success' : 'secondary'}">${canManage ? 'Gestione abilitata' : 'Solo consultazione'}</span>
            </div>
            <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Membro</th><th>Email</th><th>Ruolo</th><th>Profilo permesso</th><th>Stato</th><th></th></tr></thead><tbody>${memberRows}</tbody></table></div>
          </div></div>
        </div>
        <div class="col-xl-4">
          <div class="card shadow-sm h-100"><div class="card-body">
            <h5 class="card-title"><i class="fas fa-user-plus me-2"></i>Aggiunta diretta membro</h5>
            <p class="small text-muted">Utile in classe quando il docente conosce lo UID Firebase dello studente.</p>
            <label class="form-label" for="business-group-member-uid">UID Firebase</label>
            <input class="form-control" id="business-group-member-uid" ${canManage ? '' : 'disabled'}>
            <label class="form-label mt-2" for="business-group-member-email">Email</label>
            <input class="form-control" id="business-group-member-email" type="email" ${canManage ? '' : 'disabled'}>
            <label class="form-label mt-2" for="business-group-member-role">Ruolo</label>
            <select class="form-select" id="business-group-member-role" ${canManage ? '' : 'disabled'}>${roleOptions('readonly')}</select>
            <button class="btn btn-primary mt-3 w-100" id="business-group-add-member-btn" type="button" ${canManage ? '' : 'disabled'}><i class="fas fa-user-plus me-1"></i>Aggiungi membro</button>
          </div></div>
        </div>
      </div>
      <div class="row g-3 mt-1">
        <div class="col-xl-4">
          <div class="card shadow-sm h-100 bg-invite-create-card"><div class="card-body">
            <h5 class="card-title"><i class="fas fa-envelope-open-text me-2"></i>Crea invito collaboratore</h5>
            <p class="small text-muted mb-2"><strong>Nota:</strong> l'invito non viene inviato via email automaticamente. Copia il codice generato e comunicalo manualmente al collaboratore.</p>
            <label class="form-label" for="business-group-invite-email">Email invitato</label>
            <input class="form-control" id="business-group-invite-email" type="email" ${canManage ? '' : 'disabled'}>
            <label class="form-label mt-2" for="business-group-invite-role">Ruolo</label>
            <select class="form-select" id="business-group-invite-role" ${canManage ? '' : 'disabled'}>${roleOptions('readonly')}</select>
            <label class="form-label mt-2" for="business-group-invite-days">Validità</label>
            <select class="form-select" id="business-group-invite-days" ${canManage ? '' : 'disabled'}>
              <option value="7">7 giorni</option><option value="14" selected>14 giorni</option><option value="30">30 giorni</option><option value="60">60 giorni</option>
            </select>
            <label class="form-label mt-2" for="business-group-invite-profile">Profilo permesso iniziale</label>
            <select class="form-select" id="business-group-invite-profile" ${canManage ? '' : 'disabled'}>
              <option value="">Nessun profilo specifico</option>${profileOptions}
            </select>
            <label class="form-label mt-2" for="business-group-invite-notes">Note onboarding</label>
            <textarea class="form-control" id="business-group-invite-notes" rows="2" ${canManage ? '' : 'disabled'} placeholder="Classe, esercitazione o indicazioni per lo studente"></textarea>
            <button class="btn btn-primary mt-3 w-100" id="business-group-create-invite-btn" type="button" ${canManage ? '' : 'disabled'}><i class="fas fa-ticket-alt me-1"></i>Genera invito</button>
          </div></div>
        </div>
        <div class="col-xl-8">
          <div class="card shadow-sm h-100 bg-invites-panel"><div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
              <h5 class="card-title mb-0"><i class="fas fa-list-check me-2"></i>Inviti</h5>
              ${canManage ? `<button class="btn btn-sm btn-outline-secondary" id="business-group-clean-expired-invites" type="button">Marca scaduti</button>` : ''}
            </div>
            <div class="row g-2 mb-2">
              <div class="col-md-7"><input class="form-control form-control-sm" id="business-group-invite-filter-email" placeholder="Filtra per email" value="${esc(inviteFilters.email)}"></div>
              <div class="col-md-5"><select class="form-select form-select-sm" id="business-group-invite-filter-status">
                ${['all','pending','accepted','expired','revoked'].map(st => `<option value="${st}" ${inviteFilters.status === st ? 'selected' : ''}>${st === 'all' ? 'Tutti gli stati' : st}</option>`).join('')}
              </select></div>
            </div>
            <div class="bg-invites-list" aria-label="Elenco inviti collaboratore">${inviteCards}</div>
          </div></div>
        </div>
      </div>` : ''}

      <div class="card shadow-sm mt-3"><div class="card-body small">
        <h6>Struttura Firestore 0.6.4</h6>
        <pre class="mb-0"><code>businessGroups/{groupId}
businessGroups/{groupId}/members/{uid}
businessGroups/{groupId}/invites/{inviteCode}
businessGroups/{groupId}/permissionProfiles/{profileId}
businessGroups/{groupId}/auditEvents/{eventId}
businessGroups/{groupId}/settings/companyInfo
businessGroups/{groupId}/{collection}/{docId}
users/{uid}/memberships/{groupId}</code></pre>
      </div></div>
    `);

    window.__lastBusinessGroupInvites = invites;
  }

  async function refreshSidebarSelect() {
    const svc = window.BusinessGroupsService;
    const $sel = $('#business-group-selector');
    if (!svc || !$sel.length) return;
    const memberships = await svc.listMemberships();
    const active = window.currentBusinessGroup || null;
    $sel.empty().append('<option value="">Dati personali legacy</option>');
    memberships.forEach(m => $sel.append(`<option value="${esc(m.groupId)}">${esc(m.groupName || m.groupId)} — ${esc(svc.roleLabel(m.role || 'readonly'))}</option>`));
    $sel.val(active && active.id ? active.id : '');
  }

  async function refreshAfterGroupChange(message) {
    await loadAllDataFromCloud();
    await refreshSidebarSelect();
    await render();
    if (typeof renderAll === 'function') renderAll();
    if (message) alert(message);
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '#business-group-create-btn', async function () {
      try {
        const name = $('#business-group-name').val();
        const copyLegacy = $('#business-group-copy-legacy').is(':checked');
        await window.BusinessGroupsService.createBusinessGroup(name, { copyLegacy });
        if (window.PermissionProfilesService && window.PermissionProfilesService.ensureDefaultProfiles) {
          try { await window.PermissionProfilesService.ensureDefaultProfiles(); } catch (profileError) { console.warn('Profili predefiniti non inizializzati:', profileError); }
        }
        await refreshAfterGroupChange('Gruppo aziendale creato e selezionato.');
      } catch (e) { console.error(e); alert('Errore Gruppo aziendale: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '.bg-select-group', async function () {
      try {
        await window.BusinessGroupsService.setActiveBusinessGroup($(this).data('group-id'));
        await refreshAfterGroupChange('Gruppo aziendale selezionato.');
      } catch (e) { console.error(e); alert('Errore selezione gruppo: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('change', '#business-group-selector', async function () {
      try {
        await window.BusinessGroupsService.setActiveBusinessGroup($(this).val());
        await loadAllDataFromCloud();
        await refreshSidebarSelect();
        if (typeof renderAll === 'function') renderAll();
      } catch (e) { console.error(e); alert('Errore cambio gruppo: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#business-group-use-legacy-btn', async function () {
      await window.BusinessGroupsService.setActiveBusinessGroup('');
      await refreshAfterGroupChange('Modalità dati personali legacy attiva.');
    });
    $(document).on('click', '#business-group-add-member-btn', async function () {
      try {
        await window.BusinessGroupsService.addMemberToGroup(null, {
          uid: $('#business-group-member-uid').val(),
          email: $('#business-group-member-email').val(),
          role: $('#business-group-member-role').val()
        });
        await refreshAfterGroupChange('Membro aggiunto al Gruppo aziendale.');
      } catch (e) { console.error(e); alert('Errore aggiunta membro: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('change', '.bg-member-role', async function () {
      try {
        const uid = $(this).data('uid');
        const role = $(this).val();
        await window.BusinessGroupsService.updateMemberRole(null, uid, role);
        await refreshAfterGroupChange('Ruolo membro aggiornato.');
      } catch (e) { console.error(e); alert('Errore aggiornamento ruolo: ' + (e && e.message ? e.message : e)); await render(); }
    });
    $(document).on('click', '.bg-remove-member', async function () {
      try {
        const uid = $(this).data('uid');
        if (!confirm('Rimuovere questo membro dal gruppo?')) return;
        await window.BusinessGroupsService.removeMemberFromGroup(null, uid);
        await refreshAfterGroupChange('Membro rimosso dal Gruppo aziendale.');
      } catch (e) { console.error(e); alert('Errore rimozione membro: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#business-group-create-invite-btn', async function () {
      try {
        const invite = await window.BusinessGroupsService.createInvite(null, {
          email: $('#business-group-invite-email').val(),
          role: $('#business-group-invite-role').val(),
          permissionProfileId: $('#business-group-invite-profile').val(),
          expiresInDays: $('#business-group-invite-days').val(),
          notes: $('#business-group-invite-notes').val()
        });
        await render();
        alert('Invito creato.\n\nCodice: ' + invite.id + '\nID gruppo: ' + invite.groupId + '\nScadenza: ' + (invite.expiresAt || invite.expiresAtIso || '') + '\n\nNota: l\'app non invia email automaticamente. Copia codice e ID gruppo e comunicali manualmente al collaboratore.');
      } catch (e) { console.error(e); alert('Errore creazione invito: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '.bg-revoke-invite', async function () {
      try {
        const code = $(this).data('invite-id');
        if (!confirm('Revocare questo invito?')) return;
        await window.BusinessGroupsService.revokeInvite(null, code);
        await render();
      } catch (e) { console.error(e); alert('Errore revoca invito: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '.bg-copy-invite', async function () {
      const code = $(this).data('invite-id');
      const inv = (window.__lastBusinessGroupInvites || []).find(i => String(i.id) === String(code));
      const text = inv ? inviteText(inv) : String(code || '');
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
        alert('Dati invito copiati negli appunti.');
      } catch (e) {
        prompt('Copia manualmente i dati invito:', text);
      }
    });
    $(document).on('change input', '#business-group-invite-filter-email, #business-group-invite-filter-status', async function () {
      try { await render(); } catch (e) { console.error(e); }
    });
    $(document).on('click', '.bg-regenerate-invite', async function () {
      try {
        const code = $(this).data('invite-id');
        if (!confirm('Rigenerare il codice invito? Il codice precedente sarà revocato.')) return;
        const invite = await window.BusinessGroupsService.regenerateInviteCode(null, code, { expiresInDays: 14 });
        await render();
        alert('Nuovo invito generato. Codice: ' + invite.id + '\nID gruppo: ' + invite.groupId);
      } catch (e) { console.error(e); alert('Errore rigenerazione invito: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#business-group-clean-expired-invites', async function () {
      try {
        const res = await window.BusinessGroupsService.cleanupExpiredInvites(null);
        await render();
        alert('Inviti scaduti aggiornati: ' + (res && res.count || 0));
      } catch (e) { console.error(e); alert('Errore pulizia inviti: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#business-group-accept-invite-btn', async function () {
      try {
        await window.BusinessGroupsService.acceptInvite($('#business-group-accept-id').val(), $('#business-group-accept-code').val());
        await refreshAfterGroupChange('Invito accettato. Gruppo aziendale selezionato.');
      } catch (e) { console.error(e); alert('Errore accettazione invito: ' + (e && e.message ? e.message : e)); }
    });
  }

  window.AppModules.businessGroups.bind = bind;
  window.AppModules.businessGroups.render = render;
  window.AppModules.businessGroups.refreshSidebarSelect = refreshSidebarSelect;
})();
