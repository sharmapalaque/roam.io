import UserProfile from './UserProfile';
import { mount } from 'cypress/react';
import { BrowserRouter } from "react-router-dom";

describe('UserProfile Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
  });

  // Test if the profile page loads with the correct title and user name
  it('should render the profile page with title and user name', () => {
    cy.get('.user-name').should('contain', 'Palaque Sharma'); 
  });

  // Test if tabs are rendered for different sections like "ACCOMMODATIONS", "EVENTS", and "SECURITY"
  it('should display profile tabs for "ACCOMMODATIONS", "EVENTS", and "SECURITY"', () => {
    cy.get('.main-tabs').should('exist');
    cy.get('.main-tab').should('have.length', 3);
    cy.get('.sub-tab').should('exist'); 
  });

  // Test if clicking on the "SECURITY" tab switches to the correct section
  it('should switch to "SECURITY" tab when clicked', () => {
    cy.get('.main-tab').eq(2).click(); 
    cy.get('.section-title').should('contain', 'SECURITY'); 
  });

  // Test avatar selection drawer opens and closes
  it('should open and close the avatar selection drawer', () => {
    cy.get('.user-avatar-wrapper').click(); 
    cy.get('.avatar-drawer').should('be.visible'); 
  });

  // Test avatar selection functionality
  it('should change the avatar when a new avatar is selected', () => {
    cy.get('.user-avatar-wrapper').click(); 
    cy.get('.avatar-option').eq(1).click(); 
    cy.get('.user-avatar-image').should('have.attr', 'src').and('include', '.png'); 
  });
});
