sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'cit.ux.empdemo',
            componentId: 'EMPLOYEE_MASTERList',
            entitySet: 'EMPLOYEE_MASTER'
        },
        CustomPageDefinitions
    );
});