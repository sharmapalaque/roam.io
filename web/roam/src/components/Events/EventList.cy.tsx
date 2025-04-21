import EventList from './EventList';
import { mount } from 'cypress/react';
import { BrowserRouter } from "react-router-dom";

describe('EventList Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956);
    mount(
      <BrowserRouter>
        <EventList />
      </BrowserRouter>
    );
  });

  // Test if the page loads with search input and location filter
  it('should render the page with search input and location filter', () => {
    cy.get('.search-input').should('be.visible'); 
    cy.get('.location-filter').should('be.visible'); 
    cy.get('.events-grid-container').should('exist'); 
  });

  // Test search functionality
  it('should filter events based on search term', () => {
    cy.get('.search-input').type('Tech Conference');
    cy.get('.event-name').contains('Annual Tech Conference'); 
  });

  // Test location filter functionality
  it('should filter events based on selected location', () => {
    cy.get('.location-filter').click(); 
    cy.get('.MuiMenuItem-root').contains('San Francisco, CA').click(); 
    cy.get('.event-location').contains('San Francisco, CA');
  });

  // Test that clicking on an event card sets it as the selected event
  it('should highlight the selected event when clicked', () => {
    cy.get('.event-card').first().click(); 
    cy.get('.event-card').first().should('have.css', 'border', '2px solid rgb(112, 201, 194)'); 
  });

  // Test booking functionality by selecting tickets
  it('should update ticket count and total price correctly', () => {
    cy.get('.event-card').first().click(); 
    cy.get('.guests-container').find('select').select('2'); 
    cy.get('.book-now-button').should('not.be.disabled'); 
  });

  // Test if the images are correctly displayed in the event details
  it('should display images in the event gallery', () => {
    cy.get('.event-card').first().click(); 
    cy.get('img.main-image').should('be.visible'); 
    cy.get('.thumbnail').first().click(); 
    cy.get('img.main-image').should('have.attr', 'src').and('include', '.jpeg');
  });

  // Test booking flow
  it('should successfully send booking data when booking tickets', () => {
    cy.get('.event-card').first().click(); 
    cy.get('.guests-container').find('select').select('2'); 
    cy.intercept('PUT', 'http://localhost:8080/events*').as('bookEvent'); 
    cy.get('.book-now-button').click(); 
    cy.wait('@bookEvent').its('response.statusCode').should('eq', 401); 
  });

  // Test if the page renders the selected event details
  it('should render selected event details when clicked', () => {
    cy.get('.event-card').first().click(); 
    cy.get('.event-details-title').should('contain', 'Summer Music Festival'); 
    cy.get('.event-details-location').should('contain', 'Austin, TX'); 
  });
});
