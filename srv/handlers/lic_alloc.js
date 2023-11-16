const cds = require('@sap/cds');
const moment = require('moment');
//const SapCfMailer = require('sap-cf-mailer').default;
//const transporter = new SapCfMailer("MAILTRAP");
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
module.exports = cds.service.impl(srv => {
    srv.before('CREATE', 'LICENSE_ALLOCATION', licAlloc),
        srv.after('CREATE', 'LICENSE_ALLOCATION', post_save),
        srv.before('UPDATE', 'LICENSE_ALLOCATION', add_billing),
        srv.after('UPDATE', 'LICENSE_ALLOCATION', add_billing_postSave),
        srv.on('createID', create_UUID),
        srv.on('renewLicense', renew_license),
        srv.on('prConfirm', pr_confirm),
        srv.on('prProcessing', pr_po_process)
});


async function renew_license(req) {

    const { LICENSE_DETAILS } = cds.entities;

    try {
        //Add 1 year to expiration date and update new expiry date with PR reference
        const ex_date = await SELECT(LICENSE_DETAILS)
            .columns('expiration_date')
            .where({ license_id: req.data.license_id });

        var new_ex_date = new Date(ex_date[0].expiration_date);
        new_ex_date.setDate(new_ex_date.getDate() + 364);

        await UPDATE(LICENSE_DETAILS)
            .set({ purchase_reference: req.data.pr_id, expiration_date: new_ex_date.toISOString().split('T')[0] })
            .where({ license_id: req.data.license_id });
    } catch (error) {
        return error;
    }

}

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxx-xxxxx-xxxxx-xxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16).toUpperCase();
    });
    return uuid;
}

async function pr_confirm(req) {

    const { LICENSE_ALLOCATION } = cds.entities;

    if (req.data.pr_id === null) {
        await UPDATE(LICENSE_ALLOCATION)
            .set({ request_status: 'PR_APPROVAL_REJECTED' })
            .where({ request_id: req.data.request_id });
    } else {
        await UPDATE(LICENSE_ALLOCATION)
            .set({curent_billing:2000, estimated_billing:25000, license_key: create_UUID(), license_id: 'ML' + Math.floor(Math.random() * 100000000), license_serial_no: 'XM' + Math.floor(Math.random() * 10000000) ,purchase_reference: req.data.pr_id, request_status: 'PR_PO_PROCESS_COMPLETE' })
            .where({ request_id: req.data.request_id });
    }

}

// Saurabh is calling this for scenario 3
async function pr_po_process(req) {

    const { LICENSE_ALLOCATION, LICENSE_MASTER, PROJECT_DETAILS } = cds.entities;


    //scenario 1,2,3
    if (req.data.pr_id === null) {
        await UPDATE(LICENSE_ALLOCATION)
            .set({ request_status: 'Failed' })
            .where({ request_id: req.data.request_id });
        const lic_name = await SELECT(LICENSE_ALLOCATION)
            .columns('license_name')
            .where({ request_id: req.data.request_id });
        return lic_name;
    } else {
        const lic_name = await SELECT(LICENSE_ALLOCATION)
            .columns('license_name', 'request_date', 'license_start', 'employee_id', 'license_end')
            .where({ request_id: req.data.request_id });
        const std_price = await SELECT(LICENSE_MASTER)
            .columns('standard_price')
            .where({ license_name: lic_name[0].license_name });
        // await UPDATE(LICENSE_ALLOCATION)
        //     .set({ license_inv_ref: null, purchase_reference: req.data.pr_id, license_id: 'ML50008911', license_serial_no: 'T2SANW83', license_key: 'T2SA1-NW832-KMZA3-ZKMP4', request_status: 'PR_PO_PROCESS_COMPLETE' })
        //     .where({ request_id: req.data.request_id });
        //------------------------------------
        var pmc_1st = std_price[0].standard_price / 36,
            amc = pmc_1st * 0.05,
            pmc_2nd = pmc_1st + amc;   //adding 5% AMC
        var curent_billing,
            estimated_billing = 0;
        var purchase_date = moment(new Date(lic_name[0]?.request_date)),
            yr1_purchase_date_end = purchase_date.add(365, 'd'),
            yr2_purchase_date_start = purchase_date.add(366, 'd'),
            yr2_purchase_date_end = purchase_date.add(730, 'd'),
            yr3_purchase_date_start = purchase_date.add(731, 'd'),
            yr3_purchase_date_end = purchase_date.add(1095, 'd'),
            license_start = moment(new Date(lic_name[0]?.license_start));

        if (license_start.isBetween(purchase_date, yr1_purchase_date_end)) {
            curent_billing = pmc_1st;
        }
        else if (license_start.isBetween(yr2_purchase_date_start, yr2_purchase_date_end) ||
            license_start.isBetween(yr3_purchase_date_start, yr3_purchase_date_end)) {
            curent_billing = pmc_2nd;
        } else {
            curent_billing = amc;
        }
        const time_alloc_fact = await SELECT(PROJECT_DETAILS)
            .columns('time_allocation')
            .where({ employee_id: lic_name[0]?.employee_id })  //finding time allocation factor
        curent_billing = curent_billing * time_alloc_fact[0].time_allocation;
        //-----------------------------------
        var lic_end = moment(new Date(lic_name[0]?.license_end));
        var monthDiff = parseInt(Math.abs(lic_end.diff(license_start, 'months', true)));
        for (var i = 0; i < monthDiff; i++) {
            if (license_start.isBetween(purchase_date, yr1_purchase_date_end)) {
                estimated_billing = estimated_billing + pmc_1st;
            }
            else if (license_start.isBetween(yr2_purchase_date_start, yr2_purchase_date_end) ||
                license_start.isBetween(yr3_purchase_date_start, yr3_purchase_date_end)) {
                estimated_billing = estimated_billing + pmc_2nd;
            } else {
                estimated_billing = estimated_billing + amc;
            }
            license_start.add(30, 'd');
            monthDiff -= 1;
        }
        estimated_billing = estimated_billing * time_alloc_fact[0].time_allocation;
        await UPDATE(LICENSE_ALLOCATION)
            .set({ estimated_billing: estimated_billing, curent_billing: curent_billing, license_inv_ref: null, purchase_reference: req.data.pr_id, license_id: 'ML50008911', license_serial_no: 'T2SANW83', license_key: 'T2SA1-NW832-KMZA3-ZKMP4', request_status: 'PR_PO_PROCESS_COMPLETE' })
            .where({ request_id: req.data.request_id });
        //------------------------------------
        return lic_name;
    }

    // return "Received. Request Id: " + req.data.request_id + ", PR Id: " + req.data.pr_id;
}

async function licAlloc(req, res) {

    const license_name = req.data.license_name,
        license_type = req.data.license_type,
        business_unit_id = req.data.business_unit_id,
        license_start = req.data.license_start,
        employee_id = req.data.employee_id;

    const { LICENSE_INVENTORY } = cds.entities;
    const lic_inv = await SELECT(LICENSE_INVENTORY)
        .where({ license_name: license_name, license_type: license_type, business_unit_id: business_unit_id, available_quantity: { '>': 0 } });

    if (req.data.request_status === 'sc6') {
        // Scenario 6
        req.data.request_status = "PR_APPROVAL_PENDING";
        req.data.license_key = '';
        req.data.license_serial_no = '';
        req.data.license_id = '';

    } else {

        //Scneario 1,2,3

        if (lic_inv.length !== 1) {
            // const err_analysis_lic_inv = {
            //     "Entity": "LICENSE_INVENTORY",
            //     "license_name": license_name,
            //     "license_type": license_type,
            //     "business_unit_id": business_unit_id
            // };
            // return req.reject(400, "Invalid data " + JSON.stringify(err_analysis_lic_inv));
            const avlbl_qty = await SELECT(LICENSE_INVENTORY)
                .columns('available_quantity')
                .where({ license_name: license_name, license_type: license_type, business_unit_id: business_unit_id });
            if (!avlbl_qty[0].available_quantity) {

                const check_new_entry = await SELECT(LICENSE_INVENTORY)
                    .where({ license_name: license_name, license_type: license_type, available_quantity: { '>': 0 }, business_unit_id: { '!=': 'BU90009009' } });
                if (check_new_entry.length !== 0) {
                    req.data.request_status = 'OPS_PROCESSING';
                    req.data.request_date = new Date().toISOString().split('T')[0];
                } else {
                    //-------------------scenario 3
                    const check_new_entry_scenario_3 = await SELECT(LICENSE_INVENTORY)
                        .where({ license_name: license_name, license_type: license_type, available_quantity: { '>': 0 } });
                    if (check_new_entry_scenario_3.length === 0) {
                        req.data.request_status = 'PR_APPROVAL_PENDING';
                        req.data.request_date = new Date().toISOString().split('T')[0];
                        var payload = await workflw_payload(req);
                        trigger_wrkflw(payload);
                    } else {
                        return req.reject(400, "Processing Error");
                    }
                    //----------------------------------
                }
            } else {
                return req.reject(400, "Processing Error");
            }
        } else {

            const lic_inv_ref = lic_inv[0].license_inv_ref;
            const { LICENSE_DETAILS } = cds.entities;
            const lic_det = await SELECT(LICENSE_DETAILS)
                .where({ license_inv_ref: lic_inv_ref, is_allocated: false }).limit(1);

            if (lic_det.length !== 1) {
                const err_analysis_lic_det = {
                    "Entity": "LICENSE_DETAILS",
                    "license_inv_ref": lic_inv_ref
                };
                return req.reject(400, "Invalid data" + JSON.stringify(err_analysis_lic_det));
            }

            req.data.license_id = lic_det[0]?.license_id;
            req.data.license_serial_no = lic_det[0]?.license_serial_no;
            req.data.license_key = lic_det[0]?.license_key;

            await UPDATE(LICENSE_DETAILS)
                .set({ is_allocated: true })
                .where({ license_inv_ref: lic_inv_ref, license_id: lic_det[0]?.license_id });

            await UPDATE(LICENSE_INVENTORY)
                .set({ available_quantity: { '-=': 1 } })
                .where({ license_name: license_name, license_type: license_type, business_unit_id: business_unit_id });

            let { PROJECT_DETAILS } = cds.entities;
            const time_alloc_fact = await SELECT(PROJECT_DETAILS)
                .columns('time_allocation')
                .where({ employee_id: employee_id })  //finding time allocation factor

            _pur_cost_calc(lic_det, license_start, time_alloc_fact, req);
            req.data.request_status = "COMPLETED";
        }
    }



}

async function trigger_wrkflw(payload) {
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'https://sdcplatformdbrs.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
        'headers': {
            'Authorization': 'Basic c2ItY2xvbmUtNzZlYTJkZmUtYWQzOC00ODY5LWE0YjktNmZlMWI1MTNhNTc1IWIyNTc0M3x3b3JrZmxvdyFiMTAxNTA6Yjg3MmJiYzUtMzU5OC00ZjZlLTllMjctY2M2NzRhODZiZDllJFhJcWdseGJXZ2xaWmhJUUlyRmF3UEEwcUgyeUdUVFZVS21GSEt5eU1mbWc9'
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(JSON.parse(response.body).access_token);
        const token = JSON.parse(response.body).access_token;
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://api.workflow-sap.cfapps.eu10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances',
            'headers': {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });
    });

}

async function workflw_payload(req) {
    let { EMPLOYEE_MASTER,
        PROJECT_MASTER,
        BUSINESS_UNIT_MASTER,
        LICENSE_MASTER } = cds.entities;
    var emp_details = await SELECT(EMPLOYEE_MASTER).columns('email_address', 'mobile_number')
        .where({ employee_id: req.data.employee_id });
    var proj_details = await SELECT(PROJECT_MASTER).columns('project_name', 'customer_name', 'project_manager_name', 'project_manager_email')
        .where({ project_id: req.data.project_id });
    var business_details = await SELECT(BUSINESS_UNIT_MASTER).columns('bu_name', 'bu_manager_id', 'bu_manager_name', 'bu_manager_email')
        .where({ business_unit_id: req.data.business_unit_id });
    var license_details = await SELECT(LICENSE_MASTER).columns('license_description', 'standard_price')
        .where({ license_name: req.data.license_name });

    var payload = {
        "definitionId": "slm.licenceapprove",
        "context": {
            "request_id": req.data.request_id,
            "request_date": req.data.request_date,
            "employee_id": req.data.employee_id,
            "employee_name": req.data.employee_name,
            "email_address": emp_details[0]?.email_address,
            "mobile_number": emp_details[0]?.mobile_number,
            "project_id": req.data.project_id,
            "project_name": proj_details[0]?.project_name,
            "customer_name": proj_details[0]?.customer_name,
            "business_unit_id": req.data.business_unit_id,
            "bu_name": business_details[0]?.business_details,
            "license_name": req.data.license_name,
            "license_description": license_details[0]?.license_details,
            "standard_price": license_details[0]?.standard_price,
            "license_type": req.data.license_type,
            "license_quantity": req.data.license_quantity.toString(),
            "license_start": req.data.license_start,
            "license_end": req.data.license_end,
            "request_notes": req.data.request_notes,
            "request_status": req.data.request_status,
            "project_manager_id": req.project_manager_id,
            "project_manager_name": proj_details[0]?.project_manager_name,
            "project_manager_email": proj_details[0]?.project_manager_email,
            "bu_manager_id": business_details[0]?.bu_manager_id,
            "bu_manager_name": business_details[0]?.bu_manager_name,
            "bu_manager_email": business_details[0]?.bu_manager_email
        }
    };
    return payload;
}

async function _pur_cost_calc(lic_det, license_start, time_alloc_fact, req) {
    let pmc_1st = lic_det[0]?.purchase_cost / 36,
        amc = pmc_1st * 0.05,
        pmc_2nd = pmc_1st + amc;   //adding 5% AMC
    var curent_billing,
        estimated_billing = 0;

    //------------- current_billing

    // var lic_str = moment(license_start.split("-").map(Number));
    // var lic_pur = moment(lic_det[0]?.purchase_date.split("-").map(Number));
    // const yearDiff = Math.abs(lic_str.diff(lic_pur, 'years', true));
    // if (yearDiff <= 1) {
    //     curent_billing = pmc_1st;
    // } else if (yearDiff > 1 && yearDiff <= 3) {
    //     curent_billing = pmc_2nd;
    // }
    // else {
    //     curent_billing = amc;
    // }
    // req.data.curent_billing = curent_billing * time_alloc_fact[0].time_allocation;

    //-------------------current billing
    var purchase_date = moment(new Date(lic_det[0]?.purchase_date)),
        yr1_purchase_date_end = purchase_date.add(365, 'd'),
        yr2_purchase_date_start = purchase_date.add(366, 'd'),
        yr2_purchase_date_end = purchase_date.add(730, 'd'),
        yr3_purchase_date_start = purchase_date.add(731, 'd'),
        yr3_purchase_date_end = purchase_date.add(1095, 'd'),
        license_start = moment(new Date(license_start));


    if (license_start.isBetween(purchase_date, yr1_purchase_date_end)) {
        curent_billing = pmc_1st;
    }
    else if (license_start.isBetween(yr2_purchase_date_start, yr2_purchase_date_end) ||
        license_start.isBetween(yr3_purchase_date_start, yr3_purchase_date_end)) {
        curent_billing = pmc_2nd;
    } else {
        curent_billing = amc;
    }
    curent_billing = curent_billing * time_alloc_fact[0].time_allocation;
    req.data.curent_billing = Number(curent_billing?.toFixed(2));
    //-------------------current billing

    //calculation of estimated billing
    var lic_end = moment(new Date(req.data.license_end));
    var monthDiff = parseInt(Math.abs(lic_end.diff(license_start, 'months', true)));
    for (var i = 0; i < monthDiff; i++) {
        if (license_start.isBetween(purchase_date, yr1_purchase_date_end)) {
            estimated_billing = estimated_billing + pmc_1st;
        }
        else if (license_start.isBetween(yr2_purchase_date_start, yr2_purchase_date_end) ||
            license_start.isBetween(yr3_purchase_date_start, yr3_purchase_date_end)) {
            estimated_billing = estimated_billing + pmc_2nd;
        } else {
            estimated_billing = estimated_billing + amc;
        }
        license_start.add(30, 'd');
        monthDiff -= 1;
    }
    estimated_billing = estimated_billing * time_alloc_fact[0].time_allocation;
    req.data.estimated_billing = Number(estimated_billing?.toFixed(2));
    req.data.request_date = new Date().toISOString().split('T')[0];
}

async function post_save(req) {
    const { EMPLOYEE_MASTER } = cds.entities;
    const lic_email = await SELECT(EMPLOYEE_MASTER)
        .columns('email_address')
        .where({ employee_id: req.employee_id });
    // var body = '<html><h2>Dear ' + req.employee_name + ',</h2><strong>Your license request ' + req.request_id + ' dated ' + req.request_date + ' for ' + req.license_quantity + ' Quantity of ' + req.license_name + ' has been now allocated</strong><br></br><strong>The license has been allocated under the Project : ' + req.project_id + ' </strong><br></br><strong>The license details are Serial No : ' + req.license_serial_no + ' and Key : ' + req.license_key + ' </strong><br></br><strong>The license will be active from ' + req.license_start + ' to ' + req.license_end + ' </strong><br></br><em>Regards,</em><br></br><em>LTTS – License Ops Team</em></html>';
    var body = 'Dear ' + req.employee_name + ',Your license request ' + req.request_id + ' dated ' + req.request_date + ' for ' + req.license_quantity + ' Quantity of ' + req.license_name + ' has been now allocated. The license has been allocated under the Project : ' + req.project_id + '. The license details are Serial No : ' + req.license_serial_no + ' and Key : ' + req.license_key + '. The license will be active from ' + req.license_start + ' to ' + req.license_end + '.  Regards, LTTS – License Ops Team';
    // await transporter.sendMail({
    //     to: lic_email[0].email_address,
    //     subject: 'Your license request ' + req.request_id + ' has been allocated',
    //     text: body
    // });

    // const msg = {
    //     to: 'sumanta.ghosh02@sap.com', // Change to your recipient
    //     from: 'lttsslm@bot.snatchbot.me', // Change to your verified sender
    //     subject: 'Test',
    //     text: 'and easy to do anywhere, even with Node.js',
    //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    // }
    // await sgMail
    //     .send(msg)
    //     .then(() => {
    //         console.log('Email sent')
    //     })
    //     .catch((error) => {
    //         console.error(error)
    //     })
}

async function add_billing(req, res) {
    const { LICENSE_DETAILS } = cds.entities;
    const lic_det = await SELECT(LICENSE_DETAILS)
        .where({ license_id: req.data.license_id });
    if (lic_det.length !== 1) {
        return req.reject(400, "Processing Error");
    }
    const license_start = req.data.license_start;
    let { PROJECT_DETAILS } = cds.entities;
    const time_alloc_fact = await SELECT(PROJECT_DETAILS)
        .columns('time_allocation')
        .where({ employee_id: req.data.employee_id })  //finding time allocation factor
    if (time_alloc_fact.length !== 1) {
        return req.reject(400, "Processing Error");
    }
    _pur_cost_calc(lic_det, license_start, time_alloc_fact, req);
}

async function add_billing_postSave(req, res) {
    const { LICENSE_DETAILS } = cds.entities;
    await UPDATE(LICENSE_DETAILS)
        .set({ is_allocated: true })
        .where({ license_id: req.license_id });
    const { LICENSE_INVENTORY } = cds.entities;
    await UPDATE(LICENSE_INVENTORY)
        .set({ available_quantity: { '-=': 1 } })
        .where({ license_name: req.license_name, license_inv_ref: req.license_inv_ref });
    // post_save();
}





