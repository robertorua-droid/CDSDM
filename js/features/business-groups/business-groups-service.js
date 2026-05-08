// js/features/business-groups/business-groups-service.js
// CDSDM 0.6.4 — Gruppi aziendali: membri, inviti e profili permesso

(function () {
  const win = window;
  const STORAGE_PREFIX = 'cdsdm.activeBusinessGroup.';
  const VERSION = '0.13.13';
  const ROLES = {
    admin: 'Amministratore',
    accounting: 'Contabilità',
    sales: 'Vendite',
    purchases: 'Acquisti',
    warehouse: 'Magazzino',
    readonly: 'Sola lettura',
    teacher: 'Docente/Revisore'
  };
  const ROLE_DESCRIPTIONS = {
    admin: 'Gestione completa del gruppo e dei dati condivisi.',
    accounting: 'Profilo contabilità: fatture, acquisti, incassi, scadenze e registri.',
    sales: 'Profilo vendite: clienti, preventivi, ordini cliente, DDT e fatture cliente.',
    purchases: 'Profilo acquisti: fornitori, ordini fornitore, DDT ricevuti e acquisti.',
    warehouse: 'Profilo magazzino: prodotti, movimenti, inventario, lotti e quarantena.',
    readonly: 'Consultazione senza modifiche operative.',
    teacher: 'Docente o revisore: supervisione didattica e gestione del gruppo.'
  };

  function nowIso() { return new Date().toISOString(); }
  function str(v) { return String(v == null ? '' : v).trim(); }
  function lower(v) { return str(v).toLowerCase(); }
  function dataCollections() { return win.CDSDM_DATA_COLLECTIONS || []; }
  function activeStorageKey() { return STORAGE_PREFIX + (win.currentUser && win.currentUser.uid ? win.currentUser.uid : 'anonymous'); }
  function setWindowState(group, memberships) {
    win.currentBusinessGroup = group || null;
    win.businessGroupMemberships = Array.isArray(memberships) ? memberships : (win.businessGroupMemberships || []);
  }
  function roleLabel(role) { return ROLES[role] || role || '—'; }
  function normalizeRole(role) { return ROLES[role] ? role : 'readonly'; }
  function isActiveStatus(status) { return !status || String(status) === 'active'; }
  function toDateValue(value) {
    if (!value) return null;
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  function toIsoDate(value) {
    const d = toDateValue(value);
    return d ? d.toISOString() : '';
  }
  function defaultInviteExpiry(days) {
    const n = Math.max(1, Math.min(90, parseInt(days || 14, 10) || 14));
    return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  }
  function isInviteExpired(invite) {
    const status = String((invite && invite.status) || 'pending');
    if (status !== 'pending') return false;
    const d = toDateValue(invite && invite.expiresAt);
    return !!(d && d.getTime() < Date.now());
  }
  function effectiveInviteStatus(invite) {
    if (!invite) return 'unknown';
    const status = String(invite.status || 'pending');
    return isInviteExpired(invite) ? 'expired' : status;
  }
  function inviteIsUsable(invite) {
    return effectiveInviteStatus(invite) === 'pending';
  }
  function canManageMembership(role) { return role === 'admin' || role === 'teacher'; }
  function activeMembershipRole() {
    const g = win.currentBusinessGroup || {};
    return normalizeRole(g.role || (g.membership && g.membership.role) || 'readonly');
  }
  function canManageActiveGroup() { return !!(win.currentBusinessGroup && win.currentBusinessGroup.id && canManageMembership(activeMembershipRole())); }
  function groupRef(groupId) { return db.collection('businessGroups').doc(String(groupId)); }
  function userMembershipRef(uid, groupId) { return db.collection('users').doc(String(uid)).collection('memberships').doc(String(groupId)); }

  async function readGroup(groupId) {
    const snap = await groupRef(groupId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  async function listMemberships() {
    if (!win.currentUser) return [];
    const snap = await db.collection('users').doc(win.currentUser.uid).collection('memberships').get();
    const rows = [];
    for (const doc of snap.docs) {
      const membership = { id: doc.id, groupId: doc.id, ...(doc.data() || {}) };
      if (!isActiveStatus(membership.status)) continue;
      try {
        const group = await readGroup(doc.id);
        if (group && isActiveStatus(group.status)) {
          membership.groupName = group.name || membership.groupName || doc.id;
          membership.groupStatus = group.status || 'active';
          membership.group = group;
          rows.push(membership);
        } else if (!group) {
          rows.push(membership);
        }
      } catch (e) {
        console.warn('Membership non risolta:', doc.id, e);
        rows.push(membership);
      }
    }
    rows.sort((a, b) => str(a.groupName || a.groupId).localeCompare(str(b.groupName || b.groupId)));
    win.businessGroupMemberships = rows;
    return rows;
  }

  async function ensureStateReady() {
    if (!win.currentUser) { setWindowState(null, []); return null; }
    const memberships = await listMemberships();
    const saved = localStorage.getItem(activeStorageKey()) || '';
    const chosen = memberships.find(m => String(m.groupId) === String(saved)) || memberships[0] || null;
    if (!chosen) {
      setWindowState(null, memberships);
      updateSidebarBadge();
      return null;
    }
    const group = chosen.group || await readGroup(chosen.groupId);
    setWindowState({ ...(group || {}), id: chosen.groupId, role: chosen.role || 'readonly', membership: chosen }, memberships);
    localStorage.setItem(activeStorageKey(), chosen.groupId);
    updateSidebarBadge();
    return win.currentBusinessGroup;
  }

  async function setActiveBusinessGroup(groupId) {
    if (!win.currentUser) throw new Error('Utente non autenticato');
    if (!groupId) {
      localStorage.removeItem(activeStorageKey());
      setWindowState(null, win.businessGroupMemberships || []);
      updateSidebarBadge();
      return null;
    }
    localStorage.setItem(activeStorageKey(), String(groupId));
    await ensureStateReady();
    return win.currentBusinessGroup;
  }

  async function createBusinessGroup(name, options = {}) {
    if (!win.currentUser) throw new Error('Utente non autenticato');
    const groupName = str(name);
    if (!groupName) throw new Error('Inserisci il nome del Gruppo aziendale.');
    const uid = win.currentUser.uid;
    const email = win.currentUser.email || '';
    const ref = db.collection('businessGroups').doc();
    const group = {
      name: groupName,
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: uid,
      ownerUid: uid,
      version: VERSION,
      schemaVersion: 'businessGroups-0.6.4',
      legacyCopied: false,
      memberCount: 1,
      inviteCount: 0,
      notes: 'Gruppo aziendale condiviso didattico.'
    };
    const adminProfileId = 'admin_standard';
    const adminPermissions = { customers: 'admin', suppliers: 'admin', products: 'admin', sales: 'admin', invoices: 'admin', purchases: 'admin', warehouse: 'admin', accounting: 'admin', projects: 'admin', reports: 'admin', workflow: 'admin', audit: 'admin', print: 'admin', import: 'admin', settings: 'admin', permissions: 'admin', teacherConsole: 'admin', migrationQa: 'admin', danger: 'admin' };
    const member = { uid, email, role: 'admin', roleLabel: roleLabel('admin'), status: 'active', joinedAt: nowIso(), addedBy: uid, permissionProfileId: adminProfileId, permissionProfileName: 'Amministratore standard', profilePermissions: adminPermissions, version: VERSION };
    const membership = { groupId: ref.id, groupName, role: 'admin', roleLabel: roleLabel('admin'), status: 'active', joinedAt: nowIso(), updatedAt: nowIso(), permissionProfileId: adminProfileId, permissionProfileName: 'Amministratore standard', profilePermissions: adminPermissions, version: VERSION };
    const batch = db.batch();
    batch.set(ref, group, { merge: true });
    batch.set(ref.collection('members').doc(uid), member, { merge: true });
    batch.set(userMembershipRef(uid, ref.id), membership, { merge: true });
    await batch.commit();
    await setActiveBusinessGroup(ref.id);
    if (options.copyLegacy) await copyLegacyDataToGroup(ref.id, { skipIfTargetHasData: true });
    await logGroupEvent(ref.id, 'business_group_created', { groupName, targetUid: uid, role: 'admin' });
    await listMemberships();
    updateSidebarBadge();
    return { id: ref.id, ...group, role: 'admin' };
  }

  async function copyLegacyDataToGroup(groupId, options = {}) {
    if (!win.currentUser) throw new Error('Utente non autenticato');
    const gid = String(groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id) || '');
    if (!gid) throw new Error('Nessun Gruppo aziendale selezionato.');
    const userRef = db.collection('users').doc(win.currentUser.uid);
    const targetGroupRef = groupRef(gid);

    if (options.skipIfTargetHasData) {
      const probe = await targetGroupRef.collection('settings').doc('companyInfo').get();
      if (probe.exists) return { skipped: true, reason: 'target-not-empty' };
    }

    const companySnap = await userRef.collection('settings').doc('companyInfo').get();
    if (companySnap.exists) {
      await targetGroupRef.collection('settings').doc('companyInfo').set({ ...companySnap.data(), migratedFromLegacyUid: win.currentUser.uid, migratedAt: nowIso(), businessGroupId: gid }, { merge: true });
    }

    const perCollection = {};
    for (const col of dataCollections()) {
      const snap = await userRef.collection(col).get();
      perCollection[col] = snap.docs.length;
      for (let i = 0; i < snap.docs.length; i += 450) {
        const batch = db.batch();
        snap.docs.slice(i, i + 450).forEach(d => batch.set(targetGroupRef.collection(col).doc(d.id), { ...d.data(), migratedFromLegacyUid: win.currentUser.uid, migratedAt: nowIso(), businessGroupId: gid }, { merge: true }));
        await batch.commit();
      }
    }
    await targetGroupRef.set({ legacyCopied: true, legacyCopiedAt: nowIso(), legacyCopiedFromUid: win.currentUser.uid, updatedAt: nowIso(), version: VERSION, schemaVersion: 'businessGroups-0.6.4' }, { merge: true });
    await logGroupEvent(gid, 'legacy_data_copied', { sourceUid: win.currentUser.uid, perCollection });
    return { skipped: false, perCollection };
  }

  async function listMembers(groupId) {
    const gid = groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id);
    if (!gid) return [];
    const snap = await groupRef(gid).collection('members').get();
    const rows = snap.docs.map(d => ({ id: d.id, uid: d.id, ...(d.data() || {}) }));
    rows.sort((a, b) => str(a.email || a.uid).localeCompare(str(b.email || b.uid)));
    return rows;
  }

  async function assertCanManage(groupId) {
    if (!win.currentUser) throw new Error('Utente non autenticato');
    const gid = groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id);
    if (!gid) throw new Error('Nessun Gruppo aziendale attivo.');
    const member = await groupRef(gid).collection('members').doc(win.currentUser.uid).get();
    const role = member.exists ? normalizeRole((member.data() || {}).role) : activeMembershipRole();
    if (!canManageMembership(role)) throw new Error('Solo Amministratore o Docente/Revisore possono gestire membri e inviti.');
    return { groupId: gid, role };
  }

  async function addMemberToGroup(groupId, payload = {}) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const uid = str(payload.uid);
    const email = lower(payload.email);
    const role = normalizeRole(payload.role);
    if (!uid) throw new Error('Inserisci lo UID Firebase del membro.');
    const group = await readGroup(gid) || { id: gid, name: gid };
    const member = {
      uid,
      email,
      displayName: str(payload.displayName),
      role,
      roleLabel: roleLabel(role),
      status: 'active',
      joinedAt: payload.joinedAt || nowIso(),
      addedAt: nowIso(),
      addedBy: win.currentUser.uid,
      version: VERSION
    };
    const membership = {
      groupId: gid,
      groupName: group.name || gid,
      role,
      roleLabel: roleLabel(role),
      status: 'active',
      joinedAt: member.joinedAt,
      updatedAt: nowIso(),
      addedBy: win.currentUser.uid,
      version: VERSION
    };
    const batch = db.batch();
    batch.set(groupRef(gid).collection('members').doc(uid), member, { merge: true });
    batch.set(userMembershipRef(uid, gid), membership, { merge: true });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: win.currentUser.uid, version: VERSION, schemaVersion: 'businessGroups-0.6.4' }, { merge: true });
    await batch.commit();
    await logGroupEvent(gid, 'member_added', { targetUid: uid, targetEmail: email, role });
    if (uid === win.currentUser.uid) await ensureStateReady();
    return member;
  }

  async function updateMemberRole(groupId, uid, role) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const targetUid = str(uid);
    const newRole = normalizeRole(role);
    if (!targetUid) throw new Error('Membro non valido.');
    if (targetUid === win.currentUser.uid && !canManageMembership(newRole)) {
      throw new Error('Non puoi rimuovere da te stesso i permessi di gestione del gruppo.');
    }
    const group = await readGroup(gid) || { id: gid, name: gid };
    const patch = { role: newRole, roleLabel: roleLabel(newRole), updatedAt: nowIso(), updatedBy: win.currentUser.uid, version: VERSION };
    const batch = db.batch();
    batch.set(groupRef(gid).collection('members').doc(targetUid), patch, { merge: true });
    batch.set(userMembershipRef(targetUid, gid), { groupId: gid, groupName: group.name || gid, ...patch, status: 'active' }, { merge: true });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: win.currentUser.uid, version: VERSION }, { merge: true });
    await batch.commit();
    await logGroupEvent(gid, 'member_role_changed', { targetUid, role: newRole });
    if (targetUid === win.currentUser.uid) await ensureStateReady();
    return patch;
  }

  async function removeMemberFromGroup(groupId, uid) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const targetUid = str(uid);
    if (!targetUid) throw new Error('Membro non valido.');
    if (targetUid === win.currentUser.uid) throw new Error('Non puoi rimuovere la tua membership dal gruppo attivo.');
    const batch = db.batch();
    batch.set(groupRef(gid).collection('members').doc(targetUid), { status: 'removed', removedAt: nowIso(), removedBy: win.currentUser.uid, updatedAt: nowIso(), version: VERSION }, { merge: true });
    batch.set(userMembershipRef(targetUid, gid), { status: 'removed', removedAt: nowIso(), removedBy: win.currentUser.uid, updatedAt: nowIso(), version: VERSION }, { merge: true });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: win.currentUser.uid, version: VERSION }, { merge: true });
    await batch.commit();
    await logGroupEvent(gid, 'member_removed', { targetUid });
    return true;
  }

  function generateInviteCode() {
    const a = Math.random().toString(36).slice(2, 6).toUpperCase();
    const b = Date.now().toString(36).slice(-4).toUpperCase();
    return 'BG-' + a + '-' + b;
  }

  async function createInvite(groupId, payload = {}) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const email = lower(payload.email);
    const role = normalizeRole(payload.role);
    const permissionProfileId = str(payload.permissionProfileId || '');
    let permissionProfileName = '';
    let profilePermissions = {};
    if (permissionProfileId) {
      try {
        const profileSnap = await groupRef(gid).collection('permissionProfiles').doc(permissionProfileId).get();
        if (profileSnap.exists) {
          const profile = profileSnap.data() || {};
          permissionProfileName = profile.name || permissionProfileId;
          profilePermissions = profile.permissions || {};
        }
      } catch (e) { console.warn('Profilo invito non letto:', e); }
    }
    if (!email) throw new Error('Inserisci l’email dell’invitato.');
    const inviteCode = str(payload.inviteCode) || generateInviteCode();
    const expiresAt = payload.expiresAt ? (toDateValue(payload.expiresAt) || defaultInviteExpiry(14)) : defaultInviteExpiry(payload.expiresInDays || 14);
    const group = await readGroup(gid) || { id: gid, name: gid };
    const invite = {
      id: inviteCode,
      groupId: gid,
      groupName: group.name || gid,
      email,
      role,
      roleLabel: roleLabel(role),
      status: 'pending',
      onboardingStatus: 'pending',
      createdAt: nowIso(),
      createdBy: win.currentUser.uid,
      expiresAt,
      expiresAtIso: toIsoDate(expiresAt),
      acceptedAt: null,
      acceptedBy: null,
      revokedAt: null,
      revokedBy: null,
      replacedByInviteCode: null,
      notes: str(payload.notes),
      permissionProfileId,
      permissionProfileName,
      profilePermissions,
      version: VERSION
    };
    const batch = db.batch();
    batch.set(groupRef(gid).collection('invites').doc(inviteCode), invite, { merge: true });
    batch.set(groupRef(gid), { updatedAt: nowIso(), updatedBy: win.currentUser.uid, version: VERSION, schemaVersion: 'businessGroups-0.6.4' }, { merge: true });
    await batch.commit();
    await logGroupEvent(gid, 'invite_created', { targetEmail: email, role, inviteCode, expiresAt: invite.expiresAtIso });
    return { ...invite, expiresAt: invite.expiresAtIso, effectiveStatus: 'pending' };
  }

  async function listInvites(groupId, filters = {}) {
    const gid = groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id);
    if (!gid) return [];
    const snap = await groupRef(gid).collection('invites').get();
    let rows = snap.docs.map(d => {
      const data = d.data() || {};
      return { id: d.id, ...data, expiresAtIso: data.expiresAtIso || toIsoDate(data.expiresAt), effectiveStatus: effectiveInviteStatus(data) };
    });
    const emailFilter = lower(filters.email || '');
    const statusFilter = str(filters.status || 'all');
    if (emailFilter) rows = rows.filter(r => lower(r.email).indexOf(emailFilter) >= 0);
    if (statusFilter && statusFilter !== 'all') rows = rows.filter(r => (r.effectiveStatus || r.status || 'pending') === statusFilter);
    rows.sort((a, b) => str(b.createdAt).localeCompare(str(a.createdAt)));
    return rows;
  }

  async function revokeInvite(groupId, inviteCode) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const code = str(inviteCode);
    if (!code) throw new Error('Invito non valido.');
    await groupRef(gid).collection('invites').doc(code).set({ status: 'revoked', onboardingStatus: 'revoked', revokedAt: nowIso(), revokedBy: win.currentUser.uid, updatedAt: nowIso(), version: VERSION }, { merge: true });
    await logGroupEvent(gid, 'invite_revoked', { inviteCode: code });
    return true;
  }

  async function expireInvite(groupId, inviteCode) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const code = str(inviteCode);
    if (!code) throw new Error('Invito non valido.');
    await groupRef(gid).collection('invites').doc(code).set({ status: 'expired', onboardingStatus: 'expired', expiredAt: nowIso(), expiredBy: win.currentUser.uid, updatedAt: nowIso(), version: VERSION }, { merge: true });
    await logGroupEvent(gid, 'invite_expired_manually', { inviteCode: code });
    return true;
  }

  async function regenerateInviteCode(groupId, inviteCode, options = {}) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const code = str(inviteCode);
    if (!code) throw new Error('Invito non valido.');
    const oldRef = groupRef(gid).collection('invites').doc(code);
    const oldSnap = await oldRef.get();
    if (!oldSnap.exists) throw new Error('Invito non trovato.');
    const old = { id: code, ...(oldSnap.data() || {}) };
    if ((old.status || 'pending') === 'accepted') throw new Error('Non puoi rigenerare un invito già accettato.');
    const newCode = generateInviteCode();
    const expiry = options.expiresAt ? toDateValue(options.expiresAt) : defaultInviteExpiry(options.expiresInDays || 14);
    const replacement = {
      ...old,
      id: newCode,
      status: 'pending',
      onboardingStatus: 'pending',
      createdAt: nowIso(),
      createdBy: win.currentUser.uid,
      regeneratedFromInviteCode: code,
      expiresAt: expiry,
      expiresAtIso: toIsoDate(expiry),
      acceptedAt: null,
      acceptedBy: null,
      revokedAt: null,
      revokedBy: null,
      replacedByInviteCode: null,
      version: VERSION
    };
    const batch = db.batch();
    batch.set(oldRef, { status: 'revoked', onboardingStatus: 'replaced', replacedByInviteCode: newCode, revokedAt: nowIso(), revokedBy: win.currentUser.uid, updatedAt: nowIso(), version: VERSION }, { merge: true });
    batch.set(groupRef(gid).collection('invites').doc(newCode), replacement, { merge: true });
    await batch.commit();
    await logGroupEvent(gid, 'invite_regenerated', { oldInviteCode: code, inviteCode: newCode, targetEmail: old.email, role: old.role });
    return { ...replacement, expiresAt: replacement.expiresAtIso, effectiveStatus: 'pending' };
  }

  async function cleanupExpiredInvites(groupId) {
    const ctx = await assertCanManage(groupId);
    const gid = ctx.groupId;
    const rows = await listInvites(gid, { status: 'expired' });
    const pendingExpired = rows.filter(r => String(r.status || 'pending') === 'pending' && r.effectiveStatus === 'expired');
    for (let i = 0; i < pendingExpired.length; i += 450) {
      const batch = db.batch();
      pendingExpired.slice(i, i + 450).forEach(inv => batch.set(groupRef(gid).collection('invites').doc(inv.id), { status: 'expired', onboardingStatus: 'expired', expiredAt: nowIso(), expiredBy: win.currentUser.uid, updatedAt: nowIso(), version: VERSION }, { merge: true }));
      await batch.commit();
    }
    if (pendingExpired.length) await logGroupEvent(gid, 'expired_invites_cleaned', { count: pendingExpired.length });
    return { count: pendingExpired.length };
  }

  async function acceptInvite(groupId, inviteCode) {
    if (!win.currentUser) throw new Error('Utente non autenticato');
    const gid = str(groupId);
    const code = str(inviteCode);
    if (!gid || !code) throw new Error('Inserisci ID gruppo e codice invito.');
    const inviteRef = groupRef(gid).collection('invites').doc(code);
    const inviteSnap = await inviteRef.get();
    if (!inviteSnap.exists) throw new Error('Invito non trovato.');
    const invite = inviteSnap.data() || {};
    if (!inviteIsUsable(invite)) throw new Error(effectiveInviteStatus(invite) === 'expired' ? 'Invito scaduto.' : 'Invito non più attivo.');
    const currentEmail = lower(win.currentUser.email || '');
    if (invite.email && lower(invite.email) !== currentEmail) throw new Error('Questo invito è associato a un’altra email.');
    const member = await addMemberToGroupAsInvitee(gid, invite);
    await inviteRef.set({ status: 'accepted', onboardingStatus: 'accepted', acceptedAt: nowIso(), acceptedBy: win.currentUser.uid, acceptedEmail: currentEmail, updatedAt: nowIso(), version: VERSION }, { merge: true });
    await setActiveBusinessGroup(gid);
    await logGroupEvent(gid, 'invite_accepted', { inviteCode: code, targetUid: win.currentUser.uid, targetEmail: currentEmail, role: invite.role });
    return member;
  }

  async function addMemberToGroupAsInvitee(gid, invite) {
    const uid = win.currentUser.uid;
    const role = normalizeRole(invite.role);
    // 0.13.11: l'invitato non può leggere il documento root del gruppo prima di essere membro.
    // Usiamo quindi i dati già denormalizzati nell'invito, evitando una lettura Firestore negata dalle rules.
    const safeGroupName = str(invite.groupName || invite.businessName || gid) || gid;
    const profilePatch = invite.permissionProfileId ? { permissionProfileId: invite.permissionProfileId || '', permissionProfileName: invite.permissionProfileName || '', profilePermissions: invite.profilePermissions || {} } : {};
    const member = Object.assign({ uid, email: win.currentUser.email || invite.email || '', role, roleLabel: roleLabel(role), status: 'active', joinedAt: nowIso(), addedBy: invite.createdBy || 'invite', inviteCode: invite.id || '', version: VERSION }, profilePatch);
    const membership = Object.assign({ groupId: gid, groupName: safeGroupName, role, roleLabel: roleLabel(role), status: 'active', joinedAt: member.joinedAt, updatedAt: nowIso(), inviteCode: invite.id || '', version: VERSION }, profilePatch);
    const batch = db.batch();
    batch.set(groupRef(gid).collection('members').doc(uid), member, { merge: true });
    batch.set(userMembershipRef(uid, gid), membership, { merge: true });
    // L'invitato non aggiorna il documento root del gruppo; le rules consentono solo member/membership/invite.
    await batch.commit();
    return member;
  }

  async function logGroupEvent(groupId, action, details = {}) {
    try {
      const gid = groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id);
      if (!gid || !db) return;
      const ref = groupRef(gid).collection('auditEvents').doc();
      await ref.set({
        id: ref.id,
        type: 'businessGroup',
        action,
        area: 'Gruppi aziendali',
        actorUid: win.currentUser && win.currentUser.uid ? win.currentUser.uid : '',
        actorEmail: win.currentUser && win.currentUser.email ? win.currentUser.email : '',
        date: nowIso().slice(0, 10),
        createdAt: nowIso(),
        details,
        version: VERSION
      }, { merge: true });
    } catch (e) {
      console.warn('Audit Gruppo aziendale non registrato:', e);
    }
  }

  function activeLabel() {
    const g = win.currentBusinessGroup;
    if (!g || !g.id) return 'Dati personali legacy';
    return (g.name || g.id) + ' — ' + roleLabel(g.role || (g.membership && g.membership.role));
  }

  function updateSidebarBadge() {
    const $badge = $('#business-group-sidebar');
    if (!$badge.length) return;
    const g = win.currentBusinessGroup;
    if (g && g.id) {
      $badge.html('<i class="fas fa-building-user me-1"></i><span>' + $('<div>').text(g.name || g.id).html() + '</span><br><span class="small opacity-75">Ruolo: ' + $('<div>').text(roleLabel(g.role || 'readonly')).html() + '</span>');
    } else {
      $badge.html('<i class="fas fa-user-lock me-1"></i><span>Dati personali legacy</span><br><span class="small opacity-75">Nessun gruppo attivo</span>');
    }
  }

  win.BusinessGroupsService = {
    VERSION,
    ROLES,
    ROLE_DESCRIPTIONS,
    roleLabel,
    normalizeRole,
    canManageMembership,
    canManageActiveGroup,
    listMemberships,
    ensureStateReady,
    setActiveBusinessGroup,
    createBusinessGroup,
    copyLegacyDataToGroup,
    listMembers,
    addMemberToGroup,
    updateMemberRole,
    removeMemberFromGroup,
    createInvite,
    listInvites,
    revokeInvite,
    expireInvite,
    regenerateInviteCode,
    cleanupExpiredInvites,
    acceptInvite,
    generateInviteCode,
    effectiveInviteStatus,
    updateSidebarBadge,
    activeLabel
  };
})();
