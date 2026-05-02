// CDSDM 0.7.5 - Aiuti rapidi e onboarding in-app.
(function(){
 const HELP={home:'Parti da azienda, gruppo attivo e notifiche.',preventivi:'Crea o consulta preventivi prima di ordini e DDT.','gestione-dati':'Esegui sempre un backup prima di import, reset o passaggio classe.','audit-sicurezza':'Controlla membri, inviti, profili, override e permessi effettivi.'};
 function messageFor(t){return HELP[t]||'Consulta il manuale in-app per completare il flusso.';}
 function enhanceSection(section){if(!section||section.querySelector('.cdsdm-help-callout'))return false; const box=document.createElement('div'); box.className='alert alert-info cdsdm-help-callout small'; box.setAttribute('role','note'); box.innerHTML='<strong>Aiuto rapido 0.7.3</strong><br>'+messageFor(section.id||''); const h=section.querySelector('h1,h2,h3'); if(h&&h.parentNode)h.parentNode.insertBefore(box,h.nextSibling); else section.insertBefore(box,section.firstChild); return true;}
 function init(){document.querySelectorAll('.content-section').forEach(enhanceSection);}
 window.OnboardingHelpService={VERSION:'0.7.3',HELP,messageFor,enhanceSection,init}; if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
