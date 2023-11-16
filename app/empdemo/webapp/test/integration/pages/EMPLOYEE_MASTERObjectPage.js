sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'cit.ux.empdemo',
            componentId: 'EMPLOYEE_MASTERObjectPage',
            entitySet: 'EMPLOYEE_MASTER'
        },
        CustomPageDefinitions
    );
});