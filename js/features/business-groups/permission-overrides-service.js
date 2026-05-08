// js/features/business-groups/permission-overrides-service.js
// CDSDM 0.6.4 — Override permessi per singolo utente.

(function () {
  const win = window;
  const VERSION = '0.6.4';
  const LEVELS = ['inherit', 'none', 'read', 'write', 'admin'];
  const LEVEL_LABELS = {
    inherit: 'Eredita dal profilo',
    none: 'Nessun accesso',
    read: 'Sola lettura',
    write: 'Lettura/Scrittura',
    admin: 'Amministrazione'
  };

  function db() {
    const candidate = win.db || (typeof globalThis !== 'undefined' ? globalThis.db : null);
    if (candidate && typeof candidate.collection === 'function') return candidate;
    if (win.firebase && typeof win.firebase.firestore === 'function') {
      const compat = win.firebase.firestore();
      if (compat && typeof compat.collection === 'function') {
        win.db = compat;
        if (typeof globalThis !== 'undefined') globalThis.db = compat;
        return compat;
      }
    }
    throw new Error('Firestore non inizializzato: ricarica l’app e verifica la configurazione Firebase.');
  }
  function uid() { return win.currentUser && win.currentUser.uid ? win.currentUser.uid : ''; }
  function nowIso() { return new Date().toISOString(); }
  function str(v) { return String(v == null ? '' : v).trim(); }
  function activeGroupId(groupId) { return str(groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id) || ''); }
  function groupRef(groupId) { return db().collection('businessGroups').doc(String(groupId)); }
  function userMembershipRef(targetUid, groupId) { return db().collection('users').doc(String(targetUid)).collection('memberships').doc(String(groupId)); }
  function isManager() { return win.BusinessGroupsService && win.BusinessGroupsService.canManageActiveGroup && win.BusinessGroupsService.canManageActiveGroup(); }
  function moduleCatalog() {
    if (win.PermissionMatrixService && Array.isArray(win.PermissionMatrixService.MODULE_CATALOG)) return win.PermissionMatrixService.MODULE_CATALOG.slice();
    if (win.PermissionProfilesService && Array.isArray(win.PermissionProfilesService.MODULES)) return win.PermissionProfilesService.MODULES.slice();
    return [];
  }
  function normalizeLevel(level) {
    const v = str(level || 'inherit');
    return LEVELS.indexOf(v) >= 0 ? v : 'inherit';
  }
  function normalizeOverrides(input) {
    const raw = input && typeof input === 'object' ? input : {};
    const out = {};
    moduleCatalog().forEach(m => {
      const id = str(m.id || m.scope);
      if (!id) return;
      const level = normalizeLevel(raw[id]);
      if (level !== 'inherit') out[id] = level;
    });
    return out;
  }
  function mergePermissions(basePermissions, overrides) {
    const base = Object.assign({}, basePermissions || {});
    const ov = normalizeOverrides(overrides || {});
    Object.keys(ov).forEach(k => { base[k] = ov[k]; });
    return base;
  }
  function countOverrides(overrides) { return Object.keys(normalizeOverrides(overrides)).length; }

  async function listMembersWithOverrides(groupId) {
    const gid = activeGroupId(groupId);
    if (!gid || !db()) return [];
    const bgSvc = win.BusinessGroupsService;
    const members = bgSvc && bgSvc.listMembers ? await bgSvc.listMembers(gid) : [];
    return members.map(m => {
      const profilePermissions = m.profilePermissions || {};
      const permissionOverrides = normalizeOverrides(m.permissionOverrides || {});
      return Object.assign({}, m, {
        permissionOverrides,
        effectiveProfilePermissions: mergePermissions(profilePermissions, permissionOverrides),
        overrideCount: countOverrides(permissionOverrides)
      });
    });
  }

  async function saveMemberOverrides(groupId, targetUid, overrides) {
    const gid = activeGroupId(groupId);
    const memberUid = str(targetUid);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    if (!memberUid) throw new Error('Seleziona un membro.');
    if (!isManager()) throw new Error('Solo admin/teacher possono configurare override permessi.');
    const memberRef = groupRef(gid).collection('members').doc(memberUid);
    const snap = await memberRef.get();
    if (!snap.exists) throw new Error('Membro non trovato nel gruppo attivo.');
    const member = snap.data() || {};
    const permissionOverrides = normalizeOverrides(overrides || {});
    const effectiveProfilePermissions = mergePermissions(member.profilePermissions || {}, permissionOverrides);
    const patch = {
      permissionOverrides,
      overrideCount: countOverrides(permissionOverrides),
      effectiveProfilePermissions,
      permissionOverrideUpdatedAt: nowIso(),
      permissionOverrideUpdatedBy: uid(),
      updatedAt: nowIso(),
      updatedBy: uid(),
      version: VERSION
    };
    const batch = db().batch();
    batch.set(memberRef, patch, { merge: true });
    batch.set(userMembershipRef(memberUid, gid), patch, { merge: true });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: uid(), version: VERSION, schemaVersion: 'businessGroups-0.6.4' }, { merge: true });
    await batch.commit();
    await log('permission_overrides_saved', { targetUid: memberUid, overrideCount: patch.overrideCount });
    if (memberUid === uid() && win.BusinessGroupsService && win.BusinessGroupsService.ensureStateReady) await win.BusinessGroupsService.ensureStateReady();
    return patch;
  }

  async function clearMemberOverrides(groupId, targetUid) {
    return saveMemberOverrides(groupId, targetUid, {});
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
        area: 'Override permessi utente',
        actorUid: uid(),
        actorEmail: win.currentUser && win.currentUser.email ? win.currentUser.email : '',
        date: nowIso().slice(0, 10),
        createdAt: nowIso(),
        details: details || {},
        version: VERSION
      }, { merge: true });
    } catch (e) {
      console.warn('Audit override permessi non registrato:', e);
    }
  }

  win.PermissionOverridesService = {
    VERSION,
    LEVELS,
    LEVEL_LABELS,
    normalizeLevel,
    normalizeOverrides,
    mergePermissions,
    countOverrides,
    moduleCatalog,
    listMembersWithOverrides,
    saveMemberOverrides,
    clearMemberOverrides
  };
})();
