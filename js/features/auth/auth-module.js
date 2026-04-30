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

        // Nascondo login, mostro loading
        $('#login-container').addClass('d-none');
        $('#loading-screen').removeClass('d-none');

        try {
          await loadAllDataFromCloud();
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
