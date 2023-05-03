let links = []

/**
 * this command is not used in any test.
 * added just for the proof of concept of crawling the site recursively to generate the URL list.
 * Using it in an iteration of the specs, generated hundreds of links to discussion threads, so if
 * pursuing such an approach, additional regex checks should be implemented to limit the pages returned.
 */ 

Cypress.Commands.add('getSiteLinks', (seedLink) => {
  links.push(seedLink);

  cy.visit({
    url: seedLink,
    failOnStatusCode: false
  });

  cy.get('a').each((link) => {
    cy.log("before", link.prop('href'));
    if (
      link.prop('href') &&
      // allow any drata subdomains but not external links
      link.prop('href').match(/https:\/\/(\w*)?\.?(drata\.com)/) &&
      links.indexOf(link.prop('href')) === -1
    ) {
      links.push(link.prop('href'));
      cy.getSiteLinks(link.prop('href'));
    }
  });

  // store results as env var
  Cypress.env('links', links);
});