// js/features/business-groups/security-audit-service.js
// CDSDM 0.12.19 — Audit sicurezza, report utenti e QA accessi: fix Firestore superadmin.

(function () {
  const win = window;
  const VERSION = '0.6.6';
  const PATCH_VERSION = '0.12.19';
  const LEVEL_RANK = { none: 0, read: 1, write: 2, admin: 3 };

  const QA_CHECKS = [
    { id: 'superadmin-bootstrap', area: 'Bootstrap', check: 'Documento appSettings/system presente e superadmin riconoscibile.', expected: 'Il primo amministratore applicativo è configurato e documentato.' },
    { id: 'memberships-active', area: 'Membership', check: 'Tutti i collaboratori operativi hanno membership attiva nel gruppo.', expected: 'Nessun utente lavora fuori gruppo o con membership ambigua.' },
    { id: 'invites-clean', area: 'Inviti', check: 'Inviti pendenti non scaduti, revocati o accettati coerenti.', expected: 'Gli inviti scaduti vengono marcati e quelli non usati possono essere revocati.' },
    { id: 'profiles-effective', area: 'Permessi', check: 'Ogni membro ha effectiveProfilePermissions denormalizzato.', expected: 'UI e Firestore Rules leggono una matrice effettiva coerente.' },
    { id: 'readonly-safe', area: 'Permessi', check: 'Readonly senza permessi write/admin.', expected: 'Readonly resta realmente in sola lettura.' },
    { id: 'admin-count', area: 'Governance', check: 'Almeno un admin/teacher attivo nel gruppo.', expected: 'Il gruppo resta amministrabile anche durante esercitazioni.' },
    { id: 'rules-published', area: 'Firestore', check: 'firestore.rules 0.6.5+ pubblicate nel progetto Firebase.', expected: 'Le regole lato server bloccano accessi non coerenti con membership e permessi.' },
    { id: 'audit-events', area: 'Audit', check: 'Audit events presenti per operazioni sensibili.', expected: 'Modifiche a ruoli/permessi/inviti lasciano traccia consultabile.' }
  ];

  function firestoreDb() {
    const candidate = win.db || (typeof globalThis !== 'undefined' ? globalThis.db : null);
    if (candidate && typeof candidate.collection === 'function') return candidate;
    try { if (typeof db !== 'undefined' && db && typeof db.collection === 'function') return db; } catch (e) {}
    throw new Error('Firestore non inizializzato: ricarica l’app e verifica la configurazione Firebase.');
  }
  function uid() { return win.currentUser && win.currentUser.uid ? win.currentUser.uid : ''; }
  function email() { return win.currentUser && win.currentUser.email ? win.currentUser.email : ''; }
  function nowIso() { return new Date().toISOString(); }
  function str(v) { return String(v == null ? '' : v).trim(); }
  function activeGroupId(groupId) { return str(groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id) || ''); }
  function groupRef(groupId) { return firestoreDb().collection('businessGroups').doc(String(groupId)); }
  function isManager() { return win.BusinessGroupsService && win.BusinessGroupsService.canManageActiveGroup && win.BusinessGroupsService.canManageActiveGroup(); }
  function isSuperadminKnown() { return win.SuperadminService && win.SuperadminService.isCurrentUserSuperadmin && win.SuperadminService.isCurrentUserSuperadmin(); }
  function moduleCatalog() {
    if (win.PermissionMatrixService && Array.isArray(win.PermissionMatrixService.MODULE_CATALOG)) return win.PermissionMatrixService.MODULE_CATALOG.slice();
    if (win.PermissionProfilesService && Array.isArray(win.PermissionProfilesService.MODULES)) return win.PermissionProfilesService.MODULES.slice();
    return [];
  }
  function rank(level) { return LEVEL_RANK[str(level)] || 0; }

  async function getAllDocs(collectionRef) {
    try {
      const snap = await collectionRef.get();
      return (snap.docs || []).map(d => Object.assign({ id: d.id }, d.data() || {}));
    } catch (e) {
      console.warn('Lettura collezione non disponibile:', e);
      return [];
    }
  }

  async function getLimitedDocs(collectionRef, limit) {
    try {
      const ref = typeof collectionRef.limit === 'function' ? collectionRef.limit(limit || 30) : collectionRef;
      return getAllDocs(ref);
    } catch (e) { return []; }
  }

  function normalizeMember(m) {
    const permissions = m.effectiveProfilePermissions || m.profilePermissions || {};
    const overrideCount = typeof m.overrideCount === 'number' ? m.overrideCount : Object.keys(m.permissionOverrides || {}).length;
    return {
      uid: m.uid || m.id || '',
      email: m.email || '',
      displayName: m.displayName || m.name || '',
      role: m.role || 'readonly',
      roleLabel: m.roleLabel || m.role || 'readonly',
      status: m.status || 'active',
      permissionProfileId: m.permissionProfileId || '',
      permissionProfileName: m.permissionProfileName || '',
      overrideCount,
      effectiveProfilePermissions: permissions,
      hasEffectiveProfilePermissions: !!(permissions && Object.keys(permissions).length),
      writeScopes: Object.keys(permissions || {}).filter(k => rank(permissions[k]) >= 2),
      adminScopes: Object.keys(permissions || {}).filter(k => rank(permissions[k]) >= 3)
    };
  }

  function findFindings(ctx) {
    const findings = [];
    const activeMembers = ctx.members.filter(m => m.status === 'active');
    const adminMembers = activeMembers.filter(m => ['admin', 'teacher'].indexOf(m.role) >= 0);
    if (!ctx.groupId) findings.push({ severity: 'error', area: 'Gruppo', message: 'Nessun Gruppo aziendale attivo selezionato.' });
    if (ctx.groupId && !adminMembers.length) findings.push({ severity: 'error', area: 'Governance', message: 'Il gruppo non ha admin/teacher attivi.' });
    activeMembers.filter(m => !m.hasEffectiveProfilePermissions).forEach(m => findings.push({ severity: 'warning', area: 'Permessi', message: `Membro senza effectiveProfilePermissions: ${m.email || m.uid}` }));
    activeMembers.filter(m => m.role === 'readonly' && (m.writeScopes.length || m.adminScopes.length)).forEach(m => findings.push({ severity: 'error', area: 'Readonly', message: `Readonly con permessi di scrittura/admin: ${m.email || m.uid}` }));
    activeMembers.filter(m => m.adminScopes.length >= 5 && ['admin','teacher'].indexOf(m.role) < 0).forEach(m => findings.push({ severity: 'warning', area: 'Privilegi elevati', message: `Membro non admin con molti scope admin: ${m.email || m.uid}` }));
    const duplicateEmails = {};
    activeMembers.forEach(m => { const e = str(m.email).toLowerCase(); if (e) duplicateEmails[e] = (duplicateEmails[e] || 0) + 1; });
    Object.keys(duplicateEmails).filter(e => duplicateEmails[e] > 1).forEach(e => findings.push({ severity: 'warning', area: 'Utenti', message: `Email duplicata tra membri attivi: ${e}` }));
    const expiredPending = ctx.invites.filter(i => (i.status || 'pending') === 'pending' && i.expiresAtIso && i.expiresAtIso < nowIso()).length;
    if (expiredPending) findings.push({ severity: 'warning', area: 'Inviti', message: `${expiredPending} inviti pendenti risultano scaduti: usa “Marca scaduti”.` });
    const acceptedWithoutMember = ctx.invites.filter(i => (i.status || '') === 'accepted' && i.acceptedBy && !activeMembers.some(m => m.uid === i.acceptedBy)).length;
    if (acceptedWithoutMember) findings.push({ severity: 'warning', area: 'Inviti', message: `${acceptedWithoutMember} inviti accettati non corrispondono a membri attivi.` });
    if (!ctx.auditEvents.length) findings.push({ severity: 'info', area: 'Audit', message: 'Nessun audit event recente letto: verificare se il gruppo è appena creato o se l’audit non è stato ancora usato.' });
    if (ctx.permissionProfiles.length < 3) findings.push({ severity: 'info', area: 'Profili', message: 'Pochi profili permesso presenti: valutare “Profili permesso → Crea profili predefiniti”.' });
    return findings;
  }

  function buildChecklist(ctx, findings) {
    const activeMembers = ctx.members.filter(m => m.status === 'active');
    const adminMembers = activeMembers.filter(m => ['admin','teacher'].indexOf(m.role) >= 0);
    const readonlyUnsafe = activeMembers.some(m => m.role === 'readonly' && (m.writeScopes.length || m.adminScopes.length));
    const missingEffective = activeMembers.some(m => !m.hasEffectiveProfilePermissions);
    const expiredPending = ctx.invites.some(i => (i.status || 'pending') === 'pending' && i.expiresAtIso && i.expiresAtIso < nowIso());
    return QA_CHECKS.map(q => {
      let ok = false;
      if (q.id === 'superadmin-bootstrap') ok = !!ctx.superadmin.systemConfigured;
      if (q.id === 'memberships-active') ok = activeMembers.length > 0;
      if (q.id === 'invites-clean') ok = !expiredPending;
      if (q.id === 'profiles-effective') ok = activeMembers.length > 0 && !missingEffective;
      if (q.id === 'readonly-safe') ok = !readonlyUnsafe;
      if (q.id === 'admin-count') ok = adminMembers.length >= 1;
      if (q.id === 'rules-published') ok = false; // verifica manuale esterna alla SPA
      if (q.id === 'audit-events') ok = ctx.auditEvents.length > 0;
      return Object.assign({}, q, { ok, manual: q.id === 'rules-published' });
    });
  }

  async function buildSecurityReport(groupId) {
    if (!win.currentUser) throw new Error('Utente non autenticato.');
    const gid = activeGroupId(groupId);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    if (!isManager() && !isSuperadminKnown()) throw new Error('Audit sicurezza disponibile per admin, teacher o superadmin.');
    const root = groupRef(gid);
    const groupSnap = await root.get();
    const membersRaw = win.BusinessGroupsService && win.BusinessGroupsService.listMembers ? await win.BusinessGroupsService.listMembers(gid) : await getAllDocs(root.collection('members'));
    const invites = await getAllDocs(root.collection('invites'));
    const permissionProfiles = await getAllDocs(root.collection('permissionProfiles'));
    const permissionMatrices = await getAllDocs(root.collection('permissionMatrices'));
    const auditEvents = await getLimitedDocs(root.collection('auditEvents'), 50);
    const members = membersRaw.map(normalizeMember);
    let system = {};
    try { system = win.SuperadminService && win.SuperadminService.loadSystem ? await win.SuperadminService.loadSystem() : {}; } catch (e) { system = {}; }
    const ctx = {
      version: VERSION,
      generatedAt: nowIso(),
      generatedBy: { uid: uid(), email: email() },
      groupId: gid,
      groupName: groupSnap.exists ? ((groupSnap.data() || {}).name || gid) : gid,
      groupExists: groupSnap.exists,
      activeRole: win.currentBusinessGroup && win.currentBusinessGroup.role ? win.currentBusinessGroup.role : '',
      superadmin: { systemConfigured: !!(system && system.exists), currentUserIsSuperadmin: !!isSuperadminKnown(), superadminEmail: system.superadminEmail || '' },
      members,
      invites,
      permissionProfiles,
      permissionMatrices,
      auditEvents,
      moduleCatalog: moduleCatalog().map(m => ({ id: m.id, label: m.label, scope: m.scope, targets: m.targets || [] }))
    };
    const findings = findFindings(ctx);
    const checklist = buildChecklist(ctx, findings);
    return Object.assign(ctx, {
      summary: {
        membersTotal: members.length,
        membersActive: members.filter(m => m.status === 'active').length,
        adminsOrTeachers: members.filter(m => m.status === 'active' && ['admin','teacher'].indexOf(m.role) >= 0).length,
        invitesTotal: invites.length,
        invitesPending: invites.filter(i => (i.status || 'pending') === 'pending').length,
        profilesTotal: permissionProfiles.length,
        findingsErrors: findings.filter(f => f.severity === 'error').length,
        findingsWarnings: findings.filter(f => f.severity === 'warning').length,
        qaOk: checklist.filter(c => c.ok).length,
        qaTotal: checklist.length
      },
      checklist,
      findings
    });
  }

  async function saveSecurityReport(groupId) {
    const gid = activeGroupId(groupId);
    const report = await buildSecurityReport(gid);
    const ref = groupRef(gid).collection('securityAccessReports').doc('security_' + Date.now());
    await ref.set(Object.assign({}, report, { id: ref.id, schemaVersion: 'securityAudit-0.6.6' }), { merge: true });
    await log('security_access_report_created', { reportId: ref.id, findingsErrors: report.summary.findingsErrors, findingsWarnings: report.summary.findingsWarnings });
    return Object.assign({}, report, { id: ref.id });
  }

  async function listSavedReports(groupId) {
    const gid = activeGroupId(groupId);
    if (!gid) return [];
    const rows = await getLimitedDocs(groupRef(gid).collection('securityAccessReports'), 30);
    return rows.sort((a, b) => String(b.generatedAt || '').localeCompare(String(a.generatedAt || '')));
  }

  async function log(action, details) {
    try {
      const gid = activeGroupId();
      if (!gid) return;
      const ref = groupRef(gid).collection('auditEvents').doc();
      await ref.set({
        id: ref.id,
        type: 'security',
        action,
        area: 'Audit sicurezza e QA accessi',
        actorUid: uid(),
        actorEmail: email(),
        date: nowIso().slice(0, 10),
        createdAt: nowIso(),
        details: details || {},
        version: VERSION
      }, { merge: true });
    } catch (e) { console.warn('Audit sicurezza non registrato:', e); }
  }

  win.SecurityAuditService = {
    VERSION,
    PATCH_VERSION,
    QA_CHECKS,
    buildSecurityReport,
    saveSecurityReport,
    listSavedReports,
    normalizeMember
  };
})();
