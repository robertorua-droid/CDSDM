// js/features/business-groups/permission-profiles-service.js
// CDSDM 0.6.4 — Profili permesso + matrice moduli esplicita per Gruppo aziendale.

(function () {
  const win = window;
  const VERSION = '0.6.6';

  const ACCESS_LEVELS = {
    none: { id: 'none', label: 'Nessun accesso', rank: 0 },
    read: { id: 'read', label: 'Sola lettura', rank: 1 },
    write: { id: 'write', label: 'Lettura/Scrittura', rank: 2 },
    admin: { id: 'admin', label: 'Amministrazione', rank: 3 }
  };

  const MODULES = (win.PermissionMatrixService && win.PermissionMatrixService.MODULE_CATALOG
    ? win.PermissionMatrixService.MODULE_CATALOG.map(m => Object.assign({}, m))
    : [
    { id: 'customers', label: 'Clienti', scope: 'customers' },
    { id: 'suppliers', label: 'Fornitori', scope: 'suppliers' },
    { id: 'products', label: 'Prodotti e servizi', scope: 'products' },
    { id: 'sales', label: 'Vendite: preventivi, ordini e DDT cliente', scope: 'sales' },
    { id: 'invoices', label: 'Fatture e note di credito', scope: 'invoices' },
    { id: 'purchases', label: 'Acquisti: ordini, DDT e fatture fornitore', scope: 'purchases' },
    { id: 'warehouse', label: 'Magazzino, lotti e movimenti', scope: 'warehouse' },
    { id: 'accounting', label: 'Contabilità, pagamenti e scadenziario', scope: 'accounting' },
    { id: 'projects', label: 'Commesse, progetti e timesheet', scope: 'projects' },
    { id: 'reports', label: 'Report e statistiche', scope: 'reports' },
    { id: 'workflow', label: 'Workflow e notifiche', scope: 'workflow' },
    { id: 'audit', label: 'Audit trail', scope: 'audit' },
    { id: 'print', label: 'Centro stampe', scope: 'print' },
    { id: 'import', label: 'Import massivi', scope: 'import' },
    { id: 'settings', label: 'Impostazioni operative', scope: 'settings' },
    { id: 'permissions', label: 'Utenti, ruoli e profili permesso', scope: 'permissions' },
    { id: 'securityAudit', label: 'Audit sicurezza e QA accessi', scope: 'securityAudit' },
    { id: 'teacherConsole', label: 'Console docente', scope: 'teacherConsole' },
    { id: 'migrationQa', label: 'Migrazione e QA', scope: 'migrationQa' },
    { id: 'danger', label: 'Gestione dati / reset', scope: 'danger' }
  ]);

  const ROLE_TEMPLATE = {
    admin: {
      name: 'Amministratore standard', roleBase: 'admin', description: 'Accesso amministrativo completo al Gruppo aziendale.',
      permissions: fillAll('admin')
    },
    teacher: {
      name: 'Docente / revisore', roleBase: 'teacher', description: 'Supervisione didattica completa, inclusi scenari e QA.',
      permissions: fillAll('read', { permissions: 'admin', securityAudit: 'admin', teacherConsole: 'admin', migrationQa: 'admin', audit: 'read', reports: 'read', workflow: 'write' })
    },
    accounting: {
      name: 'Contabilità standard', roleBase: 'accounting', description: 'Gestione documenti contabili, incassi/pagamenti e consultazione anagrafiche.',
      permissions: fillAll('none', { customers: 'read', suppliers: 'read', products: 'read', invoices: 'write', purchases: 'write', accounting: 'write', reports: 'read', workflow: 'write', audit: 'read', print: 'write' })
    },
    sales: {
      name: 'Vendite standard', roleBase: 'sales', description: 'Gestione clienti, preventivi, ordini cliente e consultazione fatture.',
      permissions: fillAll('none', { customers: 'write', products: 'read', sales: 'write', invoices: 'read', warehouse: 'read', accounting: 'read', projects: 'write', reports: 'read', workflow: 'write', audit: 'read', print: 'write' })
    },
    purchases: {
      name: 'Acquisti standard', roleBase: 'purchases', description: 'Gestione fornitori, ordini fornitore, DDT fornitore e acquisti.',
      permissions: fillAll('none', { suppliers: 'write', products: 'read', purchases: 'write', warehouse: 'read', accounting: 'read', reports: 'read', workflow: 'write', audit: 'read', print: 'write' })
    },
    warehouse: {
      name: 'Magazzino standard', roleBase: 'warehouse', description: 'Gestione prodotti, giacenze, lotti, movimenti e DDT logistici.',
      permissions: fillAll('none', { products: 'write', warehouse: 'write', sales: 'read', purchases: 'read', customers: 'read', suppliers: 'read', reports: 'read', workflow: 'write', audit: 'read', print: 'write' })
    },
    readonly: {
      name: 'Sola lettura', roleBase: 'readonly', description: 'Consultazione generale senza scritture operative.',
      permissions: fillAll('read', { import: 'none', permissions: 'none', settings: 'read', danger: 'none' })
    }
  };

  function fillAll(defaultLevel, overrides) {
    const out = {};
    MODULES.forEach(m => { out[m.id] = defaultLevel || 'none'; });
    Object.assign(out, overrides || {});
    return out;
  }

  function db() { return win.db; }
  function uid() { return win.currentUser && win.currentUser.uid ? win.currentUser.uid : ''; }
  function nowIso() { return new Date().toISOString(); }
  function activeGroupId(groupId) { return groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id) || ''; }
  function groupRef(groupId) { return db().collection('businessGroups').doc(String(groupId)); }
  function profileRef(groupId, profileId) { return groupRef(groupId).collection('permissionProfiles').doc(String(profileId)); }
  function userMembershipRef(userId, groupId) { return db().collection('users').doc(String(userId)).collection('memberships').doc(String(groupId)); }
  function escId(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80); }
  function isManager() { return win.BusinessGroupsService && win.BusinessGroupsService.canManageActiveGroup && win.BusinessGroupsService.canManageActiveGroup(); }

  function normalizeLevel(level) {
    const v = String(level || '').trim();
    return ACCESS_LEVELS[v] ? v : 'none';
  }

  function normalizePermissions(input) {
    const raw = input && typeof input === 'object' ? input : {};
    const out = {};
    MODULES.forEach(m => { out[m.id] = normalizeLevel(raw[m.id]); });
    return out;
  }

  function templateProfile(role) {
    const r = String(role || 'readonly');
    const tpl = ROLE_TEMPLATE[r] || ROLE_TEMPLATE.readonly;
    const id = r + '_standard';
    return {
      id,
      name: tpl.name,
      description: tpl.description,
      roleBase: tpl.roleBase,
      permissions: normalizePermissions(tpl.permissions),
      isSystemDefault: true,
      status: 'active',
      version: VERSION
    };
  }

  function defaultProfiles() {
    return ['admin','teacher','accounting','sales','purchases','warehouse','readonly'].map(templateProfile);
  }

  async function ensureDefaultProfiles(groupId) {
    const gid = activeGroupId(groupId);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    if (!isManager()) throw new Error('Solo admin/teacher possono inizializzare i profili permesso.');
    const snap = await groupRef(gid).collection('permissionProfiles').limit(1).get();
    if (!snap.empty) return { created: 0 };
    const batch = db().batch();
    defaultProfiles().forEach(p => {
      const now = nowIso();
      batch.set(profileRef(gid, p.id), Object.assign({}, p, { createdAt: now, createdBy: uid(), updatedAt: now, updatedBy: uid() }), { merge: true });
    });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: uid(), schemaVersion: 'businessGroups-0.6.4', version: VERSION }, { merge: true });
    await batch.commit();
    await log('permission_profiles_initialized', { count: defaultProfiles().length });
    return { created: defaultProfiles().length };
  }

  async function listProfiles(groupId) {
    const gid = activeGroupId(groupId);
    if (!gid || !db()) return [];
    const snap = await groupRef(gid).collection('permissionProfiles').get();
    const out = [];
    snap.forEach(doc => out.push(Object.assign({ id: doc.id }, doc.data() || {})));
    out.sort((a, b) => String(a.roleBase || '').localeCompare(String(b.roleBase || '')) || String(a.name || '').localeCompare(String(b.name || '')));
    return out;
  }

  async function getProfile(groupId, profileId) {
    const gid = activeGroupId(groupId);
    const id = String(profileId || '').trim();
    if (!gid || !id) return null;
    const doc = await profileRef(gid, id).get();
    return doc.exists ? Object.assign({ id: doc.id }, doc.data() || {}) : null;
  }

  async function saveProfile(groupId, payload) {
    const gid = activeGroupId(groupId);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    if (!isManager()) throw new Error('Solo admin/teacher possono salvare profili permesso.');
    const raw = payload || {};
    const id = escId(raw.id || raw.name || 'profilo');
    if (!id) throw new Error('Indica un nome profilo valido.');
    const roleBase = win.BusinessGroupsService && win.BusinessGroupsService.normalizeRole ? win.BusinessGroupsService.normalizeRole(raw.roleBase || 'readonly') : String(raw.roleBase || 'readonly');
    const existing = await getProfile(gid, id);
    const now = nowIso();
    const doc = {
      id,
      name: String(raw.name || id).trim(),
      description: String(raw.description || '').trim(),
      roleBase,
      permissions: normalizePermissions(raw.permissions || {}),
      status: raw.status === 'disabled' ? 'disabled' : 'active',
      isSystemDefault: !!(existing && existing.isSystemDefault),
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      createdBy: existing && existing.createdBy ? existing.createdBy : uid(),
      updatedAt: now,
      updatedBy: uid(),
      version: VERSION
    };
    await profileRef(gid, id).set(doc, { merge: true });
    await log('permission_profile_saved', { profileId: id, roleBase });
    return doc;
  }

  async function deleteProfile(groupId, profileId) {
    const gid = activeGroupId(groupId);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    if (!isManager()) throw new Error('Solo admin/teacher possono eliminare profili permesso.');
    const id = String(profileId || '').trim();
    if (!id) throw new Error('Profilo non valido.');
    const profile = await getProfile(gid, id);
    if (profile && profile.isSystemDefault) throw new Error('I profili predefiniti possono essere modificati ma non eliminati.');
    await profileRef(gid, id).delete();
    await log('permission_profile_deleted', { profileId: id });
    return { deleted: true };
  }

  async function assignProfileToMember(groupId, memberUid, profileId) {
    const gid = activeGroupId(groupId);
    const targetUid = String(memberUid || '').trim();
    const id = String(profileId || '').trim();
    if (!gid || !targetUid || !id) throw new Error('Gruppo, membro e profilo sono obbligatori.');
    if (!isManager()) throw new Error('Solo admin/teacher possono assegnare profili permesso.');
    const profile = await getProfile(gid, id);
    if (!profile || profile.status === 'disabled') throw new Error('Profilo permesso non trovato o disabilitato.');
    const memberSnap = await groupRef(gid).collection('members').doc(targetUid).get();
    const memberData = memberSnap.exists ? (memberSnap.data() || {}) : {};
    const profilePermissions = normalizePermissions(profile.permissions || {});
    const permissionOverrides = win.PermissionOverridesService && win.PermissionOverridesService.normalizeOverrides
      ? win.PermissionOverridesService.normalizeOverrides(memberData.permissionOverrides || {})
      : (memberData.permissionOverrides || {});
    const effectiveProfilePermissions = win.PermissionOverridesService && win.PermissionOverridesService.mergePermissions
      ? win.PermissionOverridesService.mergePermissions(profilePermissions, permissionOverrides)
      : Object.assign({}, profilePermissions, permissionOverrides);
    const patch = {
      permissionProfileId: profile.id,
      permissionProfileName: profile.name || profile.id,
      profilePermissions,
      permissionOverrides,
      effectiveProfilePermissions,
      overrideCount: Object.keys(permissionOverrides || {}).length,
      updatedAt: nowIso(),
      updatedBy: uid(),
      version: VERSION
    };
    const batch = db().batch();
    batch.set(groupRef(gid).collection('members').doc(targetUid), patch, { merge: true });
    batch.set(userMembershipRef(targetUid, gid), patch, { merge: true });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: uid(), version: VERSION, schemaVersion: 'businessGroups-0.6.4' }, { merge: true });
    await batch.commit();
    await log('permission_profile_assigned', { memberUid: targetUid, profileId: profile.id });
    if (win.currentUser && targetUid === win.currentUser.uid && win.currentBusinessGroup && win.currentBusinessGroup.id === gid) {
      win.currentBusinessGroup.membership = Object.assign({}, win.currentBusinessGroup.membership || {}, patch);
      win.currentBusinessGroup.permissionProfileId = patch.permissionProfileId;
      win.currentBusinessGroup.profilePermissions = patch.profilePermissions;
    }
    return patch;
  }

  async function clearMemberProfile(groupId, memberUid) {
    const gid = activeGroupId(groupId);
    const targetUid = String(memberUid || '').trim();
    if (!gid || !targetUid) throw new Error('Gruppo e membro sono obbligatori.');
    if (!isManager()) throw new Error('Solo admin/teacher possono rimuovere profili permesso.');
    const patch = {
      permissionProfileId: '',
      permissionProfileName: '',
      profilePermissions: {},
      effectiveProfilePermissions: {},
      updatedAt: nowIso(),
      updatedBy: uid(),
      version: VERSION
    };
    const batch = db().batch();
    batch.set(groupRef(gid).collection('members').doc(targetUid), patch, { merge: true });
    batch.set(userMembershipRef(targetUid, gid), patch, { merge: true });
    await batch.commit();
    await log('permission_profile_cleared', { memberUid: targetUid });
    return patch;
  }

  async function log(action, details) {
    try {
      const gid = activeGroupId();
      if (!gid || !db()) return;
      const ref = groupRef(gid).collection('auditEvents').doc();
      await ref.set({
        id: ref.id,
        type: 'permissions',
        action,
        area: 'Profili permesso',
        actorUid: uid(),
        actorEmail: win.currentUser && win.currentUser.email ? win.currentUser.email : '',
        date: nowIso().slice(0, 10),
        createdAt: nowIso(),
        details: details || {},
        version: VERSION
      }, { merge: true });
    } catch (e) {
      console.warn('Audit profili permesso non registrato:', e);
    }
  }

  win.PermissionProfilesService = {
    VERSION,
    ACCESS_LEVELS,
    MODULES,
    defaultProfiles,
    templateProfile,
    normalizePermissions,
    ensureDefaultProfiles,
    listProfiles,
    getProfile,
    saveProfile,
    deleteProfile,
    assignProfileToMember,
    clearMemberProfile
  };
})();
