// js/ui/mobile-workflow-service.js
// CDSDM 0.13.3 - Miglioramenti mobile non invasivi per Workflow e Segnalazioni operative.
(function () {
  'use strict';

  const VERSION = '0.13.3';
  const MOBILE_QUERY = '(max-width: 575.98px)';
  let observer = null;

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  function ensureHint(section, id, text) {
    if (!section || section.querySelector('#' + id)) return;
    const target = section.querySelector('.table-responsive');
    if (!target) return;
    const hint = document.createElement('div');
    hint.id = id;
    hint.className = 'alert alert-light border small cdsdm-mobile-flow-hint mb-2';
    hint.innerHTML = text;
    target.parentNode.insertBefore(hint, target);
  }

  function enhanceActionGroups(root) {
    if (!root) return;
    root.querySelectorAll('.workflow-action-group, .operational-report-action-strip, .btn-group').forEach(group => {
      group.classList.add('cdsdm-mobile-action-group');
    });
    root.querySelectorAll('.workflow-action, .operational-report-action, .operational-report-open, .operational-report-print, .workflow-open-target').forEach(btn => {
      btn.classList.add('cdsdm-mobile-primary-action');
    });
  }

  function enhanceTabs() {
    const tabs = document.getElementById('operationalReportsTabs');
    if (tabs) tabs.classList.add('cdsdm-mobile-tabs');
  }

  function enhanceSections() {
    const workflow = document.getElementById('workflow-approvativi');
    const operational = document.getElementById('operational-reports');

    if (workflow) {
      workflow.classList.add('cdsdm-mobile-flow-ready');
      ensureHint(workflow, 'workflow-mobile-hint-0133', '<strong>Vista mobile:</strong> le attività workflow sono leggibili come schede. Usa prima stato, documento e azione suggerita; le azioni Approva/Revisione/Respingi/Blocca restano disponibili nella stessa scheda.');
      enhanceActionGroups(workflow);
    }

    if (operational) {
      operational.classList.add('cdsdm-mobile-flow-ready');
      ensureHint(operational, 'operational-mobile-hint-0133', '<strong>Vista mobile:</strong> le segnalazioni sono consultabili come schede. Apri il dettaglio per comunicazioni interne, cambio stato e workflow operativo.');
      enhanceActionGroups(operational);
      enhanceTabs();
    }

    document.documentElement.classList.toggle('cdsdm-is-mobile-viewport', isMobile());
  }

  function init() {
    enhanceSections();
    if (observer) return;
    observer = new MutationObserver(() => enhanceSections());
    observer.observe(document.body, { childList: true, subtree: true });
    if (window.matchMedia) {
      const mq = window.matchMedia(MOBILE_QUERY);
      const onChange = () => enhanceSections();
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  window.MobileWorkflowService = {
    VERSION,
    init,
    enhanceSections
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
