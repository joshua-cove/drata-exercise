// this link list is written by fetch URLs to simulate a list of URLs being known from a site map or soimilar
const links = require("../fixtures/links.json");

describe('test each URL', () => {
  // while this test is coupled to fetch-urls spec anyway, can still observe 
  // good test practices by cleaning up so at least test runs are independent
  after("reset links.json file", () => {
    cy.writeFile("./cypress/fixtures/links.json", links);
  })

  // for each community page link
  links.forEach((link) => {
    it(`verifies ${link}`, () => {
      cy.spy(window.console, 'error').as('consoleError');

      // verify the page loads without error
      cy.visit(link);

      // check for console errors
      cy.get('@consoleError').then((errors) => {
        expect(errors).to.have.callCount(0);
      })
      // and verify a page element exists
      cy.get('.header-login-button').should('exist')
    });
  });
});