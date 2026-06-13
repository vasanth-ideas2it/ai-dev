describe('Auth flow', () => {
  const email    = `e2e-auth-${Date.now()}@test.io`;
  const password = 'Pass1234!';

  before(() => {
    // Register the test user via API so login tests have a user to work with
    cy.request('POST', '/api/auth/register', {
      orgName: 'E2E Auth Org',
      email,
      password,
      firstName: 'E2E',
      lastName: 'User',
    });
  });

  it('redirects unauthenticated user to /login', () => {
    cy.visit('/app/dashboard');
    cy.url().should('include', '/login');
  });

  it('shows validation error for empty fields', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-btn"]').click();
    cy.get('mat-error, .error, [data-cy="error"]').should('exist');
  });

  it('shows error for wrong password', () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type(email);
    cy.get('[data-cy="password"]').type('wrongpassword');
    cy.get('[data-cy="login-btn"]').click();
    cy.get('[data-cy="login-error"], mat-error, .error').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('logs in with valid credentials and lands on dashboard', () => {
    cy.login(email, password);
    cy.url().should('include', '/app/dashboard');
    cy.get('h2, [data-cy="page-title"]').should('contain.text', 'Dashboard');
  });

  it('logs out and redirects to login', () => {
    cy.login(email, password);
    cy.get('[data-cy="logout-btn"], button[aria-label="Logout"]').click();
    cy.url().should('include', '/login');
  });
});
