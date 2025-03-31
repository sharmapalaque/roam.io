import FAQ from './FAQ';
import { mount } from 'cypress/react';

describe('FAQ Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(<FAQ />);
  });

  it('renders page title and subtitle', () => {
    cy.contains('Frequently Asked Questions').should('be.visible');
    cy.contains('Find answers to common questions').should('be.visible');
  });

  it('shows tabs for all categories', () => {
    const categories = ['General', 'Accommodations', 'Events', 'Support', 'About Us'];
    categories.forEach((category) => {
      cy.get('.category-tab').contains(category).should('exist');
    });
  });

  it('displays FAQs for the default category (General)', () => {
    cy.contains('What is Roam.IO?').should('exist');
    cy.contains('Which countries do you operate in?').should('exist');
  });

  it('expands and collapses an FAQ accordion', () => {
    cy.contains('What is Roam.IO?').click();
    cy.contains('Roam.IO is a premium travel booking platform').should('be.visible');
    cy.contains('What is Roam.IO?').click(); // collapse
    cy.contains('Roam.IO is a premium travel booking platform').should('not.be.visible');
  });

  it('switches to "Accommodations" tab and displays related FAQs', () => {
    cy.contains('Accommodations').click();
    cy.contains('How do I book accommodation?').should('exist');
    cy.contains('Do you offer group bookings for accommodations?').should('exist');
  });

  it('switches to "Events" and shows event-related FAQs', () => {
    cy.contains('Events').click();
    cy.contains('What types of events can I book through Roam.IO?').should('exist');
    cy.contains('Can I get a refund for event tickets?').should('exist');
  });

  it('switches to "Support" tab and displays support FAQs', () => {
    cy.contains('Support').click();
    cy.contains('How can I contact customer support?').should('exist');
    cy.contains('Do you offer customer support in different languages?').should('exist');
  });

  it('switches to "About Us" and displays developer info', () => {
    cy.contains('About Us').click();
    cy.contains('Who created Roam.IO?').should('exist');
    cy.contains('Palaque Sharma').should('exist');
    cy.contains('Sanket Deshmukh').should('exist');
  });

  it('renders "Still Have Questions" support card', () => {
    cy.contains('Still Have Questions?').should('exist');
    cy.contains('Contact Support').should('exist');
  });

  it('navigates to /support when "Contact Support" is clicked', () => {
    cy.window().then((win) => cy.stub(win.location, 'assign')).as('locationAssign');
    cy.contains('Contact Support').click();
    cy.get('@locationAssign').should('be.calledWith', '/support');
  });
});
