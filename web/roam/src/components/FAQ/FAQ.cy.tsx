import FAQ from './FAQ';
import { mount } from 'cypress/react';

describe('FAQ Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956);
    mount(<FAQ />); 
  });

  // Test if the FAQ page is rendering correctly
  it('should render the FAQ page with title and subtitle', () => {
    cy.get('.faq-page-title').should('contain', 'Frequently Asked Questions'); 
    cy.get('.faq-subtitle').should('contain', 'Find answers to common questions about using Roam.IO'); 
  });

  // Test if tabs for FAQ categories are rendered
  it('should display FAQ category tabs', () => {
    cy.get('.category-tabs').should('exist'); 
    cy.get('.category-tab').should('have.length', 5); 
  });

  // Test if clicking a tab changes the active category
  it('should switch between FAQ categories when tabs are clicked', () => {
    cy.get('.category-tab').eq(1).click(); 
    cy.get('.active-category-title').should('contain', 'Accommodations FAQs');

    cy.get('.category-tab').eq(2).click(); 
    cy.get('.active-category-title').should('contain', 'Events FAQs'); 
  });

  // Test if the accordion is functional (expand and collapse)
  it('should expand and collapse FAQ answers when accordion is clicked', () => {
    // Check if the accordion is initially collapsed
    cy.get('.faq-accordion').first().should('not.have.class', 'Mui-expanded'); // First FAQ should be collapsed

    cy.get('.faq-accordion').first().click(); // Click to expand the first FAQ
    cy.get('.faq-accordion').first().should('have.class', 'Mui-expanded'); // Ensure the accordion is expanded

  });

  // Test if the FAQ questions are visible and clickable
  it('should display FAQ questions and answers correctly', () => {
    cy.get('.faq-question').first().should('contain', 'What is Roam.IO?'); 
    cy.get('.faq-answer').first().should('exist'); 
  });

  // Test the "Still Have Questions?" section with the "Contact Support" button
  it('should display the "Contact Support" button and navigate correctly', () => {
    cy.get('.need-help-title').should('contain', 'Still Have Questions?'); 
    cy.get('.contact-support-button').should('exist'); 

    // Simulate clicking the button to navigate to the support page
    cy.get('.contact-support-button').click();
    cy.url().should('include', '/support'); 
  });
});
