import EventList from './EventList';
import { mount } from 'cypress/react';

describe('EventList Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(<EventList />);
  });

  it('renders the page title and search box', () => {
    cy.contains('Discover Amazing Events').should('be.visible');
    cy.get('.search-input input').should('exist');
  });

  it('displays all event cards initially', () => {
    cy.get('.event-card').should('have.length', 4);
  });

  it('filters events based on search term', () => {
    cy.get('.search-input input').type('Music');
    cy.get('.event-card').should('have.length', 1);
    cy.contains('Summer Music Festival').should('be.visible');
  });

  it('renders details of selected event', () => {
    cy.contains('Business Leadership Summit').click();
    cy.get('.event-details-title').should('contain.text', 'Business Leadership Summit');
    cy.contains('Organized by Enterprise Growth Partners').should('exist');
  });

  it('changes gallery image on thumbnail click', () => {
    cy.get('.thumbnail').eq(1).click();
    cy.get('.main-image').should('exist');
  });

  it('books ticket successfully on button click', () => {
    cy.window().then((win) => cy.stub(win, 'alert').as('alertStub'));
    cy.contains('Business Leadership Summit').click();
    cy.get('select').select('1');
    cy.get('.book-now-button').click();
    cy.get('@alertStub').should('have.been.calledWith', 'Booked 1 ticket(s) for Business Leadership Summit!');
  });

  it('shows "no results" message when search yields nothing', () => {
    cy.get('.search-input input').clear().type('asdfasdfasdf');
    cy.contains('No events found').should('exist');
  });
});
