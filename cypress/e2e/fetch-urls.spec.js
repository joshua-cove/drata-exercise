// To increase site wide coverage, the seedLink could be transformed into an array
// of the site's subdomains and used to generate tests dynamically as well
const seedLink = "https://community.drata.com/";

describe("prepare URLs for dynamic tests", () => {
    it("makes link list", () => {
        let links = [];

        // load the seed page, and fail on error
        cy.visit({
          url: seedLink,
          failOnStatusCode: false
        });
      
        // gather all hrefs on the page
        cy.get('a').each((link) => {
          if (link.prop('href') && links.indexOf(link.prop('href')) === -1) {
            links.push(link.prop('href'));
          }
        });
      
        // write them to file for use by dynamic-tests
        cy.writeFile("./cypress/fixtures/links.json", links);

        // and fail if no URLs were found
        cy.wrap(links).its('length').should('be.greaterThan', 1);
    })
})