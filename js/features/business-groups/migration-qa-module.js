// js/features/business-groups/migration-qa-module.js
// CDSDM 0.5.6 — UI Migrazione guidata e QA multiutente

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.migrationQa = window.AppModules.migrationQa || {};
  let _bound = false;
  let lastReport = null;

  function esc(v) { return $('<div>').text(String(v == null ? '' : v)).html(); }
  function badge(ok, manual) {
    if (manual) return '<span class="badge text-bg-warning">Manuale</span>';
    return ok ? '<span class="badge text-bg-success">OK</span>' : '<span class="badge text-bg-secondary">Da fare</span>';
  }
  function count(v) { return v == null ? 'n.d.' : String(v); }
  function comparisonRows(rows) {
    const list = Array.isArray(rows) ? rows : [];
    return list.map(r => {
      const cls = r.status === 'aligned' ? 'table-success' : (r.status === 'missing' ? 'table-warning' : '');
      return `<tr class="${cls}"><td><code>${esc(r.collection)}</code></td><td class="text-end">${esc(count(r.legacy))}</td><td class="text-end">${esc(count(r.group))}</td><td class="text-end">${esc(count(r.diff))}</td></tr>`;
    }).join('') || '<tr><td colspan="4" class="text-center text-muted py-3">Nessun confronto disponibile.</td></tr>';
  }
  function checklistRows(items) {
    return (items || []).map(it => `<tr><td>${badge(it.ok, it.manual)}</td><td>${esc(it.label)}</td></tr>`).join('');
  }
  function qaRows(plan) {
    return (plan.steps || []).map((s, i) => `<tr><td class="text-muted">${i + 1}</td><td>${esc(s.area)}</td><td>${esc(s.check)}</td><td>${esc(s.expected)}</td></tr>`).join('');
  }
  function reportPreview(report) {
    return esc(JSON.stringify(report || {}, null, 2));
  }
  function copyText(text, label) {
    const t = String(text || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t).then(() => alert((label || 'Testo') + ' copiato negli appunti.'));
    }
    prompt('Copia manualmente:', t);
    return Promise.resolve();
  }

  async function render() {
    const svc = window.MigrationQaService;
    const $root = $('#migration-qa-root');
    if (!svc || !$root.length) return;
    if (!window.currentBusinessGroup || !window.currentBusinessGroup.id) {
      $root.html('<div class="alert alert-warning"><strong>Gruppo aziendale non selezionato.</strong> Seleziona un gruppo condiviso per usare la migrazione guidata 0.5.6.</div>');
      return;
    }
    if (!svc.canUse()) {
      $root.html('<div class="alert alert-secondary"><strong>Accesso limitato.</strong> La migrazione guidata è riservata ad Amministratore e Docente/Revisore. Gli altri ruoli possono usare le sezioni operative abilitate.</div>');
      return;
    }
    const report = await svc.buildReadinessReport();
    const qaPlan = svc.buildQaPlan();
    lastReport = report;
    const reports = await svc.listMigrationReports();
    $root.html(`
      <div class="alert alert-info small"><strong>Versione 0.5.6.</strong> Consolidamento multiutente: report di migrazione, confronto dati legacy/gruppo e piano QA classe. I dati legacy non vengono cancellati.</div>
      <div class="row g-3 mb-3">
        <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><div class="small text-muted">Gruppo attivo</div><div class="fw-semibold">${esc(report.activeGroup && report.activeGroup.name || '')}</div><div class="small text-muted">${esc(report.activeGroup && report.activeGroup.id || '')}</div></div></div></div>
        <div class="col-md-2"><div class="card h-100 shadow-sm"><div class="card-body"><div class="small text-muted">Ruolo</div><div class="fw-semibold">${esc(report.activeGroup && report.activeGroup.role || '')}</div></div></div></div>
        <div class="col-md-3"><div class="card h-100 shadow-sm"><div class="card-body"><div class="small text-muted">Record legacy</div><div class="display-6">${esc(report.legacyCounts.totalRecords)}</div></div></div></div>
        <div class="col-md-3"><div class="card h-100 shadow-sm"><div class="card-body"><div class="small text-muted">Record gruppo</div><div class="display-6">${esc(report.groupCounts.totalRecords)}</div></div></div></div>
      </div>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <button class="btn btn-outline-primary" id="migration-qa-refresh" type="button"><i class="fas fa-rotate me-1"></i>Aggiorna report</button>
        <button class="btn btn-outline-secondary" id="migration-qa-copy-report" type="button"><i class="fas fa-copy me-1"></i>Copia report JSON</button>
        <button class="btn btn-outline-success" id="migration-qa-save-report" type="button"><i class="fas fa-file-circle-check me-1"></i>Salva report nel gruppo</button>
        <button class="btn btn-outline-warning" id="migration-qa-copy-legacy" type="button"><i class="fas fa-share-from-square me-1"></i>Copia dati legacy nel gruppo vuoto</button>
        <button class="btn btn-outline-dark" id="migration-qa-copy-plan" type="button"><i class="fas fa-list-check me-1"></i>Copia piano QA</button>
      </div>
      <div class="row g-3">
        <div class="col-xl-5"><div class="card shadow-sm h-100"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-clipboard-check me-2"></i>Checklist consolidamento</h5>
          <div class="table-responsive"><table class="table table-sm align-middle"><tbody>${checklistRows(report.checklist)}</tbody></table></div>
          <h6 class="mt-3">Raccomandazioni</h6>
          <ul class="small mb-0">${(report.recommendations || []).map(r => `<li>${esc(r)}</li>`).join('') || '<li>Nessuna raccomandazione bloccante.</li>'}</ul>
        </div></div></div>
        <div class="col-xl-7"><div class="card shadow-sm h-100"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-code-compare me-2"></i>Confronto conteggi legacy / gruppo</h5>
          <div class="table-responsive" style="max-height:380px; overflow:auto;"><table class="table table-sm align-middle"><thead><tr><th>Collezione</th><th class="text-end">Legacy</th><th class="text-end">Gruppo</th><th class="text-end">Δ</th></tr></thead><tbody>${comparisonRows(report.comparison)}</tbody></table></div>
        </div></div></div>
      </div>
      <div class="card shadow-sm mt-3"><div class="card-body">
        <h5 class="card-title"><i class="fas fa-users-gear me-2"></i>Piano QA multiutente</h5>
        <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>#</th><th>Area</th><th>Verifica</th><th>Risultato atteso</th></tr></thead><tbody>${qaRows(qaPlan)}</tbody></table></div>
      </div></div>
      <div class="row g-3 mt-1">
        <div class="col-lg-6"><div class="card shadow-sm h-100"><div class="card-body"><h6>Ultimi report salvati</h6><ul class="small mb-0">${reports.slice(0, 8).map(r => `<li>${esc(r.createdAt || '')} — ${esc(r.title || r.type || r.id)}</li>`).join('') || '<li class="text-muted">Nessun report salvato.</li>'}</ul></div></div></div>
        <div class="col-lg-6"><div class="card shadow-sm h-100"><div class="card-body"><h6>Anteprima JSON</h6><pre class="bg-light border rounded p-2 small mb-0" style="max-height:260px; overflow:auto;">${reportPreview(report)}</pre></div></div></div>
      </div>
    `);
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '#migration-qa-refresh', function () { render(); });
    $(document).on('click', '#migration-qa-copy-report', function () { copyText(JSON.stringify(lastReport || {}, null, 2), 'Report'); });
    $(document).on('click', '#migration-qa-copy-plan', function () { copyText(JSON.stringify(window.MigrationQaService.buildQaPlan(), null, 2), 'Piano QA'); });
    $(document).on('click', '#migration-qa-save-report', async function () {
      try { await window.MigrationQaService.createMigrationReport(); await render(); alert('Report migrazione salvato nel Gruppo aziendale.'); }
      catch (e) { console.error(e); alert('Errore salvataggio report: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#migration-qa-copy-legacy', async function () {
      try {
        if (!confirm('Copia i dati legacy personali nel Gruppo aziendale attivo solo se il gruppo è vuoto. I dati legacy non saranno cancellati. Continuare?')) return;
        await window.MigrationQaService.copyLegacyToActiveGroup({ skipIfTargetHasData: true });
        await loadAllDataFromCloud();
        await render();
        alert('Copia prudente completata. Verifica i conteggi nel report.');
      } catch (e) { console.error(e); alert('Migrazione non eseguita: ' + (e && e.message ? e.message : e)); }
    });
  }

  window.AppModules.migrationQa.bind = bind;
  window.AppModules.migrationQa.render = render;
})();
