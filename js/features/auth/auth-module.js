// js/features/auth/auth-module.js

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.auth = window.AppModules.auth || {};

  let _bound = false;

  function showPasswordResetMessage(message, type) {
    const safeType = type || 'info';
    $('#login-reset-message')
      .removeClass('d-none alert-info alert-success alert-warning alert-danger')
      .addClass('alert-' + safeType)
      .text(message);
  }

  function clearPasswordResetMessage() {
    $('#login-reset-message')
      .addClass('d-none')
      .removeClass('alert-info alert-success alert-warning alert-danger')
      .text('');
  }

  function showInviteRegisterMessage(message, type) {
    const safeType = type || 'info';
    $('#invite-register-message')
      .removeClass('d-none alert-info alert-success alert-warning alert-danger')
      .addClass('alert-' + safeType)
      .text(message);
  }

  function clearInviteRegisterMessage() {
    $('#invite-register-message')
      .addClass('d-none')
      .removeClass('alert-info alert-success alert-warning alert-danger')
      .text('');
  }

  function setInviteRegisterBusy(isBusy) {
    $('#btn-register-invite-submit').prop('disabled', !!isBusy);
    $('#btn-login-submit').prop('disabled', !!isBusy);
    $('#btn-password-reset').prop('disabled', !!isBusy);
    $('#register-invite-spinner').toggleClass('d-none', !isBusy);
  }

  function setPasswordResetBusy(isBusy) {
    $('#btn-password-reset').prop('disabled', !!isBusy);
    $('#btn-login-submit').prop('disabled', !!isBusy);
  }

  function bind() {
    if (_bound) return;
    _bound = true;

    // AUTH
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        window.currentUser = user;

        // Nascondo login, mostro loading
        $('#login-container').addClass('d-none');
        $('#loading-screen').removeClass('d-none');

        try {
          await loadAllDataFromCloud();
          if (window.AppModules && window.AppModules.businessGroups && typeof window.AppModules.businessGroups.refreshSidebarSelect === 'function') {
            await window.AppModules.businessGroups.refreshSidebarSelect();
          }
          $('#loading-screen').addClass('d-none');
          $('#main-app').removeClass('d-none');
          renderAll();

          // Avvio monitoraggio inattivita
          if (typeof startInactivityWatch === 'function') startInactivityWatch();
        } catch (error) {
          alert('Errore DB: ' + error.message);
          $('#loading-screen').addClass('d-none');
        }
      } else {
        currentUser = null;
        window.currentUser = null;
        window.currentBusinessGroup = null;
        $('#main-app').addClass('d-none');
        $('#loading-screen').addClass('d-none');
        $('#login-container').removeClass('d-none');

        // Stop monitoraggio inattivita
        if (typeof stopInactivityWatch === 'function') stopInactivityWatch();
      }
    });


    $(document).off('click', '#toggle-password-visibility').on('click', '#toggle-password-visibility', function () {
      const $password = $('#password');
      const $icon = $(this).find('i');
      const isVisible = $password.attr('type') === 'text';
      $password.attr('type', isVisible ? 'password' : 'text');
      $(this).attr('title', isVisible ? 'Mostra password' : 'Nascondi password');
      $(this).attr('aria-label', isVisible ? 'Mostra password' : 'Nascondi password');
      $icon.toggleClass('fa-eye fa-eye-slash');
    });

    $('#login-form').on('submit', function (e) {
      e.preventDefault();
      $('#login-error').addClass('d-none');
      clearPasswordResetMessage();
      $('#login-spinner').removeClass('d-none');
      $('#btn-login-submit').prop('disabled', true);
      $('#btn-password-reset').prop('disabled', true);

      const email = $('#email').val();
      const password = $('#password').val();

      auth
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          $('#login-spinner').addClass('d-none');
          $('#btn-login-submit').prop('disabled', false);
          $('#btn-password-reset').prop('disabled', false);
        })
        .catch((err) => {
          console.error('Login Error:', err);
          $('#login-error').removeClass('d-none');
          $('#login-spinner').addClass('d-none');
          $('#btn-login-submit').prop('disabled', false);
          $('#btn-password-reset').prop('disabled', false);
        });
    });


    $('#invite-register-form').on('submit', async function (e) {
      e.preventDefault();
      $('#login-error').addClass('d-none');
      clearPasswordResetMessage();
      clearInviteRegisterMessage();

      const email = String($('#register-email').val() || '').trim().toLowerCase();
      const password = String($('#register-password').val() || '');
      const groupId = String($('#register-group-id').val() || '').trim();
      const inviteCode = String($('#register-invite-code').val() || '').trim();

      if (!email || !password || !groupId || !inviteCode) {
        showInviteRegisterMessage('Compila email, password, ID gruppo e codice invito.', 'warning');
        return;
      }
      if (password.length < 6) {
        showInviteRegisterMessage('La password deve contenere almeno 6 caratteri.', 'warning');
        return;
      }
      if (!window.BusinessGroupsService || typeof window.BusinessGroupsService.acceptInvite !== 'function') {
        showInviteRegisterMessage('Modulo Gruppi aziendali non disponibile. Ricarica la pagina.', 'danger');
        return;
      }

      setInviteRegisterBusy(true);
      let credential = null;
      let accountCreatedInThisFlow = false;
      try {
        credential = await auth.createUserWithEmailAndPassword(email, password);
        accountCreatedInThisFlow = true;
        currentUser = credential.user;
        window.currentUser = credential.user;

        await window.BusinessGroupsService.acceptInvite(groupId, inviteCode);
        if (typeof loadAllDataFromCloud === 'function') await loadAllDataFromCloud();
        if (window.AppModules && window.AppModules.businessGroups && typeof window.AppModules.businessGroups.refreshSidebarSelect === 'function') {
          await window.AppModules.businessGroups.refreshSidebarSelect();
        }
        showInviteRegisterMessage('Account creato e invito accettato. Accesso al Gruppo aziendale completato.', 'success');
        $('#login-container').addClass('d-none');
        $('#loading-screen').addClass('d-none');
        $('#main-app').removeClass('d-none');
        if (typeof renderAll === 'function') renderAll();
      } catch (err) {
        console.error('Registrazione con invito fallita:', err);
        let cleanupMessage = '';
        if (accountCreatedInThisFlow && credential && credential.user && typeof credential.user.delete === 'function') {
          try {
            await credential.user.delete();
            currentUser = null;
            window.currentUser = null;
            cleanupMessage = ' L’account appena creato è stato rimosso perché l’invito non era valido o non accettabile.';
          } catch (deleteErr) {
            console.warn('Pulizia account non riuscita:', deleteErr);
            cleanupMessage = ' L’account Firebase potrebbe essere stato creato: accedi con questa email oppure elimina l’utente da Firebase Console se era un test errato.';
          }
        }
        const code = err && err.code ? String(err.code) : '';
        let message = 'Registrazione non completata. Verifica email, codice invito e ID gruppo.';
        if (code.indexOf('email-already-in-use') >= 0) message = 'Questa email ha già un account. Accedi con la password esistente e poi accetta l’invito dal pannello Gruppi aziendali.';
        if (code.indexOf('weak-password') >= 0) message = 'Password troppo debole: usa almeno 6 caratteri.';
        if (code.indexOf('invalid-email') >= 0) message = 'Email non valida.';
        if (String(err && err.message || '').toLowerCase().indexOf('scaduto') >= 0) message = 'Invito scaduto. Chiedi al docente/amministratore di rigenerare il codice.';
        if (String(err && err.message || '').toLowerCase().indexOf('altra email') >= 0) message = 'L’email inserita non coincide con quella dell’invito.';
        showInviteRegisterMessage(message + cleanupMessage + (err && err.message ? ' Dettaglio: ' + err.message : ''), 'danger');
      } finally {
        setInviteRegisterBusy(false);
      }
    });

    $('#btn-password-reset').on('click', function () {
      $('#login-error').addClass('d-none');
      clearPasswordResetMessage();

      const email = String($('#email').val() || '').trim();
      if (!email) {
        showPasswordResetMessage('Inserisci prima il tuo indirizzo email, poi richiedi il link di reset.', 'warning');
        $('#email').trigger('focus');
        return;
      }

      setPasswordResetBusy(true);
      try {
        auth.languageCode = 'it';
      } catch (e) {}

      auth
        .sendPasswordResetEmail(email)
        .then(() => {
          showPasswordResetMessage('Se l’indirizzo è associato a un account, riceverai un’email per reimpostare la password.', 'success');
        })
        .catch((err) => {
          console.error('Password Reset Error:', err);
          showPasswordResetMessage('Non è stato possibile inviare il link di reset. Controlla l’indirizzo email e riprova.', 'danger');
        })
        .finally(() => {
          setPasswordResetBusy(false);
        });
    });

    $('#logout-btn').on('click', function (e) {
      e.preventDefault();
      if (typeof stopInactivityWatch === 'function') {
        try {
          stopInactivityWatch();
        } catch (e2) {}
      }
      auth.signOut().then(() => {
        // signOut risolve -> lo stato auth.onAuthStateChanged fara il resto
        location.reload();
      });
    });
  }

  window.AppModules.auth.bind = bind;
})();
