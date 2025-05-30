const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3004',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('after:screenshot', (details) => {
        console.log('Screenshot taken:', details.path);
      });
    },
    screenshotsFolder: 'cypress/screenshots', // Default folder
    screenshotOnRunFailure: true, // Auto-screenshot on failure
    trashAssetsBeforeRuns: true, 
  },
});
