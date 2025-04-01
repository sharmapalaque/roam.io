import Support from './Support';
import { mount } from 'cypress/react';
import { MemoryRouter } from 'react-router-dom';

describe('Support Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <MemoryRouter>
        <Support />
      </MemoryRouter>
    );
  });

  it('renders page title and subtitle', () => {
    cy.contains('Customer Support').should('be.visible');
    cy.contains("We're here to help you with any questions or concerns").should('be.visible');
  });

  it('displays all support contact options', () => {
    cy.contains('Call Us').should('be.visible');
    cy.contains('WhatsApp').should('be.visible');
    cy.contains('+1 (800) 123-4567').should('be.visible');
    cy.contains('+1 (800) 987-6543').should('be.visible');
  });

  it('displays all office locations', () => {
    cy.contains('New York').should('be.visible');
    cy.contains('Miami').should('be.visible');
    cy.contains('San Francisco').should('be.visible');
  });

  it('displays emergency support section', () => {
    cy.contains('Need Emergency Travel Assistance?').should('be.visible');
    cy.contains('+1 (800) 999-8888').should('be.visible');
  });
});
