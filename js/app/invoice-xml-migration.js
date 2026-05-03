// js/app/invoice-xml-migration.js
// Orchestratore: mantiene il nome originale ma delega ai moduli.

function bindEventListeners() {
  // Inizializza i bind dei moduli (ognuno e idempotente)
  try {
    if (window.AppModules && window.AppModules.auth && typeof window.AppModules.auth.bind === 'function') {
      window.AppModules.auth.bind();
    }
    if (window.AppModules && window.AppModules.navigation && typeof window.AppModules.navigation.bind === 'function') {
      window.AppModules.navigation.bind();
    }
    if (window.AppModules && window.AppModules.businessGroups && typeof window.AppModules.businessGroups.bind === 'function') {
      window.AppModules.businessGroups.bind();
    }
    if (window.AppModules && window.AppModules.superadmin && typeof window.AppModules.superadmin.bind === 'function') {
      window.AppModules.superadmin.bind();
    }
    if (window.AppModules && window.AppModules.permissionProfiles && typeof window.AppModules.permissionProfiles.bind === 'function') {
      window.AppModules.permissionProfiles.bind();
    }
    if (window.AppModules && window.AppModules.permissionMatrix && typeof window.AppModules.permissionMatrix.bind === 'function') {
      window.AppModules.permissionMatrix.bind();
    }
    if (window.AppModules && window.AppModules.permissionOverrides && typeof window.AppModules.permissionOverrides.bind === 'function') {
      window.AppModules.permissionOverrides.bind();
    }
    if (window.AppModules && window.AppModules.securityAudit && typeof window.AppModules.securityAudit.bind === 'function') {
      window.AppModules.securityAudit.bind();
    }
    if (window.AppModules && window.AppModules.teacherConsole && typeof window.AppModules.teacherConsole.bind === 'function') {
      window.AppModules.teacherConsole.bind();
    }
    if (window.AppModules && window.AppModules.migrationQa && typeof window.AppModules.migrationQa.bind === 'function') {
      window.AppModules.migrationQa.bind();
    }
    if (window.AppModules && window.AppModules.dashboard && typeof window.AppModules.dashboard.bind === 'function') {
      window.AppModules.dashboard.bind();
    }
    if (window.AppModules && window.AppModules.theme && typeof window.AppModules.theme.bind === 'function') {
      window.AppModules.theme.bind();
    }

    // COMMESSE / PROGETTI / TIMESHEET
    if (window.AppModules && window.AppModules.commesse && typeof window.AppModules.commesse.bind === 'function') {
      window.AppModules.commesse.bind();
    }
    if (window.AppModules && window.AppModules.projects && typeof window.AppModules.projects.bind === 'function') {
      window.AppModules.projects.bind();
    }
    if (window.AppModules && window.AppModules.timesheet && typeof window.AppModules.timesheet.bind === 'function') {
      window.AppModules.timesheet.bind();
    }
    if (window.AppModules && window.AppModules.timesheetExport && typeof window.AppModules.timesheetExport.bind === 'function') {
      window.AppModules.timesheetExport.bind();
    }

    if (window.AppModules && window.AppModules.registriIva && typeof window.AppModules.registriIva.bind === 'function') {
      window.AppModules.registriIva.bind();
    }

    if (window.AppModules && window.AppModules.customers && typeof window.AppModules.customers.bind === 'function') {
      window.AppModules.customers.bind();
    }
    if (window.AppModules && window.AppModules.vatRates && typeof window.AppModules.vatRates.bind === 'function') {
      window.AppModules.vatRates.bind();
    }
    if (window.AppModules && window.AppModules.paymentMethods && typeof window.AppModules.paymentMethods.bind === 'function') {
      window.AppModules.paymentMethods.bind();
    }
    if (window.AppModules && window.AppModules.companyBanks && typeof window.AppModules.companyBanks.bind === 'function') {
      window.AppModules.companyBanks.bind();
    }
    if (window.AppModules && window.AppModules.products && typeof window.AppModules.products.bind === 'function') {
      window.AppModules.products.bind();
    }
    if (window.AppModules && window.AppModules.suppliers && typeof window.AppModules.suppliers.bind === 'function') {
      window.AppModules.suppliers.bind();
    }
    if (window.AppModules && window.AppModules.warehouse && typeof window.AppModules.warehouse.bind === 'function') {
      window.AppModules.warehouse.bind();
    }
    if (window.AppModules && window.AppModules.quotes && typeof window.AppModules.quotes.bind === 'function') {
      window.AppModules.quotes.bind();
    }
    if (window.AppModules && window.AppModules.customerOrders && typeof window.AppModules.customerOrders.bind === 'function') {
      window.AppModules.customerOrders.bind();
    }
    if (window.AppModules && window.AppModules.supplierOrders && typeof window.AppModules.supplierOrders.bind === 'function') {
      window.AppModules.supplierOrders.bind();
    }
    if (window.AppModules && window.AppModules.supplierDDTs && typeof window.AppModules.supplierDDTs.bind === 'function') {
      window.AppModules.supplierDDTs.bind();
    }
    if (window.AppModules && window.AppModules.customerDDTs && typeof window.AppModules.customerDDTs.bind === 'function') {
      window.AppModules.customerDDTs.bind();
    }
    if (window.AppModules && window.AppModules.customerDDTInvoicing && typeof window.AppModules.customerDDTInvoicing.bind === 'function') {
      window.AppModules.customerDDTInvoicing.bind();
    }

    if (window.AppModules && window.AppModules.invoicesForm && typeof window.AppModules.invoicesForm.bind === 'function') {
      window.AppModules.invoicesForm.bind();
    }
    if (window.AppModules && window.AppModules.invoicesTimesheetImport && typeof window.AppModules.invoicesTimesheetImport.bind === 'function') {
      window.AppModules.invoicesTimesheetImport.bind();
    }
    if (window.AppModules && window.AppModules.invoicesList && typeof window.AppModules.invoicesList.bind === 'function') {
      window.AppModules.invoicesList.bind();
    }
    if (window.AppModules && window.AppModules.invoicesXML && typeof window.AppModules.invoicesXML.bind === 'function') {
      window.AppModules.invoicesXML.bind();
    }

    if (window.AppModules && window.AppModules.company && typeof window.AppModules.company.bind === 'function') {
      window.AppModules.company.bind();
    }

    // Simulazione Redditi (Ordinario)
    if (window.AppModules && window.AppModules.ordinarioSim && typeof window.AppModules.ordinarioSim.bind === 'function') {
      window.AppModules.ordinarioSim.bind();
    }

    if (window.AppModules && window.AppModules.scadenziario && typeof window.AppModules.scadenziario.bind === 'function') {
      window.AppModules.scadenziario.bind();
    }
    if (window.AppModules && window.AppModules.notes && typeof window.AppModules.notes.bind === 'function') {
      window.AppModules.notes.bind();
    }
    if (window.AppModules && window.AppModules.migration && typeof window.AppModules.migration.bind === 'function') {
      window.AppModules.migration.bind();
    }
    if (window.AppModules && window.AppModules.importCsv && typeof window.AppModules.importCsv.bind === 'function') {
      window.AppModules.importCsv.bind();
    }
    if (window.AppModules && window.AppModules.rolesPermissions && typeof window.AppModules.rolesPermissions.bind === 'function') {
      window.AppModules.rolesPermissions.bind();
    }
    if (window.AppModules && window.AppModules.ledger && typeof window.AppModules.ledger.bind === 'function') {
      window.AppModules.ledger.bind();
    }
    if (window.AppModules && window.AppModules.paymentEvents && typeof window.AppModules.paymentEvents.bind === 'function') {
      window.AppModules.paymentEvents.bind();
    }
    if (window.AppModules && window.AppModules.cashbook && typeof window.AppModules.cashbook.bind === 'function') {
      window.AppModules.cashbook.bind();
    }
    if (window.AppModules && window.AppModules.accountStatement && typeof window.AppModules.accountStatement.bind === 'function') {
      window.AppModules.accountStatement.bind();
    }
    if (window.AppModules && window.AppModules.reminders && typeof window.AppModules.reminders.bind === 'function') {
      window.AppModules.reminders.bind();
    }
    if (window.AppModules && window.AppModules.bankReconciliation && typeof window.AppModules.bankReconciliation.bind === 'function') {
      window.AppModules.bankReconciliation.bind();
    }
    if (window.AppModules && window.AppModules.businessBudget && typeof window.AppModules.businessBudget.bind === 'function') {
      window.AppModules.businessBudget.bind();
    }
    if (window.AppModules && window.AppModules.miniBalance && typeof window.AppModules.miniBalance.bind === 'function') {
      window.AppModules.miniBalance.bind();
    }
    if (window.AppModules && window.AppModules.printCenter && typeof window.AppModules.printCenter.bind === 'function') {
      window.AppModules.printCenter.bind();
    }
    if (window.AppModules && window.AppModules.workflow && typeof window.AppModules.workflow.bind === 'function') {
      window.AppModules.workflow.bind();
    }
    if (window.AppModules && window.AppModules.operationalReports && typeof window.AppModules.operationalReports.bind === 'function') {
      window.AppModules.operationalReports.bind();
    }
    if (window.AppModules && window.AppModules.notificationCenter && typeof window.AppModules.notificationCenter.bind === 'function') {
      window.AppModules.notificationCenter.bind();
    }
    if (window.AppModules && window.AppModules.auditTrail && typeof window.AppModules.auditTrail.bind === 'function') {
      window.AppModules.auditTrail.bind();
    }
    if (window.AppModules && window.AppModules.accessibilityUx && typeof window.AppModules.accessibilityUx.bind === 'function') {
      window.AppModules.accessibilityUx.bind();
    }
    if (window.AppModules && window.AppModules.miniBI && typeof window.AppModules.miniBI.bind === 'function') {
      window.AppModules.miniBI.bind();
    }

    if (window.AppModules && window.AppModules.warehouseReports && typeof window.AppModules.warehouseReports.bind === 'function') {
      window.AppModules.warehouseReports.bind();
    }

    // ACQUISTI (modulo separato)
    if (typeof initPurchasesModule === 'function') {
      initPurchasesModule();
    }
  } catch (e) {
    console.error('Errore bindEventListeners:', e);
  }
}

window.bindEventListeners = bindEventListeners;
