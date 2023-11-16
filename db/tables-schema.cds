namespace cit.ux;

@title : 'Capex Budget Allocation'
entity BUDGET_ALLOCATION {
    key budget_id      : String(10);
        capexcategory  : String(100) not null;
        regionlocation : String(10) not null;
        costcenter     : String(10) not null;
        amount         : Decimal;
}

@title : 'Business Unit Master'
entity BUSINESS_UNIT_MASTER {
    key business_unit_id : String(10);
        bu_name          : String(50) not null;
        bu_manager_id    : String(10) not null;
        bu_manager_name  : String(50) not null;
        bu_manager_email : String(50) not null;
        bu_cost_center   : String(10) not null;
        bu_division      : String(50);
        bu_location      : String(50);
}

@title : 'Employee Master'
entity EMPLOYEE_MASTER {
    key employee_id                  : String(10);
        salutation                   : String(10) not null;
        first_name                   : String(50) not null;
        middle_name                  : String(50);
        last_name                    : String(50) not null;
        gender                       : String(10) not null;
        birthdate                    : Date not null;
        email_address                : String(50) not null;
        mobile_number                : String(10) not null;
        office_number                : String(10);
        business_unit_id             : String(10) not null;
        department                   : String(50) not null;
        designation                  : String(50) not null;
        hire_date                    : Date not null;
        job_title                    : String(50) not null;
        manager_name                 : String(50) not null;
        manager_email                : String(50) not null;
        region_location              : String(50) not null;
        organization                 : String(50) not null;
        business_unit_id_EmMa_BuUnMa : Association to BUSINESS_UNIT_MASTER
                                           on business_unit_id_EmMa_BuUnMa.business_unit_id = business_unit_id;
}

@title : 'Project Master'
entity PROJECT_MASTER {
    key project_id                    : String(10);
        project_name                  : String(50) not null;
        project_manager_id            : String(10) not null;
        project_manager_name          : String(50) not null;
        project_manager_email         : String(50) not null;
        project_manager_mobile_number : String(10) not null;
        customer_name                 : String(50) not null;
        customer_location             : String(50) not null;
        business_unit_id              : String(10) not null;
        bu_name                       : String(50) not null;
        estimated_staffing            : Integer not null;
        project_start_date            : Date not null;
        project_end_date              : Date not null;
        project_cost_center           : String(10) not null;
        customer_funded               : Boolean;
        business_unit_id_PrMa_BuUnMa  : Association to BUSINESS_UNIT_MASTER
                                            on business_unit_id_PrMa_BuUnMa.business_unit_id = business_unit_id;
}

@title : 'Project Details'
entity PROJECT_DETAILS {
    employee_id                  : String(10) not null;
    employee_name                : String(50) not null;
    project_id                   : String(10) not null;
    business_unit_id             : String(10) not null;
    activity_name                : String(50) not null;
    time_allocation              : Decimal not null;
    activity_start_date          : Date not null;
    activity_end_date            : Date;
    business_unit_id_PrDe_BuUnMa : Association to BUSINESS_UNIT_MASTER
                                       on business_unit_id_PrDe_BuUnMa.business_unit_id = business_unit_id;
    project_id_PrDe_PrMa         : Association to PROJECT_MASTER
                                       on project_id_PrDe_PrMa.project_id = project_id;
    employee_id_PrDe_EmMa        : Association to EMPLOYEE_MASTER
                                       on employee_id_PrDe_EmMa.employee_id = employee_id;
}

@title : 'License Master'
entity LICENSE_MASTER {
    key license_ref         : String(10);
        license_name        : String(50) not null;
        license_description : String(200) not null;
        license_type        : String(50) not null;
        license_category    : String(50) not null;
        license_vendor      : String(50) not null;
        standard_price      : Decimal not null;
}

@title : 'License Inventory'
entity LICENSE_INVENTORY {
    key license_inv_ref              : String(10);
        license_ref                  : String(10) not null;
        license_name                 : String(50) not null;
        license_type                 : String(50) not null;
        business_unit_id             : String(10) not null;
        available_quantity           : Integer not null;
        license_ref_LiIn_LiMa        : Association to LICENSE_MASTER
                                           on license_ref_LiIn_LiMa.license_ref = license_ref;
        business_unit_id_LiIn_BuUnMa : Association to BUSINESS_UNIT_MASTER
                                           on business_unit_id_LiIn_BuUnMa.business_unit_id = business_unit_id;
}

@title : 'License Details'
entity LICENSE_DETAILS {
    key license_id                : String(10);
        license_inv_ref           : String(10) not null;
        license_name              : String(50) not null;
        license_type              : String(50) not null;
        license_vendor            : String(25) not null;
        license_quantity          : Integer not null;
        license_serial_no         : String(25) not null;
        license_key               : String(50) not null;
        purchase_date             : Date not null;
        purchase_cost             : Decimal not null;
        purchase_reference        : String(10) null;
        expiration_date           : Date;
        is_allocated              : Boolean not null;
        customer_funded           : Boolean;
        license_inv_ref_LiDe_LiIn : Association to LICENSE_INVENTORY
                                        on license_inv_ref_LiDe_LiIn.license_inv_ref = license_inv_ref;
}

@title : 'License Allocation'
entity LICENSE_ALLOCATION {
    key request_id                   : String(10);
        employee_id                  : String(10) not null;
        employee_name                : String(100) not null;
        project_id                   : String(10) not null;
        business_unit_id             : String(10) not null;
        project_manager_id           : String(10) not null;
        license_name                 : String(25) not null;
        license_type                 : String(25) not null;
        license_quantity             : Integer not null;
        license_start                : Date not null;
        license_end                  : Date not null;
        license_inv_ref              : String(10);
        purchase_reference           : String(10);
        license_id                   : String(10);
        license_serial_no            : String(25);
        license_key                  : String(50);
        curent_billing               : Decimal;
        estimated_billing            : Decimal;
        request_notes                : String(200);
        request_status               : String(25) not null;
        request_date                 : Date not null;
        customer_funded              : Boolean;
        employee_id_LiAl_EmMa        : Association to EMPLOYEE_MASTER
                                           on employee_id_LiAl_EmMa.employee_id = employee_id;
        project_id_LiAl_PrMa         : Association to PROJECT_MASTER
                                           on project_id_LiAl_PrMa.project_id = project_id;
        business_unit_id_LiAl_BuUnMa : Association to BUSINESS_UNIT_MASTER
                                           on business_unit_id_LiAl_BuUnMa.business_unit_id = business_unit_id;
}
