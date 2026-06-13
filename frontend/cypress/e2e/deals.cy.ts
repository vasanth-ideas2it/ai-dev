describe('Deals', () => {
  const email    = `e2e-deals-${Date.now()}@test.io`;
  const password = 'Pass1234!';

  before(() => {
    cy.request('POST', '/api/auth/register', {
      orgName: 'E2E Deals Org',
      email,
      password,
      firstName: 'Deals',
      lastName: 'Tester',
    });
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/app/deals');
  });

  // ── create deal ───────────────────────────────────────────────────────────

  it('creates a new deal via the form', () => {
    cy.get('[data-cy="new-deal-btn"]').click();

    cy.get('[data-cy="deal-title"]').type('Big Opportunity');
    cy.get('[data-cy="deal-value"]').clear().type('5000');

    // Stage autocomplete / select — pick the first stage option
    cy.get('[data-cy="deal-stage"]').click();
    cy.get('mat-option').first().click();

    cy.get('[data-cy="deal-save-btn"]').click();

    cy.get('[data-cy="kanban-board"], .kanban-board')
      .should('contain.text', 'Big Opportunity');
  });

  // ── drag deal to next stage ───────────────────────────────────────────────

  it('moves a deal to the next kanban stage', () => {
    // Ensure the deal exists (created in previous step or seed here)
    cy.get('[data-cy="kanban-board"], .kanban-board').should('exist');

    // Get the first deal card and the second column drop zone
    cy.get('.kanban-column').eq(0).find('.deal-card').first().as('dealCard');
    cy.get('.kanban-column').eq(1).as('targetCol');

    // Drag using data-transfer simulation
    cy.get('@dealCard')
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', { clientX: 600, clientY: 300 });

    cy.get('@targetCol')
      .trigger('mousemove', { clientX: 600, clientY: 300 })
      .trigger('mouseup');

    // The deal should now appear in the second column
    cy.get('.kanban-column').eq(1).find('.deal-card').should('have.length.greaterThan', 0);
  });

  // ── deal detail ───────────────────────────────────────────────────────────

  it('navigates to deal detail and shows stage stepper', () => {
    cy.get('.deal-card').first().click();
    cy.url().should('match', /\/app\/deals\//);
    cy.get('.stage-stepper, [data-cy="stage-stepper"]').should('exist');
  });
});
