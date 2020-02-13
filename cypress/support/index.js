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
  whitelist: /\.*/
});
