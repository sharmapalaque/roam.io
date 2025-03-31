import NotFound from './NotFound';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('NotFound Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
  });

  it('displays the 404 error code and message', () => {
    cy.get('.error-code').should('contain.text', '404');
    cy.get('.error-message').should('contain.text', 'Oops! Page Not Found');
  });

  it('displays the error description text', () => {
    cy.get('.error-description').should(
      'contain.text',
      "The page you're looking for doesn't exist"
    );
  });

  it('renders GO HOME and FIND STAYS buttons', () => {
    cy.get('.primary-button').should('contain.text', 'GO HOME');
    cy.get('.secondary-button').should('contain.text', 'FIND STAYS');
  });

  it('renders Contact Support link', () => {
    cy.contains('Need help?').should('exist');
    cy.get('.support-link a').should('have.attr', 'href').and('include', '/Support');
  });

  it('has working links (not broken)', () => {
    cy.get('a[href="/"]').should('exist');
    cy.get('a[href="/accommodation"]').should('exist');
    cy.get('a[href="/Support"]').should('exist');
  });
});
