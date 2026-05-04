// js/features/business-groups/security-audit-module.js
// CDSDM 0.12.19 — UI audit sicurezza, report utenti e QA accessi: fix superadmin e messaggi.

(function () {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.securityAudit = window.AppModules.securityAudit || {};
  let _bound = false;
  let _lastReport = null;

  function esc(v) { return $('<div>').text(v == null ? '' : String(v)).html(); }
  function svc() { return window.SecurityAuditService; }
  function canUse() {
    const role = window.currentBusinessGroup && window.currentBusinessGroup.role ? window.currentBusinessGroup.role : '';
    const manager = window.BusinessGroupsService && window.BusinessGroupsService.canManageActiveGroup && window.BusinessGroupsService.canManageActiveGroup();
    const superadmin = window.SuperadminService && window.SuperadminService.isCurrentUserSuperadmin && window.SuperadminService.isCurrentUserSuperadmin();
    return !!manager || !!superadmin || ['admin','teacher'].indexOf(role) >= 0;
  }
  function severityBadge(s) {
    const v = String(s || 'info');
    const cls = v === 'error' ? 'bg-danger' : v === 'warning' ? 'bg-warning text-dark' : 'bg-info text-dark';
    return `<span class="badge ${cls}">${esc(v)}</span>`;
  }
  function okBadge(ok, manual) {
    if (manual) return '<span class="badge bg-secondary">manuale</span>';
    return ok ? '<span class="badge bg-success">OK</span>' : '<span class="badge bg-warning text-dark">Da verificare</span>';
  }
  function levelList(title, arr) {
    return arr && arr.length ? `<div class="small"><strong>${esc(title)}:</strong> ${arr.map(esc).join(', ')}</div>` : '';
  }

  async function render() {
    const root = $('#security-audit-root');
    if (!root.length || !svc()) return;
    const group = window.currentBusinessGroup || null;
    if (!group || !group.id) {
      root.html('<div class="alert alert-info">Seleziona un Gruppo aziendale per generare audit sicurezza e QA accessi.</div>');
      return;
    }
    if (!canUse()) {
      root.html('<div class="alert alert-warning">Audit sicurezza disponibile solo per admin, teacher o superadmin.</div>');
      return;
    }
    let report = _lastReport;
    if (!report || report.groupId !== group.id) {
      try { report = await svc().buildSecurityReport(group.id); _lastReport = report; } catch (e) { root.html('<div class="alert alert-danger">' + esc(e.message || e) + '</div>'); return; }
    }
    const saved = await svc().listSavedReports(group.id);
    const summary = report.summary || {};
    const findingsRows = (report.findings || []).length ? report.findings.map(f => `<tr><td>${severityBadge(f.severity)}</td><td>${esc(f.area)}</td><td>${esc(f.message)}</td></tr>`).join('') : '<tr><td colspan="3" class="text-muted">Nessuna criticità automatica rilevata.</td></tr>';
    const checklistRows = (report.checklist || []).map(c => `<tr><td>${okBadge(c.ok, c.manual)}</td><td>${esc(c.area)}</td><td><strong>${esc(c.check)}</strong><br><span class="text-muted small">${esc(c.expected)}</span></td></tr>`).join('');
    const memberRows = (report.members || []).map(m => `<tr>
      <td><strong>${esc(m.email || m.uid)}</strong><br><code class="small">${esc(m.uid)}</code></td>
      <td>${esc(m.role)}</td>
      <td>${esc(m.status)}</td>
      <td>${m.hasEffectiveProfilePermissions ? '<span class="badge bg-success">presente</span>' : '<span class="badge bg-warning text-dark">mancante</span>'}</td>
      <td>${esc(m.permissionProfileName || m.permissionProfileId || '—')}</td>
      <td>${m.overrideCount ? `<span class="badge bg-warning text-dark">${m.overrideCount}</span>` : '<span class="text-muted">0</span>'}</td>
      <td>${levelList('write', m.writeScopes)}${levelList('admin', m.adminScopes)}</td>
    </tr>`).join('') || '<tr><td colspan="7" class="text-muted">Nessun membro letto.</td></tr>';
    const inviteRows = (report.invites || []).map(i => `<tr><td>${esc(i.email || '')}</td><td>${esc(i.role || '')}</td><td>${esc(i.status || 'pending')}</td><td><code>${esc(i.id || i.code || '')}</code></td><td>${esc(i.expiresAtIso || '—')}</td></tr>`).join('') || '<tr><td colspan="5" class="text-muted">Nessun invito letto.</td></tr>';
    const savedRows = saved.length ? saved.map(r => `<tr><td>${esc(r.generatedAt || '')}</td><td>${esc(r.generatedBy && r.generatedBy.email || '')}</td><td>${esc(r.summary && r.summary.findingsErrors || 0)}</td><td>${esc(r.summary && r.summary.findingsWarnings || 0)}</td><td><code>${esc(r.id)}</code></td></tr>`).join('') : '<tr><td colspan="5" class="text-muted">Nessun report salvato.</td></tr>';

    root.html(`
      <div class="alert alert-primary small">
        <strong>Hotfix 0.12.19.</strong> Audit sicurezza corretto per superadmin e inizializzazione Firestore compatibile; report utenti, QA accessi e controlli restano salvati nel gruppo.
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-3"><div class="card shadow-sm"><div class="card-body"><div class="text-muted small">Membri attivi</div><div class="h3 mb-0">${esc(summary.membersActive || 0)}</div></div></div></div>
        <div class="col-md-3"><div class="card shadow-sm"><div class="card-body"><div class="text-muted small">Admin/Teacher</div><div class="h3 mb-0">${esc(summary.adminsOrTeachers || 0)}</div></div></div></div>
        <div class="col-md-3"><div class="card shadow-sm"><div class="card-body"><div class="text-muted small">Inviti pending</div><div class="h3 mb-0">${esc(summary.invitesPending || 0)}</div></div></div></div>
        <div class="col-md-3"><div class="card shadow-sm"><div class="card-body"><div class="text-muted small">QA OK</div><div class="h3 mb-0">${esc(summary.qaOk || 0)}/${esc(summary.qaTotal || 0)}</div></div></div></div>
      </div>
      <div class="d-flex gap-2 flex-wrap mb-3">
        <button class="btn btn-outline-primary" id="security-audit-refresh-btn" type="button"><i class="fas fa-rotate me-1"></i>Rigenera report</button>
        <button class="btn btn-primary" id="security-audit-save-btn" type="button"><i class="fas fa-save me-1"></i>Salva report nel gruppo</button>
        <button class="btn btn-outline-secondary" id="security-audit-copy-btn" type="button"><i class="fas fa-copy me-1"></i>Copia JSON</button>
      </div>
      <div class="card shadow-sm mb-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-triangle-exclamation me-2"></i>Findings automatici</h5>
        <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Severità</th><th>Area</th><th>Messaggio</th></tr></thead><tbody>${findingsRows}</tbody></table></div>
      </div></div>
      <div class="card shadow-sm mb-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-list-check me-2"></i>Checklist QA accessi</h5>
        <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Stato</th><th>Area</th><th>Verifica</th></tr></thead><tbody>${checklistRows}</tbody></table></div>
      </div></div>
      <div class="card shadow-sm mb-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-users me-2"></i>Report utenti e permessi effettivi</h5>
        <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Utente</th><th>Ruolo</th><th>Stato</th><th>Permessi effettivi</th><th>Profilo</th><th>Override</th><th>Scope elevati</th></tr></thead><tbody>${memberRows}</tbody></table></div>
      </div></div>
      <div class="row g-3">
        <div class="col-xl-6"><div class="card shadow-sm h-100"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-envelope-open-text me-2"></i>Inviti</h5>
          <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Email</th><th>Ruolo</th><th>Stato</th><th>Codice</th><th>Scadenza</th></tr></thead><tbody>${inviteRows}</tbody></table></div>
        </div></div></div>
        <div class="col-xl-6"><div class="card shadow-sm h-100"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-box-archive me-2"></i>Report salvati</h5>
          <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Generato</th><th>Da</th><th>Errori</th><th>Warning</th><th>ID</th></tr></thead><tbody>${savedRows}</tbody></table></div>
        </div></div></div>
      </div>
      <div class="card shadow-sm mt-3"><div class="card-body small">
        <h6>Persistenza 0.12.19</h6>
        <pre class="mb-0"><code>businessGroups/{groupId}/securityAccessReports/{reportId}</code></pre>
        <p class="text-muted mb-0 mt-2">La checklist “rules pubblicate” resta manuale: la SPA può includere il file <code>firestore.rules</code>, ma non può verificare da sola il deploy nel progetto Firebase.</p>
      </div></div>
    `);
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '#security-audit-refresh-btn', async function () { try { _lastReport = null; await render(); } catch (e) { alert(e.message || e); } });
    $(document).on('click', '#security-audit-copy-btn', async function () {
      try { if (!_lastReport) _lastReport = await svc().buildSecurityReport(); await navigator.clipboard.writeText(JSON.stringify(_lastReport, null, 2)); alert('Report sicurezza copiato negli appunti.'); }
      catch (e) { console.error(e); alert('Copia non riuscita: ' + (e.message || e)); }
    });
    $(document).on('click', '#security-audit-save-btn', async function () {
      try { _lastReport = await svc().saveSecurityReport(); await render(); alert('Report sicurezza salvato nel gruppo.'); }
      catch (e) { console.error(e); alert('Salvataggio report non riuscito: ' + (e.message || e)); }
    });
  }

  window.AppModules.securityAudit.bind = bind;
  window.AppModules.securityAudit.render = render;
})();
