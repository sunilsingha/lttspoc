sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'cit/ux/empdemo/test/integration/FirstJourney',
		'cit/ux/empdemo/test/integration/pages/EMPLOYEE_MASTERList',
		'cit/ux/empdemo/test/integration/pages/EMPLOYEE_MASTERObjectPage'
    ],
    function(JourneyRunner, opaJourney, EMPLOYEE_MASTERList, EMPLOYEE_MASTERObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('cit/ux/empdemo') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheEMPLOYEE_MASTERList: EMPLOYEE_MASTERList,
					onTheEMPLOYEE_MASTERObjectPage: EMPLOYEE_MASTERObjectPage
                }
            },
            opaJourney.run
        );
    }
);