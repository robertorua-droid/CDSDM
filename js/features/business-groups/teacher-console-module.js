// js/features/business-groups/teacher-console-module.js
// CDSDM 0.5.6 — UI Console docente e simulazioni di gruppo

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.teacherConsole = window.AppModules.teacherConsole || {};
  let _bound = false;
  let lastDashboard = null;

  function esc(v) { return $('<div>').text(String(v == null ? '' : v)).html(); }
  function statusBadge(status) {
    const s = String(status || 'draft');
    const cls = s === 'active' ? 'success' : (s === 'completed' ? 'primary' : (s === 'paused' ? 'warning' : 'secondary'));
    const label = { draft: 'Bozza', active: 'Attiva', paused: 'In pausa', completed: 'Completata' }[s] || s;
    return `<span class="badge text-bg-${cls}">${esc(label)}</span>`;
  }
  function templateOptions() {
    const svc = window.TeacherConsoleService;
    return Object.keys(svc.SCENARIO_TEMPLATES).map(k => {
      const tpl = svc.SCENARIO_TEMPLATES[k];
      return `<option value="${esc(k)}">${esc(tpl.title)} — ${esc(tpl.area)}</option>`;
    }).join('');
  }
  function collectionCards(stats) {
    const items = [
      ['customers', 'Clienti'], ['suppliers', 'Fornitori'], ['products', 'Prodotti'],
      ['invoices', 'Fatture'], ['purchases', 'Acquisti'], ['warehouseMovements', 'Movimenti magazzino'],
      ['workflowEvents', 'Workflow'], ['auditEvents', 'Audit']
    ];
    return items.map(([key, label]) => `
      <div class="col-6 col-md-3 col-xl-2"><div class="border rounded-3 p-2 h-100 bg-light">
        <div class="small text-muted">${esc(label)}</div><div class="fs-5 fw-semibold">${Number(stats[key] || 0)}</div>
      </div></div>`).join('');
  }
  function scenarioRows(scenarios) {
    return (scenarios || []).map(s => `
      <tr>
        <td><strong>${esc(s.title)}</strong><br><span class="small text-muted">${esc(s.area || 'Didattica')} · ${esc((s.checklist || []).length)} attività</span></td>
        <td>${statusBadge(s.status)}</td>
        <td class="small">${esc(s.updatedAt ? String(s.updatedAt).slice(0, 16).replace('T', ' ') : '')}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-success teacher-scenario-status" data-id="${esc(s.id)}" data-status="active" type="button">Avvia</button>
          <button class="btn btn-sm btn-outline-warning teacher-scenario-status" data-id="${esc(s.id)}" data-status="paused" type="button">Pausa</button>
          <button class="btn btn-sm btn-outline-primary teacher-scenario-status" data-id="${esc(s.id)}" data-status="completed" type="button">Completa</button>
          <button class="btn btn-sm btn-outline-danger teacher-scenario-delete" data-id="${esc(s.id)}" type="button">Elimina</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="4" class="text-center text-muted py-4">Nessuno scenario didattico creato.</td></tr>';
  }
  function eventRows(events) {
    return (events || []).slice(0, 10).map(e => `
      <tr><td class="small text-muted">${esc(e.createdAt ? String(e.createdAt).slice(0, 16).replace('T', ' ') : '')}</td><td>${esc(e.action)}</td><td class="small">${esc(e.actorEmail || e.actorUid || '')}</td></tr>
    `).join('') || '<tr><td colspan="3" class="text-center text-muted py-4">Nessun evento simulazione registrato.</td></tr>';
  }

  async function render() {
    const svc = window.TeacherConsoleService;
    const $root = $('#teacher-console-root');
    if (!svc || !$root.length) return;
    if (!window.currentBusinessGroup || !window.currentBusinessGroup.id) {
      $root.html('<div class="alert alert-warning"><strong>Gruppo aziendale non selezionato.</strong> Seleziona un gruppo condiviso prima di aprire la Console docente.</div>');
      return;
    }
    if (!svc.canUseTeacherConsole()) {
      $root.html('<div class="alert alert-secondary"><strong>Console docente non disponibile.</strong> La sezione è riservata ai ruoli Amministratore e Docente/Revisore del Gruppo aziendale attivo.</div>');
      return;
    }
    const dashboard = await svc.getDashboard();
    lastDashboard = dashboard;
    const stats = dashboard.collectionStats || {};
    const report = svc.buildProgressReport(dashboard);
    $root.html(`
      <div class="alert alert-info small"><strong>Versione 0.5.6.</strong> Console docente per coordinare simulazioni didattiche sul Gruppo aziendale attivo. Non richiede backend custom: scenari ed eventi sono salvati sotto <code>businessGroups/{groupId}</code>.</div>
      <div class="row g-3 mb-3">
        <div class="col-md-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Gruppo</div><div class="fw-semibold">${esc(dashboard.groupName)}</div><div class="small text-muted">${esc(dashboard.groupId)}</div></div></div></div>
        <div class="col-md-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Membri attivi</div><div class="display-6">${dashboard.activeMembers}</div></div></div></div>
        <div class="col-md-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Inviti pendenti</div><div class="display-6">${dashboard.pendingInvites}</div></div></div></div>
        <div class="col-md-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="text-muted small">Scenari attivi</div><div class="display-6">${dashboard.activeScenarios}</div></div></div></div>
      </div>
      <div class="card shadow-sm mb-3"><div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2"><h5 class="card-title mb-0"><i class="fas fa-chart-simple me-2"></i>Indicatori dataset gruppo</h5><button class="btn btn-sm btn-outline-secondary" id="teacher-copy-report" type="button"><i class="fas fa-copy me-1"></i>Copia report</button></div>
        <div class="row g-2">${collectionCards(stats)}</div>
        <pre class="bg-light border rounded p-2 mt-3 small mb-0" id="teacher-progress-report">${esc(JSON.stringify(report, null, 2))}</pre>
      </div></div>
      <div class="row g-3">
        <div class="col-xl-5"><div class="card shadow-sm h-100"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-chalkboard-user me-2"></i>Avvia scenario da template</h5>
          <select class="form-select" id="teacher-template-key">${templateOptions()}</select>
          <button class="btn btn-primary mt-3 w-100" id="teacher-create-template" type="button"><i class="fas fa-play me-1"></i>Crea e avvia scenario</button>
          <hr>
          <h6>Scenario personalizzato</h6>
          <label class="form-label" for="teacher-scenario-title">Titolo</label><input class="form-control" id="teacher-scenario-title" placeholder="Es. Verifica ciclo completo Alfa">
          <label class="form-label mt-2" for="teacher-scenario-area">Area</label><input class="form-control" id="teacher-scenario-area" placeholder="Vendite, Contabilità, Magazzino...">
          <label class="form-label mt-2" for="teacher-scenario-description">Descrizione</label><textarea class="form-control" id="teacher-scenario-description" rows="2"></textarea>
          <label class="form-label mt-2" for="teacher-scenario-checklist">Checklist, una voce per riga</label><textarea class="form-control" id="teacher-scenario-checklist" rows="4"></textarea>
          <button class="btn btn-outline-primary mt-3 w-100" id="teacher-create-custom" type="button"><i class="fas fa-plus me-1"></i>Crea scenario bozza</button>
        </div></div></div>
        <div class="col-xl-7"><div class="card shadow-sm h-100"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-list-check me-2"></i>Scenari del gruppo</h5>
          <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Scenario</th><th>Stato</th><th>Aggiornato</th><th></th></tr></thead><tbody>${scenarioRows(dashboard.scenarios)}</tbody></table></div>
        </div></div></div>
      </div>
      <div class="card shadow-sm mt-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-clock-rotate-left me-2"></i>Timeline simulazione</h5>
        <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Quando</th><th>Evento</th><th>Utente</th></tr></thead><tbody>${eventRows(dashboard.events)}</tbody></table></div>
      </div></div>
    `);
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '#teacher-create-template', async function () {
      try { await window.TeacherConsoleService.createScenarioFromTemplate($('#teacher-template-key').val()); await render(); alert('Scenario didattico creato e avviato.'); }
      catch (e) { console.error(e); alert('Errore Console docente: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#teacher-create-custom', async function () {
      try {
        await window.TeacherConsoleService.createScenario(null, {
          title: $('#teacher-scenario-title').val(), area: $('#teacher-scenario-area').val(), description: $('#teacher-scenario-description').val(), checklist: $('#teacher-scenario-checklist').val(), status: 'draft'
        });
        await render(); alert('Scenario didattico creato.');
      } catch (e) { console.error(e); alert('Errore Console docente: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '.teacher-scenario-status', async function () {
      try { await window.TeacherConsoleService.updateScenarioStatus(null, $(this).data('id'), $(this).data('status')); await render(); }
      catch (e) { console.error(e); alert('Errore aggiornamento scenario: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '.teacher-scenario-delete', async function () {
      try { if (!confirm('Eliminare questo scenario didattico?')) return; await window.TeacherConsoleService.deleteScenario(null, $(this).data('id')); await render(); }
      catch (e) { console.error(e); alert('Errore eliminazione scenario: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#teacher-copy-report', async function () {
      const report = window.TeacherConsoleService.buildProgressReport(lastDashboard || {});
      const text = JSON.stringify(report, null, 2);
      try { if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text); alert('Report copiato negli appunti.'); }
      catch (e) { prompt('Copia manualmente il report:', text); }
    });
  }

  window.AppModules.teacherConsole.bind = bind;
  window.AppModules.teacherConsole.render = render;
})();
