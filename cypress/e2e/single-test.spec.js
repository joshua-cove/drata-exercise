describe('community page links', () => {
    // generate unique report file names so they don't get overwritten
    const testRunId = Date.now();
    const reportPath = `./results/test_${testRunId}.json`;

    after(() => {
        // log the report to headed test runner for visibility
        cy.readFile(reportPath).then((text) => {
            cy.log(`REPORT \n ${JSON.stringify(text, null, 2)}`);
        });
    });

    it(`verifies each community page link`, () => {
        // initiate a report object
        const report = {passed: 0, failed: []};

        cy.visit('https://community.drata.com/');

        cy.get('a').each((link) => {
            if (link.prop('href')) {
                let failure = { url: link.prop('href') };

                // don't fail here on page load error in order to test all links in each test run
                cy.request({
                    url: link.prop('href'),
                    failOnStatusCode: false,
                }).then((res) => {
                    // check for console errors
                    cy.get('@consoleError').then((errors) => {
                        if (errors.callCount > 0) {
                            failure.consoleErrors = true;
                        };
                    });

                    // verify a page element exists
                    cy.get('.header-login-button').then((elements) => {
                        if (elements.length === 0) {
                            failure.pageElements = false;
                        };
                    });

                    // verify page loaded successfully
                    if (res.status > 399) {
                        failure.status = res.status;
                    };

                    // if any checks failed, add URL and failure reason to the report
                    if (Object.keys(failure).length > 1) {
                        report.failed.push(failure);
                    } else {
                        report.passed ++;
                    };
                });
            };
        });

        // write the report file
        cy.writeFile(reportPath, report);
        // log the report file path if running in headed mode for visibility
        cy.log("View test report at", reportPath);
        // and fail the test if any pages had errors
        cy.wrap(report.failed).its('length').should('eq', 0);
    });
});
