using cit.ux as ux from '../db/tables-schema';

service LTTSLMService @(impl : './handlers/lic_alloc.js') {
  
    entity BUSINESS_UNIT_MASTER as projection on ux.BUSINESS_UNIT_MASTER;
    annotate EMPLOYEE_MASTER with @odata.draft.enabled;
    
    entity EMPLOYEE_MASTER      as projection on ux.EMPLOYEE_MASTER;
    entity PROJECT_MASTER       as projection on ux.PROJECT_MASTER;
    entity PROJECT_DETAILS      as projection on ux.PROJECT_DETAILS;
    entity LICENSE_MASTER       as projection on ux.LICENSE_MASTER;
    annotate LICENSE_INVENTORY with @odata.draft.enabled;
    
    entity LICENSE_INVENTORY    as projection on ux.LICENSE_INVENTORY;
    entity LICENSE_DETAILS      as projection on ux.LICENSE_DETAILS;
    annotate LICENSE_ALLOCATION with @odata.draft.enabled;

    entity BUDGET_ALLOCATION as projection on ux.BUDGET_ALLOCATION;
    
    entity LICENSE_ALLOCATION   as projection on ux.LICENSE_ALLOCATION;
    function prProcessing(request_id : String(10), pr_id : String(10)) returns LICENSE_ALLOCATION;
    function prConfirm(request_id : String(10), pr_id : String(10)) returns LICENSE_ALLOCATION;
    function renewLicense(license_id: String(10), pr_id: String(10)) returns LICENSE_DETAILS;
    function createID() returns String;
    
}
