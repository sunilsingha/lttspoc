using LTTSLMService as service from '../../srv/LTTSLM-service';

annotate service.EMPLOYEE_MASTER with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Employee ID',
            Value : employee_id,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Salutation',
            Value : salutation,
        },
        {
            $Type : 'UI.DataField',
            Label : 'First Name',
            Value : first_name,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Middle Name',
            Value : middle_name,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Last Name',
            Value : last_name,
        },
    ]
);
annotate service.EMPLOYEE_MASTER with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Employee ID',
                Value : employee_id,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Salutation',
                Value : salutation,
            },
            {
                $Type : 'UI.DataField',
                Label : 'First Name',
                Value : first_name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Middle Name',
                Value : middle_name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Last Name',
                Value : last_name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Gender',
                Value : gender,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Birth Date',
                Value : birthdate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Email',
                Value : email_address,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Mobile',
                Value : mobile_number,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Office Ph.Number',
                Value : office_number,
            },
            {
                $Type : 'UI.DataField',
                Label : 'BU ID',
                Value : business_unit_id,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Department',
                Value : department,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Designation',
                Value : designation,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Hire Date',
                Value : hire_date,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Job Title',
                Value : job_title,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Manager Name',
                Value : manager_name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Manager Email',
                Value : manager_email,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Location',
                Value : region_location,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Organization',
                Value : organization,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
