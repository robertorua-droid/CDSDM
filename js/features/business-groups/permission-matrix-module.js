// js/features/business-groups/permission-matrix-module.js
// UI 0.6.4 — Matrice permessi moduli.

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.permissionMatrix = window.AppModules.permissionMatrix || {};
  let _bound = false;
  let _currentMatrix = null;

  function esc(v) { return $('<div>').text(v == null ? '' : String(v)).html(); }
  function canManage() { return window.BusinessGroupsService && window.BusinessGroupsService.canManageActiveGroup && window.BusinessGroupsService.canManageActiveGroup(); }

  function actionCheckbox(moduleId, level, action, checked, disabled) {
    return `<input class="form-check-input matrix-action" type="checkbox" data-module="${esc(moduleId)}" data-level="${esc(level)}" data-action="${esc(action)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>`;
  }

  function levelSelect(moduleId, selected, disabled) {
    const svc = window.PermissionMatrixService;
    return `<select class="form-select form-select-sm matrix-default-level" data-module="${esc(moduleId)}" ${disabled ? 'disabled' : ''}>${svc.LEVELS.map(l => `<option value="${esc(l)}" ${selected === l ? 'selected' : ''}>${esc(svc.LEVEL_LABELS[l])}</option>`).join('')}</select>`;
  }

  function renderActionModel(moduleId, model, disabled) {
    const actions = [
      ['canOpenMenu', 'Menu'], ['canViewData', 'Lettura'], ['canCreate', 'Crea'], ['canEdit', 'Modifica'],
      ['canDelete', 'Elimina'], ['canExport', 'Export'], ['canImport', 'Import'], ['canConfigure', 'Configura']
    ];
    return `<div class="table-responsive"><table class="table table-sm table-bordered align-middle mb-0"><thead><tr><th>Livello</th>${actions.map(a => `<th class="text-center small">${esc(a[1])}</th>`).join('')}</tr></thead><tbody>${window.PermissionMatrixService.LEVELS.map(level => `<tr><td><code>${esc(level)}</code></td>${actions.map(a => `<td class="text-center">${actionCheckbox(moduleId, level, a[0], model[level] && model[level][a[0]] === true, disabled)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function matrixRows(matrix, filter) {
    const q = String(filter || '').trim().toLowerCase();
    const modules = Object.values(matrix.modules || {});
    const filtered = modules.filter(m => !q || [m.id, m.label, m.category, (m.targets || []).join(' ')].join(' ').toLowerCase().indexOf(q) >= 0);
    if (!filtered.length) return '<div class="alert alert-light border">Nessun modulo corrisponde al filtro.</div>';
    return filtered.map(m => `
      <div class="card shadow-sm mb-3 permission-matrix-card" data-module="${esc(m.id)}">
        <div class="card-body">
          <div class="row g-3 align-items-start">
            <div class="col-xl-4">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <h5 class="mb-1">${esc(m.label)}</h5>
                  <div class="small text-muted"><span class="badge bg-secondary">${esc(m.category || '')}</span> <code>${esc(m.id)}</code> / scope <code>${esc(m.scope)}</code></div>
                </div>
              </div>
              <p class="small text-muted mt-2 mb-2">${esc(m.description || '')}</p>
              <label class="form-label small mb-1">Livello predefinito didattico</label>
              ${levelSelect(m.id, m.defaultLevel || 'read', !canManage())}
              <div class="small mt-2"><strong>Voci menu:</strong><br>${(m.targets || []).map(t => `<code class="me-1">${esc(t)}</code>`).join('') || '<span class="text-muted">—</span>'}</div>
            </div>
            <div class="col-xl-8">
              ${renderActionModel(m.id, m.actionModel || {}, !canManage())}
            </div>
          </div>
        </div>
      </div>`).join('');
  }

  async function render() {
    const root = $('#permission-matrix-root');
    const svc = window.PermissionMatrixService;
    if (!root.length || !svc) return;
    const active = window.currentBusinessGroup || null;
    if (!active || !active.id) {
      root.html('<div class="alert alert-info">Seleziona un Gruppo aziendale per configurare la matrice permessi.</div>');
      return;
    }
    _currentMatrix = await svc.loadMatrix(active.id);
    const filter = $('#permission-matrix-filter').val() || '';
    root.html(`
      <div class="alert alert-primary small">
        <strong>Versione 0.6.4.</strong> Questa matrice esplicita il significato operativo di <code>none</code>, <code>read</code>, <code>write</code> e <code>admin</code> per ogni modulo/menu. I profili permesso 0.6.2 continuano a indicare il livello assegnato; questa pagina documenta e configura le azioni UI associate al livello.
      </div>
      <div class="card shadow-sm mb-3"><div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-5"><label class="form-label" for="permission-matrix-filter">Filtro modulo/menu</label><input class="form-control" id="permission-matrix-filter" value="${esc(filter)}" placeholder="es. fatture, magazzino, clienti"></div>
          <div class="col-md-7 d-flex gap-2 flex-wrap">
            <button class="btn btn-outline-secondary" id="permission-matrix-refresh-btn" type="button"><i class="fas fa-rotate me-1"></i>Aggiorna</button>
            <button class="btn btn-primary" id="permission-matrix-save-btn" type="button" ${canManage() ? '' : 'disabled'}><i class="fas fa-save me-1"></i>Salva matrice</button>
            <button class="btn btn-outline-danger" id="permission-matrix-reset-btn" type="button" ${canManage() ? '' : 'disabled'}>Ripristina default</button>
            <button class="btn btn-outline-info" id="permission-matrix-copy-json-btn" type="button">Copia JSON</button>
          </div>
        </div>
        <p class="small text-muted mb-0 mt-2">Solo admin/teacher possono salvare. La sicurezza Firestore granulare sui profili resta prevista in 0.6.5.</p>
      </div></div>
      <div id="permission-matrix-list">${matrixRows(_currentMatrix, filter)}</div>
      <div class="card shadow-sm mt-3"><div class="card-body small">
        <h6>Struttura Firestore 0.6.4</h6>
        <pre class="mb-0"><code>businessGroups/{groupId}/permissionMatrices/moduleMatrix
businessGroups/{groupId}/permissionProfiles/{profileId}.permissions[moduleId]
users/{uid}/memberships/{groupId}.profilePermissions[moduleId]</code></pre>
      </div></div>
    `);
  }

  function collectMatrix() {
    const svc = window.PermissionMatrixService;
    const matrix = svc.normalizeMatrix(_currentMatrix || svc.defaultMatrix());
    $('.permission-matrix-card').each(function () {
      const moduleId = String($(this).data('module') || '');
      if (!moduleId || !matrix.modules[moduleId]) return;
      matrix.modules[moduleId].defaultLevel = $(this).find('.matrix-default-level').val() || matrix.modules[moduleId].defaultLevel || 'read';
      $(this).find('.matrix-action').each(function () {
        const level = String($(this).data('level') || '');
        const action = String($(this).data('action') || '');
        if (!matrix.modules[moduleId].actionModel[level]) matrix.modules[moduleId].actionModel[level] = {};
        matrix.modules[moduleId].actionModel[level][action] = $(this).is(':checked');
      });
    });
    return svc.normalizeMatrix(matrix);
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '#permission-matrix-refresh-btn', async function () { try { await render(); } catch (e) { console.error(e); alert(e.message || e); } });
    $(document).on('input', '#permission-matrix-filter', function () {
      if (!_currentMatrix) return;
      $('#permission-matrix-list').html(matrixRows(_currentMatrix, $(this).val()));
    });
    $(document).on('click', '#permission-matrix-save-btn', async function () {
      try { _currentMatrix = await window.PermissionMatrixService.saveMatrix(null, collectMatrix()); await render(); alert('Matrice permessi salvata.'); }
      catch (e) { console.error(e); alert('Errore salvataggio matrice: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#permission-matrix-reset-btn', async function () {
      try { if (!confirm('Ripristinare la matrice standard 0.6.4?')) return; _currentMatrix = await window.PermissionMatrixService.resetMatrix(); await render(); }
      catch (e) { console.error(e); alert('Errore ripristino matrice: ' + (e && e.message ? e.message : e)); }
    });
    $(document).on('click', '#permission-matrix-copy-json-btn', async function () {
      try {
        const txt = JSON.stringify(collectMatrix(), null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(txt);
        else window.prompt('Copia JSON matrice:', txt);
        alert('JSON matrice copiato negli appunti.');
      } catch (e) { console.error(e); alert('Impossibile copiare il JSON: ' + (e && e.message ? e.message : e)); }
    });
  }

  window.AppModules.permissionMatrix.bind = bind;
  window.AppModules.permissionMatrix.render = render;
})();
