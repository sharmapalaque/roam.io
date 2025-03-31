import UserProfile from './UserProfile';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('UserProfile Component', () => {
  cy.viewport(1470, 956); // Adjust width and height
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );
  });

  it('renders the profile header and name', () => {
    cy.get('.user-name').should('contain.text', 'Palaque Sharma');
  });

  it('displays avatar image', () => {
    cy.get('.user-avatar-image').should('be.visible');
  });

  it('switches to SECURITY tab and displays email and password fields', () => {
    cy.contains('SECURITY').click();
    cy.contains('Email ID').should('be.visible');
    cy.contains('Password').should('be.visible');
    cy.contains('UPDATE PASSWORD').should('be.visible');
  });

  it('opens and closes the avatar drawer', () => {
    cy.get('.user-avatar-wrapper').click();
    cy.contains('Choose Your Avatar').should('be.visible');
    cy.get('button[aria-label="Close drawer"]').click();
    cy.contains('Choose Your Avatar').should('not.exist');
  });

  it('renders upcoming and past bookings under ACCOMMODATIONS tab', () => {
    cy.contains('ACCOMMODATIONS').click();
    cy.contains('BOOKINGS').click();
    cy.contains('UPCOMING BOOKINGS').should('exist');
    cy.contains('PAST BOOKINGS').should('exist');
  });

  it('displays accommodation reviews', () => {
    cy.contains('ACCOMMODATIONS').click();
    cy.contains('REVIEWS').click();
    cy.get('.review-card').should('have.length.at.least', 1);
  });

  it('displays correct number of guests in bookings', () => {
    cy.contains('ACCOMMODATIONS').click();
    cy.contains('BOOKINGS').click();
    cy.get('.booking-guests').first().should('contain.text', 'Guest');
  });
});
