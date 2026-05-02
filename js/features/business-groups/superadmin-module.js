// js/features/business-groups/superadmin-module.js
// CDSDM 0.7.7 — UI bootstrap superadmin e diagnostica accessi con fallback create-only.

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.superadmin = window.AppModules.superadmin || {};

  let _bound = false;
  let lastSnapshot = null;

  function esc(v) { return $('<div>').text(v == null ? '' : String(v)).html(); }
  function yesNo(v) { return v ? '<span class="badge text-bg-success">Sì</span>' : '<span class="badge text-bg-secondary">No</span>'; }

  async function render() {
    const $root = $('#superadmin-root');
    if (!$root.length) return;
    if (!window.SuperadminService) {
      $root.html('<div class="alert alert-danger">SuperadminService non disponibile.</div>');
      return;
    }
    try {
      lastSnapshot = await window.SuperadminService.buildSnapshot();
      const s = lastSnapshot;
      const system = s.system || {};
      const memberships = Array.isArray(s.memberships) ? s.memberships : [];
      const warningRows = Array.isArray(s.warnings) && s.warnings.length ? s.warnings.map(w => `<div class="alert alert-warning small mb-2">${esc(w)}</div>`).join('') : '';
      const membershipRows = memberships.length ? memberships.map(m => `<tr><td>${esc(m.groupName || m.groupId)}</td><td><code>${esc(m.groupId)}</code></td><td>${esc(m.role || 'readonly')}</td><td>${esc(m.status || 'active')}</td></tr>`).join('') : '<tr><td colspan="4" class="text-muted">Nessuna membership attiva.</td></tr>';

      $root.html(`
        <div class="alert alert-info small">
          <strong>Aiuto rapido 0.7.7.</strong> Superadmin globale e Amministratore del Gruppo aziendale sono ruoli diversi. Il Superadmin serve per il bootstrap/diagnostica applicativa; gli inviti agli studenti si creano dal pannello <strong>Gruppi aziendali</strong> dopo aver selezionato o creato un gruppo.
        </div>
        ${warningRows}
        <div class="row g-3">
          <div class="col-xl-5">
            <div class="card shadow-sm h-100"><div class="card-body">
              <h5 class="card-title"><i class="fas fa-user-tie me-2"></i>Bootstrap superadmin</h5>
              <dl class="row small mb-3">
                <dt class="col-5">Configurato</dt><dd class="col-7">${yesNo(s.systemExists)}</dd>
                <dt class="col-5">Utente corrente</dt><dd class="col-7"><code>${esc(s.user && s.user.email)}</code></dd>
                <dt class="col-5">È superadmin</dt><dd class="col-7">${yesNo(s.isSuperadmin)}</dd>
              </dl>
              ${s.systemExists ? `
                <p class="small mb-1"><strong>Superadmin iniziale:</strong></p>
                <p class="small"><code>${esc(system.superadminEmail || system.superadminUid || '—')}</code></p>
                <p class="small text-muted mb-2">Per essere Superadmin non basta il ruolo nel gruppo o in <code>userProfiles</code>: l'utente deve essere indicato in <code>appSettings/system.superadminUid</code> o in <code>superadminEmails</code>.</p>
                <p class="small text-muted mb-0">Se le regole Firestore non sono state pubblicate o il documento globale è incoerente, questo pannello può mostrare avvisi diagnostici senza bloccare il resto dell'app.</p>
              ` : `
                <p class="small text-muted">Nessun superadmin applicativo configurato. Il primo account Firebase autenticato può inizializzare il documento globale <code>appSettings/system</code>.</p>
                <button class="btn btn-primary w-100" id="superadmin-claim-btn" type="button"><i class="fas fa-crown me-1"></i>Inizializza me come superadmin</button>
                <p class="small text-warning mt-2 mb-0">Operazione da fare solo con la prima email amministrativa prevista per il corso.</p>
              `}
            </div></div>
          </div>
          <div class="col-xl-7">
            <div class="card shadow-sm h-100"><div class="card-body">
              <h5 class="card-title"><i class="fas fa-envelope-circle-check me-2"></i>Flusso studenti/collaboratori con invito</h5>
              <ol class="small mb-3">
                <li>Admin/teacher crea un invito nel Gruppo aziendale con email e ruolo.</li>
                <li>Il collaboratore usa <strong>Registrati con invito</strong> nella login.</li>
                <li>Firebase crea l’account Auth con email/password.</li>
                <li>Il gestionale accetta l’invito e crea membership + ruolo nel gruppo.</li>
              </ol>
              <div class="alert alert-warning small mb-2">Se l’account esiste già, lo studente deve usare <strong>Accedi</strong> e poi accettare l’invito dal pannello Gruppi aziendali.</div>
              <button class="btn btn-outline-primary btn-sm" type="button" onclick="document.querySelector('[data-section=&quot;business-groups&quot;]')?.click()"><i class="fas fa-building-user me-1"></i>Apri Gruppi aziendali per creare inviti</button>
            </div></div>
          </div>
        </div>
        <div class="card shadow-sm mt-3"><div class="card-body">
          <h5 class="card-title"><i class="fas fa-building-user me-2"></i>Membership utente corrente</h5>
          <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Gruppo</th><th>ID</th><th>Ruolo</th><th>Stato</th></tr></thead><tbody>${membershipRows}</tbody></table></div>
          <button class="btn btn-outline-secondary btn-sm" id="superadmin-copy-snapshot" type="button"><i class="fas fa-copy me-1"></i>Copia snapshot diagnostico</button>
        </div></div>
      `);
    } catch (e) {
      console.error(e);
      $root.html('<div class="alert alert-danger"><strong>Errore pannello Superadmin:</strong> ' + esc(e.message || e) + '</div><div class="alert alert-info small">Controlla che le regole Firestore incluse nel pacchetto siano state pubblicate e che il documento <code>appSettings/system</code> contenga UID o email dell\'utente Superadmin. Gli inviti agli studenti si creano comunque da <strong>Gruppi aziendali</strong>, se l\'utente è admin/teacher del gruppo.</div>');
    }
  }

  function bind() {
    if (_bound) return; _bound = true;
    $(document).on('click', '#superadmin-claim-btn', async function () {
      try {
        if (!confirm('Inizializzare l’utente corrente come superadmin applicativo?')) return;
        await window.SuperadminService.claimFirstSuperadmin();
        await render();
        alert('Superadmin inizializzato. Pubblica le regole Firestore 0.6.0 per rendere effettiva la protezione.');
      } catch (e) { console.error(e); alert('Bootstrap superadmin non riuscito: ' + (e && e.message ? e.message : e) + '\n\nNota: se vedi Missing or insufficient permissions, pubblica prima firestore.rules del pacchetto oppure crea appSettings/system manualmente in Firebase Console.'); }
    });
    $(document).on('click', '#superadmin-copy-snapshot', async function () {
      const text = JSON.stringify(lastSnapshot || {}, null, 2);
      try { await navigator.clipboard.writeText(text); alert('Snapshot copiato.'); }
      catch (e) { prompt('Copia snapshot:', text); }
    });
  }

  window.AppModules.superadmin.render = render;
  window.AppModules.superadmin.bind = bind;
})();
