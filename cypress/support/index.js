// ***********************************************************
// This file is processed and
// loaded automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands
import "./commands";

// preserve all cookies
Cypress.Cookies.defaults({
  preserve: /\.*/
});

Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore errors matching these fragments.
  const matchedErrors = [
    // Errors appearing when opening core editor to edit a prompt.
    "setting 'mejs'",
    "mejs is not defined",
    "mediaelementplayer",
    // Appeared on admin pages.
    "Failed to register a ServiceWorker for scope"
  ].filter(fragment => err.message.includes(fragment));
  if (matchedErrors.length) {
    // Returning false here prevents Cypress from failing the test.
    return false;
  }
});
