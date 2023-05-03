const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/*.spec.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // force the tests to run in specific order.
      // an anti-pattern only done here for the dynamic test proof of concept
      config.specPattern = [
        'cypress/e2e/single-test.spec.js',
        'cypress/e2e/fetch-urls.spec.js',
        'cypress/e2e/dynamic-tests.spec.js',
      ]
      return config
    },
    watchForFileChanges: false,
  }
});
