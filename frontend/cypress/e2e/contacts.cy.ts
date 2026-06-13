describe('Contacts', () => {
  const email    = `e2e-contacts-${Date.now()}@test.io`;
  const password = 'Pass1234!';

  before(() => {
    cy.request('POST', '/api/auth/register', {
      orgName: 'E2E Contacts Org',
      email,
      password,
      firstName: 'Contacts',
      lastName: 'Tester',
    });
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/app/contacts');
  });

  // ── create ────────────────────────────────────────────────────────────────

  it('creates a new contact via the form', () => {
    cy.get('[data-cy="new-contact-btn"]').click();
    cy.get('[data-cy="contact-firstName"]').type('Alice');
    cy.get('[data-cy="contact-lastName"]').type('Wonder');
    cy.get('[data-cy="contact-email"]').type('alice.wonder@test.com');
    cy.get('[data-cy="contact-save-btn"]').click();

    cy.get('[data-cy="contacts-table"], .contact-list')
      .should('contain.text', 'Alice');
  });

  // ── search ────────────────────────────────────────────────────────────────

  it('filters contacts by search query', () => {
    // Seed a second contact
    cy.request({
      method: 'GET',
      url: '/api/auth/me',
      failOnStatusCode: false,
    });

    cy.get('[data-cy="search-input"]').clear().type('Alice');
    cy.get('[data-cy="contacts-table"], .contact-list').should('contain.text', 'Alice');
    cy.get('[data-cy="contacts-table"], .contact-list').should('not.contain.text', 'Bob');
  });

  // ── edit ──────────────────────────────────────────────────────────────────

  it('edits an existing contact', () => {
    cy.contains('[data-cy="contact-row"], tr, .contact-item', 'Alice')
      .find('[data-cy="edit-btn"], button[aria-label="Edit"]')
      .first()
      .click();

    cy.get('[data-cy="contact-phone"]').clear().type('+1-555-9999');
    cy.get('[data-cy="contact-save-btn"]').click();

    cy.contains('[data-cy="contact-row"], tr, .contact-item', 'Alice')
      .should('exist');
  });

  // ── delete ────────────────────────────────────────────────────────────────

  it('deletes a contact and removes it from the list', () => {
    cy.get('[data-cy="new-contact-btn"]').click();
    cy.get('[data-cy="contact-firstName"]').type('ToDelete');
    cy.get('[data-cy="contact-save-btn"]').click();

    cy.contains('[data-cy="contact-row"], tr, .contact-item', 'ToDelete')
      .find('[data-cy="delete-btn"], button[aria-label="Delete"]')
      .first()
      .click();

    cy.get('button').contains(/confirm|yes|delete/i).click();

    cy.get('[data-cy="contacts-table"], .contact-list')
      .should('not.contain.text', 'ToDelete');
  });
});
