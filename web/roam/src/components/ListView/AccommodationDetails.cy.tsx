import AccommodationDetails from './AccommodationDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { mount } from 'cypress/react';

describe('AccommodationDetails Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <MemoryRouter initialEntries={['/details/1']}>
        <Routes>
          <Route path="/details/:id" element={<AccommodationDetails />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('renders the accommodation name and location', () => {
    cy.contains('Ocean View Apartment').should('be.visible');
    cy.contains('Miami, FL').should('be.visible');
  });

  it('displays the main image and thumbnails', () => {
    cy.get('.main-image').should('be.visible');
    cy.get('.thumbnail-image').should('have.length.at.least', 1);
  });

  it('changes image when thumbnail is clicked', () => {
    cy.get('.thumbnail').eq(1).click();
    cy.get('.main-image')
      .should('have.attr', 'src')
      .and('include', '.png');
  });

  it('displays rating and review count', () => {
    cy.get('.rating-value').should('contain.text', '4.8');
    cy.contains('(2 UserReviews)').should('exist');
  });

  it('renders all facilities with icons', () => {
    cy.get('.facility-chip').should('contain.text', 'Wifi');
    cy.get('.facility-chip').should('contain.text', 'TV');
  });

  it('shows check-in and check-out date pickers', () => {
    cy.get('input[type="date"]').eq(0).should('exist');
    cy.get('input[type="date"]').eq(1).should('exist');
  });

  it('enables booking when valid dates are selected', () => {
    const today = new Date();
    const checkIn = today.toISOString().split('T')[0];

    const checkOutDate = new Date(today);
    checkOutDate.setDate(today.getDate() + 3);
    const checkOut = checkOutDate.toISOString().split('T')[0];

    cy.get('input[type="date"]').eq(0).type(checkIn);
    cy.get('input[type="date"]').eq(1).type(checkOut);

    cy.get('.book-now-button').should('not.be.disabled');
  });

  it('shows error if check-out is before check-in', () => {
    const today = new Date().toISOString().split('T')[0];
    cy.get('input[type="date"]').eq(0).type(today);
    cy.get('input[type="date"]').eq(1).type(today); // same day, should show error
    cy.contains('Check-In Date must be before Check-Out Date').should('exist');
    cy.get('.book-now-button').should('be.disabled');
  });

  it('renders user reviews', () => {
    cy.get('.review-item').should('have.length', 2);
    cy.contains('Absolutely spectacular views!').should('exist');
  });
});