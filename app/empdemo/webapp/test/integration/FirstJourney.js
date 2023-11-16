sap.ui.define([
    "sap/ui/test/opaQunit"
], function (opaTest) {
    "use strict";

    var Journey = {
        run: function() {
            QUnit.module("First journey");

            opaTest("Start application", function (Given, When, Then) {
                Given.iStartMyApp();

                Then.onTheEMPLOYEE_MASTERList.iSeeThisPage();

            });


            opaTest("Navigate to ObjectPage", function (Given, When, Then) {
                // Note: this test will fail if the ListReport page doesn't show any data
                When.onTheEMPLOYEE_MASTERList.onFilterBar().iExecuteSearch();
                Then.onTheEMPLOYEE_MASTERList.onTable().iCheckRows();

                When.onTheEMPLOYEE_MASTERList.onTable().iPressRow(0);
                Then.onTheEMPLOYEE_MASTERObjectPage.iSeeThisPage();

            });

            opaTest("Teardown", function (Given, When, Then) { 
                // Cleanup
                Given.iTearDownMyApp();
            });
        }
    }

    return Journey;
});