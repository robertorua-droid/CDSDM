(function(){
  const h = window.TestHarness || { assert: function(c,m){ if(!c) throw new Error(m); }, assertEqual: function(a,b,m){ if(a!==b) throw new Error(m||('Expected '+b+' got '+a)); }, report: function(){} };
  const q = window.DomainNormalizers.normalizeCustomerQuote({ id:'1', numero:'PREV-2026-0001', stato:'accettato', clienteId:'C1', clienteNome:'Demo', righe:[{ prodottoId:'P1', descrizione:'Prodotto', quantita:'2', prezzo:'10.50' }] });
  h.assertEqual(q.status, 'accepted', 'stato preventivo normalizzato');
  h.assertEqual(q.lines.length, 1, 'righe preventivo normalizzate');
  h.assertEqual(q.total, 21, 'totale preventivo calcolato');
  if (typeof h.report === 'function') h.report();
})();
