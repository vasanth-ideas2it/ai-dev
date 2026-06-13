// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      register(orgName: string, email: string, password: string,
               firstName: string, lastName: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('register', (orgName, email, password, firstName, lastName) => {
  cy.request('POST', '/api/auth/register', {
    orgName, email, password, firstName, lastName,
  }).then(res => {
    const { accessToken, refreshToken } = res.body.data;
    window.localStorage.setItem('crm_refresh_token', refreshToken);
    // Store the access token via the app's auth service is not possible via Cypress;
    // instead, visit the login page and authenticate through the UI for E2E tests.
    cy.visit('/login');
  });
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy="email"]').clear().type(email);
  cy.get('[data-cy="password"]').clear().type(password);
  cy.get('[data-cy="login-btn"]').click();
  cy.url().should('include', '/app/dashboard');
});

export {};
