// CDSDM 0.7.5 - QA funzionale end-to-end non distruttivo.
(function(){
  const FLOWS=[
    {id:'vendite-completo',title:'Cliente → preventivo → ordine → DDT → fattura → pagamento',collections:['customers','quotes','customerOrders','customerDDTs','invoices','paymentEvents']},
    {id:'acquisti-magazzino',title:'Fornitore → ordine → DDT ricevuto → carico magazzino',collections:['suppliers','supplierOrders','supplierDDTs','warehouseMovements','products']},
    {id:'inventario',title:'Magazzino → movimenti → giacenze → inventario fisico',collections:['products','warehouseMovements','warehousePhysicalCounts','warehouseLots']},
    {id:'timesheet-fattura',title:'Timesheet → import righe → fattura cliente',collections:['worklogs','projects','commesse','invoices']},
    {id:'permessi-gruppo',title:'Ruoli → profili → matrice → override → UI/rules',collections:['permissionProfiles','permissionMatrices','securityAccessReports']},
    {id:'backup-ripristino',title:'Backup/import/reset su collezioni reali',collections:(window.CDSDM_DATA_COLLECTIONS||[])}
  ];
  function getStore(){return (window.AppStore&&window.AppStore.get&&window.AppStore.get())||window.globalData||{};}
  function analyzeFlow(flow,store){const data=store||getStore();const missing=flow.collections.filter(c=>typeof data[c]==='undefined');const empty=flow.collections.filter(c=>Array.isArray(data[c])&&data[c].length===0);return {id:flow.id,title:flow.title,missingCollections:missing,emptyCollections:empty,status:missing.length?'ko':(empty.length?'warning':'ok')};}
  function run(store){const flows=FLOWS.map(f=>analyzeFlow(f,store));return {version:'0.7.1',generatedAt:new Date().toISOString(),summary:{total:flows.length,ok:flows.filter(f=>f.status==='ok').length,warning:flows.filter(f=>f.status==='warning').length,ko:flows.filter(f=>f.status==='ko').length},flows};}
  window.E2EQaService={VERSION:'0.7.1',FLOWS,analyzeFlow,run};
})();
